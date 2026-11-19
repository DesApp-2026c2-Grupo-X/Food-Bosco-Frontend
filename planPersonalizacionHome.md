# Plan — Personalización de la página principal (Tienda)

> **Estado:** IMPLEMENTADO (frontend) · **Fecha:** 2026-11-18
> **Alcance:** `apps/store` + piezas puras en `@repo/domain`. Sin cambios de contrato en el Gateway.
> **Evolución server-side:** ver `planPersonalizacionHomeBackend.md`.

## 1. Diagnóstico de la página principal actual

La home (`apps/store/src/pages/HomePage/index.tsx`) es una página editorial, cálida y mobile-first.
Hoy ya resuelve bien:

- Hero con saludo por nombre y dos CTA claros (catálogo / sucursales).
- Pedidos en curso con seguimiento.
- Categorías activas como chips navegables.
- Ocho productos destacados del catálogo.
- Promociones públicas.
- Banner de entrega y bloque “Cómo funciona”.
- Skeleton/reveal y comportamiento responsive.

Limitaciones frente a personalización:

- El contenido es igual para todos: no usa historial, frecuencia, recencia ni favoritos.
- “Los más pedidos” no es realmente un ranking: toma los primeros ocho productos del catálogo.
- No hay acceso rápido a pedidos anteriores (el usuario debe ir a “Mis pedidos” y repetir desde ahí).
- Las categorías y promociones no se ordenan según afinidad.
- La dirección seleccionada no se usa como contexto visible de entrega.
- No se aprovechan interacciones de navegación (productos vistos).

## 2. Funcionalidades y componentes existentes

| Pieza                                             | Ubicación                                                 | Estado                                        |
| ------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------- |
| `HomePage`                                        | `apps/store/src/pages/HomePage/index.tsx`                 | Se evoluciona, no se reescribe                |
| `ProductCard`                                     | `apps/store/src/components/ProductCard`                   | Se extiende con un texto de contexto opcional |
| `ActiveOrderCard`                                 | `apps/store/src/components/ActiveOrderCard`               | Se conserva                                   |
| `RepeatOrderModal` + `useRepeatOrder`             | `apps/store/src/components/RepeatOrderModal`, `@repo/api` | Se reutiliza para “Volvé a pedir”             |
| `useOrders`                                       | `@repo/api`                                               | Fuente del historial y pedidos activos        |
| `useCatalog`                                      | `@repo/api`                                               | Categorías y productos disponibles            |
| `useAvailableBranches`                            | `@repo/api`                                               | Sucursales que llegan a la dirección          |
| `usePublicPromotions`                             | `@repo/api`                                               | Promociones vigentes publicadas               |
| `useAddresses` + `addressStore`                   | `@repo/api`, `apps/store/src/stores`                      | Contexto de entrega                           |
| `useProfile` + `authStore`                        | `@repo/api`                                               | Identidad del usuario correcto                |
| `SectionHeader`, `Card`, `ChipCarousel`, `Reveal` | `@repo/components`                                        | Se conservan                                  |

## 3. Aspectos que deben conservarse

- Identidad visual “Calor”: hero editorial con ember glow, naranja como único acento, tipografía y radios actuales.
- Hero con nombre, CTAs y foto; sólo se agrega contexto, no se reemplaza.
- Pedidos en curso arriba del contenido de descubrimiento.
- Navegación por categorías con `?cat=<id>` al catálogo.
- Browser de promociones y CTA a sucursales.
- Bloque “Cómo funciona” y footer.
- Estados de carga, empty states y navegación mobile existentes.
- Reglas de producto: sólo productos disponibles, sucursal asignada automáticamente, sin pago online.

## 4. Oportunidades de mejora y personalización

1. **Contexto de entrega visible:** mostrar la dirección elegida y el horario (“Buenas noches”) en el hero.
2. **Volvé a pedir:** acceso directo a los últimos pedidos entregados reutilizando el flujo de repetición existente.
3. **Para vos:** recomendaciones de productos basadas en historial, frecuencia y recencia.
4. **Descubrí algo nuevo:** productos de categorías que el usuario todavía no explora, para evitar un loop cerrado.
5. **Categorías ordenadas por afinidad:** se conserva el carrusel, pero primero las categorías que más pide.
6. **Promociones para vos:** se conservan las promociones, ordenadas por afinidad a categorías/productos/sucursales.
7. **Cerca de vos:** el banner de entrega muestra la sucursal más cercana y si está abierta.
8. **Vistos hace poco:** continuidad de navegación con productos vistos, guardados por usuario.

