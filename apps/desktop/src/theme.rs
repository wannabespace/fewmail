use gpui::{App, Global, Hsla, WindowAppearance, rgba};

/// The tokens of `packages/ui/src/styles/globals.css` in sRGB: a change there changes this table too.
#[derive(Clone, Copy)]
pub struct Theme {
    pub body: Hsla,
    pub background: Hsla,
    pub foreground: Hsla,
    pub popover: Hsla,
    pub primary: Hsla,
    pub primary_foreground: Hsla,
    pub secondary: Hsla,
    pub muted: Hsla,
    pub muted_foreground: Hsla,
    pub accent: Hsla,
    pub destructive: Hsla,
    pub border: Hsla,
    pub input: Hsla,
    pub accent_surface: Hsla,
    pub accent_popover: Hsla,
    pub is_dark: bool,
}

impl Global for Theme {}

fn light() -> Theme {
    Theme {
        body: rgba(0xf3eee5ff).into(),
        background: rgba(0xfbf9f4ff).into(),
        foreground: rgba(0x1e1a15ff).into(),
        popover: rgba(0xfffdfaff).into(),
        primary: rgba(0xb84a27ff).into(),
        primary_foreground: rgba(0xfefaf3ff).into(),
        secondary: rgba(0xe6ddceff).into(),
        muted: rgba(0xf0eae1ff).into(),
        muted_foreground: rgba(0x6b6157ff).into(),
        accent: rgba(0xece4d8ff).into(),
        destructive: rgba(0xcc2827ff).into(),
        border: rgba(0x46372b1f).into(),
        input: rgba(0xfffdfaff).into(),
        accent_surface: rgba(0xf2ece2ff).into(),
        accent_popover: rgba(0xf4efe7ff).into(),
        is_dark: false,
    }
}

fn dark() -> Theme {
    Theme {
        body: rgba(0x171310ff).into(),
        background: rgba(0x1d1915ff).into(),
        foreground: rgba(0xf2eee7ff).into(),
        popover: rgba(0x221d19ff).into(),
        primary: rgba(0xe4744bff).into(),
        primary_foreground: rgba(0x15110dff).into(),
        secondary: rgba(0x302a25ff).into(),
        muted: rgba(0x191512ff).into(),
        muted_foreground: rgba(0xaaa39aff).into(),
        accent: rgba(0x25211dff).into(),
        destructive: rgba(0xf3625dff).into(),
        border: rgba(0xfffef012).into(),
        input: rgba(0x241f1cff).into(),
        accent_surface: rgba(0x25211dff).into(),
        accent_popover: rgba(0x292420ff).into(),
        is_dark: true,
    }
}

pub fn for_appearance(appearance: WindowAppearance) -> Theme {
    match appearance {
        WindowAppearance::Dark | WindowAppearance::VibrantDark => dark(),
        _ => light(),
    }
}

pub fn theme(cx: &App) -> &Theme {
    cx.global::<Theme>()
}
