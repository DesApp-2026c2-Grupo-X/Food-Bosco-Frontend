# Revisión de spinners y carga de imágenes

- Fecha: 2026-10-20T20:41:56-03:00
- App: general
- Autor del prompt: usuario

## Prompt

> consulta , los spinners de carga donde los agregaste? chequeando la app del local , el rider y el admin no veo ningun cambio al respecto , las cardas de productos cuando tardan en cargar la imagen se ve rustico y lo mismo en el admin , los productos , stock , ingredientes , pedidos , no hacen una transicion de carga , se queda colgado , o da esa imprecion en los segundos/ ms de carga

## Informe

- Resumen: el usuario no veía los cambios de carga en local, rider y admin, y notó imágenes de producto sin transición.
- Objetivo: entender dónde se aplicaron los indicadores y corregir la sensación de bloqueo.
- Qué se hizo: se verificaron los hooks y listas, se agregó un aviso visible "Cargando datos…" en tablas y un componente de imagen con skeleton y fade-in.
- Puntos clave:
  - La mayoría de los indicadores son skeletons, no spinners.
  - Las tablas de admin, stock, ingredientes y pedidos ahora muestran texto y spinner además de skeletons.
  - Las cards de producto y las miniaturas del admin ya no muestran un hueco rústico.
  - Los cambios nuevos están locales, sin commit ni push todavía.
- Siguiente paso: confirmar si se commitean y pushean en la rama `feature/ux-loading-motion`.
