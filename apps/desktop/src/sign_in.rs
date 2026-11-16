use gpui::{Context, Render, SharedString, Window, div, prelude::*, px, relative, svg};

use crate::{
    api::WEB_URL,
    i18n::{I18n, t},
    theme::theme,
    ui::{Button, Select, Size, Text, icon, radius, shadow_sm},
};

/// `/login` (`apps/web/src/routes/login.tsx`). Google refuses embedded sign-in, so the button opens `/desktop` in the
/// browser, which signs in there and hands a one-time token back through `fewmail://sign-in`.
pub struct SignIn {
    /// The browser must send it back with the token, or any link could sign the app into someone else's account.
    state: Option<String>,
    is_picking_language: bool,
}

impl SignIn {
    pub fn new(_cx: &mut Context<Self>) -> Self {
        Self {
            state: None,
            is_picking_language: false,
        }
    }

    fn start(&mut self, cx: &mut Context<Self>) {
        let state = random_state();
        cx.open_url(&format!("{WEB_URL}/desktop?next=%2Fhome&state={state}"));
        self.state = Some(state);
    }

    pub fn token_from(&self, url: &str) -> Option<String> {
        let query = url.strip_prefix("fewmail://sign-in?")?;
        let param = |name: &str| {
            query
                .split('&')
                .find_map(|pair| pair.strip_prefix(&format!("{name}=")))
        };
        (param("state")? == self.state.as_deref()?).then(|| param("token").map(String::from))?
    }
}

