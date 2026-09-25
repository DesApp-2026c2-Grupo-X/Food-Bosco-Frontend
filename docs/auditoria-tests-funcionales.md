# Auditoría funcional — Suite de tests y reporte de problemas

Documento acumulativo de los problemas detectados durante el diseño y la ejecución de la
suite de tests funcionales y de comportamiento del monorepo frontend.

> Nota metodológica: la prioridad de la suite es **proteger comportamiento funcional real**
> (validaciones, payloads, estados de loading/éxito/error, carrito, autenticación, tiempo real,
> reglas de negocio), no cobertura porcentual. Los tests viven junto al código en carpetas
> `__tests__/`.

## Infraestructura de tests

- Runner: **Vitest** (`vitest.config.mts` en la raíz) con entorno `jsdom`.
- Librerías: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`.
- Alias de workspace (`@repo/*`) resueltos a `src` para testear contra código fuente.
- Helpers compartidos en `test/`:
  - `test/apollo.ts`: `createTestClient(handler)` — cliente Apollo con link propio que registra
    todas las operaciones (`requests`, `requestsByName`, `lastRequest`) para validar payloads,
    refetch y estados de error/loading.
  - `test/utils.tsx`: `renderWithProviders` / `renderHookWithProviders` con Chakra, Router y
    Apollo.
- Comando: `npm test` (`vitest run`).

### Resumen de la suite

| Área               | Archivos de test | Foco                                                                       |
| ------------------ | ---------------- | -------------------------------------------------------------------------- |
| `@repo/domain`     | 5                | reglas de negocio puras, schemas de formularios, cart, formatos, geo       |
| `@repo/api`        | 16               | mappers, hooks de datos (payloads, loading, error), authStore, tiempo real |
| `@repo/auth`       | 1                | `useAuthForm`, login/registro (incl. rider), redirect, logout              |
| `@repo/components` | 4                | encuesta de filtros, navegación, controles, modales                        |
| `@repo/store`      | 6                | carrito, config de producto, checkout, catálogo, direcciones               |
| `@repo/admin`      | 1                | validación/payload de modales de alta/edición                              |
| `@repo/branch`     | 2                | estado de sucursal y botón de apertura                                     |
| `@repo/rider`      | 7                | disponibilidad, ofertas, countdown, ubicación, vehículo, perfil            |

Total: **42 archivos / 309 tests**.

---

## Problemas detectados

### 1. `@repo/components` no compila: imports inexistentes en `ImageUploadField` — CORREGIDO

- **Aplicación afectada:** `packages/components` y, en cascada, **todas** las apps que importan
  `@repo/components` (`@repo/auth`, `@repo/store`, `@repo/admin`, `@repo/branch`, `@repo/rider`).
- **Funcionalidad:** carga de imagen de producto (`ImageUploadField`, usado por el editor de
  productos del admin).
- **Escenario probado:** cualquier import/construcción de `@repo/components`
  (`npm run build -w @repo/components`) o simplemente importar `@repo/components` desde un test
  (por ejemplo la suite de `@repo/auth`).
- **Comportamiento esperado:** el paquete compila y exporta `ImageUploadField`.
- **Comportamiento actual (antes del fix):** el build falla con
  `Could not resolve "../Muted"` y `Could not resolve "../Strong"`.
- **Posible causa:** `ImageUploadField/index.tsx` importaba `Muted` y `Strong` desde rutas
  `../Muted` y `../Strong`, que no existen. Ambos se exportan desde `../typography`.
- **Severidad / impacto:** **Bloqueante**. Rompía el build de todos los paquetes/aplicaciones
  (el pre-push y `npm run dev`, que construyen `packages/*`, fallan). Además impedía ejecutar
  cualquier test que importara `@repo/components`.
- **Test que lo detectó:** suite `packages/auth/src/__tests__/auth-hooks.test.tsx`
  (importa `@repo/components` indirectamente) y `npm run build -w @repo/components`.
- **Acción:** se aplicó un cambio mínimo y seguro:
  `import { Muted, Strong } from '../typography'`. Se documenta aquí para no “arreglarlo en
  silencio”. Sin este fix no era posible correr la suite de componentes/auth.

### 2. `useIncomingOrder` puede perder pedidos nuevos antes del primer poll

- **Aplicación afectada:** `@repo/api` → usado por `@repo/branch` (aviso de pedido entrante) y
  por los flujos de sucursal.
- **Funcionalidad:** detección de pedidos entrantes por polling (`useIncomingOrder`).
- **Escenario probado:** el primer poll devuelve un lote que **ya incluye** un pedido nuevo; el
  segundo poll agrega un pedido distinto.
- **Comportamiento esperado:** todo pedido que no existía al montar el hook debería disparar el
  aviso entrante.
- **Comportamiento actual:** el primer lote se usa sólo para “sembrar” `seenIds` y **no** notifica.
  Si un pedido llega entre el montaje y la primera respuesta (o la primera respuesta ya trae uno
  nuevo), nunca se muestra el modal.
- **Posible causa:** en `packages/api/src/hooks/useIncomingOrder.ts`, cuando
  `seenIds.current.size === 0` se agregan todos los ids y se retorna sin evaluar “frescos”.
- **Severidad / impacto:** Media. El negocio puede no enterarse de un pedido hasta que refresque
  manualmente.
- **Test que lo detectó / lo fija:**
  `packages/api/src/hooks/__tests__/useIncomingOrder.test.ts` →
  _“ignores the first batch and surfaces only genuinely new orders”_.

### 3. Placeholder de restablecer contraseña inconsistente con la validación

- **Aplicación afectada:** `@repo/auth` (`ResetPasswordPage`) consumido por las 4 apps.
- **Funcionalidad:** restablecer contraseña.
- **Escenario probado:** alta de nueva contraseña con menos de 8 caracteres.
- **Comportamiento esperado:** el hint y la validación deben coincidir.
- **Comportamiento actual:** el input muestra `placeholder="Mínimo 6 caracteres"`, pero
  `newPasswordSchema` exige **mínimo 8**. Un usuario que escriba 6 o 7 verá un error.
- **Posible causa:** texto de placeholder desactualizado respecto del schema en
  `packages/domain/src/schemas.ts`.
- **Severidad / impacto:** Baja (UX, no rompe datos).
- **Test que lo detectó:**
  `packages/domain/src/__tests__/schemas.test.ts` →
  _“new password enforces at least 8 characters”_ (y lectura de `ResetPasswordPage/index.tsx`).

### 4. `useRiderHome` no descarta la oferta aceptada hasta el refetch

- **Aplicación afectada:** `@repo/rider`.
- **Funcionalidad:** aceptar/rechazar ofertas de viaje.
- **Escenario probado:** aceptar una oferta y observar `visibleOffer` / estado del botón.
- **Comportamiento esperado:** tras aceptar, la oferta no debería poder aceptarse dos veces.
- **Comportamiento actual:** `handleAccept` sólo llama a `accept(offer.id)`; `visibleOffer` se
  mantiene hasta que el refetch de `TRIP_OFFERS` la elimina. Entre el fin de la mutación y el
  refetch (o si el refetch no la quita), el botón “Aceptar” vuelve a estar habilitado, habilitando
  una doble acción.
- **Posible causa:** no se hace dismiss local de la oferta aceptada (a diferencia del rechazo, que
  sí setea `dismissedOfferId`).
- **Severidad / impacto:** Media-baja. Riesgo de doble aceptación / requests duplicados.
- **Test que lo detectó / lo fija:**
  `apps/rider/src/hooks/__tests__/useRiderHome.test.ts` → _“accepts the current offer”_
  (contrasta con _“dismisses and rejects the offer”_).

### 5. El submit de los `FormModal` permanece deshabilitado hasta hacer blur

- **Aplicación afectada:** `@repo/admin` (modales de alta/edición) y cualquier formulario que use
  `FormModal` con `mode: 'onTouched'`.
- **Funcionalidad:** alta/edición de categorías, ingredientes, grupos/opciones de configuración,
  parámetros y receta.
- **Escenario probado:** completar un campo con un valor válido y esperar a que el botón “Guardar”
  se habilite.
- **Comportamiento esperado:** con datos válidos, el botón debería habilitarse.
- **Comportamiento actual:** `react-hook-form` sólo recalcula `isValid` al validar; con
  `mode: 'onTouched'` la validación ocurre al hacer **blur**. Mientras el usuario escribe y no sale
  del campo, el botón sigue deshabilitado.
- **Posible causa:** combinación de `mode: 'onTouched'` con `disabled={!form.formState.isValid}`
  (o `mode: 'onChange'`).
- **Severidad / impacto:** Baja (UX). Puede percibirse como botón “trabado”.
- **Test que lo detectó / lo fija:**
  `apps/admin/src/components/__tests__/form-modals.test.tsx` (varios casos hacen `tab()`/blur antes
  de habilitar el submit).

### 6. Observación: `formatOrderDate` recibe opciones de hora que `toLocaleDateString` ignora

- **Aplicación afectada:** `@repo/domain` → `apps/store` (`OrdersPage`, `OrderDetailPage`),
  `@repo/components` (`OrdersListView`, `OrderDetailView`), `@repo/rider` (`TripCard`).
- **Funcionalidad:** formateo de fechas de pedido.
- **Escenario observado:** `formatOrderDate` declara `hour`/`minute` en las opciones pero usa
  `toLocaleDateString`, que los ignora; el resultado es sólo fecha. `formatOrderTime` existe aparte.
- **Impacto:** Bajo. No rompe el comportamiento actual (las vistas combinan `formatOrderDate` con
  `formatOrderTime` cuando necesitan la hora), pero es una inconsistencia a limpiar.
- **Test relacionado:** `packages/domain/src/__tests__/format.test.ts`.

---

## Notas de diagnóstico descartadas

- Durante la validación del build apareció un error de tipos
  (`'@repo/domain' has no exported member named 'formatOrderTime'`). Se debía a los `dist`
  desactualizados de `@repo/domain` al construir `@repo/components` en forma aislada. Al reconstruir
  los paquetes respetando el orden (`turbo run build --filter="./packages/*"`) el build pasa. **No es
  un bug de código.**
