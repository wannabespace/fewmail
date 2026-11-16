//! The kit (`packages/ui`) rebuilt in GPUI: sizes, radii and variants carry the web's names and values.

use gpui::{
    App, BoxShadow, ClickEvent, ElementId, Hsla, IntoElement, ParentElement, RenderOnce,
    SharedString, Styled, Svg, Window, div, point, prelude::*, px, svg,
};

use crate::theme::{Theme, theme};

include!(concat!(env!("OUT_DIR"), "/icons.rs"));

pub const SANS: &str = "Inter";
pub const SERIF: &str = "Lora";

/// `--radius` is 0.55rem; the kit's steps multiply it.
pub mod radius {
    pub const MD: f32 = 8.8 * 0.8;
    pub const LG: f32 = 8.8;
    pub const XL: f32 = 8.8 * 1.4;
    pub const XXL: f32 = 8.8 * 1.8;
    pub const XXXL: f32 = 8.8 * 2.2;
}

/// The `@theme` type scale: size and line height in px.
pub trait Text: Styled + Sized {
    fn text_2xs_(self) -> Self {
        self.text_size(px(11.)).line_height(px(14.))
    }
    fn text_xs_(self) -> Self {
        self.text_size(px(12.)).line_height(px(16.))
    }
    fn text_sm_(self) -> Self {
        self.text_size(px(14.)).line_height(px(20.))
    }
    fn text_base_(self) -> Self {
        self.text_size(px(16.)).line_height(px(24.))
    }
    fn text_brief(self) -> Self {
        self.text_size(px(19.))
            .line_height(px(19. * 1.55))
            .font_family(SERIF)
    }
    fn text_display(self) -> Self {
        self.text_size(px(40.))
            .line_height(px(44.))
            .font_family(SERIF)
    }
}

impl<T: Styled> Text for T {}

/// A Hugeicon by its web name (`Home01Icon`), or an asset path such as `logo/google.svg`.
pub fn icon(name: &'static str) -> Svg {
    let path = if name.contains('/') {
        name.to_string()
    } else {
        format!("icons/{name}.svg")
    };
    svg().path(path).size_4().flex_none()
}

/// `color-mix(in oklab, a, b t)`, close enough in sRGB for the kit's hover tints.
pub fn mix(a: Hsla, b: Hsla, t: f32) -> Hsla {
    let (a, b) = (a.to_rgb(), b.to_rgb());
    gpui::Rgba {
        r: a.r + (b.r - a.r) * t,
        g: a.g + (b.g - a.g) * t,
        b: a.b + (b.b - a.b) * t,
        a: a.a + (b.a - a.a) * t,
    }
    .into()
}

/// `shadow-xs`: warm brown in light, black in dark.
pub fn shadow_xs(theme: &Theme) -> Vec<BoxShadow> {
    vec![BoxShadow {
        color: shadow_tint(theme, 0.03),
        offset: point(px(0.), px(2.)),
        blur_radius: px(4.),
        spread_radius: px(0.),
    }]
}

/// `shadow-sm`: the lifted card.
pub fn shadow_sm(theme: &Theme) -> Vec<BoxShadow> {
    vec![
        BoxShadow {
            color: shadow_tint(theme, 0.08),
            offset: point(px(0.), px(4.)),
            blur_radius: px(12.),
            spread_radius: px(-2.),
        },
        BoxShadow {
            color: shadow_tint(theme, 0.04),
            offset: point(px(0.), px(1.)),
            blur_radius: px(2.),
            spread_radius: px(0.),
        },
    ]
}

fn shadow_tint(theme: &Theme, alpha: f32) -> Hsla {
    if theme.is_dark {
        gpui::black().opacity(alpha * 4.)
    } else {
        Hsla::from(gpui::rgba(0x3c2814ff)).opacity(alpha)
    }
}

#[derive(Clone, Copy, PartialEq)]
pub enum Variant {
    Default,
    Secondary,
    Outline,
    GhostMuted,
}

#[derive(Clone, Copy, PartialEq)]
pub enum Size {
    Xs,
    Sm,
    Default,
    Lg,
    IconSm,
}

#[derive(IntoElement)]
pub struct Button {
    id: ElementId,
    label: Option<SharedString>,
    icon: Option<&'static str>,
    variant: Variant,
    size: Size,
    on_click: Option<Box<dyn Fn(&ClickEvent, &mut Window, &mut App)>>,
}

impl Button {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            label: None,
            icon: None,
            variant: Variant::Default,
            size: Size::Default,
            on_click: None,
        }
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    pub fn icon(mut self, icon: &'static str) -> Self {
        self.icon = Some(icon);
        self
    }

    pub fn variant(mut self, variant: Variant) -> Self {
        self.variant = variant;
        self
    }

    pub fn size(mut self, size: Size) -> Self {
        self.size = size;
        self
    }

    pub fn on_click(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Box::new(handler));
        self
    }
}