fn random_state() -> String {
    let mut bytes = [0u8; 16];
    std::io::Read::read_exact(
        &mut std::fs::File::open("/dev/urandom").unwrap(),
        &mut bytes,
    )
    .unwrap();
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

/// `LoginStory`'s resting frame: the agent has gone through the inbox and one email is left for you.
fn story_row(is_important: bool, sender: f32, subject: f32, cx: &gpui::App) -> impl IntoElement {
    let theme = theme(cx);
    div()
        .flex()
        .items_center()
        .gap_3()
        .p_4()
        .rounded(px(radius::XXL))
        .bg(theme.popover)
        .border_1()
        .border_color(
            theme
                .foreground
                .opacity(if is_important { 0.10 } else { 0.06 }),
        )
        .when(is_important, |row| row.shadow(shadow_sm(theme)))
        .child(div().size_2().flex_none().rounded_full().map(|dot| {
            if is_important {
                dot.bg(theme.primary)
            } else {
                dot.border_1().border_color(theme.foreground.opacity(0.3))
            }
        }))
        .child(
            div()
                .flex()
                .flex_col()
                .flex_1()
                .gap_2()
                .child(
                    div()
                        .h_2()
                        .w(relative(sender))
                        .rounded_full()
                        .bg(theme.foreground.opacity(0.15)),
                )
                .child(
                    div()
                        .h_2()
                        .w(relative(subject))
                        .rounded_full()
                        .bg(theme.foreground.opacity(0.08)),
                ),
        )
}

impl Render for SignIn {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = *theme(cx);
        let agree = cx
            .global::<I18n>()
            .rich("login.agree", &["terms", "privacy"]);
        let links = [
            ("{terms}", t(cx, "legal.terms"), "/terms"),
            ("{privacy}", t(cx, "legal.privacy"), "/privacy"),
        ];
        div()
            .size_full()
            .flex()
            .child(
                div()
                    .flex_1()
                    .flex()
                    .flex_col()
                    .gap_10()
                    .px_12()
                    .h_full()
                    .justify_between()
                    .py_8()
                    .child(
                        div()
                            .flex()
                            .items_center()
                            .justify_between()
                            .child(
                                svg()
                                    .path("logo/lockup.svg")
                                    .h(px(20.))
                                    .w(px(120.))
                                    .text_color(theme.primary),
                            )
                            .child(Select::new(
                                "language",
                                cx.global::<I18n>().locale().to_string(),
                                cx.global::<I18n>().locales(),
                                self.is_picking_language,
                                cx.listener(|this, is_open, _, cx| {
                                    this.is_picking_language = *is_open;
                                    cx.notify();
                                }),
                                cx.listener(|this, locale: &SharedString, window, cx| {
                                    cx.global_mut::<I18n>().set_locale(locale);
                                    this.is_picking_language = false;
                                    window.refresh();
                                }),
                            )),
                    )
                    .child(
                        div().flex().justify_center().child(
                            div()
                                .w_full()
                                .max_w(px(448.))
                                .flex()
                                .flex_col()
                                .gap_8()
                                .child(
                                    div()
                                        .flex()
                                        .flex_col()
                                        .gap_4()
                                        .child(div().text_display().child(t(cx, "login.title")))
                                        .child(
                                            div()
                                                .text_brief()
                                                .text_color(theme.foreground.opacity(0.75))
                                                .child(t(cx, "login.lead")),
                                        ),
                                )
                                .child(
                                    div()
                                        .flex()
                                        .items_center()
                                        .gap_3()
                                        .text_sm_()
                                        .text_color(theme.muted_foreground)
                                        .child(
                                            div()
                                                .size_8()
                                                .flex_none()
                                                .flex()
                                                .items_center()
                                                .justify_center()
                                                .rounded(px(radius::LG))
                                                .bg(theme.secondary)
                                                .child(
                                                    icon("BubbleChatIcon")
                                                        .text_color(theme.foreground),
                                                ),
                                        )
                                        .child(
                                            div()
                                                .flex_1()
                                                .min_w_0()
                                                .child(t(cx, "login.messengers")),
                                        ),
                                )
                                .child(
                                    div()
                                        .flex()
                                        .flex_col()
                                        .gap_4()
                                        .child(
                                            Button::new("continue")
                                                .size(Size::Lg)
                                                .icon("logo/google.svg")
                                                .label(t(cx, "login.continue"))
                                                .on_click(
                                                    cx.listener(|this, _, _, cx| this.start(cx)),
                                                ),
                                        )
                                        .child(
                                            div()
                                                .text_xs_()
                                                .line_height(px(19.5))
                                                .text_color(theme.muted_foreground)
                                                .child(t(cx, "login.consent")),
                                        ),
                                ),
                        ),
                    )
                    .child(
                        div()
                            .flex()
                            .flex_wrap()
                            .text_xs_()
                            .text_color(theme.muted_foreground)
                            .children(agree.into_iter().enumerate().map(move |(index, part)| {
                                match links
                                    .iter()
                                    .find(|(slot, _, _)| *slot == part.as_ref())
                                    .cloned()
                                {
                                    Some((_, label, path)) => div()
                                        .id(index)
                                        .text_color(theme.primary)
                                        .cursor_pointer()
                                        .hover(|link| link.underline())
                                        .child(label)
                                        .on_click(move |_, _, cx| {
                                            cx.open_url(&format!("{WEB_URL}{path}"))
                                        })
                                        .into_any_element(),
                                    None => div().child(part).into_any_element(),
                                }
                            })),
                    ),
            )
            .child(
                div()
                    .w(relative(1.1 / 2.1))
                    .flex_none()
                    .m_3()
                    .flex()
                    .items_center()
                    .justify_center()
                    .px_12()
                    .rounded(px(radius::XXXL))
                    .bg(theme.background)
                    .border_1()
                    .border_color(theme.foreground.opacity(0.06))
                    .child(
                        div()
                            .w_full()
                            .max_w(px(384.))
                            .flex()
                            .flex_col()
                            .gap_3()
                            .child(story_row(false, 0.25, 0.6, cx))
                            .child(story_row(false, 0.33, 0.5, cx))
                            .child(story_row(true, 0.4, 0.8, cx))
                            .child(story_row(false, 0.25, 0.67, cx)),
                    ),
            )
    }
}
