# STATUS — Admin global app (`apps/admin`)

> **Actualizado:** 2026-10-06 (revisión contra código).
> **Rol:** `super_admin`. **Puerto:** 5174.
> **Datos:** Apollo Client / GraphQL contra el gateway, a través de `@repo/api`.

## 1. Propósito

Aplicación de administración central: catálogo, sucursales, personal, ingredientes, parámetros,
pedidos globales, stock global y reportes.

## 2. Puntos de entrada

- `src/main.tsx`, `src/App.tsx` (guard `RequireAuth` con `roles={['super_admin']}`).
- Autenticación compartida desde `packages/auth`.
- Navegación en `src/layouts/AdminLayout/utils/navigation.ts`; rutas en `src/routes.ts`.

## 3. Flujos implementados

| Flujo                   | Puntos clave                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| Catálogo: categorías    | `useAdminCategories` + form modal                                   |
| Catálogo: productos     | `useAdminProducts` / `useProductEditor` (grupos, opciones y receta) |
| Ingredientes            | `useIngredients` + form modal                                       |
| Sucursales y horarios   | CRUD de sucursales                                                  |
| Personal (staff/admins) | `useStaff` + form modal                                             |
| Parámetros del sistema  | `useParameters`                                                     |
| Pedidos globales        | `useGlobalOrders`                                                   |
| Stock global            | `useGlobalStock`                                                    |
| Reportes                | `useReportsOverview`, `useProductReports` (`AdvancedReportsView`)   |
| Perfil                  | `src/pages/ProfilePage` (usa un fallback mock cuando falta el dato) |

## 4. Tests

- `src/components/__tests__/form-modals.test.tsx` (modales de alta/edición).
- Cobertura de hooks en `packages/api` (`useStaff`, `useProductEditor`, ...).

## 5. Pendiente / fuera de alcance

- **Promociones** (páginas, `PromotionFormModal`, `usePromotions`): **no implementado**. Solo existen
  tipos y esquemas Zod en `@repo/domain`.
- **Estados de pedido** (`StatesPage`, `OrderStateFormModal`, `useOrderStates`): **no implementado**.
- "Pedidos que requieren atención" en el Home: no implementado.
- Reportes globales y stock global sin tests dedicados.
