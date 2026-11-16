use std::time::Duration;

use gpui::{
    Context, EventEmitter, FocusHandle, KeyBinding, Render, SharedString, Window, actions, div,
    prelude::*, px,
};
use serde_json::{Value, json};

use crate::{
    api::{Error, Session, WEB_URL},
    home::Home,
    i18n::{I18n, t},
    theme::theme,
    ui::{Button, Size, Text, Variant},
    update,
};

actions!(
    workspace,
    [
        GoHome,
        GoMail,
        GoCalendar,
        GoRules,
        GoSubscriptions,
        GoSettings,
        InstallUpdate
    ]
);

/// The web's live stream (`listenForChanges`) is not here yet: everything shown is fetched again this often.
const REFRESH_EVERY: Duration = Duration::from_secs(30);

pub fn bind_keys(cx: &mut gpui::App) {
    cx.bind_keys([
        KeyBinding::new("g h", GoHome, Some("Workspace")),
        KeyBinding::new("g m", GoMail, Some("Workspace")),
        KeyBinding::new("g l", GoCalendar, Some("Workspace")),
        KeyBinding::new("g r", GoRules, Some("Workspace")),
        KeyBinding::new("g u", GoSubscriptions, Some("Workspace")),
        KeyBinding::new("g s", GoSettings, Some("Workspace")),
    ]);
}

#[derive(Clone, Copy, PartialEq)]
pub enum Page {
    Home,
    Mail,
    Calendar,
    Rules,
    Subscriptions,
    Settings,
}

impl Page {
    pub fn label_key(self) -> &'static str {
        match self {
            Page::Home => "nav.home",
            Page::Mail => "nav.mail",
            Page::Calendar => "nav.calendar",
            Page::Rules => "nav.rules",
            Page::Subscriptions => "nav.subscriptions",
            Page::Settings => "nav.settings",
        }
    }

    pub fn path(self) -> &'static str {
        match self {
            Page::Home => "/home",
            Page::Mail => "/mail",
            Page::Calendar => "/calendar",
            Page::Rules => "/rules",
            Page::Subscriptions => "/subscriptions",
            Page::Settings => "/settings",
        }
    }
}

pub struct SignedOut;

/// The signed-in app (`apps/web/src/routes/_app.tsx`): the sidebar and the page beside it.
pub struct Workspace {
    pub session: Session,
    pub page: Page,
    pub me: Value,
    pub home_count: i64,
    pub unread: i64,
    pub home: Home,
    pub is_account_open: bool,
    focus: FocusHandle,
}

impl EventEmitter<SignedOut> for Workspace {}

impl Workspace {
    pub fn new(session: Session, window: &mut Window, cx: &mut Context<Self>) -> Self {
        let focus = cx.focus_handle();
        window.focus(&focus);
        cx.spawn(async move |workspace, cx| {
            loop {
                if workspace
                    .update(cx, |workspace, cx| workspace.refresh(cx))
                    .is_err()
                {
                    return;
                }
                cx.background_executor().timer(REFRESH_EVERY).await;
            }
        })
        .detach();
        Self {
            session,
            page: Page::Home,
            me: Value::Null,
            home_count: 0,
            unread: 0,
            home: Home::default(),
            is_account_open: false,
            focus,
        }
    }

    pub fn refresh(&mut self, cx: &mut Context<Self>) {
        self.session
            .request("me", Value::Null, cx, |workspace, answer, cx| {
                if let Some(me) = workspace.answered(answer, cx) {
                    if let Some(language) = me["settings"]["language"].as_str() {
                        cx.global_mut::<I18n>().set_locale(language);
                    }
                    workspace.me = me;
                }
            });
        self.session
            .request("today/count", Value::Null, cx, |workspace, answer, cx| {
                if let Some(count) = workspace.answered(answer, cx) {
                    workspace.home_count = count.as_i64().unwrap_or(0);
                }
            });
        self.session
            .request("mail/unread", json!({}), cx, |workspace, answer, cx| {
                if let Some(unread) = workspace.answered(answer, cx) {
                    workspace.unread = unread["inbox"].as_i64().unwrap_or(0);
                }
            });
        self.load_home(cx);
    }

