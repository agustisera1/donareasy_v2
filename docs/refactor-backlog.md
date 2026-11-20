# Auditoría de features, guion de demo y backlog

Auditoría del 2026-11-17, hecha leyendo el código (sin correr la app). Reemplaza el escaneo del
2026-11-16, que había quedado viejo: era anterior a la estandarización de drawers, a las migraciones
con RLS y al seed, y tenía errores (por ejemplo, daba la landing por hecha). Actualizada el
2026-11-20 con el branch `feat(donations)/demo-ready`.

Objetivo: preparar una demo mínima y funcional para la cátedra. Primero se define **qué se demuestra**
y qué cortes tiene el camino crítico. El refactor viene después.

Estados:
- **Listo:** funciona de punta a punta.
- **A mitad:** existe, pero tiene huecos que se pueden ver en la demo.
- **Roto para demo:** corta el guion.
- **Sin hacer:** solo hay un placeholder, un stub o una promesa en la UI.

## 1. Matriz de features

| Feature | Estado | Evidencia | Corte / nota |
|---|---|---|---|
| Landing | Sin hacer | `app/page.tsx:4` | Solo hace `redirect("/dashboard")`. El hero vive en el layout de auth (`components/hero.tsx`), oculto en mobile (`hidden lg:flex`) |
| Login | Listo | — | — |
| Registro | Listo | — | — |
| Confirmación de mail | Listo | — | El link se abre en el mismo navegador del registro (PKCE) |
| Recuperar / cambiar contraseña | Listo | — | El link se abre en el mismo navegador del pedido (PKCE) |
| Logout | Listo | — | — |
| Onboarding (rol + perfil) | Listo | — | Atómico vía RPC. `/dashboard/*` y `/onboarding` redirigen según el estado de la cuenta |
| Aprobación de instituciones | Listo | — | Se aprueba a mano (`institutions.approved`). Mientras tanto la cuenta solo ve el aviso de revisión y no figura en los listados. La notificación no se envía |
| Perfil (ver y editar) | Listo | — | `userId` llega desde el cliente. RLS limita al propio registro |
| Eliminar cuenta | Fuera de alcance | — | — |
| Crear campaña | Listo | — | `finished not null default false`. Action con `authorize` y `institution_id` del server |
| Listar / ver campaña | Listo | — | Server Component + `queries/campaigns/list-campaigns.ts`, con el nombre de la institución. El estado sale de `finished` |
| Editar campaña | Listo | — | Guard de dueño y `finished = false` en el `WHERE` |
| Finalizar campaña | Listo | — | Guard de dueño y `finished = false` en el `WHERE`. `ConfirmDialog` |
| Eliminar campaña | Fuera de alcance | — | Se borró el stub. No hay policy DELETE en `campaigns` |
| Imágenes de campaña | Sin hacer | `supabase/migrations/20261117145838_remote_schema.sql:3-13` | Sin columna ni UI |
| Donar (donante logueado) | Listo | — | Ligada a la campaña vía `donations.campaign_id` (institución bloqueada en el drawer). El archivo sube directo a Storage con URL firmada (`createUploadUrls`); el bucket limita a 5 MB y PNG/JPG/WebP |
| Editar donación (donante) | Listo | — | Solo pendientes, con el estado esperado en el `WHERE` |
| Cancelar donación (donante) | Listo | — | Borra la donación propia mientras está pendiente. `ConfirmDialog` |
| Aceptar / rechazar / entregar | Listo | — | Estado esperado en el `WHERE` (sin carrera). Rechazar exige motivo. Las abiertas no se pueden rechazar |
| Tomar donaciones abiertas | Listo | — | — |
| Donar como invitado | Listo | — | RPC `create_guest_donation`: consume el token y crea donante y donación en una transacción (sin doble submit ni donante huérfano). El link vencido redirige a `/donate?expired=1`, que muestra un aviso. Remitente `onboarding@resend.dev`: solo entrega al mail dueño de la cuenta de Resend. Falta probar la API key de Resend |
| Directorio de instituciones | Listo | — | Excluye a la institución propia de la lista |
| Detalle de institución | Listo | — | — |
| Métricas de institución (drawer) | **Roto para demo** | `supabase/migrations/20261117160000_rls_policies.sql:112-118`, `actions/institutions/metrics.ts:114-145` | Ver §2 |
| Página `/dashboard/metrics` | Sin hacer | `app/dashboard/metrics/page.tsx` | Placeholder, fuera del menú |
| Donaciones de dinero / necesidades | Fuera de alcance | — | Se borraron los placeholders |
| Notificaciones | Sin hacer | `notifications`, `notification_reads` en el schema | Tablas y publicación realtime sin uso en la app |
| Botón "Descargar documentación" | Fuera de alcance | — | Se borró: el PDF no existía |

