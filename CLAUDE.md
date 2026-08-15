# API — Plataforma de pedidos

Backend NestJS de la plataforma de pedidos. **Arquitectura multicapa**: cada capa es una carpeta global dentro de `src/`, con los archivos de los distintos dominios dentro de cada capa.

## Skills disponibles

Las reglas y patrones obligatorios de este proyecto viven en skills. **Toda tarea de API debe aplicar la skill correspondiente antes de escribir o revisar código.**

| Skill                                              | Cuándo usarla                                                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/orchestrator-layered-architecture` | Cualquier caso de uso: estructura de capas, cuándo usar orchestrator, regla de servicios primarios aislados.                          |
| `.claude/skills/domain-patterns`                   | Confirmación de pedidos, asignación de sucursal, estados de pedido, ETA, snapshot de detalle, promociones/stock como datos generales. |
| `.claude/skills/high-quality-tests`                | Cualquier test nuevo o modificación de lógica: tests parametrizados, casos límite, matriz de transiciones, aislamiento.               |
| `.claude/skills/modern-code-quality`               | Todo archivo fuente: ES6+, funciones flecha, código moderno, orientación a objetos.                                                   |

## Estructura por capas

```text
api/
├── src/
│   ├── config/       # constantes, guards, decorators, interfaces globales
│   ├── controller/   # controllers por dominio (auth.controller.ts, order.controller.ts, ...)
│   ├── dto/          # DTOs por dominio
│   ├── exception/    # excepciones de dominio
│   ├── service/      # servicios primarios + orchestrators por dominio
│   ├── model/        # modelos/entidades del dominio (interfaces del DER)
│   ├── repository/   # repositorios por dominio (uno por tabla del DER)
│   └── module/       # módulos @Module de NestJS por dominio (auth.module.ts, ...)
├── test/
└── .claude/
    ├── CLAUDE.md
    ├── AGENTS.md
    └── skills/
```

## Regla de oro

> **Un servicio primario nunca llama a otro servicio primario. La coordinación pertenece al orchestrator.**

Flujo dentro de cada capa: `controller/` → `service/` (orchestrator o servicio primario) → `repository/` → base de datos.

## Stack

- NestJS 11, TypeScript.
- La API corre en `PORT` (por defecto `3000`).
- Scripts: `npm run start:dev`, `npm run lint`, `npm run test`, `npm run test:e2e`.

## Pull Requests

Al abrir un PR a `develop`, usar la plantilla `.github/PULL_REQUEST_TEMPLATE.md`:

## Qué hace este PR

<!-- Resumen breve de los cambios y por qué se hacen. -->

## Tipo de cambio

- [ ] Feature nueva
- [ ] Bug fix
- [ ] Refactor
- [ ] Docs
- [ ] Config / tooling
- [ ] Otra

## Checklist

- [ ] `npm run lint` pasa en api y client (se corre solo en commit/push)
- [ ] `npm run build` compila api y client
- [ ] Agregué/actualicé tests cuando corresponde
- [ ] Seguí las skills de `api/.claude/skills/` (arquitectura, tests, calidad)
- [ ] Actualicé la documentación si cambió algo relevante

## Cómo probar

<!-- Pasos para probar el cambio (levantar api, client, endpoints, etc.). -->

## Screenshots / evidencia

<!-- Si aplica. -->

## Links

<!-- Issue(s) relacionadas, docs, etc. -->
