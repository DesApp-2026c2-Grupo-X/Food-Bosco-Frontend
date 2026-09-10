# Plan — Admin global (`apps/admin`, rol `super_admin`)

> **Objetivo:** construir el frontend del Admin global en `apps/admin`, replicando los patrones ya implementados en `apps/branch` (admin de sucursal) y cumpliendo `docs/requerimientos-frontend.md` (§9 y §10, pantallas G-01…G-15), `docs/requerimientos-backend-rest.md` (endpoints, trazabilidad §15) y `docs/ui-manifesto.md` (identidad "Calor").
>
> **Fuentes de verdad:** `docs/requerimientos-frontend.md` (funcional), `docs/ui-manifesto.md` (visual/sistema), `CLAUDE.md` (monorepo/stack), skill `frontend-components` (reglas de código).

---

## 1. Contexto y punto de partida

### 1.1 Qué ya existe (referencia: `apps/branch`)

La app `apps/branch` está **completa** y es el molde directo:

| Pieza                  | Ubicación                    | Qué hace                                                                                                              |
| ---------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `main.tsx`             | `apps/branch/src`            | `ColorModeProvider` + `ChakraProvider(system)` + `GraphQLProvider` + `BrowserRouter`                                  |
| `App.tsx`              | `apps/branch/src`            | `useRoutes([...authRouteObjects({...}), { RequireAuth roles=['branch_admin'], children: [BranchLayout → páginas] }])` |
| `routes.ts`            | `apps/branch/src`            | rutas en inglés + helpers (`orderDetailPath`)                                                                         |
| `config.ts`            | `apps/branch/src`            | `BRANCH_URL`, `ADMIN_URL`, `RIDER_URL`, `MOCK_AUTH`                                                                   |
| `theme.ts`             | `apps/branch/src`            | `createSystem(defaultConfig, config)` desde `@repo/theme`                                                             |
| `layouts/BranchLayout` | `apps/branch/src/layouts`    | sidebar sticky (desktop) + header + drawer (mobile) + `utils/navigation.ts` + `types.ts`                              |
| `components/Logo`      | `apps/branch/src/components` | wrapper de `Logo` de `@repo/components` con assets locales                                                            |

### 1.2 Paquetes compartidos ya disponibles (`packages/`)

- **`@repo/components`** (barrel `index.ts`): `DataTable` (+`DataTableColumn`), `FilterBar`, `SearchInput`, `SelectField`, `ToggleSwitch`, `PageTitle`, `SectionTitle`, `Eyebrow`, `Strong`, `Muted`, `Subtle`, `Price`, `TextLink`, `PrimaryButton`/`SecondaryButton`/`GhostButton`/`OutlineButton`/`InverseButton`, `TextField`/`PasswordField`/`TextAreaField` + `FormField`/`FormPasswordField`/`FormTextAreaField`, `PageContainer`, `WidePageContainer`, `EmptyState`, `OrderStatusBadge`, `OrderTimeline`, `ResponsiveModal`, `SidePanel`, `BackButton`, `RequireAuth`, `ColorModeButton`/`ColorModeProvider`, `QuantityStepper`, `Chip`/`ChipCarousel`, `Logo`, `Footer`, `SplashScreen`.
- **`@repo/domain`**: `Order`, `OrderStatus`, `ORDER_STATUS_LABELS`, `ORDER_STATUS_PALETTE`, `ORDER_TRANSITIONS`/`getNextStatuses`, `ATTENTION_ORDER_STATUSES`, `Product`, `ProductConfigGroup`, `ProductOption`, `Category`, `Ingredient`, `RecipeItem`, `Branch` (simplificado store), `BranchProduct`, `BranchStock`, `AdjustStockInput`, `ProductReportRow`, `OutOfStockRow`, `User`/`UserRole`, `Address`, `LoginInput`/`RegisterInput`, `formatPrice`, `formatOrderDate`, `isActiveOrder`, `getStatusSince`, `getElapsedMinutes`, `formatElapsed`, y schemas Zod (`loginSchema`, `registerSchema`, `addressSchema`, `profileSchema`, `adjustStockSchema`, …).
- **`@repo/api`**: hooks SWR+fallback (`useCatalog`, `useProduct`, `useProfile`, `useOrder`, `useAddresses`, `useBranchProducts`, `useBranchStock`, `useBranchOrders`, `useAdminOrder`, `useProductReports`, `useIncomingOrder`), `useAuthStore` (Zustand persist), mocks (`MOCK_CATEGORIES`, `MOCK_PRODUCTS`, `MOCK_ORDERS`, `MOCK_BRANCH_NAME`, `MOCK_BRANCH_ADMIN`, `MOCK_BRANCH_PRODUCTS`, `MOCK_INGREDIENTS`, `MOCK_BRANCH_STOCK`, reports, recipes), helpers REST (`getJson`, `patchJson`, `postJson`), `GraphQLProvider`, `apolloClient`.
- **`@repo/auth`**: `authRouteObjects`, `authRoutes`, páginas de login/registro/recuperar/restablecer, `AuthProvider`, `useAuthRedirect`.

