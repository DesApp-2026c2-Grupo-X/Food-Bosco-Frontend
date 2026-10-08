# Tests E2E de flujo rider y branch

- Fecha: 2026-10-08T17:38:53-03:00
- App: general
- Autor del prompt: usuario

## Prompt

> You are adding end-to-end (integration) tests to the Food Bosco frontend monorepo.
> ROOT: /Users/tbarenghi/Desktop/repos/unahur/Desarrollo De Aplicaciones/Food-Bosco-Frontend
> IMPORTANT: Node 22. Prefix every command: export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:$PATH"
> Conventions: Vitest + globals. Use `renderWithProviders` from `@test/utils` and `createTestClient` from `@test/apollo`. Mount REAL route trees of pages/components with REAL `@repo/api` hooks backed by one stateful `createTestClient` handler (switch on operationName, mutate in-memory state so mutations reflect subsequent queries). Set `useAuthStore` state for the role. Mock only hard boundaries (geolocation via a `navigator.geolocation` stub, `window.open`, audio, Leaflet via partial mock of `@repo/components`/InteractiveMap if needed). Do NOT `vi.mock('@repo/api')`. NO comments. Read the app sources and existing tests for exact labels/operation names. Do NOT modify source unless a genuine bug (report it).
>
> Deliverables:
>
> 1. `apps/rider/src/__tests__/delivery-flow.test.tsx`: rider online with location → HomePage shows a trip offer (TripOfferCard) → accept (assert accept mutation) → active trip appears and HomePage redirects to `/trip/:orderId` → TripOrderDetailPage shows pickup gate in range → confirm pickup (assert pickup payload) → status becomes ON_THE_WAY → deliver (assert deliver payload) → navigates home; then complete trip disappears and history shows it. Include: reject offer → searching empty state; proximity >50m blocks pickup.
> 2. `apps/branch/src/__tests__/order-management-flow.test.tsx`: branch HomePage lists an order in "requieren atención" → navigate to `/orders` → open `/orders/:orderId` → select next transition → confirm (assert changeStatus payload) → the order's status updates in the list after refetch. Include: cancel confirm without mutation; order with no transitions shows the empty message.
>
> Keep deterministic. If a full App mount is too broad, compose a focused `<Routes>` with the relevant pages under MemoryRouter (still cross-page E2E). Run only your files from ROOT, and run each 3 times to confirm no flakiness. Report files, test counts, operations simulated, bugs found.

## Informe

- Resumen: el usuario pidió crear tests de integración de punta a punta para la app del repartidor y la de sucursal.
- Objetivo: asegurar con pruebas automáticas que los flujos reales de entrega y de gestión de pedidos funcionan de principio a fin.
- Qué se hizo: se crearon dos archivos de test que montan las páginas reales con datos simulados que cambian a medida que se usan.
- Puntos clave:
  - Rider: oferta, aceptar, retirar, entregar e historial, más rechazo y bloqueo por distancia.
  - Sucursal: pedido en atención, cambio de estado en la lista, cancelar y caso sin transiciones.
  - No se tocó el código de la aplicación; no se encontraron errores de producto.
  - Cada archivo se corrió 3 veces seguidas sin fallos.
- Siguiente paso: ninguno.
