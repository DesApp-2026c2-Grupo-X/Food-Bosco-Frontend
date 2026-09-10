# Plan: App del repartidor

**Objetivo:** implementar el frontend de la app del Repartidor (`rol rider`), replicando **exactamente** el patrón de la app Tienda (`apps/store`), que es la referencia visual y de navegación del proyecto.

**Estado actual:** la carpeta `apps/rider` está vacía. Este documento es el plan; **no se implementa** en esta entrega.

> **Fuentes de verdad:**
>
> - `docs/requerimientos-frontend.md` — §11 (Navegación del Repartidor) y §12 (pantallas R-01…R-05), §3.1 (guard `RiderRoute`), §14.4 (componentes específicos de Repartidor).
> - `docs/requerimientos-backend-rest.md` — §8 (Delivery Service), §11.3 (colecciones `riders`/`trips`), §15 (trazabilidad R-01…R-05).
> - `docs/ui-manifesto.md` — dirección "Calor", tokens, patrones de navegación y back arrows.
> - Skill `frontend-components` — reglas de código (named exports, SOC, Chakra, Zustand, layouts).

---

## 1. Alcance funcional (R-01 … R-05)

| Pantalla            | Ruta             | Objetivo                                                                        |
| ------------------- | ---------------- | ------------------------------------------------------------------------------- |
| R-01 Inicio         | `/`              | Toggle online/offline + responder la oferta de viaje actual (aceptar/rechazar). |
| R-02 Viaje en curso | `/trip`          | Ejecutar el viaje: marcar retiro y entrega de cada orden.                       |
| R-03 Detalle orden  | `/trip/:orderId` | Detalle de una orden del viaje (retiro, entrega, ítems, contacto, acción).      |
| R-04 Historial      | `/history`       | Viajes completados (fecha, nº órdenes, distancia, ganancia).                    |
| R-05 Perfil         | `/profile`       | Nombre, vehículo, teléfono + toggle online/offline + cerrar sesión.             |

**Reglas de negocio que condicionan la UI** (no reinventar en el front):

- Sin disponibilidad (offline) → no se reciben ofertas.
- La oferta se acepta o rechaza; al aceptar el viaje pasa a "en curso". Al rechazar/vencer, se sigue online esperando.
- Un **viaje** agrupa 1+ órdenes (distintos clientes y/o sucursales). "Retirar" confirma el pickup; "Entregar" confirma `DELIVERED`. Al entregar la última, el viaje queda completado.
- El repartidor **no** modifica ítems ni cancela órdenes.
- El armado/ofrecimiento del viaje lo decide el backend; el frontend solo muestra y ejecuta acciones.

---

## 2. Regla de diseño absoluta (reuso de la Tienda)

La app Rider es **mobile-first** y es un clon del shell de la Tienda: misma dirección "Calor", misma paleta, tipografía Outfit, tokens semánticos, geometría, dock flotante y back arrows. **No se inventan estilos ni variantes.** Reuso directo de `@repo/*`:

| Capa        | Reuso directo                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| Tema        | `@repo/theme` (`createSystem(defaultConfig, config)` en `src/theme.ts`).                                                 |
| Tipografía  | `PageTitle`, `SectionTitle`, `Strong`, `Muted`, `Subtle`, `Price`, `Eyebrow`, `Lead`.                                    |
| Botones     | `PrimaryButton` (Aceptar/Retirar/Entregar), `GhostButton`/`OutlineButton` (Rechazar/secundarias).                        |
| Layout      | `PageContainer` (perfil, detalle de orden) · `WidePageContainer` (inicio, viaje, historial).                             |
| Feedback    | `EmptyState` ("Buscando viajes cerca tuyo…"), `OrderStatusBadge`, `OrderTimeline`.                                       |
| Navegación  | `MobileNav` (dock flotante), `BackButton`, `Logo`, `ColorModeButton`/`ColorModeProvider`.                                |
| Formularios | RHF + Zod (schemas en `@repo/domain`): `TextField`, `FormField`, `FormProvider`.                                         |
| Estado      | Zustand (`riderStore`), `useAuthStore`, `RequireAuth roles={['rider']}`.                                                 |
| Datos       | `@repo/api` (hooks SWR + mocks + `getJson`/`patchJson`/`postJson`), `@repo/domain` (tipos `Order`, `OrderStatus`, etc.). |
| Auth        | `@repo/auth` (`authRouteObjects`, `authRoutes`, páginas de login/registro/recuperar montadas dentro de la app).          |

