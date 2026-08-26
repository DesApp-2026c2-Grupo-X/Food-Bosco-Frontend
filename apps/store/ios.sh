#!/usr/bin/env bash
set -eo pipefail

# =============================================================================
# Build de la app iOS (Capacitor + Swift Package Manager) del store.
#
# Uso:
#   ./ios.sh --list                       # lista dispositivos disponibles y sale
#   ./ios.sh                              # build paquetes + web + .app (simulador)
#   ./ios.sh --run                        # build + menú para elegir dispositivo + instalar/lanzar
#   ./ios.sh --run --device "iPhone 17 Pro"  # elegir dispositivo por nombre o UDID
#
# Requisitos: nvm (Node >=22), Xcode instalado (plataforma iOS descargada).
# Usa SPM, no requiere CocoaPods.
#
# iPhone físico: requiere configurar el Team en Xcode (Signing & Capabilities)
# y aceptar "Trust This Computer" en el teléfono.
#
# Nota: reconstruye los paquetes workspace (@repo/*) con turbo, porque las apps
# consumen su `dist/` (no el source). Si tocás code en packages/*, alcanza con
# correr este script; no hace falta `npm run build` general.
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

APP_ID="ar.unahur.desa.store"

usage() {
  sed -n 's/^# \{0,1\}//p' "$0" | sed -n '3,12p'
  exit 1
}

# --- Xcode -------------------------------------------------------------------
# Si el developer dir activo no es un Xcode.app completo, lo apuntamos al
# instalado (evita el error "requires Xcode, but active developer directory is a
# command line tools instance"). No toca el setting global (requeriría sudo).
if [ ! -x "$(xcode-select -p 2>/dev/null)/usr/bin/xcodebuild" ]; then
  for candidate in /Applications/Xcode.app /Applications/Xcode-beta.app; do
    if [ -x "$candidate/Contents/Developer/usr/bin/xcodebuild" ]; then
      export DEVELOPER_DIR="$candidate/Contents/Developer"
      break
    fi
  done
fi

XCODEBUILD="$(xcode-select -p)/usr/bin/xcodebuild"
if [ ! -x "$XCODEBUILD" ]; then
  echo "❌ No se encontró Xcode. Instalalo desde la App Store y corré: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer" >&2
  exit 1
fi

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

# --- Dispositivos ------------------------------------------------------------
# Parsea `xcrun xctrace list devices` → líneas "TIPO|NOMBRE|OS|UDID"
list_devices() {
  local section=""
  while IFS= read -r line; do
    case "$line" in
      "== Devices ==") section="physical" ;;
      "== Simulators ==") section="sim" ;;
      *)
        if [[ "$line" =~ ^([^(]+)\(([^)]*)\)[[:space:]]*\(([A-Fa-f0-9-]+)\)$ ]]; then
          printf '%s|%s|%s|%s\n' "$section" "${BASH_REMATCH[1]%% }" "${BASH_REMATCH[2]}" "${BASH_REMATCH[3]}"
        fi
        ;;
    esac
  done < <(xcrun xctrace list devices 2>/dev/null)
}

show_devices() {
  local type_label
  while IFS='|' read -r type name os udid; do
    if [ "$type" = "physical" ]; then type_label="📱 Físico"; else type_label="💻 Simulador"; fi
    printf '  %-11s %-28s %s  (%s)\n' "$type_label" "$name" "$os" "$udid"
  done < <(list_devices)
}

# Devuelve DEVICE_TYPE / DEVICE_UDID / DEVICE_NAME
pick_device() {
  local want="$1"
  local -a rows=()
  while IFS= read -r line; do rows+=("$line"); done < <(list_devices)
  [ "${#rows[@]}" -eq 0 ] && { echo "❌ No hay dispositivos iOS disponibles." >&2; exit 1; }

  if [ -n "$want" ]; then
    local row=""
    while IFS='|' read -r t n os u; do
      if [ "$want" = "$u" ] || [ "$n" = "$want" ] || [[ "$n" == *"$want"* ]]; then
        row="$t|$n|$os|$u"; break
      fi
    done < <(printf '%s\n' "${rows[@]}")
    [ -z "$row" ] && { echo "❌ No se encontró '$want'. Usá ./ios.sh --list para ver dispositivos." >&2; exit 1; }
    IFS='|' read -r DEVICE_TYPE DEVICE_NAME DEVICE_OS DEVICE_UDID <<<"$row"
    return
  fi

  echo "Dispositivos disponibles:"
  local i=1
  while IFS='|' read -r t n os u; do
    if [ "$t" = "physical" ]; then printf '  %d) 📱 %s (iOS %s)\n' "$i" "$n" "$os"; else printf '  %d) 💻 %s (iOS %s)\n' "$i" "$n" "$os"; fi
    ((i++))
  done < <(printf '%s\n' "${rows[@]}")
  local sel
  read -r -p "Elegí un número (default 1): " sel
  sel="${sel:-1}"
  [[ "$sel" =~ ^[0-9]+$ ]] && [ "$sel" -ge 1 ] && [ "$sel" -le "${#rows[@]}" ] || { echo "❌ Selección inválida." >&2; exit 1; }
  IFS='|' read -r DEVICE_TYPE DEVICE_NAME DEVICE_OS DEVICE_UDID <<<"${rows[$((sel - 1))]}"
}