    /// The answer, or `None` after logging the failure; a lost session signs out.
    pub fn answered(
        &mut self,
        answer: Result<Value, Error>,
        cx: &mut Context<Self>,
    ) -> Option<Value> {
        match answer {
            Ok(value) => Some(value),
            Err(Error::SignedOut) => {
                self.session.sign_out();
                cx.emit(SignedOut);
                None
            }
            Err(error) => {
                eprintln!("request failed: {error:?}");
                None
            }
        }
    }

    /// A write: everything is fetched again once the server has it, as the web's invalidations do.
    pub fn mutate(&mut self, path: &'static str, input: Value, cx: &mut Context<Self>) {
        self.session
            .request(path, input, cx, |workspace, answer, cx| {
                workspace.answered(answer, cx);
                workspace.refresh(cx);
            });
    }

    pub fn open(&mut self, page: Page, cx: &mut Context<Self>) {
        self.page = page;
        self.is_account_open = false;
        cx.notify();
    }

    pub fn sign_out(&mut self, cx: &mut Context<Self>) {
        let session = self.session.clone();
        cx.background_executor()
            .spawn(async move { session.sign_out() })
            .detach();
        cx.emit(SignedOut);
    }

    fn render_unported(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let path = self.page.path();
        div()
            .flex()
            .flex_col()
            .gap_4()
            .px_10()
            .pt_12()
            .child(div().text_display().child(t(cx, self.page.label_key())))
            .child(
                Button::new("open-in-browser")
                    .size(Size::Sm)
                    .variant(Variant::Secondary)
                    .icon("LinkSquare02Icon")
                    .label(SharedString::from(format!("fewmail.app{path}")))
                    .on_click(move |_, _, cx| cx.open_url(&format!("{WEB_URL}{path}"))),
            )
    }
}

impl Render for Workspace {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = *theme(cx);
        div()
            .size_full()
            .flex()
            .key_context("Workspace")
            .track_focus(&self.focus)
            .on_action(cx.listener(|workspace, _: &GoHome, _, cx| workspace.open(Page::Home, cx)))
            .on_action(cx.listener(|workspace, _: &GoMail, _, cx| workspace.open(Page::Mail, cx)))
            .on_action(
                cx.listener(|workspace, _: &GoCalendar, _, cx| workspace.open(Page::Calendar, cx)),
            )
            .on_action(cx.listener(|workspace, _: &GoRules, _, cx| workspace.open(Page::Rules, cx)))
            .on_action(cx.listener(|workspace, _: &GoSubscriptions, _, cx| {
                workspace.open(Page::Subscriptions, cx)
            }))
            .on_action(
                cx.listener(|workspace, _: &GoSettings, _, cx| workspace.open(Page::Settings, cx)),
            )
            .on_action(cx.listener(|_, _: &InstallUpdate, _, cx| update::install(cx)))
            .child(self.render_sidebar(cx))
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .h_full()
                    .flex()
                    .flex_col()
                    .when(update::is_ready(cx), |page| {
                        page.child(
                            div()
                                .flex()
                                .items_center()
                                .gap_3()
                                .mx_3()
                                .mt_2()
                                .px(px(14.))
                                .py_3()
                                .rounded(px(crate::ui::radius::XL))
                                .bg(theme.popover)
                                .border_1()
                                .border_color(theme.foreground.opacity(0.04))
                                .text_sm_()
                                .child(div().flex_1().child(t(cx, "update.available")))
                                .child(
                                    Button::new("install-update")
                                        .size(Size::Sm)
                                        .variant(Variant::Secondary)
                                        .label(t(cx, "update.reload"))
                                        .on_click(|_, window, cx| {
                                            window.dispatch_action(Box::new(InstallUpdate), cx)
                                        }),
                                ),
                        )
                    })
                    .child(match self.page {
                        Page::Home => self.render_home(window, cx).into_any_element(),
                        _ => self.render_unported(cx).into_any_element(),
                    }),
            )
    }
}
