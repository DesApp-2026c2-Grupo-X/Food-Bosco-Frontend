# AI Tester Guide — probar Food Bosco con opencode-browser

Guía para que un agente (o una persona) levante el stack, lo semille y ejecute los
flujos de las 4 apps usando **opencode-browser**
(`opencode-chrome-devtools`): el plugin de opencode que maneja Chrome por CDP.

- Repos: `Food-Bosco-Frontend` (store/admin/branch/rider) y `Food-Bosco-API` (gateway + servicios).
- Apps: store `:5173`, admin `:5174`, branch `:5175`, rider `:5176`.
- API: gateway GraphQL `:4000`; auth `:4201`, commerce `:4202`, delivery `:4203`.

---

## 1. Requisitos

- **Node 22** para el frontend (los tests y Vite moderno lo necesitan):

  ```bash
  export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:$PATH"
  ```

- Chrome instalado en macOS: `/Applications/Google Chrome.app`.
- El plugin se instala globalmente (una vez):

  ```bash
  npm i -g opencode-chrome-devtools --registry=https://registry.npmjs.org
  ```

### Habilitarlo en opencode

Agregar el plugin a la config (`~/.config/opencode/opencode.json`):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-chrome-devtools"],
}
```

Al reiniciar opencode, las herramientas nativas quedan disponibles:
`browser_list`, `browser_navigate`, `browser_snapshot`, `browser_click`,
`browser_fill`, `browser_eval`, `browser_screenshot`, `browser_version`.

> También se pueden usar desde la terminal con el CLI:
> `opencode-chrome-devtools tool browser_eval --args '<json>'`.

---

## 2. Arrancar el navegador con CDP

Chrome debe exponer el puerto de depuración. Usar un `user-data-dir` dedicado:

```bash
rm -rf /tmp/opencode-bosco-chrome
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/opencode-bosco-chrome \
  --no-first-run --no-default-browser-check \
  "http://[::1]:5173/"
```

Verificar:

```bash
curl -s http://127.0.0.1:9222/json/version | head
opencode-chrome-devtools tool browser_list --args '{"browser_url":"http://127.0.0.1:9222"}'
```

`browser_url` siempre es `http://127.0.0.1:9222` en local.

### Nota importante (limitación conocida)

En **Chrome 154 headless y headful**, `browser_snapshot` devuelve solo
`[1] RootWebArea` (el árbol de accesibilidad no se puebla), por lo que
`browser_click`/`browser_fill` (que dependen de los UIDs del snapshot) no sirven.
**Workaround: manejar los flujos con `browser_eval`** (Runtime.evaluate), que funciona
perfecto, y usar `browser_screenshot` para evidencia. Más abajo están las recetas.

---

## 3. Levantar el stack

### API (Node 20 está bien para la API)

```bash
cd Food-Bosco-API
npm run dev          # turbo run dev → gateway + auth + commerce + delivery (watch)
```

### Frontend

```bash
cd Food-Bosco-Frontend
npm run dev          # build de packages + Vite en 5173/5174/5175/5176
```

> Los dev servers de Vite escuchan en IPv6 (`[::1]`). Usar `http://[::1]:5173/…` en el
> navegador (no `localhost`, que puede resolver a IPv4 y dar `ERR_CONNECTION_REFUSED`).

---

## 4. Semillar la base (datos de prueba)

El seed es **idempotente** y orquestado por el gateway:

```bash
curl -s -X POST http://localhost:4000/seed \
  -H 'x-internal-token: dev-internal-token' \
  -H 'Content-Type: application/json'
```

### Regenerar la base desde cero

La API usa MongoDB Atlas (`test-foodbosco`). Para dropear y re-semillar:

```bash
cd Food-Bosco-API
node -e '
const { MongoClient } = require("mongodb");
const url = "mongodb+srv://admin:admin@proyecto-mongo.i8jensy.mongodb.net/test-foodbosco?appName=proyecto-mongo";
(async () => {
  const c = new MongoClient(url);
  await c.connect();
  await c.db().dropDatabase();
  console.log("dropped", c.db().databaseName);
  await c.close();
})();
'
# y volver a correr el POST /seed de arriba
```

### Qué siembra (a la fecha)

