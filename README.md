# FitApp

Aplicación de fitness construida sobre el [`exercises-dataset`](../exercises-dataset)
(1.324 ejercicios con media, 10 idiomas, grupos musculares y equipo).

## Fases

- **Fase 0 — Fundaciones** ✅ · API + DB + seed del dataset + catálogo web
- **Fase 1 — Mapa muscular** ✅ · figuras anterior/posterior, hover por grupo, clic → filtra
- **Fase 2 — Rutinas y progreso** ✅ · cuentas, generador de rutinas, registro de entrenamientos
- **Fase 3** — Coach IA con RAG (pgvector + Claude)

## Arquitectura

```
fitapp/
├── apps/
│   ├── api/   Fastify + Prisma + Postgres (pgvector)
│   └── web/   React + Vite + TypeScript
└── docker-compose.yml   db + api + web
```

El dataset (`../exercises-dataset`) se monta **read-only**:
- `data/exercises.json` → se importa a Postgres al arrancar (seed idempotente)
- `images/` y `videos/` → servidos por la API en `/media/*`

Toda la interfaz está traducida a 10 idiomas (en/es/it/fr/tr/ru/zh/hi/pl/ko),
incluidos los nombres de los ejercicios (traducción compositiva offline).

## Arranque

Requiere Docker. Desde `fitapp/`:

```bash
docker compose up --build
```

Servicios:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| web | http://localhost:5174 | App React |
| api | http://localhost:3001 | REST API |
| db  | localhost:5433 | Postgres + pgvector |

## Inicio de sesión con Google

Es **opcional**: sin configurar nada, la app solo ofrece correo y contraseña y
el botón de Google no aparece.

Se usa Google Identity Services: el navegador obtiene un *ID token* y la API lo
verifica contra las claves públicas de Google. Por eso **solo hace falta el
client ID — no hay client secret ni redirecciones**.

Para activarlo:

1. Entra en [Google Cloud Console](https://console.cloud.google.com/) y crea un
   proyecto (o reutiliza uno).
2. **APIs y servicios → Pantalla de consentimiento de OAuth**: tipo *Externo*,
   rellena nombre de la app y correo de soporte. En desarrollo puedes dejarla
   en modo *Prueba* y añadirte como usuario de prueba.
3. **APIs y servicios → Credenciales → Crear credenciales → ID de cliente de
   OAuth**, tipo **Aplicación web**.
4. En **Orígenes autorizados de JavaScript** añade exactamente
   `http://localhost:5174` (y tu dominio real cuando despliegues).
   No hace falta URI de redirección.
5. Copia el *Client ID* (termina en `.apps.googleusercontent.com`) a un `.env`
   junto a `docker-compose.yml` — hay una plantilla en `.env.example`:

   ```
   GOOGLE_CLIENT_ID=123456789-xxxxxxxx.apps.googleusercontent.com
   ```

6. Reinicia la API:

   ```bash
   docker compose up -d api
   ```

Detalles de comportamiento:

- Si el correo de Google ya existe como cuenta con contraseña, **se vincula** a
  la misma cuenta (Google ya verificó esa dirección) en lugar de crear un
  duplicado.
- Se rechazan las cuentas de Google sin correo verificado.
- El script de Google solo se carga cuando el usuario abre el diálogo de acceso.

## Beta cerrada

Con `CLOSED_BETA=1` la app entera queda detrás de una sesión de Google. Quién
entra lo decide la lista de *usuarios de prueba* de Google Cloud, con la
pantalla de consentimiento en *Testing*. Se cierra todo salvo `/health`,
`/auth/config`, `/auth/google`, el webhook de cobro y `/media/*` — este último
porque un `<img src>` no manda cabecera de autorización y el catálogo se
quedaría sin imágenes.

`ALLOWED_EMAILS` es una segunda puerta **opcional**, vacía por defecto para no
tener dos listas que mantener. Rellenarla añade un cerrojo que Google no puede
abrir por su cuenta, y conviene saber por qué existe: publicar la pantalla de
consentimiento es un botón de una consola, sin PR ni revisión, y abriría el
registro a cualquier cuenta de Google en el mismo segundo. Cuando está puesta
se comprueba en cada entrada, no solo al crear la cuenta.

Mientras dura, el correo y la contraseña quedan desactivados (`403
password_login_disabled`); el código sigue en su sitio y vuelve al apagar el
interruptor, igual que el camino de activación sin cuenta.

Un aviso: los tokens duran 30 días y no se revocan, así que sacar a alguien de
la lista le cierra la puerta en el siguiente acceso, no en el acto. Para
expulsar a alguien ya, hay que borrar su cuenta.

## Endpoints de la API

**Catálogo** (público con la beta apagada; con `CLOSED_BETA=1` exige sesión)

- `GET /health`
- `GET /meta` — valores para filtros (bodyParts, equipment, targets)
- `GET /exercises?q=&bodyPart=&equipment=&target=&muscle=&limit=&offset=`
- `GET /exercises/:id`
- `GET /muscles/counts` — nº de ejercicios por músculo (mapa muscular)
- `GET /media/images/<file>.jpg` · `GET /media/videos/<file>.gif`

**Cuentas**

- `GET /auth/config` — métodos de acceso disponibles
- `POST /auth/register` · `POST /auth/login` · `POST /auth/google`
- `GET /auth/me`

**Rutinas** (requieren `Authorization: Bearer <token>`)

- `POST /routines/generate` — genera un plan sin guardarlo
- `GET|POST /routines` · `GET|PATCH|DELETE /routines/:id`

**Entrenamientos** (requieren token)

- `POST /sessions` · `GET /sessions` · `GET|PUT|DELETE /sessions/:id`
- `GET /stats` — volumen, racha, top ejercicios, récords

## Notas

- **Licencia de media:** los GIFs/imágenes son de Gym visual; para uso público
  necesitas tu propia licencia. Ver `NOTICE.md` del dataset.
- **`JWT_SECRET`** está fijado en `docker-compose.yml` como valor de desarrollo.
  Cámbialo antes de desplegar.
