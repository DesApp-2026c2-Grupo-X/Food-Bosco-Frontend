# Documentación — Food Bosco (Frontend)

Índice de la documentación del monorepo. Cada documento tiene un **estado** para saber de un
vistazo qué es fuente de verdad, qué está vigente y qué es histórico.

## Estados

| Estado        | Significado                                                               |
| ------------- | ------------------------------------------------------------------------- |
| **OFICIAL**   | Fuente de verdad. Ante conflicto, gana sobre cualquier otro doc o skill.  |
| **VIGENTE**   | Documento activo de trabajo (planes vigentes, QA en curso).               |
| **HISTÓRICO** | Ya implementado o superado. Se conserva como referencia; no es la verdad. |

Regla general: **el código es la fuente de verdad final**. Si un doc contradice al código, gana el código.

---

## OFICIAL — Fuentes de verdad

| Documento                                                                                               | Qué define                                                              | Versión / fecha        |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------- |
| [especificaciones/requerimientos-frontend.md](especificaciones/requerimientos-frontend.md)              | Alcance funcional de las 4 apps (auth, tienda, admin, sucursal, rider). | v1.4 · rev. 2026-10-06 |
| [especificaciones/requerimientos-backend-rest.md](especificaciones/requerimientos-backend-rest.md)      | Contrato del backend (GraphQL Gateway + servicios REST).                | v3.2 (canónica)        |
| [especificaciones/ui-manifesto.md](especificaciones/ui-manifesto.md)                                    | Sistema visual y de producto (dirección "Calor", tokens, patrones).     | rev. 2026-10-07        |
| [../CLAUDE.md](../CLAUDE.md)                                                                            | Reglas del monorepo, stack, estructura y convenciones.                  | 2026-10-07             |
| [../README.md](../README.md)                                                                            | Entrada del repo, comandos, Android/iOS.                                | —                      |
| [../apps/store/STATUS.md](../apps/store/STATUS.md) · [../apps/admin/STATUS.md](../apps/admin/STATUS.md) | Estado real por app (revisado contra código).                           | 2026-10-06             |

> Las apps `branch` y `rider` no tienen `STATUS.md` propio; su estado se deriva de sus planes
> ([planes/](planes/)) y del código.

## VIGENTE

| Documento                                                                                                  | Qué define                                                            | Fecha      |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------- |
| [arquitectura/fundamentacion-gateway-graphql-rest.md](arquitectura/fundamentacion-gateway-graphql-rest.md) | Fundamentación de la arquitectura (por qué Gateway GraphQL + REST).   | 2026-08-25 |
| [qa/BUGS.md](qa/BUGS.md)                                                                                   | Bugs reportados con evidencia y reproduce steps. **BUG-001 abierto.** | 2026-10-06 |
| [qa/TEST_PLAN.md](qa/TEST_PLAN.md)                                                                         | Plan de pruebas funcionales end-to-end.                               | 2026-10-06 |
| [qa/TEST_REPORT.md](qa/TEST_REPORT.md)                                                                     | Reporte de la corrida de pruebas.                                     | 2026-10-06 |
| [qa/auditoria-tests-funcionales.md](qa/auditoria-tests-funcionales.md)                                     | Auditoría de la suite Vitest y problemas detectados.                  | 2026-10-06 |
| [FRONTEND_DEMO_GUIDE.md](FRONTEND_DEMO_GUIDE.md)                                                           | Guía técnica de defensa/demo (reconstruida leyendo el código).        | 2026-09-19 |

## HISTÓRICO — Planes e implementaciones ya hechas

| Documento                                                                    | Qué define                                                                                       | Estado                  |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------- |
| [planes/plan-branch.md](planes/plan-branch.md)                               | Plan de la app Sucursal (`apps/branch`).                                                         | IMPLEMENTADO            |
| [planes/plan-admin.md](planes/plan-admin.md)                                 | Plan del Admin global (`apps/admin`). Promociones y Estados de pedido quedaron fuera de alcance. | IMPLEMENTADO (parcial)  |
| [planes/plan-rider.md](planes/plan-rider.md)                                 | Plan de la app Repartidor (`apps/rider`).                                                        | IMPLEMENTADO            |
| [historico/plan-auth-store-android.md](historico/plan-auth-store-android.md) | Auth unificado para el APK Android del store.                                                    | IMPLEMENTADO / superado |

## HISTÓRICO — Sesiones y material obsoleto

| Documento                                                                                                        | Qué define                                                   | Fecha / estado |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------- |
| [historico/resumen-conexion-admin-global.md](historico/resumen-conexion-admin-global.md)                         | Resumen de la sesión que conectó el Admin global al Gateway. | 2026-09-03     |
| [historico/archive/requerimientos-backend-federation.md](historico/archive/requerimientos-backend-federation.md) | Variante descartada: Apollo Federation.                      | OBSOLETO       |
| [historico/archive/requerimientos-backend-grpc.md](historico/archive/requerimientos-backend-grpc.md)             | Variante descartada: Gateway + gRPC.                         | OBSOLETO       |

---

## Estructura de carpetas

```text
docs/
├── README.md                 # este índice
├── especificaciones/         # OFICIAL: requerimientos funcionales + UI manifesto
├── arquitectura/             # VIGENTE: fundamentación de la arquitectura
├── planes/                   # HISTÓRICO: planes de app (todos implementados)
├── qa/                       # VIGENTE: bugs, test plan, reporte y auditoría (+ evidence/)
├── historico/                # HISTÓRICO: sesiones y material superado
│   └── archive/              # variantes de backend descartadas
└── FRONTEND_DEMO_GUIDE.md    # VIGENTE: guía de defensa/demo
```

## QA — Bugs conocidos

Resumen por severidad en [qa/BUGS.md](qa/BUGS.md) (Critical 0 · High 1 · Medium 2 · Low 3).
El único **High** abierto es **BUG-001**: el switch online/offline del rider muestra "Conectado"
mientras el backend lo tiene offline (no se sincroniza el estado al cargar).