### 1.3 Estado actual de `apps/admin` (gap)

`apps/admin` es un **placeholder**:

- `App.tsx` usa `<Routes>` (no `useRoutes`), solo monta `HomePage`.
- `main.tsx` **sin** `ChakraProvider`/`ColorModeProvider`/`GraphQLProvider`/tema.
- `HomePage.tsx` renderiza un `<main>` con texto plano.
- `package.json` **le faltan** `@repo/api`, `@repo/auth`, `@repo/components`, `@repo/domain`, `@repo/theme`, `@hookform/resolvers`, `react-hook-form`, `zod`.
- Sin `src/theme.ts`, sin `src/routes.ts`, sin `src/config.ts`, sin `layouts/`, sin assets de logo, sin `src/stores/`.
- `tsconfig.app.json` sin `strictNullChecks` ni `exclude`.

---

## 2. Alcance funcional (pantallas G-01…G-15)

El admin global **define lo global** y ve pedidos/stock/reportes de **todas** las sucursales. Pantallas requeridas:

| ID   | Pantalla                         | Ruta propuesta                                     | Tipo                                      |
| ---- | -------------------------------- | -------------------------------------------------- | ----------------------------------------- |
| G-01 | Lista de categorías              | `/categories`                                      | listado + filtro + ABM                    |
| G-02 | Formulario de categoría          | `/categories/new`, `/categories/:categoryId/edit`  | modal corto                               |
| G-03 | Lista de productos               | `/products`                                        | listado + filtros + toggle disponibilidad |
| G-04 | Crear/editar producto            | `/products/new`, `/products/:productId/edit`       | página con tabs                           |
| G-05 | Configuraciones de producto      | tab "Configuraciones" dentro de edición            | CRUD grupos/opciones                      |
| G-06 | Ingredientes/receta del producto | tab "Receta" dentro de edición                     | CRUD ingrediente+cantidad                 |
| G-07 | Catálogo de ingredientes         | `/ingredients`                                     | listado + ABM                             |
| G-08 | Lista de sucursales              | `/branches`                                        | listado + filtro + ABM                    |
| G-09 | Crear/editar sucursal y horarios | `/branches/new`, `/branches/:branchId/edit`        | página con tabs (info + horarios)         |
| G-10 | Lista de promociones             | `/promotions`                                      | listado + filtro + ABM                    |
| G-11 | Crear/editar promoción           | `/promotions/new`, `/promotions/:promotionId/edit` | modal/página                              |
| G-12 | Lista de personal                | `/staff`                                           | listado + filtro + ABM                    |
| G-13 | Crear/editar colaborador         | `/staff/new`, `/staff/:userId/edit`                | página (rol + sucursal)                   |
| G-14 | Estados generales                | `/states`                                          | listado + ABM (catálogo)                  |
| G-15 | Parámetros del sistema           | `/parameters`                                      | listado + edición modal                   |
| —    | Inicio global                    | `/`                                                | accesos rápidos + pedidos con atención    |
| —    | Pedidos (todas)                  | `/orders`                                          | listado global + filtros                  |
| —    | Detalle y cambio de estado       | `/orders/:orderId`                                 | reutiliza patrón de `apps/branch`         |
| —    | Stock (todas)                    | `/stock`                                           | listado + ajuste + filtro por sucursal    |
| —    | Reportes (todas)                 | `/reports/products`                                | 4 tabs + filtro por sucursal              |
| —    | Perfil                           | `/profile`                                         | reutiliza patrón de `apps/branch`         |

