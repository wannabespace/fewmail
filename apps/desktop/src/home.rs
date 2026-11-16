use gpui::{
    AnyElement, App, Context, FontWeight, KeyBinding, SharedString, Window, actions, div,
    prelude::*, px,
};
use serde_json::{Value, json};

use crate::{
    api::WEB_URL,
    i18n::{I18n, t, tf},
    theme::theme,
    ui::{Button, Size, Text, Variant, icon, radius, shadow_xs},
    workspace::Workspace,
};

actions!(
    home,
    [
        Next,
        Previous,
        Approve,
        Skip,
        Toggle,
        OpenEmail,
        ApproveAllTidy
    ]
);

/// Cards the agent only proposes; Home gathers them in the Quick card instead of listing them.
const PROPOSAL_KINDS: [&str; 5] = ["archive", "mark_read", "unsubscribe", "spam", "trash"];
const CARDS_SHOWN: usize = 5;

pub fn bind_keys(cx: &mut App) {
    cx.bind_keys([
        KeyBinding::new("j", Next, Some("Home")),
        KeyBinding::new("down", Next, Some("Home")),
        KeyBinding::new("k", Previous, Some("Home")),
        KeyBinding::new("up", Previous, Some("Home")),
        KeyBinding::new("enter", Approve, Some("Home")),
        KeyBinding::new("s", Skip, Some("Home")),
        KeyBinding::new("space", Toggle, Some("Home")),
        KeyBinding::new("o", OpenEmail, Some("Home")),
        KeyBinding::new("t", ApproveAllTidy, Some("Home")),
    ]);
}

/// Home's state (`apps/web/src/routes/_app/home.tsx`): `today.get`, `today.queue`, and the cursor nobody lit yet.
#[derive(Default)]
pub struct Home {
    today: Option<Value>,
    queue: Vec<Value>,
    /// 0 is the Quick card when there is one; the cards follow.
    cursor: Option<usize>,
    open: Option<String>,
    settled: usize,
    shows_all: bool,
}

fn kind(card: &Value) -> &str {
    card["action"]["kind"].as_str().unwrap_or_default()
}

fn id(card: &Value) -> String {
    card["action"]["id"]
        .as_str()
        .unwrap_or_default()
        .to_string()
}

fn text(value: &Value) -> Option<SharedString> {
    value
        .as_str()
        .filter(|text| !text.is_empty())
        .map(|text| SharedString::from(text.to_string()))
}

/// A message that may not exist for every kind: `None` where the web would fall back.
fn t_some(cx: &App, key: &str) -> Option<SharedString> {
    Some(t(cx, key)).filter(|text| !text.is_empty() && text != "undefined")
}

impl Home {
    fn cards(&self) -> Vec<&Value> {
        self.queue
            .iter()
            .filter(|card| !PROPOSAL_KINDS.contains(&kind(card)))
            .collect()
    }

    fn proposal_cards(&self) -> Vec<&Value> {
        self.queue
            .iter()
            .filter(|card| PROPOSAL_KINDS.contains(&kind(card)) && !card["message"].is_null())
            .collect()
    }

    fn tidy(&self) -> Vec<&Value> {
        self.today
            .as_ref()
            .and_then(|today| today["tidy"].as_array())
            .map(|tidy| tidy.iter().collect())
            .unwrap_or_default()
    }

    fn list(&self, field: &str) -> Vec<&Value> {
        self.today
            .as_ref()
            .and_then(|today| today[field].as_array())
            .map(|list| list.iter().collect())
            .unwrap_or_default()
    }

    fn has_proposals(&self) -> bool {
        !self.proposal_cards().is_empty() || !self.tidy().is_empty()
    }

    fn decisions(&self) -> usize {
        self.cards().len()
            + self.list("newSenders").len()
            + self.list("ruleOffers").len()
            + usize::from(self.has_proposals())
    }

    fn shown_cards(&self) -> Vec<&Value> {
        let cards = self.cards();
        let shown = if self.shows_all {
            cards.len()
        } else {
            cards.len().min(CARDS_SHOWN)
        };
        cards.into_iter().take(shown).collect()
    }

    fn stops(&self) -> usize {
        usize::from(self.has_proposals()) + self.shown_cards().len()
    }

    /// The card under the cursor, `None` on the Quick card or before the first J / K.
    fn cursor_card(&self) -> Option<&Value> {
        let index = self
            .cursor?
            .checked_sub(usize::from(self.has_proposals()))?;
        self.shown_cards().get(index).copied()
    }
}

