use std::sync::LazyLock;

use serde::{Serialize, de::DeserializeOwned};
use serde_json::{Value, json};
use ureq::{
    Agent,
    tls::{RootCerts, TlsConfig},
};

pub const WEB_URL: &str = match option_env!("FEWMAIL_WEB_URL") {
    Some(url) => url,
    None if cfg!(debug_assertions) => "https://app.local.fewmail.app",
    None => "https://fewmail.app",
};
pub const API_URL: &str = match option_env!("FEWMAIL_API_URL") {
    Some(url) => url,
    None if cfg!(debug_assertions) => "https://api.local.fewmail.app",
    None => "https://api.fewmail.app",
};
const KEYCHAIN_SERVICE: &str = "app.fewmail.desktop";

static AGENT: LazyLock<Agent> = LazyLock::new(|| {
    Agent::config_builder()
        .http_status_as_error(false)
        // The system's trust store, so the local portless certificate works as it does in a browser.
        .tls_config(
            TlsConfig::builder()
                .root_certs(RootCerts::PlatformVerifier)
                .build(),
        )
        .build()
        .into()
});

pub enum Error {
    SignedOut,
    Failed(String),
}

impl std::fmt::Debug for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Self::SignedOut => f.write_str("signed out"),
            Self::Failed(reason) => f.write_str(reason),
        }
    }
}

impl<E: std::fmt::Display> From<E> for Error {
    fn from(error: E) -> Self {
        Self::Failed(error.to_string())
    }
}

/// The Better Auth session cookie, kept in the Keychain under the API it belongs to.
#[derive(Clone)]
pub struct Session(String);

impl Session {
    pub fn stored() -> Option<Self> {
        security_framework::passwords::get_generic_password(KEYCHAIN_SERVICE, API_URL)
            .ok()
            .and_then(|cookie| String::from_utf8(cookie).ok())
            .map(Self)
    }

    /// Redeems the one-time token `/desktop` handed over through `fewmail://sign-in` (`apps/web/src/routes/desktop.tsx`).
    pub fn redeem(token: &str) -> Result<Self, Error> {
        let response = AGENT
            .post(format!("{API_URL}/auth/one-time-token/verify"))
            .header("Origin", WEB_URL)
            .send_json(json!({ "token": token }))?;
        if !response.status().is_success() {
            return Err(Error::Failed(format!(
                "sign-in refused: {}",
                response.status()
            )));
        }
        let cookie = response
            .headers()
            .get_all("set-cookie")
            .iter()
            .filter_map(|header| header.to_str().ok()?.split(';').next())
            .filter(|pair| pair.contains("session_token="))
            .collect::<Vec<_>>()
            .join("; ");
        if cookie.is_empty() {
            return Err(Error::Failed("sign-in set no session".into()));
        }
        security_framework::passwords::set_generic_password(
            KEYCHAIN_SERVICE,
            API_URL,
            cookie.as_bytes(),
        )?;
        Ok(Self(cookie))
    }

    pub fn sign_out(&self) {
        let _ = AGENT
            .post(format!("{API_URL}/auth/sign-out"))
            .header("Origin", WEB_URL)
            .header("Cookie", &self.0)
            .send_json(json!({}));
        let _ = security_framework::passwords::delete_generic_password(KEYCHAIN_SERVICE, API_URL);
    }

    /// One oRPC procedure, `path` as the web's `orpc.today.get` → `today/get`.
    pub fn call<T: DeserializeOwned>(&self, path: &str, input: impl Serialize) -> Result<T, Error> {
        let input = serde_json::to_value(input)?;
        let body = if input.is_null() {
            json!({})
        } else {
            json!({ "json": input })
        };
        let mut response = AGENT
            .post(format!("{API_URL}/rpc/{path}"))
            .header("Origin", WEB_URL)
            .header("Cookie", &self.0)
            .send_json(body)?;
        let status = response.status();
        let mut answer: Value = response.body_mut().read_json()?;
        if status == 401 {
            return Err(Error::SignedOut);
        }
        if !status.is_success() {
            return Err(Error::Failed(format!("{path}: {status}")));
        }
        Ok(serde_json::from_value(answer["json"].take())?)
    }
}

impl Session {
    /// Calls `path` off the main thread and hands the answer to `done` on the view that asked.
    pub fn request<V: 'static>(
        &self,
        path: &'static str,
        input: Value,
        cx: &mut gpui::Context<V>,
        done: impl FnOnce(&mut V, Result<Value, Error>, &mut gpui::Context<V>) + 'static,
    ) {
        let session = self.clone();
        let task = cx
            .background_executor()
            .spawn(async move { session.call::<Value>(path, input) });
        cx.spawn(async move |view, cx| {
            let answer = task.await;
            view.update(cx, |view, cx| {
                done(view, answer, cx);
                cx.notify();
            })
        })
        .detach();
    }
}
