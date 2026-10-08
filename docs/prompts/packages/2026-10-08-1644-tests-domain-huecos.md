# Tests de dominio y cobertura de huecos

- Fecha: 2026-10-08T16:44:00-03:00
- App: packages
- Autor del prompt: usuario

## Prompt

> You are adding tests to the Food Bosco frontend monorepo.
> ROOT: /Users/tbarenghi/Desktop/repos/unahur/Desarrollo De Aplicaciones/Food-Bosco-Frontend
> IMPORTANT: use Node 22. Prefix every command: export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:$PATH"
> Run only your tests: `npx vitest run packages/domain` (from ROOT).
> Conventions: Vitest + globals, tests under `packages/domain/src/__tests__/`. Named imports. NO comments in code. Follow existing test style (read the existing files first). Do NOT modify source code unless a test uncovers a genuine bug (then report it, fix only if clearly correct). Do NOT duplicate existing coverage.
>
> Your scope: `packages/domain`. Existing tests cover branch/cart/format/geo/misc/report-range/schemas/stock-schemas. Fill these gaps:
>
> 1. `attention.ts:groupAttentionOrders` → groups orders by each status in ATTENTION_ORDER_STATUSES order, drops empty groups, excludes DELIVERED/CANCELLED, []→[]. New file `attention.test.ts`.
> 2. `admin-branch.ts` `DEFAULT_HOURS`/`WEEK_DAYS` → 7 entries dayOfWeek 0–6, Mon-first labels, default 09:00–23:00, closed:false. New file `admin-branch.test.ts`.
> 3. `branch.ts:isBranchOpenNow` boundaries → exactly at opening (true), exactly at closing (false), malformed time strings → closed. Extend `branch.test.ts`.
> 4. `report-range.ts` edges → custom preset with missing customFrom/customTo defaults to today; startOfWeek on Sunday (getDay()===0) → previous Monday; direct startOfDay/endOfDay/startOfWeek. Extend `report-range.test.ts`.
> 5. `schemas.ts` missing → riderProfileSchema, staffUpdateSchema collaborator-requires-branch, productSchema optional image max, branchSchema phone max. Extend `schemas.test.ts`.
> 6. `user.ts` `isStaffRole`, ROLE_LABELS/ROLE_OPTIONS consistency; `product-list.ts` toProductListLine remaining branches if any; `format.ts` formatElapsed exact-60 branch. Only add if not already covered (read `misc.test.ts`/`format.test.ts` first).
>
> Read the source files and existing tests before writing. Aim for meaningful behavior assertions, not line coverage. When done, run `npx vitest run packages/domain` and ensure all pass. Report: files added/modified, number of tests added, and any source bug found.

## Informe

- Resumen: el usuario pidió agregar tests al paquete `packages/domain` para cubrir casos que faltaban.
- Objetivo: mejorar la cobertura de comportamiento sin duplicar tests ya existentes ni tocar el código de producción.
- Qué se hizo: se leyeron fuentes y tests previos; se crearon 2 archivos de test y se extendieron 5 existentes con 26 casos nuevos.
- Puntos clave:
  - Nuevos: `attention.test.ts` (4 tests) y `admin-branch.test.ts` (4 tests).
  - Extendidos: `branch`, `report-range`, `schemas`, `misc` y `format` (18 tests en total).
  - No se encontraron bugs de código fuente; los errores de tipos marcados por el editor en tests ya existían antes.
  - Resultado: `npx vitest run packages/domain` → 143 tests, todos pasan; lint de los archivos nuevos sin errores.
- Siguiente paso: ninguno.
