# Auditoría de features, guion de demo y backlog

Auditoría del 2026-11-17, hecha leyendo el código (sin correr la app). Reemplaza el escaneo del
2026-11-16, que había quedado viejo: era anterior a la estandarización de drawers, a las migraciones
con RLS y al seed, y tenía errores (por ejemplo, daba la landing por hecha).

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
| Donar (donante logueado) | A mitad | `actions/storage/upload.ts` | Ligada a la campaña vía `donations.campaign_id` (institución bloqueada en el drawer). Falta: el body de las Server Actions tiene un límite de 1 MB por defecto, así que fotos más grandes fallan |
| Editar donación (donante) | A mitad | `actions/donations/update.ts:72-90` | No chequea estado: se puede editar una donación aceptada o entregada |
| Eliminar donación (donante) | Sin hacer (UI) | `actions/donations/delete.ts` | La action existe, pero ninguna UI la llama. No chequea estado |
| Aceptar / rechazar / entregar | Listo | — | Sin estado esperado en el `WHERE` (carrera). `reject` no valida el estado en el server (`reject.ts:95-101`). Las abiertas no se pueden rechazar |
| Tomar donaciones abiertas | Listo | — | — |
| Donar como invitado | A mitad | `app/donate/[token]/page.tsx:16,34`, `actions/donations/create-guest.ts` | Chequea `used_at` pero no `expires_at` al abrir. `/donate?expired=1` no se lee. `used_at` se marca al final y sin guard, así que un doble submit genera dos donaciones. El donante invitado se crea antes del upload (puede quedar huérfano). Remitente `onboarding@resend.dev` (`request-guest-access.ts:51`): solo entrega al mail dueño de la cuenta de Resend |
| Directorio de instituciones | Listo | — | Excluye a la institución propia de la lista |
| Detalle de institución | Listo | — | — |
| Métricas de institución (drawer) | **Roto para demo** | `supabase/migrations/20261117160000_rls_policies.sql:112-118`, `actions/institutions/metrics.ts:114-145` | Ver §2 |
| Página `/dashboard/metrics` | Sin hacer | `app/dashboard/metrics/page.tsx` | Placeholder, fuera del menú |
| Donaciones de dinero / necesidades | Sin hacer | `app/dashboard/donations/{money,needs}/page.tsx` | Placeholders sin links |
| Notificaciones | Sin hacer | `notifications`, `notification_reads` en el schema | Tablas y publicación realtime sin uso en la app |
| Botón "Descargar documentación" | Roto | `components/documentation-button.tsx:6` | `/docs/documentacion.pdf` no existe en `public/` |

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
| 2 | Lucía ve la campaña, toca "Donar" y dona con foto | Listo, salvo fotos de más de 1 MB |
| 3 | Lucía abre las métricas públicas del Hogar en el directorio | Datos incorrectos (§2) |
| 4 | Hogar acepta y marca como entregada la donación | Listo |
| 5 | Hogar ve sus métricas completas | Sin hacer (§2) |
| 6 | Un invitado pide el link por mail (al de la cuenta de Resend) y dona | Funciona en el camino feliz. El token expirado no avisa |

## 4. Cortes a cerrar para la demo (plan, sin implementar)

Pasos previos:
- Recorrer el guion con la app corriendo para confirmar lo que esta auditoría dedujo del código: la
  foto de más de 1 MB, el `FileList` del invitado en la Server Action, el registro real y el mail de
  Resend.

| # | Corte | Qué hacer |
|---|---|---|
| c | Métricas | Función `institution_public_metrics(p_institution_id)` `security definer`, con `search_path` vacío y `execute` solo para `authenticated`: devuelve únicamente conteos. Query `queries/institutions/get-institution-metrics.ts` que devuelve `full` (propia, bajo RLS, con montos de aceptadas y entregadas) o `public` (rpc). Route handler `app/api/institutions/[id]/metrics` para el drawer. Página `/dashboard/metrics` para la institución logueada, con ítem de menú solo para ese rol. Se borra `actions/institutions/metrics.ts` |
| d | Invitado | La página del token valida `expires_at` y redirige a `/donate?expired=1`, que muestra un aviso. `create-guest` marca `used_at` con `.is("used_at", null)` antes de crear y aborta si no actualizó nada |
| e | Upload | `serverActions.bodySizeLimit` según la doc instalada de Next. Validar MIME y tamaño en el server con el schema de `lib/validations/donation.ts` |
| f | Limpieza | Borrar el stub `deleteUser`, `app/api/metrics` (consulta una tabla `metrics` inexistente), los placeholders money/needs, y el link al PDF |

## 5. Estado de las capas respecto de `.claude/rules`

El código existente todavía no sigue el patrón de `01-capas.md` (lecturas por `app/api` → hooks →
contexts, actions sin `authorize` ni `ServiceResult`). Se migra a medida que se toca cada feature.

## 6. Backlog de refactor (después de la demo)

1. Transiciones de donación con el estado esperado en el `WHERE`, y `reject` que valide el estado (D3).
2. Edición y borrado del donante restringidos a donaciones `pending`.
3. Drawer de donar: carga de instituciones en un efecto con el cliente de Supabase, `watch` y
   efectos con `setValue`; `components/auth-button.tsx` importa el cliente del server.
4. Contexts → Server Components + `queries/`. Hooks solo para lo que se refetchea en el cliente.
5. Datos: `status` como enum, `quantity` como entero y renombrar `dellivered_date`.
6. Tipos generados con `supabase gen types` en `lib/types/database.ts`.
7. Landing real y `metadata` en las páginas.

## 7. Limitaciones conocidas / fuera de alcance de la demo

Es una demo de un solo usuario, así que no se hace hardening de producción. Quedan registradas:
- El bucket `donations` se lee con `getPublicUrl` y sus policies permiten a cualquier usuario
  autenticado leer, sobrescribir o borrar cualquier objeto (S1/S2). Además, el bucket no se crea en
  ninguna migración.
- Sin rate limit en el mail del invitado (R3).
- `/api/donations` sin auth gate ni tope, y acepta cualquier `donor_id`.
- Los adjuntos PDF se aceptan, pero se renderizan con `next/image` y se ven rotos.
- Reemplazar un adjunto no borra el objeto anterior en Storage.
- `guest_tokens` crece sin retención (P5).
- `roles.name` tiene default `'donnor'` (typo).
