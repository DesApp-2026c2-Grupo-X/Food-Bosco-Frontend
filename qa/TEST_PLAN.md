# QA Test Plan — Food Bosco

Fecha: 2026-10-06
Autor: QA autónomo (opencode-browser / Chrome DevTools Protocol)
Alcance: prueba funcional end-to-end de las 4 experiencias frontend + backend.

## Entorno

| Servicio          | URL                           | Rol          |
| ----------------- | ----------------------------- | ------------ |
| Tienda (store)    | http://localhost:5173         | customer     |
| Admin             | http://localhost:5174         | super_admin  |
| Sucursal (branch) | http://localhost:5175         | branch_admin |
| Rider             | http://localhost:5176         | rider        |
| Gateway GraphQL   | http://localhost:4000/graphql | API          |

Usuarios de prueba: `admin@foodbosco.local` (super_admin), `cliente@foodbosco.local` (customer),
`repartidor@foodbosco.local` (rider), `sucursal.centro@foodbosco.local` / `.norte` / `.oeste` (branch_admin).
Las contraseñas no se registran en este documento (provistas por el entorno de desarrollo).

Método: navegación real con Chrome (CDP). La API GraphQL se usa solo como soporte/verificación.

## Matriz de pruebas

| ID | Aplicación | Flujo | Prioridad | Estado |
|---|---|---:|---|
| T-01 | Tienda | Login customer | Crítica | Pendiente |
| T-02 | Tienda | Login inválido (error visible) | Alta | Pendiente |
| T-03 | Tienda | Home carga | Media | Pendiente |
| T-04 | Tienda | Crear/seleccionar dirección (requerida) | Crítica | Pendiente |
| T-05 | Tienda | Catálogo lista productos | Crítica | Pendiente |
| T-06 | Tienda | Detalle de producto + configuración + agregar al carrito | Crítica | Pendiente |
| T-07 | Tienda | Carrito: ver/cambiar cantidad/eliminar | Alta | Pendiente |
| T-08 | Tienda | Checkout → crear pedido | Crítica | Pendiente |
| T-09 | Tienda | Mis pedidos + detalle/seguimiento | Crítica | Pendiente |
| T-10 | Tienda | Perfil | Media | Pendiente |
| T-11 | Tienda | Logout | Media | Pendiente |
| B-01 | Sucursal | Login branch_admin | Crítica | Pendiente |
| B-02 | Sucursal | Home: pedidos que requieren atención | Alta | Pendiente |
| B-03 | Sucursal | Lista de pedidos | Alta | Pendiente |
| B-04 | Sucursal | Cambiar estado pending→confirmed→preparing→ready_for_delivery | Crítica | Pendiente |
| B-05 | Sucursal | Productos de la sucursal + pausar/reactivar | Alta | Pendiente |
| B-06 | Sucursal | Stock + ajuste | Alta | Pendiente |
| B-07 | Sucursal | Reportes | Media | Pendiente |
| B-08 | Sucursal | Perfil | Baja | Pendiente |
| R-01 | Rider | Login rider | Crítica | Pendiente |
| R-02 | Rider | Ponerse disponible (online) | Crítica | Pendiente |
| R-03 | Rider | Recibir oferta de viaje | Crítica | Pendiente |
| R-04 | Rider | Aceptar oferta | Crítica | Pendiente |
| R-05 | Rider | Retirar (pickup) — proximidad | Crítica | Pendiente |
| R-06 | Rider | Entregar (deliver) | Crítica | Pendiente |
| R-07 | Rider | Historial + ganancias | Alta | Pendiente |
| R-08 | Rider | Perfil / vehículo | Media | Pendiente |
| A-01 | Admin | Login super_admin | Crítica | Pendiente |
| A-02 | Admin | Categorías: listar/crear/activar | Alta | Pendiente |
| A-03 | Admin | Productos: listar/crear/editar | Alta | Pendiente |
| A-04 | Admin | Ingredientes | Media | Pendiente |
| A-05 | Admin | Sucursales | Alta | Pendiente |
| A-06 | Admin | Personal (staff) | Alta | Pendiente |
| A-07 | Admin | Parámetros | Media | Pendiente |
| A-08 | Admin | Pedidos globales + cambio de estado | Crítica | Pendiente |
| A-09 | Admin | Stock global | Media | Pendiente |
| A-10 | Admin | Reportes | Media | Pendiente |
| A-11 | Admin | Perfil | Baja | Pendiente |
| X-01 | Cross-app | Pedido creado en Tienda aparece en Sucursal/Admin | Crítica | Pendiente |
| X-02 | Cross-app | Sucursal avanza estado → se refleja en Tienda/Admin | Crítica | Pendiente |
| X-03 | Cross-app | Pedido ready → oferta a Rider → accept → pickup → deliver → estados finales | Crítica | Pendiente |

## Notas de alcance (no implementado según código/docs)

- Admin: Promociones y Estados de pedido (UI no implementada).
- Tienda: repetir pedido, catálogo público, checkout en 2 pasos (sin UI).
- Rider: ruta `/trip` multi-parada (Home redirige al detalle).
- Sucursal: toggle abierto/cerrado es solo local (localStorage), no persiste en backend.
