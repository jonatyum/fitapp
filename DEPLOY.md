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
   | `GOOGLE_CLIENT_ID` | tu client id, o vacío para desactivar Google |
   | `CORS_ORIGIN` | `https://<tu-usuario>.github.io` (lo tendrás tras §3) |
   | `JWT_SECRET` | lo genera Render solo — no lo toques |
4. **Deploy**. En el primer arranque el contenedor: crea las tablas
   (`prisma db push`), importa los 1.324 ejercicios (seed) y sirve la API.
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

## 5. Google Sign-In (opcional)

Si usas el botón de Google, en **Google Cloud Console → Credenciales → tu OAuth
client → Orígenes autorizados de JavaScript** añade:

```
https://<tu-usuario>.github.io
```

(y mantén `http://localhost:5174` para desarrollo). No hace falta URI de
redirección. Añádete como *usuario de prueba* en la pantalla de consentimiento.

---

## Resumen de variables de entorno

| Dónde | Variables |
|---|---|
| **Render** (backend) | `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `CORS_ORIGIN` |
| **GitHub Pages** (build) | `VITE_API_URL` (variable), `VITE_BASE` (lo pone el workflow solo) |
| **Supabase** | ninguna que configurar — solo copias las dos connection strings |

## Orden recomendado

Supabase (obtén las URLs) → Render (deploy, obtén la URL de la API) →
GitHub Pages (build con `VITE_API_URL`) → vuelve a Render y fija `CORS_ORIGIN`
con la URL de Pages → añade el origen en Google Cloud.
