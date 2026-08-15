# UI Manifesto — DESA Apps

Este documento es la **fuente de verdad visual y de producto** para los frontends (store + admin). Todo agente que escriba UI debe leerlo antes de tocar código. Leer junto con las skills `interface-design`, `better-ui`, `impeccable`, `frontend-components` y `apple-ui-design`.

> **Principio raíz:** no hacemos una versión "más linda" de lo que ya existe. Entendemos el problema, cuestionamos la estructura, quitamos lo innecesario, organizamos lo que importa, damos jerarquía y espacio, y recién después aplicamos identidad. **Preservar el propósito. Romper el layout. Diseñar la experiencia.**

> **Compañero obligatorio:** `design-system.md` (en esta misma carpeta) registra lo **ya implementado** — inventario de pantallas/componentes, firma visual con medidas y decisiones con su porqué. Leer ambos. Si una decisión nueva cambia el sistema, actualizar ambos.

---

## 1. Principios de diseño

1. **Diseñar desde el problema, no desde la pantalla actual.** Primero entender qué necesita hacer/saber/decidir el usuario. La interfaz actual es evidencia, no la solución.
2. **Preservar el producto, no la interfaz.** Funcionalidad, intención, datos, reglas de negocio y necesidades reales se conservan. Su representación visual puede cambiar por completo (una tabla puede volverse una colección visual; una página puede volverse un sheet; tres pantallas pueden ser una).
3. **La jerarquía importa más que la cantidad de elementos.** Cada pantalla debe tener jerarquía clara: primario → secundario → contextual → de apoyo. Usar escala, posición, contraste, espacio, tipografía, agrupación e imagen. No meter todo dentro de contenedores.
4. **Menos UI, más producto.** Quitar bordes innecesarios, divisores, etiquetas redundantes, contenedores anidados, íconos sin propósito, color sin significado, encabezados obvios y navegación duplicada. Si al quitarlo no se pierde comprensión ni funcionalidad, quitarlo.
5. **El espacio vacío también es diseño.** No llenar una pantalla solo porque hay lugar. El aire crea jerarquía, ritmo y sofisticación.
6. **Componer, no juntar componentes.** Una pantalla no debe sentirse como piezas arrastradas de una librería. Pensar ritmo, balance, tensión, proporción y masa visual. No todo en la misma grilla ni con las mismas dimensiones.
7. **Usar cards solo cuando hay una razón.** Una card sirve para una entidad claramente distinta. Muchas veces alcanza tipografía + espacio + alineación + contraste. Menos cajas, más estructura.
8. **La tipografía es arquitectura.** La escala tipográfica comunica importancia. Los números pueden ser elementos visuales. Las etiquetas pueden desaparecer cuando el contexto alcanza. Si la UI funciona en blanco y negro solo con tipografía y espacio, la base es sólida.
9. **Diseñar con imágenes, no alrededor de ellas.** La fotografía puede ser fondo, superficie, contexto, navegación o storytelling. Permitir que algunas imágenes dominen la composición. Usar fotografía real (ver sección de imaginería).
10. **El color debe significar algo.** Construir primero con composición, escala, contraste, imagen, espacio y profundidad; después color. Una paleta restringida da más identidad que una multicolor. Menos colores, mejor usados.
11. **La profundidad se siente, no se anuncia.** Evitar sombras duras. Crear profundidad con tono, transparencia, blur, escala, posición y luz. Glassmorphism solo cuando comunica capas.
12. **Lo importante merece escala.** No convertir toda la información en texto chico. Una métrica clave puede ser enorme; una imagen puede dominar el viewport; una acción primaria puede ser imposible de no ver.
13. **Toda pantalla necesita un protagonista.** Si la respuesta a "¿qué debería mirar primero?" son cinco cosas, la jerarquía no está resuelta.
14. **Diseñar el recorrido, no las pantallas.** Pensar antes → durante → después. La UX debe sentirse continua.
15. **La navegación no debe competir con el contenido.** Priorizar tareas frecuentes; disclosure progresivo para el resto. Mobile y desktop no necesitan el mismo patrón.
16. **Mobile no es desktop comprimido.** Cada tamaño merece su propia composición (recomponer, no encoger).
17. **La interacción también tiene personalidad.** Diseñar hover, focus, pressed, loading, éxito, error, vacío, skeleton y transiciones. El motion explica cambios, no decora.
18. **Consistencia ≠ repetición.** Coherencia en radios, tipografía, spacing, íconos, estados, color y motion; pero las composiciones pueden variar según el contenido. Mismo lenguaje, frases distintas.
19. **Si todo parece importante, nada lo es.** Evitar cinco CTAs primarios, múltiples acentos y badges por todos lados. La restricción aumenta el impacto.
20. **Evitar "un dashboard".** No convertir todo en sidebar + header + 4 métricas + gráfico + tabla. Empezar por la necesidad del usuario.
21. **La interfaz debe sentirse inevitable.** El siguiente paso debe ser natural. Claridad > novedad.
22. **Premium ≠ complejo.** Significa precisión, contención, detalle, composición, buena tipografía y espacio. No más gradientes, blur, animaciones ni sombras.
23. **Dispuesto a destruir una solución mediocre.** El código existente es tiempo invertido, no necesariamente una buena decisión. La deuda visual también existe.
24. **Toda decisión necesita una razón.** Nunca "porque se ve mejor". Buscar la razón de jerarquía, carga cognitiva, velocidad de tarea, legibilidad o identidad.

