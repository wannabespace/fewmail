mod api;
mod home;
mod i18n;
mod sidebar;
mod sign_in;
mod theme;
mod ui;
mod update;
mod workspace;

use std::borrow::Cow;

use futures::{StreamExt, channel::mpsc};
use gpui::{
    AnyView, AppContext, Application, AssetSource, Bounds, Context, KeyBinding, Menu, MenuItem,
    OsAction, Render, SharedString, TitlebarOptions, Window, WindowBounds, WindowOptions, actions,
    div, point, prelude::*, px, size,
};

use crate::{api::Session, i18n::I18n, sign_in::SignIn, theme::theme, workspace::Workspace};

actions!(
    fewmail,
    [
        Quit,
        Hide,
        HideOthers,
        ShowAll,
        CloseWindow,
        Minimize,
        Zoom,
        Cut,
        Copy,
        Paste,
        SelectAll
    ]
);

macro_rules! embed {
    ($($path:literal),* $(,)?) => {
        fn embedded(path: &str) -> Option<&'static [u8]> {
            match path {
                $($path => Some(include_bytes!(concat!("../assets/", $path))),)*
                _ => None,
            }
        }
    };
}

embed!(
    "fonts/Inter-Regular.ttf",
    "fonts/Inter-Medium.ttf",
    "fonts/Inter-SemiBold.ttf",
    "fonts/Inter-Bold.ttf",
    "fonts/Lora-Regular.ttf",
    "fonts/Lora-Medium.ttf",
    "fonts/Lora-SemiBold.ttf",
    "fonts/Lora-Italic.ttf",
    "logo/lockup.svg",
    "logo/google.svg",
);

struct Assets;

impl AssetSource for Assets {
    fn load(&self, path: &str) -> gpui::Result<Option<Cow<'static, [u8]>>> {
        if let Some(name) = path.strip_prefix("icons/") {
            return Ok(ui::ICONS
                .iter()
                .find(|(icon, _)| Some(*icon) == name.strip_suffix(".svg"))
                .map(|(_, svg)| Cow::Borrowed(svg.as_bytes())));
        }
        Ok(embedded(path).map(Cow::Borrowed))
    }

    fn list(&self, _path: &str) -> gpui::Result<Vec<SharedString>> {
        Ok(Vec::new())
    }
}

enum Event {
    OpenUrls(Vec<String>),
}

/// Signed out it shows the sign-in page, signed in the app; a `fewmail://sign-in` link moves from one to the other.
struct Root {
    sign_in: Option<gpui::Entity<SignIn>>,
    workspace: Option<gpui::Entity<Workspace>>,
}

impl Root {
    fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let mut root = Self {
            sign_in: None,
            workspace: None,
        };
        match Session::stored() {
            Some(session) => root.open_workspace(session, window, cx),
            None => root.open_sign_in(cx),
        }
        root
    }

    fn open_sign_in(&mut self, cx: &mut Context<Self>) {
        self.workspace = None;
        self.sign_in = Some(cx.new(SignIn::new));
    }

    fn open_workspace(&mut self, session: Session, window: &mut Window, cx: &mut Context<Self>) {
        self.sign_in = None;
        let workspace = cx.new(|cx| Workspace::new(session, window, cx));
        cx.subscribe_in(
            &workspace,
            window,
            |root, _, workspace::SignedOut, _, cx| {
                root.open_sign_in(cx);
                cx.notify();
            },
        )
        .detach();
        self.workspace = Some(workspace);
    }

    fn open_link(&mut self, url: &str, window: &mut Window, cx: &mut Context<Self>) {
        let Some(sign_in) = &self.sign_in else {
            return;
        };
        let Some(token) = sign_in.read(cx).token_from(url) else {
            return;
        };
        let task = cx
            .background_executor()
            .spawn(async move { Session::redeem(&token) });
        cx.spawn_in(window, async move |root, cx| {
            let redeemed = task.await;
            root.update_in(cx, |root, window, cx| {
                match redeemed {
                    Ok(session) => root.open_workspace(session, window, cx),
                    Err(error) => eprintln!("sign-in failed: {error:?}"),
                }
                cx.notify();
            })
        })
        .detach();
    }
}

impl Render for Root {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        cx.set_global(theme::for_appearance(window.appearance()));
        let content: AnyView = match (&self.workspace, &self.sign_in) {
            (Some(workspace), _) => workspace.clone().into(),
            (_, Some(sign_in)) => sign_in.clone().into(),
            _ => unreachable!("Root always shows one of the two"),
        };
        div()
            .size_full()
            .bg(theme(cx).body)
            .text_color(theme(cx).foreground)
            .font_family(ui::SANS)
            .child(content)
    }
}

