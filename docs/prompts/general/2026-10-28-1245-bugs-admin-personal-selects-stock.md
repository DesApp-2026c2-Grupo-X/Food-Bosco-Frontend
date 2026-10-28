# Correcciones de Personal, menús de selección y ajuste de stock

- Fecha: 2026-10-28T12:45:00-03:00
- App: general
- Autor del prompt: usuario

## Prompt

> app Admin global:
>
> - no funciona el boton para habilitar/deshabilitar colaboradores desde la seccion Personal.
> - No hay opcion para eliminar colaboradores de sucursales.
> - No funciona la funcion para reasignar a otra sucursal a un colaborador dentro de la pestaña editar
> - Dentro de la pestaña personal no aparecen en la lista todos los colaboradores que fueron creados durante el seed. solo aparecen los que son creados manualmente.
>
> General:
>
> - Los menus de seleccion vienen preseleccionados con la opcion Todas/Todos. Una vez que cambiamos la opcion, no se puede volver a seleccionar Todas/Todos. Revisar todos los menus de seleccion.
> - A la hora de ajustar Stock, el campo permite ingresar numeros negativos con el signo "-". Para los numeros positivos hay que ingresar el numero sin signo, pero deberia Tambien permitir ingresar el signo "+", ya que actualmente si ingresamos por ejemplo +25, no reconoce el numero. [Image 1] [Image 2] [Image 3] [Image 4] [Image 5] quiero que respetes las skills de documentacion de cada repo. analizá los dos repos por completo antes de comenzar. Si tenes alguna pregunta hacela.

## Informe

- Resumen: el usuario reportó fallas en Personal del Admin global y en los menús de selección y el ajuste de stock.
- Objetivo: dejar operativos el alta, la edición, la baja y el listado de colaboradores, y corregir los filtros y el campo numérico de stock.
- Qué se hizo: se analizaron los dos repos, se identificaron las causas y se corrigieron frontend, backend y pruebas.
- Puntos clave:
  - El toggle y la reasignación fallaban por un tipo GraphQL incompatible (`ID` contra `String`); se unificó en `ID`.
  - Se agregó un botón Eliminar para colaboradores de sucursal, con baja lógica y confirmación.
  - La lista de Personal ahora pide solo roles de staff, por lo que aparecen los colaboradores del seed.
  - El placeholder de todos los selects quedó seleccionable, así se puede volver a "Todas/Todos".
  - El ajuste de stock acepta el signo `+` además de `-`.
- Siguiente paso: ninguno.
