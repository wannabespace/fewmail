use gpui::{AnyElement, Context, SharedString, div, prelude::*, px, svg};

use crate::{
    i18n::t,
    theme::theme,
    ui::{Text, icon, radius, shadow_sm, shadow_xs},
    workspace::{Page, Workspace},
};

const WIDTH: f32 = 232.;

impl Workspace {
    fn nav_row(
        &self,
        page: Page,
        glyph: &'static str,
        count: i64,
        cx: &mut Context<Self>,
    ) -> AnyElement {
        let theme = *theme(cx);
        let is_active = self.page == page;
        div()
            .id(page.label_key())
            .flex()
            .flex_none()
            .items_center()
            .gap_2()
            .h_8()
            .px(px(10.))
            .rounded(px(radius::LG))
            .text_sm_()
            .cursor_pointer()
            .text_color(if is_active {
                theme.foreground
            } else {
                theme.foreground.opacity(0.75)
            })
            .when(is_active, |row| {
                row.bg(theme.secondary)
                    .font_weight(gpui::FontWeight::MEDIUM)
            })
            .when(!is_active, |row| row.hover(move |row| row.bg(theme.accent)))
            .child(icon(glyph).opacity(0.7))
            .child(div().flex_1().child(t(cx, page.label_key())))
            .when(count > 0, |row| {
                row.child(
                    div()
                        .text_xs_()
                        .text_color(theme.muted_foreground)
                        .child(count.to_string()),
                )
            })
            .on_click(cx.listener(move |workspace, _, _, cx| workspace.open(page, cx)))
            .into_any_element()
    }

    fn menu_row(
        &self,
        id: &'static str,
        glyph: &'static str,
        label: SharedString,
        is_destructive: bool,
        cx: &mut Context<Self>,
        on_click: impl Fn(&mut Workspace, &mut Context<Workspace>) + 'static,
    ) -> AnyElement {
        let theme = *theme(cx);
        let color = if is_destructive {
            theme.destructive
        } else {
            theme.foreground
        };
        div()
            .id(id)
            .flex()
            .items_center()
            .gap_2()
            .min_h_7()
            .px_2()
            .py_1()
            .rounded(px(radius::LG))
            .text_sm_()
            .text_color(color)
            .cursor_pointer()
            .hover(move |row| {
                row.bg(if is_destructive {
                    theme.destructive.opacity(0.15)
                } else {
                    theme.accent_popover
                })
            })
            .child(icon(glyph).text_color(if is_destructive {
                color
            } else {
                color.opacity(0.7)
            }))
            .child(label)
            .on_click(cx.listener(move |workspace, _, _, cx| on_click(workspace, cx)))
            .into_any_element()
    }

    fn account_menu(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = *theme(cx);
        let email = self.me["user"]["email"]
            .as_str()
            .unwrap_or_default()
            .to_string();
        let is_free = self.me["plan"]["kind"].as_str() == Some("free")
            || self.me["plan"]["trialDaysLeft"].as_i64().is_some();
        div()
            .id("account-menu")
            .absolute()
            .bottom(px(40.))
            .left_0()
            .w(px(220.))
            .p_1()
            .rounded(px(radius::XL))
            .bg(theme.popover)
            .border_1()
            .border_color(theme.foreground.opacity(0.04))
            .shadow(shadow_sm(&theme))
            .on_mouse_down_out(cx.listener(|workspace, _, _, cx| {
                workspace.is_account_open = false;
                cx.notify();
            }))
            .child(
                div()
                    .px_2()
                    .py_1()
                    .text_xs_()
                    .text_color(theme.foreground)
                    .truncate()
                    .child(email),
            )
            .child(div().h_px().my_1().bg(theme.border))
            .child(self.menu_row(
                "settings",
                "Settings01Icon",
                t(cx, "nav.settings"),
                false,
                cx,
                |workspace, cx| workspace.open(Page::Settings, cx),
            ))
            .when(is_free, |menu| {
                menu.child(self.menu_row(
                    "upgrade",
                    "CrownIcon",
                    t(cx, "command.upgrade"),
                    false,
                    cx,
                    |workspace, cx| workspace.open(Page::Settings, cx),
                ))
            })
            .child(div().h_px().my_1().bg(theme.border))
            .child(self.menu_row(
                "sign-out",
                "Logout01Icon",
                t(cx, "settings.signOut"),
                true,
                cx,
                |workspace, cx| workspace.sign_out(cx),
            ))
    }

