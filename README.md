# Food-Bosco App

Monorepo Turborepo con dos aplicaciones frontend independientes:

- `apps/store` — tienda para clientes (Vite + React + Chakra UI, puerto 5173).
- `apps/admin` — sistema administrativo (Vite + React + Chakra UI, puerto 5174).

## Requisitos

- Node.js >= 20
- npm

## Comandos

```bash
npm install        # instala dependencias del workspace
npm run dev        # levanta store y admin en paralelo (Turborepo)
npm run build      # compila ambas aplicaciones
npm run lint       # ESLint en todas las apps (config compartida)
npm run typecheck  # TypeScript en todas las apps (config compartida)
npm run format     # Prettier sobre todo el repo
npm run format:check
```

## Estructura

```text
apps/
├── store/    # aplicación de la tienda
└── admin/    # aplicación de administración

packages/
├── eslint-config/       # config ESLint compartida (@repo/eslint-config)
└── typescript-config/   # config TypeScript compartida (@repo/typescript-config)

plan/         # documentación funcional de referencia (versión antigua, no es especificación de estructura)
agent-local/  # recursos del agente (no versionado)
```