**Fuera de alcance (no implementar):** motor de descuentos/promociones automáticas, reportes de pedidos/clientes/sucursales/promociones, exportaciones, pagos, notificaciones reales, mapa en Tienda.

---

## 3. Arquitectura / estructura de archivos

Se replica la estructura de `apps/branch` y `apps/store`:

```text
apps/admin/
├── index.html                 # título "Food Bosco — Administración" (ya tiene fuente Outfit)
├── package.json               # agregar deps faltantes (ver §7)
├── vite.config.ts             # ya tiene puerto 5174 + proxy /api → 3000 (ok)
├── tsconfig.app.json          # alinear con branch (strictNullChecks + exclude)
└── src/
    ├── main.tsx               # providers + BrowserRouter
    ├── App.tsx                # useRoutes + authRouteObjects + RequireAuth roles=['super_admin']
    ├── theme.ts               # createSystem(defaultConfig, config)
    ├── routes.ts              # rutas + helpers de path
    ├── config.ts              # ADMIN_URL / BRANCH_URL / RIDER_URL / MOCK_AUTH
    ├── assets/                # logo-light.svg + logo-dark.svg (copiar de branch)
    ├── components/
    │   ├── Logo/              # wrapper (index.tsx + types.ts), igual a branch
    │   └── <modales/formularios específicos>/
    ├── layouts/
    │   └── AdminLayout/       # index.tsx + types.ts + utils/navigation.ts (secciones)
    ├── pages/
    │   ├── HomePage/
    │   ├── CategoriesPage/
    │   ├── ProductsPage/
    │   ├── ProductEditPage/       # tabs: datos · configuraciones · receta
    │   ├── IngredientsPage/
    │   ├── BranchesPage/
    │   ├── BranchEditPage/        # tabs: información · horarios
    │   ├── PromotionsPage/
    │   ├── StaffPage/
    │   ├── StaffEditPage/
    │   ├── StatesPage/
    │   ├── ParametersPage/
    │   ├── OrdersPage/
    │   ├── OrderDetailPage/       # reutiliza patrón + hooks de branch
    │   ├── StockPage/
    │   ├── ReportsPage/
    │   └── ProfilePage/
    └── stores/                # solo si hace falta (no se espera; el estado vive en @repo/api)
```

**Regla de capas:** tipos/constantes/schemas en `@repo/domain`; hooks/mocks en `@repo/api`; tokens de UI en `@repo/components`/`@repo/theme`. En la app solo quedan layouts, páginas y componentes específicos de admin.

---

## 4. Tipos de dominio nuevos (`@repo/domain`)

Nuevos archivos (y export en `src/index.ts`):

```text
packages/domain/src/
├── admin-branch.ts   # AdminBranch, BranchHours, BranchInput, BranchHoursInput
├── promotion.ts      # Promotion, PromotionInput
├── parameter.ts      # Parameter, ParameterInput
├── order-state.ts    # OrderState, OrderStateInput
└── staff.ts          # StaffInput, AdminInput (crear staff/admin); User gana branchId?: string
```

Detalle:

- `AdminBranch`: `{ id: number; name: string; addressText: string; latitude: number; longitude: number; phone: string; active: boolean; hours: BranchHours[] }`.
- `BranchHours`: `{ dayOfWeek: number; opening: string; closing: string; closed: boolean }` (días 0..6, Lunes=1 según convenga; documentar convención).
- `Promotion`: `{ id: number; name: string; description: string; startDate: string; endDate: string; active: boolean }`.
- `Parameter`: `{ key: string; value: number; unit: string }`.
- `OrderState`: `{ code: string; name: string; order: number; active: boolean }`.
- `User` gana `branchId?: string` (no rompe usos existentes) para listar/vincular colaboradores.
- Inputs para mutaciones: `CategoryInput`, `ProductInput`, `IngredientInput`, `BranchInput`, `BranchHoursInput`, `PromotionInput`, `StaffInput`, `AdminInput`, `OrderStateInput`, `ParameterInput`.

