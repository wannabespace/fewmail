mod update;

use std::rc::Rc;

use futures::{StreamExt, channel::mpsc};
use gpui::{
    App, AppContext, Application, Bounds, Context, Entity, KeyBinding, Menu, MenuItem, OsAction,
    Render, Rgba, TitlebarOptions, Window, WindowAppearance, WindowBounds, WindowOptions, actions,
    canvas, div, point, prelude::*, px, rgb, size,
};
use wry::{NewWindowResponse, WebViewBuilder, dpi, http::Uri};

/// The app is the web app: `cargo run` opens the local dev server, a release build fewmail.app.
const WEB_URL: &str = match option_env!("FEWMAIL_WEB_URL") {
    Some(url) => url,
    None if cfg!(debug_assertions) => "https://app.local.fewmail.app",
    None => "https://fewmail.app",
};
const TITLEBAR_HEIGHT: f32 = 32.;
/// `--body` in `packages/ui/src/styles/globals.css`, shown until the page reports its own.
const LIGHT_BODY: u32 = 0xf4efe6;
const DARK_BODY: u32 = 0x171412;

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
        Reload,
        Cut,
        Copy,
        Paste,
        SelectAll
    ]
);

enum Event {
    /// A message the page sent through `window.ipc.postMessage` (`apps/web/src/lib/desktop.ts`).
    Page(String),
    PageLoaded,
    OpenUrls(Vec<String>),
    OpenExternally(String),
}

type Events = mpsc::UnboundedSender<Event>;

fn is_fewmail(uri: &Uri) -> bool {
    uri.host()
        .is_some_and(|host| host == "fewmail.app" || host.ends_with(".fewmail.app"))
}