---

## 3. Arquitectura de la app

### 3.1 Shell y estructura

Espejo exacto de `apps/store` (no de `apps/branch`/`apps/admin`, que usan sidebar; el Rider es una app móvil con **dock flotante**):

```text
apps/rider/
├── index.html                 # Outfit + <title>Food Bosco — Repartidor</title>
├── package.json               # name @repo/rider, dev vite --port 5176
├── vite.config.ts             # proxy /api → http://localhost:3000 (mismo que branch/store)
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json   # copia de apps/branch
├── eslint.config.js           # copia de apps/branch
├── .env.example               # VITE_MOCK_AUTH=true, VITE_GEOAPIFY_API_KEY=
└── src/
    ├── main.tsx               # ColorModeProvider + ChakraProvider + GraphQLProvider + BrowserRouter
    ├── App.tsx                # useRoutes: authRouteObjects + RequireAuth roles=['rider'] + RiderLayout
    ├── theme.ts               # createSystem(defaultConfig, config)
    ├── routes.ts              # rutas + helpers
    ├── config.ts              # BRANCH_URL / ADMIN_URL / RIDER_URL / MOCK_AUTH
    ├── assets/                # logo-light.svg, logo-dark.svg (copiar de apps/branch)
    ├── components/            # RiderHeader, MobileRiderNavigation, Logo, RideStatusButton, TripOfferCard, TripOrderCard, TripCard
    ├── layouts/RiderLayout/   # shell: header + main + dock (+ oferta/estado)
    ├── pages/                 # HomePage, TripPage, TripOrderDetailPage, HistoryPage, ProfilePage
    ├── hooks/                 # useRiderLocation (geolocalización)
    ├── stores/riderStore.ts   # isOnline + activeTripId (Zustand + persist)
    └── utils/geoapify.ts      # buildStaticMapUrl (copia del de la Tienda, ver §9)
```

### 3.2 Configuración y puerto

Puerto **5176** (libre: store 5173, admin 5174, branch 5175).

`src/config.ts`:

```ts
export const BRANCH_URL = import.meta.env.VITE_BRANCH_URL ?? 'http://localhost:5175'
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? 'http://localhost:5174'
export const RIDER_URL = import.meta.env.VITE_RIDER_URL ?? 'http://localhost:5176'
export const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true'
```

`src/routes.ts`:

```ts
export const routes = {
  home: '/',
  trip: '/trip',
  tripOrderDetail: '/trip/:orderId',
  history: '/history',
  profile: '/profile',
} as const
export const tripOrderDetailPath = (orderId: string) => `/trip/${orderId}`
```

`src/App.tsx` (espejo de `apps/branch/src/App.tsx`, con rol `rider`):

```tsx
useRoutes([
  ...authRouteObjects({
    branchUrl: BRANCH_URL,
    adminUrl: ADMIN_URL,
    riderUrl: RIDER_URL,
    logoLight,
    logoDark,
  }),
  {
    element: <RequireAuth loginPath={authRoutes.login} roles={['rider']} mockAuth={MOCK_AUTH} />,
    children: [
      {
        element: <RiderLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: routes.trip, element: <TripPage /> },
          { path: routes.tripOrderDetail, element: <TripOrderDetailPage /> },
          { path: routes.history, element: <HistoryPage /> },
          { path: routes.profile, element: <ProfilePage /> },
        ],
      },
    ],
  },
])
```