**Nota de consistencia de IDs:** se mantiene la convención actual de mocks: entidades de catálogo/sucursales con `id: number`; usuarios/órdenes con `id: string`. No cambiar tipos existentes.

### Schemas Zod nuevos (en `schemas.ts`)

Agregar (siguiendo `adjustStockSchema` como molde, mensajes en español, `mode: 'onTouched'`):

- `categorySchema` — nombre obligatorio, sin espacios vacíos.
- `ingredientSchema` — nombre + unidad obligatorios.
- `productSchema` — nombre, descripción, categoría (obligatoria), precio (≥ 0), disponibilidad.
- `branchSchema` — nombre, dirección, lat/lng (rangos válidos), teléfono, estado; horarios con validación "apertura < cierre salvo día cerrado".
- `promotionSchema` — nombre, fechas válidas, fin ≥ inicio.
- `staffSchema` — nombre/apellido/email/teléfono/contraseña inicial; si rol `branch_admin` → sucursal obligatoria.
- `parameterSchema` — valor numérico positivo.
- `orderStateSchema` — código, nombre, orden.

---

## 5. Hooks y mocks nuevos (`@repo/api`)

### 5.1 Hooks (patrón `useSWR + fallback mock`, como `useBranchProducts`/`useAdminOrder`)

Todos intentan `/api/...`, y si falla/no hay forma esperada devuelven mock. Las mutaciones actualizan el mock in-place y `mutate(..., { revalidate: false })` para la demo.

| Hook                           | Fuente/endpoints                                              | Retorna                                                            |
| ------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `useAdminCategories`           | `GET/POST/PATCH /v1/catalog/categories…`                      | `categories`, `isLoading`, `create`, `update`, `toggle`            |
| `useAdminProducts`             | `GET /v1/catalog/products`, `PATCH …/available`               | `products` (+categoría), `isLoading`, `isToggling`, `setAvailable` |
| `useProductEditor(productId?)` | `GET/POST/PATCH products`, configs, recipe                    | datos + CRUD de configuraciones y receta (o 3 hooks separados)     |
| `useIngredients`               | `GET/POST/PATCH ingredients`, `PATCH …/active`                | `ingredients`, CRUD + toggle                                       |
| `useBranches`                  | `GET/POST/PATCH branches`, `PATCH …/active`, `PUT …/hours`    | `branches`, CRUD + toggle + saveHours                              |
| `usePromotions`                | `GET/POST/PATCH promotions`, `PATCH …/active`                 | `promotions`, CRUD + toggle                                        |
| `useStaff`                     | `GET /v1/users`, `POST staff/admins`, `PATCH`, `PATCH active` | `staff`, `createStaff`, `createAdmin`, `update`, `toggle`          |
| `useOrderStates`               | `GET/POST/PUT config/order-states`, `PATCH active`            | `states`, CRUD + toggle                                            |
| `useParameters`                | `GET config/parameters`, `PATCH …/{key}`                      | `parameters`, `update`                                             |
| `useGlobalOrders`              | `GET /v1/orders` (todas)                                      | `orders`, `isLoading` (reutiliza filtros cliente-side)             |
| `useGlobalStock`               | `GET /v1/stock?branchId=`, `POST adjustments`                 | `stock`, `isLoading`, `isAdjusting`, `adjust`                      |
| `useGlobalReports`             | `GET /v1/reporting/products/*` (+`branchId`)                  | 4 listas + `isLoading`                                             |

**Reutilizar sin cambios:** `useAdminOrder` (detalle + `changeStatus` + transiciones), `OrderStatusBadge`, `DataTable`, `EmptyState`.

> Alternativa a evaluar: generalizar `useBranchOrders`/`useBranchStock`/`useProductReports` para aceptar `branchId?` en lugar de duplicarlos. Si se hace, no romper los consumidores de `apps/branch`. Decisión de implementación: **crear hooks globales nuevos** para no tocar `apps/branch` (menor riesgo), salvo que se prefiera refactorizar.

