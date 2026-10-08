# Tests de staff, orders y reports en admin

- Fecha: 2026-10-08T17:23:41-0300
- App: admin
- Autor del prompt: usuario

## Prompt

> You are adding tests to the Food Bosco frontend monorepo.
> ROOT: /Users/tbarenghi/Desktop/repos/unahur/Desarrollo De Aplicaciones/Food-Bosco-Frontend
> IMPORTANT: Node 22. Prefix every command: export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:$PATH"
> Conventions: Vitest + globals. Use `renderWithProviders` from `@test/utils`; existing admin tests mock `@repo/api` — read `apps/admin/src/pages/StaffPage/__tests__/staff-page.test.tsx`, `StaffEditPage/__tests__/staff-edit-page.test.tsx`, `OrdersPage/__tests__/orders-page.test.tsx`, `ReportsPage/__tests__/reports-page.test.tsx` first. Prefer real `createTestClient` integration for reports filter variables; mock where simpler. NO comments. Named imports. Do NOT modify source unless a genuine bug (report it). Do NOT duplicate existing coverage.
>
> Scope: admin staff, orders, reports. Add NEW test files:
>
> 1. `apps/admin/src/pages/StaffPage/__tests__/staff-page-filters.test.tsx`: search by name/email, role filter incl super_admin, branch fallback `—`, loading, edit navigation.
> 2. `apps/admin/src/pages/StaffEditPage/__tests__/staff-edit-create-admin.test.tsx`: create super_admin → no branch field, `CreateAdmin` branch called, navigate `/staff`.
> 3. `apps/admin/src/pages/StaffEditPage/__tests__/staff-edit-roles-and-validation.test.tsx`: editing disables email+role; update payload `{firstName,lastName,phone,branchId}`; phone/email validation; loading shell; cancel navigates `/staff`.
> 4. `apps/admin/src/pages/OrdersPage/__tests__/orders-page-branch-filter.test.tsx`: branch filter alone and combined with status + search; loading; empty-by-filter.
> 5. `apps/admin/src/pages/ReportsPage/__tests__/reports-page-filters.test.tsx`: branch/date-preset/status filters trigger `ReportsOverview` refetch with correct variables (assert via createTestClient if feasible); custom range.
> 6. `apps/admin/src/pages/ReportsPage/__tests__/reports-page-product-tabs.test.tsx`: best sellers / least sold / out of stock / highest revenue data render in tabs.
>
> Read source files for exact operation names/variables/labels. Run your files from ROOT. Ensure all pass. Report files added, tests added, bugs found.

## Informe

- Resumen: el usuario pidió agregar tests nuevos para las páginas de personal, pedidos y reportes de la app admin.
- Objetivo: cubrir filtros, validaciones, navegación y pestañas sin repetir lo ya probado.
- Qué se hizo: se crearon 6 archivos de test y se corrieron junto a los existentes.
- Puntos clave:
  - Se agregaron 26 tests nuevos; los 19 previos siguen pasando (45 en total).
  - Se usó integración real con `createTestClient` para verificar las variables que disparan los filtros de reportes y la mutación `CreateAdmin`.
  - El resto se mockeó `@repo/api`, siguiendo el patrón existente.
  - Se formateó con Prettier y se pasó ESLint sin errores.
  - No se encontraron bugs: no se modificó ningún archivo de código fuente.
- Siguiente paso: ninguno.
