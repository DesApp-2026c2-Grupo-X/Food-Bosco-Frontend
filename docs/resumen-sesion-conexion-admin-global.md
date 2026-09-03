# Resumen de sesión — Conexión del Admin global al API Gateway

**Fecha:** 2026-09-03
**Repos:** `Food-Bosco-Frontend` (frontend) ↔ `Food-Bosco-API` (gateway + microservicios)
**Alcance:** conectar el frontend del Admin global (`apps/admin`, rol `super_admin`) al GraphQL Gateway y los microservicios REST.

---

## 1. Objetivo

El Admin global ya estaba construido pero funcionaba **100% con mocks** (patrón SWR + fallback REST). La sesión consistió en **cablear toda la capa de datos de esa app contra el GraphQL Gateway real** (puerto 4000), replicando el patrón que ya usaba la app Tienda (`apps/store`), que fue conectada en el commit previo `d038845`.

---

## 2. Estado previo

- **Frontend `apps/admin`:** completo (17 páginas + layout + modales), pero sus hooks consumían `getJson/patchJson/postJson/deleteJson` contra `/api/...` (proxy apuntaba a `:3000`, que no existe) y caían a mocks.
- **Auth ya conectada:** `@repo/api/src/stores/authStore.ts` y `client/operations.ts` ya usaban Apollo GraphQL (`/graphql`) para login/registro/me/direcciones.
- **App Tienda ya conectada:** `packages/api/src/client/store.ts` ya tenía los documentos GraphQL y mappers (`toCategory`, `toProduct`, `toOrder`, `toBranch`, …) usados por sus hooks.
- **Gateway (`Food-Bosco-API/apps/gateway`):** completo. Expone `/graphql` en `:4000`, resuelve contra los servicios REST (`auth:4201`, `commerce:4202`, `delivery:4203`).

---

## 3. Cambios realizados

### 3.1 Nuevo: `packages/api/src/client/admin.ts`

Capa de datos GraphQL del admin. Contiene:

- **Mappers** de GraphQL → tipos de `@repo/domain`: `toIngredient`, `toPromotion`, `toParameter`, `toOrderState`, `toStaffMember`, `toBranchStock`, `toProductReportRow`, `toOutOfStockRow`, más `toConfigGroupType` (convierte `'single'/'multiple'` → `SINGLE/MULTIPLE`).
- Re-exporta de `./store`: `toCategory`, `toProduct`, `toBranch`, `toOrder`.
- **Documentos GraphQL** (queries + mutations) para: categorías, productos (lista con `category`, detalle con `configGroups`/`recipe`), ingredientes, promociones, sucursales (+horarios), personal (`users`), parámetros, estados de pedido, pedidos (lista/detalle), stock global, los 4 reportes y todas las mutaciones CRUD + toggles + `changeOrderStatus` + `adjustStock`.

### 3.2 Hooks migrados a Apollo (`useQuery`/`useMutation`)

Reescritos, conservando **la misma interfaz pública** (las páginas no cambiaron):

| Hook | Antes | Ahora |
| --- | --- | --- |
| `useAdminCategories` | SWR + mock | `useQuery(ADMIN_CATEGORIES)` + mutaciones + `refetch` |
| `useAdminProducts` | SWR + mock | `useQuery(ADMIN_PRODUCTS)` + `setProductAvailable` |
| `useProductEditor` | SWR + mock | `useQuery(ADMIN_PRODUCT)` + CRUD grupos/opciones/receta |
| `useIngredients` | SWR + mock | `useQuery(ADMIN_INGREDIENTS)` + CRUD/toggle |
| `useBranches` | SWR + mock | `useQuery(ADMIN_BRANCHES)` + CRUD/toggle/saveHours |
| `usePromotions` | SWR + mock | `useQuery(ADMIN_PROMOTIONS)` + CRUD/toggle |
| `useStaff` | SWR + mock | `useQuery(ADMIN_USERS)` + `createStaff/createAdmin/updateUser/setUserActive` |
| `useOrderStates` | SWR + mock | `useQuery(ADMIN_ORDER_STATES)` + CRUD/toggle |
| `useParameters` | SWR + mock | `useQuery(ADMIN_PARAMETERS)` + `updateParameter` |
| `useGlobalOrders` | SWR + mock | `useQuery(ADMIN_ORDERS)` |
| `useGlobalStock` | SWR + mock | `useQuery(ADMIN_BRANCH_STOCK)` + `adjustStock` |
| `useAdminOrder` (compartido) | SWR + mock | `useQuery(ADMIN_ORDER)` + `changeOrderStatus` |
| `useProductReports` (compartido) | SWR + mock | 4 `useQuery` (best/least/out-of-stock/highest-revenue) |

