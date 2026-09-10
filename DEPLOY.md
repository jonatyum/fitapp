# Despliegue (prueba): GitHub Pages + Render + Supabase

Arquitectura del deploy:

```
Frontend (React/Vite)  →  GitHub Pages   (estático, gratis)
Backend  (Fastify)     →  Render         (Web Service Docker, free)
Base de datos (Postgres)→ Supabase       (Postgres + pgvector, free)
Media (imágenes/GIFs)  →  dentro de la imagen del backend (se clona el dataset)
```

> ⚠️ Nota de licencia: la media es © Gym visual. Este despliegue es solo para
> pruebas, no para distribución pública. Para uso real necesitas tu propia
> licencia (ver `NOTICE.md` del dataset).

Todo el código de deploy ya está en el repo:
`Dockerfile.render`, `render.yaml`, el workflow de Pages y estos pasos.

---

## 1. Base de datos — Supabase

1. Crea un proyecto en <https://supabase.com> (elige región cercana y guarda la
   contraseña de la base de datos).
2. **Database → Extensions**: activa `vector` (para pgvector / la futura Fase 3).
3. **Project Settings → Database → Connection string**. Necesitas **dos** URLs:
   - **Pooled** (Transaction, puerto **6543**) → será `DATABASE_URL`.
     Añádele `?pgbouncer=true` al final.
   - **Direct** (Session, puerto **5432**) → será `DIRECT_URL`.

   Ejemplo:
   ```
   DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-...pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-...pooler.supabase.com:5432/postgres
   ```

Si la base es **nueva y está vacía**, ya has terminado: el primer arranque del
backend aplicará la migración inicial. Si ya tenía tablas, sigue el paso
siguiente **antes** de desplegar.

---

## 1.b Bases de datos que ya existen (baselining)

> Solo si tu base se creó con `prisma db push` (todo lo desplegado antes de la
> migración a migraciones versionadas). **Sáltatelo si la base está vacía.**

`db push` no crea la tabla `_prisma_migrations`, así que Prisma no sabe qué se
ha aplicado. Si arrancas el backend sin más, `prisma migrate deploy` intentará
ejecutar la migración inicial desde cero y fallará con `relation "users" already
exists`, dejando la migración marcada como fallida.

La solución es **baselining**: decirle a Prisma que la migración inicial ya está
aplicada. Solo escribe una fila en `_prisma_migrations`; **no ejecuta el SQL y
no toca tus datos**.

Hazlo **una vez**, desde tu máquina, antes de desplegar:

```bash
cd apps/api

# La DIRECT (puerto 5432), no la pooled. Prisma la lee como directUrl.
export DATABASE_URL='postgresql://postgres.xxxx:PASSWORD@...:5432/postgres'
export DIRECT_URL="$DATABASE_URL"

# 1. Comprueba el estado. Debe decir que la base no está inicializada.
npx prisma migrate status

# 2. Marca la migración inicial como ya aplicada (NO ejecuta su SQL).
npx prisma migrate resolve --applied 20260904005056_init

# 3. Confirma. Debe decir "Database schema is up to date!".
npx prisma migrate status
```

Antes del paso 2, **haz un backup**: en Supabase, *Database → Backups*, o
`pg_dump`. El comando no es destructivo, pero el backup es gratis.

Si `migrate status` del paso 3 detecta diferencias entre tu schema y la base, es
que la base había derivado respecto a `schema.prisma`. Para en ese punto y
resuélvelo antes de desplegar; no fuerces el deploy.

---

## 2. Backend — Render

1. Sube este repo a GitHub (ver §4).
2. En <https://render.com>: **New → Blueprint**, selecciona el repo. Render lee
   `render.yaml` y crea el servicio `fitapp-api`.
3. Rellena las variables de entorno (marcadas `sync: false`):
   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | la pooled de Supabase (`?pgbouncer=true`) |
   | `DIRECT_URL` | la direct de Supabase (puerto 5432) |
   | `GOOGLE_CLIENT_ID` | tu client id; obligatorio si `CLOSED_BETA=1` |
   | `CLOSED_BETA` | `1` cierra la app entera detrás de Google; vacío = flujo abierto |
   | `ALLOWED_EMAILS` | semilla de la lista de accesos; a partir de ahí se gestiona desde `/admin` |
   | `CORS_ORIGIN` | `https://<tu-usuario>.github.io` (lo tendrás tras §3) |
   | `JWT_SECRET` | lo genera Render solo — no lo toques |
4. **Deploy**. En cada arranque el contenedor: aplica las migraciones
   pendientes (`prisma migrate deploy`), importa los 1.324 ejercicios (seed,
   idempotente) y sirve la API. Si una migración falla, el contenedor sale con
   error y Render marca el deploy como fallido en vez de servir con un schema
   equivocado — mira los logs antes de reintentar.

   > Si tu base ya existía y **no** hiciste el baselining de §1.b, este paso
   > fallará con `relation already exists`. Vuelve a §1.b.