    /// `Sidebar` (`apps/web/src/components/nav.tsx`). It starts under the window's traffic lights.
    pub fn render_sidebar(&mut self, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = *theme(cx);
        let email = self.me["user"]["email"].as_str().unwrap_or_default();
        let local_part = email.split('@').next().unwrap_or_default().to_string();
        let initial = email
            .chars()
            .next()
            .unwrap_or(' ')
            .to_uppercase()
            .to_string();
        div()
            .w(px(WIDTH))
            .flex_none()
            .h_full()
            .flex()
            .flex_col()
            .gap_1()
            .border_r_1()
            .border_color(theme.border)
            .px(px(14.))
            .pt(px(44.))
            .pb_5()
            .child(
                div().px(px(10.)).pb_4().child(
                    svg()
                        .path("logo/lockup.svg")
                        .h(px(18.))
                        .w(px(108.))
                        .text_color(theme.primary),
                ),
            )
            .child(
                div().mb_3().flex().items_center().gap(px(6.)).child(
                    div()
                        .id("search")
                        .flex_1()
                        .min_w_0()
                        .flex()
                        .items_center()
                        .gap(px(6.))
                        .h_8()
                        .pl(px(10.))
                        .pr_3()
                        .rounded(px(radius::XL))
                        .bg(theme.input)
                        .border_1()
                        .border_color(theme.foreground.opacity(0.04))
                        .shadow(shadow_xs(&theme))
                        .text_sm_()
                        .text_color(theme.muted_foreground)
                        .cursor_pointer()
                        .hover(move |field| {
                            field
                                .border_color(theme.foreground.opacity(0.12))
                                .text_color(theme.foreground)
                        })
                        .child(icon("Search01Icon"))
                        .child(div().truncate().child(t(cx, "nav.search")))
                        .on_click(
                            cx.listener(|workspace, _, _, cx| workspace.open(Page::Mail, cx)),
                        ),
                ),
            )
            .child(
                div()
                    .flex_1()
                    .min_h_0()
                    .flex()
                    .flex_col()
                    .gap_1()
                    .child(self.nav_row(Page::Home, "Home01Icon", self.home_count, cx))
                    .child(self.nav_row(Page::Mail, "Mail01Icon", self.unread, cx))
                    .child(self.nav_row(Page::Calendar, "Calendar03Icon", 0, cx))
                    .child(
                        div()
                            .mt_auto()
                            .flex()
                            .flex_col()
                            .gap_1()
                            .pt_4()
                            .child(self.nav_row(Page::Rules, "ZapIcon", 0, cx))
                            .child(self.nav_row(Page::Subscriptions, "MailRemove01Icon", 0, cx)),
                    ),
            )
            .child(
                div()
                    .relative()
                    .child(
                        div()
                            .id("account")
                            .flex()
                            .items_center()
                            .gap_2()
                            .h_8()
                            .pl_1()
                            .pr(px(10.))
                            .rounded(px(radius::LG))
                            .text_sm_()
                            .text_color(theme.foreground.opacity(0.75))
                            .cursor_pointer()
                            .hover(move |row| row.bg(theme.accent))
                            .child(
                                div()
                                    .size_6()
                                    .flex_none()
                                    .flex()
                                    .items_center()
                                    .justify_center()
                                    .rounded_full()
                                    .bg(theme.muted)
                                    .text_xs_()
                                    .text_color(theme.muted_foreground)
                                    .child(initial),
                            )
                            .child(div().flex_1().truncate().child(local_part))
                            .child(icon("UnfoldMoreIcon").opacity(0.7))
                            .on_click(cx.listener(|workspace, _, _, cx| {
                                workspace.is_account_open = !workspace.is_account_open;
                                cx.notify();
                            })),
                    )
                    .when(self.is_account_open, |account| {
                        account.child(self.account_menu(cx))
                    }),
            )
    }
}
