# STATUS — Store app (`client/apps/store`)

> **Para:** otro agente/LLM que retome el proyecto sin releer todo el código.
> **Actualizado:** agosto 2026.
> **Alcance:** estado completo de la app de tienda (store), cómo está armada, qué es mock vs. real, y el mapa para conectar la API real y desarrollar la app de administración.
>
> Fuentes de verdad del proyecto: `plan/api/base.md` (espec funcional), `plan/api/avance.md` (avance backend), `client/docs/ui-manifesto.md` (identidad visual + sistema), `client/docs/requerimientos-funcionales.md` (espec funcional frontend), `plan/division-de-tareas.md` (reparto de trabajo).

---

## 1. Contexto general del proyecto

Monorepo con tres partes:

| Parte       | Carpeta             | Stack                 | Estado actual                                               |
| ----------- | ------------------- | --------------------- | ----------------------------------------------------------- |
| Backend     | `api/`              | NestJS (Node + TS)    | **Estructura completa, lógica de negocio = stubs** (ver §9) |
| App cliente | `client/apps/store` | Vite + React + Chakra | **100% funcional como SPA mock-first** (este doc)           |
| App admin   | `client/apps/admin` | Vite + React + Chakra | **Placeholder** ("Admin" centrado)                          |

- **Hoy el store NO consume el backend.** Todo funciona con datos mock y estado local. El backend expone endpoints pero sus servicios devuelven `null`/`[]`.
- El backend usa repositorios **en memoria** (sin ORM/BD real) y **no tiene JWT ni roles** todavía.
- El frontend pega a `/api/...` pero **no hay proxy de Vite configurado**, así que los fetches fallan y caen al mock (ver §9.3).

---

## 2. Stack y comandos del store

Dependencias relevantes (`package.json`):

| Paquete               | Versión | Uso                                            |
| --------------------- | ------- | ---------------------------------------------- |
| `react` / `react-dom` | 19.2    | UI                                             |
| `@chakra-ui/react`    | ^3.36   | sistema de UI (v3, styling por recipes/tokens) |
| `react-router-dom`    | ^7.18   | rutas                                          |
| `swr`                 | ^2.4    | fetching con caché                             |
| `zustand`             | ^5.0    | estado global                                  |
| `next-themes`         | ^0.4    | dark mode (`attribute="class"`)                |
| `@gravity-ui/icons`   | ^2.21   | iconografía (íconos de línea)                  |

Scripts:

```sh
npm run dev           # vite --port 5173
npm run build         # tsc -b && vite build
npm run lint          # eslint . --max-warnings 0
npm run check-types   # tsc -b
npm run android       # vite build --mode native && cap sync android && cap open android
```

### Android (Capacitor)

- El store puede empaquetarse como app Android con **Capacitor 8** (`capacitor.config.ts` + `android/`).
- El build nativo usa `.env.native` → `VITE_MOCK_AUTH=false`, así que la app **pide login**. La UI de auth vive en `@repo/auth` (`packages/auth/`) y se monta dentro del store; el login en sí sigue mockeado hasta que el backend tenga JWT.
- **Requisitos:** JDK 17 o 21 (vía SDKMAN: `sdk env` con el `.sdkmanrc` del repo, `java=21.0.8-ms`) + Android SDK (`ANDROID_HOME`). Java 25 rompe Gradle 8.14.3.
- `npm run android` builda con mock auth, sincroniza y abre Android Studio.

Estructura:

```text
src/
├── components/   # componentes reutilizables (index.tsx + types.ts + hooks/ opcional)
├── pages/        # pantallas (index.tsx + hooks/ para lógica + subcomponentes planos)
├── layouts/      # StoreLayout (tienda). El AuthLayout vive en @repo/auth
├── hooks/        # hooks globales con SWR (useCatalog, useProduct, useProfile, useOrder)
├── stores/       # Zustand (cartStore, addressStore). La sesión (authStore) vive en @repo/api
├── types/        # tipos del dominio
└── utils/        # mocks y helpers
```

