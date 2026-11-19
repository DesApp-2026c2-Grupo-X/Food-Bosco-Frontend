# Plan — Frontend: descuentos en productos y página de promociones

> **Estado:** IMPLEMENTADO · **Fecha:** 2026-11-19
> **Repo:** `Food-Bosco-Frontend`
> **Apps:** `apps/store`
> **Paquetes:** `@repo/domain`, `@repo/api`
> **Backend requerido:** `DESAPP/docs/implementacion/promociones-productos-backend.md`
> **Regla:** el frontend no calcula precios finales. Muestra el preview que envía el backend.

---

## 0. Decisiones cerradas

1. La sucursal sale de la dirección seleccionada, igual que el carrito: el backend resuelve la más cercana disponible.
2. Porcentaje con `maxDiscount`: badge + “Tope $X”. Sin precio estimado.
3. Porcentaje sin `maxDiscount`: badge + precio anterior tachado + precio estimado.
4. `FIXED_AMOUNT`: badge `Hasta $X OFF` en tarjeta y página. Sin precio final.
5. `BUY_X_GET_Y`: badge `2x1` / `3x2`. Sin precio final.
6. Mínimos no cumplidos: se muestra la promo con “Sujeto a compra mínima” o “Mínimo N unidades”.
7. Cupones: se muestra el `code` en la página.
8. Página `/promotions`: el backend hidrata categorías y productos.
9. Home feed: muestra los mismos previews que el catálogo.
10. Mobile nav: 5 ítems. “Pedidos” pasa a Perfil.

---

## 1. Objetivo

1. Mostrar en `ProductCard` el beneficio vigente del producto.
2. Mostrar en el detalle las promociones aplicables y sus condiciones.
3. Crear `/promotions` con cupones y productos en promoción.
4. Agregar “Promociones” al header y “Promos” a la nav mobile de 5 ítems.
5. No duplicar el cálculo de precios: el carrito sigue siendo la fuente de verdad.

---

## 2. Estado actual verificado

| Pieza                 | Código actual                                                                               | Cambio                                                             |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `ProductCard`         | `apps/store/src/components/ProductCard` muestra imagen, nombre, descripción, hint y precio. | Agregar badge, precio anterior/estimado y línea de promo.          |
| Home                  | `HomePage` separa cupones y productos en promoción; el join se hace en cliente.             | Reutilizar `PromotionCard`; dejar que la tarjeta muestre la promo. |
| Catálogo              | `useCatalog(lat, lng)` ya manda coordenadas.                                                | No cambia la firma; los productos traen previews.                  |
| Detalle               | `useProduct(productId)` no manda coordenadas; `useCart()` no recibe dirección.              | Agregar coordenadas y `addressId`.                                 |
| Header                | `desktopNavItems` tiene 4 ítems.                                                            | Agregar Promociones.                                               |
| Mobile nav            | 5 ítems: Inicio, Catálogo, Carrito, Pedidos, Perfil.                                        | Reemplazar Pedidos por Promos; Pedidos queda en Perfil.            |
| Página de promociones | No existe.                                                                                  | Crear `PromotionsPage`.                                            |
| Datos                 | `PRODUCT_DETAIL_FIELDS` no incluye previews; `PRODUCTS` de la Tienda lo usa.                | Crear fragmento específico de Tienda.                              |

---

## 3. Dominio (`@repo/domain`)

### 3.1 Tipos nuevos

En `packages/domain/src/promotion.ts`:

