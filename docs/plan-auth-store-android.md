# Plan — Auth unificado para la app Android del store (un APK, separación por paquete)

> **Estado:** ✅ implementado (agosto 2026).
> **Objetivo:** que el store (Capacitor/Android) tenga pantallas de auth **dentro del mismo APK**, sin depender de `localhost`, y **sin duplicar** el código de auth entre apps.
> **Relacionado:** `apps/store/STATUS.md`, `packages/auth/`, `packages/components/src/RequireAuth`, `packages/api/src/stores/authStore.ts`.

## Notas de implementación (diferencias con el plan original)

- La UI de auth quedó en **`packages/auth` (`@repo/auth`)**; `apps/auth` fue **eliminada** (no hay shell web standalone).
- Las rutas se componen con **`useRoutes`** + `authRouteObjects(config)` (objetos de ruta), no con un componente `<AuthRoutes />` declarativo.
- El logo se pasa **por props** (`logoLight`/`logoDark`) desde la app que monta el paquete (sigue el patrón de `@repo/components/Logo`: los assets viven en las apps).
- `redirectByRole` fue reemplazado por **`useAuthRedirect`** + config por contexto (`AuthProvider`, `defaultPath` / `branchUrl` / `redirectByRole`).
- `RequireAuth` quedó sin cambios; el store le pasa `loginPath={authRoutes.login}` (relativo).
- `apps/store` monta `authRouteObjects({ branchUrl: BRANCH_URL, logoLight, logoDark })` y protege el resto con `RequireAuth`.

---

## 1. Problema actual

Hoy el auth está repartido y **no funciona en Android real**:

- `apps/auth` es una SPA separada (login/registro/recuperar/restablecer) en `http://localhost:5175`.
- `apps/store` redirige a esa SPA con `window.location.assign(`${AUTH_URL}/login`)` (`apps/store/src/App.tsx:24`, `packages/components/src/RequireAuth/index.tsx:30-32`).
- El build nativo usa `.env.native` → `VITE_MOCK_AUTH=true`, así que `RequireAuth` hace bypass total (`RequireAuth/index.tsx:21-22`) y la app Android **no pide login**.
- `localhost` no resuelve en el dispositivo → cualquier intento de auth real rompe.

Razón de fondo: **la sesión vive en `@repo/api` (`useAuthStore`, mock), pero la UI de auth vive en una app separada navegada por URL**.

---

## 2. Enfoque elegido

Mantener la separación **a nivel de código/paquetes**, pero compilar **un solo bundle → un solo APK**:

- `apps/auth` deja de ser una SPA que se navega y pasa a ser un **paquete reutilizable de UI de auth**.
- `apps/store` (el shell Capacitor) **monta las rutas de auth** dentro de su propio router.
- Capacitor = 1 WebView = 1 `webDir`, por lo que no se pueden empaquetar dos SPAs independientes; la composición se resuelve en build, no en runtime.

---

## 3. Estructura objetivo

```text
packages/
├── auth/                     # @repo/auth  (UI de auth: páginas + layout + componentes)
│   ├── src/
│   │   ├── AuthRoutes.tsx    # <Routes> público con AuthLayout + las 4 páginas
│   │   ├── layouts/AuthLayout/       # layout actual de apps/auth/src/layouts/AuthLayout
│   │   ├── components/AuthLayout/    # layout presentacional (desktop/mobile)
│   │   ├── components/PageHeader/
│   │   ├── components/AuthSuccess/
│   │   ├── pages/LoginPage/
│   │   ├── pages/RegisterPage/
│   │   ├── pages/ForgotPasswordPage/
│   │   ├── pages/ResetPasswordPage/
│   │   ├── routes.ts          # authRoutes + helpers (antes apps/auth/src/routes.ts)
│   │   ├── useAuthRedirect.ts # reemplaza redirectByRole
│   │   └── assets/            # logo-light.svg / logo-dark.svg (o se pasan por props)
│   └── package.json           # name: "@repo/auth"
apps/
├── store/                    # shell Capacitor: monta @repo/auth + sus rutas
└── branch/                    # (futuro) monta @repo/auth igual que el store
```