# --- Flags -------------------------------------------------------------------
MODE="build"
DEVICE_ARG=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    --list) MODE="list"; shift ;;
    --run) MODE="run"; shift ;;
    --device) DEVICE_ARG="${2:-}"; shift 2 ;;
    *) usage ;;
  esac
done

if [ "$MODE" = "list" ]; then
  echo "▶ Xcode: $("$XCODEBUILD" -version 2>/dev/null | head -1)"
  echo "Dispositivos iOS disponibles:"
  show_devices
  exit 0
fi

pick_device "$DEVICE_ARG"

PROJECT="ios/App/App.xcodeproj"
SCHEME="App"
DERIVED="ios/App/build"

if [ "$DEVICE_TYPE" = "physical" ]; then
  APP_PATH="$DERIVED/Build/Products/Debug-iphoneos/App.app"
  DESTINATION="platform=iOS,id=$DEVICE_UDID"
  EXTRA_BUILD_FLAGS=(-allowProvisioningUpdates)
else
  APP_PATH="$DERIVED/Build/Products/Debug-iphonesimulator/App.app"
  DESTINATION="platform=iOS Simulator,id=$DEVICE_UDID"
  EXTRA_BUILD_FLAGS=()
fi

echo "▶ Xcode: $("$XCODEBUILD" -version 2>/dev/null | head -1)"
echo "▶ Dispositivo: $DEVICE_NAME (iOS $DEVICE_OS)"

echo "▶ Build paquetes workspace (@repo/*)..."
(cd "$REPO_ROOT" && npx turbo run build --filter='./packages/*')

echo "▶ Build web (--mode native, auth mock)..."
npx vite build --mode native

echo "▶ Sync Capacitor → ios/"
npx cap sync ios

echo "▶ Build iOS ($DEVICE_TYPE)..."
if ! "$XCODEBUILD" -project "$PROJECT" -scheme "$SCHEME" \
  -destination "$DESTINATION" \
  -derivedDataPath "$DERIVED" "${EXTRA_BUILD_FLAGS[@]}" build; then
  if [ "$DEVICE_TYPE" = "physical" ]; then
    echo "❌ Falló el build para iPhone físico. Revisá estos requisitos:" >&2
    echo "   1) Developer Mode: en el iPhone → Ajustes → Privacidad y seguridad → Modo de desarrollador (activar)." >&2
    echo "   2) Firma: abrí apps/store/ios/App/App.xcodeproj en Xcode → target App → Signing & Capabilities → elegí tu Team." >&2
    echo "   3) Confiá el equipo: en el iPhone aceptá 'Trust This Computer' al conectar el cable." >&2
  fi
  exit 1
fi

echo "✅ App generada: $APP_PATH"

if [ "$MODE" = "run" ]; then
  if [ "$DEVICE_TYPE" = "physical" ]; then
    echo "▶ Instalando en $DEVICE_NAME..."
    xcrun devicectl device install app --device "$DEVICE_UDID" "$APP_PATH"
    echo "▶ Lanzando..."
    xcrun devicectl device process launch --device "$DEVICE_UDID" "$APP_ID"
  else
    echo "▶ Arrancando simulador..."
    xcrun simctl boot "$DEVICE_UDID" 2>/dev/null || true
    open -a Simulator
    xcrun simctl bootstatus "$DEVICE_UDID" -b >/dev/null
    echo "▶ Instalando y lanzando app..."
    xcrun simctl install "$DEVICE_UDID" "$APP_PATH"
    xcrun simctl launch "$DEVICE_UDID" "$APP_ID"
  fi
fi