Convención de componentes: **named exports**, un archivo `index.tsx` que exporta el componente, `types.ts` con los props, y `hooks/` para lógica. No usar barrels de re-exports (los `index.ts` de `components/`, `pages/`, etc. son placeholders vacíos).

---

## 3. Rutas implementadas

Definidas en `App.tsx` (usa `useRoutes`; las rutas de auth se agregan con `authRouteObjects` de `@repo/auth`).

**Auth (públicas, dentro de `AuthLayout`, desde `@repo/auth`):**

| Ruta                             | Página               | Notas                                          |
| -------------------------------- | -------------------- | ---------------------------------------------- |
| `/login`                         | `LoginPage`          | email + password, link a recuperar/registro    |
| `/registro`                      | `RegisterPage`       | nombre, apellido, email, teléfono, password ×2 |
| `/recuperar-contrasena`          | `ForgotPasswordPage` | email → pantalla de éxito                      |
| `/restablecer-contrasena/:token` | `ResetPasswordPage`  | nueva password ×2                              |

**Tienda (protegidas por `RequireAuth`, dentro de `StoreLayout`):**

| Ruta                    | Página              | Notas                                |
| ----------------------- | ------------------- | ------------------------------------ |
| `/`                     | `HomePage`          | hero + secciones                     |
| `/catalogo`             | `CatalogPage`       | filtro por categoría via `?cat=<id>` |
| `/productos/:productId` | `ProductDetailPage` | configurador + agregar al carrito    |
| `/carrito`              | `CartPage`          | líneas de carrito                    |
| `/checkout`             | `CheckoutPage`      | dirección + confirmación (mock)      |
| `/sucursales`           | `SucursalesPage`    | lista mock                           |
| `/pedidos`              | `OrdersPage`        | pedido activo + historial            |
| `/pedidos/:orderId`     | `OrderDetailPage`   | timeline + mapa de seguimiento       |
| `/perfil`               | `ProfilePage`       | datos + navegación + logout          |
| `/perfil/editar`        | `EditProfilePage`   | formulario de perfil                 |
| `/perfil/direcciones`   | `AddressesPage`     | CRUD de direcciones                  |

---

## 4. Feature inventory

### 4.1 Autenticación (mock, UI en `@repo/auth`)

- **Sesión:** `useAuthStore` en `@repo/api` (`packages/api/src/stores/authStore.ts`, Zustand + `persist`, key `store-auth`).
  - Estado: `user: User | null`, `bypassAuth: boolean`.
  - Acciones: `login(email, role?)`, `register(input)`, `logout()`, `setBypassAuth(v)`.
  - `login`/`register` simulan latencia (600ms) y setean `user` (login usa `MOCK_USER`).