**Conflicto de nombre a resolver:** `apps/auth/package.json` ya usa `"name": "@repo/auth"`. Al moverlo a `packages/auth` se conserva el nombre `@repo/auth`. La carpeta `apps/auth` **se elimina**, o bien se deja como shell web con otro nombre (ver §8).

---

## 4. Qué exporta `@repo/auth`

| Export              | Tipo        | Notas                                                                                                                            |
| ------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `AuthRoutes`        | componente  | `<Routes>` con `AuthLayout` + login/registro/recuperar/restablecer. El store solo hace `<AuthRoutes />` dentro de su `<Routes>`. |
| `authRoutes`        | objeto      | `{ login, register, forgotPassword, resetPassword }` — renombrado para no chocar con `routes` del store.                         |
| `resetPasswordPath` | helper      | `(token) => /reset-password/${token}`                                                                                            |
| `useAuthRedirect`   | hook        | reemplaza `redirectByRole` (ver §7).                                                                                             |
| Páginas/Layout      | componentes | `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `AuthLayout` (por si se quiere montar sin `AuthRoutes`). |

**Dependencias del paquete:** `@repo/components` (form/buttons/logo), `@repo/api` (`useAuthStore`), `@repo/domain` (schemas `loginSchema`/`registerSchema` + tipos), `@repo/theme` (tokens). Mismas deps que `apps/auth` tiene hoy.

**Tema:** `@repo/auth` **no necesita `theme.ts` propio**. Las páginas se renderizan dentro del `ChakraProvider` del store, cuyo `system` ya usa los mismos tokens de `@repo/theme` (`apps/store/src/theme.ts`). Se elimina `apps/auth/src/theme.ts`.

**Assets/logo:** el layout usa `Logo` de `@repo/components` (que exige `lightSrc`/`darkSrc`). Dos opciones: (a) el paquete incluye sus svg (como hoy `apps/auth/src/assets`), o (b) el store los pasa por props a `AuthRoutes`. Recomendado (a) para que el paquete sea autocontenido.

---

## 5. Cambios en `apps/store`

### 5.1 `App.tsx` — montar auth y rutas internas

```tsx
import { AuthRoutes, authRoutes } from '@repo/auth'

;<Routes>
  <AuthRoutes /> {/* público */}
  <Route element={<RequireAuth loginPath={authRoutes.login} mockAuth={MOCK_AUTH} />}>
    <Route element={<StoreLayout />}>{/* rutas del store, igual que hoy */}</Route>
  </Route>