### 3.3 Configuración

- `apps/admin/vite.config.ts`: el proxy `/api → :3000` se reemplazó por **`/graphql → http://localhost:4000`** (igual que Tienda), más `optimizeDeps.exclude` de los `@repo/*`.
- `apps/admin/.env.local`: `VITE_MOCK_AUTH=false` (login real contra el gateway).
- `apps/admin/.env.example`: creado (URLs + `VITE_MOCK_AUTH=false`).

---

## 4. Decisiones y limitaciones

1. **Sin fallback a mocks:** los hooks migrados dejaron de caer a mocks (igual que Tienda). Con backend arriba y `VITE_MOCK_AUTH=false`, la app es 100% real. Sin backend, las listas quedan vacías.
2. **`useAdminOrder` y `useProductReports` son compartidos** con `apps/branch`. Al migrarlos a GraphQL, el detalle de pedido y los reportes de la app Sucursal también quedaron conectados (el resto de hooks de sucursal sigue mock-first).
3. **`categories.remove`** mapea a `setCategoryActive(id, false)` (el backend no tiene borrado físico de categorías; solo activar/desactivar). "Eliminar" en la UI equivale a desactivar.
4. **Edición de personal:** el backend (`UpdateUserInput`) solo permite cambiar nombre/apellido/teléfono/sucursal (no email ni rol). `useStaff.update` envía esos campos; el email y el rol del formulario de edición no persisten contra la API (limitación del contrato).
5. **IDs:** se usa la convención de dominio (`string`). El `create` de sucursal devuelve el `id` real del servidor (`createBranch.id`), que se usa para navegar a la edición.
6. **Reportes globales:** se consultan sin `branchId` (alcance = todas las sucursales).

---

## 5. Verificación

Ejecutado y en verde en `Food-Bosco-Frontend`:

```sh
npx turbo run check-types typecheck   # 9/9 OK (domain, theme, api, components, auth, store, branch, rider, admin)
npx turbo run lint --filter=@repo/api --filter=@repo/admin   # OK
npx turbo run build --filter=@repo/admin   # OK (vite build)
```

> **Nota de entorno:** la máquina tenía los binarios nativos opcionales de rollup/esbuild/rolldown sin instalar (bug conocido de npm con optional deps), lo que rompía `tsup`/`vite build` y dejaba un `dist` de `@repo/domain` desactualizado. Se instalaron localmente con `--no-save`: `@rollup/rollup-win32-x64-msvc`, `@esbuild/win32-x64`, `@rolldown/binding-win32-x64-msvc`. Sin esto, `check-types` resolvía tipos viejos del `dist`.

---

## 6. Cómo levantar el sistema end-to-end

1. **Backend** (`Food-Bosco-API`): MongoDB en `localhost:27017`, luego:
   ```sh
   npm run dev        # gateway :4000 + auth :4201 + commerce :4202 + delivery :4203
   ```
   Y seed (opcional, crea el `super_admin`):
   ```sh
   curl -X POST http://localhost:4000/seed
   ```
   (o los seeds individuales de cada servicio; ver `apps/*/src/seed/`).

2. **Credenciales `super_admin`** (default del seed):
   - email: `admin@foodbosco.local`
   - password: `Admin123!`

3. **Frontend Admin global** (`Food-Bosco-Frontend`):
   ```sh
   npm run build -- --filter="./packages/*"   # generar dist de los paquetes
   npm run dev -- --filter=@repo/admin        # http://localhost:5174
   ```
   El login redirige al Admin global (`super_admin`) por `role`.

---

## 7. Pendientes / próximos pasos

- Conectar el resto de hooks mock-first de **`apps/branch`** (`useBranchProducts`, `useBranchStock`, `useBranchOrders`, `useIncomingOrder`) y de **`apps/rider`** (`useRiderProfile`, `useTripOffers`, `useActiveTrip`, `useMyTrips`) siguiendo el mismo patrón.
- Validar el comportamiento de `useStaff.update` (email/rol no editables por contrato) con el equipo de backend, si se requiere.
- Reconsiderar `categories.remove`: confirmar si "Eliminar" debe ser solo desactivar o si el backend debería agregar borrado lógico/físico.
- Documentar credenciales de seed en el README del backend.