- **Usuarios** (contraseñas por `SEED_*_PASSWORD`, defaults):
  | Rol                   | Email                             | Password         |
  | --------------------- | --------------------------------- | ---------------- |
  | super_admin           | `admin@foodbosco.local`           | `Admin123!`      |
  | customer              | `cliente@foodbosco.local`         | `Cliente123!`    |
  | rider                 | `repartidor@foodbosco.local`      | `Repartidor123!` |
  | branch_admin (Centro) | `sucursal.centro@foodbosco.local` | `Sucursal123!`   |
  | branch_admin (Norte)  | `sucursal.norte@foodbosco.local`  | `Sucursal123!`   |
  | branch_admin (Oeste)  | `sucursal.oeste@foodbosco.local`  | `Sucursal123!`   |
- **Direcciones del customer**: `Casa` (Av. Vergara 1250, Hurlingham — junto a Centro) y
  `Trabajo` (Av. Rivadavia 1234, CABA — lejos, útil para probar "sin sucursal").
- **Catálogo**: 5 categorías, 19 ingredientes, 17 productos con grupos/opciones y recetas,
  3 sucursales (Centro/Norte/Oeste) con horarios, stock, 2 promociones, estados y parámetros.
- **Pedidos demo** (5, uno por estado): `000001` PENDING, `000002` READY_FOR_DELIVERY,
  `000003` ON_THE_WAY, `000004` DELIVERED, `000005` CANCELLED.
- **Rider**: perfil + zonas/turnos, y un **pedido listo para ofertas** (el `000002`) con el
  rider disponible y ubicado en la sucursal → al abrir la app rider aparece una oferta.

Verificación rápida por GraphQL:

```bash
# customer
curl -s http://localhost:4000/graphql -H 'Content-Type: application/json' \
  -d '{"query":"mutation($i:LoginInput!){login(input:$i){accessToken}}","variables":{"i":{"email":"cliente@foodbosco.local","password":"Cliente123!"}}}'
```

---

## 5. Recetas con `browser_eval`

### 5.1 Helpers

Obtener el `target_id` de la app y guardarlo:

```bash
opencode-chrome-devtools tool browser_list --args '{"browser_url":"http://127.0.0.1:9222"}'
```

Helper de bash para evaluar (evita problemas de escaping del JSON):

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:$PATH"
TARGET=<target_id_de_la_app>   # cambia por target
ev() {
  ARGS=$(node -e 'console.log(JSON.stringify({
    browser_url:"http://127.0.0.1:9222",
    target_id:process.argv[1],
    expression:process.argv[2]
  }))' "$TARGET" "$1")
  opencode-chrome-devtools tool browser_eval --args "$ARGS"
}
```

### 5.2 Navegar

```bash
opencode-chrome-devtools tool browser_navigate \
  --args '{"browser_url":"http://127.0.0.1:9222","url":"http://[::1]:5173/"}'
```

### 5.3 Login (funciona para las 4 apps)

Los formularios usan React Hook Form; alcanza con setear los valores y disparar
`requestSubmit()`. Si el primer intento no navega (el dev server todavía está montando),
**repetir una vez**.

```bash
ev "localStorage.clear(); sessionStorage.clear(); location.href='http://[::1]:5173/'; 'cleared'"
# esperar ~4s
ev "(() => {
  const setVal=(el,v)=>{const s=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value').set;
    s.call(el,v); el.dispatchEvent(new Event('input',{bubbles:true}));};
  const ins=[...document.querySelectorAll('input')];
  setVal(ins[0],'cliente@foodbosco.local'); setVal(ins[1],'Cliente123!');
  document.querySelector('form').requestSubmit(); return 'submitted';
})()"
# esperar ~6s y verificar
ev "JSON.stringify({href:location.href, body:document.body.innerText.slice(0,300)})"
```

> Con verificación de auth (`VITE_MOCK_AUTH=false`), cada app redirige a su `/login`.
> Cambiar `url`/credenciales por app:
>
> - admin `http://[::1]:5174/` → `admin@foodbosco.local` / `Admin123!`
> - branch `http://[::1]:5175/` → `sucursal.centro@foodbosco.local` / `Sucursal123!`
> - rider `http://[::1]:5176/` → `repartidor@foodbosco.local` / `Repartidor123!`

### 5.4 Click por texto (links/botones)

```bash
ev "(() => { const a=[...document.querySelectorAll('a')].find(x=>x.textContent.trim()==='Catálogo');
  a.click(); return 'ok'; })()"
```

### 5.5 Seleccionar opción de producto y agregar al carrito

