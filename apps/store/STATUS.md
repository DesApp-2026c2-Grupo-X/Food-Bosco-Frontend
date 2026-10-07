# STATUS — Store app (`apps/store`)

> **Actualizado:** 2026-10-06 (revisión contra código).
> **Rol:** `customer`. **Puerto:** 5173.
> **Datos:** Apollo Client / GraphQL contra el gateway, a través de `@repo/api`.

## 1. Propósito

Aplicación de tienda para clientes: explorar el catálogo, configurar productos, manejar el carrito,
confirmar pedidos, ver el historial/seguimiento y administrar el perfil y las direcciones.

## 2. Puntos de entrada y rutas

- `src/main.tsx` monta la app; `src/App.tsx` define las rutas.
- Autenticación compartida desde `packages/auth` (`authRouteObjects`).
- Rutas propias (protegidas con `RequireAuth`): catálogo, producto, checkout, pedidos, perfil,
  direcciones/sucursales.
- **Nota:** hoy el catálogo y el detalle de producto requieren sesión (`RequireAuth`); la
  especificación los describe como públicos (pendiente).

## 3. Flujos implementados

| Flujo | Puntos clave |
| --- | --- |
| Login / registro / recuperación | `packages/auth` |
| Selección de dirección | `src/stores/addressStore.ts`, `src/hooks/useAddressFlow.ts`, `AddressPickerModal` (se abre desde `StoreLayout` si falta la dirección) |
| Catálogo y filtros | `src/pages/CatalogPage` |
| Detalle + configurador de producto | `src/pages/ProductDetailPage` + `hooks/useProductConfig` |
| Carrito (server-side) | `useCart` de `@repo/api`; alta/edición/eliminación |
| Checkout | `src/pages/CheckoutPage` → `useCreateOrder` crea el pedido real |
| Pedidos / seguimiento | `src/pages/OrdersPage`, `src/pages/OrderDetailPage` (polling) |
| Perfil / edición | `src/pages/ProfilePage`, `src/pages/EditProfilePage` |
| Sucursales | `src/pages/SucursalesPage` |

## 4. Estado y datos

- Estado global con Zustand (`src/stores/*`) y estado de servidor con hooks de `@repo/api`
  (Apollo: `useCatalog`, `useCart`, `useCreateOrder`, `useProfile`, `useOrder`, ...).
- **No** hay SWR ni capa REST/mocks; pertenece a un diseño anterior.

## 5. Tests

- `src/pages/CatalogPage/__tests__/CatalogPage.test.tsx`
- `src/pages/ProductDetailPage/hooks/__tests__/useProductConfig.test.tsx`
- `src/pages/CheckoutPage/__tests__/CheckoutPage.test.tsx`
- `src/stores/__tests__/addressStore.test.ts`
- `src/hooks/__tests__/useAddressFlow.test.tsx`

## 6. Pendiente / fuera de alcance

- **Repetir pedido** (backend listo, sin UI).
- Catálogo público y checkout en dos pasos.
- Edición de observaciones/opciones del carrito desde la UI.