---

## 4. Navegación y back arrows (replicar Tienda al pie de la letra)

### 4.1 Dock de navegación mobile (`MobileRiderNavigation`)

Wrapper del `MobileNav` genérico (igual que `MobileStoreNavigation`), con los ítems de §11.3:

| Ítem      | Ruta       | Icono (`@gravity-ui/icons`) | Condición                  |
| --------- | ---------- | --------------------------- | -------------------------- |
| Inicio    | `/`        | `House`                     | siempre, `exact: true`     |
| Viaje     | `/trip`    | `Bicycle` o `CarTaxi`       | solo si hay viaje en curso |
| Historial | `/history` | `ListUl` / `Receipt`        | siempre                    |
| Perfil    | `/profile` | `Person`                    | siempre                    |

- El ítem **Viaje** se incluye condicionalmente leyendo `riderStore.activeTripId` (o `useActiveTrip()`).
- Sin badge en el carrito (no aplica); no hay ícono de carrito.

### 4.2 Header (`RiderHeader`)

Espejo de `StoreHeader`:

- **Desktop:** `Logo` (izq) + `DesktopNav` (Inicio/Viaje/Historial/Perfil, píldora activa `brand.500` texto blanco) + `HeaderActions` (`RideStatusButton` online/offline + `ColorModeButton` + ícono Perfil).
- **Mobile:** `Logo` + `RideStatusButton` (el toggle de disponibilidad reemplaza al `LocationButton` de la Tienda como única acción del header). A diferencia de la Tienda (donde el selector aparece solo en Inicio/Catálogo), el toggle del rider es **siempre visible** porque es la acción central.

### 4.3 Back arrows (pantallas empujadas)

Igual que la Tienda (§5.3 del manifesto): las pantallas del dock (Inicio, Viaje, Historial, Perfil) conservan el header con logo; las pantallas **empujadas** reemplazan el header por el `BackButton` (`ArrowLeft` + `navigate(-1)`, mobile).

Para Rider, la única pantalla empujada es el **detalle de orden** (`/trip/:orderId`, R-03):

```ts
const SUB_PAGE_PATHS = [routes.tripOrderDetail]
```

En `RiderLayout`, al igual que `StoreLayout`: el header se oculta en mobile (`display: base hasBackHeader ? 'none' : 'block'`) y el `BackButton` lo renderiza la propia página (`<BackButton />` al inicio de `TripOrderDetailPage`). El dock permanece visible en todo mobile.

---

## 5. Layout `RiderLayout` (espejo de `StoreLayout`)

```tsx
const SUB_PAGE_PATHS = [routes.tripOrderDetail]

export const RiderLayout = () => {
  const { pathname } = useLocation()
  const hasBackHeader = SUB_PAGE_PATHS.some((p) => matchPath(p, pathname))

  return (
    <Box bg="bg" minH="100vh" pb={{ base: '28', md: '0' }}>
      <Box display={{ base: hasBackHeader ? 'none' : 'block', md: 'block' }}>
        <RiderHeader />
      </Box>
      <Container
        as="main"
        maxW="1200px"
        paddingTop={{ base: hasBackHeader ? '3' : '6', md: '10' }}
        paddingBottom={{ base: '6', md: '10' }}
      >
        <Outlet />
      </Container>
      <MobileRiderNavigation />
    </Box>
  )
}
```

No hay `AddressPickerModal` (eso es de Tienda). No hay footer (mobile-first).

---

## 6. Pantallas (detalle)

### 6.1 `HomePage` (R-01) — `WidePageContainer`

Composición (mobile-first, protagonista = la oferta o el estado de búsqueda):