### 5.2 Mocks nuevos (`packages/api/src/mocks/`)

- `branches.ts` — `MOCK_BRANCHES` (3–4 sucursales con `addressText`, lat/lng, phone, `active`, `hours` por día). Reutilizar "Centro"/"Norte" ya nombrados en docs.
- `promotions.ts` — `MOCK_PROMOTIONS` (2–3, sin descuento).
- `parameters.ts` — `MOCK_PARAMETERS` (`MAX_DISTANCE_KM` 10 km, `BASE_PREP_MIN` 20 min, `AVG_SPEED_KMH` 25 km/h).
- `order-states.ts` — `MOCK_ORDER_STATES` (7 estados con `code`, `name`, `order`, `active`).
- `staff.ts` — `MOCK_STAFF` (1 `super_admin` + 2 `branch_admin` vinculados a sucursales) y `MOCK_SUPER_ADMIN` (usuario de sesión, análogo a `MOCK_BRANCH_ADMIN`).
- `global-stock.ts` — stock de ingredientes por sucursal (reutiliza `MOCK_BRANCH_STOCK` y lo multiplica por sucursal).

Exportar los nuevos hooks y mocks desde `packages/api/src/index.ts`.

---

## 6. Layout y navegación

### 6.1 `AdminLayout` (`layouts/AdminLayout/`)

Igual a `BranchLayout` (sidebar sticky desktop + header + drawer mobile), con estos cambios:

- Subtítulo "Administrador global" (o `MOCK_SUPER_ADMIN` nombre) en el sidebar.
- **Nav agrupado en secciones** (`utils/navigation.ts` devuelve secciones con label + items), según §9.2:

```text
INICIO
  Inicio            /

CATÁLOGO
  Categorías        /categories
  Productos         /products
  Ingredientes      /ingredients

OPERACIÓN
  Pedidos           /orders
  Sucursales        /branches
  Stock             /stock
  Promociones       /promotions

SISTEMA
  Personal          /staff
  Estados           /states
  Parámetros        /parameters

REPORTES
  Productos         /reports/products
```

- La "Receta de producto" del menú (§9.2) se resuelve como **tab dentro de la edición de producto** (G-06), no como ítem suelto.
- Ítem activo: píldora `brand.700`/`bg.muted` (mismo patrón visual que branch). En mobile, drawer con las mismas secciones.
- Header: logo (mobile) + título "Administración" + `ColorModeButton`. **No** incluye `BranchStatusButton`, `IncomingOrderModal` ni sonido (eso es específico de sucursal).

### 6.2 `routes.ts`

```ts
export const routes = {
  home: '/',
  categories: '/categories',
  categoryNew: '/categories/new',
  categoryEdit: '/categories/:categoryId/edit',
  products: '/products',
  productNew: '/products/new',
  productEdit: '/products/:productId/edit',
  ingredients: '/ingredients',
  branches: '/branches',
  branchNew: '/branches/new',
  branchEdit: '/branches/:branchId/edit',
  promotions: '/promotions',
  promotionNew: '/promotions/new',
  promotionEdit: '/promotions/:promotionId/edit',
  staff: '/staff',
  staffNew: '/staff/new',
  staffEdit: '/staff/:userId/edit',
  states: '/states',
  parameters: '/parameters',
  orders: '/orders',
  orderDetail: '/orders/:orderId',
  stock: '/stock',
  reports: '/reports/products',
  profile: '/profile',
} as const

// helpers:
export const categoryEditPath = (id) => `/categories/${id}/edit`
export const productEditPath = (id) => `/products/${id}/edit`
export const branchEditPath = (id) => `/branches/${id}/edit`
export const promotionEditPath = (id) => `/promotions/${id}/edit`
export const staffEditPath = (id) => `/staff/${id}/edit`
export const orderDetailPath = (id) => `/orders/${id}`
```

### 6.3 `App.tsx`

Espejo de branch, con `roles=['super_admin']`:

