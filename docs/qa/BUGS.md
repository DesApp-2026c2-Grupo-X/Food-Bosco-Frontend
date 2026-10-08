# BUGS — Food Bosco (QA funcional con navegador real)

> **Estado:** VIGENTE · **Fecha:** 2026-10-06 (actualizado 2026-10-08). **BUG-001 (High) resuelto.**

Fecha: 2026-10-06
Método: navegación real con Chrome (CDP), snapshots/DOM, verificación cruzada contra la API GraphQL (`http://localhost:4000/graphql`).

Resumen por severidad: **Critical: 0 · High: 1 · Medium: 2 · Low: 3**

---

## BUG-001 — Rider muestra "Conectado" pero el backend lo considera offline y no recibe ofertas

**Severidad:** High
**Aplicación:** Rider
**Rol:** Rider (`repartidor@foodbosco.local`)

### Precondiciones

- Sesión nueva del rider (o con `riderStore.isOnline` persistido en `true`, que es el default).
- Existe un pedido en `ready_for_delivery` en el pool de delivery.

### Pasos para reproducir

1. Iniciar sesión en la app Rider (5176) con la cuenta de repartidor.
2. Observar la pantalla de Inicio: muestra "Conectado" y "Compartiendo ubicación / Buscando viajes cerca tuyo…".
3. Consultar el estado real del repartidor en el backend:
   `query { riderProfile { available } }` → `available: false`.
4. Esperar > 20 s (el polling de ofertas corre cada 15 s): no llega ninguna oferta.
5. Tocar el botón "Conectado" (pasa a "Desconectado") y volver a tocarlo (vuelve a "Conectado").
6. Inmediatamente aparece la oferta de viaje.

### Resultado esperado

El estado de disponibilidad mostrado en la UI debe reflejar el estado real del backend. Si la app muestra "Conectado", el repartidor debería estar disponible y recibir ofertas.

### Resultado obtenido

`riderStore` inicializa `isOnline: true` (valor por defecto) y **nunca sincroniza con el backend al cargar**; sólo envía `setRiderAvailability` cuando el usuario acciona el toggle (`apps/rider/src/hooks/useRideAvailability.ts:14-28`, `apps/rider/src/stores/riderStore.ts:19`). Resultado: la UI dice "Conectado" mientras el backend lo tiene offline, por lo que no se generan ofertas hasta que el rider se desconecta y reconecta manualmente.

### Evidencia

`evidence/rider-home-connected-but-offline.png` (UI "Conectado"); verificación API `riderProfile.available=false`. Tras el toggle off→on la oferta aparece (misma sesión).

### Reproducibilidad

3/3

### Resolución (2026-10-08)

Se reconcilió el estado local con el backend: `useRideAvailability` (`apps/rider/src/hooks/useRideAvailability.ts`) ahora, al cargar el perfil, setea `riderStore.isOnline` con `riderProfile.available`. Además el toggle de `ProfilePage` pasó a ser optimista con **rollback + toast** ante error (antes no revertía). Tests: `useRideAvailability` (reconciliación) y `ProfilePage.availability` (rollback).

---

## BUG-002 — "Eliminar categoría" no elimina: sólo desactiva y el mensaje dice que es irreversible

**Severidad:** Medium
**Aplicación:** Admin
**Rol:** Super admin

### Precondiciones

- Sesión de super_admin en Admin (5174) con al menos una categoría.

### Pasos para reproducir

1. Ir a Catálogo → Categorías.
2. Crear una categoría nueva ("QA Categoría").
3. En la fila, pulsar "Eliminar".
4. Confirmar en el modal ("¿Eliminar la categoría …? Esta acción no se puede deshacer.").

### Resultado esperado

La categoría se elimina definitivamente (o, si es soft-delete, el mensaje y la lista lo reflejan coherentemente).

### Resultado obtenido

La categoría **permanece** en la lista (pasa a estado "Inactiva") y sigue devolviéndose desde la API (`categories`). El hook implementa `remove` como `SET_CATEGORY_ACTIVE(id, false)` (`packages/api/src/hooks/useAdminCategories.ts:40-43`), es decir, desactivación, pese a que el copy promete una acción irreversible. Además, la categoría inactiva sigue apareciendo en el selector de categoría del editor de productos.

### Evidencia

`evidence/admin-category-softdelete.png` ("QA Categoría — Inactiva" aún listada).

### Reproducibilidad

3/3 (comportamiento determinista por código)

---

## BUG-003 — Dirección nueva no queda seleccionada y reabre el selector

**Severidad:** Medium
**Aplicación:** Tienda
**Rol:** Cliente

### Precondiciones

- Sesión de cliente con al menos una dirección.

### Pasos para reproducir

1. Ir a Perfil → Mis direcciones.
2. Pulsar "Agregar dirección".
3. Cargar Nombre / Calle y número / Localidad / Código postal.
4. Pulsar "Continuar" (geocodifica) y luego "Confirmar dirección".

