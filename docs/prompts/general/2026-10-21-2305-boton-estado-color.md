# Color del botón de estado conectado (StatusToggleButton)

- Fecha: 2026-10-21T23:05:00-03:00
- App: general
- Autor del prompt: usuario

## Prompt

> commitea, pushea y genera pr a develop

## Informe

- Resumen: el usuario pidió guardar los cambios del botón de estado, subirlos y abrir un PR a develop.
- Objetivo: publicar el arreglo del color del botón "Conectado"/"Abierto" para que se revise e integre.
- Qué se hizo: se revisaron los cambios, se armó el commit, se subió la rama y se abrió el PR a develop.
- Puntos clave:
  - El botón usaba el nombre de una paleta como si fuera un color, por eso no se pintaba.
  - Ahora recibe un color real (naranja de marca o verde de éxito).
  - Se agregó un test que comprueba el color del estado activo.
  - Afecta a Sucursal y Repartidor, que usan el mismo botón.
- Siguiente paso: revisar el PR y aprobarlo.
