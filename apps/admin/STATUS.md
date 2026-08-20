# STATUS — Admin global app (`client/apps/admin`)

> **Para:** otro agente/LLM que retome el proyecto sin releer todo el código.
> **Actualizado:** agosto 2026.
> **Alcance:** estado completo de la app del Admin global (`super_admin`), cómo está armada, qué es mock vs. real, y el mapa para conectar la API real.
>
> Fuentes de verdad: `docs/requerimientos-frontend.md` (espec funcional §9/§10, pantallas G-01…G-15), `docs/requerimientos-backend-rest.md` (endpoints, trazabilidad §15), `docs/ui-manifesto.md` (identidad "Calor"), skill `frontend-components` (reglas de código).

---

## 1. Contexto general del proyecto

Monorepo Turborepo. Esta app es el **Admin global** (`super_admin`): define lo global (productos, ingredientes/receta, categorías, sucursales, promociones, estados, parámetros, personal) y ve pedidos/stock/reportes de **todas** las sucursales.

| App                        | Carpeta              | Rol            | Puerto (dev) | Estado                                   |
| -------------------------- | -------------------- | -------------- | ------------ | ---------------------------------------- |
| Tienda                     | `apps/store`         | `customer`     | 5173         | Implementada (mock-first)                |
| Admin de sucursal          | `apps/branch`        | `branch_admin` | 5175         | Implementada (mock-first)                |
| **Admin global**           | `apps/admin`         | `super_admin`  | **5174**     | **Implementada (mock-first) — este doc** |
| Auth                       | `packages/auth`      | —              | —            | Compartida, montada dentro de cada app   |

- El backend (GraphQL Gateway + servicios REST) aún no está conectado: la app funciona 100% con mocks (patrón SWR + fallback). Los `fetch` a `/api/...` fallan (no hay backend) y caen al mock.
- La app **replica el patrón de `apps/branch`** (mismo shell, mismos tokens, mismo layout sidebar+drawer) pero con rol `super_admin` y un menú agrupado por secciones.

---

## 2. Stack y comandos

Dependencias (`package.json`, alineadas con `apps/branch`):

| Paquete                  | Uso                                            |
| ------------------------ | ---------------------------------------------- |
| `@chakra-ui/react` ^3.36 | sistema de UI (v3)                             |
| `@repo/components`       | tokens UI compartidos (`DataTable`, `FilterBar`, botones, campos, `ResponsiveModal`, …) |
| `@repo/domain`           | tipos, constantes, schemas Zod                 |
| `@repo/api`              | hooks SWR + mocks + sesión (`useAuthStore`)    |
| `@repo/auth`             | `authRouteObjects`, `authRoutes`, páginas de auth |
| `@repo/theme`            | tokens "Calor" (`config`)                      |
| `react-hook-form` + `zod` + `@hookform/resolvers` | formularios con validación |
| `swr` / `zustand`        | fetching / estado global                       |
| `@gravity-ui/icons`      | iconografía                                    |

Scripts:

```sh
npm run dev -- --filter=@repo/admin   # vite --port 5174
npm run build -- --filter=@repo/admin # tsc -b && vite build
npm run lint -- --filter=@repo/admin  # eslint . --max-warnings 0
npm run check-types -- --filter=@repo/admin
```

---

## 3. Rutas implementadas

Definidas en `src/routes.ts` y montadas en `src/App.tsx` (`useRoutes` + `authRouteObjects` + `RequireAuth roles=['super_admin']`).

**Auth (públicas, desde `@repo/auth`):** `/login`, `/register`, `/forgot-password`, `/reset-password/:token` (montadas por `authRouteObjects`, con logo local).

**Admin global (protegidas, dentro de `AdminLayout`):**