1. **Estado de disponibilidad:** `RideStatusButton` (píldora `brand.500`/verde con punto) + texto "Compartiendo ubicación" (`Muted`). Al estar online, `useRiderLocation` envía la ubicación.
2. **Sin oferta (online):** `EmptyState` con ícono + título "Buscando viajes cerca tuyo…" + descripción; skeleton/pulso mientras carga.
3. **Con oferta:** `TripOfferCard`:
   - Eyebrow "Nueva oferta de viaje".
   - Métricas: `nº órdenes · distancia km · tiempo est.`.
   - Mapa estático multi-parada (retiros + entregas) con `buildStaticMapUrl`.
   - Ganancia estimada grande (`Price`, `tabular-nums`).
   - `PrimaryButton` "Aceptar" + `GhostButton` "Rechazar".
   - Countdown ⏱ `0:28` (`useOfferCountdown`) que, al vencer, rechaza solo.
4. **Offline:** `EmptyState` "Estás desconectado" → activar toggle para recibir viajes.

### 6.2 `TripPage` (R-02) — `WidePageContainer`

- Encabezado: `PageTitle` "Viaje en curso" + contador "1 de 2 entregados" (`Muted`).
- **Mapa de ruta multi-parada** (`buildStaticMapUrl`): markers de cada retiro (`info`, "R") y entrega (`success`, "E"), más la posición del rider (`brand`, `person-biking`).
- Lista de `TripOrderCard` por orden: número de orden, retiro (sucursal) y entrega (cliente) con dirección, y acción contextual:
  - "Retirar" (`PrimaryButton`) si no está retirada → `markOrderPickup`.
  - "Entregar" (`PrimaryButton`) si está retirada y no entregada → `markOrderDelivered`.
  - `✓` (verde) si ya retirada/entregada.
- Al entregar la última orden, el viaje pasa a `COMPLETED`: redirigir a `/` (o mostrar estado "Viaje completado").
- Sin viaje activo: `EmptyState` + CTA a Inicio.

### 6.3 `TripOrderDetailPage` (R-03) — `PageContainer` (pantalla empujada)

- `<BackButton />` (back arrow mobile).
- `PageTitle` "Pedido #N" + `OrderStatusBadge`.
- Retiro (sucursal) y entrega (cliente) con direcciones y mini-mapa (`buildStaticMapUrl` con 2 markers).
- Ítems (cantidad × nombre + subtotal) y total (`Price`).
- Contacto del cliente (teléfono/email) — no inventar, solo si está en `Order.customer`.
- Acción contextual al pie: "Retirar" / "Entregar" (misma lógica que R-02).

### 6.4 `HistoryPage` (R-04) — `PageContainer`

- `PageTitle` "Historial de viajes".
- Lista de `TripCard` (patrón de historial de la Tienda T-14): fecha, nº órdenes, distancia, ganancia (`Price`), estado (`COMPLETED`). Orden desc.
- `EmptyState` "Todavía no realizaste viajes".

### 6.5 `ProfilePage` (R-05) — `PageContainer`

- `PageTitle` "Mi perfil".
- Card con datos: nombre (`Strong`), vehículo, teléfono (reuso del `Row` label/value de `apps/branch/ProfilePage`).
- Toggle de disponibilidad (`ToggleSwitch` de `@repo/components` o `RideStatusButton`).
- Editar (vehículo/teléfono) con RHF + Zod → `riderProfileSchema`; nombre read-only (viene del user de auth).
- "Cerrar sesión" (`GhostButton`/`OutlineButton` con `ArrowRightFromSquare`) → `logout()` + `navigate(authRoutes.login)`.

---

## 7. Capa de dominio (`@repo/domain`)

Nuevos archivos (TS puro, sin React):

### 7.1 `rider.ts`

```ts
export interface GeoPoint {
  latitude: number
  longitude: number
}
export interface RiderProfile {
  id: string
  userId: string
  vehicle: string
  phone: string
  available: boolean
  currentLocation?: GeoPoint
}
export interface UpdateRiderProfileInput {
  vehicle?: string
  phone?: string
}
```

### 7.2 `trip.ts`

