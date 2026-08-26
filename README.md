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
npm run store:android        # prepara y corre la app store en Android (--run)
npm run store:android:build  # solo prepara/build para Android
```