| Ruta                         | Página            | Notas                                              |
| ---------------------------- | ----------------- | -------------------------------------------------- |
| `/`                          | `HomePage`        | accesos rápidos + pedidos que requieren atención   |
| `/categories`                | `CategoriesPage`  | listado + filtro + toggle                          |
| `/categories/new`            | `CategoriesPage`  | abre `CategoryFormModal`                           |
| `/categories/:categoryId/edit` | `CategoriesPage` | abre `CategoryFormModal` en edición                |
| `/products`                  | `ProductsPage`    | listado + filtros + toggle disponibilidad          |
| `/products/new`              | `ProductEditPage` | solo "Datos generales"; al guardar navega a editar |
| `/products/:productId/edit`  | `ProductEditPage` | tabs: Datos / Configuraciones / Receta             |
| `/ingredients`               | `IngredientsPage` | ABM catálogo de materias primas                    |
| `/branches`                  | `BranchesPage`    | listado + filtro + toggle                          |
| `/branches/new`              | `BranchEditPage`  | solo "Información"; al guardar navega a editar     |
| `/branches/:branchId/edit`   | `BranchEditPage`  | tabs: Información / Horarios                       |
| `/promotions`                | `PromotionsPage`  | listado + filtro + toggle                          |
| `/promotions/new`            | `PromotionsPage`  | abre `PromotionFormModal`                          |
| `/promotions/:promotionId/edit` | `PromotionsPage` | abre `PromotionFormModal` en edición               |
| `/staff`                     | `StaffPage`       | listado + filtro por rol + toggle                  |
| `/staff/new`                 | `StaffEditPage`   | formulario crear colaborador/admin                 |
| `/staff/:userId/edit`        | `StaffEditPage`   | formulario editar (sin contraseña)                 |
| `/states`                    | `StatesPage`      | catálogo de estados (modal)                        |
| `/parameters`                | `ParametersPage`  | listado + edición modal                            |
| `/orders`                    | `OrdersPage`      | global, filtros nº/cliente, estado, sucursal       |
| `/orders/:orderId`           | `OrderDetailPage` | detalle + cambio de estado (transiciones)          |
| `/stock`                     | `StockPage`       | global + filtro por sucursal + ajuste              |
| `/reports/products`          | `ReportsPage`     | 4 tabs (más/menos vendidos, sin stock, facturación) |
| `/profile`                   | `ProfilePage`     | datos del `super_admin` con sesión                 |

Helpers de rutas: `categoryEditPath`, `productEditPath`, `branchEditPath`, `promotionEditPath`, `staffEditPath`, `orderDetailPath`.

---

## 4. Feature inventory

### 4.1 Autenticación y protección

- **Sesión:** `useAuthStore` en `@repo/api` (Zustand + persist, key `store-auth`). El `RequireAuth` usa `roles=['super_admin']` y `mockAuth={MOCK_AUTH}` (`VITE_MOCK_AUTH`).
- **UI de auth:** `authRouteObjects` de `@repo/auth` montada dentro de la app; tras login redirige por `role` (`redirectByRole`).
- **Perfil de sesión:** `ProfilePage` usa `useAuthStore.user ?? MOCK_SUPER_ADMIN` (mock `MOCK_SUPER_ADMIN` en `@repo/api/src/mocks/staff.ts`).
- **Logout:** botón "Salir" en el `AdminLayout` → `logout()` + `navigate(authRoutes.login)`.

### 4.2 Catálogo

- **Categorías** (`CategoriesPage` + `CategoryFormModal`): CRUD + toggle activo. Hook `useAdminCategories`.
- **Productos** (`ProductsPage` + `ProductEditPage`): listado con miniatura/categoría/precio/disponibilidad + toggle global. Edición en tres tabs:
  - *Datos generales* — `productSchema` (nombre, descripción, categoría, precio, imagen, disponible).
  - *Configuraciones* — grupos (tipo single/multiple, requerido, min/max) con opciones anidadas (variación de precio, activo). Modales `ConfigGroupFormModal` / `ConfigOptionFormModal`. Eliminar grupo con confirmación.
  - *Receta* — ingrediente + cantidad (modal `RecipeItemFormModal`).
  - Hook `useProductEditor(productId?)` centraliza todo el CRUD del producto.
- **Ingredientes** (`IngredientsPage` + `IngredientFormModal`): CRUD + toggle (no se elimina físicamente, solo desactiva). Hook `useIngredients`.

### 4.3 Operación

- **Sucursales** (`BranchesPage` + `BranchEditPage`): CRUD + toggle + horarios por día (7 días, apertura/cierre/cerrado). Hook `useBranches`.
- **Promociones** (`PromotionsPage` + `PromotionFormModal`): CRUD + toggle, solo información general (sin motor de descuentos). Hook `usePromotions`.
- **Pedidos** (`OrdersPage` + `OrderDetailPage`): listado global con filtros; detalle con cliente, entrega, ítems, historial y selector de transición (reutiliza `useAdminOrder` + `useOrderTransition` de `apps/branch`).
- **Stock** (`StockPage` + `AdjustStockModal`): listado global con filtro por sucursal + ajuste manual. Hook `useGlobalStock`.

### 4.4 Sistema