```ts
export type PromotionBadgeKind =
  'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'COUPON' | 'INFORMATIONAL'

export interface ProductPromotionPreview {
  promotionId: string
  name: string
  kind: PromotionBadgeKind
  badge: string
  originalPrice: number
  estimatedUnitPrice: number | null
  discountValue: number | null
  maxDiscount: number | null
  minSubtotal: number
  minQuantity: number
  conditionsMet: boolean
  promotionCount: number
  endsAt: string
}

export interface PromotionCatalogItem {
  id: string
  name: string
  description: string | null
  type: PromotionType | null
  scope: PromotionScope | null
  kind: PromotionBadgeKind
  badge: string
  discountValue: number | null
  maxDiscount: number | null
  buyQuantity: number | null
  payQuantity: number | null
  startDate: string
  endDate: string
  daysOfWeek: number[]
  startTime: string | null
  endTime: string | null
  minSubtotal: number
  minQuantity: number
  branchIds: string[]
  code: string | null
  categoryIds: string[]
  productIds: string[]
  categories: Category[]
  products: Product[]
}
```

En `packages/domain/src/catalog.ts`:

```ts
import type { ProductPromotionPreview } from './promotion'

export interface Product {
  // campos actuales...
  promotion?: ProductPromotionPreview | null
  promotions?: ProductPromotionPreview[]
}
```

> `promotion`/`promotions` son opcionales para no romper mocks, admin ni datos viejos.

### 3.2 Helpers

En `packages/domain/src/promotion.ts`:

```ts
export const hasEstimatedPrice = (preview: ProductPromotionPreview | null | undefined): boolean =>
  preview != null && preview.conditionsMet && preview.estimatedUnitPrice != null

export const promotionConditionLabels = (
  promotion: Pick<
    Promotion,
    'minSubtotal' | 'minQuantity' | 'maxDiscount' | 'daysOfWeek' | 'startTime' | 'endTime'
  >,
): string[] => {
  /* ... */
}

export const promotionValidityLabel = (startDate: string, endDate: string): string => {
  /* ... */
}

export const promotionBadgeAriaLabel = (preview: ProductPromotionPreview): string => {
  switch (preview.kind) {
    case 'PERCENTAGE':
      return `${preview.discountValue ?? 0}% de descuento`
    case 'FIXED_AMOUNT':
      return preview.badge
    case 'BUY_X_GET_Y':
      return preview.badge
    default:
      return 'Promoción'
  }
}

export const daysUntilPromotionEnds = (endsAt: string, now: Date = new Date()): number => {
  /* ... */
}
```

Reglas de `promotionConditionLabels`:

- `minSubtotal > 0` → `Compra mínima ${formatPrice(minSubtotal)}`.
- `minQuantity > 0` → `Mínimo ${minQuantity} unidades`.
- `maxDiscount != null` → `Tope ${formatPrice(maxDiscount)}`.
- `daysOfWeek` no vacío → `Válida los ${DAYS_OF_WEEK_LABELS[...]}`.
- `startTime && endTime` → `De ${startTime} a ${endTime}`.

### 3.3 Generalizar `splitPromotions`

Hoy `splitPromotions` recibe `Promotion[]`. La página recibe `PromotionCatalogItem[]`.
Cambiar a genérico sin romper usos:

```ts
export const isProductPromotion = (promotion: Pick<Promotion, 'scope' | 'productIds'>): boolean =>
  promotion.scope === 'PRODUCT' || promotion.productIds.length > 0

export const splitPromotions = <T extends Pick<Promotion, 'scope' | 'productIds'>>(
  promotions: T[],
): { coupons: T[]; productPromotions: T[] } => ({
  coupons: promotions.filter((promotion) => !isProductPromotion(promotion)),
  productPromotions: promotions.filter(isProductPromotion),
})
```

Tests:

- `Promotion` sigue funcionando.
- `PromotionCatalogItem` también.
- Categoría/orden/informativa va a `coupons`.
- Producto o `productIds` no vacío va a `productPromotions`.

---

## 4. API (`@repo/api`)

### 4.1 Fragmentos

En `packages/api/src/client/fragments.ts`:

```ts
export const PRODUCT_PROMOTION_FIELDS = `
  promotion {
    promotionId
    name
    kind
    badge
    originalPrice
    estimatedUnitPrice
    discountValue
    maxDiscount
    minSubtotal
    minQuantity
    conditionsMet
    promotionCount
    endsAt
  }
  promotions {
    promotionId
    name
    kind
    badge
    originalPrice
    estimatedUnitPrice
    discountValue
    maxDiscount
    minSubtotal
    minQuantity
    conditionsMet
    promotionCount
    endsAt
  }
`

export const STORE_PRODUCT_FIELDS = `
  ${PRODUCT_DETAIL_FIELDS}
  ${PRODUCT_PROMOTION_FIELDS}
`
```

Reglas:

- **No** modificar `PRODUCT_DETAIL_FIELDS` ni `PRODUCT_LIST_FIELDS` globales: los usa el admin.
- `STORE_PRODUCT_FIELDS` se usa sólo en la Tienda y en `home-feed.ts`.
- `PROMOTION_CATALOG_FIELDS` nuevo para la página.

### 4.2 Queries

En `packages/api/src/client/store.ts`:

- `PRODUCTS` usa `STORE_PRODUCT_FIELDS` (hoy usa `PRODUCT_DETAIL_FIELDS`).
- `PRODUCT` usa `STORE_PRODUCT_FIELDS` y agrega variables `$lat`, `$lng`:

```graphql
query Product($id: ID!, $lat: Float, $lng: Float) {
  product(id: $id, lat: $lat, lng: $lng) {
    ...STORE_PRODUCT_FIELDS
  }
}
```

- Nueva query:

```graphql
query PromotionCatalog($lat: Float, $lng: Float) {
  promotionCatalog(lat: $lat, lng: $lng) {
    id
    name
    description
    type
    scope
    kind
    badge
    discountValue
    maxDiscount
    buyQuantity
    payQuantity
    startDate
    endDate
    daysOfWeek
    startTime
    endTime
    minSubtotal
    minQuantity
    branchIds
    code
    categoryIds
    productIds
    categories {
      id
      name
      active
    }
    products {
      ...STORE_PRODUCT_FIELDS
    }
  }
}
```

En `packages/api/src/client/home-feed.ts`:

- Reemplazar `PRODUCT_DETAIL_FIELDS` por `STORE_PRODUCT_FIELDS` en `forYou` y `discovery`.
- No tocar el mapper: `toProduct` ahora mapea previews.

### 4.3 Mappers

En `packages/api/src/client/store.ts`:

```ts
export const toProductPromotionPreview = (raw: Raw): ProductPromotionPreview => ({
  promotionId: asString(raw.promotionId),
  name: asString(raw.name),
  kind: (asString(raw.kind) as PromotionBadgeKind) || 'PERCENTAGE',
  badge: asString(raw.badge),
  originalPrice: asNumber(raw.originalPrice),
  estimatedUnitPrice: raw.estimatedUnitPrice == null ? null : asNumber(raw.estimatedUnitPrice),
  discountValue: raw.discountValue == null ? null : asNumber(raw.discountValue),
  maxDiscount: raw.maxDiscount == null ? null : asNumber(raw.maxDiscount),
  minSubtotal: asNumber(raw.minSubtotal),
  minQuantity: asNumber(raw.minQuantity),
  conditionsMet: asBoolean(raw.conditionsMet),
  promotionCount: asNumber(raw.promotionCount),
  endsAt: asString(raw.endsAt),
})

export const toProduct = (raw: Raw): Product => ({
  // campos actuales...
  promotion: raw.promotion ? toProductPromotionPreview(raw.promotion as Raw) : null,
  promotions: asList(raw.promotions, toProductPromotionPreview),
})
```

En `packages/api/src/client/mappers.ts` o `store.ts`:

```ts
export const toPromotionCatalogItem = (raw: Raw): PromotionCatalogItem => ({
  id: asString(raw.id),
  name: asString(raw.name),
  description: raw.description == null ? null : asString(raw.description),
  type: (raw.type as PromotionType) ?? null,
  scope: (raw.scope as PromotionScope) ?? null,
  kind: (asString(raw.kind) as PromotionBadgeKind) || 'INFORMATIONAL',
  badge: asString(raw.badge),
  discountValue: raw.discountValue == null ? null : asNumber(raw.discountValue),
  maxDiscount: raw.maxDiscount == null ? null : asNumber(raw.maxDiscount),
  buyQuantity: raw.buyQuantity == null ? null : asNumber(raw.buyQuantity),
  payQuantity: raw.payQuantity == null ? null : asNumber(raw.payQuantity),
  startDate: asString(raw.startDate),
  endDate: asString(raw.endDate),
  daysOfWeek: Array.isArray(raw.daysOfWeek) ? raw.daysOfWeek.map((d) => asNumber(d)) : [],
  startTime: raw.startTime == null ? null : asString(raw.startTime),
  endTime: raw.endTime == null ? null : asString(raw.endTime),
  minSubtotal: asNumber(raw.minSubtotal),
  minQuantity: asNumber(raw.minQuantity),
  branchIds: Array.isArray(raw.branchIds) ? raw.branchIds.map((b) => asString(b)) : [],
  code: raw.code == null ? null : asString(raw.code),
  categoryIds: Array.isArray(raw.categoryIds) ? raw.categoryIds.map((c) => asString(c)) : [],
  productIds: Array.isArray(raw.productIds) ? raw.productIds.map((p) => asString(p)) : [],
  categories: asList(raw.categories, toCategory),
  products: asList(raw.products, toProduct),
})
```

### 4.4 Hooks

- `useProduct(productId, lat?, lng?)`:
  - Variables `{ id: productId, lat: lat ?? null, lng: lng ?? null }`.
  - `skip: !productId`.
- `usePromotionCatalog(lat?, lng?)`:
  - `useQuery(PROMOTION_CATALOG, { variables: { lat: lat ?? null, lng: lng ?? null }, skip: lat == null || lng == null, fetchPolicy: 'cache-and-network' })`.
  - Devuelve `promotions`, `isLoading`, `error`, `refetch`.
- `useCatalog` no cambia.
- `useCart` no cambia; el detalle debe pasarle `addressId`.

Exportar `usePromotionCatalog` desde `packages/api/src/index.ts`.

### 4.5 Tests de API

- `store.test.ts`: `toProduct` con `promotion`, con `promotions`, sin previews.
- `mappers.test.ts`: `toPromotionCatalogItem` completo y con nulos.
- `useProduct.test.ts`: variables con `lat/lng`.
- `usePromotionCatalog.test.ts`: skip sin coordenadas, mapeo, error.
- `home-feed.test.ts`: productos con previews.

---

## 5. `ProductCard`

Archivo: `apps/store/src/components/ProductCard`.

### 5.1 Props

```ts
export interface ProductCardProps {
  product: Product
  hint?: string | null
  showPromotion?: boolean
}
```

- `showPromotion` default: `isProductPromotionsEnabled()`.
- `promotion = product.promotion ?? null`.

### 5.2 UI

1. **Badge sobre la imagen** (si `showPromotion && promotion`):
   - `position="absolute"`, arriba a la izquierda.
   - Texto: `promotion.badge`.
   - `aria-label={promotionBadgeAriaLabel(promotion)}`.
2. **Precio**:
   - Si `hasEstimatedPrice(promotion)`:
     - Precio anterior tachado: `formatPrice(promotion.originalPrice)`.
     - Precio estimado: `formatPrice(promotion.estimatedUnitPrice)`.
     - `aria-label` del anterior: “Precio anterior”.
   - Si no:
     - Precio normal actual: `formatPrice(product.price)`.
