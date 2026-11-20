use std::collections::HashMap;
use std::sync::atomic::{AtomicI32, Ordering};
use std::sync::{Arc, Mutex, Once};
use std::time::Duration;

use serde::Deserialize;
use tauri::menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::webview::{NewWindowResponse, PageLoadEvent};
use tauri::{
    AppHandle, Manager, RunEvent, Runtime, State, Url, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder, WindowEvent,
};
use tauri_plugin_autostart::ManagerExt as _;
use tauri_plugin_deep_link::DeepLinkExt as _;
use tauri_plugin_dialog::{DialogExt as _, MessageDialogButtons};
use tauri_plugin_notification::NotificationExt as _;
use tauri_plugin_opener::OpenerExt as _;
use tauri_plugin_updater::UpdaterExt as _;

#[cfg(target_os = "macos")]
mod mail_app;

const MAIN: &str = "main";
const UPDATE_CHECK: Duration = Duration::from_secs(4 * 60 * 60);
/** Past this the window shows even if the page never finished (offline), so the app is never invisible. */
const FIRST_LOAD_WAIT: Duration = Duration::from_secs(3);

/** What the page hands over for a notification (`notifyDesktop` in the web's `lib/desktop.ts`). */
#[derive(Deserialize)]
struct Notice {
    body: String,
    title: String,
    url: String,
}

/** The page each shown notification opens when clicked, by its id. */
#[derive(Default)]
struct Notices {
    next: AtomicI32,
    urls: Mutex<HashMap<i32, String>>,
}

/** The update prompt's words, from the web's own messages (`scripts/strings.ts`). */
#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Strings {
    available: String,
    not_now: String,
    reload: String,
}

fn strings() -> Strings {
    let all: HashMap<String, Strings> =
        serde_json::from_str(include_str!("../strings.json")).expect("strings.json");
    sys_locale::get_locales()
        .find_map(|locale| {
            let language = locale.split(['-', '_']).next()?;
            all.get(language).cloned()
        })
        .unwrap_or_else(|| all["en"].clone())
}

fn is_ours(url: &Url) -> bool {
    url.scheme() == "https"
        && url
            .host_str()
            .is_some_and(|host| host == "fewmail.app" || host.ends_with(".fewmail.app"))
}

/** Our own pages stay in the app, but `/desktop`: the app signs in there, in the browser, whose Google session Google allows. */
fn stays_in_app(url: &Url) -> bool {
    is_ours(url) && url.path() != "/desktop"
}

