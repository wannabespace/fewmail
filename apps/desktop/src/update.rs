use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
    time::Duration,
};

use gpui::{App, Global};

/// A public repository holding only the signed builds (`.github/workflows/desktop.yml`): Fewmail's own is private.
const RELEASES: &str = "https://github.com/wannabespace/fewmail-desktop/releases";
/// Set by the release build; without it (`cargo run`, a local bundle) the app never updates itself.
const TEAM_ID: Option<&str> = option_env!("APPLE_TEAM_ID");
const CHECK_EVERY: Duration = Duration::from_secs(4 * 60 * 60);

/// The newer bundle, unpacked next to the running one and signed by our team, waiting for a restart.
struct Ready(PathBuf);

impl Global for Ready {}

pub fn is_ready(cx: &App) -> bool {
    cx.has_global::<Ready>()
}

pub fn watch(on_ready: impl Fn(&mut App) + 'static, cx: &mut App) {
    let (Some(team_id), Ok(app)) = (TEAM_ID, cx.app_path()) else {
        return;
    };
    // Run from the disk image or Downloads, macOS serves a read-only copy that cannot be replaced.
    if app.extension().is_none_or(|extension| extension != "app")
        || app.to_string_lossy().contains("/AppTranslocation/")
    {
        return;
    }
    cx.spawn(async move |cx| {
        loop {
            let app = app.clone();
            let downloaded = cx
                .background_executor()
                .spawn(async move { download_newer(&app, team_id) })
                .await;
            match downloaded {
                Ok(Some(staged)) => {
                    let _ = cx.update(|cx| {
                        cx.set_global(Ready(staged));
                        on_ready(cx);
                    });
                    return;
                }
                Ok(None) => {}
                Err(error) => eprintln!("update check failed: {error}"),
            }
            cx.background_executor().timer(CHECK_EVERY).await;
        }
    })
    .detach();
}

/// The page's Reload in its "new version" toast.
pub fn install(cx: &mut App) {
    if replace_app(cx) {
        cx.restart();
    }
}

/// Quitting with an update waiting installs it, so the next launch is the new version.
pub fn install_on_quit(cx: &mut App) {
    replace_app(cx);
}

fn replace_app(cx: &mut App) -> bool {
    let (Some(staged), Ok(app)) = (
        cx.try_global::<Ready>().map(|Ready(staged)| staged.clone()),
        cx.app_path(),
    ) else {
        return false;
    };
    let old = app.with_extension("app.old");
    let _ = fs::remove_dir_all(&old);
    let swapped = fs::rename(&app, &old).and_then(|()| {
        fs::rename(&staged, &app).inspect_err(|_| {
            let _ = fs::rename(&old, &app);
        })
    });
    let _ = fs::remove_dir_all(&old);
    let _ = fs::remove_dir_all(staged.parent().unwrap());
    cx.remove_global::<Ready>();
    swapped
        .inspect_err(|error| eprintln!("update install failed: {error}"))
        .is_ok()
}

fn version_parts(version: &str) -> Vec<u64> {
    version
        .trim()
        .trim_start_matches('v')
        .split('.')
        .filter_map(|part| part.parse().ok())
        .collect()
}

fn run(command: &mut Command) -> Result<String, String> {
    let output = command.output().map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).into_owned());
    }
    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}

fn download_newer(app: &Path, team_id: &str) -> Result<Option<PathBuf>, String> {
    let latest = run(Command::new("curl").args([
        "-fsSL",
        "--max-time",
        "30",
        &format!("{RELEASES}/latest/download/latest.txt"),
    ]))?;
    if version_parts(&latest) <= version_parts(env!("CARGO_PKG_VERSION")) {
        return Ok(None);
    }
    // Unpacked beside the app, on its volume, so installing is two renames.
    let unpacked = app.with_file_name(".fewmail-update");
    let _ = fs::remove_dir_all(&unpacked);
    fs::create_dir(&unpacked).map_err(|error| error.to_string())?;
    let archive = std::env::temp_dir().join("Fewmail-update.zip");
    run(Command::new("curl")
        .args(["-fsSL", "--max-time", "600", "-o"])
        .arg(&archive)
        .arg(format!(
            "{RELEASES}/download/v{}/Fewmail.zip",
            latest.trim().trim_start_matches('v')
        )))?;
    run(Command::new("ditto")
        .args(["-x", "-k"])
        .arg(&archive)
        .arg(&unpacked))?;
    let _ = fs::remove_file(&archive);
    let staged = unpacked.join("Fewmail.app");
    // Anyone who could swap the download still cannot sign as our team.
    run(Command::new("codesign")
        .args(["--verify", "--deep", "--strict"])
        .arg(format!(
            "-R=anchor apple generic and certificate leaf[subject.OU] = \"{team_id}\""
        ))
        .arg(&staged))?;
    Ok(Some(staged))
}