3. **Línea de promo** (si hay promo):
   - Nombre de la promo, `lineClamp={1}`.
   - Si `promotionCount > 1`: ` · +${promotionCount - 1} promos`.
   - Si `!promotion.conditionsMet`: mostrar “Sujeto a compra mínima” o “Mínimo N unidades”.
   - Si `promotion.maxDiscount != null`: mostrar “Tope $X”.
4. **Sin promo**: layout actual, sin altura extra.
5. **Sin layout shift**:
   - Reservar altura mínima para la línea de promo.
   - `hint` y promo pueden convivir; si hay dos líneas, reservar ambas.

### 5.3 Reglas

- No calcular descuentos ni precios finales.
- No mostrar precio tachado para `FIXED_AMOUNT`, `BUY_X_GET_Y`, porcentaje con tope ni
  `conditionsMet=false`.
- No mostrar cupones en la tarjeta.
- El hint de personalización se conserva; la home debe dejar de pasar `hint=promotion.name`
  (ver §7).

### 5.4 Tests

- 20% sin tope: badge, precio anterior y estimado.
- 20% con tope: badge, sin precio tachado, “Tope $X”.
- `FIXED_AMOUNT`: badge `Hasta $X OFF`, sin precio tachado.
- `2x1`: badge, sin precio tachado.
- `conditionsMet=false`: “Sujeto a compra mínima”, sin precio estimado.
- Sin promo: mismo layout.
- `showPromotion=false`: sin badge.
- `aria-label` correcto.
- `promotionCount > 1`: `+N promos`.

---

## 6. Detalle de producto

Archivos:

- `apps/store/src/pages/ProductDetailPage/index.tsx`
- `apps/store/src/pages/ProductDetailPage/hooks/useProductConfig.ts`

### 6.1 Contexto de dirección

En `ProductDetailPage`:

```ts
const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
const { addresses } = useAddresses()
const selected = addresses.find((address) => address.id === selectedAddressId)
const config = useProductConfig(productId, selected)
```

En `useProductConfig(productId, address)`:

- `useProduct(productId, address?.latitude, address?.longitude)`.
- `useCart(address?.id ?? null)`.

Así el detalle y el carrito usan la misma sucursal.

### 6.2 Precio

- Si `product.promotion` tiene `estimatedUnitPrice`:

```tsx
<HStack>
  <Text textDecoration="line-through">{formatPrice(promotion.originalPrice)}</Text>
  <Price fontSize="xl">{formatPrice(promotion.estimatedUnitPrice)}</Price>
</HStack>
```

- Si no, mostrar `formatPrice(product.price)` como hoy.
- Nota: “Precio base. Los extras y el total final se calculan en el carrito.”

### 6.3 Sección “Promociones aplicables”

Mostrar sólo si `product.promotions?.length > 0`.

Por cada promo:

- Badge (`promotion.badge`).
- Nombre.
- `describePromotion(promotion)` como descripción.
- Condiciones con `promotionConditionLabels`.
- Vigencia con `promotionValidityLabel(startDate, endDate)`.
- Nota: “El precio final se calcula en el carrito.”

No renderizar la sección si no hay promociones.

### 6.4 Tests

- Detalle con 1 promo: badge, nombre, condiciones, nota.
- Detalle con varias promos.
- Detalle sin promos: sección ausente.
- Precio anterior/estimado cuando corresponde.
- `useProductConfig` pasa coordenadas y `addressId`.

---

## 7. Home

Archivo: `apps/store/src/pages/HomePage/index.tsx`.

Cambios:

1. `PromotionsSection` local se reemplaza por `PromotionCard` (ver §8).
2. En `promotedProducts`, quitar `hint: promotion.name`; la tarjeta ya muestra la promo.
3. El action de “Productos en promoción” apunta a `routes.promotions` con “Ver todas”.
4. No cambiar el join de productos: se mantiene `useCatalog` + `usePublicPromotions`.
5. Si `isHomeFeedEnabled()` está activo, `forYou`/`discovery` ya traen previews desde el backend.