fn menus() -> Vec<Menu> {
    vec![
        Menu {
            name: "Fewmail".into(),
            items: vec![
                MenuItem::action("Hide Fewmail", Hide),
                MenuItem::action("Hide Others", HideOthers),
                MenuItem::action("Show All", ShowAll),
                MenuItem::separator(),
                MenuItem::action("Quit Fewmail", Quit),
            ],
        },
        Menu {
            name: "Edit".into(),
            items: vec![
                MenuItem::os_action("Cut", Cut, OsAction::Cut),
                MenuItem::os_action("Copy", Copy, OsAction::Copy),
                MenuItem::os_action("Paste", Paste, OsAction::Paste),
                MenuItem::os_action("Select All", SelectAll, OsAction::SelectAll),
            ],
        },
        Menu {
            name: "Window".into(),
            items: vec![
                MenuItem::action("Minimize", Minimize),
                MenuItem::action("Zoom", Zoom),
                MenuItem::separator(),
                MenuItem::action("Close Window", CloseWindow),
            ],
        },
    ]
}

fn main() {
    let (events, mut received) = mpsc::unbounded();
    let app = Application::new().with_assets(Assets);
    app.on_open_urls(move |urls| {
        let _ = events.unbounded_send(Event::OpenUrls(urls));
    })
    .on_reopen(|cx| cx.activate(true));
    app.run(move |cx| {
        cx.text_system()
            .add_fonts(
                [
                    "Inter-Regular",
                    "Inter-Medium",
                    "Inter-SemiBold",
                    "Inter-Bold",
                    "Lora-Regular",
                    "Lora-Medium",
                    "Lora-SemiBold",
                    "Lora-Italic",
                ]
                .iter()
                .filter_map(|name| embedded(&format!("fonts/{name}.ttf")))
                .map(Cow::Borrowed)
                .collect(),
            )
            .expect("the fonts are embedded");
        cx.set_global(I18n::new());
        cx.set_global(theme::for_appearance(gpui::WindowAppearance::Light));
        cx.bind_keys([
            KeyBinding::new("cmd-q", Quit, None),
            KeyBinding::new("cmd-h", Hide, None),
            KeyBinding::new("alt-cmd-h", HideOthers, None),
            KeyBinding::new("cmd-w", CloseWindow, None),
            KeyBinding::new("cmd-m", Minimize, None),
            KeyBinding::new("cmd-x", Cut, None),
            KeyBinding::new("cmd-c", Copy, None),
            KeyBinding::new("cmd-v", Paste, None),
            KeyBinding::new("cmd-a", SelectAll, None),
        ]);
        workspace::bind_keys(cx);
        home::bind_keys(cx);
        cx.set_menus(menus());
        cx.on_action(|_: &Quit, cx| cx.quit());
        cx.on_action(|_: &Hide, cx| cx.hide());
        cx.on_action(|_: &HideOthers, cx| cx.hide_other_apps());
        cx.on_action(|_: &ShowAll, cx| cx.unhide_other_apps());
        cx.on_action(|_: &CloseWindow, cx| cx.hide());

        let options = WindowOptions {
            titlebar: Some(TitlebarOptions {
                title: Some("Fewmail".into()),
                appears_transparent: true,
                traffic_light_position: Some(point(px(16.), px(16.))),
            }),
            window_bounds: Some(WindowBounds::Windowed(Bounds::centered(
                None,
                size(px(1280.), px(840.)),
                cx,
            ))),
            window_min_size: Some(size(px(720.), px(480.))),
            app_id: Some("app.fewmail.desktop".into()),
            ..Default::default()
        };
        let window = cx
            .open_window(options, |window, cx| {
                // Closing keeps the app signed in and listening behind the Dock icon.
                window.on_window_should_close(cx, |_, cx| {
                    cx.hide();
                    false
                });
                window
                    .observe_window_appearance(|window, _| window.refresh())
                    .detach();
                cx.new(|cx| Root::new(window, cx))
            })
            .expect("the window should open");
        cx.on_action(move |_: &Minimize, cx| {
            let _ = window.update(cx, |_, window, _| window.minimize_window());
        });
        cx.on_action(move |_: &Zoom, cx| {
            let _ = window.update(cx, |_, window, _| window.zoom_window());
        });

        update::watch(
            move |cx| {
                let _ = window.update(cx, |root, _, cx| {
                    if let Some(workspace) = &root.workspace {
                        workspace.update(cx, |_, cx| cx.notify());
                    }
                });
            },
            cx,
        );
        cx.on_app_quit(|cx| {
            update::install_on_quit(cx);
            async {}
        })
        .detach();

        cx.spawn(async move |cx| {
            while let Some(Event::OpenUrls(urls)) = received.next().await {
                let _ = window.update(cx, |root, window, cx| {
                    for url in &urls {
                        root.open_link(url, window, cx);
                    }
                    cx.activate(true);
                    window.activate_window();
                });
            }
        })
        .detach();
        cx.activate(true);
    });
}