- **UI de auth:** paquete `@repo/auth` (`packages/auth/`): `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `AuthLayout`, `authRoutes`, `authRouteObjects`, `useAuthRedirect`.
  - Cada app monta las rutas públicas con `authRouteObjects({ adminUrl, logoLight, logoDark })` dentro de su router (`useRoutes`).
  - `useAuthRedirect` reemplaza el viejo `redirectByRole`: client → navega a `from` o `defaultPath`; admin → `window.location.assign(adminUrl)` si se configuró.
- **Protección:** `RequireAuth` en `@repo/components` (recibe `loginPath` relativo `/login` y `mockAuth`).
  - Si `!user` y no hay bypass → `<Navigate to="/login" replace state={{ from: location }} />`.
  - **Flag `?forceAuth=true`** desactiva la protección (toggle de desarrollo); se persiste en `bypassAuth`.
  - `mockAuth=true` fuerza bypass; hoy `.env.native` usa `false`, así que la app Android pide login.
- **Logout:** botón "Cerrar sesión" en `ProfilePage` (`logout()` + `navigate("/login")`).

### 4.2 Direcciones

- **Store:** `stores/addressStore.ts` (Zustand + `persist`, key `store-address`, seed `MOCK_ADDRESSES`).
  - Estado: `addresses: Address[]`, `selectedAddressId: string | null`.
  - Acciones: `selectAddress(id)`, `addAddress(input)`, `updateAddress(id, input)`, `removeAddress(id)`.
  - Selector exportado: `selectedAddress(state)` → la dirección seleccionada o `null`.
- **`AddressPickerModal`** (`components/AddressPickerModal/`): se abre al cargar si no hay dirección seleccionada (lo dispara `StoreLayout`). Desktop = `DialogRoot` centrado (`placement="center"`); mobile = `DrawerRoot` bottom-sheet (`placement="bottom"`). Decide la variante con `useMediaQuery(["(min-width: 48em)"])`. Lista direcciones guardadas + opción "Agregar nueva dirección" (formulario). La elección persiste y no vuelve a preguntar.
- **`LocationButton`** (`components/LocationButton/`): chip del header con la dirección actual; abre el picker. Visible **desktop siempre**; **mobile solo en Inicio, Catálogo y Carrito** (`MOBILE_LOCATION_PATHS` en `StoreHeader`).
- **`AddressesPage`** (`pages/AddressesPage/`): CRUD completo (listar, usar, editar, eliminar) con `AddressFormDialog` y `hooks/useAddressForm.ts`.
- En `CheckoutPage` la dirección seleccionada **precarga** los campos.

### 4.3 Catálogo y producto

- **Hooks:** `hooks/useCatalog.ts` y `hooks/useProduct.ts` — patrón **SWR + fallback** (ver §7).
- **`ProductDetailPage`** con configurador (`hooks/useProductConfig.ts`): grupos de opciones `single`/`multiple`, observaciones, cantidad, total, validación de obligatorias, "Agregar al carrito" → navega a `/carrito`.
- Componentes: `ProductCard`, `CategoryChip`, `QuantityStepper`, `SectionHeader`.

### 4.4 Carrito

- **Store:** `stores/cartStore.ts` (Zustand, **sin persistir** — se pierde al recargar).
  - `CartLine = { id, productId, name, price, image, quantity, options: CartOption[], notes? }`.
  - Acciones: `addLine`, `removeLine`, `setQuantity`, `clear`. `addLine` agrupa por "firma" (producto + opciones + notas).
  - Helpers exportados: `lineUnitPrice`, `lineTotal`, `cartItemCount`, `cartTotal`.
- `CartPage`, `CartDrawer` (drawer lateral), `CartLineCard`, `CartButton` (badge con cantidad via `useCartCount`).

### 4.5 Checkout

- `CheckoutPage`: campos de dirección (precargados desde `addressStore`), confirmación. **No crea pedido real** (todo mock). Estados: carrito vacío → `EmptyState`; confirmado → pantalla de éxito.

### 4.6 Pedidos

- **Datos:** `utils/orders.ts` — `MOCK_ORDERS` (3):
  - `o-128` → `ON_THE_WAY` (activo, con `rider`, `eta`, `items`, coordenadas de tienda/cliente).
  - `o-98` → `DELIVERED` (con `deliveredAt`).
  - `o-75` → `CANCELLED` (con `cancelReason`).
- Helpers: `ORDER_STATUS_LABELS`, `ORDER_STATUS_PALETTE`, `isActiveOrder(status)`, `getOrderById(id)`, `formatOrderDate(iso)`.
- **`OrderStatus`** (7 valores): `PENDING`, `CONFIRMED`, `PREPARING`, `READY_FOR_DELIVERY`, `ON_THE_WAY`, `DELIVERED`, `CANCELLED`.
- **`OrdersPage`**: tarjeta del pedido activo (con `OrderTimeline`) + historial. Cada card linkea a `/pedidos/:orderId`.
- **`OrderDetailPage`**:
  - Activo → timeline + **mapa de seguimiento Geoapify** (ver §8) + leyenda tienda/cliente/rider.
  - Cancelado → card con `cancelReason`.
  - Entregado → card con `deliveredAt`.
  - Items + total.
- **`OrderTimeline`** (componente compartido): 5 pasos `["Pendiente", "Confirmado", "Preparando", "En camino", "Entregado"]` (nota: el label es "Preparando", no "En preparación", para que no se corte en pantallas angostas; `whiteSpace="nowrap"`).
- **`OrderStatusBadge`**: badge con punto de color + label.
- **Rider "en vivo"** (simulación): `hooks/useRiderPosition.ts` hace un lerp tienda→cliente (progreso 0.3, +0.12 cada 3000ms, tope 0.98). No es data real.

### 4.7 Perfil, sucursales, splash

- **`useProfile`** (`hooks/useProfile.ts`): SWR + fallback a `MOCK_USER` (`utils/user.ts` — Juan Pérez, `juan.perez@unahur.edu.ar`). `updateProfile` hace `PATCH /api/users/:id`.
- `ProfilePage` (+ `ProfileNav`), `EditProfilePage` (+ `ProfileForm`).
- `SucursalesPage`: lista de `MOCK_BRANCHES` (`utils/sucursales.ts`, 3 sucursales).
- **`SplashScreen`** (`components/SplashScreen/`): pantalla de carga con logo (fondo `bg`, logo 64px, fade-out ~1.7s). **Está desactivada** (no se monta en `App.tsx`); pensada para Electron.

---

## 5. Inventario completo

### 5.1 Componentes (`components/`)

`AddressPickerModal` (+ `AddressForm`, `AddressPickerContent`, `hooks/useAddressPicker`), `AuthSuccess`, `BackButton`, `CartButton` (+ `hooks/useCartCount`), `CartDrawer`, `CartLineCard`, `CategoryChip`, `ColorModeProvider` (+ `ColorModeButton`, `hooks/useColorMode`, `hooks/useColorModeValue`), `EmptyState`, `LocationButton`, `Logo` (+ `hooks/useLogoAsset`, assets `logo-light.svg`/`logo-dark.svg`), `MobileStoreNavigation` (+ `MobileNavItem`, `utils/navigation`), `OrderStatusBadge`, `OrderTimeline`, `PasswordInput`, `ProductCard`, `QuantityStepper`, `SectionHeader`, `SplashScreen`, `StoreHeader` (+ `DesktopNav`, `HeaderActions`, `hooks/useStoreNavigation`, `utils/navigation`).

- **`BackButton`**: `IconButton` ghost con `ArrowLeft` + `navigate(-1)`, `alignSelf="flex-start"`. Se usa en auth (registro/recuperar/restablecer) y en pantallas empujadas.
- **`PasswordInput`**: `InputGroup` + `IconButton` con `Eye`/`EyeClosed` (toggle mostrar/ocultar).
- **`EmptyState`**: icono + título + descripción + acción opcional.
- **`ColorModeProvider`**: wrapper de `next-themes` (`attribute="class"`), `defaultTheme="system"`.

### 5.2 Stores (`stores/`)

| Store          | Persiste           | Estado / acciones                                                                                                             |
| -------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `cartStore`    | ❌ memoria         | `lines`, `addLine`, `removeLine`, `setQuantity`, `clear` + helpers                                                            |
| `addressStore` | ✅ `store-address` | `addresses`, `selectedAddressId`, `selectAddress`, `addAddress`, `updateAddress`, `removeAddress`, selector `selectedAddress` |
| `authStore`    | ✅ `store-auth`    | `user`, `bypassAuth`, `login`, `register`, `logout`, `setBypassAuth`                                                          |

### 5.3 Hooks (`hooks/`)

Globales (SWR + fallback mock): `useCatalog`, `useProduct`, `useProfile`, `useOrder`.

### 5.4 Utils (`utils/`)

| Archivo         | Contenido                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `catalog.ts`    | `MOCK_CATEGORIES` (5), `MOCK_PRODUCTS` (13), `formatPrice`, `getProductById`, `getProductsByCategory`, `getCategoryName` |
| `orders.ts`     | `MOCK_ORDERS` (3), labels/palette, `isActiveOrder`, `getOrderById`, `formatOrderDate`                                    |
| `sucursales.ts` | `MOCK_BRANCHES` (3)                                                                                                      |
| `addresses.ts`  | `MOCK_ADDRESSES` (2: "Casa", "Facultad")                                                                                 |
| `user.ts`       | `MOCK_USER`                                                                                                              |
| `geoapify.ts`   | `buildStaticMapUrl` (ver §8)                                                                                             |

### 5.5 Types (`types/`)

| Archivo      | Tipos                                                                             |
| ------------ | --------------------------------------------------------------------------------- |
| `catalog.ts` | `Category`, `Product`, `ProductConfigGroup`, `ProductOption`, `ProductOptionType` |
| `order.ts`   | `OrderStatus`, `Order`, `OrderItem`, `OrderLocation`, `OrderRider`                |
| `user.ts`    | `User`, `UserRole`, `UpdateProfileInput`                                          |
| `address.ts` | `Address`, `AddressInput`                                                         |
| `auth.ts`    | `LoginInput`, `RegisterInput`                                                     |

---

## 6. Tema e identidad visual ("Calor")

Definido en `theme.ts` (Chakra v3 `defineConfig`).

- **Fuente:** `Outfit` (heading y body).
- **Marca `brand` (naranja):** 500 `#EA580C`, 600 `#C2410C`, 400 `#FA8340`, 700 `#9A3412`, etc. Es **el único acento**.
- **Acento `accent` (ámbar):** 300 `#FCD34D` … 600 `#D97706`.
- **Semantic tokens** (con `_light` / `_dark`):