fn show<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window(MAIN) {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

/** A path of the app (a notification's `url`, Compose) opened in the window without reloading the page. */
fn show_path<R: Runtime>(app: &AppHandle<R>, path: &str) {
    if let Some(window) = app.get_webview_window(MAIN) {
        let path = serde_json::to_string(path).expect("a string");
        let _ = window.eval(format!(
            "history.pushState({{}}, '', {path}); dispatchEvent(new PopStateEvent('popstate'))"
        ));
    }
    show(app);
}

/** A `mailto:` link opens Compose with it, from an email here or from any app once Fewmail is the email app. */
fn compose_path(link: &Url) -> String {
    let link: String = url::form_urlencoded::byte_serialize(link.as_str().as_bytes()).collect();
    format!("/compose?mailto={link}")
}

/** Every link that leaves the app: `mailto:` to Compose, the rest to the default browser. */
fn leave<R: Runtime>(app: &AppHandle<R>, url: &Url) {
    if url.scheme() == "mailto" {
        show_path(app, &compose_path(url));
    } else if matches!(url.scheme(), "http" | "https" | "tel") {
        let _ = app.opener().open_url(url.as_str(), None::<&str>);
    }
}

#[tauri::command]
fn notify(app: AppHandle, notices: State<'_, Notices>, notice: Notice) {
    let id = notices.next.fetch_add(1, Ordering::Relaxed);
    notices.urls.lock().expect("notices").insert(id, notice.url);
    let _ = app
        .notification()
        .builder()
        .id(id)
        .title(notice.title)
        .body(notice.body)
        .show();
}

#[tauri::command]
fn set_badge(window: WebviewWindow, count: i64) {
    #[cfg(target_os = "windows")]
    {
        // Windows counts nothing on a taskbar button: a dot in Fewmail's color says something waits.
        let dot = (count > 0).then(|| {
            tauri::image::Image::from_bytes(include_bytes!("../icons/badge.png"))
                .expect("badge.png")
        });
        let _ = window.set_overlay_icon(dot);
    }
    #[cfg(not(target_os = "windows"))]
    let _ = window.set_badge_count((count > 0).then_some(count));
}

fn open_at_login_item<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<CheckMenuItem<R>> {
    let is_on = app.autolaunch().is_enabled().unwrap_or(false);
    CheckMenuItem::with_id(
        app,
        "open-at-login",
        "Open at Login",
        true,
        is_on,
        None::<&str>,
    )
}

fn toggle_open_at_login<R: Runtime>(app: &AppHandle<R>) {
    let autolaunch = app.autolaunch();
    let _ = if autolaunch.is_enabled().unwrap_or(false) {
        autolaunch.disable()
    } else {
        autolaunch.enable()
    };
}

/** macOS's menu bar: the app's own items, then the standard ones its keys (⌘C, ⌘Q…) need. */
#[cfg(target_os = "macos")]
fn set_menu<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    let mail_app = CheckMenuItem::with_id(
        app,
        "mail-app",
        "Fewmail Is Your Email App",
        true,
        mail_app::is_default(),
        None::<&str>,
    )?;
    let menu = Menu::with_items(
        app,
        &[
            &Submenu::with_items(
                app,
                "Fewmail",
                true,
                &[
                    &open_at_login_item(app)?,
                    &mail_app,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::hide(app, None)?,
                    &PredefinedMenuItem::hide_others(app, None)?,
                    &PredefinedMenuItem::show_all(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::quit(app, None)?,
                ],
            )?,
            &Submenu::with_items(
                app,
                "Edit",
                true,
                &[
                    &PredefinedMenuItem::undo(app, None)?,
                    &PredefinedMenuItem::redo(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::cut(app, None)?,
                    &PredefinedMenuItem::copy(app, None)?,
                    &PredefinedMenuItem::paste(app, None)?,
                    &PredefinedMenuItem::select_all(app, None)?,
                ],
            )?,
            &Submenu::with_items(
                app,
                "View",
                true,
                &[&MenuItem::with_id(
                    app,
                    "reload",
                    "Reload",
                    true,
                    Some("CmdOrCtrl+R"),
                )?],
            )?,
            &Submenu::with_items(
                app,
                "Window",
                true,
                &[
                    &PredefinedMenuItem::minimize(app, None)?,
                    &PredefinedMenuItem::maximize(app, None)?,
                    &PredefinedMenuItem::close_window(app, None)?,
                ],
            )?,
        ],
    )?;
    app.set_menu(menu)?;
    Ok(())
}

/** Windows' and Linux's tray stands in for the Dock: it brings the hidden window back. */
#[cfg(not(target_os = "macos"))]
fn set_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    use tauri::tray::{MouseButton, TrayIconBuilder, TrayIconEvent};

    // Linux's tray opens only its menu, so showing the window is its first item.
    let menu = Menu::with_items(
        app,
        &[
            &MenuItem::with_id(app, "show", "Open Fewmail", true, None::<&str>)?,
            &open_at_login_item(app)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::quit(app, Some("Quit Fewmail"))?,
        ],
    )?;
    TrayIconBuilder::with_id("tray")
        .icon(app.default_window_icon().cloned().expect("an icon"))
        .tooltip("Fewmail")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                ..
            } = event
            {
                show(tray.app_handle());
            }
        })
        .build(app)?;
    Ok(())
}

fn on_menu<R: Runtime>(app: &AppHandle<R>, id: &str) {
    match id {
        "open-at-login" => toggle_open_at_login(app),
        "show" => show(app),
        "reload" => {
            if let Some(window) = app.get_webview_window(MAIN) {
                let _ = window.eval("location.reload()");
            }
        }
        #[cfg(target_os = "macos")]
        "mail-app" => {
            let app = app.clone();
            // macOS asks the user first; the tick follows their answer.
            mail_app::make_default(move || {
                let _ = set_menu(&app);
            });
        }
        _ => {}
    }
}

