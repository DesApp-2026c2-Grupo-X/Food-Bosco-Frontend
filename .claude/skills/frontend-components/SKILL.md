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

## Componentes en ambas apps

- Un componente (ej. `Logo`) puede existir en **store y admin**.
- Diseñar los componentes sin acoplarlos a una app específica; mover a un paquete compartido solo cuando se necesite en ambas.

## Dark mode

- El color mode lo provee `ColorModeProvider` (next-themes) envuelto en la raíz de la app.
- Para valores que dependen del tema, usar `useColorModeValue(lightValue, darkValue)`.

## Tema global (ambos frontends)

- **Fuente**: Outfit desde Google Fonts (link en `index.html` de cada app) y configurada en `src/theme.ts` (tokens `fonts.heading` y `fonts.body`).
- **Fondo**: en modo claro el fondo es `#fff` siempre. Usar el token semántico `bg` (blanco en claro, oscuro en dark), nunca `bg.subtle` para fondos de página.
- El `system` de Chakra customizado vive en `src/theme.ts` (fuente + `globalCss`) y se pasa a `<ChakraProvider value={system}>`.