| Token               | Light     | Dark      |
| ------------------- | --------- | --------- |
| `bg`                | `#FFFFFF` | `#000000` |
| `bg.panel`          | `#FFFFFF` | `#0A0A0A` |
| `bg.muted`          | `#FFF1E5` | `#1A1A1A` |
| `bg.subtle`         | `#FFF9F4` | `#121212` |
| `fg`                | `#1C1917` | `#F5F5F5` |
| `fg.muted`          | `#6B7280` | `#A1A1A1` |
| `fg.subtle`         | `#9CA3AF` | `#737373` |
| `border.subtle`     | `#FBE4D2` | `#262626` |
| `border.muted`      | `#F6D6BE` | `#333333` |
| `border.emphasized` | `#EBC2A2` | `#404040` |
| `success`           | `#15803D` | `#4ADE80` |
| `warning`           | `#B45309` | `#FBBF24` |
| `danger`            | `#B91C1C` | `#F87171` |
| `info`              | `#1D4ED8` | `#60A5FA` |

- **Regla:** siempre tokens semánticos; **nunca hex sueltos** en el markup.
- **Radios:** píldoras/botones `full`, inputs `xl`, cards `2xl`, hero `3xl`.
- **Dark mode:** `next-themes` (`attribute="class"` → `html.dark`). En dark se usan **bordes, no sombras**.

