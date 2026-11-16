use std::{env, process::Command};

fn main() {
    println!("cargo:rerun-if-changed=src");
    println!("cargo:rerun-if-changed=script/icons.ts");
    println!("cargo:rerun-if-changed=../../packages/shared/i18n");
    let out = env::var("OUT_DIR").unwrap();
    bun(&[
        "build",
        "src/i18n.ts",
        "--format=iife",
        "--minify",
        "--outfile",
        &format!("{out}/i18n.js"),
    ]);
    bun(&["script/icons.ts", &out]);
}

fn bun(args: &[&str]) {
    let status = Command::new("bun")
        .args(args)
        .status()
        .expect("bun builds the web's messages and icons into the app");
    assert!(status.success(), "bun {args:?} failed");
}
