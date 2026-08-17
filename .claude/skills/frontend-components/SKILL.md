---
name: frontend-components
description: Reglas de creación de componentes frontend (client/): estructura de carpetas con named exports, separación lógica/presentación (SOC), uso exclusivo de componentes de Chakra UI en lugar de divs custom, estado global con Zustand, layouts en la carpeta layouts/ (nada suelto en el router) y componentes que pueden existir en ambas apps (store y admin). Aplicar antes de escribir o modificar cualquier componente React.
---

# Componentes frontend

Reglas para crear y mantener componentes React en `client/` (apps/store y apps/admin).

## Estructura de carpetas

Todo componente vive en `src/components/ComponentName/` con esta estructura:

```text
ComponentName/
├── index.tsx          # componente principal, named export
├── types.ts           # props y tipos del componente
├── hooks/             # lógica (solo si es requerido)
│   └── useX.ts
├── utils/             # funciones puras (solo si es requerido)
│   └── x.ts
└── SubComponent.tsx   # subcomponentes (archivo plano, NO carpeta)
```

Reglas:

- **Named exports siempre.** Nunca `export default`. Se exporta con `export const ComponentName = (...) => ...`.
- **Destructurar props siempre.** Nunca `(props: LogoProps)`; usar `({ height, showWordmark }: LogoProps)`. La destructuración va en la firma del componente.
- **`index.tsx` exporta el componente principal** con el nombre de la carpeta.
- **Subcomponentes**: archivos planos `ComponentName/SubComponent.tsx`, no carpetas anidadas.
- **No re-exports**: no crear `index.ts` que re-exporte otros módulos. Cada consumidor importa desde la ruta directa del archivo.
- `types.ts` siempre presente; `hooks/` y `utils/` solo cuando aportan.

## Separación de responsabilidades (SOC)

- **Presentación** en `index.tsx` y subcomponentes: solo JSX y estilos.
- **Lógica** en `hooks/`: fetching (SWR), estado local, navegación.
- **Datos puros** en `utils/`: transformaciones, config, constantes.
- **Tipos** en `types.ts`.

## Siempre Chakra UI, nunca divs custom

- Usar los componentes de Chakra UI v3: `Box`, `Flex`, `HStack`, `VStack`, `Container`, `Button`, `IconButton`, `Badge`, `Drawer`, `Link`, etc.
- **No** reemplazar `Flex`/`HStack`/`VStack` por `div` con CSS manual.
- Referencia de componentes: https://chakra-ui.com/docs/components/concepts/overview
- Iconos: usar `@gravity-ui/icons` (paquete ya instalado), no dibujar SVGs a mano.
- Usar tokens semánticos (`bg.panel`, `fg`, `border.subtle`, `colorScheme`) para que el dark mode funcione solo.

## Estado global con Zustand

- El estado global se maneja con **Zustand**, no con contextos propios ni props drilling extenso.
- Stores en `src/stores/` (ej. `cartStore.ts`).

## Layouts y router

- Los layouts van en `src/layouts/` (ej. `layouts/StoreLayout/index.tsx`).
- **Nada se renderiza suelto dentro del router**: el router monta layouts, y los layouts componen header/footer/nav y un `<Outlet />`.
- Las páginas viven en `src/pages/` y se montan como rutas dentro del layout.

## Componentes compartidos (`packages/*`)

Los componentes, tipos, datos y tokens que van a compartir más de una app (store, admin, rider) viven en paquetes bajo `packages/`:

| Paquete | Contenido | Ejemplos |
|---|---|---|
| `@repo/components` | Componentes UI genéricos + UI de dominio | `Logo`, `ColorModeProvider`, `EmptyState`, `OrderStatusBadge`, `OrderTimeline`, `RequireAuth`, `MobileNav`, `Footer`, `PrimaryButton`/`SecondaryButton`, `Lead`, `ResponsiveModal`, `PageTitle`, `SectionTitle`, `Eyebrow`, `Strong`, `Price`, `Muted` |
| `@repo/domain` | Tipos y constantes de dominio (TS puro, sin React) | `Order`, `OrderStatus`, `Address`, `Product`, `LoginInput`, `ORDER_STATUS_LABELS`, `formatPrice` |
| `@repo/api` | Capa de datos: hooks + adaptador (REST hoy, GraphQL mañana) + mocks + sesión | `useCatalog`, `useProfile`, `useOrder`, `useAuthStore`, `MOCK_ORDERS` |
| `@repo/theme` | Tokens semánticos de Chakra (`defineConfig`) | `config` |