</Routes>
```

- `loginPath` pasa de `AUTH_URL/login` (absoluta) a `authRoutes.login` (relativa `"/login"`).
- `RequireAuth` ya maneja rutas relativas con `<Navigate>` (`RequireAuth/index.tsx:34`), así que deja de hacer `window.location.assign`.

### 5.2 `config.ts` / env

- **Eliminar** `AUTH_URL` y `VITE_AUTH_URL` (ya no se redirige a otra app).
- **`MOCK_AUTH`:** para que Android muestre login real (aunque todavía mockeado en el store), setear `VITE_MOCK_AUTH=false` en `.env.native`. El `mockLogin` (botones "Mock cliente/admin") sigue disponible para desarrollo.
- Mantener `VITE_GEOAPIFY_API_KEY`.

### 5.3 Router en Capacitor (pendiente de validar)

El store usa `BrowserRouter` (`apps/store/src/main.tsx:13`). Sobre el esquema de Capacitor en Android esto **puede** romper el refresh/deep-link de rutas como `/login`. Validar al probar; si falla, pasar a `HashRouter` (afecta URLs pero no la lógica de rutas). **No es bloqueante de esta propuesta**, se decide en la implementación.

---

## 6. Cambios en `RequireAuth` (sin cambios funcionales)

No requiere cambios. Ya soporta `loginPath` relativo y `mockAuth`. Solo cambia el valor que le pasa el store.

---

## 7. `redirectByRole` → `useAuthRedirect`

Hoy (`apps/auth/src/config.ts` + `useLogin`):

```ts
redirectByRole(role) // window.location.assign(role === 'admin' ? BRANCH_URL : STORE_URL)
```

En el modelo embebido esto ya no aplica para el store (no hay que salir de la app). Se reemplaza por:

```ts
const redirect = useAuthRedirect() // en @repo/auth
// tras login exitoso:
redirect(user.role) // client → navigate(from ?? '/'); admin → window.location.assign(VITE_BRANCH_URL)
```

- **`client`:** `useNavigate()` a `location.state.from` (que `RequireAuth` ya setea) o a `/`.
- **`admin`:** sigue siendo redirección absoluta a `VITE_BRANCH_URL`, porque admin es otra app. `VITE_BRANCH_URL` pasa a resolverse en el build del store (moverla a `apps/store/.env*`).
- `VITE_STORE_URL` deja de necesitarse para el store embebido (solo la usaría una SPA de auth web si se mantiene).

---

## 8. Qué pasa con `apps/auth` (SPA standalone)

Dos caminos, a decidir:

- **(A) Eliminarla** — el auth vive solo como paquete y se monta en store/admin. Más simple; recomendado si no se necesita una app de auth hosteada hoy.
- **(B) Dejarla como shell web fina** — una app mínima que solo monta `<AuthRoutes />` (renombrada, p. ej. `@repo/auth-web`), para el caso de querer auth hosteada/OAuth más adelante. Mantiene el flujo web actual sin duplicar código.

Ambos son compatibles con este plan; la diferencia es si se conserva o no la SPA standalone.

---

## 9. Checklist de migración

1. Crear `packages/auth` (mover código de `apps/auth/src`), nombre `@repo/auth`, deps alineadas.
2. Renombrar `routes` → `authRoutes` y actualizar imports internos de páginas/hooks.
3. Crear `useAuthRedirect` y reemplazar `redirectByRole` en `useLogin`/`useRegister` (y cualquier otro uso).
4. Crear `AuthRoutes` (layout + páginas + `<Routes>` público).
5. Quitar `theme.ts` del paquete; consolidar assets de logo.
6. En `apps/store`: agregar `@repo/auth`, montar `<AuthRoutes />`, cambiar `loginPath` a `authRoutes.login`.
7. Limpiar `apps/store/src/config.ts` (`AUTH_URL`) y `.env*` (`VITE_AUTH_URL`, `VITE_MOCK_AUTH` según §5.2).
8. Decidir destino de `apps/auth` (§8) y aplicar.
9. `npm run lint` + `npm run check-types` + `npm run build` en store.
10. Probar Android: `npm run android` (validar `BrowserRouter` vs `HashRouter`, §5.3).

---

## 10. Decisiones abiertas / riesgos

- **Nombre del paquete:** mantener `@repo/auth` (mover de `apps/auth`) vs. `@repo/auth-ui`.
- **`BrowserRouter` en Capacitor** (§5.3): posible cambio a `HashRouter`.
- **Login sigue siendo mock** hasta que el backend tenga JWT. Este plan deja la estructura lista para enchufar el login real en `useAuthStore` sin tocar UI ni rutas.
- **Admin embebido:** el mismo `@repo/auth` se monta en `apps/branch` cuando se desarrolle; solo cambia la redirección de rol (admin se queda en la misma app).

---

## 11. Futuro (no parte de este plan)

Cuando exista JWT real, el salto es: implementar `login`/`register` contra `POST /auth/...` en `@repo/api`, guardar token y validarlo en `RequireAuth`. La estructura de paquete + montaje descrita aquí **no cambia**. Si más adelante se quiere SSO/Google/Apple, el mismo `@repo/auth` puede pasar a orquestar OAuth2 + PKCE (browser del sistema + deep link).