/// A new sender's or a rule offer's answer: the row leaves Home at once, then the write goes out.
fn answer(
    cx: &Context<Workspace>,
    (field, key, value): (&'static str, &'static str, Value),
    path: &'static str,
    input: Value,
) -> impl Fn(&gpui::ClickEvent, &mut Window, &mut App) + 'static {
    cx.listener(move |workspace, _, _, cx| {
        workspace.drop_from_today(field, key, &value);
        workspace.mutate(path, input.clone(), cx);
    })
}

impl Workspace {
    pub fn load_home(&mut self, cx: &mut Context<Self>) {
        self.session
            .request("today/get", Value::Null, cx, |workspace, answer, cx| {
                if let Some(today) = workspace.answered(answer, cx) {
                    workspace.home.today = Some(today);
                }
            });
        self.session
            .request("today/queue", Value::Null, cx, |workspace, answer, cx| {
                if let Some(Value::Array(queue)) = workspace.answered(answer, cx) {
                    workspace.home.queue = queue;
                    workspace.home.cursor = workspace
                        .home
                        .cursor
                        .map(|cursor| cursor.min(workspace.home.stops().saturating_sub(1)));
                }
            });
    }

    /// Leaves at once, as the web's `writeDelete`; the refetch after the write reconciles.
    fn settle(&mut self, ids: &[String], cx: &mut Context<Self>) {
        self.home.queue.retain(|card| !ids.contains(&id(card)));
        self.home.settled += ids.len();
        cx.notify();
    }

    fn approve(&mut self, card_id: String, cx: &mut Context<Self>) {
        self.settle(std::slice::from_ref(&card_id), cx);
        self.mutate("actions/approve", json!({ "id": card_id }), cx);
    }

    fn skip(&mut self, card_id: String, cx: &mut Context<Self>) {
        self.settle(std::slice::from_ref(&card_id), cx);
        self.mutate("actions/dismiss", json!({ "id": card_id }), cx);
    }

    fn approve_all_tidy(&mut self, cx: &mut Context<Self>) {
        let ids: Vec<String> = self.home.proposal_cards().into_iter().map(id).collect();
        let message_ids: Vec<Value> = self
            .home
            .tidy()
            .iter()
            .map(|row| row["message"]["id"].clone())
            .collect();
        self.settle(&ids, cx);
        if let Some(today) = &mut self.home.today {
            today["tidy"] = json!([]);
        }
        if !ids.is_empty() {
            self.mutate("actions/approveMany", json!({ "ids": ids }), cx);
        }
        if !message_ids.is_empty() {
            self.mutate("today/tidy", json!({ "messageIds": message_ids }), cx);
        }
    }

    fn drop_from_today(&mut self, field: &str, key: &str, value: &Value) {
        if let Some(Value::Array(rows)) = self.home.today.as_mut().map(|today| &mut today[field]) {
            rows.retain(|row| &row[key] != value);
        }
    }

    /// ⏎: a card with a link opens it, any other says yes; the Quick card approves everything in it.
    fn run_cursor(&mut self, cx: &mut Context<Self>) {
        if self.home.cursor == Some(0) && self.home.has_proposals() {
            return self.approve_all_tidy(cx);
        }
        let Some(card) = self.home.cursor_card() else {
            return;
        };
        match card["action"]["payload"]["link"]["url"].as_str() {
            Some(url) if kind(card) != "reply" => cx.open_url(url),
            _ => self.approve(id(card), cx),
        }
    }

    fn open_email(&mut self, card: &Value, cx: &mut Context<Self>) {
        if let Some(thread) = card["message"]["threadId"].as_str() {
            cx.open_url(&format!("{WEB_URL}/mail/{thread}"));
        }
    }

    fn headline(&self, cx: &App) -> SharedString {
        let mailboxes = self
            .home
            .today
            .as_ref()
            .and_then(|today| today["mailboxes"].as_array());
        if mailboxes.is_some_and(|mailboxes| {
            !mailboxes.is_empty()
                && mailboxes
                    .iter()
                    .all(|mailbox| mailbox["hasSynced"] == false)
        }) {
            return t(cx, "nav.syncing");
        }
        match self.home.decisions() {
            0 => t(cx, "today.allDone"),
            decisions => tf(cx, "today.headline", &[json!(decisions)]),
        }
    }