No se incorporan secciones que dupliquen funciones existentes (por ejemplo, una sección separada de “favoritos” cuando “Para vos” ya los prioriza).

## 5. Funcionalidades nuevas propuestas

### 5.1 Perfil de gustos calculado en el cliente

A partir de pedidos `DELIVERED` se calcula, con ponderación por recencia y cantidad:

- categorías favoritas;
- productos frecuentes;
- sucursales favoritas;
- cantidad de pedidos completados y último pedido.

La lógica vive en `@repo/domain` (`personalization.ts`) como funciones puras y testeables.

### 5.2 Recomendaciones con diversidad

- “Para vos” combina productos ya pedidos + categorías afines.
- Se aplica un tope por categoría para no repetir cuatro hamburguesas seguidas.
- “Descubrí algo nuevo” usa categorías sin historial y excluye productos ya recomendados.
- Usuario nuevo: se mantiene “Los más pedidos” (orden actual del catálogo) sin inventar señales.

### 5.3 Volvé a pedir

- Se muestran hasta tres pedidos entregados recientes.
- El botón abre el `RepeatOrderModal` existente, que ya valida disponibilidad, opciones y precios actuales.
- No se duplica lógica de repetición ni se crea un endpoint nuevo.

### 5.4 Continuidad de navegación

- Store local `recentViewsStore` con productos vistos, **separados por `user.id`**.
- Se registra la vista en el detalle de producto.
- La home muestra “Vistos hace poco” a usuarios sin historial y sólo si hay productos que siguen
  disponibles; para usuarios con historial, la vista reciente puede influir en “Para vos” sin sumar
  otra grilla.

### 5.5 Contexto local y horario

- Saludo contextual (`Buen día` / `Buenas tardes` / `Buenas noches`).
- Dirección seleccionada visible en el hero.
- Sucursal más cercana calculada con `haversineDistanceMeters` + `isBranchOpenNow`.
- El banner de entrega se adapta sin cambiar su estructura.

## 6. Modificaciones sobre funcionalidades existentes

| Elemento            | Cambio                                                                         | Justificación                                       |
| ------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| Hero                | Eyebrow contextual + lead adaptado                                             | Personalización sin romper la composición editorial |
| `HomeCatalog`       | Categorías ordenadas por afinidad; “Los más pedidos” sólo para usuarios nuevos | Conservar el bloque, mejorar su relevancia          |
| `ProductCard`       | Prop opcional `hint`                                                           | Explicar por qué se recomienda cada producto        |
| `PromotionsSection` | Título y orden personalizados                                                  | Promociones más relevantes sin nueva UI             |
| `DeliveryBanner`    | Sucursal cercana, distancia y estado                                           | Aprovechar ubicación ya seleccionada                |
| `ProductDetailPage` | Registrar vista del producto para el usuario actual                            | Señal de navegación para continuidad                |

## 7. Datos necesarios y disponibilidad actual

| Dato                         | Disponibilidad                 | Uso                                     |
| ---------------------------- | ------------------------------ | --------------------------------------- |
| Nombre del usuario           | `me` / `authStore`             | Saludo                                  |
| Dirección seleccionada       | `addressStore` + `myAddresses` | Contexto y cercanía                     |
| Historial de pedidos + ítems | `myOrders`                     | Gustos, frecuencia, recencia, reordenar |
| Sucursales disponibles       | `availableBranches`            | Cercanía y estado                       |
| Catálogo y categorías        | `categories`, `products`       | Candidatos y diversidad                 |
| Promociones públicas         | `publicPromotions`             | Orden por afinidad                      |
| Productos vistos             | Store local por usuario        | Continuidad                             |
| Búsquedas                    | No persistidas hoy             | Evaluado; se difiere (ver §12)          |
| Preferencias explícitas      | No existen en el modelo        | Futuro (perfil)                         |

## 8. Servicios que se reutilizan o modifican