### Convenciones de navegación / header

- **Pantallas del dock** (Inicio, Catálogo, Carrito, Pedidos, Perfil): header con logo (`StoreHeader`, `bg="bg"`, borde inferior `border.subtle`).
- **Pantallas empujadas** (fuera del dock: producto, checkout, sucursales, pedido detalle, editar perfil, direcciones): **se oculta `StoreHeader`** y se muestra `BackButton` (flecha `ArrowLeft` + `navigate(-1)`). La lógica vive en `StoreLayout`:
  ```ts
  const SUB_PAGE_PATHS = ['/perfil/editar', '/perfil/direcciones', '/sucursales', '/checkout']
  const hasBackHeader =
    SUB_PAGE_PATHS.includes(pathname) ||
    pathname.startsWith('/productos/') ||
    pathname.startsWith('/pedidos/')
  ```
- **Auth:** login conserva el logo; registro/recuperar/restablecer usan `BackButton` sin logo. Mobile top-anchored (no centrado), título `4xl`; desktop card centrada.
- **Dock mobile** (`MobileStoreNavigation`): píldora flotante (`position="fixed"`, `bottom="4"`), items: Inicio, Catálogo, Carrito (con badge), Pedidos, Perfil.

---

## 7. Datos mock y persistencia (clave)

