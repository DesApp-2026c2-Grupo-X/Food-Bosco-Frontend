# Avance del proyecto — Estado actual

**Fuente:** `plan/api/base.md` (especificación funcional y arquitectura)  
**Fecha:** agosto 2026  
**Método:** se relevó el código real de `api/` y `client/` contra los requerimientos del plan.

---

## 1. Resumen ejecutivo

El proyecto está en la **fase de armado de base** (scaffolding). Se construyó la infraestructura completa del backend (capas, módulos, endpoints, contratos de datos) y las dos aplicaciones frontend con su stack base, pero **aún no hay lógica de negocio implementada**: los servicios y orchestrators son stubs que delegan directo al repositorio o no hacen nada.

Estado por componente:

| Componente | Estado |
|---|---|
| Estructura backend (capas + módulos) | ✅ Listo |
| Modelos / DER | ✅ Listo (interfaces) |
| DTOs | ✅ Listo |
| Repositorios (en memoria) | ✅ Listo |
| Endpoints (controllers) | ✅ Listo (funcionan, sin lógica) |
| Servicios / orchestrators (lógica de negocio) | ⛔ Pendiente (stubs) |
| Base de datos real / ORM | ⛔ Pendiente |
| Autenticación real (JWT, guards) | ⛔ Pendiente |
| Frontend (apps) | 🟡 Base lista, páginas vacías |
| Tests de negocio | ⛔ Pendiente |

---

## 2. Avance por requerimientos funcionales (RF)

Leyenda: ✅ endpoint/estructura presente · ⛔ lógica no implementada · ➖ no existe

### 4.1 Gestión de usuarios

| RF | Requerimiento | Estado |
|---|---|---|
| RF-001 | Cliente se registra | ✅ controller + orchestor stub |
| RF-002 | Registro: nombre, apellido, email, teléfono, password | ✅ DTO + modelo |
| RF-003 | Email único | ⛔ (se valida en `UserService`? hoy no) |
| RF-004 | Clientes y admins inician sesión | ✅ endpoint, sin validación real |
| RF-005 | Cerrar sesión | ➖ |
| RF-006 | Recuperar contraseña | ✅ token en memoria (stub) |
| RF-007 | Consultar/modificar perfil | ✅ `PATCH /users/:id` |
| RF-008 | Administrador inicial | ➖ (seed no creado) |
| RF-009 | Admin crea admins | ✅ `POST /admin/users` |
| RF-010 | Diferenciar permisos | ⛔ (sin roles/guards) |

### 4.2 Direcciones y geolocalización

| RF | Requerimiento | Estado |
|---|---|---|
| RF-011 | Cliente registra direcciones | ✅ |
| RF-012 | Consultar/modificar/eliminar | ✅ |
| RF-013/014 | Descripción, lat/lng | ✅ DTO + modelo |
| RF-015 | Sucursales disponibles por ubicación | ✅ `BranchAvailabilityModule` (orchestrator stub) |
| RF-016 | Ubicación para asignar sucursal | ⛔ (en checkout, stub) |

### 4.3 Sucursales

| RF | Requerimiento | Estado |
|---|---|---|
| RF-017 | ABM sucursales | ✅ |
| RF-018/019/020/021/022/023 | Datos (nombre, dirección, lat/lng, horarios, teléfono, activa) | ✅ modelo + DTOs |
| RF-024 | Inactiva no asignable | ⛔ |
| RF-025 | Cerrada no asignable | ⛔ |

### 4.4 Categorías y productos

| RF | Requerimiento | Estado |
|---|---|---|
| RF-026/027 | ABM categorías (nombre, estado) | ✅ |
| RF-028/029/030/031/032/033/034 | ABM productos + campos | ✅ |
| RF-035 | Cliente solo ve disponibles | ⛔ (orchestrator stub) |
| RF-036 | Configuraciones especiales | ✅ modelo (`ProductConfigGroup/Option`) |
| RF-037 | Configuración modifica precio | ⛔ |

### 4.5 Carrito

| RF | Requerimiento | Estado |
|---|---|---|
| RF-038/039/040/041/042 | Ítems con producto, cantidad, obs, configs | ✅ repos + DTOs |
| RF-043/044/045 | Modificar cantidad/obs/configs, eliminar | ✅ endpoints |
| RF-046 | Calcular total | ⛔ |
| RF-047 | Modificar hasta confirmar | ⛔ |

### 4.6 Realización de pedidos

| RF | Requerimiento | Estado |
|---|---|---|
| RF-048/049 | Confirmar carrito + dirección | ✅ endpoint (orchestrator stub) |
| RF-050 | Asignar sucursal | ⛔ |
| RF-051/052/053/054 | Cliente, sucursal, dirección, fecha | ✅ modelo `Order` |
| RF-055/056 | Detalle, cantidades, obs, configs | ✅ modelo |
| RF-057 | Importe total | ⛔ |
| RF-058 | Estado inicial | ⛔ |
| RF-059 | Carrito no modificable tras confirmar | ⛔ |

### 4.7 Seguimiento e historial

| RF | Requerimiento | Estado |
|---|---|---|
| RF-060/061/062/063 | Estado, sucursal, historial, ETA | ✅ `OrderQueryOrchestrator` (parcial: devuelve view) |
| RF-064/065 | Pedidos anteriores + detalle | ✅ endpoints |
| RF-066/067 | Repetir pedido | ✅ endpoint (orchestrator stub) |

### 4.8 Sistema administrativo