Tests:

- La home muestra `ProductCard` con badge en productos en promoción.
- No hay texto duplicado de promo (hint + línea).
- El link “Ver todas” navega a `/promotions`.

---

## 8. `PromotionCard`

Nuevo componente: `apps/store/src/components/PromotionCard`.

### 8.1 Props

```ts
export interface PromotionCardProps {
  promotion: PromotionCardItem
  ctaPath: string
  ctaLabel?: string
}
```

`PromotionCardItem` en `types.ts`:

```ts
type PromotionCardItem = Pick<
  Promotion,
  | 'id'
  | 'name'
  | 'description'
  | 'type'
  | 'discountValue'
  | 'maxDiscount'
  | 'buyQuantity'
  | 'payQuantity'
  | 'scope'
  | 'categoryIds'
  | 'productIds'
  | 'startDate'
  | 'endDate'
  | 'daysOfWeek'
  | 'startTime'
  | 'endTime'
  | 'minSubtotal'
  | 'minQuantity'
  | 'code'
> & {
  badge?: string
}
```

Sirve tanto para `Promotion` como para `PromotionCatalogItem`.

### 8.2 UI

- Chip con `promotion.badge ?? describePromotion(promotion)`.
- Si `code`: badge secundario con el código.
- Nombre.
- Descripción: `description || describePromotion(promotion)`.
- Condiciones: `promotionConditionLabels(promotion)`.
- Vigencia: `promotionValidityLabel(startDate, endDate)`.
- CTA: `PrimaryButton` con `ctaLabel ?? 'Ver en el menú'` y `to={ctaPath}`.

### 8.3 Uso

- Home: cupones.
- `/promotions`: cupones y beneficios.
- `ctaPath` se calcula en la página con `getPromotionCategoryId` y `routes`.

### 8.4 Tests

- Renderiza badge, código, nombre, condiciones y CTA.
- Sin código no muestra badge de código.
- CTA navega al path recibido.

---

## 9. Página `/promotions`

Nuevos archivos:

- `apps/store/src/pages/PromotionsPage/index.tsx`
- `apps/store/src/pages/PromotionsPage/__tests__/PromotionsPage.test.tsx`

### 9.1 Hook

```ts
const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
const { addresses } = useAddresses()
const selected = addresses.find((address) => address.id === selectedAddressId)
const { promotions, isLoading, error, refetch } = usePromotionCatalog(
  selected?.latitude,
  selected?.longitude,
)
```

### 9.2 Separación

```ts
const { coupons, productPromotions } = useMemo(() => splitPromotions(promotions), [promotions])
```

### 9.3 Productos únicos

```ts
const promotedProducts = useMemo(() => {
  const byId = new Map<string, Product>()
  for (const promotion of productPromotions) {
    for (const product of promotion.products) {
      if (!product.available) continue
      if (!byId.has(product.id)) byId.set(product.id, product)
    }
  }
  return [...byId.values()]
}, [productPromotions])
```

### 9.4 CTA

```ts
const ctaFor = (promotion: PromotionCatalogItem): string => {
  if (promotion.scope === 'PRODUCT' && promotion.products[0]) {
    return productPath(promotion.products[0].id)
  }
  const categoryId = getPromotionCategoryId(promotion, promotion.products)
  return categoryId ? `${routes.catalog}?cat=${categoryId}` : routes.catalog
}
```

- Producto con un solo producto → `/products/:id`.
- Producto con varios → primer producto (la grilla ya muestra todos).
- Categoría → `/catalog?cat=:id`.
- Orden/informativa → `/catalog`.

### 9.5 Layout

```text
WidePageContainer
  PageHeader "Promociones"
  ├── LoadingState si isLoading
  ├── EmptyState si error o sin datos (con reintento si hay error)
  ├── Sección "Cupones y beneficios" (si coupons.length > 0)
  │     SimpleGrid de PromotionCard
  └── Sección "Productos en promoción" (si promotedProducts.length > 0)
        SimpleGrid de ProductCard
```