```bash
ev "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim().startsWith('Simple'));
  b.click(); return 'option'; })()"
ev "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Agregar al carrito'));
  b.click(); return 'added'; })()"
```

### 5.6 Cambiar estado de un pedido (branch/admin)

El selector es un `<select>` nativo:

```bash
ev "(() => { const sel=document.querySelector('select');
  const opt=[...sel.options].find(o=>o.textContent.trim()==='Confirmado');
  const s=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(sel),'value').set;
  s.call(sel,opt.value); sel.dispatchEvent(new Event('change',{bubbles:true})); return 'set'; })()"
ev "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Cambiar estado');
  b.click(); return 'open modal'; })()"
ev "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Confirmar');
  b.click(); return 'confirmed'; })()"
```

### 5.7 Geolocalización (flujos del rider)

El gate de retiro/entrega exige estar a ≤ 50 m. Para mover al rider sin tocar el SO,
inyectar un override de `navigator.geolocation` **antes** de recargar (CDP). Requiere el
paquete `ws` (viene con el plugin).

`/tmp/ridergeo.js`:

```js
const http = require('http')
const WebSocket = require('ws')
const [LAT, LNG, MATCH] = [
  Number(process.argv[2]),
  Number(process.argv[3]),
  process.argv[4] ?? ':5176',
]
http.get('http://127.0.0.1:9222/json/list', (res) => {
  let d = ''
  res.on('data', (c) => (d += c))
  res.on('end', async () => {
    const t = JSON.parse(d).find((x) => x.type === 'page' && x.url.includes(MATCH))
    const ws = new WebSocket(t.webSocketDebuggerUrl)
    let id = 0
    const p = new Map()
    const send = (m, params) =>
      new Promise((r) => {
        const i = ++id
        p.set(i, r)
        ws.send(JSON.stringify({ id: i, method: m, params }))
      })
    ws.on('message', (m) => {
      const o = JSON.parse(m)
      if (o.id && p.has(o.id)) {
        p.get(o.id)(o.result)
        p.delete(o.id)
      }
    })
    ws.on('open', async () => {
      await send('Page.enable')
      await send('Page.addScriptToEvaluateOnNewDocument', {
        source: `
        Object.defineProperty(navigator,'geolocation',{configurable:true,value:{
          watchPosition:(cb)=>{setTimeout(()=>cb({coords:{latitude:${LAT},longitude:${LNG},accuracy:5}}),50);return 1},
          clearWatch:()=>{}, getCurrentPosition:(cb)=>cb({coords:{latitude:${LAT},longitude:${LNG},accuracy:5}})}});`,
      })
      await send('Page.reload', { ignoreCache: true })
      setTimeout(() => ws.close(), 800)
    })
  })
})
```

```bash
export NODE_PATH="$HOME/.nvm/versions/node/v20.19.2/lib/node_modules:$HOME/.nvm/versions/node/v20.19.2/lib/node_modules/opencode-chrome-devtools/node_modules"
# ubicar al rider en la sucursal Centro (-34.589, -58.636) para "Retirar"
node /tmp/ridergeo.js -34.589 -58.636 ':5176'
# ubicar al rider en la dirección de entrega (-34.587, -58.634) para "Entregar"
node /tmp/ridergeo.js -34.587 -58.634 ':5176'
```

### 5.8 Evidencia (screenshots)

```bash
opencode-chrome-devtools tool browser_screenshot \
  --args '{"browser_url":"http://127.0.0.1:9222","target_id":"<id>"}'
# devuelve el path del PNG
```

---

## 6. Flujos a ejecutar (checklist)

### Store (`:5173`, customer)

- [ ] Login → home con "Pedidos en curso".
- [ ] Gate de dirección (modal "¿A dónde te lo llevamos?").
- [ ] Catálogo → detalle de producto → elegir opción obligatoria → agregar al carrito.
- [ ] Carrito → checkout → **Confirmar pedido** → "¡Pedido confirmado!" con nº y sucursal.
- [ ] Mis pedidos → verificar el pedido nuevo.
- [ ] Alternativo: elegir dirección lejana (CABA) → catálogo muestra "No hay sucursales disponibles".

### Admin (`:5174`, super_admin)

