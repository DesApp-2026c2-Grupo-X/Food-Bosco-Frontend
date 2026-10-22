# UX: estados de carga, transiciones, scroll y cards

Fecha: 2026-10-20  
Rama: `feature/ux-loading-motion`

## 1. Skills y criterio de diseño

Skills consultadas:

- `better-ui`: transiciones interrumpibles, duración breve, `transform`/`opacity`,
  `prefers-reduced-motion`, evitar `transition: all`.
- `interface-design`: estados obligatorios, jerarquía, motion < 300 ms, foco visible,
  feedback estático además del movimiento.
- `impeccable` y `apple-ui-design`: contención visual, claridad y microinteracciones.
- `frontend-components`: componentes compartidos en `@repo/components`, Chakra UI, named
  exports, `types.ts` y sin dependencias innecesarias.
- `save-prompts`: registro de la interacción.

La fuente de verdad visual sigue siendo `docs/especificaciones/ui-manifesto.md`.

## 2. Decisión de herramientas

No se instaló Motion, GSAP ni otra librería:

- El proyecto ya usa Chakra UI, `Skeleton`, `Spinner`, `loading` en botones y diálogos
  animados por Chakra.
- Los casos necesarios se resuelven con CSS, Web Animations API e `IntersectionObserver`.
- Esto evita dependencias nuevas, impacto de bundle y duplicación de soluciones.

Se crearon primitivas compartidas:

- `usePrefersReducedMotion`.
- `Reveal` (aparición al entrar en pantalla, una sola vez).
- `PageTransition` (transición breve al cambiar de ruta, sin animar la primera carga).
- `LoadingState` ampliado con variantes `spinner`, `skeleton` y `list`, `role="status"`,
  `aria-live` y `aria-busy`.

## 3. Inventario y cambios

| Área                                         | Situación encontrada                             | Mejora aplicada                                                                 |
| -------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| Botones de formularios                       | Ya usaban `loading` de Chakra                    | Se mantiene; no se duplicó lógica                                               |
| Tablas admin/branch                          | `DataTable` ya mostraba skeletons                | Se agregó `aria-busy` y se respeta movimiento reducido                          |
| Edición admin/branch                         | `EditPageShell` mostraba solo el título          | Ahora muestra título + skeletons                                                |
| Store Home                                   | Sin indicador al cargar pedidos/catálogo         | Skeletons para pedidos, categorías y destacados                                 |
| Store Catálogo                               | Grid aparecía de golpe                           | Skeletons existentes + aparición suave del grid                                 |
| Store Órdenes                                | El estado vacío se ocultaba, pero no había carga | Lista de skeletons                                                              |
| Store Carrito / Checkout / Detalle de pedido | Spinner o ausencia de contenido                  | Skeletons con contexto de página                                                |
| Store Sucursales                             | Las cards aparecían sin feedback de carga        | Lista de skeletons                                                              |
| Store Perfil                                 | `return null` mientras cargaba                   | Skeletons de formulario                                                         |
| Rider Inicio / Historial / Viaje             | Spinner                                          | Skeletons de listas con contexto                                                |
| Rider Perfil / Vehículo                      | `return null` mientras cargaba                   | Skeletons de formulario                                                         |
| Branch Inicio                                | No había carga para pedidos                      | Skeletons de pedidos                                                            |
| Cards interactivas                           | Solo cambiaba el borde al hover                  | Elevación sutil, borde y `translateY(-2px)`, foco visible y movimiento reducido |
| Accesos rápidos                              | Sin transición                                   | Mismo tratamiento que cards interactivas                                        |
| Modal / drawer                               | Chakra ya anima apertura/cierre                  | Se conserva; no se agregó otra capa                                             |
| Scroll                                       | Sin animaciones de entrada                       | `Reveal` selectivo en Home, catálogo y secciones de administración              |

## 4. Accesibilidad

- `LoadingState` anuncia el estado con `role="status"`, `aria-live="polite"` y un texto
  oculto para lectores de pantalla.
- `DataTable` expone `aria-busy` mientras carga.
- Toda animación respeta `prefers-reduced-motion`: se elimina el movimiento y se conservan
  los cambios estáticos (borde, sombra, color).
- `Reveal` mantiene el contenido en el DOM; no bloquea scroll ni interacción.
- Las cards informativas no se hicieron focusables ni parecen botones.
- `PageTransition` no se ejecuta en la primera carga.

## 5. Verificación

- `npm run check-types`: OK.
- `npm run lint`: OK.
- Tests dirigidos:
  - `packages/components` (feedback, motion, AppShell, presentacional).
  - Store: Home, Catálogo, Órdenes, Carrito, Detalle, Checkout, Sucursales, Producto.
  - Rider: Inicio, Historial, Viaje, Perfil, Vehículo.
  - Admin: Inicio, BranchEdit.
  - Branch: Inicio.
- No se ejecutó la suite completa de Vitest por el tiempo que demanda el monorepo;
  se cubrieron todas las áreas modificadas.

## 6. Limitaciones

- No se agregaron animaciones de transición entre páginas dentro del paquete `auth`
  (login/registro), porque usan `AuthLayout` fuera de `AppShell`/`DashboardLayout`.
- Las animaciones de scroll se aplicaron de forma selectiva; no se animaron tablas ni
  listas largas para no penalizar el rendimiento.
- No se midió el impacto real en bundle ni FPS en dispositivos de gama baja.
