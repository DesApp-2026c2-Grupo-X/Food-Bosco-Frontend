# TEST REPORT — Food Bosco (QA funcional end-to-end)

> **Estado:** VIGENTE · **Fecha:** 2026-10-06.

Fecha: 2026-10-06 (hora local ~23:30–00:00, America/Buenos_Aires)
Alcance: 4 aplicaciones frontend + backend (GraphQL), con navegador real (Chrome vía CDP / opencode-browser).
Entorno: store 5173, admin 5174, branch 5175, rider 5176, gateway GraphQL 4000.

Usuarios de prueba (sin exponer secretos): `super_admin` (admin@foodbosco.local), `customer` (cliente@foodbosco.local), `rider` (repartidor@foodbosco.local), `branch_admin` (sucursal.oeste@foodbosco.local, sucursal.centro/norte disponibles). Las contraseñas fueron provistas por el entorno de desarrollo.

---

## Cobertura

- **Aplicaciones probadas:** Tienda, Sucursal, Admin, Rider (4/4).
- **Flujos probados:** 40+
- **Flujos exitosos (funcionan de punta a punta):** login/registro por rol, navegación, dirección, catálogo y filtros, configuración de producto, carrito (alta/edición/baja), checkout y creación de pedido, seguimiento, listados y detalle de pedidos, cambio de estados, stock (consulta y ajuste), productos de sucursal (pausa), categorías (alta y desactivación), ingredientes, sucursales y horarios, personal, parámetros, reportes, perfil, logout, guard de roles, y el ciclo completo de delivery (oferta → aceptar → retiro → entrega → historial/ganancias).
- **Flujos fallidos con bug:** alta de dirección (auto-selección), eliminación real de categoría, feedback de error de checkout/rol, badge de carrito, disponibilidad inicial del rider.
- **Bloqueados / no testeables:** Admin Promociones y Admin Estados de pedido (sin UI implementada); repetir pedido y checkout en 2 pasos (Tienda, sin UI); catálogo público (requiere sesión).

## Resultado por aplicación

### Tienda (store, customer) — OK con observaciones

- Login (válido e inválido), home, selección de dirección existente, catálogo (12 productos), filtro por categoría (`?cat=`), detalle de producto con opciones obligatorias/opcionales (validación: botón deshabilitado hasta elegir "Tamaño"), alta al carrito, edición de cantidad, eliminación, checkout y creación real de pedido, listado y detalle con timeline y mapa, página de sucursales, perfil y logout: **funcionan**.
- Hallazgos: dirección nueva no queda auto-seleccionada (BUG-003); badge de carrito desactualizado tras confirmar (BUG-004); error de checkout genérico con stock insuficiente (BUG-005).

### Sucursal (branch, branch_admin) — OK

- Login, home con "Pedidos que requieren atención", modal de pedido entrante con sonido/detalle, listado de pedidos con filtros, detalle y cambio de estado con transiciones válidas (pending→confirmed→preparing→ready_for_delivery y cancelación), productos de la sucursal con pausa/reactivación, stock con ajuste, reportes (ingresos, ticket promedio, más vendido, ranking) y perfil: **funcionan**.
- El stock se descuenta correctamente al pasar el pedido a "En preparación" (verificado: Pan de hamburguesa 50→48).
- Nota: el toggle "Abierto/Cerrado" del header es sólo local (no persiste en backend).

### Admin (super_admin) — OK con observaciones

- Login, home, categorías (listar/crear/desactivar), productos (listar/editar con 3 pestañas: Datos generales / Configuraciones / Receta), ingredientes, sucursales + edición de horarios, personal (staff de sucursal + admin global no editable), parámetros (velocidad, prep base, distancia máx.), pedidos globales con filtro por sucursal, detalle y cambio de estado, stock global, reportes con filtro y "sucursal con mayor facturación", perfil: **funcionan**.
- Hallazgos: "Eliminar categoría" sólo desactiva (BUG-002); login con rol incorrecto sin feedback (BUG-006).
- Guard de roles: usuario `customer` no accede a rutas admin (redirige a `/login`).

### Rider (rider) — OK con bug importante

- Login, perfil y vehículo, historial con ganancias, recepción de oferta, aceptación, retiro (gate 50 m), entrega y finalización del viaje con ganancia liquidada: **funcionan**.
- Bug: la disponibilidad inicial mostrada ("Conectado") no refleja el backend; el rider no recibe ofertas hasta reconectar manualmente (BUG-001).
- El gate de proximidad (50 m) y el envío de ubicación funcionan; se validaron con geolocalización simulada.