- **Gateway GraphQL:** sin cambios. Se reutilizan `me`, `myOrders`, `categories`, `products`, `availableBranches`, `publicPromotions`, `myAddresses`.
- **Auth Service:** sin cambios. El `user.id` delimita los datos locales.
- **Commerce Service:** sin cambios. El historial ya incluye ítems, sucursal y estado.
- **Reporting Service:** no se usa para la home; sus agregados son de “Mi actividad” y de administración. Evita duplicar lógica y llamadas.
- **Frontend:** nuevos módulos puros de dominio, hook de composición de home, store de vistas y componentes de sección.

## 9. Cambios necesarios por capa

### Frontend (`apps/store`)

- `HomePage`: composición de secciones personalizadas.
- `components/ReorderSection`: tarjetas de pedidos anteriores + modal de repetición.
- `components/PersonalizedProductsSection`: grilla reutilizable con hint.
- `stores/recentViewsStore`: vistas por usuario, con límite y persistencia local.
- `hooks/useTrackRecentView`: registro de vista en detalle de producto.
- `pages/HomePage/hooks/useHomePersonalization`: composición y memoización de señales.

### Dominio (`packages/domain`)

- `personalization.ts`: perfil de gustos, ranking, diversidad, promociones y reordenamiento.
- Export en `index.ts`.
- Tests unitarios de ranking, diversidad, usuario nuevo y promociones.

### API (`packages/api`)

- Sin hooks nuevos obligatorios: los datos ya existen.
- Se conserva el patrón de errores/empty states actual.

### Gateway / microservicios

- Sin cambios en esta etapa. El cálculo es determinístico, barato y ocurre sobre datos ya autorizados del usuario.
- Se documenta una evolución futura hacia `homeFeed` server-side si se necesita consistencia multi-dispositivo, A/B testing o preferencias explícitas.

## 10. Etapas de implementación y dependencias

1. **Etapa 1 — Lógica pura de personalización** (`@repo/domain`) + tests.
   Dependencia: ninguna.
2. **Etapa 2 — Store de vistas y registro en detalle de producto.**
   Dependencia: `authStore`.
3. **Etapa 3 — Hook de composición de home.**
   Dependencia: etapas 1 y 2.
4. **Etapa 4 — Secciones nuevas y ajustes de las existentes.**
   Dependencia: etapa 3.
5. **Etapa 5 — Tests de home, typecheck y lint.**
   Dependencia: etapa 4.

Prioridad: “Volvé a pedir” y “Para vos” (mayor valor inmediato), luego descubrimiento y contexto local.

## 11. Pruebas y criterios de aceptación

- Usuario nuevo: ve hero genérico, “Los más pedidos”, categorías en orden original y no ve “Volvé a pedir” ni “Para vos”.
- Usuario con historial: ve “Volvé a pedir”, “Para vos”, categorías ordenadas por afinidad y promociones priorizadas.
- “Volvé a pedir” abre el modal existente y no repite lógica de carrito.
- Productos no disponibles nunca aparecen en recomendaciones.
- No hay productos duplicados entre “Para vos” y “Descubrí algo nuevo”.
- Máximo dos productos por categoría en “Para vos” cuando hay diversidad suficiente.
- Vistas recientes de un usuario no se muestran a otro usuario en el mismo navegador.
- Pedidos activos siguen visibles arriba y sin regresiones.
- `npm run check-types` y los tests de home/dominio pasan.

## 12. Riesgos técnicos y mejoras futuras

### Riesgos

- **Datos locales por navegador:** las vistas no viajan entre dispositivos; se mitiga separando por usuario.
- **Historial escaso:** con uno o dos pedidos las señales son débiles; por eso hay fallback y diversidad.
- **Sobre-personalización:** se limita la cantidad de secciones y se mantiene el bloque “Cómo funciona”.
- **Privacidad:** no se envían señales nuevas al backend; sólo se usan respuestas ya autorizadas y datos locales del usuario.
- **Rendimiento:** el cálculo es O(productos + pedidos) y se memoiza; no agrega llamadas de red.

### Mejoras futuras

- Endpoint `homeFeed(lat, lng)` en el Gateway para recomendaciones consistentes entre dispositivos.
- Preferencias explícitas en el perfil (categorías y restricciones alimentarias).
- Búsquedas recientes con `?q=` en catálogo y persistencia por usuario.
- A/B testing de secciones y pesos del ranking.
- Métricas de clic/impresión para aprender de interacciones reales.
- Machine learning sólo si las señales simples dejan de ser suficientes.

---

## Implementación realizada

### Migración a `homeFeed` del backend (2026-11-18)

