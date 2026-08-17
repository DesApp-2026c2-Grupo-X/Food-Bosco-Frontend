#!/usr/bin/env bash
set -euo pipefail

# Genera launcher icons y splash desde assets/icon.png.
# Requiere ImageMagick (magick).

cd "$(dirname "$0")/.."

SRC="assets/icon.png"
RES="android/app/src/main/res"

for d in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  case $d in
    mdpi)    s=48;  c=108; p=320x480;  land=480x320;  l=120 ;;
    hdpi)    s=72;  c=162; p=480x800;  land=800x480;  l=180 ;;
    xhdpi)   s=96;  c=216; p=720x1280; land=1280x720; l=240 ;;
    xxhdpi)  s=144; c=324; p=960x1600; land=1600x960; l=360 ;;
    xxxhdpi) s=192; c=432; p=1280x1920; land=1920x1280; l=480 ;;
  esac

  # Launcher (legacy + round)
  magick "$SRC" -resize "${s}x${s}" "$RES/mipmap-$d/ic_launcher.png"
  magick "$SRC" -resize "${s}x${s}" "$RES/mipmap-$d/ic_launcher_round.png"

  # Adaptive foreground (canvas 108dp, logo al 66%)
  fl=$(( c * 66 / 100 ))
  magick "$SRC" -resize "${fl}x${fl}" -background none -gravity center -extent "${c}x${c}" \
    "$RES/mipmap-$d/ic_launcher_foreground.png"

  # Splash (blanco + logo centrado)
  magick -size "$p" xc:white \( "$SRC" -resize "${l}x${l}" \) -gravity center -composite "$RES/drawable-port-$d/splash.png"
  magick -size "$land" xc:white \( "$SRC" -resize "${l}x${l}" \) -gravity center -composite "$RES/drawable-land-$d/splash.png"
done

magick -size 720x1280 xc:white \( "$SRC" -resize 240x240 \) -gravity center -composite "$RES/drawable/splash.png"

echo "✅ launcher icons + splash generados"
