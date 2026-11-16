#!/usr/bin/env bash
# Builds target/bundle/Fewmail.app for Apple silicon and Intel. With the Apple secrets set (the release workflow) it also
# signs with the Developer ID, notarizes, staples, and packs Fewmail.zip (what the app updates from), Fewmail.dmg
# (what people download) and latest.txt (the version the app checks).
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION="$(sed -n 's/^version = "\(.*\)"/\1/p' Cargo.toml | head -1)"
OUT=target/bundle
APP="$OUT/Fewmail.app"
rm -rf "$OUT"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

for target in aarch64-apple-darwin x86_64-apple-darwin; do
  cargo build --release --target "$target"
done
lipo -create -output "$APP/Contents/MacOS/Fewmail" \
  target/aarch64-apple-darwin/release/Fewmail target/x86_64-apple-darwin/release/Fewmail
sed "s/__VERSION__/$VERSION/g" Info.plist > "$APP/Contents/Info.plist"

ICONSET="$OUT/Fewmail.iconset"
mkdir "$ICONSET"
for size in 16 32 128 256 512; do
  sips -z "$size" "$size" ../../brand/icon/app-icon-macos-1024.png --out "$ICONSET/icon_${size}x${size}.png" >/dev/null
  sips -z "$((size * 2))" "$((size * 2))" ../../brand/icon/app-icon-macos-1024.png --out "$ICONSET/icon_${size}x${size}@2x.png" >/dev/null
done
iconutil -c icns "$ICONSET" -o "$APP/Contents/Resources/Fewmail.icns"
rm -rf "$ICONSET"

if [ -z "${APPLE_SIGNING_IDENTITY:-}" ]; then
  codesign --force --sign - "$APP"
  echo "Unsigned build (no APPLE_SIGNING_IDENTITY): $APP"
  exit 0
fi

notarize() {
  xcrun notarytool submit "$1" --wait \
    --key "$APPLE_API_KEY_PATH" --key-id "$APPLE_API_KEY_ID" --issuer "$APPLE_API_ISSUER"
}

codesign --force --options runtime --timestamp --sign "$APPLE_SIGNING_IDENTITY" "$APP"
ditto -c -k --keepParent "$APP" "$OUT/Fewmail.zip"
notarize "$OUT/Fewmail.zip"
xcrun stapler staple "$APP"
# Zipped again so the update carries the stapled ticket and opens offline.
rm "$OUT/Fewmail.zip"
ditto -c -k --keepParent "$APP" "$OUT/Fewmail.zip"

DMG_ROOT="$OUT/dmg"
mkdir "$DMG_ROOT"
cp -R "$APP" "$DMG_ROOT/"
ln -s /Applications "$DMG_ROOT/Applications"
hdiutil create -volname Fewmail -srcfolder "$DMG_ROOT" -ov -format UDZO "$OUT/Fewmail.dmg"
rm -rf "$DMG_ROOT"
codesign --force --timestamp --sign "$APPLE_SIGNING_IDENTITY" "$OUT/Fewmail.dmg"
notarize "$OUT/Fewmail.dmg"
xcrun stapler staple "$OUT/Fewmail.dmg"

echo "$VERSION" > "$OUT/latest.txt"