La home puede consumir el feed server-side con `VITE_HOME_FEED=true`:

- `@repo/api` expone `useHomeFeed`, que consulta `homeFeed` y mapea la respuesta a tipos de
  `@repo/domain`.
- Con el flag activo, la home usa `forYou`, `discovery`, `reorder`, categorías, promociones,
  sucursal favorita y cercana del backend.
- Para usuarios nuevos sin `forYou`, se conserva el catálogo local como “Los más pedidos”.
- Si el flag está apagado, la query falla o el backend no responde, se usa el cálculo local actual.
- `VITE_HOME_FEED=false` es el valor por defecto; la migración es gradual.

### Estado

Implementado en frontend sobre la home existente. **No se agregaron endpoints ni se modificó el
contrato del Gateway.** La personalización se calcula con datos que el usuario ya puede consultar.

### Funcionalidades implementadas

| Funcionalidad               | Comportamiento                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Perfil de gustos**        | Se construye con pedidos `DELIVERED`, ponderando cantidad y recencia (vida media de 45 días).                          |
| **Hero contextual**         | Saludo por horario, dirección seleccionada y recomendación de la categoría principal.                                  |
| **Volvé a pedir**           | Hasta 3 pedidos entregados recientes y distintos; abre el `RepeatOrderModal` existente.                                |
| **Para vos**                | Productos ordenados por producto/categoría favorita, con diversidad máxima de 2 por categoría cuando hay alternativas. |
| **Descubrí algo nuevo**     | Productos de categorías no exploradas, sin repetir los ya recomendados ni los comprados.                               |
| **Categorías por afinidad** | El carrusel conserva todas las categorías, pero prioriza las que más pide el usuario.                                  |
| **Promociones para vos**    | Se conservan las promociones públicas; se ordenan por afinidad a categorías, productos y sucursales.                   |
| **Cerca de vos**            | El banner usa la sucursal más cercana a la dirección, su distancia y si está abierta.                                  |
| **Vistos hace poco**        | Continuidad para usuarios sin historial, con productos vistos por ese usuario y todavía disponibles.                   |
| **Usuario nuevo**           | Mantiene “Los más pedidos”, categorías en orden original y no muestra reordenamiento ni “Para vos”.                    |

### Componentes y archivos

**Nuevos**

- `packages/domain/src/personalization.ts`: perfil, ranking, diversidad, descubrimiento, promociones
  y reordenamiento. Funciones puras, sin React.
- `packages/domain/src/__tests__/personalization.test.ts`.
- `apps/store/src/pages/HomePage/hooks/useHomePersonalization.ts`: composición memoizada de señales.
- `apps/store/src/pages/HomePage/utils/homeGreeting.ts`: saludo por franja horaria.
- `apps/store/src/components/ReorderSection/`: tarjetas de “Volvé a pedir”.
- `apps/store/src/components/PersonalizedProductsSection/`: grilla reutilizable con hint por producto.
- `apps/store/src/stores/recentViewsStore.ts`: vistas por `user.id`, con límite de 12 y persistencia local.
- `apps/store/src/stores/__tests__/recentViewsStore.test.ts`.
- `apps/store/src/hooks/useTrackRecentView.ts`.

**Modificados**

- `apps/store/src/pages/HomePage/index.tsx`: se conservó la estructura y el hero editorial; se
  elevó `useCatalog` para compartir datos, se agregaron secciones condicionales y se personalizaron
  banner y promociones.
- `apps/store/src/components/ProductCard/index.tsx` + `types.ts`: prop opcional `hint` para explicar
  por qué se recomienda un producto.
- `apps/store/src/pages/ProductDetailPage/index.tsx`: registra la vista del producto del usuario actual.
- `apps/store/src/pages/__tests__/smoke.test.tsx`: se agregó `useAuthStore` al mock de `@repo/api`.

### Servicios y endpoints involucrados

No hubo cambios de backend. Se reutilizan:

- `me` → nombre del usuario.
- `myAddresses` + `addressStore` → dirección y contexto local.
- `myOrders` → historial, ítems, sucursal, estados y datos de reordenamiento.
- `categories` + `products(filter: {lat, lng})` → candidatos disponibles.
- `availableBranches(lat, lng)` → sucursal más cercana.
- `publicPromotions` → promociones vigentes publicadas.
- `repeatOrder` (mutación existente) → repetir pedido con validación del backend.

