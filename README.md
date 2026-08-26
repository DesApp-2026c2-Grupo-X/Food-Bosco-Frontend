# Food-Bosco App

Monorepo Turborepo con dos aplicaciones frontend independientes:

- `apps/store` — tienda para clientes (Vite + React + Chakra UI, puerto 5173).
- `apps/branch` — sistema administrativo (Vite + React + Chakra UI, puerto 5174).

## Requisitos

- Node.js >= 20
- npm

## Comandos

```bash
npm install        # instala dependencias del workspace
npm run dev        # levanta store y branch en paralelo (Turborepo)
npm run build      # compila ambas aplicaciones
npm run lint       # ESLint en todas las apps (config compartida)
npm run typecheck  # TypeScript en todas las apps (config compartida)
npm run format     # Prettier sobre todo el repo
npm run format:check
```

## Android

```bash
npm run store:android             # prepara, corre y deja elegir dispositivo (AVD o adb)
npm run store:android:build       # solo prepara/build para Android
```

- `store:android` muestra un menú con los AVDs disponibles y los dispositivos conectados (`adb`).
- Para elegir directo: `bash apps/store/android.sh --run --emulator <AVD>` o `--device <serial>`.
- Ver dispositivos sin buildear: `bash apps/store/android.sh --list`.

## iOS

```bash
npm run store:ios                 # prepara, corre y deja elegir dispositivo (simulador o iPhone físico)
npm run store:ios:build           # solo prepara/build para iOS (simulador)
```

- `store:ios` muestra un menú con los simuladores disponibles y tu iPhone conectado.
- Para elegir directo: `bash apps/store/ios.sh --run --device "<nombre o UDID>"`.
- Ver dispositivos sin buildear: `bash apps/store/ios.sh --list`.
- Requiere Xcode con la plataforma iOS descargada (Xcode > Settings > Components). No requiere CocoaPods (usa Swift Package Manager).
- Ambos comandos reconstruyen primero los paquetes workspace (`@repo/*`) con turbo: las apps consumen el `dist/` de los paquetes, no el source. Si modificás código en `packages/*`, basta con correr este comando (no hace falta `npm run build` general).
- Para instalar en un iPhone físico hace falta:
  1. **Developer Mode** activado en el iPhone (Ajustes → Privacidad y seguridad → Modo de desarrollador).
  2. **Team** configurado en Xcode (abrir `apps/store/ios/App/App.xcodeproj` → target App → Signing & Capabilities).
  3. Aceptar **"Trust This Computer"** en el iPhone al conectar el cable.