## Flujos cross-app

Escenario completo ejecutado con éxito (Tienda → Backend → Sucursal/Admin → Rider → y de vuelta):

1. **Tienda**: el cliente agrega "Doble Cheddar" (configurado) y confirma el pedido #000001 → asignado automáticamente a **Oeste** (sucursal más cercana y abierta), ETA ~21 min.
2. **X-01**: el pedido aparece en **Sucursal (Oeste)** en "Pedidos que requieren atención" y en **Admin → Pedidos**.
3. **Sucursal**: avanza el estado `pending→confirmed→preparing→ready_for_delivery`; el stock del ingrediente se descuenta al pasar a "En preparación".
4. **X-02**: **Tienda** refleja cada estado en el detalle (timeline) y **Admin** también.
5. **Rider**: al estar online, recibe la oferta (`ready_for_delivery`), la acepta, retira (proximidad a Oeste) y entrega (proximidad al cliente). El pedido pasa a `on_the_way` y luego `delivered`.
6. **X-03 / cierre**: el viaje queda `COMPLETED` con `earnings=$2.574`; **Tienda**, **Sucursal** y **Admin** muestran "Entregado"; el historial del rider muestra el viaje completado.
7. **Integración catálogo/sucursal**: pausar un producto ("Donas") en **Sucursal Oeste** lo hace desaparecer del **catálogo de la Tienda** (verificado), y reaparece al reactivarlo.
8. **Modal de pedido entrante**: con la home de **Sucursal** activa, crear un pedido nuevo en **Tienda** dispara el `IncomingOrderModal` ("Nuevo pedido #000003…") en la sucursal.
9. **Cancelación**: cancelar #000002 desde **Sucursal** se refleja como "Cancelado" en **Tienda** y en la API.

## Bugs

Resumen por severidad (detalle en `BUGS.md`):

| ID      | Severidad | App         | Descripción                                                               |
| ------- | --------- | ----------- | ------------------------------------------------------------------------- |
| BUG-001 | High      | Rider       | "Conectado" no sincroniza con backend; no llegan ofertas hasta reconectar |
| BUG-002 | Medium    | Admin       | "Eliminar categoría" sólo desactiva pese a copy "irreversible"            |
| BUG-003 | Medium    | Tienda      | Dirección nueva no se auto-selecciona; reabre selector                    |
| BUG-004 | Low       | Tienda      | Badge de carrito desactualizado tras confirmar pedido                     |
| BUG-005 | Low       | Tienda      | Error de checkout genérico ante stock insuficiente                        |
| BUG-006 | Low       | Admin/roles | Login con rol incorrecto sin mensaje de error                             |

Total: 0 Critical · 1 High · 2 Medium · 3 Low.

## Limitaciones

- **Promociones** (Admin) y **Estados de pedido** (Admin) no tienen UI: no se pudieron probar desde la interfaz.
- **Tienda**: "Repetir pedido", "catálogo público" y "checkout en 2 pasos" no tienen UI (documentado como pendiente).
- **Rider `/trip` multi-parada**: la home redirige al detalle del pedido; no se pudo probar una pantalla de viaje con múltiples paradas.
- **Horario de sucursales**: al momento de la prueba (23:26) las sucursales estaban cerradas (cierre 23:00), lo que impedía crear pedidos. Se extendió el horario de la sucursal **Oeste** a 00:00–23:59 mediante la propia UI de Admin (acción legítima de administración, no modificación de código) para poder validar el flujo de pedidos.
- **Geolocalización del rider**: se inyectó una posición simulada para satisfacer el gate de proximidad de 50 m (retiro/entrega). Es una limitación de entorno de prueba, no un defecto del producto.
- No se modificó código de frontend ni backend. Los datos de prueba creados (categoría desactivada, dirección "Qa Trabajo", pedidos #000001–#000003) quedan en el entorno de desarrollo.

## Nota sobre el método

- Herramienta principal: navegador real Chrome controlado por CDP (plugin `opencode-chrome-devtools`, repo `different-ai/opencode-browser`), usando snapshots del DOM y acciones reales (navegar, click, fill, screenshot).
- La API GraphQL se usó **sólo como soporte/verificación** (estados, ids, errores reales), no como reemplazo de las pruebas de UI. Cada acción verificable se ejecutó desde la interfaz salvo la inyección de geolocalización descrita.
