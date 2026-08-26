#!/usr/bin/env bash
set -eo pipefail

# =============================================================================
# Build de la app Android (Capacitor) del store.
#
# Uso:
#   ./android.sh                    # build web (mock auth) + sync + APK debug
#   ./android.sh --run              # idem + arrancar emulador, instalar y lanzar
#   ./android.sh --run --emulator Pixel_9_Pro   # elegir AVD
#
# Requisitos: nvm (Node >=22), SDKMAN (JDK 21 vía .sdkmanrc) y Android SDK.
# =============================================================================

cd "$(dirname "$0")"

# --- Android SDK ------------------------------------------------------------
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
ADB="$ANDROID_HOME/platform-tools/adb"
EMULATOR="$ANDROID_HOME/emulator/emulator"

# --- Node >= 22 (lo pide Capacitor 8) --------------------------------------
ensure_node() {
  if ! command -v node >/dev/null 2>&1; then return; fi
  local major
  major="$(node -p 'process.versions.node.split(".")[0]')"
  if [ "$major" -lt 22 ] && [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1091
    source "$HOME/.nvm/nvm.sh"
    nvm use 22 >/dev/null 2>&1 || nvm use 24 >/dev/null 2>&1 || true
  fi
}
ensure_node

# --- JDK 21 (lo pide Gradle 8.14) vía SDKMAN + .sdkmanrc -------------------
ensure_jdk() {
  local version
  version="$(grep -m1 '^java=' .sdkmanrc 2>/dev/null | cut -d= -f2)"
  if [ -n "$version" ] && [ -d "$HOME/.sdkman/candidates/java/$version" ]; then
    export JAVA_HOME="$HOME/.sdkman/candidates/java/$version"
    export PATH="$JAVA_HOME/bin:$PATH"
  fi
}
ensure_jdk

echo "▶ Build web (--mode native, auth mock)..."
npx vite build --mode native

echo "▶ Sync Capacitor → android/"
npx cap sync android

echo "▶ Build APK debug (gradlew assembleDebug)..."
(cd android && ./gradlew assembleDebug)

APK="android/app/build/outputs/apk/debug/app-debug.apk"
echo "✅ APK generado: $APK"

if [ "${1:-}" = "--run" ]; then
  AVD="Pixel_10_Pro_XL"
  if [ "${2:-}" = "--emulator" ]; then
    AVD="${3:-Pixel_10_Pro_XL}"
  fi

  echo "▶ Arrancando emulador ($AVD)..."
  "$EMULATOR" -avd "$AVD" >/dev/null 2>&1 &

  echo "▶ Esperando boot..."
  "$ADB" wait-for-device
  until [ "$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
    sleep 2
  done

  echo "▶ Instalando APK..."
  "$ADB" install -r "$APK"

  echo "▶ Lanzando app..."
  "$ADB" shell am start -n ar.unahur.desa.store/.MainActivity
fi