### Resultado esperado

La nueva dirección queda seleccionada (el `selectedAddressId` apunta a la dirección creada). El test unitario `AddressesPage.test.tsx` espera justamente `selectedAddressId === 'new1'` tras crear.

### Resultado obtenido

Al terminar, la app navega a Inicio con el selector "Elegí tu dirección" abierto y `store-address.selectedAddressId = null`; el usuario debe volver a elegir manualmente. Se observa además `StoreLayout` limpiando la selección cuando la lista cacheada de direcciones todavía no contiene el id recién creado (`apps/store/src/layouts/StoreLayout/index.tsx:28-37`).

### Evidencia

Estado `localStorage['store-address'] = {"selectedAddressId":null}` y modal de selección abierto con la dirección "Qa Trabajo" presente. Seleccionarla manualmente sí funciona.

### Reproducibilidad

3/3

---

## BUG-004 — Contador del carrito desactualizado tras confirmar un pedido

**Severidad:** Low
**Aplicación:** Tienda
**Rol:** Cliente

### Pasos

1. Agregar 2 ítems al carrito (badge = 2).
2. Checkout → "Confirmar pedido" (éxito, "¡Pedido confirmado!").
3. Ir a "Mis pedidos" o al detalle del pedido.

### Resultado esperado

El badge del carrito pasa a 0/oculto al vaciarse el carrito tras crear el pedido.

### Resultado obtenido

En las pantallas de pedidos el header sigue mostrando "2" (dato cacheado de Apollo). Al entrar a `/cart` recién ahí se corrige (carrito vacío). Es un estado visual inconsistente tras una acción clave.

### Evidencia

Observado en `/orders` y `/orders/:id` inmediatamente después de confirmar; al visitar `/cart` el carrito figura vacío.

### Reproducibilidad

2/2

---

## BUG-005 — Error de checkout genérico ante stock insuficiente (sin causa accionable)

**Severidad:** Low
**Aplicación:** Tienda
**Rol:** Cliente

### Pasos

1. Tener una sucursal asignada sin stock del ingrediente de un producto (se reprodujo con el ingrediente "Pan de hamburguesa" en 0 en Oeste).
2. Checkout → "Confirmar pedido".

### Resultado esperado

Mensaje que explique el motivo real (p. ej. "Stock insuficiente") o acción sugerida.

### Resultado obtenido

La API responde `INSUFFICIENT_STOCK` con mensaje detallado ("Stock insuficiente para el ingrediente …"), pero la UI sólo muestra "No pudimos confirmar tu pedido. Intentá de nuevo." sin indicar la causa.

### Evidencia

Respuesta GraphQL `INSUFFICIENT_STOCK` obtenida con `createOrder(addressId)`; toast UI genérico.

### Reproducibilidad

2/2

---

## BUG-006 — Login con rol incorrecto en una app no da feedback

**Severidad:** Low
**Aplicación:** Admin / Sucursal / Rider (guard de rol)
**Rol:** Customer (probando Admin)

### Pasos

1. En la app Admin (5174), cerrar sesión.
2. Ingresar con credenciales válidas de un usuario `customer` (`cliente@foodbosco.local`).

### Resultado esperado

Un mensaje claro de "no tenés permisos para esta aplicación" (o redirección a la app correspondiente).

### Resultado obtenido

El login es aceptado por el backend y los tokens quedan guardados en `localStorage`, pero `RequireAuth` (roles `['super_admin']`) rebota a `/login` mostrando el formulario sin ningún mensaje de error. El usuario queda en un estado confuso (parece logueado pero vuelve al login). El bloqueo de rutas sí funciona (navegar a `/orders` redirige a `/login`), el problema es la falta de explicación.

### Evidencia

`localStorage['store-auth'].state.user.role = 'customer'` en el origen 5174 y URL final `/login` sin texto de error.

### Reproducibilidad

2/2

---

## Notas (no clasificadas como bug / fuera de alcance)

- **Toggle abierto/cerrado de la sucursal** (`BranchStatusButton`): ahora persiste en backend (`Branch.active` vía `setBranchActive`); `branch_admin` puede abrir/cerrar su propia sucursal y `super_admin` cualquiera. (Antes era sólo local.)
- **Sucursal: modal de nuevo pedido en pestaña en segundo plano**: el `IncomingOrderModal` y el polling funcionan correctamente con la pestaña activa; en segundo plano el navegador throttlea los timers (comportamiento esperado del browser, no del producto).
- **Catálogo público**: requiere sesión aunque la spec lo describe como público (ver `apps/store/STATUS.md`).
- **Admin**: Promociones y Estados de pedido no tienen UI (confirmado); no se prueban.
- Para validar el ciclo del rider fue necesario **inyectar geolocalización** (el gate de proximidad de 50 m usa la ubicación del navegador). Se simuló la posición del repartidor sobre la sucursal (retiro) y sobre el cliente (entrega). No es un defecto; es una limitación de entorno para poder operar el flujo.
