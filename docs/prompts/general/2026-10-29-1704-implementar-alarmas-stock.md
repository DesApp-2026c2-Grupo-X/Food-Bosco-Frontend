# Implementar alarmas de stock mínimo

- Fecha: 2026-10-29T17:04:00-03:00
- App: general
- Autor del prompt: usuario

## Prompt

> okey, implementá el plan con ese arreglo en el seed y tambien con las mejoras y sugerencias que me propusiste.
>
> respuestas a las preguntas del final del plan:
>
> 1. si, prefiero quantity <= minQuantity
> 2. Prefiero que venga vacio
> 3. si. incluilo

## Informe

- Resumen: el usuario aprobó la implementación del plan de alarmas de stock mínimo junto con todas las mejoras sugeridas.
- Objetivo: permitir definir y editar la cantidad mínima de cada ingrediente y mostrar alertas accionables en los inicios y listados de stock de sucursal y administración general.
- Qué se hizo: se actualizaron los modelos y esquemas de dominio, fragments y mappers GraphQL, vistas de ingredientes y stock, y se creó el componente compartido de alertas de stock para ambos dashboards.
- Puntos clave:
  - Se sumó el campo obligatorio `Cantidad mínima` en el modal de alta (iniciando vacío) y edición (precargado) de ingredientes, y la columna `Stock mín.` en el listado de ingredientes.
  - Se definió la regla de alerta para ingredientes activos con `minQuantity > 0` y `quantity <= minQuantity`, distinguiendo entre `Sin stock` (`0`) y `Stock bajo`.
  - Se creó `LowStockAlertsSection` y se integró en el inicio de Branch Admin y Super Admin con botón de ajuste rápido in-situ (`AdjustStockModal`).
  - Se agregaron badges de estado, columna de mínimo, chips de filtro por estado en `StockListView` y notificación de advertencia si un ajuste manual deja el stock en alerta.
- Siguiente paso: validar visualmente las alertas con los datos del seed actualizado.
