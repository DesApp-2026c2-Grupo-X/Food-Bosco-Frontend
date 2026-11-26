# Granularidad temporal dinámica en gráficos

- Fecha: 2026-11-24T21:27:07-03:00
- App: general
- Autor del prompt: usuario

## Prompt

> Revisá todos los gráficos temporales de las aplicaciones frontend, especialmente los gráficos de líneas y de barras.
>
> Actualmente, la agrupación de datos por períodos no se adapta correctamente al rango de fechas seleccionado. Por ejemplo, al consultar las ventas de una semana, los datos se agrupan por semana y el gráfico termina mostrando un único punto, perdiendo completamente su utilidad.
>
> El objetivo es implementar una granularidad temporal dinámica que se adapte al período seleccionado. Por ejemplo:
>
> Últimos 7 días o una semana: agrupación por días.
> Últimos 30 días o un mes: agrupación por días o semanas.
> Períodos más extensos: agrupación por semanas o meses, según corresponda.
>
> Investigá la implementación actual y determiná la granularidad más adecuada para cada rango de fechas, buscando un equilibrio entre legibilidad y nivel de detalle. Evitá que los gráficos colapsen toda la información del período seleccionado en un único punto o barra.
>
> Aplicá una solución consistente, reutilizable y escalable en todos los gráficos temporales, incluyendo los ajustes de backend que sean necesarios. Contemplá también los períodos sin actividad para representar correctamente la evolución temporal.
>
> No introduzcas modificaciones visuales ni funcionales ajenas a este problema. [Image 1]
>
> Attached file: C:\Users\bosco\Downloads\WhatsApp Image 2026-11-24 at 21.01.53.jpeg

## Informe

- Resumen: el usuario pidió que los gráficos temporales agrupen los datos según el rango elegido y no muestren un solo punto en una semana.
- Objetivo: que la evolución de ventas, compras y clientes sea legible y completa en cualquier período.
- Qué se hizo: se reemplazó la agrupación fija por una regla según la cantidad de días del rango.
- Puntos clave:
  - Hasta 31 días se agrupa por día; hasta 180 días, por semana; más, por mes.
  - La regla se aplica a reportes de ventas, actividad del cliente y compradores.
  - El backend ahora devuelve los períodos sin actividad con valores en cero.
  - Se agregaron y actualizaron tests en frontend y backend.
- Siguiente paso: revisar y desplegar la rama `fix/report-temporal-granularity` del repositorio `Food-Bosco-API`.
