# Plan — Descuentos en productos y página de promociones

> **Estado:** PROPUESTA · **Fecha:** 2026-11-19
> **Alcance:** Tienda (`apps/store`), `@repo/api`, `@repo/domain`, Gateway y Commerce.
> **Objetivo:** mostrar los beneficios vigentes en las tarjetas de producto y crear una página
> dedicada de promociones, accesible desde el header y la navegación.

---

## 1. Resultado esperado

1. Las tarjetas de producto muestran el beneficio vigente:
   - badge (`-20%`, `2x1`, `$1.000 OFF`);
   - precio anterior tachado y precio final cuando el descuento es calculable por unidad;
   - nombre corto de la promoción.
2. El detalle del producto lista las promociones aplicables y sus condiciones.
3. Existe `/promotions` con:
   - cupones y promociones generales;
   - productos en promoción;
   - vigencia y condiciones;
   - CTA a la categoría o al producto afectado.
4. “Promociones” aparece en el header de escritorio y en la navegación mobile.
5. El precio del carrito sigue siendo la única fuente de verdad. La UI nunca inventa un total.

---

## 2. Situación actual

| Pieza                            | Estado actual                                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `ProductCard`                    | Muestra imagen, nombre, descripción, hint de personalización y precio. No tiene descuentos.                |
| `Promotion` / `PromotionSummary` | Ya tienen `type`, `scope`, `categoryIds`, `productIds`, `branchIds`, `priority` y fechas.                  |
| `publicPromotions`               | Devuelve promociones vigentes, pero con un subconjunto de campos. No trae categorías/productos hidratados. |
| Home                             | Ya separa “Cupones para vos” de “Productos en promoción” y resuelve la categoría del CTA.                  |
| Catálogo                         | Tiene chips de categoría y una categoría virtual “Para vos”.                                               |
| Header                           | Inicio, Catálogo, Sucursales, Mis pedidos.                                                                 |
| Mobile nav                       | Inicio, Catálogo, Carrito, Pedidos, Perfil.                                                                |
| Página de promociones            | No existe.                                                                                                 |
| Precio                           | El motor de promociones de Commerce calcula el precio autoritativo del carrito.                            |

Conclusión: la UI puede mostrar badges con datos existentes, pero **no debe calcular precios finales**
por su cuenta. Para evitar diferencias con el carrito, el preview de descuento debe venir del backend.

---

## 3. Decisiones de diseño

### 3.1 El backend calcula el preview; el frontend lo muestra

- Commerce resuelve qué promoción aplica a cada producto y devuelve un `ProductPromotionPreview`.
- El frontend sólo formatea el badge, el precio anterior y el precio final.
- El carrito sigue recalculando todo. El preview es informativo y puede variar por cantidad,
  sucursal, horario, topes de uso o cupón ingresado.

### 3.2 Qué se muestra en la tarjeta

| Tipo                  | Badge         | Precio tachado | Precio final                            |
| --------------------- | ------------- | -------------- | --------------------------------------- |
| `PERCENTAGE`          | `-20%`        | Sí             | Sí, con tope `maxDiscount` aplicado     |
| `FIXED_AMOUNT`        | `$1.000 OFF`  | No             | No: depende del subtotal elegible       |
| `BUY_X_GET_Y`         | `2x1` / `3x2` | No             | No: el beneficio se aplica por cantidad |
| Informativa / `ORDER` | `Cupón`       | No             | No                                      |

Reglas:

- Sólo productos `available=true`.
- Sólo promociones vigentes por fecha, día y horario (zona Argentina).
- Sólo promociones de la sucursal asignada, o globales (`branchIds` vacío).
- Las promociones `ORDER` no se muestran como descuento de producto; van a la página de promociones
  o al carrito.
- Si hay varias promociones, se muestra la de **mayor beneficio unitario** y un indicador
  `+N promos`.
- No se suman promociones en la tarjeta. La suma/stacking la decide el motor del carrito.

### 3.3 Página de promociones

- Ruta `/promotions`.
- Dentro de `RequireAddress` porque los productos dependen de la sucursal y los CTA llevan al catálogo.
- Secciones:
  1. **Cupones y beneficios** (`ORDER`, `CATEGORY` e informativas).
  2. **Productos en promoción** (`PRODUCT` con `productIds`).
