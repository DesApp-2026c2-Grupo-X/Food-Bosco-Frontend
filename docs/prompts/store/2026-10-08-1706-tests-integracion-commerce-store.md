# Tests de integración de flujos de comercio en store

- Fecha: 2026-10-08T17:06:49-03:00
- App: store
- Autor del prompt: usuario

## Prompt

> You are adding tests to the Food Bosco frontend monorepo.
> ROOT: /Users/tbarenghi/Desktop/repos/unahur/Desarrollo De Aplicaciones/Food-Bosco-Frontend
> IMPORTANT: Node 22. Prefix every command: export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:$PATH"
> Conventions: Vitest + globals. Prefer REAL Apollo integration with `createTestClient` from `@test/apollo` + `renderWithProviders({ client })` from `@test/utils` over mocking `@repo/api` (existing page tests mock — your job is the integration layer). `createTestClient(handler)` records operations; assert with `requestsByName`/`lastRequest`/`operationVariables`. Handler returns per-`operation.operationName` so mutation + refetch(MyCart) can differ. NO comments. Read `apps/store/src/pages/CheckoutPage/__tests__/CheckoutPage.test.tsx`, `apps/store/src/components/CartDrawer/__tests__/CartDrawer.test.tsx`, `apps/store/src/pages/ProductDetailPage/hooks/__tests__/useProductConfig.test.tsx` first. Do NOT modify source unless a genuine bug (report it).
>
> Scope: STORE commerce flows end-to-end at page level. Add NEW test files:
>
> 1. `apps/store/src/pages/CartPage/__tests__/CartPage.integration.test.tsx`: real `useCart`; click +1 issues `UpdateCartItem` and refetches `MyCart` (assert variables), remove issues `RemoveCartItem` + refetch, `isMutating` disables controls, empty state, totals.
> 2. `apps/store/src/components/CartDrawer/__tests__/CartDrawer.integration.test.tsx`: real `useCart`; update/remove from drawer + footer link target changes when cart empties after removal; loading/empty.
> 3. `apps/store/src/pages/CheckoutPage/__tests__/CheckoutPage.flow.test.tsx`: selected address + real MyCart query → click confirm issues `CreateOrder` with `{addressId}`, success screen shown; error path stays + notifyError (mock only the notifier); disabled until address; loading while creating.
> 4. `apps/store/src/pages/ProductDetailPage/__tests__/ProductDetailPage.test.tsx`: loading skeleton; single option replaces, multiple toggles; quantity stepper; notes; add success navigates to `/cart`; add failure inline error; not-found. Use real `useProduct`/`useCart` via createTestClient.
>
> Read each page/component source for exact operation names/variables. Run your files from ROOT. Ensure all pass. Report files added, tests added, bugs found.

## Informe

- Resumen: el usuario pidió crear tests de integración para los flujos de comercio de la tienda (carrito, drawer, checkout y detalle de producto), usando Apollo real en lugar de mocks.
- Objetivo: probar de punta a punta las pantallas de compra con consultas y mutaciones reales, verificando qué operaciones se envían y con qué datos.
- Qué se hizo: se agregaron 4 archivos de test nuevos (22 tests) y se corrieron junto a los tests existentes; todos pasan.
- Puntos clave:
  - Se usó `createTestClient` + `renderWithProviders` con un handler por nombre de operación.
  - Se verifican variables de `UpdateCartItem`, `RemoveCartItem`, `AddCartItem` y `CreateOrder`.
  - El carrito se refresca (`MyCart`) después de cada mutación, y se comprobó con contadores de requests.
  - Se probaron estados de carga, vacío, error, no encontrado y navegación a `/cart`.
- Bugs encontrados: ninguno en el código de producción; no se modificó ningún archivo fuente. Se detectó un test preexistente que falla solo (`OrdersPage.test.tsx`, ajeno a este trabajo).
- Siguiente paso: ninguno.