```tsx
useRoutes([
  ...authRouteObjects({
    branchUrl: BRANCH_URL,
    adminUrl: ADMIN_URL,
    riderUrl: RIDER_URL,
    logoLight,
    logoDark,
  }),
  {
    element: (
      <RequireAuth loginPath={authRoutes.login} roles={['super_admin']} mockAuth={MOCK_AUTH} />
    ),
    children: [{ element: <AdminLayout />, children: [/* páginas */] }],
  },
])
```

---

## 7. Setup inicial (Fase 0)

1. **`package.json`** — agregar: `@repo/api`, `@repo/auth`, `@repo/components`, `@repo/domain`, `@repo/theme`, `@hookform/resolvers`, `react-hook-form`, `zod`.
2. **`tsconfig.app.json`** — alinear con branch (`strictNullChecks: true`, `exclude: ["node_modules","dist"]`).
3. **`src/theme.ts`** — `createSystem(defaultConfig, config)`.
4. **`src/main.tsx`** — agregar `ColorModeProvider` + `ChakraProvider(value={system})` + `GraphQLProvider`.
5. **`src/config.ts`** — `ADMIN_URL` (5174), `BRANCH_URL` (5175), `RIDER_URL`, `MOCK_AUTH`.
6. **`src/assets/logo-*.svg`** — copiar de `apps/branch/src/assets/`.
7. **`src/components/Logo/`** — copiar de branch.
8. **`src/App.tsx`, `src/routes.ts`, `src/layouts/AdminLayout/`** — shell funcional.
9. **`src/pages/HomePage` y `src/pages/ProfilePage`** — mínimos (patrón branch, con `MOCK_SUPER_ADMIN`).
10. Verificar: `npm run dev -- --filter=@repo/admin` y `npm run check-types`.

---

## 8. Plan de implementación por fases

### Fase 1 — Dominio y datos (paquetes)

1. Tipos nuevos en `@repo/domain` (§4) + export en `index.ts`.
2. Schemas Zod nuevos (§4).
3. Mocks nuevos (§5.2) + export en `@repo/api/index.ts`.
4. Hooks nuevos (§5.1) + export en `@repo/api/index.ts`.

### Fase 2 — Catálogo

- **CategoriesPage** + modal de formulario (`ResponsiveModal` + RHF/Zod). Confirmación antes de desactivar.
- **IngredientsPage** + modal. Regla: no "eliminar" si está en recetas activas → desactivar.
- **ProductsPage** (DataTable: miniatura, nombre, categoría, precio, disponibilidad, acciones). Toggle disponibilidad global.
- **ProductEditPage** con tabs:
  - _Datos generales_ — form producto (G-04).
  - _Configuraciones_ — grupos anidados con opciones (G-05): CRUD grupo + CRUD opción, tipo single/multiple, requerido, min/max, variación de precio, activo.
  - _Receta_ — lista ingrediente+cantidad, agregar/quitar/editar (G-06).

### Fase 3 — Operación

- **BranchesPage** (DataTable: nombre, dirección, teléfono, estado, acciones).
- **BranchEditPage** con tabs: _Información_ (G-09) + _Horarios_ (tabla 7 días con abre/cierra/cerrado).
- **PromotionsPage** + modal (solo información general, sin descuentos).
- **OrdersPage** (global, filtros número/cliente, estado, sucursal) — DataTable + `OrderStatusBadge`.
- **OrderDetailPage** — reutilizar `OrderDetailPage`/`useOrderTransition` de branch (cliente, entrega, detalle, historial, selector de transición).
- **StockPage** (global) — listado + `AdjustStockModal` (copiar de branch) + `SelectField` de sucursal.

### Fase 4 — Sistema

- **StaffPage** (DataTable: nombre, rol, sucursal, estado) + filtro por rol.
- **StaffEditPage** — form (nombre, apellido, email, teléfono, rol, sucursal obligatoria si colaborador, contraseña inicial solo al crear).
- **StatesPage** — DataTable (código, nombre, orden, activo) + modal; advertir que afecta el flujo.
- **ParametersPage** — listado + modal de edición (nombre solo lectura, valor, unidad).

### Fase 5 — Reportes e Inicio

