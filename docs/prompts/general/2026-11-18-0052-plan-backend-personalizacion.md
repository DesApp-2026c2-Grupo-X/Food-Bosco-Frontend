# Plan de backend para personalización de la home

- Fecha: 2026-11-18T00:52:00-03:00
- App: general
- Autor del prompt: usuario

## Prompt

> Deberia usar el mismo plan para el backend? En el caso que no: dame un plan para el backend

## Informe

- Resumen: el usuario preguntó si el plan de personalización de la home sirve también para el backend y pidió uno propio si la respuesta era no.
- Objetivo: definir cómo llevar la personalización al backend sin romper la arquitectura del proyecto.
- Qué se hizo: se revisaron los requisitos de Gateway, Auth, Commerce y Delivery; se creó un plan backend separado.
- Puntos clave:
  - El plan de frontend no se reutiliza tal cual: resuelve el cálculo en el navegador.
  - La lógica de recomendaciones iría en un módulo nuevo del Commerce Service.
  - El Gateway sólo valida, orquesta y traduce; no calcula recomendaciones.
  - Se propone una query `homeFeed` y un endpoint REST `/v1/personalization/home-feed`.
  - Se definen ranking, diversidad, usuario nuevo, privacidad, índices, etapas y pruebas.
  - No se crea un microservicio nuevo ni se usa ML en la primera versión.
- Siguiente paso: confirmar el contrato real de promociones y decidir si la home personalizada requiere sesión.