impl RenderOnce for Button {
    fn render(self, _window: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = *theme(cx);
        let (height, padding, radius_px, gap) = match self.size {
            Size::Xs => (24., 10., radius::MD, 4.),
            Size::Sm => (28., 12., radius::LG, 4.),
            Size::Default => (32., 12., radius::XL, 6.),
            Size::Lg => (36., 16., radius::XL, 6.),
            Size::IconSm => (28., 0., radius::LG, 0.),
        };
        let (background, text, hover) = match self.variant {
            Variant::Default => (
                theme.primary,
                theme.primary_foreground,
                mix(theme.primary, theme.foreground, 0.12),
            ),
            Variant::Secondary => (
                theme.secondary,
                theme.foreground,
                mix(theme.secondary, theme.foreground, 0.05),
            ),
            Variant::Outline => (theme.input, theme.foreground, theme.accent_popover),
            Variant::GhostMuted => (
                gpui::transparent_black(),
                theme.muted_foreground,
                theme.accent,
            ),
        };
        let is_icon = self.size == Size::IconSm;
        let mut button = div()
            .id(self.id)
            .flex()
            .flex_none()
            .items_center()
            .justify_center()
            .gap(px(gap))
            .h(px(height))
            .when(is_icon, |button| button.w(px(height)))
            .px(px(padding))
            .rounded(px(radius_px))
            .border_1()
            .border_color(gpui::transparent_black())
            .bg(background)
            .text_color(text)
            .map(|button| {
                if self.size == Size::Xs {
                    button.text_xs_()
                } else {
                    button.text_sm_()
                }
            })
            .cursor_pointer()
            .hover(move |style| {
                let style = style.bg(hover);
                if self.variant == Variant::GhostMuted {
                    style.text_color(theme.foreground)
                } else {
                    style
                }
            })
            .when(self.variant == Variant::Outline, |button| {
                button.border_color(theme.border).shadow(shadow_xs(&theme))
            })
            .when_some(self.icon, |button, name| {
                button.child(
                    icon(name)
                        .text_color(text)
                        .when(self.size == Size::Xs, |svg| svg.size_3()),
                )
            })
            .when_some(self.label, |button, label| button.child(label));
        if let Some(handler) = self.on_click {
            button = button.on_click(handler);
        }
        button
    }
}

/// `Select` with the `outline` trigger: the trigger, and under it while open the list, which closes on a pick or a click outside.
#[derive(IntoElement)]
pub struct Select {
    id: ElementId,
    value: SharedString,
    options: Vec<(SharedString, SharedString)>,
    is_open: bool,
    width: f32,
    on_toggle: Box<dyn Fn(&bool, &mut Window, &mut App)>,
    on_pick: std::rc::Rc<dyn Fn(&SharedString, &mut Window, &mut App)>,
}

impl Select {
    /// `options` are (value, label) pairs.
    pub fn new(
        id: impl Into<ElementId>,
        value: impl Into<SharedString>,
        options: Vec<(SharedString, SharedString)>,
        is_open: bool,
        on_toggle: impl Fn(&bool, &mut Window, &mut App) + 'static,
        on_pick: impl Fn(&SharedString, &mut Window, &mut App) + 'static,
    ) -> Self {
        Self {
            id: id.into(),
            value: value.into(),
            options,
            is_open,
            width: 192.,
            on_toggle: Box::new(on_toggle),
            on_pick: std::rc::Rc::new(on_pick),
        }
    }
}

impl RenderOnce for Select {
    fn render(self, _window: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = *theme(cx);
        let label = self
            .options
            .iter()
            .find(|(value, _)| *value == self.value)
            .map(|(_, label)| label.clone())
            .unwrap_or_default();
        let is_open = self.is_open;
        let on_toggle = std::rc::Rc::new(self.on_toggle);
        let close = on_toggle.clone();
        div()
            .relative()
            .child(
                div()
                    .id(self.id)
                    .flex()
                    .items_center()
                    .justify_between()
                    .gap(px(6.))
                    .w(px(self.width))
                    .h(px(32.))
                    .px_3()
                    .rounded(px(radius::XL))
                    .border_1()
                    .border_color(theme.foreground.opacity(if is_open { 0.12 } else { 0.04 }))
                    .bg(if is_open {
                        theme.accent_popover
                    } else {
                        theme.input
                    })
                    .shadow(shadow_xs(&theme))
                    .text_sm_()
                    .cursor_pointer()
                    .hover(move |style| {
                        style
                            .bg(theme.accent_popover)
                            .border_color(theme.foreground.opacity(0.12))
                    })
                    .child(label)
                    .child(icon("ArrowDown01Icon").text_color(theme.muted_foreground))
                    .on_click(move |_, window, cx| on_toggle(&!is_open, window, cx)),
            )
            .when(is_open, |select| {
                let on_pick = self.on_pick.clone();
                select.child(
                    gpui::deferred(
                        gpui::anchored().snap_to_window_with_margin(px(8.)).child(
                            div()
                                .id("options")
                                .mt_1()
                                .w(px(self.width))
                                .max_h(px(320.))
                                .overflow_y_scroll()
                                .p_1()
                                .rounded(px(radius::XL))
                                .bg(theme.popover)
                                .border_1()
                                .border_color(theme.foreground.opacity(0.06))
                                .shadow(shadow_sm(&theme))
                                .on_mouse_down_out(move |_, window, cx| close(&false, window, cx))
                                .children(self.options.into_iter().map(|(value, label)| {
                                    let on_pick = on_pick.clone();
                                    let is_current = value == self.value;
                                    div()
                                        .id(value.clone())
                                        .flex()
                                        .items_center()
                                        .justify_between()
                                        .h(px(32.))
                                        .px_2()
                                        .rounded(px(radius::LG))
                                        .text_sm_()
                                        .cursor_pointer()
                                        .hover(move |row| row.bg(theme.accent_popover))
                                        .child(label)
                                        .when(is_current, |row| row.child(icon("Tick02Icon")))
                                        .on_click(move |_, window, cx| on_pick(&value, window, cx))
                                })),
                        ),
                    )
                    .with_priority(1),
                )
            })
    }
}
