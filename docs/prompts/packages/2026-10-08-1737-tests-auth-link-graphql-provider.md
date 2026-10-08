# Tests de auth-link y GraphQLProvider

- Fecha: 2026-10-08T17:37:28-03:00
- App: packages
- Autor del prompt: usuario

## Prompt

> You are adding tests to the Food Bosco frontend monorepo.
> ROOT: /Users/tbarenghi/Desktop/repos/unahur/Desarrollo De Aplicaciones/Food-Bosco-Frontend
> IMPORTANT: Node 22. Prefix every command: export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:$PATH"
> Conventions: Vitest + globals. NO comments. Named imports. Read the source files first. Do NOT modify source unless a genuine bug (report it).
>
> Scope: `packages/api/src` auth-link + provider layer (currently untested).
>
> 1. `packages/api/src/client/__tests__/apollo-links.test.ts`: test the auth HTTP link behavior in `client/apollo.ts` — Bearer header injected when an access token exists (set `useAuthStore`); missing token → no header; error link: on an UNAUTHENTICATED GraphQL error it calls `refreshAccessToken` once (single-flight) and retries; when no refresh token → logs out; non-UNAUTHENTICATED error passes through untouched. Use Apollo `execute`/`Observable` on the constructed link or `createTestClient`-style with a terminal link that returns errors. If the module exports only the client singleton, test at the highest testable seam and document the approach. Keep it deterministic.
> 2. `packages/api/src/__tests__/GraphQLProvider.test.tsx`: renders children + provides the client (assert a child hook receives it), using `renderWithProviders` via `renderHook` or a probe component.
>
> Run your files from ROOT. Ensure all pass. Report files added, tests added, and whether the link was testable as-is or required a refactor (do NOT refactor source; just report).

## Informe

- Resumen: el usuario pidió agregar tests unitarios a la capa de autenticación de Apollo y al proveedor GraphQL del paquete `@repo/api`.
- Objetivo: cubrir con pruebas el envío del token Bearer, el refresco de sesión ante error UNAUTHENTICATED y el render del proveedor.
- Qué se hizo: se crearon dos archivos de test y se ejecutaron desde la raíz; pasan 9 tests en total.
- Puntos clave:
  - El link no se exporta por separado; se probó desde el cliente Apollo completo simulando `fetch`, que es el punto más alto testeable sin tocar el código.
  - El refresco se probó con dos consultas distintas en paralelo para confirmar que se hace una sola petición de refresco.
  - El caso "sin refresh token" no cierra la sesión en el código actual; se documentó y se reportó como posible bug.
  - El proveedor se probó con un componente sonda que usa `useApolloClient` y con `renderWithProviders`.
- Siguiente paso: decidir si el caso sin refresh token debe cerrar sesión (implicaría cambiar el código fuente).