## 2. Métricas: problema y regla

**Problema actual.** El drawer se abre desde el directorio para cualquier institución y lee las
donaciones con el cliente del usuario. La RLS de `donations` solo deja ver las propias: un donante ve
las que hizo y una institución las que recibió. Por eso las métricas de otra institución salen
parciales o en 0. Y una institución no puede ver las suyas, porque el directorio la excluye. Además,
`actions/institutions/metrics.ts` cuenta mal:
- no cuenta `delivered`, así que los porcentajes no suman 100
- no cuenta el método `transfer`
- suma las donaciones rechazadas a "Total recaudado"
- es una lectura hecha como Server Action (R5)

**Regla:**
- **Métricas completas** (con montos): solo las ve una institución que mira **sus propias** métricas.
- **Métricas públicas:** las ve cualquier otro caso (un donante, u otra institución):
  - tasas de aceptación y rechazo
  - conteos por estado, categoría y método de entrega
  - **cantidad** de donaciones de dinero, sin montos

## 3. Guion de demo

Usuarios del seed (`npm run db:seed`), todos con password `demo1234`: `hogar@demo.donareasy.com`,
`comedor@demo.donareasy.com`, `lucia@demo.donareasy.com` y `martin@demo.donareasy.com`.

| # | Paso | Estado hoy |
|---|---|---|
| 1 | Hogar inicia sesión y crea una campaña | Listo |
| 2 | Lucía ve la campaña, toca "Donar" y dona con foto | Listo |
| 3 | Lucía abre las métricas públicas del Hogar en el directorio | Datos incorrectos (§2) |
| 4 | Hogar acepta y marca como entregada la donación | Listo |
| 5 | Hogar ve sus métricas completas | Sin hacer (§2) |
| 6 | Un invitado pide el link por mail (al de la cuenta de Resend) y dona | Listo. Falta probar la API key de Resend |

## 4. Cortes a cerrar para la demo

| Corte | Estado | Qué hacer |
|---|---|---|
| Métricas | Pendiente | Función `institution_public_metrics(p_institution_id)` `security definer`, con `search_path` vacío y `execute` solo para `authenticated`: devuelve únicamente conteos. Query `queries/institutions/get-institution-metrics.ts` que devuelve `full` (propia, bajo RLS, con montos de aceptadas y entregadas) o `public` (rpc). Route handler `app/api/institutions/[id]/metrics` para el drawer. Página `/dashboard/metrics` para la institución logueada, con ítem de menú solo para ese rol. Se borra `actions/institutions/metrics.ts` |
| Invitado | Hecho | — |
| Upload | Hecho | — |
| Limpieza | Hecho | — |

## 5. Estado de las capas respecto de `.claude/rules`

Campañas y donaciones (con el invitado) ya siguen `01-capas.md`. Instituciones, métricas y perfil
todavía leen por `app/api` → hooks → contexts, y sus actions no usan `authorize` ni `ServiceResult`.

## 6. Backlog de refactor (después de la demo)

1. Instituciones y perfil: contexts → Server Components + `queries/`. Hooks solo para lo que se
   refetchea en el cliente.
2. `components/auth-button.tsx` importa el cliente del server.
3. Datos: `status` como enum, `quantity` como entero, renombrar `dellivered_date` y corregir el
   default `'donnor'` de `roles.name`.
4. Tipos generados con `supabase gen types` en `lib/types/database.ts`.
5. Landing real y `metadata` en las páginas.

## 7. Alcance

Demo universitaria en localhost con un solo usuario: no hay producción ni usuarios reales, así que
no se contemplan concurrencia, carreras, idempotencia, rate limit, permisos de Storage ni retención.