### Orden de prioridades

Cuando haya conflicto, priorizar en este orden:

1. Comprensión
2. Utilidad
3. Jerarquía
4. Flujo
5. Composición
6. Identidad
7. Consistencia
8. Detalle visual
9. Reutilización de componentes

Nunca sacrificar las primeras para proteger las últimas.

### La pregunta fundamental

Antes de finalizar: **"¿Si nunca hubiera visto la interfaz anterior, la diseñaría así?"** Si la respuesta es no, seguís atado al pasado.

---

## 2. Verdades de producto (no inventar)

- **La entrega es a la dirección del cliente**, que se **carga en el flujo de checkout**. No existe "entrega al campus" ni una dirección por defecto.
- La **sucursal se asigna automáticamente** al confirmar (la más cercana, activa y abierta). No es una decisión del cliente.
- No hay pago en línea, mapa, ni descuentos automáticos.
- El carrito y el total son datos del servidor; el frontend no los calcula como verdad final.
- El estado de pedido tiene su propia máquina de estados y traducción (ver §5.6).

---

## 3. Dirección visual: "Calor"

Una app de delivery **cálida, vibrante y cercana**, como la comida recién hecha. No fría, no corporativa, no genérica.

- **Temperatura:** cálida en claro (cremas, naranja). En oscuro, el calor lo aporta el **naranja sobre negro**, no un fondo marrón.
- **Sensación:** apetito, urgencia, calidez. "Pedí y llega caliente".
- **Mobile = app, desktop = web.** Mobile: app nativa (dock flotante, densidad compacta, protagonista claro). Desktop: web cuidada (nav superior, más aire).

---

## 4. Paleta

Definida en `apps/*/src/theme.ts` como tokens semánticos de Chakra.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `bg` | `#FFFFFF` | `#000000` | Fondo de página (blanco puro en claro, **negro puro** en oscuro) |
| `bg.panel` | `#FFFFFF` | `#0A0A0A` | Tarjetas, header, dock |
| `bg.muted` | `#FFF1E5` | `#1A1A1A` | Fondo suave de inputs/cards destacados |
| `bg.subtle` | `#FFF9F4` | `#121212` | Fondo secundario / secciones |
| `fg` | `#1C1917` | `#F5F5F5` | Texto principal |
| `fg.muted` | `#6B7280` | `#A1A1A1` | Texto secundario |
| `fg.subtle` | `#9CA3AF` | `#737373` | Texto terciario |
| `border.subtle` | `#FBE4D2` | `#262626` | Bordes finos |
| `border.muted` | `#F6D6BE` | `#333333` | Bordes de separación |
| `border.emphasized` | `#EBC2A2` | `#404040` | Bordes de énfasis |
| `brand.500` | `#EA580C` | `#EA580C` | Elementos destacados, item activo |
| `brand.600` | `#C2410C` | `#C2410C` | Botón primario |
| `brand.700` | `#9A3412` | `#9A3412` | Hover / estados fuertes |
| `accent.500` | `#F59E0B` | `#F59E0B` | Indicadores secundarios |
| `success` | `#15803D` | `#4ADE80` | Confirmaciones / entregado |
| `warning` | `#B45309` | `#FBBF24` | Pendiente |
| `danger` | `#B91C1C` | `#F87171` | Errores / cancelado |
| `info` | `#1D4ED8` | `#60A5FA` | Confirmado / en camino |

**Reglas de color:**

- **Modo oscuro = negro + grises neutros + naranja.** Nunca marrones en dark (los fondos cálidos oscuros ensucian). El negro reemplaza al blanco puro.
- Siempre tokens semánticos, nunca hex sueltos en el markup.
- El naranja `brand` es el **único acento**. Un solo color, usado con intención.
- En claro el fondo es `#fff` siempre.
- Estados: combinar color + ícono + texto (nunca color solo).

---

## 5. Sistema y patrones

### 5.1 Tipografía

- **Fuente global:** Outfit (Google Fonts), en `index.html` y `theme.ts` (`fonts.heading`/`fonts.body`).
- **Jerarquía por peso y color, no solo por tamaño.** Tres niveles sobre la misma base: `value` 600/`fg`, `label` 500/`fg.muted`, `meta` 400/`fg.subtle`.
- Escala (ratio ~1.25): caption 12 · body 14/16 · h4 18 · h3 22 · h2 28 · h1 32 · display 44.
- Headings `fontWeight="bold"` (700), tracking negativo en tamaños grandes, `textWrap="balance"`.
- `tabular-nums` en números dinámicos (precios, contadores).