- **Personal** (`StaffPage` + `StaffEditPage`): listar/crear/editar colaboradores (`branch_admin`, con sucursal obligatoria) y admins globales (`super_admin`). Contraseña inicial solo al crear. Hook `useStaff`.
- **Estados** (`StatesPage` + `OrderStateFormModal`): catálogo de estados (`code` derivado del nombre, `name`, `order`, `active`). Hook `useOrderStates`.
- **Parámetros** (`ParametersPage` + `ParameterFormModal`): listado + edición de valor (clave/unidad de solo lectura). Hook `useParameters`.

### 4.5 Reportes e inicio

- **Reportes** (`ReportsPage`): reutiliza `useProductReports` (4 tabs), alcance global.
- **Inicio** (`HomePage`): grid de accesos rápidos + pedidos que requieren atención agrupados por estado (`utils/attention.ts`, reutiliza `ATTENTION_ORDER_STATUSES`).

---

## 5. Inventario completo

### 5.1 Componentes (`src/components/`)

`Logo` (wrapper con assets locales), `FormSelectField` (select integrado a RHF, no existe en `@repo/components`), y los modales de formulario: `CategoryFormModal`, `IngredientFormModal`, `PromotionFormModal`, `OrderStateFormModal`, `ParameterFormModal`, `ConfigGroupFormModal`, `ConfigOptionFormModal`, `RecipeItemFormModal`, `AdjustStockModal` (delta + motivo, con `hooks/useAdjustStockForm`).

Todos siguen el patrón **RHF + Zod + `FormProvider` + `FormField`/`FormSelectField`/`FormPasswordField` + `ResponsiveModal`**. Se montan condicionalmente (no siempre) según estado local.

### 5.2 Layout (`src/layouts/AdminLayout/`)

Sidebar sticky (desktop) + header + drawer (mobile), espejo de `BranchLayout`. Nav agrupado en secciones (`utils/navigation.ts`):

```text
INICIO        Inicio
CATÁLOGO      Categorías · Productos · Ingredientes
OPERACIÓN     Pedidos · Sucursales · Stock · Promociones
SISTEMA       Personal · Estados · Parámetros
REPORTES      Productos
```

Ítem activo = píldora `brand.700`/`bg.muted`. No incluye `BranchStatusButton` ni `IncomingOrderModal` (eso es específico de sucursal).

### 5.3 Hooks nuevos en `@repo/api`

`useAdminCategories`, `useAdminProducts`, `useProductEditor`, `useIngredients`, `useBranches`, `usePromotions`, `useStaff`, `useOrderStates`, `useParameters`, `useGlobalOrders`, `useGlobalStock`. Reutilizados sin cambios: `useAdminOrder` (detalle + transición), `useProductReports`, `useAuthStore`.

### 5.4 Mocks nuevos en `@repo/api/src/mocks/`

`branches.ts` (`MOCK_BRANCHES` con horarios), `promotions.ts`, `parameters.ts`, `order-states.ts`, `staff.ts` (`MOCK_STAFF` + `MOCK_SUPER_ADMIN`), `global-stock.ts`.

### 5.5 Tipos y schemas nuevos en `@repo/domain`

- Tipos: `AdminBranch`/`BranchHours`/`BranchInput`/`BranchHoursInput`, `Promotion`/`PromotionInput`, `Parameter`/`ParameterInput`, `OrderState`/`OrderStateInput`, `StaffMember`/`StaffInput`, y inputs de catálogo (`CategoryInput`, `ProductInput`, `ConfigGroupInput`, `ConfigOptionInput`, `IngredientInput`, `RecipeItemInput`). `User` ganó `branchId?: string`.
- Schemas (en `schemas.ts`): `categorySchema`, `ingredientSchema`, `productSchema`, `branchSchema`, `promotionSchema`, `staffCreateSchema`, `staffUpdateSchema`, `parameterSchema`, `orderStateSchema`, `configGroupSchema`, `configOptionSchema`, `recipeItemSchema`.

---

## 6. Tema e identidad ("Calor")

Igual que Tienda y Sucursal: `src/theme.ts` hace `createSystem(defaultConfig, config)` con el `config` de `@repo/theme`. Tokens semánticos (nunca hex), Outfit, dark = negro + grises + naranja.

Patrones respetados: `WidePageContainer` en listados/edición, `PageContainer` en detalle de pedido y perfil, `BackButton` en pantallas empujadas, `ResponsiveModal` (dialog desktop / bottom-sheet mobile), `OrderStatusBadge`, radios `xl`/`2xl`/`full`, `tabular-nums` en precios.

---

## 7. Patrón de datos (mock-first)

Todos los hooks nuevos siguen el patrón de `useBranchProducts`/`useAdminOrder`:

```ts
const { data, isLoading, mutate } = useSWR(KEY, async (url) => {
  const json = await getJson<T>(url)
  if (json && /* forma esperada */) return json
  return MOCK   // fallback
})
// mutación:
// 1) mutar el MOCK in-place (array de módulo)
// 2) await mutate(next, { revalidate: false })
// 3) await patchJson/postJson/deleteJson('/api/...', body)  // no-op sin backend
```

Helpers REST en `@repo/api/src/client/rest.ts`: `getJson`, `patchJson`, `postJson`, `deleteJson` (este último agregado para el CRUD de configuraciones/receta).

> **IDs:** entidades de catálogo/sucursales usan `id: number` (mocks); usuarios/órdenes usan `id: string`. El `useProductEditor` usa `Date.now()` para ids nuevos de grupos/opciones/receta.

---

## 8. Conexión con la API real (trazabilidad §15)

| Pantalla | Endpoints REST (vía gateway) |
| --- | --- |
| Categorías | `GET/POST /v1/catalog/categories`, `PATCH /v1/catalog/categories/{id}`, `PATCH .../active` |
| Productos | `GET/POST /v1/catalog/products`, `PATCH /v1/catalog/products/{id}`, `PATCH .../available`, `GET /v1/catalog/categories` |
| Configuraciones | `GET/POST /v1/catalog/products/{id}/configurations`, `PATCH/DELETE .../{groupId}`, `POST/PATCH/DELETE .../options/{optionId}` |
| Receta | `GET/PUT /v1/catalog/products/{id}/recipe`, `POST/PATCH/DELETE .../recipe/items/{itemId}` |
| Ingredientes | `GET/POST /v1/catalog/ingredients`, `PATCH .../{id}`, `PATCH .../{id}/active` |
| Sucursales | `GET/POST /v1/branches`, `PATCH .../{id}`, `PATCH .../active`, `GET/PUT /v1/branches/{id}/hours` |
| Promociones | `GET/POST /v1/catalog/promotions`, `GET/PATCH .../{id}`, `PATCH .../active` |
| Personal | `GET /v1/users`, `POST /v1/users/staff`, `POST /v1/users/admins`, `GET/PATCH /v1/users/{id}`, `PATCH .../active` |
| Estados | `GET/POST /v1/config/order-states`, `PUT .../{code}`, `PATCH .../{code}/active` |
| Parámetros | `GET /v1/config/parameters`, `PATCH /v1/config/parameters/{key}` |
| Pedidos | `GET /v1/orders`, `GET /v1/orders/{id}`, `GET .../history`, `GET .../transitions`, `PATCH .../status` |
| Stock | `GET /v1/stock?branchId=`, `POST /v1/stock/adjustments` |
| Reportes | `GET /v1/reporting/products/{best-sellers,least-sold,out-of-stock,highest-revenue}` |

Nota: los hooks usan paths simplificados `/api/...` (proxy de Vite → `http://localhost:3000` en `vite.config.ts`). Al conectar el gateway (puerto 4000), alinear las rutas reales y el proxy.

---

## 9. Deuda técnica / decisiones a revisar

1. **`useAdminOrder` no está globalizado**: `useAdminOrder`/`useProductReports` son los de `apps/branch` (funcionan igual porque operan sobre los mocks globales), pero conceptualmente convendría variantes globales cuando haya sucursal en el contexto.
2. **`deleteJson` es no-op sin backend**: los borrados de grupos/opciones/receta mutan el mock y llaman a `DELETE`, que cae en `null` sin backend real.
3. **`useOrderStates.create` deriva el `code`** del nombre (`NOMBRE` → `NOMBRE` en mayúsculas con `_`); si el backend requiere `code` explícito, agregar campo al formulario.
4. **`useGlobalOrders`/`useGlobalStock`** comparten key `/api/orders` y `/api/stock` con los hooks de sucursal; si ambas apps convivieran en el mismo bundle habría colisión de caché SWR (no aplica hoy: son apps separadas).
5. **Horarios**: convención `dayOfWeek` 1=Lunes…7=Domingo (`WEEK_DAYS` en `BranchEditPage`). Verificar contra el contrato del backend.
6. **Sin backend instalado en este repo**: todo es mock-first; la verificación de build requiere acceso al registry del proyecto (el `package-lock.json` resuelve contra `npm.artifacts.furycloud.io`).

---

## 10. Cómo levantar

```sh
npm install          # enlaza workspaces + instala deps (requiere acceso al registry)
npm run build -- --filter='./packages/*'
npm run dev -- --filter=@repo/admin
```

- Admin global: http://localhost:5174
- Sin backend, la app funciona 100% con mocks (`VITE_MOCK_AUTH=true` para saltar el login).
