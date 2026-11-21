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
| Métricas de institución (drawer) | Listo | — | Ver §2 |
| Métricas de campaña (drawer) | Listo | — | Acción "Ver métricas" en la tabla de campañas. Ver §2 |
| Página `/dashboard/metrics` | Listo | — | Métricas completas de la institución logueada; ítem de menú solo para ese rol. Un donante que entra a mano vuelve a `/dashboard` |
| Donaciones de dinero / necesidades | Fuera de alcance | — | Se borraron los placeholders |
| Notificaciones | Sin hacer | `notifications`, `notification_reads` en el schema | Tablas y publicación realtime sin uso en la app |
| Botón "Descargar documentación" | Fuera de alcance | — | Se borró: el PDF no existía |

## 2. Métricas: regla e implementación

**Regla** (aplica igual a instituciones y a campañas):
- **Métricas completas** (con lo recaudado): solo las ve la institución dueña.
- **Métricas públicas:** las ve cualquier otro caso (un donante, u otra institución):
  - tasa de aceptación
  - conteos por estado (y por categoría y método de entrega en instituciones)
  - **cantidad** de donaciones de dinero, sin montos

**Implementación.** La función SQL `donation_metrics(p_institution_id, p_campaign_id)`
(`security definer`) agrega las donaciones y devuelve montos solo si quien consulta es la dueña.
Las queries de `queries/metrics/` la llaman y los drawers las consumen por
`app/api/{institutions,campaigns}/[id]/metrics`. Lo recaudado suma aceptadas y entregadas.

## 3. Guion de demo

Usuarios del seed (`npm run db:seed`), todos con password `demo1234`: `hogar@demo.donareasy.com`,
`comedor@demo.donareasy.com`, `lucia@demo.donareasy.com` y `martin@demo.donareasy.com`.

| # | Paso | Estado hoy |
|---|---|---|
| 1 | Hogar inicia sesión y crea una campaña | Listo |
| 2 | Lucía ve la campaña, toca "Donar" y dona con foto | Listo |
| 3 | Lucía abre las métricas públicas del Hogar en el directorio | Listo |
| 4 | Hogar acepta y marca como entregada la donación | Listo |
| 5 | Hogar ve sus métricas completas | Listo |
| 6 | Un invitado pide el link por mail (al de la cuenta de Resend) y dona | Listo. Falta probar la API key de Resend |

## 4. Cortes a cerrar para la demo

| Corte | Estado | Qué hacer |
|---|---|---|
| Métricas | Hecho | — |
| Invitado | Hecho | — |
| Upload | Hecho | — |
| Limpieza | Hecho | — |

## 5. Estado de las capas respecto de `.claude/rules`

Campañas, donaciones (con el invitado) y métricas ya siguen `01-capas.md`. Instituciones y perfil
todavía leen por `app/api` → hooks → contexts, y sus actions no usan `authorize` ni `ServiceResult`.

## 6. Backlog de refactor (después de la demo)

1. Instituciones y perfil: contexts → Server Components + `queries/`. Hooks solo para lo que se
   refetchea en el cliente.
2. `components/auth-button.tsx` importa el cliente del server.
3. Datos: `status` como enum, `quantity` como entero, renombrar `dellivered_date` y corregir el
   default `'donnor'` de `roles.name`.
4. Tipos generados con `supabase gen types` en `lib/types/database.ts`.
5. Landing real y `metadata` en las páginas.
6. Lint: `hooks/use-mobile.ts` hace setState en un efecto (error) y `components/common/data-table.tsx`
   tiene un warning.

## 7. Alcance

Demo universitaria en localhost con un solo usuario: no hay producción ni usuarios reales, así que
no se contemplan concurrencia, carreras, idempotencia, rate limit, permisos de Storage ni retención.
