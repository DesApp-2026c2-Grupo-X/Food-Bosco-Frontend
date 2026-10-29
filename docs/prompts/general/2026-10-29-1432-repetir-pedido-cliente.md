# Repetir pedido para el cliente

- Fecha: 2026-10-29T14:32:48-03:00
- App: general
- Autor del prompt: usuario

## Prompt

> Trabajá sobre la funcionalidad “Repetir pedido” para el cliente de la aplicación de comida. Antes de implementar, leé los requerimientos funcionales de la carpeta docs y respetalos.
> Permití que el cliente pueda seleccionar un pedido anterior y volver a realizarlo, validando la disponibilidad de los productos, sus precios actuales y cualquier otra condición necesaria antes de confirmar el nuevo pedido.
> Finalmente, documentá el análisis, los cambios realizados, las decisiones técnicas y las tareas pendientes en un archivo Markdown llamado planRepetirPedido.md en el escritorio de mi computadora. 
> https://github.com/DesApp-2026c2-Grupo-X/Food-Bosco-API/pull/38 tene en cuenta esto tambien

## Informe

- Resumen: el usuario pidió implementar la interfaz de "Repetir pedido" para el cliente y documentar todo el trabajo.
- Objetivo: rearmar un pedido anterior con productos y precios vigentes, avisando qué no se pudo agregar.
- Qué se hizo: se sumó la mutación, el hook, el modal de confirmación y los accesos desde historial y detalle.
- Puntos clave:
  - El backend valida productos, opciones, precios y stock al confirmar el pedido.
  - El cliente ve los productos omitidos y los cambios de precio antes de ir al carrito.
  - Si el carrito actual tiene ítems, se avisa que será reemplazado.
  - Se agregaron pruebas y se actualizó la documentación de estado.
  - Se tuvo en cuenta el PR #38 de la API.
- Siguiente paso: validar manualmente el flujo contra el backend con el PR #38 desplegado.