### 7.1 Patrón SWR + fallback

Los 4 hooks globales intentan el endpoint `/api/...` y, si falla (o la respuesta no tiene la forma esperada), devuelven el mock. Plantilla real (`useProduct.ts`):

```ts
const { data, isLoading } = useSWR<Product | null>(
  productId ? `/api/products/${productId}` : null,
  async (url: string) => {
    const res = await fetch(url).catch(() => null)
    if (res && res.ok) {
      const json = await res.json().catch(() => null)
      if (json && typeof json === 'object' && 'id' in json) return json as Product
    }
    return productId ? (getProductById(productId) ?? null) : null
  },
)
return { product: data ?? null, isLoading }
```

URLs usadas hoy: `useCatalog` → `/api/catalog`; `useProduct` → `/api/products/:id`; `useProfile` → `/api/users/:id`; `useOrder` → `/api/orders/:id`.

> **Importante:** estos paths son simplificados y **no coinciden** con las rutas reales del backend (ver §9.3). Cuando se conecte la API hay que alinearlos.

### 7.2 Persistencia

| Dato                    | Persistencia                     | Consecuencia                                        |
| ----------------------- | -------------------------------- | --------------------------------------------------- |
| Direcciones + selección | `localStorage` (`store-address`) | sobrevive recarga                                   |
| Sesión + `bypassAuth`   | `localStorage` (`store-auth`)    | sobrevive recarga                                   |
| Carrito                 | ❌ memoria (`cartStore`)         | **se pierde al recargar** (debería ser server-side) |

### 7.3 Mocks

- `utils/catalog.ts`: 5 categorías (Hamburguesas, Pizzas, Acompañamientos, Bebidas, Postres), 13 productos con `configGroups` (tamaño single-required + extras multiple-opcionales) y fotos de Unsplash. IDs de producto: 101–503.
- `utils/orders.ts`: 3 pedidos con `items`, `deliveryAddress`, `store`/`client` (con lat/lon), `rider` (activo), `cancelReason` (cancelado), `deliveredAt` (entregado).
- `utils/sucursales.ts`: 3 sucursales (`Branch`: id, name, address, phone, hours, open, distanceKm).
- `utils/addresses.ts`: 2 direcciones (`Address`: id, label, street, city, reference?).
- `utils/user.ts`: `MOCK_USER` (id 1, `juan.perez@unahur.edu.ar`, "Juan Pérez", rol `client`).

---

## 8. Integración Geoapify (mapa de seguimiento)

`utils/geoapify.ts` exporta `buildStaticMapUrl({ markers, centerLat, centerLon, zoom, width, height, scaleFactor })` → URL de la **Static Maps API** de Geoapify.