- Cada tarjeta muestra nombre, descripción, tipo de beneficio, vigencia, condiciones y CTA.
- Reutiliza `describePromotion`, `getPromotionCategoryId` y `splitPromotions` de `@repo/domain`.

---

## 4. Contrato backend propuesto

### 4.1 Preview por producto

Agregar al contrato de catálogo (GraphQL/REST) un campo opcional:

```graphql
enum PromotionBadgeKind {
  PERCENTAGE
  FIXED_AMOUNT
  BUY_X_GET_Y
  COUPON
}

type ProductPromotionPreview {
  promotionId: ID!
  name: String!
  kind: PromotionBadgeKind!
  badge: String!
  originalPrice: Float!
  finalPrice: Float
  promotionCount: Int!
  endsAt: String
}

type Product {
  # ...campos actuales
  promotion: ProductPromotionPreview
  promotions: [ProductPromotionPreview!]!
}
```

- `promotion` es el mejor beneficio para la tarjeta.
- `promotions` es la lista completa para el detalle.
- `finalPrice` es `null` cuando no se puede calcular por unidad (`FIXED_AMOUNT`, `NxM`, cupón).
- El campo es aditivo y opcional; el admin lo ignora.

**REST:** `GET /v1/catalog/products` y `GET /v1/catalog/products/{id}` agregan `promotion` y
`promotions` calculados con `lat/lng`/sucursal. No crear un endpoint por producto (N+1).

### 4.2 Promociones públicas para la página

Nuevo contrato de lectura, separado del admin:

```graphql
type PublicPromotionProduct {
  id: ID!
  name: String!
  price: Float!
  image: String
  categoryId: ID!
}

type PublicPromotionCategory {
  id: ID!
  name: String!
}

type PromotionCatalogItem {
  id: ID!
  name: String!
  description: String
  type: PromotionType
  scope: PromotionScope
  discountValue: Float
  maxDiscount: Float
  buyQuantity: Int
  payQuantity: Int
  startDate: String!
  endDate: String!
  daysOfWeek: [Int!]!
  startTime: String
  endTime: String
  branchIds: [ID!]!
  categories: [PublicPromotionCategory!]!
  products: [PublicPromotionProduct!]!
}

type Query {
  promotionCatalog(lat: Float, lng: Float): [PromotionCatalogItem!]!
}
```

- `promotionCatalog` devuelve sólo vigentes y ordenadas por prioridad/afinidad.
- Hidrata categorías y productos en Commerce; el gateway no hace N+1.
- No expone `usedCount`, `maxUses*` ni `code`.

### 4.3 REST propuesto

```http
GET /v1/catalog/promotions/public/catalog?lat=-34.6&lng=-58.4
```

Respuesta: arreglo de `PromotionCatalogItem`.
Alternativa: reutilizar `GET /v1/catalog/products?lat=&lng=` y `GET /v1/catalog/promotions/public`
con campos extendidos. La opción recomendada es un endpoint específico para evitar romper el
contrato público actual.

---

## 5. Algoritmo de preview

### 5.1 Elegibilidad

1. `active=true`.
2. `startDate <= now <= endDate`.
3. `daysOfWeek` vacío o incluye el día actual.
4. `startTime/endTime` vacíos o incluyen la hora actual (zona Argentina).
5. `branchIds` vacío o incluye la sucursal.
6. Producto disponible.

### 5.2 Cálculo por tipo

```text
PERCENTAGE:
  unitDiscount = min(price * discountValue / 100, maxDiscount ?? ∞)
  finalPrice   = max(0, price - unitDiscount)

FIXED_AMOUNT:
  badge = "$<discountValue> OFF"
  finalPrice = null  // depende del subtotal elegible

BUY_X_GET_Y:
  badge = "<buyQuantity>x<payQuantity>"
  finalPrice = null

ORDER / informativa:
  no se muestra en la tarjeta
```

### 5.3 Selección

- Calcular todos los previews elegibles del producto.
- Elegir el de mayor `price - finalPrice` cuando hay `finalPrice`.
- Si ninguno tiene `finalPrice`, elegir por prioridad y luego por tipo.
- `promotionCount` = cantidad de promociones elegibles.
- Redondear a 2 decimales con la misma convención que el carrito.

### 5.4 Topes de uso