5. Copia la URL pública, algo como `https://fitapp-api.onrender.com`.
   Compruébala: `https://fitapp-api.onrender.com/health` → `{"status":"ok"}`.

> El plan free se duerme tras inactividad: la primera petición tarda ~50 s.

---

## 3. Frontend — GitHub Pages

1. En el repo de GitHub: **Settings → Pages → Source = GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables → New variable**:
   - `VITE_API_URL` = la URL de Render (`https://fitapp-api.onrender.com`).
3. Lanza el workflow: haz push a `main` o **Actions → Deploy web → Run workflow**.
4. Al terminar, la app queda en `https://<tu-usuario>.github.io/<repo>/`.
5. Vuelve a Render y pon esa URL exacta en `CORS_ORIGIN` (sin barra final),
   luego **Manual Deploy → Clear build cache & deploy** o guarda para reiniciar.

---

## 4. Subir el repo a GitHub

```bash
cd fitapp
git init
git add -A
git commit -m "FitApp: fases 0-2 + Google Sign-In + deploy config"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/<repo>.git
git push -u origin main
```

`.env` está en `.gitignore`, así que tu client id local no se sube.

---

## 5. Google Sign-In (obligatorio con la beta cerrada)

Con `CLOSED_BETA=1` es la única forma de entrar, así que deja de ser opcional:
sin `GOOGLE_CLIENT_ID` el API no arranca en producción.

En **Google Cloud Console → Credenciales → tu OAuth client → Orígenes
autorizados de JavaScript** añade el dominio desde el que se sirve el web:

```
https://chamani.jonatyum.com
```

(y mantén `http://localhost:5174` para desarrollo). Sin barra final y sin ruta.
No hace falta URI de redirección: el navegador recibe el *ID token* y la API lo
verifica.

En **Google Auth Platform → Audience**, con el estado de publicación en
*Testing*, añade cada correo de la beta en *Test users* (tope de 100). Quien no
esté en esa lista ve una pantalla de Google —`Error 403: access_denied`— que
**nunca llega a la app**: el callback del botón no se dispara. Por eso el enlace
«No puedo entrar» de la pantalla de acceso está siempre visible — es lo único
que recupera a quien vio esa pantalla — y por eso existe `ALLOWED_EMAILS`, que
sí produce un rechazo explicado dentro de Chamani cuando se usa.

---

## 6. Cambiar el schema más adelante

Las migraciones viven en `apps/api/prisma/migrations/` y **se commitean**. El
flujo es el mismo de siempre menos el `db push`:

```bash
cd apps/api

# 1. Edita prisma/schema.prisma.

# 2. Genera la migración contra tu Postgres local (docker compose up db).
#    Crea el .sql, lo aplica en local y regenera el cliente.
DATABASE_URL='postgresql://fitapp:fitapp@localhost:5433/fitapp' \
DIRECT_URL='postgresql://fitapp:fitapp@localhost:5433/fitapp' \
  npm run db:migrate -- --name describe_el_cambio

# 3. Revisa el SQL generado antes de commitear.
cat prisma/migrations/*_describe_el_cambio/migration.sql

# 4. Commit del schema + la carpeta de la migración, y push.
#    Render la aplicará sola en el siguiente deploy.
```

Reglas:

- **Nunca edites una migración ya desplegada.** Prisma guarda un checksum y
  `migrate deploy` fallará. Para corregir algo, crea otra migración encima.
- **Revisa el SQL de cualquier migración que borre o renombre.** Prisma genera
  `DROP COLUMN` / `DROP TABLE` sin avisar cuando quitas algo del schema; en una
  base con datos reales eso es pérdida definitiva. Si el cambio es un renombrado,
  reescribe el SQL a mano como `ALTER TABLE ... RENAME COLUMN`.
- `prisma migrate dev` **resetea la base si detecta drift**. Úsalo solo en local,
  nunca contra Supabase. En producción solo corre `migrate deploy`, que jamás
  resetea nada.
- `migrate dev` necesita una *shadow database* que crea y borra sola; el
  Postgres local de `docker-compose` ya tiene permisos para eso. Supabase no
  hace falta que los tenga, porque allí nunca se ejecuta `migrate dev`.

---

## 7. Suscripciones (planes Free / Pro)

El módulo vive en `apps/api/src/billing/` y es **agnóstico del proveedor de
pago**: todo lo específico está detrás de la interfaz `PaymentProvider`
(`billing/types.ts`). Hay dos implementaciones registradas en
`billing/providers.ts`.

### manual-qr — el proveedor activo (comisión 0)

QR Simple / transferencia bancaria, conciliada a mano. El usuario transfiere
citando una referencia (`FIT-XXXXXX`), manda el comprobante, y tú confirmas.
Cero comisión y cero coste fijo.

Variables en Render (ver `.env.example`):