### 5.2 Geometría y profundidad

- Bordes píldora (`full`) en botones, chips y nav activo. Radios generosos (`xl`/`2xl`) en cards.
- **Concentricidad:** `outerRadius = innerRadius + padding`.
- Espaciado base 4px, múltiplos.
- **Profundidad:** en claro, bordes sutiles + sombras suaves; en oscuro, solo bordes (`rgba(255,255,255,0.06–0.12)` o tokens `border.*`), sin sombras.
- Glow "ember": usar blobs `brand.500`/`accent.500` con `filter="blur(80–90px)"` y opacidad baja, sobre superficie. Usar con contención (un protagonista por pantalla).

### 5.3 Header (`StoreHeader`)

- Sticky, `bg.panel`, borde inferior `border.subtle`.
- **Desktop:** logo + nav con píldora activa naranja + acciones (toggle dark, carrito, perfil).
- **Mobile: solo el logo.** Sin botones en el header. El carrito vive en el dock; el toggle dark vive en la página Perfil.

### 5.4 Navegación mobile (`MobileStoreNavigation`)

- Solo mobile, **dock flotante** (píldora centrada, `borderRadius="full"`, borde + sombra), no una barra a todo lo ancho.
- Item activo = píldora `brand.500` con texto blanco. Inactivo = `fg.muted`.
- El carrito muestra badge con la cantidad.
- Items de cuenta (Perfil, Editar, Direcciones, Apariencia) viven en la página Perfil, no duplicados en el dock.

### 5.5 Footer

- **Solo en desktop.** En mobile no hay footer (el dock y el contenido alcanzan).

### 5.6 Estados de pedido

Traducción + apariencia compartidas entre store y admin. Usar `OrderStatusBadge` (color + punto + texto) y, en seguimiento, un timeline.

| Estado | Etiqueta | Tratamiento |
|---|---|---|
| `PENDING` | Pendiente | `warning` |
| `CONFIRMED` | Confirmado | `info` |
| `PREPARING` | En preparación | `brand` (orange) |
| `READY_FOR_DELIVERY` | Listo para entregar | `purple` |
| `ON_THE_WAY` | En camino | `info` |
| `DELIVERED` | Entregado | `success` |
| `CANCELLED` | Cancelado | `danger` |

### 5.7 Iconografía y flechas

- Iconos: `@gravity-ui/icons`, `fill="currentColor"` (heredan color del contenedor; no pasar `color` con token al ícono directamente: envolver en un `Box` con `color`).
- **Chevrons: siempre simple** (`ChevronRight`/`ChevronLeft`). **Nunca** las flechas dobles raras (`ArrowChevronRight`/`ArrowChevronLeft`).

### 5.8 Imaginería

- Usar **fotografía real de Unsplash**, art-directed: que funcione como parte de la composición (espacio negativo, foco, contraste, crop mobile/desktop).
- No placeholders grises, gradientes que fingen ser imagen, ni bloques vacíos.
- Las imágenes de un mismo set deben pertenecer al mismo mundo visual. Curar, no llenar slots.

### 5.9 Datos

- Consumir la API desde `/api` (proxy de Vite).
- Mientras el backend sea stub, **mockear las respuestas** con SWR + fallback (patrón de `useProfile`, `useCatalog`, `useProduct`): intentar el endpoint y devolver datos mock si falla o no hay proxy.
- El estado global va con **Zustand** (`cartStore`, etc.).

### 5.10 Estructura de componentes

- Cada componente en `src/components/ComponentName/` con `index.tsx` (named export), `types.ts`, y `hooks/`/`utils/` solo si aportan (ver skill `frontend-components`).
- Chakra UI v3 siempre, nunca `div` custom. Tokens semánticos para dark mode automático.

---

## 6. Anti-patrones

- ❌ Fondos grises azulados fríos **y marrones en modo oscuro** (dark = negro + grises neutros).
- ❌ Múltiples acentos de color; color sin significado.
- ❌ Cards para todo (menos cajas, más estructura).
- ❌ Flechas dobles raras (`ArrowChevron*`); usar `Chevron*`.
- ❌ Footer en mobile.
- ❌ Botones en el header de mobile.
- ❌ Radios iguales en contenedores anidados.
- ❌ Números que se mueven (usar `tabular-nums`).
- ❌ `transition: all`, `will-change: all`.
- ❌ Colores hex sueltos en el markup.
- ❌ Múltiples CTAs primarios compitiendo.
- ❌ Inventar datos de producto (p. ej. "entrega al campus"); la entrega es a la dirección del cliente.

---

## 7. Cómo aplicar

1. Usar componentes Chakra y tokens semánticos siempre.
2. Botones primarios: `bg="brand.600" color="white"`, píldora.
3. Nav activo: píldora `brand.500` / texto blanco.
4. Cards: `bg="bg.panel"` + `borderRadius="2xl"` + borde `border.subtle` (solo cuando la entidad lo justifique).
5. Verificar mobile (390px) y desktop antes de dar por terminado; recomponer, no encoger.
