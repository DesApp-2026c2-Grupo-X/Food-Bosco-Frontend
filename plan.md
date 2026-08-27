# Plan — App `branch` (Admin de Sucursal)

> Implementado. `apps/branch` corre en el puerto **5175** (rol `branch_admin`).

## Alcance

El admin de sucursal opera **solo su propia sucursal**: pausa/reactiva productos (sin editarlos), ajusta stock de ingredientes, opera pedidos y ve reportes de productos. No crea/edita productos, ingredientes, categorías, sucursales, promociones ni parámetros.

| Pantalla                          | Ruta                |
| --------------------------------- | ------------------- |
| Login (provisto por `@repo/auth`) | `/login`            |
| Inicio                            | `/`                 |
| Productos (pausar/reactivar)      | `/products`         |
| Stock de ingredientes             | `/stock`            |
| Pedidos                           | `/orders`           |
| Detalle y cambio de estado        | `/orders/:orderId`  |
| Reportes (4 tabs)                 | `/reports/products` |

## Capas

- **`@repo/domain`** (TS puro): `Ingredient`, `BranchStock`, `AdjustStockInput`, `BranchProduct`, `OrderStatusHistory`, `OrderCustomer`, campos opcionales en `Order` (`customer`, `statusHistory`, `availableTransitions`), `ORDER_TRANSITIONS` + `getNextStatuses`, `ProductReportRow`, `OutOfStockRow`, `adjustStockSchema`.
- **`@repo/api`** (SWR + mocks): `useBranchProducts`, `useBranchStock`, `useBranchOrders`, `useAdminOrder`, `useProductReports`; mocks `ingredients`, `branch-stock`, `branch-products`, `branch`, `reports` y `orders` extendido. Sin backend, los hooks caen a mocks.
- **`@repo/components`** (genéricos compartidos): `DataTable` (100% genérica), `ToggleSwitch`, `SelectField`, `FilterBar`.
- **`apps/branch`**: `BranchLayout` (sidebar desktop + drawer mobile), `Logo`, `AdjustStockModal`, y 6 páginas.

## Verificación

- `npm run dev -- --filter=@repo/branch` (puerto 5175).
- Auth mock: `VITE_MOCK_AUTH=true` (ver `.env.example`).
- `lint`, `typecheck`, `check-types` y `build` (turbo) en verde.
