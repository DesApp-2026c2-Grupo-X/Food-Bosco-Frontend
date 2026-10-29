# Commit, push y PR de alarmas de stock

- Fecha: 2026-10-29T17:18:00-03:00
- App: general
- Autor del prompt: usuario

## Prompt

> si hago npm run seed se deberia actualizar el stock minimo de los productos actuales?
> listo. commitea, pushea y genera un pr apuntado a develop en ambos repos

## Informe

- Resumen: el usuario consultó sobre la actualización del stock mínimo con `npm run seed` y pidió commitear, pushear y crear los PRs hacia `develop` en ambos repositorios.
- Objetivo: publicar en la rama remota `feature/alarmas-stock` todos los cambios del frontend y abrir el Pull Request hacia `develop`.
- Qué se hizo: se realizó el commit de los cambios en `@repo/domain`, `@repo/api`, `@repo/components`, `apps/admin`, `apps/branch`, tests y documentación, se subió la rama y se generó el PR hacia `develop`.
- Puntos clave:
  - Se incluyen el alta/edición de `minQuantity`, las alertas en los dashboards de Branch Admin y Super Admin con ajuste rápido, los filtros y badges en la vista de stock y el aviso al ajustar por debajo del mínimo.
- Siguiente paso: revisar y fusionar el PR en `develop`.
