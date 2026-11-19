# CTA de promociones hacia la categoría afectada

- Fecha: 2026-11-19T04:38:00-03:00
- App: store
- Autor del prompt: usuario

## Prompt

> En la sección 'promociones para vos' quiero que el 'Ver en el menú' te redirija a la categoría de los productos afectados por esa promoción. Actualmente te lleva al menú solamente.

## Informe

- Resumen: el usuario pidió que el botón de cada promoción abra el catálogo filtrado por la categoría afectada.
- Objetivo: que la promoción lleve directo a los productos que aplican.
- Qué se hizo: se agregó una función de dominio para resolver la categoría y se usó en el CTA de la home.
- Puntos clave:
  - Si la promoción es por categoría, usa su `categoryIds`.
  - Si es por producto, busca la categoría del producto afectado.
  - Si no hay categoría (por ejemplo, promoción de pedido), mantiene el catálogo general.
  - Se agregaron pruebas de dominio y de la home.
- Siguiente paso: reiniciar la Tienda para ver el cambio.