- No bloquear el badge por `maxUsesTotal`/`maxUsesPerCustomer` en la primera versión.
- Mostrar `“Sujeto a disponibilidad”` en el detalle si la promoción tiene topes.
- El carrito es quien rechaza o ajusta.

---

## 6. Cambios en la Tienda

### 6.1 Dominio (`@repo/domain`)

- Agregar `ProductPromotionPreview` y `PromotionBadgeKind`.
- Agregar `promotion?: ProductPromotionPreview` y `promotions?: ProductPromotionPreview[]` a
  `Product` (sólo lo completa el mapper de la Tienda).
- Agregar `PromotionCatalogItem` y helpers de presentación:
  - `formatPromotionBadge`;
  - `hasUnitPricePreview`;
  - `daysUntilPromotionEnds`.
- Tests de formateo y de selección visual.

### 6.2 API (`@repo/api`)

- Extender `PRODUCT_DETAIL_FIELDS` y `PRODUCT_LIST_FIELDS` con `promotion`/`promotions`.
- Extender `toProduct` para mapear el preview.
- Nuevo hook `usePromotionCatalog(lat, lng)` y query `PROMOTION_CATALOG`.
- Mapper `toPromotionCatalogItem`.
- Mantener `usePublicPromotions` para la home o migrarlo al nuevo contrato.

### 6.3 `ProductCard`

- Nuevo bloque de precio:
  - badge en la esquina de la imagen;
  - precio anterior tachado + precio final;
  - si no hay precio final, precio normal + badge;
  - línea de promoción truncada.
- Prop opcional `showPromotion = true` para usos donde no corresponda (por ejemplo, carrito).
- Accesibilidad:
  - `aria-label` del badge: `“20% de descuento”`;
  - precio final anunciado como precio actual.
- Sin layout shift: reservar altura para la línea de promoción.

### 6.4 Detalle de producto

- Sección “Promociones aplicables” con:
  - nombre, badge, vigencia y condiciones;
  - nota “El precio final se calcula en el carrito”.
- Si no hay promociones, no renderizar la sección.

### 6.5 Página `/promotions`

- `PromotionsPage` con `PageHeader`, loading, empty y error.
- Extraer `PromotionCard` desde `HomePage` para reutilizar estilos.
- Secciones:
  - Cupones y beneficios;
  - Productos en promoción.
- Cada producto afectado usa `ProductCard` con su preview.
- CTA:
  - categoría → `/catalog?cat=<id>`;
  - producto → `/products/<id>`;
  - pedido → `/catalog`.

### 6.6 Navegación

- `routes.ts`: `promotions: '/promotions'`.
- `App.tsx`: ruta dentro de `RequireAddress` y `StoreLayout`.
- Header de escritorio: agregar `{ label: 'Promociones', path: routes.promotions }` entre Catálogo y
  Sucursales.
- Mobile: agregar “Promos” como sexto ítem con un icono de ticket.
  - Validar a 320 px; si no entra, mover “Pedidos” al perfil o usar un menú “Más”.
- `StoreHeader` y `MobileStoreNavigation` ya derivan el activo del path; no requieren lógica extra.

---

## 7. Cambios en el backend

### 7.1 Commerce

- Nuevo `promotion.preview.ts` con funciones puras:
  - `resolveProductPromotionPreview(product, promotions, branchId, now)`;
  - `resolvePromotionCatalog(promotions, products, categories, branchId, now)`.
- `PromotionService`:
  - `getCatalogPromotions(branchId, now)`;
  - `getProductPreviews(productIds, branchId, now)`.
- `ProductService`/`ProductOrchestrator`: calcular previews en lote al listar productos y al obtener
  detalle.
- `PromotionController`: `GET /v1/catalog/promotions/public/catalog`.
- No modificar el motor de precios del carrito.

### 7.2 Gateway

- Tipos GraphQL `ProductPromotionPreview`, `PromotionBadgeKind`, `PromotionCatalogItem`.
- Campo `Product.promotion` y `Product.promotions`.
- Query `promotionCatalog`.
- Mappers y tests de contrato.

### 7.3 Auth / Delivery

- Sin cambios.

---

## 8. Pruebas

### Backend

- Preview porcentual con y sin `maxDiscount`.
- `FIXED_AMOUNT` y `BUY_X_GET_Y` sin precio final.
- Promoción vencida, fuera de horario, de otra sucursal o inactiva.
- Varias promociones: elige la mejor y cuenta alternativas.
- Producto no disponible: sin preview.
- Promoción `ORDER`: no aparece en tarjetas.
- Catálogo público hidrata categorías y productos sin N+1.

