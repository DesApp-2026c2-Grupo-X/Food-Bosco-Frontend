# Personalización de la página principal

- Fecha: 2026-11-18T00:46:00-03:00
- App: store
- Autor del prompt: usuario

## Prompt

> # Misión: Evolucionar la personalización de la página principal
>
> Quiero que trabajes sobre la página principal de nuestra tienda de comida online para mejorar e incorporar funcionalidades de personalización centradas en el usuario, tomando como referencia aplicaciones como Rappi, PedidosYa y Uber Eats.
>
> El objetivo es evolucionar la experiencia actual para que cada usuario encuentre contenido relevante según sus preferencias, hábitos de consumo, historial de pedidos e interacciones con la aplicación.
>
> ## 1. Análisis previo
>
> Antes de comenzar:
>
> - Leé detenidamente los requerimientos funcionales existentes en la carpeta `docs`.
> - Analizá la implementación actual de la página principal.
> - Comprendé su estructura, diseño, componentes, funcionalidades y comportamiento.
> - Identificá los servicios, modelos y fuentes de datos disponibles.
> - Analizá cómo se obtiene la información del usuario y qué datos pueden utilizarse para personalizar su experiencia.
> - Identificá las oportunidades de mejora y los aspectos que deben conservarse.
>
> No propongas una solución aislada: trabajá sobre el producto que ya existe.
>
> ## 2. Criterio fundamental: evolucionar sin perder la identidad del producto
>
> Tenés libertad para modificar, mejorar, reorganizar y agregar elementos de la página principal cuando esto aporte valor a la experiencia de personalización.
>
> Sin embargo, hay una condición fundamental:
>
> **No refactorices ni reconstruyas toda la página principal desde cero. Evolucioná la implementación existente respetando la esencia, identidad visual, estructura conceptual y funcionalidades del producto.**
>
> Esto significa que:
>
> - Conservá los elementos que ya funcionan correctamente y forman parte de la experiencia actual.
> - Podés modificar componentes existentes para adaptarlos a nuevas necesidades.
> - Podés reorganizar secciones cuando exista una justificación funcional relacionada con la personalización.
> - Podés incorporar nuevas secciones, componentes e interacciones.
> - Podés mejorar la presentación y jerarquía del contenido para darle mayor relevancia a la información personalizada.
> - Podés ajustar estilos, layouts y comportamientos cuando sea necesario.
> - Evitá reemplazar grandes partes de la implementación sin una justificación concreta.
> - No introduzcas cambios visuales o funcionales que alteren innecesariamente la identidad del producto.
> - Evitá refactorizaciones generales que no estén relacionadas con el objetivo de esta misión.
>
> La prioridad es aprovechar lo desarrollado y mejorarlo, no descartarlo para construir una solución completamente diferente.
>
> ## 3. Objetivo de la personalización
>
> La página principal debe adaptarse progresivamente a cada usuario, utilizando la información disponible en el sistema.
>
> Considerá las siguientes fuentes de información:
>
> - Historial de pedidos.
> - Restaurantes y comercios favoritos.
> - Productos comprados frecuentemente.
> - Categorías de comida preferidas.
> - Horarios habituales de compra.
> - Ubicación y dirección de entrega seleccionada.
> - Búsquedas realizadas.
> - Interacciones con restaurantes y productos.
> - Preferencias explícitas.
> - Comportamiento de navegación.
>
> La experiencia debe evolucionar con el uso de la aplicación, aprendiendo de las elecciones del usuario.
>
> También debe contemplar usuarios nuevos que todavía no tienen historial ni preferencias registradas.
>
> ## 4. Funcionalidades y experiencias a evaluar
>
> Analizá cómo incorporar o mejorar experiencias como:
>
> - **Para vos:** recomendaciones personalizadas de restaurantes y comercios.
> - **Volvé a pedir:** acceso rápido a pedidos anteriores.
> - **Tus favoritos:** restaurantes y productos preferidos.
> - **Lo que más te gusta:** categorías relacionadas con los intereses del usuario.
> - **Recomendados según tus pedidos:** sugerencias basadas en compras anteriores.
> - **Cerca de vos:** comercios relevantes según la ubicación de entrega.
> - **Promociones para vos:** ofertas relacionadas con sus preferencias.
> - **Descubrí algo nuevo:** recomendaciones que permitan explorar nuevas opciones.
> - **Personalización contextual:** adaptar el contenido según el horario, ubicación y contexto de compra.
>
> Estas son ideas iniciales, no una lista cerrada. Evaluá cuáles tienen sentido para el producto actual y proponé otras oportunidades de personalización.
>
> No fuerces la incorporación de secciones si no aportan valor o si ya existe una funcionalidad equivalente.
>
> ## 5. Estrategia de personalización
>
> Diseñá un mecanismo que permita determinar qué contenido mostrar, cómo organizarlo y qué prioridad darle.
>
> Considerá:
>
> - Preferencias e intereses.
> - Frecuencia y recencia de compra.
> - Historial de pedidos.
> - Disponibilidad de productos y comercios.
> - Ubicación y tiempos de entrega.
> - Promociones vigentes.
> - Diversidad de recomendaciones.
> - Interacciones recientes.
>
> Evitá que la personalización se limite a mostrar repetidamente los mismos productos o restaurantes.
>
> Buscá un equilibrio entre ofrecer contenido conocido y permitir descubrir nuevas opciones.
>
> Evaluá primero una solución sencilla, escalable y mantenible. La incorporación de inteligencia artificial o machine learning debe estar justificada por un beneficio real.
>
> ## 6. Arquitectura y servicios
>
> El proyecto utiliza una arquitectura basada en Gateway y microservicios.
>
> Respetá estrictamente esta arquitectura:
>
> - Analizá qué servicios existentes pueden proporcionar los datos necesarios.
> - Reutilizá APIs, modelos y funcionalidades disponibles.
> - Modificá los servicios existentes cuando sea necesario.
> - Incorporá nuevos endpoints o responsabilidades únicamente cuando corresponda.
> - Evitá duplicar lógica entre servicios.
> - Mantené las responsabilidades correctamente distribuidas.
> - Respetá los mecanismos actuales de comunicación entre frontend, Gateway y microservicios.
>
> No realices cambios arquitectónicos generales que no sean necesarios para esta misión.
>
> ## 7. Plan de trabajo obligatorio
>
> Antes de implementar, generá un plan detallado en:
>
> `planPersonalizacionHome.md`
>
> El documento debe incluir:
>
> 1. Diagnóstico de la página principal actual.
> 2. Identificación de funcionalidades y componentes existentes.
> 3. Aspectos de la experiencia actual que deben conservarse.
> 4. Oportunidades de mejora y personalización.
> 5. Funcionalidades nuevas que se propone incorporar.
> 6. Modificaciones necesarias sobre funcionalidades existentes.
> 7. Datos necesarios y disponibilidad actual.
> 8. Servicios que se reutilizarán o modificarán.
> 9. Cambios necesarios en frontend, Gateway y microservicios.
> 10. Etapas de implementación y dependencias.
> 11. Pruebas y criterios de aceptación.
> 12. Riesgos técnicos y mejoras futuras.
>
> Organizá el trabajo por etapas, priorizando las mejoras que generen mayor valor para el usuario.
>
> No limites el plan a agregar componentes: también podés proponer modificaciones sobre elementos existentes cuando contribuyan a una mejor experiencia personalizada.
>
> ## 8. Implementación y validación
>
> Una vez definido el plan:
>
> - Implementá las mejoras y funcionalidades propuestas.
> - Integralas naturalmente con la experiencia existente.
> - Modificá los componentes actuales cuando sea necesario.
> - Conservá los comportamientos que siguen siendo válidos.
> - Verificá la compatibilidad con el resto del sistema.
> - Evitá regresiones en funcionalidades existentes.
> - Garantizá que la información personalizada corresponda al usuario correcto.
> - Respetá la disponibilidad real de productos y comercios.
> - Considerá rendimiento, seguridad y privacidad.
>
> No sacrifiques la estabilidad del producto por incorporar personalización.
>
> ## 9. Documentación final
>
> Actualizá `planPersonalizacionHome.md` con:
>
> - Análisis realizado.
> - Plan de trabajo definido.
> - Mejoras y funcionalidades implementadas.
> - Componentes nuevos y componentes modificados.
> - Servicios y endpoints involucrados.
> - Decisiones técnicas adoptadas.
> - Cambios realizados en la experiencia existente y su justificación.
> - Pruebas realizadas y resultados.
> - Funcionalidades pendientes.
> - Mejoras futuras recomendadas.
>
> ## Resultado esperado
>
> Una página principal más inteligente y personalizada, capaz de adaptarse a cada usuario y mejorar su experiencia de compra.
>
> El resultado debe sentirse como una evolución natural del producto actual, no como una aplicación diferente.
>
> **Criterio rector: tenés libertad para mejorar y modificar lo existente, siempre que los cambios estén justificados por el objetivo de personalización, respeten la arquitectura del proyecto y mantengan la esencia del producto. No conviertas esta misión en una refactorización integral de la página principal.** Analizá ese plan, adaptalo a este proyecto y mostrame el resultado

## Informe

- Resumen: se pidió personalizar la página principal de la tienda usando el historial, los gustos y la ubicación del usuario.
- Objetivo: que cada persona encuentre antes lo que le interesa, sin cambiar la identidad del producto.
- Qué se hizo: se analizó la home, se documentó un plan y se implementaron recomendaciones, reordenamiento, descubrimiento, promociones y contexto local.
- Puntos clave:
  - Se reutilizaron los datos y pantallas que ya existían; no se hizo una reconstrucción total.
  - “Volvé a pedir” usa el mismo flujo de repetición que ya tenía la tienda.
  - “Para vos” mezcla productos conocidos con opciones nuevas y evita repetir demasiado una categoría.
  - La dirección y el horario adaptan el saludo, el banner y la sucursal mostrada.
  - Los productos vistos se guardan por usuario para no mezclar cuentas.
  - No se agregaron endpoints nuevos ni inteligencia artificial.
- Pruebas: la suite completa pasó con 265 archivos y 1480 tests; también pasaron el chequeo de tipos, el lint y el build.
- Siguiente paso: revisar la home en el navegador y, si hace falta, ajustar textos o pesos del ranking.
