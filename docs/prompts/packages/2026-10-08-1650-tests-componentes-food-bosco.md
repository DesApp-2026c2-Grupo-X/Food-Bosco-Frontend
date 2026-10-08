# Agregar tests a componentes de Food Bosco

- Fecha: 2026-10-08T16:50:42-0300
- App: packages
- Autor del prompt: usuario

## Prompt

> You are adding tests to the Food Bosco frontend monorepo.
> ROOT: /Users/tbarenghi/Desktop/repos/unahur/Desarrollo De Aplicaciones/Food-Bosco-Frontend
> IMPORTANT: use Node 22. Prefix every command: export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:$PATH"
> Run only your tests: `npx vitest run packages/components/src/__tests__/data-table.test.tsx packages/components/src/__tests__/products-list-view.test.tsx packages/components/src/__tests__/orders-list-view.test.tsx packages/components/src/__tests__/crud-list-page.test.tsx packages/components/src/__tests__/edit-page-shell.test.tsx packages/components/src/__tests__/order-detail-view.test.tsx packages/components/src/__tests__/order-detail-shell.test.tsx packages/components/src/__tests__/order-timeline.test.tsx packages/components/src/__tests__/report-filters.test.tsx packages/components/src/__tests__/kpi-card.test.tsx packages/components/src/__tests__/advanced-reports-view.test.tsx packages/components/src/__tests__/ProductReportsView.test.tsx`
> Conventions: Vitest + globals; `renderWithProviders` from `@test/utils`. Mock `@repo/api` with `vi.mock` only for API-backed views (AdvancedReportsView, OrderDetailView, ProductReportsView) — follow the existing `ProductReportsView.test.tsx`. NO comments. Named imports. Read the source components and existing `ProductReportsView.test.tsx` first. Do NOT modify source unless a genuine bug (report it). Do NOT duplicate existing coverage.
>
> Scope — new test files under `packages/components/src/__tests__/`:
>
> 1. `data-table.test.tsx`: error→error EmptyState; isLoading→skeleton rows (count from skeletonRows); empty rows→custom/default empty; onRowClick only when provided; getRowKey.
> 2. `products-list-view.test.tsx`: search name/category; image vs placeholder; availability ToggleSwitch calls onToggle(id,checked) and respects isToggling; create button label; rowAction.
> 3. `orders-list-view.test.tsx`: search by number/client; status filter; showBranchFilter options+filtering; branch label fallback '—'; detail link href; branchColumnHideBelow.
> 4. `crud-list-page.test.tsx`: title/description, search, toolbar, action, DataTable integration, modals slot.
> 5. `edit-page-shell.test.tsx`: isNew bypasses loading/not-found; loading view with loadingTitle; not-found empty; blocked.when empty; normal header/children.
> 6. `order-detail-view.test.tsx` (mock `@repo/api`): not-found empty; sections (client/address/history empty vs entries); transitions select + disabled button until nextStatus; opens confirm modal; confirm/cancel call hook fns; mutating disables; no-transitions message.
> 7. `order-detail-shell.test.tsx`: orderNumber fallback; status badge; showBack.
> 8. `order-timeline.test.tsx`: progressFor mapping for each status (PENDING..DELIVERED, CANCELLED).
> 9. `report-filters.test.tsx`: preset change; custom shows date inputs with min/max; branch/status selects only when provided; change callbacks.
> 10. `kpi-card.test.tsx`: variation >0/<0/0/null color+arrow; percent formatting; hint; variationLabel override.
> 11. `advanced-reports-view.test.tsx` (mock `@repo/api`): default month range; scope='branch' hides branch filter/KPI/chart; scope='admin' shows; error EmptyState; KPI fallbacks; filter passed to hooks.
> 12. Extend `ProductReportsView.test.tsx` (this file is yours): other tabs (best sellers/least sold/highest revenue), error state, filter forwarded.
>
> Read each source first. Charts use recharts; assert loading/empty branches and avoid full chart render if problematic. Run the command above; ensure all pass. Report files added/modified, tests added, bugs found.

## Informe

- Resumen: el usuario pidió crear tests para 11 componentes compartidos y ampliar un test existente.
- Objetivo: cubrir los comportamientos pedidos de cada componente sin romper lo existente.
- Qué se hizo: se leyeron los componentes y el test de referencia; se crearon 11 archivos de test y se amplió `ProductReportsView.test.tsx`.
- Puntos clave:
  - Los tests usan Vitest, `renderWithProviders` y los alias del repo.
  - Se mockeó `@repo/api` solo en las vistas con datos (AdvancedReportsView, OrderDetailView, ProductReportsView).
  - Los gráficos se prueban por sus ramas vacías/carga, sin renderizar recharts lleno.
- Resultado: 70 tests en 12 archivos, todos en verde; lint sin errores.
- Bugs: no se encontró ningún bug genuino; no se modificó código fuente.
- Siguiente paso: ninguno.