Reutiliza `Order` (que ya trae `store`/`client`/`items`/`total`/`customer`/`status`). Se agregan:

```ts
export type TripStatus = 'OFFERED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  OFFERED: 'Ofrecido',
  ACTIVE: 'En curso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
}

export interface TripOrder {
  order: Order // reuso total del tipo existente
  pickedUp: boolean // pickup confirmado
  delivered: boolean // entrega confirmada
}

export interface TripOffer {
  id: string
  orders: Order[] // permite orderCount = orders.length y el mapa
  distanceKm: number
  estimatedMinutes: number
  estimatedEarnings: number
  expiresAt: string // ISO, para el countdown
}

export interface Trip {
  id: string
  riderId: string
  status: TripStatus
  orders: TripOrder[]
  startedAt?: string
  completedAt?: string
  earnings?: number
}
```

### 7.3 `schemas.ts` (nuevo schema)

```ts
export const riderProfileSchema = z.object({
  vehicle: z.string().min(1, 'El vehículo es obligatorio'),
  phone: z.string().min(1, 'El teléfono es obligatorio'),
})
```

Exportar ambos módulos desde `packages/domain/src/index.ts`.

---

## 8. Capa de datos (`@repo/api`)

### 8.1 Hooks nuevos (patrón SWR + fallback, como `useOrder`/`useBranchOrders`)

| Hook                | Key SWR             | Fallback mock                             | Endpoints REST (vía gateway)                              |
| ------------------- | ------------------- | ----------------------------------------- | --------------------------------------------------------- |
| `useRiderProfile()` | `/api/riders/me`    | `MOCK_RIDER_PROFILE`                      | `GET /v1/riders/me` · `PATCH /v1/riders/me`               |
| `useTripOffers()`   | `/api/trips/offers` | `MOCK_TRIP_OFFER` (si online y sin viaje) | `GET /v1/trips/offers`                                    |
| `useActiveTrip()`   | `/api/trips/active` | `MOCK_ACTIVE_TRIP` (o null)               | `GET /v1/trips/{id}` (el id viene de accept/`riderStore`) |
| `useMyTrips()`      | `/api/trips`        | `MOCK_TRIPS`                              | `GET /v1/trips`                                           |
| `useTrip(tripId?)`  | `/api/trips/${id}`  | `getTripById(id)`                         | `GET /v1/trips/{id}`                                      |

### 8.2 Acciones (mutaciones)

En hooks específicos (o un único `useRiderActions`), siguiendo el patrón de mutación de `apps/branch` (`useOrderTransition`): mutar mock in-place → `mutate(next, { revalidate: false })` → `postJson`/`patchJson` (no-op sin backend).

| Acción                          | Endpoint                                           | Efecto local                                                                 |
| ------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `acceptOffer(offerId)`          | `POST /v1/trips/offers/{id}/accept`                | crea `MOCK_ACTIVE_TRIP` desde la oferta, setea `activeTripId`, limpia oferta |
| `rejectOffer(offerId)`          | `POST /v1/trips/offers/{id}/reject`                | quita la oferta, sigue online                                                |
| `pickupOrder(tripId, orderId)`  | `POST /v1/trips/{tripId}/orders/{orderId}/pickup`  | marca `pickedUp`                                                             |
| `deliverOrder(tripId, orderId)` | `POST /v1/trips/{tripId}/orders/{orderId}/deliver` | marca `delivered`; si es la última → `COMPLETED` + limpiar `activeTripId`    |
| `setAvailability(online)`       | `PATCH /v1/riders/me/availability`                 | actualiza `riderStore.isOnline` y `RiderProfile.available`                   |
| `updateLocation(lat,lng)`       | `PATCH /v1/riders/me/location`                     | actualiza `currentLocation`                                                  |
| `updateRiderProfile(input)`     | `PATCH /v1/riders/me`                              | actualiza `MOCK_RIDER_PROFILE`                                               |

### 8.3 Mocks nuevos (`@repo/api/src/mocks/`)