| RF | Requerimiento | Estado |
|---|---|---|
| RF-068/069 | Apps independientes, misma BD | ✅ arquitectura |
| RF-070/071 | ABM productos/categorías | ✅ |
| RF-072 | ABM promociones (info) | ✅ |
| RF-073 | ABM sucursales | ✅ |
| RF-074 | ABM stock general | ✅ |
| RF-075 | ABM administradores | ✅ |
| RF-076/077 | ABM estados generales y parámetros | ✅ |
| RF-078 | Consultar pedidos | ✅ |
| RF-079 | Modificar estado | ✅ endpoint |
| RF-080 | Respetar orden de estados | ⛔ (máquina de estados: constante existe, validación no) |

### 4.9 Reportes

| RF | Requerimiento | Estado |
|---|---|---|
| RF-081/082/083/084 | Más/menos vendidos, sin stock, mayor facturación | ✅ endpoints (`ReportController`) — servicio retorna `[]` |

---

## 3. Avance por historias de usuario (HU)

| HU | Estado |
|---|---|
| HU-C01 a HU-C17 (cliente) | 🟡 Endpoints/estructura para casi todas; **lógica ⛔** en todas (validaciones, cálculo, asignación) |
| HU-A01 a HU-A16 (admin) | 🟡 Ídem: CRUD expuesto, sin reglas de negocio |
| HU-S01 (elegir sucursal) | ⛔ |
| HU-S02 (calcular importe) | ⛔ |
| HU-S03 (registrar cambio de estado) | ⛔ |
| HU-S04 (calcular ETA) | ⛔ |

---

## 4. Avance por etapas de implementación (sección 12 del plan)

| Etapa | Contenido | Estado |
|---|---|---|
| **Etapa 1** | Backend modular, usuarios/roles, admin inicial, registro/login/recuperación, perfil/direcciones | 🟡 Estructura completa; lógica y seed pendientes |
| **Etapa 2** | Sucursales/horarios, categorías, productos, configs, stock, promociones, estados/parámetros | 🟡 Estructura completa; CRUD sin validaciones |
| **Etapa 3** | Carrito, cálculo, asignación de sucursal, confirmación, estados, seguimiento, repetir | ⛔ Solo scaffolding; caso central del proyecto pendiente |
| **Etapa 4** | Reportes + integración apps + demo | 🟡 Endpoints de reportes presentes, sin datos |

---

## 5. Avance de la arquitectura

### 5.1 Backend (`api/`)

- **Capas globales** en `src/`: `config/`, `controller/`, `dto/`, `exception/`, `service/`, `model/`, `repository/`, `module/`. ✅
- **Patrón Controller → Orchestrator → Service → Repository**: ✅ estructura presente.
- **Servicios primarios no se comunican**: ✅ respetado por diseño (los stubs no se llaman entre sí).
- **Orchestrators separados por caso de uso**: Auth, BranchAvailability, CatalogQuery, Cart, Checkout, OrderQuery, RepeatOrder, OrderStatus. ✅
- **Módulos por dominio + orquestadores**: ✅ (CategoryModule, ProductModule, CheckoutModule, etc.).
- **Repositorios en memoria**: ✅ funcional, reemplazable por ORM.
- **Modelos = interfaces del DER**: ✅ (USERS, ORDERS, CARTS, PRODUCTS, etc.).

### 5.2 Frontend (`client/`)

- Turborepo con 2 apps Vite+React+Chakra: `apps/store` (5173) y `apps/admin` (5174). ✅
- Stack instalado: react-router-dom, SWR, Zustand. ✅
- Estructura `src/{components,pages,hooks,hoc,types,utils}` creada (placeholder). ✅
- **Páginas en blanco** ("Tienda" / "Admin"). 🟡
- Vercel.json (rewrites SPA), ESLint compartido, Prettier, Husky global. ✅

### 5.3 Calidad

- ESLint: ✅ pasa sin errores en `api/` y `client/`.
- Build: ✅ compila `api/` y ambas apps.
- Husky: ✅ pre-commit lint, pre-push build+lint.
- Tests: 🟡 solo el test por defecto del `AppController`; **sin tests de negocio**.

---

## 6. Qué falta para "funcionar" (próximos pasos)

1. **Lógica de negocio en servicios/orchestrators** (la deuda principal):
   - Auth: hash de password, validación de credenciales, JWT + guards + roles.
   - Checkout: validar cliente/dirección/carrito/productos, elegir sucursal (RF-050, HU-S01), calcular total (HU-S02), ETA (HU-S04), crear pedido + snapshot de detalle, marcar carrito confirmado (RF-059).
   - Máquina de estados: validar transiciones (RF-080) y registrar historial (HU-S03).
   - Carrito: cálculo de total (RF-046), validar configs y precios (RF-037).
   - Repetir pedido: solo productos disponibles (RF-067).
   - Reportes: implementar consultas reales sobre pedidos entregados.
2. **Persistencia**: integrar ORM (TypeORM/Prisma) y reemplazar repos en memoria; seed del administrador inicial (RF-008) y datos de demo.
3. **Autenticación**: JWT, guards, roles (RF-010).
4. **Frontend**: construir las páginas reales (login, catálogo, carrito, checkout, seguimiento / ABMs, reportes).
5. **Tests**: parametrizados y de calidad (ver skill `high-quality-tests`).

---

## 7. Conclusiones

- La **estructura y los contratos** están al día: el backend expone todos los módulos y endpoints del plan y el frontend tiene su base lista.
- El proyecto **compila, lintea y arranca**, pero **funcionalmente está en 0% de negocio**: los stubs devuelven `null`/`[]`.
- El mayor esfuerzo pendiente está en la **Etapa 3** (carrito → pedido → estados), que es el núcleo del proyecto.