- Cada `ProductCard` ya muestra badge, nombre de promo y condición.
- Agregar una nota: “Los precios con descuento se confirman en el carrito.”
- En mobile, 2 columnas; en desktop, 3/4 como el catálogo.

### 9.6 Tests

- Loading.
- Error con reintento.
- Sin promociones: `EmptyState`.
- Sólo cupones.
- Sólo productos.
- Ambos.
- CTA de categoría, producto y orden.
- Deduplicación de productos.
- Producto no disponible no se muestra.
- La página no calcula precios.

---

## 10. Navegación

### 10.1 Rutas

`apps/store/src/routes.ts`:

```ts
export const routes = {
  // ...
  promotions: '/promotions',
} as const
```

### 10.2 App

`apps/store/src/App.tsx`:

- Agregar la ruta dentro de `RequireAddress` y `StoreLayout`:

```tsx
{ path: routes.promotions, element: <PromotionsPage /> },
```

### 10.3 Header desktop

`apps/store/src/components/StoreHeader/utils/navigation.ts`:

```ts
{ id: 'promotions', label: 'Promociones', path: routes.promotions },
```

Entre Catálogo y Sucursales.

### 10.4 Mobile

`apps/store/src/components/MobileStoreNavigation/index.tsx`:

- 5 ítems:

```ts
{ id: 'home', label: 'Inicio', path: routes.home, icon: House, exact: true },
{ id: 'catalog', label: 'Catálogo', path: routes.catalog, icon: LayoutCells },
{ id: 'promotions', label: 'Promos', path: routes.promotions, icon: Ticket },
{ id: 'cart', label: 'Carrito', path: routes.cart, icon: ShoppingCart, badge: count },
{ id: 'profile', label: 'Perfil', path: routes.profile, icon: Person },
```

- Eliminar `ListUl` y el ítem “Pedidos”.
- Usar `Ticket` de `@gravity-ui/icons/Ticket`.
- Verificar a 320 px: 5 ítems, sin overflow.

### 10.5 Pedidos en Perfil

`apps/store/src/pages/ProfilePage/index.tsx`:

- Agregar “Mis pedidos” a `accountItems`:

```ts
{
  id: 'orders',
  label: 'Mis pedidos',
  path: routes.orders,
  icon: <ListUl width={18} height={18} />,
}
```

Así “Pedidos” sigue accesible desde mobile.

### 10.6 Tests

- `StoreHeader.test.tsx`: “Promociones” visible y activo en `/promotions`.
- `MobileStoreNavigation.test.tsx`: 5 links, “Promos” visible, “Pedidos” no; activo en `/promotions`.
- `App.routing.test.tsx`: `/promotions` renderiza `PromotionsPage`; sin dirección redirige a home.
- `ProfilePage` si tiene test: “Mis pedidos” visible.
- Responsive 320 px.

---

## 11. Feature flag (opcional)

Archivo: `apps/store/src/config/featureFlags.ts`.

```ts
export const isProductPromotionsEnabled = (): boolean =>
  import.meta.env.VITE_PRODUCT_PROMOTIONS !== 'false'
```

Reglas:

- Default: activado.
- Si se apaga: no mostrar badges, ni “Promos” en mobile, ni “Promociones” en desktop.
- **No** evita que los fragmentos GraphQL pidan los campos: el backend debe estar desplegado
  antes de mergear el frontend.
- Documentar la variable en el README o `.env.example` del frontend.

---

## 12. Tests de frontend

### Dominio

- `splitPromotions` genérico.
- `promotionConditionLabels`.
- `promotionValidityLabel`.
- `promotionBadgeAriaLabel`.
- `hasEstimatedPrice`.
- `daysUntilPromotionEnds`.

### API

