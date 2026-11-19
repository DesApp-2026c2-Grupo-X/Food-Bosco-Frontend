# Diagnóstico de catálogo ausente en la home

- Fecha: 2026-11-19T08:20:00-03:00
- App: store
- Autor del prompt: usuario

## Prompt

> Puede ser que no me cargue el catálogo en la homepage?

## Informe

- Resumen: el usuario preguntó por qué no aparece el catálogo en la home.
- Objetivo: identificar si es un problema de datos, de la API o de la dirección.
- Qué se hizo: se probaron las direcciones de Thomas contra el gateway y se revisó la condición que muestra el catálogo.
- Puntos clave:
  - Con la dirección Casa (Hurlingham) hay 2 sucursales y 21 productos.
  - Con la dirección Trabajo (CABA) hay 0 sucursales y 0 productos.
  - La home oculta el catálogo cuando no hay sucursal disponible.
  - No es un problema del feed personalizado ni de Commerce.
- Siguiente paso: seleccionar la dirección Casa para ver el catálogo; opcionalmente mostrar un aviso cuando la dirección esté fuera de zona.