- `rider.ts` — `MOCK_RIDER_PROFILE` (nombre "Marcos", vehículo "Moto · HLP 482", teléfono).
- `trips.ts` — `MOCK_TRIP_OFFER` (2 órdenes reutilizando `getOrderById('o-128')` y otra con status `READY_FOR_DELIVERY`), `MOCK_ACTIVE_TRIP` (viaje con 2 `TripOrder`), `MOCK_TRIPS` (2-3 viajes `COMPLETED`), y helpers `getTripById`, `createTripFromOffer`.

Reusar `mocks/orders.ts` para las órdenes de los viajes (no duplicar datos de órdenes).

### 8.4 `useRiderLocation` (hook local en `apps/rider/src/hooks/`)

Usa `navigator.geolocation.watchPosition` (API real del navegador, no mock) para capturar lat/lng y llamar `updateLocation` en intervalos. Desactivado si `!isOnline`. Sin permisos de geolocalización → degrada a "Ubicación no disponible" (`Muted`), sin romper la UI.

---

## 9. Mapa (decisión a tomar)

La Tienda ya tiene `apps/store/src/utils/geoapify.ts` (`buildStaticMapUrl`, `geocodeAddress`, markers). El Rider necesita mapa de ruta multi-parada (retiros + entregas).

**Recomendación:** promover `geoapify.ts` a `@repo/api` (re-export en el barrel) o a un nuevo módulo compartido, y actualizar el import en `apps/store`. **Alternativa de menor riesgo:** copiar `utils/geoapify.ts` en `apps/rider/src/utils/` (idéntico al de la Tienda). El plan asume la copia local salvo que se decida la promoción; en ambos casos **no se reimplementa** la función.

---

## 10. Estado global — `riderStore` (Zustand + persist)

Espejo de `apps/branch/src/stores/branchStatusStore.ts`:

```ts
interface RiderState {
  isOnline: boolean
  activeTripId: string | null
  setOnline: (value: boolean) => void
  setActiveTrip: (id: string | null) => void
}
export const useRiderStore = create<RiderState>()(persist(..., { name: 'rider' }))
```

`activeTripId` persiste para que el dock muestre "Viaje" y `/trip` no quede huérfana tras un refresh. Se sincroniza con `useActiveTrip()`/acciones.

---

## 11. Componentes específicos (en `apps/rider/src/components/`)

Todos siguen la estructura `ComponentName/{index.tsx, types.ts}` + `hooks/`/`utils/` si aportan (skill `frontend-components`).

| Componente               | Descripción                                                                                              | Reusa                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `Logo/`                  | wrapper con `logo-light.svg`/`logo-dark.svg` locales (idéntico a `apps/branch`).                         | `@repo/components` `Logo`             |
| `RiderHeader/`           | header + `DesktopNav.tsx` + `HeaderActions.tsx` + `hooks/useRiderNavigation.ts` + `utils/navigation.ts`. | espejo de `StoreHeader`               |
| `MobileRiderNavigation/` | wrapper de `MobileNav` con 4 ítems (Viaje condicional).                                                  | `MobileNav`                           |
| `RideStatusButton/`      | píldora online/offline con punto de color (espejo de `BranchStatusButton`, pero píldora `full`).         | tokens                                |
| `TripOfferCard/`         | card de oferta: métricas + mapa + ganancia + Aceptar/Rechazar + countdown.                               | `buildStaticMapUrl`, botones, `Price` |
| `TripOrderCard/`         | card por orden del viaje: retiro/entrega + acción Retirar/Entregar + estado ✓.                           | `OrderStatusBadge`, `PrimaryButton`   |
| `TripCard/`              | card de historial (fecha, órdenes, distancia, ganancia).                                                 | `Price`, tokens                       |
| (hooks locales)          | `useOfferCountdown(expiresAt)` (setInterval, al vencer → `rejectOffer`).                                 | —                                     |

---