- **ReportsPage** — 4 tabs (más/menos vendidos, sin stock, mayor facturación) + `SelectField` de sucursal (global = todas). Reutiliza estructura de `apps/branch/src/pages/ReportsPage`.
- **HomePage** — accesos rápidos (grid) + pedidos que requieren atención (global), reutilizando `HomePage`/`utils/attention` de branch.

### Fase 6 — Verificación y pulido

- Estados transversales: skeleton (DataTable ya lo hace), `EmptyState` con CTA, errores, confirmaciones destructivas (desactivar/eliminar/transición), toasts de éxito.
- Responsive: verificar 390px y 1280px; tablas con scroll horizontal (`DataTable` ya lo resuelve), acciones en menú en mobile.
- `npm run lint`, `npm run check-types`, `npm run build` (filtrado a `@repo/admin`).
- Opcional: crear `apps/admin/STATUS.md` (mismo formato que `apps/store/STATUS.md`).

---

## 9. Convenciones a respetar (checklist)

- **Skill `frontend-components`:** named exports, `index.tsx` + `types.ts` (+ `hooks/`/`utils/` si aportan), SOC (presentación/lógica/datos separados), Chakra siempre (nunca `div`), Zustand para estado global, layouts en `layouts/`, nada suelto en el router.
- **UI manifesto:** tokens semánticos (nunca hex), `PrimaryButton`/`GhostButton`/`OutlineButton`/etc. (nunca `Button` con colores a mano), `PageTitle`/`Muted`/`Strong`/`Price`, `PageContainer`/`WidePageContainer` como raíz de página, píldora `full` en nav activo, radios `xl`/`2xl`, `tabular-nums` en números, `OrderStatusBadge` para estados, `ResponsiveModal` para diálogos/bottom-sheet, `BackButton` en pantallas empujadas.
- **Formularios:** React Hook Form + Zod + `@hookform/resolvers`; schemas en `@repo/domain`; `FormProvider` + `FormField`/`FormPasswordField`/`FormTextAreaField`; `form.handleSubmit(onValid)`.
- **Datos:** consumir hooks de `@repo/api` (no `fetch` directo en páginas); patrón SWR+fallback para nuevos mocks.
- **Auth:** `RequireAuth roles=['super_admin']`; `authRouteObjects` para las rutas públicas; logout → `authRoutes.login`.
- **Endpoints** (trazabilidad §15): mapear cada hook a su endpoint REST real; mantener los paths `/api/...` del proxy de Vite.

---

## 10. Riesgos / decisiones abiertas

1. **`Branch` colisiona** (tipo store simplificado vs. admin con horarios/coords). → Se crea `AdminBranch` nuevo, sin tocar el existente.
2. **IDs number vs string** entre mocks y GraphQL. → Mantener convención de mocks actual; alinear al conectar API real.
3. **Receta como tab vs. ruta suelta** (§9.2 lista "Recetas de producto"). → Decisión: tab dentro de la edición de producto.
4. **Formularios cortos en modal vs. página** → modal (`ResponsiveModal`) para categoría/ingrediente/promoción/estado/parámetro; página para producto/sucursal/personal (formularios largos).
5. **Duplicar hooks vs. generalizar** (`useGlobalOrders` vs. parametrizar `useBranchOrders`). → Nuevos hooks sin tocar `apps/branch` (menor riesgo); refactor opcional después.
6. **Proxy `/api`** apunta a `http://localhost:3000` (backend). Si el gateway GraphQL corre en 4000, ajustar `vite.config.ts`/`@repo/api` en la fase de conexión (no bloquea el desarrollo mock-first).

---

## 11. Definición de hecho

- Las pantallas G-01…G-15 + Inicio/Pedidos/Stock/Reportes/Perfil existen y son navegables.
- Toda pantalla tiene estados: normal, loading (skeleton), vacío (con CTA) y error.
- `npm run lint`, `npm run check-types` y `npm run build` pasan para `@repo/admin`.
- No se incluye funcionalidad fuera del alcance (§2).
- Se sigue el sistema visual "Calor" y las reglas de `frontend-components` sin excepciones.