No se usó `myReportsOverview` para la home: sus agregados son de “Mi actividad” y habrían duplicado
la consulta de pedidos. El cálculo local es más simple y no agrega latencia.

### Decisiones técnicas

1. **Cálculo en cliente y determinístico.** Con el volumen actual y los datos disponibles, un
   ranking ponderado cubre el objetivo sin introducir ML ni un servicio nuevo.
2. **Historial como fuente principal.** `myOrders` ya trae ítems y sucursal; no hizo falta un
   endpoint de recomendaciones.
3. **Diversidad con tope por categoría.** Evita que “Para vos” sea cuatro variantes del mismo
   producto, pero permite completar la grilla si el catálogo es chico.
4. **Descubrimiento separado.** “Descubrí algo nuevo” existe sólo cuando quedan productos de
   categorías no exploradas fuera de “Para vos”; si el catálogo es chico, se oculta para no repetir.
5. **No se creó “Tus favoritos” como sección aparte.** Los favoritos ya se expresan en “Para vos”
   con el hint “Ya lo pediste” y en las categorías ordenadas. Una sección extra habría duplicado
   contenido.
6. **Vistas recientes por usuario.** Se guardan en `localStorage` bajo `user.id`; no se mezclan
   cuentas. No se envían al backend.
7. **Sin preferencias explícitas inventadas.** El modelo de usuario actual no las tiene; se dejaron
   como evolución futura.
8. **Búsquedas no implementadas.** Hoy el buscador del catálogo es efímero y no tiene endpoint de
   historial. Persistir términos sin usarlos para ranking habría agregado ruido; queda como fase 2.

### Cambios en la experiencia existente y justificación

- El hero sigue siendo el mismo protagonista visual; sólo suma contexto útil (horario, dirección y
  categoría principal).
- “Los más pedidos” se conserva para usuarios nuevos. Para usuarios con historial se reemplaza por
  “Para vos”, que es el mismo bloque de productos con un ranking relevante.
- El carrusel de categorías no cambió de componente ni de navegación; sólo cambia el orden.
- Las promociones conservan tarjetas, badges y CTA; sólo cambia el título y el orden.
- El banner de entrega conserva composición y CTA; ahora comunica la sucursal real.
- Se mantuvieron pedidos en curso, “Cómo funciona”, footer, skeletons, `Reveal` y responsive.

### Pruebas realizadas

- `packages/domain/src/__tests__/personalization.test.ts`: perfil, usuario nuevo, repetición,
  diversidad, disponibilidad, descubrimiento, categorías, promociones y deduplicación de pedidos.
- `apps/store/src/stores/__tests__/recentViewsStore.test.ts`: orden, deduplicación, aislamiento por
  usuario y límite.
- `apps/store/src/pages/HomePage/__tests__/HomePage.test.tsx`: usuario nuevo, usuario con historial,
  reordenamiento, “Para vos”, descubrimiento y “Vistos hace poco”.
- `npm --workspace @repo/store run lint`: sin errores.
- `npm --workspace @repo/store run typecheck`: sin errores.
- `npm run check-types`: sin errores.
- `npm test`: **265 archivos y 1480 tests en verde** (incluye los nuevos tests de dominio, store y home).

### Funcionalidades pendientes

- Mostrar “Vistos hace poco” también a usuarios con historial (hoy se prioriza no saturar la home).
- Persistir búsquedas recientes y usarlas para ordenar resultados o sugerir categorías.
- Preferencias explícitas en el perfil (categorías, restricciones alimentarias).
- Reacciones explícitas (“me gusta” / “no me interesa”) para mejorar el ranking.
- Consistencia multi-dispositivo mediante un `homeFeed` del Gateway.

### Mejoras futuras recomendadas

1. **`homeFeed` server-side** con las mismas reglas, para que la home sea idéntica en web y apps.
2. **Eventos de interacción** (impresión, clic, agregado al carrito) para ajustar pesos con datos
   reales y medir el impacto de cada sección.
3. **A/B testing** de orden de secciones y del peso de recencia.
4. **Preferencias explícitas** y filtros alimentarios.
5. **Historial de búsqueda** con `?q=` en catálogo y almacenamiento por usuario.
6. **ML sólo si hace falta**: primero medir si el ranking simple mejora conversión y repetición.