    fn lead(&self, cx: &App) -> SharedString {
        let Some(today) = &self.home.today else {
            return SharedString::default();
        };
        if self.home.decisions() == 0 {
            return t(cx, "today.allDoneLead");
        }
        let mut parts = Vec::new();
        let total = today["pulse"]["total"].as_i64().unwrap_or(0);
        if total > 0 {
            let period = tf(cx, "today.period", &[today["days"].clone()]);
            parts.push(format!(
                "{}.",
                tf(
                    cx,
                    "today.pulse.total",
                    &[json!(total), json!(period.as_ref())]
                )
            ));
        }
        parts.push(t(cx, "today.readAll").to_string());
        let handled = today["handled"]["total"].as_i64().unwrap_or(0);
        if handled > 0 {
            parts.push(tf(cx, "today.byRules", &[json!(handled)]).to_string());
        }
        parts.join(" ").into()
    }

    /// `foldedVerb` in `queue-card.tsx`.
    fn verb(card: &Value, cx: &App) -> SharedString {
        let action = &card["action"];
        if kind(card) == "reply" {
            return t(cx, "queue.send");
        }
        if let Some(purpose) = action["payload"]["link"]["purpose"]
            .as_str()
            .filter(|purpose| *purpose != kind(card))
        {
            if let Some(verb) = t_some(cx, &format!("actionLink.{purpose}")) {
                return verb;
            }
        }
        t(cx, &format!("actionKind.{}", kind(card)))
    }

    /// `approveTitle` in `queue-card.tsx`.
    fn approve_title(card: &Value, cx: &App) -> SharedString {
        let payload = &card["action"]["payload"];
        if kind(card) == "reply" {
            return t(cx, "queue.send");
        }
        if let Some(tool) = payload["tool"].as_str() {
            return t(cx, &format!("agent.yes.{tool}"));
        }
        if kind(card) == "schedule" && !payload["event"].is_null() {
            return t(cx, "queue.addToCalendar");
        }
        payload["link"]["purpose"]
            .as_str()
            .and_then(|purpose| t_some(cx, &format!("actionDone.{purpose}")))
            .or_else(|| t_some(cx, &format!("actionDone.{}", kind(card))))
            .unwrap_or_else(|| t(cx, &format!("actionKind.{}", kind(card))))
    }

    fn sender_name(row: &Value) -> SharedString {
        text(&row["fromName"])
            .or_else(|| text(&row["fromEmail"]))
            .unwrap_or_else(|| "Fewmail".into())
    }

    fn avatar(name: &str, size: f32, cx: &App) -> AnyElement {
        let theme = theme(cx);
        div()
            .size(px(size))
            .flex_none()
            .flex()
            .items_center()
            .justify_center()
            .rounded(px(if size > 16. { radius::MD } else { 5.28 }))
            .bg(theme.muted)
            .border_1()
            .border_color(theme.border)
            .text_color(theme.muted_foreground)
            .font_weight(FontWeight::MEDIUM)
            .map(|avatar| {
                if size > 16. {
                    avatar.text_xs_()
                } else {
                    avatar.text_2xs_()
                }
            })
            .child(
                name.chars()
                    .next()
                    .map(|first| first.to_uppercase().to_string())
                    .unwrap_or_default(),
            )
            .into_any_element()
    }

    /// `HomeCard`: heading, lead, the first three rows and its actions.
    fn home_card(
        &self,
        heading: SharedString,
        lead: SharedString,
        rows: Vec<(SharedString, SharedString)>,
        is_active: bool,
        actions: Vec<AnyElement>,
        cx: &App,
    ) -> AnyElement {
        let theme = *theme(cx);
        div()
            .flex()
            .flex_col()
            .gap_3()
            .mx(px(-19.))
            .px(px(19.))
            .py_4()
            .rounded(px(radius::XXL))
            .bg(theme.background)
            .border_1()
            .border_color(
                theme
                    .foreground
                    .opacity(if is_active { 0.25 } else { 0.06 }),
            )
            .child(
                div()
                    .text_xs_()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(theme.muted_foreground)
                    .child(heading),
            )
            .child(
                div()
                    .text_brief()
                    .text_color(theme.foreground.opacity(0.8))
                    .child(lead),
            )
            .when(!rows.is_empty(), |card| {
                card.child(
                    div()
                        .flex()
                        .flex_col()
                        .children(rows.into_iter().take(3).map(|(name, line)| {
                            div()
                                .flex()
                                .items_center()
                                .gap_2()
                                .mx(px(-10.))
                                .px(px(10.))
                                .py_1()
                                .rounded(px(radius::LG))
                                .text_sm_()
                                .hover(move |row| row.bg(theme.accent_surface))
                                .child(Self::avatar(&name, 16., cx))
                                .child(
                                    div()
                                        .flex_none()
                                        .font_weight(FontWeight::MEDIUM)
                                        .child(name),
                                )
                                .child(
                                    div()
                                        .min_w_0()
                                        .truncate()
                                        .text_color(theme.muted_foreground)
                                        .child(line),
                                )
                        })),
                )
            })
            .when(!actions.is_empty(), |card| {
                card.child(
                    div()
                        .flex()
                        .flex_wrap()
                        .items_center()
                        .gap_2()
                        .children(actions),
                )
            })
            .into_any_element()
    }