- [ ] Login → dashboard (Inicio/Categorías/Productos/Ingredientes/Pedidos/Sucursales/Stock/Personal/Parámetros/Reportes).
- [ ] Categorías: listar, crear, editar, activar/desactivar, filtrar.
- [ ] Productos: listar, editor (datos, configs, receta, imagen, disponibilidad).
- [ ] Pedidos: filtros por estado y sucursal.
- [ ] Sucursales / Stock / Personal / Reportes.
- [ ] Mi perfil / Salir.

### Branch (`:5175`, branch_admin Centro)

- [ ] Login → home "Pedidos que requieren atención" (Pendiente / Listo para entregar).
- [ ] Pedidos → detalle de un pedido → **Cambiar estado** (seleccionar, confirmar).
- [ ] Verificar historial de estados actualizado.
- [ ] Productos (pausar/reactivar) y Stock (ajustar).

### Rider (`:5176`, rider)

- [ ] Login → "Conectado" / "Compartiendo ubicación" → **Nueva oferta de viaje**.
- [ ] Aceptar → detalle del viaje (mapa, productos, contacto).
- [ ] Sin estar cerca: "Retirar" **deshabilitado** (gate ≤ 50 m).
- [ ] Con geolocalización en la sucursal: **Retirar** → estado ON_THE_WAY.
- [ ] Con geolocalización en la entrega: **Entregar** → vuelve a inicio "Buscando viajes…".
- [ ] Historial: el viaje completado aparece con ganancia.

---

## 6.b Stock y Reportes (verificados a fondo)

**Stock**

- Admin (`/stock`): filtro por sucursal (Todas/Centro/Norte/Oeste); "Ajustar" abre el modal con
  el stock actual; `delta = 0` deja el botón deshabilitado; un `delta` válido actualiza la
  cantidad (verificar el refetch de `AdminBranchStock`).
- Branch (`/stock`): "Ajustar" sobre un ingrediente; el motivo es opcional.
- Bug corregido: el frontend envía `reason: ""` y en Mongoose un string vacío cuenta como
  faltante en un campo `required`, así que el ajuste devolvía **500**
  (`POST /v1/stock/adjustments`). Se corrigió en `commerce`:
  `reason?.trim() ? reason.trim() : 'adjust'`. Efecto colateral detectado: como `adjust` hacía
  `setQuantity` antes de crear el movimiento, los intentos fallidos igual movían el stock
  (la operación no es transaccional).

**Reportes** (ruta real `/reports/products`; `/reports` **no** existe)

- Admin: KPIs (Ingresos, Pedidos, Ticket promedio, cancelados, producto más vendido, sucursal
  con mayor facturación), filtros Período / Sucursal / Estado, gráficos (evolución de ventas,
  pedidos por estado, ingresos por sucursal) y ranking de productos (Más vendidos / Menos
  vendidos / Sin stock / Mayor facturación). "Personalizado" revela Desde/Hasta
  (`input[type=date]`).
- Branch: misma pantalla sin filtro de Sucursal, con las métricas de la sucursal propia.

---

## 7. Troubleshooting

| Síntoma                                            | Causa / solución                                                                                                     |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `ERR_CONNECTION_REFUSED` al navegar                | Los dev servers escuchan en IPv6: usar `http://[::1]:PORT/`. Verificar con `lsof -iTCP:5173`.                        |
| `browser_snapshot` devuelve solo `RootWebArea`     | Limitación en Chrome 154. Usar `browser_eval`.                                                                       |
| El login no navega en el primer intento            | El form todavía no montó: repetir el `requestSubmit()`.                                                              |
| "Retirar"/"Entregar" deshabilitado                 | Fuera del rango de 50 m: usar el override de geolocalización (§5.7).                                                 |
| La oferta del rider no aparece                     | El rider debe estar disponible y con ubicación "fresca" (≤ 5 min). Re-correr el seed o volver a compartir ubicación. |
| `localStorage` con sesión vieja tras dropear la DB | Limpiar storage y re-loguear (los tokens referencian usuarios borrados).                                             |

---

## 8. Estado verificado

Con este procedimiento se ejecutaron (oct 2026) los flujos principales de las 4 apps
usando el plugin instalado: store (login → dirección → catálogo → configuración de producto
→ carrito → checkout → pedido confirmado), admin (dashboard → categorías → pedidos),
branch (atención → detalle → cambio de estado Pendiente→Confirmado) y rider
(oferta → aceptar → retiro con gate de proximidad → entrega → vuelta a inicio).
