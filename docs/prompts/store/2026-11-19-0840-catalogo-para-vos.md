# Categoría “Para vos” en el catálogo

- Fecha: 2026-11-19T08:40:00-03:00
- App: store
- Autor del prompt: usuario

## Prompt

> En la solapa 'para vos', el botón 'ver todo el catálogo' que te lleve a una sección del catálogo que sea lo recomendado para vos. Así como existen las categorias acompañamientos, bebidas, hamburguesas, etc. que exista una categoria que sea para vos y te ordene el catálogo según tus consumos de la misma manera que lo hace la homepage-

## Informe

- Resumen: el usuario pidió una categoría “Para vos” dentro del catálogo.
- Objetivo: ordenar todo el catálogo según el historial de consumo del cliente.
- Qué se hizo: se agregó el chip “Para vos” en el catálogo y el CTA de la home apunta a esa sección.
- Puntos clave:
  - La categoría usa el mismo perfil de gustos y ranking que la home.
  - Muestra los hints de recomendación en cada producto.
  - Funciona con búsqueda y con usuarios sin historial.
  - El chip también aparece en el carrusel de categorías de la home para usuarios con historial.
  - Se agregó la opción `skip` a `useOrders` para no consultar pedidos sin sesión.
- Siguiente paso: recargar la Tienda y probar “Ver todo el catálogo” desde “Para vos”.
