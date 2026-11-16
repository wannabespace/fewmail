use gpui::{App, Global, SharedString};
use objc2::rc::Retained;
use objc2_foundation::{NSLocale, NSString};
use objc2_javascript_core::JSContext;
use serde_json::Value;

/// The web's messages (`packages/shared/i18n`, bundled by build.rs) in JavaScriptCore, which has the `Intl` their plurals need.
pub struct I18n {
    context: Retained<JSContext>,
    locale: String,
}

impl Global for I18n {}

impl I18n {
    pub fn new() -> Self {
        let context = unsafe { JSContext::new() };
        let i18n = Self {
            context,
            locale: String::new(),
        };
        i18n.evaluate(include_str!(concat!(env!("OUT_DIR"), "/i18n.js")));
        let languages: Vec<String> = NSLocale::preferredLanguages()
            .iter()
            .map(|language| language.to_string())
            .collect();
        let locale = i18n.evaluate(&format!("matchLocale({})", Value::from(languages)));
        Self { locale, ..i18n }
    }

    /// The language the user picked in Settings wins over the system's.
    pub fn set_locale(&mut self, locale: &str) {
        if self.evaluate(&format!("String({:?} in messages)", locale)) == "true" {
            self.locale = locale.into();
        }
    }

    pub fn locale(&self) -> &str {
        &self.locale
    }

    /// Every language as (code, its own name), as the web's `LanguageSelect` lists them.
    pub fn locales(&self) -> Vec<(SharedString, SharedString)> {
        serde_json::from_str::<Vec<(String, String)>>(
            &self.evaluate("JSON.stringify(LOCALES.map(({ code, label }) => [code, label]))"),
        )
        .unwrap_or_default()
        .into_iter()
        .map(|(code, label)| (code.into(), label.into()))
        .collect()
    }

    fn evaluate(&self, script: &str) -> String {
        unsafe {
            self.context
                .evaluateScript(Some(&NSString::from_str(script)))
        }
        .and_then(|value| unsafe { value.toString() })
        .map(|text| text.to_string())
        .unwrap_or_default()
    }

    /// "Monday, 16 November", today in the interface language.
    pub fn today(&self) -> SharedString {
        let day = self.evaluate(&format!(
            "new Intl.DateTimeFormat({:?}, {{ weekday: 'long', day: 'numeric', month: 'long' }}).format(new Date())",
            self.locale
        ));
        let mut letters = day.chars();
        letters
            .next()
            .map(|first| first.to_uppercase().chain(letters).collect::<String>())
            .unwrap_or_default()
            .into()
    }

    /// The web's `fromNow`: "3 hours ago", and `justNow` under a minute.
    pub fn from_now(&self, iso: &str) -> SharedString {
        self.evaluate(&format!(
            "((seconds) => {{
                if (Math.abs(seconds) < 60) return messages[{locale:?}].justNow
                const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]]
                const [unit, size] = units.find(([, size]) => Math.abs(seconds) >= size)
                return new Intl.RelativeTimeFormat({locale:?}).format(Math.round(seconds / size), unit)
            }})((new Date({iso:?}) - Date.now()) / 1000)",
            locale = self.locale
        ))
        .into()
    }

    /// `key` is a literal path into the messages, never user input; `args` are the arguments of a message that is a function.
    pub fn text(&self, key: &str, args: &[Value]) -> SharedString {
        let message = format!("messages[{:?}].{key}", self.locale);
        let script = if args.is_empty() {
            message
        } else {
            let args: Vec<String> = args.iter().map(Value::to_string).collect();
            format!("{message}({})", args.join(","))
        };
        self.evaluate(&script).into()
    }

    /// A `Rich` message's parts, each slot standing as `{slot}` for the caller to replace with its own element.
    pub fn rich(&self, key: &str, slots: &[&str]) -> Vec<SharedString> {
        let slots: Vec<String> = slots
            .iter()
            .map(|slot| format!("{slot:?}: '{{{slot}}}'"))
            .collect();
        let parts = self.evaluate(&format!(
            "JSON.stringify(messages[{:?}].{key}({{{}}}))",
            self.locale,
            slots.join(",")
        ));
        serde_json::from_str::<Vec<String>>(&parts)
            .unwrap_or_default()
            .into_iter()
            .map(SharedString::from)
            .collect()
    }
}

pub fn t(cx: &App, key: &str) -> SharedString {
    cx.global::<I18n>().text(key, &[])
}

pub fn tf(cx: &App, key: &str, args: &[Value]) -> SharedString {
    cx.global::<I18n>().text(key, args)
}