- **API key hardcodeada** (`GEOAPIFY_API_KEY`). Conviene moverla a `import.meta.env.VITE_GEOAPIFY_API_KEY`.
- **Gotcha de colores:** la API valida los hex **case-sensitive (solo minúsculas)**. `encodeColor` hace `%23` + hex en minúsculas. Si usás mayúsculas → HTTP 400.
- **Markers:** `lonlat:lon,lat;type:circle;color;size;text;contentcolor;contentsize` (círculo con letra) o `type:awesome;icon:...` (ícono Font Awesome). Múltiples markers separados por `|` (no `&marker=`).
- **Uso en `OrderDetailPage` (`TrackingMap`):** `zoom 13`, `scaleFactor 2`, tamaño responsive (`useMediaQuery`): desktop 1200×340, mobile 600×700 (hero). Markers: tienda (`info` `#1d4ed8` "T"), cliente (`success` `#15803d` "C"), rider (`brand` `#ea580c`, icon `person-biking`). Atribución "© OpenStreetMap · Geoapify".
- **Costo:** cada request + markers consume créditos (plan gratis 3000/día). El rider en vivo re-requesta el mapa cada 3s.
- **Rider en vivo:** `hooks/useRiderPosition.ts` interpola tienda→cliente (simulado, no es tracking real).

---

## 9. Conexión con la API real (lo más importante para el futuro)

### 9.1 Estado del backend (`api/`)

Según `plan/api/avance.md` + relevamiento de código:

- **Listo:** capas (`config`, `controller`, `dto`, `exception`, `service`, `model`, `repository`, `module`), patrón **Controller → Orchestrator → Service → Repository**, repositorios en memoria, modelos = interfaces del DER, DTOs, y todos los endpoints (controllers).
- **Pendiente:** lógica de negocio (servicios/orchestrators = stubs que devuelven `null`/`[]`), ORM/BD real, JWT/guards/roles, seed del admin inicial, tests de negocio.

### 9.2 Rutas reales del backend (controllers)

| Controller                                         | Ruta base                     |
| -------------------------------------------------- | ----------------------------- |
| `auth.controller`                                  | `auth`                        |
| `catalog.controller`                               | `catalog`                     |
| `product.controller` / `product-config.controller` | `products`                    |
| `category.controller`                              | `categories`                  |
| `branch.controller`                                | `branches`                    |
| `branch-availability.controller`                   | `clients/:clientId/branches`  |
| `address.controller`                               | `clients/:clientId/addresses` |
| `cart.controller`                                  | `clients/:clientId/cart`      |
| `checkout.controller`                              | `clients/:clientId/checkout`  |
| `customer-order.controller`                        | `clients/:clientId/orders`    |
| `user.controller`                                  | `users` (+ `admin/users`)     |
| `admin-order.controller`                           | `admin/orders`                |
| `stock.controller`                                 | `admin/stock`                 |
| `report.controller`                                | `admin/reports`               |
| `promotion.controller`                             | `promotions`                  |
| `general-state.controller`                         | `general-states`              |
| `system-parameter.controller`                      | `system-parameters`           |

### 9.3 Gaps detectados en el frontend

1. **No hay proxy `/api`** en `vite.config.ts` (solo `plugins: [react()]`). Hay que agregar:
   ```ts
   server: { proxy: { "/api": "http://localhost:3000" } }
   ```
   (el backend corre en el puerto 3000). Hoy, sin proxy, todo fetch falla y cae al mock.
2. **Paths desalineados:** los hooks usan `/api/orders/:orderId` pero el backend es `clients/:clientId/orders`; `/api/users/:id` vs `users` (ok, falta `clientId` en algunos casos); no hay hooks para direcciones/carrito/checkout (hoy son stores client-side; deberían consumir `clients/:clientId/addresses`, `clients/:clientId/cart`, `clients/:clientId/checkout`).
3. **Carrito y direcciones son client-side**: hoy `cartStore` (sin persistir) y `addressStore` (localStorage). Al conectar, deben pasar a server-side (la fuente de verdad es el backend).

### 9.4 Mapeo feature → backend (qué tocar)

