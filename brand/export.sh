#!/usr/bin/env bash
# Renders the PNGs in brand/ and apps/web/public from the SVG and HTML sources here, with headless Chrome.
set -euo pipefail
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PUBLIC=../apps/web/public
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# png <source relative to brand/> <output> <width> <height>
png() {
  local page="$TMP/page.html"
  printf '<!doctype html><body style="margin:0;background:transparent"><img src="%s" style="display:block;width:%spx;height:%spx">' \
    "file://$PWD/$1" "$3" "$4" > "$page"
  "$CHROME" --headless --disable-gpu --hide-scrollbars --default-background-color=00000000 \
    --allow-file-access-from-files --window-size="$3,$4" --screenshot="$2" "file://$page" 2>/dev/null
}

png icon/app-icon.svg icon/app-icon-1024.png 1024 1024
png icon/app-icon.svg "$PUBLIC/apple-touch-icon.png" 180 180
png logo/mark.svg logo/mark-512.png 512 512
png logo/lockup.svg logo/lockup.png 1920 320
png logo/lockup-dark.svg logo/lockup-dark.png 1920 320
for avatar in avatar/*.svg; do png "$avatar" "${avatar%.svg}.png" 1024 1024; done
cp logo/favicon.svg "$PUBLIC/favicon.svg"

# The OG card loads Lora from Google Fonts, so give it time.
"$CHROME" --headless --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --virtual-time-budget=5000 --window-size=1200,630 --screenshot="$PUBLIC/og.png" "file://$PWD/og/og.html" 2>/dev/null
cp "$PUBLIC/og.png" og/og.png