    fn quick_card(&self, cx: &mut Context<Self>) -> Option<AnyElement> {
        if !self.home.has_proposals() {
            return None;
        }
        let proposals = self.home.proposal_cards();
        let tidy = self.home.tidy();
        let kind_of = |row: &Value| -> String {
            row["analysis"]["suggestedAction"]
                .as_str()
                .map(String::from)
                .unwrap_or_else(|| kind(row).to_string())
        };
        let kinds: Vec<String> = proposals
            .iter()
            .map(|card| kind_of(card))
            .chain(tidy.iter().map(|row| kind_of(row)))
            .collect();
        let counts: Vec<String> = PROPOSAL_KINDS
            .iter()
            .filter_map(|proposal| {
                let count = kinds.iter().filter(|kind| kind == proposal).count();
                (count > 0)
                    .then(|| tf(cx, &format!("today.tidy.{proposal}"), &[json!(count)]).to_string())
            })
            .collect();
        let lead = format!(
            "{}: {}.",
            tf(cx, "today.tidy.total", &[json!(kinds.len())]),
            counts.join(" · ")
        );
        let rows = proposals
            .iter()
            .chain(tidy.iter())
            .map(|row| {
                (
                    Self::sender_name(&row["message"]),
                    text(&row["message"]["subject"]).unwrap_or_default(),
                )
            })
            .collect();
        let approve = Button::new("approve-all-tidy")
            .size(Size::Sm)
            .label(t(cx, "today.tidy.run"))
            .on_click(cx.listener(|workspace, _, _, cx| workspace.approve_all_tidy(cx)))
            .into_any_element();
        Some(self.home_card(
            t(cx, "today.quick"),
            lead.into(),
            rows,
            self.home.cursor == Some(0),
            vec![approve],
            cx,
        ))
    }