Reglas:

- **Mover a `@repo/components` cuando el componente lo necesite más de una app.** Los componentes específicos de una sola app (ej. `ProductCard`, `StoreHeader`, `CartDrawer`) se quedan en `apps/*/src/components/`.
- Los componentes compartidos **no importan `@repo/theme`**: usan tokens por string (`"brand.500"`, `"bg.muted"`) que resuelve el `system` de cada app en runtime.
- **Excepción a la regla de "no re-exports":** un paquete sí tiene un barrel público (`packages/*/src/index.ts`) porque es su API de consumidor. Dentro de las apps y de los paquetes se sigue importando desde la ruta directa.
- Los consumidores importan desde el barrel: `import { Logo } from "@repo/components"`.
- **Assets de marca (logo) viven en cada app** (`apps/*/src/assets/`), no en el paquete: `Logo` recibe `lightSrc`/`darkSrc` como props. Evita que tsup rompa los imports de assets.
- **Un mismo look = un mismo componente (tokenizar, no repetir):** antes de componer Chakra a mano, usar los tokens:
  - Títulos: `PageTitle` (h1 de página), `SectionTitle` (h2 de sección).
  - Texto: `Eyebrow` (overline uppercase), `Lead` (párrafo lead), `Strong` (semibold), `Muted` (fg.muted), `Subtle` (fg.subtle), `Price` (semibold + tabular-nums), `TextLink` (enlace brand.600).
  - Formularios: `TextField` / `PasswordField` / `TextAreaField` (presentacionales, con `label` + `invalid` + `errorText`) y `FormField` / `FormPasswordField` / `FormTextAreaField` (integrados con React Hook Form + Zod). **Validación siempre con RHF + `zodResolver` + schemas de `@repo/domain`**, nunca `useState` a mano. Patrón: `useForm` en el hook, `FormProvider` + `FormField` en la página, `form.handleSubmit(onValid)` como `onSubmit`.
  - Botones: `PrimaryButton` / `SecondaryButton` / `InverseButton` (blanco sobre brand) / `GhostButton` (ghost, color por prop) / `OutlineButton` (outline sutil) — **ya traen `size` (default `lg` en primary/secondary/inverse), `radius` y colores; no volver a personalizarlos**. Solo `children` + props semánticas (`asChild`, `type`, `disabled`, `loading`, `width`, `onClick`, `size`/`color` si hace falta).
  - Layout: `PageContainer` (angosto `2xl`, formularios/detalle) / `WidePageContainer` (full-width, listados) — **toda página usa uno de estos como raíz**, `Footer`, `ResponsiveModal` (Dialog en desktop, bottom-sheet en mobile), `SidePanel` (panel lateral), `ChipCarousel` (fila de chips con scroll horizontal).
- Los paquetes se compilan con `tsup`; consumir desde `dist/` (no desde `src/`).

## Dark mode

- El color mode lo provee `ColorModeProvider` (next-themes) envuelto en la raíz de la app.
- Para valores que dependen del tema, usar `useColorModeValue(lightValue, darkValue)`.

## Tema global (ambos frontends)

- **Fuente**: Outfit desde Google Fonts (link en `index.html` de cada app). Los tokens (`fonts.heading`, `fonts.body`, `brand.*`, `bg.*`, `fg.*`, `border.*`) viven en `@repo/theme` (`packages/theme/src/config.ts`).
- Cada app crea su `system` en `src/theme.ts` con `createSystem(defaultConfig, config)` usando el `config` de `@repo/theme`. No duplicar tokens en las apps.
- **Fondo**: en modo claro el fondo es `#fff` siempre. Usar el token semántico `bg` (blanco en claro, negro en dark), nunca `bg.subtle` para fondos de página.
- El `system` se pasa a `<ChakraProvider value={system}>`.
