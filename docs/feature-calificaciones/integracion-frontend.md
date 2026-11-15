# Calificaciones — Integración frontend

## Alcance

- `apps/store`: el cliente califica sucursal y repartidor desde el detalle o el historial de un pedido entregado.
- `apps/branch`: calificaciones de la sucursal autenticada.
- `apps/admin`: resumen global y rankings.
- `apps/rider`: reputación personal.

## Archivos principales

- `packages/domain/src/review.ts`: tipos `OrderReview`, `OrderReviewStatus`, estadísticas y rankings.
- `packages/api/src/client/reviews.ts`: operaciones GraphQL y mappers.
- `packages/api/src/hooks/useOrderReviews.ts`: hooks Apollo.
- `packages/components/src/StarRating`: selector accesible de 1 a 5 estrellas.
- `packages/components/src/ReviewStatsPanel`: panel reutilizable de promedio, distribución y comentarios.
- `apps/store/src/components/ReviewOrderModal`: pantalla "¿Cómo estuvo tu pedido?".
- `apps/branch/src/pages/RatingsPage`: vista de sucursal.
- `apps/admin/src/pages/RatingsPage`: vista global.
- `apps/rider/src/pages/ProfilePage`: tarjeta de reputación.

## Reglas de experiencia

- El bloque de repartidor solo aparece si `order.riderId` existe.
- Ambas calificaciones son obligatorias cuando corresponde; los comentarios son opcionales.
- El botón se bloquea durante el envío y se evita el doble click.
- Éxito: toast y cierre del modal.
- Error: mensaje traducido y modal abierto para reintentar.
- El historial y el detalle se actualizan mediante `refetchQueries` después de la mutación.

## Contratos

La definición completa de tipos, queries y mutation está en el repositorio API:

`Food-Bosco-API/docs/feature-calificaciones/contratos-graphql.md`

## Pruebas

- `packages/components/src/__tests__/star-rating.test.tsx`
- `apps/store/src/components/ReviewOrderModal/__tests__/ReviewOrderModal.test.tsx`
- `apps/store/src/pages/OrderDetailPage/__tests__/OrderDetailPage.test.tsx`
- `apps/store/src/pages/OrdersPage/__tests__/OrdersPage.test.tsx`

Resultados de la sesión:

- Store: 44 archivos, 218 tests aprobados.
- Rider: 30 archivos, 141 tests aprobados.
- Branch: 17 archivos, 74 tests aprobados.
- Admin: flujos `product-editor-flow` y `staff-flow` aprobados de forma individual.
- Build y lint del monorepo completados correctamente.