### Frontend

- `ProductCard` con badge porcentual, precio tachado y precio final.
- `ProductCard` con NxM: badge sin precio tachado.
- `ProductCard` sin promoción: no cambia el layout.
- Detalle con varias promociones.
- `/promotions`: loading, vacío, cupones, productos y CTA por tipo.
- Header y mobile nav: ítem activo y navegación.
- Responsive de la navegación a 320/360 px.
- Accesibilidad: labels de badges y precios.

### E2E manual

- Producto con 20% → badge y precio final.
- Producto con 2x1 → badge sin precio tachado.
- Página de promociones → CTA lleva a la categoría/producto correcto.
- Carrito → el total coincide con la promoción mostrada (o se explica la diferencia por cantidad).

---

## 9. Etapas

### Etapa 0 — Definiciones

- Confirmar reglas de selección y stacking.
- Definir contrato `ProductPromotionPreview` y `PromotionCatalogItem`.
- Decidir mobile nav (6 ítems o “Más”).

### Etapa 1 — Backend

- Implementar cálculo de previews y endpoint de catálogo de promociones.
- Tests unitarios y e2e.
- OpenAPI y documentación.

### Etapa 2 — Datos y tarjetas

- Extender `@repo/domain` y `@repo/api`.
- `ProductCard` y detalle de producto.
- Tests de componentes.

### Etapa 3 — Página de promociones

- `PromotionsPage`, `PromotionCard`, secciones y CTAs.
- Ruta y navegación desktop/mobile.
- Tests de página y navegación.

### Etapa 4 — Rollout

- Feature flag `VITE_PRODUCT_PROMOTIONS` si se quiere activar por entorno.
- Comparar precios mostrados contra el carrito en staging.
- Medir badges visibles, clics a promociones y conversión.

---

## 10. Criterios de aceptación

- Un producto con promoción porcentual muestra badge, precio anterior y final.
- Un producto con NxM muestra el badge correcto y no un precio final inventado.
- Un producto sin promoción se ve igual que hoy.
- La página `/promotions` lista sólo promociones vigentes y sus CTA llevan al lugar correcto.
- “Promociones” está en header y mobile nav, con estado activo.
- El carrito sigue siendo la fuente de verdad del precio.
- No hay N+1 en el catálogo ni en la página de promociones.
- Tests, typecheck y lint pasan.

---

## 11. Riesgos y mitigaciones

| Riesgo                                        | Mitigación                                             |
| --------------------------------------------- | ------------------------------------------------------ |
| El precio mostrado no coincide con el carrito | Preview calculado en backend + nota de precio final    |
| Varias promociones o stacking ambiguo         | Mostrar la mejor y `+N promos`; no sumar en la tarjeta |
| NxM mal mostrado como precio final            | `finalPrice=null` y badge por cantidad                 |
| Topes de uso                                  | No bloquear el badge; avisar “sujeto a disponibilidad” |
| Promociones por sucursal sin dirección        | Mostrar sólo globales o pedir dirección                |
| Navegación mobile saturada                    | Validar 320 px; alternativa “Más”                      |
| N+1 en promociones                            | Hidratar productos/categorías en Commerce              |
| Caché obsoleta                                | Sin caché agresiva; invalidar al editar promociones    |
| Cambios de precio                             | Calcular preview en cada request, no persistirlo       |

---

## 12. Decisiones abiertas

1. ¿`FIXED_AMOUNT` muestra sólo badge o también un precio estimado? Recomendación: sólo badge.
2. ¿Se muestran promociones no stackables junto a otras? Recomendación: sólo la mejor.
3. ¿La página de promociones ordena por afinidad del usuario? Recomendación: sí, reutilizando el
   perfil de gustos.
4. ¿Mobile nav suma un sexto ítem o usa “Más”? Depende de la prueba a 320 px.
5. ¿La página requiere dirección? Recomendación: sí, para mostrar disponibilidad y sucursal.

---

## 13. Fuera de alcance

- Motor de precios nuevo o cambios en el carrito.
- Cupones automáticos o stackable complejos.
- Notificaciones push de promociones.
- A/B testing de badges en esta etapa.
- Historial de promociones vencidas.