- `toProduct` con previews.
- `toPromotionCatalogItem`.
- `useProduct` con coordenadas.
- `usePromotionCatalog` skip/mapeo/error.
- `home-feed` con previews.

### Componentes

- `ProductCard` (todos los casos de §5.4).
- `PromotionCard`.
- `StoreHeader`.
- `MobileStoreNavigation`.

### Páginas

- `PromotionsPage`.
- `HomePage` (sin hint duplicado, link a promociones).
- `ProductDetailPage` (sección de promos, precio, sin promos).

### Routing

- `/promotions` dentro de `RequireAddress`.
- Redirección sin dirección.
- Ítem activo en header y mobile.

---

## 13. Criterios de aceptación

- [x] Un producto con 20% sin tope muestra badge, precio anterior y precio estimado.
- [x] Un producto con 20% con tope muestra badge y “Tope $X”, sin precio tachado.
- [x] Un producto con `FIXED_AMOUNT` muestra `Hasta $X OFF`, sin precio tachado.
- [x] Un producto con `2x1` muestra el badge, sin precio tachado.
- [x] Un producto con mínimos no cumplidos muestra “Sujeto a compra mínima” y no inventa precio.
- [x] Un producto sin promo se ve igual que hoy.
- [x] El detalle lista las promociones aplicables y aclara que el precio final se calcula en el carrito.
- [x] La home feed muestra badges en “Para vos” y “Descubrí algo nuevo”.
- [x] `/promotions` muestra cupones y productos en promoción.
- [x] Los cupones muestran su código.
- [x] “Promociones” está en el header y “Promos” en la nav mobile de 5 ítems.
- [x] “Mis pedidos” sigue accesible desde Perfil.
- [x] No hay cálculo de precios en el frontend.
- [x] `npm run test`, `npm run lint` y `npm run check-types` pasan.

---

## 14. Riesgos y mitigaciones

| Riesgo                              | Mitigación                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| Backend no desplegado               | Backend primero; no mergear frontend antes.                                          |
| Fragmentos compartidos con admin    | Usar `STORE_PRODUCT_FIELDS`; no tocar los globales.                                  |
| `promotions` null                   | `toProduct` default `[]`; el backend también lo garantiza.                           |
| Cache de Apollo con direcciones     | Variables `lat/lng` en `PRODUCT`, `PRODUCTS` y `PROMOTION_CATALOG`.                  |
| Home feed sin previews              | Backend las calcula; si el flag de home feed está apagado, la home usa `useCatalog`. |
| Layout shift por nueva línea        | Reservar altura mínima en `ProductCard`.                                             |
| Hint duplicado                      | Quitar `hint=promotion.name` en Home.                                                |
| Mobile nav saturada                 | 5 ítems; test a 320 px; Pedidos en Perfil.                                           |
| Código de cupón                     | Mostrarlo sólo en la página, no en la tarjeta de producto.                           |
| Precio mostrado distinto al carrito | Copia “se confirma en el carrito”; no mostrar precio cuando hay tope/mínimos.        |

---

## 15. Fuera de alcance

- Calcular precios o descuentos en el frontend.
- Modificar el motor del carrito.
- Cupones automáticos o stacking nuevo.
- Copiar código al portapapeles (se puede agregar después).
- Analítica de badges, A/B testing o notificaciones.
- Cambios en Admin, Branch o Rider.
- Cambios en `@repo/components` (la nav de 5 ítems entra sin tocar el componente compartido).

---

## 16. Orden de implementación

1. Backend implementado y desplegado.
2. `@repo/domain`: tipos y helpers + tests.
3. `@repo/api`: fragmentos, mappers, hooks + tests.
4. `ProductCard` + tests.
5. Detalle de producto + tests.
6. `PromotionCard` y Home.
7. `PromotionsPage` + tests.
8. Rutas y navegación + tests.
9. QA conjunto con backend.
10. Activar el flag si se usó.