/// Fewmail and Stripe's checkout stay in the window; Google refuses to sign in inside an embedded web view,
/// so its consent screens, like every other site and `mailto:`, open in the default browser.
fn stays_in_app(url: &str) -> bool {
    match url.split_once(':').map(|(scheme, _)| scheme) {
        Some("about" | "data" | "blob") => true,
        Some("http" | "https") => url.parse::<Uri>().is_ok_and(|uri| {
            is_fewmail(&uri)
                || matches!(
                    uri.host(),
                    Some("checkout.stripe.com" | "billing.stripe.com")
                )
        }),
        _ => false,
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

struct Shell {
    webview: Rc<wry::WebView>,
    titlebar: Rgba,
    /// Set when the page asked to sign in through the browser; the `fewmail://sign-in` link must carry it back,
    /// or any page could sign the app into someone else's account.
    sign_in_state: Option<String>,
}

impl Shell {
    fn new(events: Events, window: &mut Window, _cx: &mut Context<Self>) -> Self {
        let titlebar = rgb(match window.appearance() {
            WindowAppearance::Dark | WindowAppearance::VibrantDark => DARK_BODY,
            _ => LIGHT_BODY,
        });
        let to_ipc = events.clone();
        let to_navigation = events.clone();
        let to_popups = events.clone();
        let webview = WebViewBuilder::new()
            .with_url(format!("{WEB_URL}/home"))
            .with_background_color((
                (titlebar.r * 255.) as u8,
                (titlebar.g * 255.) as u8,
                (titlebar.b * 255.) as u8,
                255,
            ))
            .with_initialization_script(format!(
                "window.fewmailDesktop = {{ version: '{}' }};{}",
                env!("CARGO_PKG_VERSION"),
                include_str!("page.js")
            ))
            .with_ipc_handler(move |request| {
                if is_fewmail(request.uri()) {
                    let _ = to_ipc.unbounded_send(Event::Page(request.into_body()));
                }
            })
            .with_on_page_load_handler(move |event, _| {
                if matches!(event, wry::PageLoadEvent::Finished) {
                    let _ = events.unbounded_send(Event::PageLoaded);
                }
            })
            .with_navigation_handler(move |url| {
                let stays = stays_in_app(&url);
                if !stays {
                    let _ = to_navigation.unbounded_send(Event::OpenExternally(url));
                }
                stays
            })
            // Attachments open from the API with the session cookie, which only this web view has.
            .with_new_window_req_handler(move |url, _| {
                if url.parse::<Uri>().is_ok_and(|uri| is_fewmail(&uri)) {
                    return NewWindowResponse::Allow;
                }
                let _ = to_popups.unbounded_send(Event::OpenExternally(url));
                NewWindowResponse::Deny
            })
            .build_as_child(window)
            .expect("the web view should build");
        Self {
            webview: Rc::new(webview),
            titlebar,
            sign_in_state: None,
        }
    }

    fn handle(&mut self, event: Event, window: &mut Window, cx: &mut Context<Self>) {
        match event {
            Event::Page(message) => {
                let (kind, rest) = message.split_once(' ').unwrap_or((&message, ""));
                match kind {
                    "theme" => {
                        let channels: Vec<u8> = rest
                            .split(' ')
                            .filter_map(|part| part.parse().ok())
                            .collect();
                        if let [r, g, b] = channels[..] {
                            self.titlebar = rgb(u32::from_be_bytes([0, r, g, b]));
                            cx.notify();
                        }
                    }
                    "sign-in" if rest.starts_with(&format!("{WEB_URL}/desktop?")) => {
                        let state = random_state();
                        cx.open_url(&format!("{rest}&state={state}"));
                        self.sign_in_state = Some(state);
                    }
                    "install-update" => update::install(cx),
                    _ => {}
                }
            }
            Event::PageLoaded => {
                if update::is_ready(cx) {
                    self.announce_update();
                }
            }
            Event::OpenUrls(urls) => {
                for url in urls {
                    self.open_link(&url);
                }
                cx.activate(true);
                window.activate_window();
            }
            Event::OpenExternally(url) => cx.open_url(&url),
        }
    }

    fn open_link(&mut self, url: &str) {
        let Some(query) = url.strip_prefix("fewmail://sign-in?") else {
            return;
        };
        let state = query
            .split('&')
            .find_map(|pair| pair.strip_prefix("state="));
        if state.is_none() || state != self.sign_in_state.as_deref() {
            return;
        }
        self.sign_in_state = None;
        let _ = self.webview.load_url(&format!("{WEB_URL}/desktop?{query}"));
    }

    fn announce_update(&self) {
        let _ = self.webview.evaluate_script(
            "window.fewmailDesktop.updateReady = true; dispatchEvent(new Event('fewmail-desktop-update'))",
        );
    }
}

impl Render for Shell {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        let webview = self.webview.clone();
        div()
            .size_full()
            .flex()
            .flex_col()
            .bg(self.titlebar)
            .child(div().h(px(TITLEBAR_HEIGHT)).flex_none())
            .child(
                canvas(
                    move |bounds, _, _| {
                        let _ = webview.set_bounds(wry::Rect {
                            position: dpi::LogicalPosition::new(
                                f32::from(bounds.origin.x),
                                f32::from(bounds.origin.y),
                            )
                            .into(),
                            size: dpi::LogicalSize::new(
                                f32::from(bounds.size.width),
                                f32::from(bounds.size.height),
                            )
                            .into(),
                        });
                    },
                    |_, _, _, _| {},
                )
                .flex_1()
                .w_full(),
            )
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
            name: "View".into(),
            items: vec![MenuItem::action("Reload", Reload)],
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

fn open_shell(events: Events, cx: &mut App) -> Entity<Shell> {
    let options = WindowOptions {
        titlebar: Some(TitlebarOptions {
            title: Some("Fewmail".into()),
            appears_transparent: true,
            traffic_light_position: Some(point(px(12.), px(10.))),
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
            // Closing keeps the page alive, so live updates and the session carry on behind the Dock icon.
            window.on_window_should_close(cx, |_, cx| {
                cx.hide();
                false
            });
            cx.new(|cx| Shell::new(events, window, cx))
        })
        .expect("the window should open");
    window.update(cx, |_, _, cx| cx.entity()).unwrap()
}

fn main() {
    let (events, mut received) = mpsc::unbounded();
    let app = Application::new();
    app.on_open_urls({
        let events = events.clone();
        move |urls| {
            let _ = events.unbounded_send(Event::OpenUrls(urls));
        }
    })
    .on_reopen(|cx| cx.activate(true));
    app.run(move |cx| {
        cx.bind_keys([
            KeyBinding::new("cmd-q", Quit, None),
            KeyBinding::new("cmd-h", Hide, None),
            KeyBinding::new("alt-cmd-h", HideOthers, None),
            KeyBinding::new("cmd-w", CloseWindow, None),
            KeyBinding::new("cmd-m", Minimize, None),
            KeyBinding::new("cmd-r", Reload, None),
            KeyBinding::new("cmd-x", Cut, None),
            KeyBinding::new("cmd-c", Copy, None),
            KeyBinding::new("cmd-v", Paste, None),
            KeyBinding::new("cmd-a", SelectAll, None),
        ]);
        cx.set_menus(menus());
        cx.on_action(|_: &Quit, cx| cx.quit());
        cx.on_action(|_: &Hide, cx| cx.hide());
        cx.on_action(|_: &HideOthers, cx| cx.hide_other_apps());
        cx.on_action(|_: &ShowAll, cx| cx.unhide_other_apps());
        cx.on_action(|_: &CloseWindow, cx| cx.hide());

        let shell = open_shell(events.clone(), cx);
        let window = cx.windows()[0];
        cx.on_action({
            let shell = shell.clone();
            move |_: &Reload, cx| {
                let _ = shell.read(cx).webview.reload();
            }
        });
        cx.on_action(move |_: &Minimize, cx| {
            let _ = window.update(cx, |_, window, _| window.minimize_window());
        });
        cx.on_action(move |_: &Zoom, cx| {
            let _ = window.update(cx, |_, window, _| window.zoom_window());
        });

        update::watch(
            {
                let shell = shell.clone();
                move |cx| shell.read(cx).announce_update()
            },
            cx,
        );
        cx.on_app_quit(|cx| {
            update::install_on_quit(cx);
            async {}
        })
        .detach();

        cx.spawn(async move |cx| {
            while let Some(event) = received.next().await {
                let _ = window.update(cx, |_, window, cx| {
                    shell.update(cx, |shell, cx| shell.handle(event, window, cx));
                });
            }
        })
        .detach();
        cx.activate(true);
    });
}