    fn card_row(&self, card: &Value, is_cursor: bool, cx: &mut Context<Self>) -> AnyElement {
        let theme = *theme(cx);
        let card_id = id(card);
        let action = &card["action"];
        let message = &card["message"];
        let is_open = self.home.open.as_deref() == Some(card_id.as_str());
        let who = if kind(card) == "commitment" && !action["reason"].is_null() {
            json!({ "fromEmail": action["reason"] })
        } else {
            message.clone()
        };
        let name = if kind(card) == "cleanup" {
            "Fewmail".into()
        } else {
            Self::sender_name(&who)
        };
        let headline = match kind(card) {
            "commitment" | "heads_up" => text(&action["detail"]).or_else(|| text(&action["title"])),
            "cleanup" | "consent" => text(&action["title"]),
            _ => text(&card["analysis"]["summary"])
                .or_else(|| text(&message["subject"]))
                .or_else(|| text(&action["title"])),
        }
        .unwrap_or_default();
        let received = message["receivedAt"]
            .as_str()
            .map(|at| cx.global::<I18n>().from_now(at))
            .unwrap_or_default();
        let is_urgent = card["analysis"]["importance"].as_i64().unwrap_or(0) >= 3;
        let approve_id = card_id.clone();
        let skip_id = card_id.clone();
        let toggle_id = card_id.clone();
        let group = SharedString::from(format!("card-{card_id}"));
        div()
            .flex()
            .flex_col()
            .border_t_1()
            .border_color(theme.foreground.opacity(0.06))
            .child(
                div()
                    .id(SharedString::from(card_id.clone()))
                    .group(group.clone())
                    .flex()
                    .items_center()
                    .gap(px(14.))
                    .py_3()
                    .px(px(14.))
                    .text_sm_()
                    .cursor_pointer()
                    .when(is_cursor, |row| row.bg(theme.accent_popover))
                    .hover(move |row| row.bg(theme.accent_popover))
                    .on_click(cx.listener(move |workspace, _, _, cx| {
                        workspace.home.open = (workspace.home.open.as_deref()
                            != Some(toggle_id.as_str()))
                        .then(|| toggle_id.clone());
                        cx.notify();
                    }))
                    .child(Self::avatar(&name, 24., cx))
                    .child(
                        div()
                            .flex_1()
                            .min_w_0()
                            .flex()
                            .flex_col()
                            .gap(px(2.))
                            .child(div().truncate().font_weight(FontWeight::MEDIUM).child(name))
                            .child(
                                div()
                                    .truncate()
                                    .text_color(if kind(card) == "security" {
                                        theme.destructive
                                    } else {
                                        theme.muted_foreground
                                    })
                                    .child(headline),
                            ),
                    )
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .items_end()
                            .gap(px(2.))
                            .text_xs_()
                            .line_height(px(20.))
                            .text_color(theme.muted_foreground)
                            .group_hover(group.clone(), |cell| cell.opacity(0.))
                            .child(div().flex().items_center().gap_2().child(received).when(
                                is_urgent,
                                |line| {
                                    line.child(div().size_2().rounded_full().bg(theme.destructive))
                                },
                            ))
                            .when(!is_open, |cell| cell.child(Self::verb(card, cx))),
                    )
                    .child(
                        div()
                            .flex()
                            .invisible()
                            .group_hover(group, |actions| actions.visible())
                            .when(kind(card) != "reply", |actions| {
                                actions.child(
                                    Button::new(SharedString::from(format!("approve-{card_id}")))
                                        .size(Size::IconSm)
                                        .variant(Variant::GhostMuted)
                                        .icon("Tick02Icon")
                                        .on_click(cx.listener(move |workspace, _, _, cx| {
                                            cx.stop_propagation();
                                            workspace.approve(approve_id.clone(), cx)
                                        })),
                                )
                            })
                            .child(
                                Button::new(SharedString::from(format!("skip-{card_id}")))
                                    .size(Size::IconSm)
                                    .variant(Variant::GhostMuted)
                                    .icon("NextIcon")
                                    .on_click(cx.listener(move |workspace, _, _, cx| {
                                        cx.stop_propagation();
                                        workspace.skip(skip_id.clone(), cx)
                                    })),
                            ),
                    ),
            )
            .when(is_open, |row| row.child(self.open_card(card, cx)))
            .into_any_element()
    }

    /// An open card: the gist or the draft, why, and its buttons.
    fn open_card(&self, card: &Value, cx: &mut Context<Self>) -> AnyElement {
        let theme = *theme(cx);
        let action = &card["action"];
        let card_id = id(card);
        let skip_id = card_id.clone();
        let email = card.clone();
        let is_reply = kind(card) == "reply";
        let why: Vec<String> = [
            text(&card["analysis"]["reason"]).map(|reason| reason.to_string()),
            text(&card["rule"])
                .map(|rule| tf(cx, "today.journal.byRule", &[json!(rule.as_ref())]).to_string()),
        ]
        .into_iter()
        .flatten()
        .collect();
        div()
            .flex()
            .flex_col()
            .gap_3()
            .pl(px(52.))
            .pr(px(14.))
            .pb_4()
            .when(is_reply, |open| {
                open.child(
                    div()
                        .px_4()
                        .py_3()
                        .rounded(px(radius::XL))
                        .bg(theme.secondary.opacity(0.6))
                        .font_family(crate::ui::SERIF)
                        .text_base_()
                        .line_height(px(26.))
                        .child(text(&action["detail"]).unwrap_or_default()),
                )
            })
            .when(!is_reply, |open| {
                open.when_some(text(&card["analysis"]["summary"]), |open, summary| {
                    open.child(
                        div()
                            .font_family(crate::ui::SERIF)
                            .text_base_()
                            .line_height(px(26.))
                            .child(summary),
                    )
                })
            })
            .when(!why.is_empty(), |open| {
                open.child(
                    div()
                        .text_sm_()
                        .text_color(theme.muted_foreground)
                        .child(why.join(" · ")),
                )
            })
            .child(
                div()
                    .flex()
                    .flex_wrap()
                    .items_center()
                    .gap_2()
                    .when_some(
                        action["payload"]["link"]["url"].as_str().map(String::from),
                        |buttons, url| {
                            buttons.child(
                                Button::new("link")
                                    .size(Size::Sm)
                                    .variant(Variant::Secondary)
                                    .icon("LinkSquare02Icon")
                                    .label(Self::verb(card, cx))
                                    .on_click(move |_, _, cx| cx.open_url(&url)),
                            )
                        },
                    )
                    .child(
                        Button::new("approve")
                            .size(Size::Sm)
                            .label(Self::approve_title(card, cx))
                            .on_click(cx.listener(move |workspace, _, _, cx| {
                                workspace.approve(card_id.clone(), cx)
                            })),
                    )
                    .child(
                        Button::new("skip")
                            .size(Size::Sm)
                            .variant(Variant::GhostMuted)
                            .label(t(cx, "queue.skip"))
                            .on_click(cx.listener(move |workspace, _, _, cx| {
                                workspace.skip(skip_id.clone(), cx)
                            })),
                    )
                    .when(!card["message"].is_null(), |buttons| {
                        buttons.child(
                            Button::new("read-email")
                                .size(Size::Sm)
                                .variant(Variant::GhostMuted)
                                .label(t(cx, "queue.readEmail"))
                                .on_click(cx.listener(move |workspace, _, _, cx| {
                                    workspace.open_email(&email, cx)
                                })),
                        )
                    }),
            )
            .into_any_element()
    }

    fn decisions(&self, cx: &mut Context<Self>) -> Option<AnyElement> {
        let decisions = self.home.decisions();
        if decisions == 0 {
            return None;
        }
        let theme = *theme(cx);
        let offset = usize::from(self.home.has_proposals());
        let shown: Vec<Value> = self.home.shown_cards().into_iter().cloned().collect();
        let hidden = self.home.cards().len() - shown.len();
        let settled = self.home.settled;
        let total = settled + decisions;
        Some(
            div()
                .flex()
                .flex_col()
                .gap(px(10.))
                .child(
                    div()
                        .flex()
                        .min_h_7()
                        .items_center()
                        .gap_3()
                        .text_xs_()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(theme.muted_foreground)
                        .child(t(cx, "today.decisions"))
                        .child(
                            div()
                                .flex_1()
                                .h(px(3.))
                                .rounded_full()
                                .bg(theme.foreground.opacity(0.08))
                                .child(
                                    div()
                                        .h_full()
                                        .rounded_full()
                                        .bg(theme.foreground.opacity(0.75))
                                        .w(gpui::relative(settled as f32 / total as f32)),
                                ),
                        )
                        .child(tf(cx, "today.progress", &[json!(settled), json!(total)])),
                )
                .children(self.quick_card(cx))
                .when(!shown.is_empty(), |section| {
                    section.child(
                        div()
                            .mx(px(-14.))
                            .flex()
                            .flex_col()
                            .rounded(px(radius::XL))
                            .bg(theme.popover)
                            .border_1()
                            .border_color(theme.foreground.opacity(0.04))
                            .shadow(shadow_xs(&theme))
                            .overflow_hidden()
                            .child(
                                div()
                                    .px(px(14.))
                                    .pt(px(14.))
                                    .pb_3()
                                    .text_xs_()
                                    .font_weight(FontWeight::MEDIUM)
                                    .text_color(theme.muted_foreground)
                                    .child(t(cx, "today.needsLook")),
                            )
                            .children(shown.iter().enumerate().map(|(index, card)| {
                                self.card_row(card, self.home.cursor == Some(index + offset), cx)
                            })),
                    )
                })
                .when(hidden > 0, |section| {
                    section.child(
                        div().child(
                            Button::new("show-all-cards")
                                .size(Size::Sm)
                                .variant(Variant::GhostMuted)
                                .label(tf(cx, "mail.showAll", &[json!(self.home.cards().len())]))
                                .on_click(cx.listener(|workspace, _, _, cx| {
                                    workspace.home.shows_all = true;
                                    cx.notify();
                                })),
                        ),
                    )
                })
                .children(
                    self.home
                        .list("newSenders")
                        .into_iter()
                        .cloned()
                        .map(|sender| self.new_sender(sender, cx)),
                )
                .children(
                    self.home
                        .list("ruleOffers")
                        .into_iter()
                        .cloned()
                        .map(|rule| self.rule_offer(rule, cx)),
                )
                .into_any_element(),
        )
    }

    fn offer_card(
        &self,
        media: AnyElement,
        title: AnyElement,
        lead: SharedString,
        buttons: Vec<AnyElement>,
        cx: &App,
    ) -> AnyElement {
        let theme = *theme(cx);
        div()
            .mx(px(-19.))
            .flex()
            .items_center()
            .gap(px(14.))
            .px(px(14.))
            .py_3()
            .rounded(px(radius::XL))
            .bg(theme.popover)
            .border_1()
            .border_color(theme.foreground.opacity(0.04))
            .shadow(shadow_xs(&theme))
            .text_sm_()
            .child(media)
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .flex()
                    .flex_col()
                    .gap_1()
                    .child(title)
                    .child(div().text_color(theme.muted_foreground).child(lead)),
            )
            .child(div().flex().items_center().gap_2().children(buttons))
            .into_any_element()
    }

    fn new_sender(&self, sender: Value, cx: &mut Context<Self>) -> AnyElement {
        let theme = *theme(cx);
        let name = Self::sender_name(&sender);
        let mut lead = tf(
            cx,
            "today.newSender.lead",
            &[sender["count"].clone(), sender["opened"].clone()],
        )
        .to_string();
        if let Some(share) = sender["leftShare"].as_f64() {
            lead = format!(
                "{lead} · {}",
                tf(cx, "subscriptions.leftBy", &[json!((share * 100.).round())])
            );
        }
        let message_id = sender["messageId"].clone();
        let row = || ("newSenders", "messageId", message_id.clone());
        let from = sender["fromEmail"].clone();
        let buttons = vec![
            Button::new("keep-sender")
                .size(Size::Sm)
                .variant(Variant::GhostMuted)
                .label(t(cx, "today.newSender.keep"))
                .on_click(answer(
                    cx,
                    row(),
                    "today/keepSender",
                    json!({ "messageId": sender["messageId"] }),
                ))
                .into_any_element(),
            Button::new("unsubscribe-sender")
                .size(Size::Sm)
                .variant(Variant::Secondary)
                .label(t(cx, "actionKind.unsubscribe"))
                .on_click(answer(
                    cx,
                    row(),
                    "subscriptions/unsubscribe",
                    json!({ "messageId": sender["messageId"] }),
                ))
                .into_any_element(),
            Button::new("archive-sender")
                .size(Size::Sm)
                .label(t(cx, "today.newSender.archive"))
                .on_click(answer(
                    cx,
                    row(),
                    "rules/createSimple",
                    json!({ "effect": "archive", "match": { "field": "from", "value": from } }),
                ))
                .into_any_element(),
        ];
        let title = div()
            .flex()
            .items_center()
            .gap_2()
            .font_weight(FontWeight::MEDIUM)
            .child(name.clone())
            .child(
                div()
                    .text_xs_()
                    .font_weight(FontWeight::NORMAL)
                    .text_color(theme.muted_foreground)
                    .child(t(cx, "today.newSender.label")),
            )
            .into_any_element();
        self.offer_card(
            Self::avatar(&name, 24., cx),
            title,
            lead.into(),
            buttons,
            cx,
        )
    }

    fn rule_offer(&self, rule: Value, cx: &mut Context<Self>) -> AnyElement {
        let theme = *theme(cx);
        let rule_id = rule["id"].clone();
        let row = || ("ruleOffers", "id", rule_id.clone());
        let input = |enabled: bool| json!({ "id": rule_id, "enabled": enabled });
        let effect = rule["effect"].as_str().unwrap_or_default();
        let title = div()
            .flex()
            .items_center()
            .gap_2()
            .font_weight(FontWeight::MEDIUM)
            .child(text(&rule["instruction"]).unwrap_or_default())
            .child(
                div()
                    .text_xs_()
                    .font_weight(FontWeight::NORMAL)
                    .text_color(theme.muted_foreground)
                    .child(t(cx, &format!("rules.effect.{effect}"))),
            )
            .into_any_element();
        let buttons = vec![
            Button::new(SharedString::from(format!("keep-off-{rule_id}")))
                .size(Size::Sm)
                .variant(Variant::GhostMuted)
                .label(t(cx, "today.ruleOffer.no"))
                .on_click(answer(cx, row(), "rules/update", input(false)))
                .into_any_element(),
            Button::new(SharedString::from(format!("turn-on-{rule_id}")))
                .size(Size::Sm)
                .label(t(cx, "today.ruleOffer.yes"))
                .on_click(answer(cx, row(), "rules/update", input(true)))
                .into_any_element(),
        ];
        self.offer_card(
            icon("RepeatIcon").into_any_element(),
            title,
            t(cx, "today.ruleOffer.lead"),
            buttons,
            cx,
        )
    }

    fn worth_card(&self, cx: &App) -> Option<AnyElement> {
        let (recent, dates, awaiting) = (
            self.home.list("recent"),
            self.home.list("dates"),
            self.home.list("awaiting"),
        );
        if recent.is_empty() && dates.is_empty() && awaiting.is_empty() {
            return None;
        }
        let parts: Vec<String> = [
            ("important", recent.len()),
            ("dated", dates.len()),
            ("awaiting", awaiting.len()),
        ]
        .into_iter()
        .filter(|(_, count)| *count > 0)
        .map(|(part, count)| tf(cx, &format!("today.worth.{part}"), &[json!(count)]).to_string())
        .collect();
        let mut lead = parts.join(", ");
        if let Some(first) = lead.get(0..1).map(str::to_uppercase) {
            lead.replace_range(0..1, &first);
        }
        let rows = recent
            .iter()
            .chain(dates.iter())
            .map(|row| {
                (
                    Self::sender_name(&row["message"]),
                    text(&row["analysis"]["summary"]).unwrap_or_default(),
                )
            })
            .chain(awaiting.iter().map(|row| {
                let to = json!({ "fromEmail": row["to"][0], "fromName": row["toName"] });
                (
                    Self::sender_name(&to),
                    format!(
                        "{} · {}",
                        t(cx, "today.awaiting"),
                        row["subject"].as_str().unwrap_or_default()
                    )
                    .into(),
                )
            }))
            .collect();
        Some(self.home_card(
            t(cx, "today.worthKnowing"),
            format!("{lead}.").into(),
            rows,
            false,
            Vec::new(),
            cx,
        ))
    }

    pub fn render_home(
        &mut self,
        _window: &mut Window,
        cx: &mut Context<Self>,
    ) -> impl IntoElement {
        let theme = *theme(cx);
        let date = self
            .home
            .today
            .as_ref()
            .map(|_| cx.global::<I18n>().today());
        div()
            .id("home")
            .size_full()
            .overflow_y_scroll()
            .key_context("Home")
            .on_action(cx.listener(|workspace, _: &Next, _, cx| {
                let stops = workspace.home.stops();
                if stops > 0 {
                    workspace.home.cursor = Some(
                        workspace
                            .home
                            .cursor
                            .map_or(0, |cursor| (cursor + 1).min(stops - 1)),
                    );
                    cx.notify();
                }
            }))
            .on_action(cx.listener(|workspace, _: &Previous, _, cx| {
                if workspace.home.stops() > 0 {
                    workspace.home.cursor = Some(
                        workspace
                            .home
                            .cursor
                            .map_or(0, |cursor| cursor.saturating_sub(1)),
                    );
                    cx.notify();
                }
            }))
            .on_action(cx.listener(|workspace, _: &Approve, _, cx| workspace.run_cursor(cx)))
            .on_action(cx.listener(|workspace, _: &Skip, _, cx| {
                if let Some(card) = workspace.home.cursor_card() {
                    let card_id = id(card);
                    workspace.skip(card_id, cx);
                }
            }))
            .on_action(cx.listener(|workspace, _: &Toggle, _, cx| {
                if let Some(card) = workspace.home.cursor_card() {
                    let card_id = id(card);
                    workspace.home.open = (workspace.home.open.as_deref()
                        != Some(card_id.as_str()))
                    .then_some(card_id);
                    cx.notify();
                }
            }))
            .on_action(cx.listener(|workspace, _: &OpenEmail, _, cx| {
                if let Some(card) = workspace.home.cursor_card().cloned() {
                    workspace.open_email(&card, cx);
                }
            }))
            .on_action(cx.listener(|workspace, _: &ApproveAllTidy, _, cx| {
                if workspace.home.has_proposals() {
                    workspace.approve_all_tidy(cx);
                }
            }))
            .child(
                div()
                    .mx_auto()
                    .max_w(px(768.))
                    .w_full()
                    .flex()
                    .flex_col()
                    .gap_8()
                    .px_10()
                    .pt_12()
                    .pb_16()
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap_3()
                            .child(
                                div()
                                    .min_h_8()
                                    .flex()
                                    .items_center()
                                    .text_sm_()
                                    .text_color(theme.muted_foreground)
                                    .children(date),
                            )
                            .child(match &self.home.today {
                                None => div()
                                    .h_9()
                                    .w(gpui::relative(0.6))
                                    .my_1()
                                    .rounded(px(radius::MD))
                                    .bg(theme.foreground.opacity(0.1)),
                                Some(_) => div().text_display().child(self.headline(cx)),
                            })
                            .child(
                                div()
                                    .text_brief()
                                    .text_color(theme.foreground.opacity(0.8))
                                    .child(self.lead(cx)),
                            ),
                    )
                    .children(self.decisions(cx))
                    .children(self.worth_card(cx)),
            )
    }
}
