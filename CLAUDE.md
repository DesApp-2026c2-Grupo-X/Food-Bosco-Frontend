# CLAUDE.md — Frontend (client)

Monorepo de las aplicaciones de frontend de la plataforma de pedidos (Turborepo).

## Aplicaciones

- `apps/store` — Aplicación cliente (Vite + React + Chakra UI) — puerto 5173.
- `apps/admin` — Aplicación administrativa (Vite + React + Chakra UI) — puerto 5174.

## Stack

- Vite + React + TypeScript.
- Chakra UI v3 para componentes.
- SWR para fetching de datos.
- Zustand para estado global.
- React Router para navegación.

## Estructura de cada app

```text
src/
├── components/   # ComponentName/index.tsx + types.ts + hooks/ + utils/
├── layouts/      # layouts que componen la app (StoreLayout, AdminLayout)
├── pages/
├── hooks/
├── stores/       # estado global con Zustand
├── hoc/
├── types/
└── utils/
```

## Paquetes compartidos (`packages/`)

| Paquete                   | Uso                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `@repo/components`        | Componentes UI genéricos + UI de dominio (Logo, EmptyState, OrderStatusBadge, ...).                      |
| `@repo/domain`            | Tipos y constantes de dominio (Order, Address, Product, ORDER_STATUS_LABELS, formatPrice, ...). TS puro. |
| `@repo/api`               | Capa de datos: hooks SWR + adaptador REST (GraphQL a futuro) + mocks.                                    |
| `@repo/theme`             | Tokens semánticos de Chakra (`defineConfig` → `config`).                                                 |
| `@repo/eslint-config`     | Config ESLint compartida (`base`, `react-internal`).                                                     |
| `@repo/typescript-config` | Config TypeScript compartida (`vite.json`, `react-library.json`, `base.json`).                           |

## Configuración de calidad

- ESLint compartido en `packages/eslint-config` (flat config, reglas para Vite + React).
- TypeScript compartido en `packages/typescript-config` (`vite.json`, `vite-node.json`).
- Prettier: `.prettierrc.json` (sin punto y coma, single quotes).
- Husky (global en la raíz del repo): lint en commit, build + lint en push.

## Comandos

```sh
npm run dev          # corre todas las apps
npm run dev -- --filter=@repo/store
npm run dev -- --filter=@repo/admin
npm run build        # build de todas las apps
npm run lint         # eslint de todas las apps
npm run check-types  # tsc -b
npm run format       # prettier --write
```

## Reglas

- Consumir la API desde `/api` (proxy de Vite apunta al backend).
- No crear archivos en `agent-local/` (carpeta local del agente, no se pushea).
- Seguir la especificación de `plan/api/base.md`.
- **Diseño:** leer `client/docs/ui-manifesto.md` antes de tocar UI. Define la dirección visual ("Calor"), paleta, tipografía, geometría y patrones de componentes. Es la fuente de verdad visual.
- Leer la skill `frontend-components` en `.claude/skills/` antes de crear o modificar componentes (estructura, named exports, SOC, Chakra siempre, Zustand, layouts).
- Skills de diseño: `interface-design`, `better-ui` e `impeccable` en `.claude/skills/`.
- **Tema:** los tokens semánticos viven en `@repo/theme` (`packages/theme/src/config.ts`); cada app los consume en `src/theme.ts` con `createSystem(defaultConfig, config)`. Nunca hex sueltos en el markup; usar `bg`, `fg`, `brand.*`, `border.*`.
- **Datos:** consumir los hooks de `@repo/api` (`useCatalog`, `useProfile`, `useOrder`, ...) en lugar de `fetch` directo. Los tipos de dominio van en `@repo/domain`.

## Pull Requests

Al abrir un PR a `develop`, usar la plantilla `.github/PULL_REQUEST_TEMPLATE.md`