| Feature (store)       | Backend                                   | Pendiente al conectar                                                                         |
| --------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| Catálogo              | `catalog`                                 | implementar `CatalogQueryOrchestrator` (solo productos disponibles)                           |
| Producto              | `products`                                | implementar `ProductService`/`ProductConfigService` (precio extra por config)                 |
| Login/registro        | `auth`                                    | implementar `AuthOrchestrator` (hash, JWT), guards + roles                                    |
| Recuperar/restablecer | `auth` + `PasswordRecoveryService`        | token real                                                                                    |
| Perfil                | `users`                                   | `UserService`                                                                                 |
| Direcciones           | `clients/:clientId/addresses`             | `AddressService`                                                                              |
| Carrito               | `clients/:clientId/cart`                  | `CartService`/`CartOrchestrator` (total, validaciones)                                        |
| Checkout              | `clients/:clientId/checkout`              | `CheckoutOrchestrator` (asignar sucursal, total, ETA, crear pedido, snapshot, estado inicial) |
| Pedidos (cliente)     | `clients/:clientId/orders`                | `OrderQueryOrchestrator` (seguimiento + historial + ETA)                                      |
| Repetir pedido        | `clients/:clientId/orders`                | `RepeatOrderOrchestrator` (solo productos disponibles)                                        |
| Sucursales            | `branches` / `clients/:clientId/branches` | `BranchService` + `BranchAvailabilityOrchestrator`                                            |

- **Máquina de estados** (`order-status.orchestrator.ts`, constante en `config/`): validar transiciones y registrar historial.
- **Etapas del plan:** Etapa 1 (usuarios/auth), 2 (sucursales/catálogo), 3 (carrito/pedidos — núcleo), 4 (reportes).

---

## 10. Para el admin (`client/apps/admin`)

Hoy es un placeholder. Al desarrollarlo:

- **Reutilizable del store:** el tema Chakra "Calor" (`theme.ts` es copiable), componentes base (`Logo`, `PasswordInput`, `BackButton`, `EmptyState`), y el patrón de auth (mismo JWT, rol `admin`). Considerar mover a un paquete compartido (`client/packages/`).
- **Pantallas a construir** (según `plan/api/base.md` y `division-de-tareas.md`):
  - ABM categorías, productos + configuraciones, sucursales + horarios, stock, promociones, administradores.
  - Gestión de pedidos: consultar y **cambiar estado** (respetando la máquina de estados) — endpoint `admin/orders`.
  - Reportes: más/menos vendidos, sin stock, mayor facturación — `admin/reports`.
  - Auth de admin: login + guards por rol (`admin/users` para crear admins).

---

## 11. Deuda técnica / decisiones a revisar

1. **Key de Geoapify hardcodeada** en `utils/geoapify.ts` → mover a `VITE_GEOAPIFY_API_KEY`.
2. **Carrito no persiste** (`cartStore` en memoria) → debe ser server-side.
3. **`MOCK_USER`** centralizado en `utils/user.ts` (usado por `useProfile` y `authStore`).
4. **`SplashScreen` desactivada** a propósito (no se monta en `App.tsx`); re-activar al pasar a Electron.
5. **Semántica de `forceAuth`:** default protegido; `?forceAuth=true` desactiva la protección (toggle de desarrollo).
6. **Label del timeline "Preparando"** (en vez de "En preparación") para que no se corte en mobile; el badge de estado sí dice "En preparación".
7. **Rider "en vivo" es simulación** client-side (lerp). No es tracking real.
8. **Sin tests de negocio** en frontend ni backend (solo lint/types/build).
9. **`OrderDetailPage` usa `useMediaQuery`** para mapa responsive; el mapa de desktop es 1200×340 (antes 480, se achicó por feedback).

---

## 12. Cómo levantar

```sh
# API (puerto 3000)
cd api && npm install && npm run start:dev

# Frontend (monorepo)
cd client && npm install && npm run dev          # store 5173 + admin 5174
# o solo el store:
npm run dev -- --filter=@repo/store
```

- Tienda: http://localhost:5173
- Admin: http://localhost:5174
- API: http://localhost:3000

> Sin el proxy `/api`, el store funciona 100% con mocks (no requiere levantar la API).
