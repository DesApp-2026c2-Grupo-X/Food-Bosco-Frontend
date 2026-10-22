# Mejora integral de UX: carga, transiciones, scroll y cards

- Fecha: 2026-10-20T19:59:40-03:00
- App: general
- Autor del prompt: usuario

## Prompt

```markdown
crea una rama nueva para esta feature , y aplicame el siguiente prompt : # Tarea: Mejora integral de UX mediante estados de carga, transiciones visuales, scroll y efectos en cards — Food-Bosco

## 1. Objetivo general

Auditar e implementar mejoras de experiencia de usuario (UX) en las cuatro aplicaciones frontend de Food-Bosco, incorporando indicadores de carga, transiciones visuales, animaciones sutiles, efectos de scroll e interacciones en tarjetas (cards).

Actualmente, durante algunas operaciones que requieren tiempo de espera, la aplicación puede dar la impresión de quedar bloqueada o colgada, ya que no siempre comunica visualmente que está procesando una solicitud.

El objetivo es que el usuario comprenda en todo momento si una operación está en curso, si debe esperar, si finalizó correctamente o si ocurrió un error.

Las mejoras deben aportar una interfaz más fluida, moderna, coherente y profesional, sin afectar la funcionalidad, la accesibilidad, el rendimiento ni la arquitectura existente.

**Prioridad:** mejorar la percepción de respuesta de la aplicación, comunicar correctamente los estados de las operaciones y mantener una experiencia visual consistente entre las cuatro apps.

## 2. Uso obligatorio de skills

Antes de implementar cambios, inspeccionar las skills disponibles en el entorno del agente e identificar cuáles resultan pertinentes para esta tarea.

Buscar, según disponibilidad, skills relacionadas con:

- React y TypeScript.
- Diseño de interfaces y experiencia de usuario (UI/UX).
- Motion design y animaciones web.
- Accesibilidad y preferencias de movimiento reducido.
- Rendimiento y optimización de aplicaciones React.
- Testing de componentes e interacciones.
- Arquitectura frontend y reutilización de componentes.
- Uso de las librerías de animación disponibles o recomendadas por el proyecto.

Consultar y aplicar las instrucciones de las skills relevantes durante el diagnóstico, la selección de herramientas, la implementación y las pruebas.

No limitarse a enumerar las skills: utilizar sus recomendaciones cuando sean compatibles con la arquitectura de Food-Bosco.

En el informe final, indicar cuáles se consultaron, cómo se aplicaron y qué limitaciones existieron. No afirmar que se utilizó una skill que no se haya consultado o aplicado realmente.

## 3. Inspección de la arquitectura actual

El proyecto frontend se organiza como un monorepo con Turborepo y React + TypeScript.

Antes de modificar archivos:

1. Inspeccionar el repositorio `Food-Bosco-Frontend`.
2. Identificar las cuatro aplicaciones reales y sus respectivas tecnologías, rutas, layouts, componentes y sistemas de estilos.
3. Analizar los paquetes compartidos existentes, especialmente los relacionados con componentes, API, temas, estilos y dominio.
4. Identificar si ya existen componentes de loading, spinners, skeletons, transiciones, animaciones o sistemas de notificaciones.
5. Revisar cómo se gestionan las solicitudes asíncronas, los estados de Apollo Client, las mutaciones GraphQL, los errores y los estados de carga.
6. Detectar pantallas en las que una petición demorada produzca una sensación de bloqueo o ausencia de respuesta.
7. Revisar la estructura de las cards, las listas, los modales, los formularios, la navegación y las páginas con scroll.

No asumir que todas las aplicaciones comparten exactamente la misma estructura. Verificar qué componentes y paquetes pueden reutilizarse y cuáles requieren soluciones específicas.

El backend no debe modificarse salvo que se detecte una necesidad real y justificada para completar una interacción. Esta tarea se centra principalmente en el frontend.

## 4. Evaluación de librerías de animación

Evaluar primero las herramientas que ya están instaladas y los patrones existentes.

Considerar las siguientes alternativas:

- **Motion para React:** evaluar su conveniencia para transiciones entre estados, aparición y desaparición de componentes, animaciones de cards, interacciones y animaciones vinculadas al scroll.
- **GSAP:** considerar su incorporación únicamente si existen efectos complejos que justifiquen su potencia adicional.
- **CSS:** utilizar transiciones, keyframes y efectos nativos para spinners, skeletons, hover, focus y animaciones sencillas cuando sean suficientes.
- **Componentes existentes:** reutilizar las soluciones actuales cuando cumplan los requisitos de calidad, accesibilidad y mantenimiento.

No instalar varias librerías de animación para resolver el mismo problema sin una justificación técnica clara.

Antes de agregar una dependencia:

1. Revisar la versión de React y TypeScript del proyecto.
2. Comprobar la compatibilidad con las versiones actuales y la configuración del monorepo.
3. Evaluar el impacto en el bundle, el mantenimiento y la complejidad.
4. Definir si la dependencia debe instalarse en una aplicación concreta o en un paquete compartido.
5. Respetar el gestor de paquetes y el lockfile existentes.
6. Verificar que no se introduzcan dependencias duplicadas o incompatibles entre aplicaciones.

Documentar brevemente la elección de la solución y por qué resulta más conveniente que las alternativas consideradas.

## 5. Indicadores de carga y tiempos de espera

Auditar todas las interacciones asíncronas de las cuatro aplicaciones y mejorar las que no comuniquen adecuadamente su estado.

Incluir, cuando corresponda:

### A. Cargas iniciales y navegación

- Carga inicial de páginas.
- Obtención de datos para dashboards.
- Carga de catálogos, listas, tablas y cards.
- Navegación entre secciones que requiera obtener información.
- Recuperación de sesiones y carga de datos asociados al usuario.

### B. Operaciones de escritura

- Inicio de sesión y registro.
- Creación, edición y eliminación de entidades.
- Confirmación de pedidos y operaciones comerciales.
- Actualización de estados.
- Asignaciones y operaciones de delivery.
- Acciones administrativas.
- Formularios y cualquier mutación GraphQL relevante.

Estos son ejemplos de referencia. Auditar las operaciones realmente existentes y no implementar funcionalidades nuevas fuera del alcance.

### C. Comportamiento esperado

Cuando una operación tarde en completarse:

- Mostrar un indicador de carga inmediatamente después de iniciar la solicitud, según la interacción.
- Mantener visible el contexto de la operación.
- Evitar que el usuario interprete que la aplicación dejó de responder.
- Prevenir envíos duplicados cuando la operación no admita repeticiones.
- Deshabilitar temporalmente solo los controles que realmente no puedan utilizarse durante esa operación.
- Restaurar los controles al finalizar la solicitud, tanto en éxito como en error.
- Comunicar el resultado de forma clara.

Elegir el indicador de acuerdo con el contexto:

- **Spinner:** operaciones puntuales y breves.
- **Skeletons:** contenido que todavía no llegó, como cards, listas, perfiles o dashboards.
- **Indicadores de progreso:** operaciones cuya evolución pueda medirse realmente.
- **Botones con loading:** formularios, confirmaciones y acciones individuales.
- **Transiciones entre estados:** aparición de contenido, cambio de vistas y actualizaciones de la interfaz.

No utilizar porcentajes de progreso ficticios ni indicadores que simulen una operación que no está ocurriendo.

No agregar delays artificiales a las solicitudes para que las animaciones resulten más visibles.

## 6. Manejo de errores y estados finales

Los indicadores de carga deben integrarse con los estados reales de las solicitudes.

Para cada interacción relevante, revisar los estados:

- Inicial.
- Cargando.
- Éxito.
- Error.
- Sin resultados, cuando corresponda.

Si una solicitud falla:

- Ocultar el indicador de carga correspondiente.
- Mostrar un mensaje claro y coherente con el sistema de errores de Food-Bosco.
- Mantener los datos introducidos cuando sea razonable.
- Permitir reintentar cuando la operación sea recuperable y resulte seguro.
- Evitar mensajes duplicados, spinners infinitos o interfaces que permanezcan bloqueadas.

Si se producen errores de GraphQL, de transporte o de un microservicio, reutilizar el manejo de errores existente y mejorarlo solo cuando sea necesario.

No interpretar automáticamente un resultado vacío como un error: distinguir entre una consulta sin resultados y una solicitud fallida.

En operaciones críticas, como la compra o confirmación de un pedido, no mostrar un éxito anticipado ni permitir que una animación oculte la falta de confirmación del backend.

## 7. Transiciones visuales y animaciones

Implementar animaciones sutiles y consistentes, según corresponda, en las cuatro aplicaciones.

Evaluar:

- Aparición de contenido después de cargar datos.
- Transiciones al abrir o cerrar modales.
- Cambios de estado de componentes.
- Aparición y desaparición de menús y paneles.
- Cambios de página o sección cuando la navegación lo permita.
- Actualización de cards después de una operación.
- Feedback visual de botones y controles interactivos.

Las animaciones deben comunicar cambios reales y facilitar la comprensión de la interfaz.

Evitar:

- Transiciones excesivamente largas.
- Animaciones permanentes que distraigan.
- Escalados, rebotes o desplazamientos exagerados.
- Animaciones que bloqueen interacciones necesarias.
- Efectos que provoquen saltos de layout.
- Transiciones que oculten errores o cambios importantes de estado.

Mantener una duración coherente y razonable, generalmente breve para interacciones pequeñas. Ajustar cada animación al contexto, en lugar de aplicar una duración idéntica a todo.

## 8. Efectos visuales en cards

Auditar las cards de las cuatro aplicaciones y mejorar su comportamiento visual cuando sean interactivas o representen contenido relevante.

Evaluar, según el tipo de card:

- Elevación o sombra sutil al pasar el cursor.
- Cambios moderados de borde o fondo.
- Transiciones suaves en botones y elementos internos.
- Feedback visual al seleccionar o activar una card.
- Aparición escalonada de grupos de cards, solo si aporta valor.
- Estados de carga mediante skeletons con dimensiones similares al contenido final.
- Estados vacíos y de error coherentes con el diseño general.

Distinguir las cards interactivas de las meramente informativas.

Las cards que naveguen a otra pantalla o ejecuten una acción deben ofrecer señales claras de interactividad, estados de focus y controles accesibles.

No hacer que las cards informativas parezcan botones si no admiten interacción. Evitar que las animaciones cambien innecesariamente las dimensiones del contenido o dificulten la selección de texto.

## 9. Scroll y contenido dinámico

Evaluar el comportamiento de scroll en las cuatro aplicaciones y determinar dónde los efectos visuales pueden mejorar la experiencia.

Considerar:

- Aparición gradual de secciones o grupos de cards al entrar en pantalla.
- Animaciones activadas por visibilidad mediante mecanismos eficientes.
- Transiciones de elementos que aparecen durante la carga incremental.
- Conservación razonable de la posición de scroll al actualizar listas.
- Evitar saltos de contenido cuando los skeletons se sustituyen por datos reales.
- Mantener el acceso normal a todos los elementos, incluso cuando las animaciones estén desactivadas.

No aplicar animaciones de scroll indiscriminadamente a todas las secciones. Priorizar aquellas donde la aparición del contenido aporte claridad o continuidad visual.

No impedir el scroll natural ni introducir desplazamientos automáticos que sorprendan al usuario.

Si se utiliza una librería para animaciones vinculadas al scroll, evaluar su compatibilidad con React, su impacto en el rendimiento y la necesidad real de incorporarla.

## 10. Accesibilidad y rendimiento

Las mejoras visuales deben respetar las siguientes condiciones:

- Soportar la preferencia del sistema `prefers-reduced-motion`.
- Evitar depender exclusivamente del color o de la animación para comunicar un estado.
- Mantener navegación por teclado, foco visible y semántica accesible.
- Comunicar estados de carga y resultados mediante mecanismos apropiados, como `aria-busy` y regiones de estado accesibles cuando corresponda.
- Evitar que los lectores de pantalla anuncien repetidamente el mismo mensaje.
- Evitar bloqueos del hilo principal y animaciones costosas.
- Preferir animaciones de propiedades como `transform` y `opacity` cuando resulte adecuado.
- No introducir cambios visuales que perjudiquen la legibilidad.
- Mantener un comportamiento razonable en dispositivos y navegadores compatibles con el proyecto.

En las operaciones asíncronas, no depender únicamente de un spinner visual: el estado debe ser comprensible para usuarios con tecnologías de asistencia.

## 11. Componentes compartidos y consistencia

Evaluar si conviene crear o ampliar un conjunto de componentes reutilizables en los paquetes compartidos del monorepo.

Por ejemplo:

- `LoadingSpinner`.
- `SkeletonCard`.
- `LoadingButton`.
- `EmptyState`.
- `ErrorState`.
- Componentes o utilidades compartidas para transiciones.
- Hooks para gestionar estados de carga cuando exista una necesidad real de reutilización.

Los nombres son orientativos: adaptarlos a las convenciones existentes.

Evitar duplicar implementaciones en las cuatro aplicaciones cuando sea posible compartir una solución sin introducir dependencias innecesarias.

No convertir todo en un sistema de abstracciones complejo. Crear componentes compartidos únicamente cuando reduzcan duplicación, mejoren la consistencia o simplifiquen el mantenimiento.

Si las aplicaciones utilizan sistemas de diseño o temas diferentes, respetarlos y mantener las adaptaciones específicas necesarias.

## 12. Plan de trabajo

### Fase 1 — Auditoría

- Inspeccionar las cuatro aplicaciones y los paquetes compartidos.
- Identificar las interacciones asíncronas sin feedback adecuado.
- Detectar cards, listas y transiciones que se beneficiarían de mejoras.
- Revisar las skills relevantes y las librerías existentes.
- Entregar un inventario priorizado de problemas y oportunidades.

### Fase 2 — Diseño técnico

- Definir una estrategia visual consistente.
- Determinar qué se resuelve con CSS y qué requiere una librería.
- Proponer los componentes compartidos necesarios.
- Identificar las operaciones críticas y sus estados reales.
- Evaluar el impacto de las dependencias adicionales.
- Presentar el plan de implementación antes de realizar cambios amplios.

### Fase 3 — Implementación progresiva

- Comenzar por los estados de carga y los errores de interacción.
- Incorporar skeletons y spinners donde aporten valor.
- Mejorar las transiciones y las cards.
- Incorporar los efectos de scroll seleccionados.
- Reutilizar componentes compartidos cuando corresponda.
- Mantener la estructura y las convenciones de cada aplicación.

### Fase 4 — Verificación

- Ejecutar las pruebas existentes y agregar las necesarias.
- Verificar estados de carga, éxito, error y ausencia de resultados.
- Probar solicitudes lentas y fallidas.
- Comprobar que los botones se recuperen correctamente después de un error.
- Verificar que no se produzcan solicitudes duplicadas no deseadas.
- Revisar accesibilidad, movimiento reducido y rendimiento.
- Ejecutar los chequeos de tipos, lint y builds disponibles en Turborepo.

## 13. Criterios de aceptación

La tarea se considera completada cuando:

1. Las cuatro aplicaciones fueron auditadas.
2. Las operaciones relevantes comunican visualmente cuándo están en curso.
3. El usuario puede distinguir entre carga, éxito, error y ausencia de resultados.
4. Los formularios y botones manejan correctamente el estado de procesamiento.
5. No existen indicadores infinitos causados por errores de manejo de estado.
6. Las cards interactivas cuentan con feedback visual consistente.
7. Las animaciones de scroll se utilizan selectivamente y no interfieren con la navegación.
8. Las mejoras visuales mantienen la accesibilidad y respetan la preferencia de movimiento reducido.
9. No se incorporan dependencias innecesarias ni se duplica lógica existente.
10. Los cambios respetan Turborepo, las aplicaciones, los paquetes compartidos y la arquitectura actual.
11. Los chequeos y pruebas ejecutados se documentan con sus resultados reales.
12. No se introducen regresiones funcionales ni cambios visuales injustificados.

## 14. Restricciones

- No rediseñar completamente las cuatro aplicaciones.
- No cambiar la arquitectura del frontend ni los contratos del backend para implementar animaciones.
- No instalar Motion, GSAP u otras dependencias sin evaluar primero las necesidades y la compatibilidad.
- No aplicar efectos globales que alteren innecesariamente toda la interfaz.
- No simular progresos ni éxitos inexistentes.
- No utilizar animaciones como sustituto del manejo correcto de errores.
- No eliminar funcionalidades ni reemplazar datos reales por mocks.
- No modificar componentes compartidos sin verificar sus dependencias.
- No afirmar que una prueba fue ejecutada si no se realizó.

## Resultado esperado

Las cuatro aplicaciones de Food-Bosco deben ofrecer una experiencia más fluida y profesional, con indicadores de carga claros, transiciones visuales coherentes, cards con feedback adecuado y efectos de scroll utilizados con criterio.

El usuario nunca debería interpretar que la aplicación quedó colgada cuando está esperando una respuesta del backend. Debe poder comprender qué está sucediendo, continuar utilizando la interfaz cuando sea posible y recibir información clara si la operación falla.

La solución debe priorizar la experiencia de usuario, la accesibilidad, el rendimiento y la mantenibilidad, respetando las skills disponibles y la arquitectura actual del proyecto.
```

## Informe

- Resumen: el usuario pidió crear una rama nueva e implementar mejoras de UX en las cuatro apps.
- Objetivo: que la app comunique cargas, éxitos y errores, con transiciones, cards y scroll sutiles.
- Qué se hizo: se auditó el frontend, se consultaron skills de UI, se crearon primitivas compartidas y se aplicaron skeletons, transiciones y feedback a Store, Admin, Branch y Rider.
- Puntos clave:
  - No se instalaron librerías de animación; se usó CSS, Web Animations API e IntersectionObserver.
  - `LoadingState`, `Card`, `DataTable` y `EditPageShell` ahora respetan accesibilidad y movimiento reducido.
  - Se agregaron `Reveal` y `PageTransition` compartidos.
  - Se documentó en `docs/ux-loading-motion.md`.
- Siguiente paso: revisar los cambios y definir si se agregan transiciones también en las pantallas de autenticación.