## 12. Orden de implementación (fases)

1. **Scaffolding:** copiar `package.json`/`vite.config.ts`/`tsconfig*`/`eslint.config.js`/`index.html`/`assets` de `apps/branch`, ajustar nombre (`@repo/rider`) y puerto (`5176`). Crear `src/main.tsx`, `src/theme.ts`, `src/config.ts`, `src/routes.ts`.
2. **Dominio y datos:** agregar `rider.ts`, `trip.ts` y `riderProfileSchema` en `@repo/domain`; hooks + mocks en `@repo/api` (exportar del barrel).
3. **Shell:** `RiderLayout`, `RiderHeader` (+ nav), `MobileRiderNavigation`, `Logo`, `RideStatusButton`, `riderStore`.
4. **Páginas:** `HomePage` (oferta + empty + countdown), `TripPage`, `TripOrderDetailPage` (back arrow), `HistoryPage`, `ProfilePage`.
5. **Mapa y ubicación:** `utils/geoapify.ts` + `useRiderLocation` + integración en cards de oferta/viaje.
6. **Verificación:** `npm run lint -- --filter=@repo/rider`, `npm run build -- --filter=@repo/rider` (requiere build previo de `./packages/*`), revisión visual mobile 390px y desktop 1200px.
7. **(Opcional) `STATUS.md`** en `apps/rider/` documentando qué es mock vs real (siguiendo el formato de `apps/admin/STATUS.md`).

---

## 13. Trazabilidad pantalla → endpoints (recordatorio)

| Pantalla       | Endpoints                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| R-01 Oferta    | `PATCH /v1/riders/me/location`, `GET /v1/trips/offers`, `POST /v1/trips/offers/{id}/accept`, `POST .../reject` |
| R-02 Viaje     | `GET /v1/trips/{id}`, `POST /v1/trips/{id}/orders/{orderId}/pickup`, `POST .../deliver`                        |
| R-03 Detalle   | `GET /v1/trips/{id}` (incluye órdenes)                                                                         |
| R-04 Historial | `GET /v1/trips`                                                                                                |
| R-05 Perfil    | `GET /v1/riders/me`, `PATCH /v1/riders/me`, `PATCH /v1/riders/me/availability`                                 |

---

## 14. Checklist de aceptación

- [ ] Mismo shell que la Tienda: dock flotante `MobileNav`, header con logo, `BackButton` en la pantalla empujada (`/trip/:orderId`).
- [ ] `RequireAuth roles=['rider']` + `authRouteObjects` con redirección por rol.
- [ ] Solo tokens semánticos (`bg`, `fg`, `brand.*`, `border.*`), nunca hex sueltos; dark = negro + grises + naranja.
- [ ] Tipografía con tokens (`PageTitle`, `Strong`, `Muted`, `Subtle`, `Price`); `tabular-nums` en ganancias.
- [ ] Botones solo `PrimaryButton`/`GhostButton`/`OutlineButton`; formularios RHF + Zod (`riderProfileSchema`).
- [ ] Estados: loading (skeleton), vacío ("Buscando viajes cerca tuyo…"), error con reintento, éxito (toast).
- [ ] Oferta con countdown que vence; aceptar → viaje en curso; rechazar/vencer → sigue online.
- [ ] Retirar/Entregar por orden; última entrega → viaje completado.
- [ ] Historial con fecha, nº órdenes, distancia y ganancia.
- [ ] Sin funcionalidades fuera de alcance (no cancelar órdenes, no editar ítems, no pagos, no push).
- [ ] Verificado en mobile (390px) y desktop (1200px), lint y build limpios.

---

## 15. Fuera de alcance (heredado de §19 de la spec)

- Navegación GPS real por turnos / optimización de ruta (el mapa es estático Geoapify).
- Notificaciones push o en tiempo real (el ofrecimiento se simula con polling/mock hasta que el backend emita eventos).
- Pagos, calificaciones, auditoría, reportes.