| Variable | Para qué |
|---|---|
| `QR_ACCOUNT_NUMBER` | **obligatoria** — sin ella el proveedor queda desactivado |
| `QR_CONTACT` | **obligatoria** — a dónde manda el comprobante (WhatsApp) |
| `QR_BANK_NAME`, `QR_ACCOUNT_NAME` | se muestran en las instrucciones |
| `QR_IMAGE_URL` | URL de la imagen del QR (opcional) |
| `CLOSED_BETA` | `1` deja la app entera detrás de una sesión de Google. Sin `GOOGLE_CLIENT_ID`, el arranque falla en producción en vez de servir una puerta que no abre |
| `ALLOWED_EMAILS` | **semilla** de la lista de accesos, separada por comas: en cada arranque se añaden a `allowed_emails` (nunca se borra nada). A partir de ahí la lista se gestiona desde `/admin` → Accesos. Los correos de `ADMIN_EMAILS` entran también en la semilla, para que quien reparte accesos pueda entrar a repartirlos |
| `ADMIN_EMAILS` | **semilla** de administradores, separados por comas: en cada arranque asciende esas cuentas al rol `admin`. A partir de ahí manda la columna `role` y los admins se gestionan desde el panel (`/admin`). Nunca degrada a nadie |

Si faltan las dos obligatorias, la pantalla de planes no ofrece ningún medio de
pago en vez de mandar al usuario a transferir a una cuenta vacía.

**Confirmar un pago** se hace desde el panel: entra con una cuenta admin y
abre **Yo → Administración**. La ruta `/admin` no está enlazada en ningún otro
sitio y quien no tiene el rol acaba en Hoy.

Por API, si hace falta (necesitas el token JWT de una cuenta con rol `admin`):

```bash
API=https://fitapp-api.onrender.com
TOKEN=$(curl -s -X POST $API/auth/login -H 'content-type: application/json' \
  -d '{"email":"tu@correo","password":"..."}' | jq -r .token)

# 1. Ver la cola: sin `status` salen los pendientes y los que ya mandaron
#    comprobante (`review`), que son los que esperan una decisión.
curl -s $API/admin/payments -H "authorization: Bearer $TOKEN" | jq

# 2. Confirmar. Activa Pro 30 días; pagar antes de vencer suma al vencimiento.
curl -s -X POST $API/admin/payments/FIT-XXXXXX/confirm \
  -H "authorization: Bearer $TOKEN" | jq
```

Confirmar dos veces devuelve `409 not_pending`: nunca se conceden dos periodos.

### polar — preparado, apagado

[Polar.sh](https://polar.sh) es Merchant of Record (cobra, se ocupa del
impuesto y liquida en USD), así que sirve para tarjetas desde fuera de Bolivia.
No cobra nada hasta que cobra, de modo que no rompe el objetivo de coste fijo 0.

`billing/polar.ts` está escrito pero **desactivado**: se enciende solo cuando
`POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET` y `POLAR_PRODUCT_ID_PRO` están las
tres puestas. Antes de encenderlo:

1. Verifica las dos llamadas HTTP del fichero contra la documentación vigente
   de Polar — **nunca se han ejecutado contra una cuenta real**.
2. Registra el webhook en el panel de Polar apuntando a
   `https://<tu-api>.onrender.com/billing/webhook/polar`.

La verificación de firma (standard-webhooks: HMAC-SHA256 sobre el cuerpo crudo,
con ventana de 5 minutos contra replays) sí está probada.

### Gating

`requirePro` (`billing/subscriptions.ts`) es un `preHandler` que se encadena
detrás del `requireAuth` de siempre y responde **402** (no 403: se arregla
pagando, y la web distingue los dos):

```ts
app.get("/stats", { preHandler: [requireAuth, requirePro] }, ...)
```

Ahora mismo solo gatea el panel de progreso. Registrar entrenos, generar rutinas
y el catálogo siguen siendo gratis.

El vencimiento se evalúa **al leer**, no con un cron: el plan free de Render no
tiene dónde correr un scheduler, y una columna `status` desactualizada sería una
forma silenciosa de regalar Pro.

---

## Resumen de variables de entorno

| Dónde | Variables |
|---|---|
| **Render** (backend) | `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `CORS_ORIGIN`, `TRUST_PROXY`, `ADMIN_EMAILS`, `CLOSED_BETA`, `ALLOWED_EMAILS`, `QR_*` |
| **GitHub Pages** (build) | `VITE_API_URL` (variable), `VITE_BASE` (lo pone el workflow solo) |
| **Supabase** | ninguna que configurar — solo copias las dos connection strings |

## Orden recomendado

Supabase (obtén las URLs) → Render (deploy, obtén la URL de la API) →
GitHub Pages (build con `VITE_API_URL`) → vuelve a Render y fija `CORS_ORIGIN`
con la URL de Pages → añade el origen en Google Cloud.