/** Downloads the next version in the background and asks once it is ready; Windows' installer restarts on its own. */
async fn check_for_update<R: Runtime>(app: &AppHandle<R>) -> tauri_plugin_updater::Result<()> {
    let Some(update) = app.updater()?.check().await? else {
        return Ok(());
    };
    let bytes = update.download(|_, _| {}, || {}).await?;
    let strings = strings();
    let restart = app
        .dialog()
        .message(strings.available)
        .title("Fewmail")
        .buttons(MessageDialogButtons::OkCancelCustom(
            strings.reload,
            strings.not_now,
        ))
        .blocking_show();
    if restart {
        update.install(bytes)?;
        app.restart();
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // First: a second launch (a `mailto:` link on Windows and Linux) goes to this one, which deep-link then reads.
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            show(app)
        }))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(Notices::default())
        .invoke_handler(tauri::generate_handler![notify, set_badge])
        .on_menu_event(|app, event| on_menu(app, event.id().as_ref()))
        .on_window_event(|window, event| {
            // Closing hides the window, so the live stream, and with it notifications, carries on.
            if let WindowEvent::CloseRequested { api, .. } = event
                && window.label() == MAIN
            {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .setup(|app| {
            let handle = app.handle().clone();
            #[cfg(any(target_os = "windows", target_os = "linux"))]
            app.deep_link().register_all()?;

            // A `mailto:` link that launched the app opens Compose straight away; later ones arrive here.
            let launch_link = app
                .deep_link()
                .get_current()?
                .and_then(|urls| urls.into_iter().find(|url| url.scheme() == "mailto"));
            let first_path =
                launch_link.map_or_else(|| "/mail".to_owned(), |link| compose_path(&link));
            app.deep_link().on_open_url({
                let handle = handle.clone();
                move |event| {
                    for url in event.urls().iter().filter(|url| url.scheme() == "mailto") {
                        show_path(&handle, &compose_path(url));
                    }
                }
            });

            app.notification().on_action({
                let handle = handle.clone();
                move |action| {
                    let url = action.notification().and_then(|notification| {
                        let notices = handle.state::<Notices>();
                        let urls = notices.urls.lock().expect("notices");
                        urls.get(&notification.id()).cloned()
                    });
                    match url {
                        Some(url) if action.action_id() == "tap" => show_path(&handle, &url),
                        _ => show(&handle),
                    }
                }
            })?;

            // Hidden until the page has loaded: WKWebView paints white until then, whatever the window's color.
            let first_load = Arc::new(Once::new());
            let navigation = handle.clone();
            let new_window = handle.clone();
            let builder = WebviewWindowBuilder::new(app, MAIN, WebviewUrl::App(first_path.into()))
                .title("Fewmail")
                .inner_size(1280.0, 840.0)
                .visible(false)
                .on_page_load({
                    let first_load = Arc::clone(&first_load);
                    move |window, payload| {
                        if payload.event() == PageLoadEvent::Finished {
                            first_load.call_once(|| show(window.app_handle()));
                        }
                    }
                })
                // Narrower than this the web turns into its phone layout (Tailwind's `md`, 768px).
                .min_inner_size(800.0, 560.0)
                // Read by the web before it renders (`lib/desktop.ts`); `macos` gives the traffic lights room.
                .initialization_script(format!(
                    "document.documentElement.dataset.desktop = '{}'",
                    std::env::consts::OS
                ))
                .on_navigation(move |url| {
                    let stays = stays_in_app(url) || url.scheme() == "about";
                    if !stays {
                        leave(&navigation, url);
                    }
                    stays
                })
                .on_new_window(move |url, _features| {
                    if stays_in_app(&url) {
                        return NewWindowResponse::Allow;
                    }
                    leave(&new_window, &url);
                    NewWindowResponse::Deny
                });
            // The buttons sit as far from the window's corner as the sidebar's search field.
            #[cfg(target_os = "macos")]
            let builder = builder
                .title_bar_style(tauri::TitleBarStyle::Overlay)
                .hidden_title(true)
                .traffic_light_position(tauri::LogicalPosition::new(16.0, 20.0));
            let window = builder.build()?;
            // The web's `--body` in the system's theme, for what shows around the page (resizing; Windows and Linux).
            let body = match window.theme()? {
                tauri::Theme::Dark => tauri::window::Color(23, 19, 16, 255),
                _ => tauri::window::Color(243, 238, 229, 255),
            };
            window.set_background_color(Some(body))?;
            std::thread::spawn({
                let handle = handle.clone();
                move || {
                    std::thread::sleep(FIRST_LOAD_WAIT);
                    first_load.call_once(|| show(&handle));
                }
            });

            #[cfg(target_os = "macos")]
            set_menu(&handle)?;
            #[cfg(not(target_os = "macos"))]
            set_tray(&handle)?;

            if !cfg!(debug_assertions) {
                std::thread::spawn(move || {
                    loop {
                        if let Err(error) =
                            tauri::async_runtime::block_on(check_for_update(&handle))
                        {
                            eprintln!("update check failed: {error}");
                        }
                        std::thread::sleep(UPDATE_CHECK);
                    }
                });
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("the app")
        .run(|app, event| {
            if let RunEvent::Reopen { .. } = event {
                show(app);
            }
        });
}
