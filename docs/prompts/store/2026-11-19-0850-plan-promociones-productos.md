# Plan de descuentos en productos y página de promociones

- Fecha: 2026-11-19T08:50:00-03:00
- App: store
- Autor del prompt: usuario

## Prompt

> Creá un plan que haga lo siguiente: Que los descuentos sobre los productos o promociones se vean en los cuadros de los productos. Además crea una pagina que sea de las promociones. Que esté en el header y la navegacion.

## Informe

- Resumen: el usuario pidió un plan para mostrar descuentos en las tarjetas y crear una página de promociones.
- Objetivo: definir alcance, contrato y etapas antes de implementar.
- Qué se hizo: se creó el plan con propuesta de backend, frontend, navegación y pruebas.
- Puntos clave:
  - El backend calcula el preview; el frontend no inventa precios finales.
  - Se proponen badges y precio anterior/final según el tipo de promoción.
  - La página `/promotions` tendrá cupones y productos en promoción.
  - Se agrega “Promociones” al header y “Promos” a la navegación mobile.
  - Quedan decisiones abiertas sobre mobile nav y promociones de monto fijo.
- Siguiente paso: aprobar el contrato y arrancar por la Etapa 1 de backend.
