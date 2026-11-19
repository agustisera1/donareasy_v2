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
| Login | Listo | `components/login-form.tsx` | — |
| Registro | Listo | `components/sign-up-form.tsx` | — |
| Confirmación de mail | Listo | `app/auth/confirm/route.ts` | El link se abre en el mismo navegador del registro (PKCE) |
| Recuperar / cambiar contraseña | A mitad | `components/forgot-password-form.tsx:36` | El `redirectTo` no pasa por `/auth/confirm`: el `code` no se canjea y `updateUser` falla sin sesión |
| Logout | Listo | `components/sidebar/app-sidebar.tsx:73-80` | — |
| Onboarding (rol + perfil) | A mitad | `actions/user/create.ts` | Hace 4 escrituras sin atomicidad. Si falla después del insert en `user_roles` (UNIQUE), el usuario queda trabado. Solo `/dashboard` chequea `onboarding_complete` (`app/dashboard/page.tsx`), así que el resto de las rutas del dashboard entra sin onboarding |
| Aprobación de instituciones | Sin hacer | `components/onboarding/role-switch.tsx:44-47` | La UI promete revisión de un administrador, pero no hay columna, rol admin ni flujo |
| Perfil (ver y editar) | Listo | `components/sidebar/profile-drawer.tsx`, `edit-drawer.tsx` | `userId` llega desde el cliente. RLS limita al propio registro |
| Eliminar cuenta | Sin hacer | `actions/user/delete.ts` | Stub sin `"use server"` y sin UI |
| Crear campaña | **Roto para demo** | `actions/campaign/create.ts:54-61`, `components/campaigns/campaigns-data-table.tsx:97` | No setea `finished` y la columna no tiene default, así que queda `null`. El botón "Donar" solo aparece con `finished === false`: **una campaña nueva no se puede donar** |
| Listar / ver campaña | Listo | `app/api/campaigns/route.ts`, `view-campaign-drawer.tsx` | El drawer dice "Campaña activa" según `termination_date`, no según `finished` (`:31-33`) |
| Editar campaña | Listo | `actions/campaign/update.ts` | El server no valida que la campaña no esté finalizada (solo la UI) |
| Finalizar campaña | Listo | `actions/campaign/finish.ts:66-72` | Sin guard `finished = false` en el `WHERE` |
| Eliminar campaña | Sin hacer | `actions/campaign/delete.ts` | Stub. Tampoco hay policy DELETE en `campaigns` |
| Imágenes de campaña | Sin hacer | `supabase/migrations/20261117145838_remote_schema.sql:3-13` | Sin columna ni UI |
| Donar (donante logueado) | A mitad | `components/donations/create-donation-drawer.tsx:57`, `actions/donations/create.ts` | **La donación no queda ligada a la campaña:** no existe `donations.campaign_id` y el drawer descarta el `campaign_id` de la URL. Además, el body de las Server Actions tiene un límite de 1 MB por defecto, así que fotos más grandes fallan |
| Editar donación (donante) | A mitad | `actions/donations/update.ts:72-90` | No chequea estado: se puede editar una donación aceptada o entregada |
| Eliminar donación (donante) | Sin hacer (UI) | `actions/donations/delete.ts` | La action existe, pero ninguna UI la llama. No chequea estado |
| Aceptar / rechazar / entregar | Listo | `actions/donations/{accept,reject,deliver}.ts` | Sin estado esperado en el `WHERE` (carrera). `reject` no valida el estado en el server (`reject.ts:95-101`). Las abiertas no se pueden rechazar |
| Tomar donaciones abiertas | Listo | `actions/donations/accept.ts` | — |
| Donar como invitado | A mitad | `app/donate/[token]/page.tsx:16,34`, `actions/donations/create-guest.ts` | Chequea `used_at` pero no `expires_at` al abrir. `/donate?expired=1` no se lee. `used_at` se marca al final y sin guard, así que un doble submit genera dos donaciones. El donante invitado se crea antes del upload (puede quedar huérfano). Remitente `onboarding@resend.dev` (`request-guest-access.ts:51`): solo entrega al mail dueño de la cuenta de Resend |
| Directorio de instituciones | Listo | `app/api/institutions/route.ts`, `contexts/institutions-context.tsx:58-60` | Excluye a la institución propia de la lista |
| Detalle de institución | Listo | `components/institutions/view-institution-drawer.tsx` | — |
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
| 1 | Hogar inicia sesión y crea una campaña | Se crea, pero sin "Donar" (§1, crear campaña) |
| 2 | Lucía ve la campaña, toca "Donar" y dona con foto | Corta en el paso 1. Además, la donación no queda ligada a la campaña y las fotos de más de 1 MB fallan |
| 3 | Lucía abre las métricas públicas del Hogar en el directorio | Datos incorrectos (§2) |
| 4 | Hogar acepta y marca como entregada la donación | Listo |
| 5 | Hogar ve sus métricas completas | Sin hacer (§2) |
| 6 | Un invitado pide el link por mail (al de la cuenta de Resend) y dona | Funciona en el camino feliz. El token expirado no avisa |

## 4. Cortes a cerrar para la demo (plan, sin implementar)

Pasos previos:
- Recorrer el guion con la app corriendo para confirmar lo que esta auditoría dedujo del código: la
  foto de más de 1 MB, el `FileList` del invitado en la Server Action, el registro real y el mail de
  Resend.
- Armar las fundaciones mínimas de `.claude/rules/01-capas.md` (`lib/shared/{result,revalidate,http}.ts`
  y `lib/auth/authorize.ts`), solo las que usen estos cambios.

| # | Corte | Qué hacer |
|---|---|---|
| a | Campaña nueva sin "Donar" | Migración: backfill `finished = false` y después `not null default false`. `createCampaign` al patrón: input único validado, `authorize("campaigns:manage")` y `institution_id` puesto por el server. El drawer de vista usa `finished` |
| b | Donación sin campaña | Migración: `donations.campaign_id uuid null references campaigns on delete set null` + índice. `createDonation` acepta `campaignId` y valida que la campaña exista, esté activa y sea de la institución destino. El drawer conserva la campaña preseleccionada y la vista la muestra. El seed vincula parte de las donaciones |
| c | Métricas | Función `institution_public_metrics(p_institution_id)` `security definer`, con `search_path` vacío y `execute` solo para `authenticated`: devuelve únicamente conteos. Query `queries/institutions/get-institution-metrics.ts` que devuelve `full` (propia, bajo RLS, con montos de aceptadas y entregadas) o `public` (rpc). Route handler `app/api/institutions/[id]/metrics` para el drawer. Página `/dashboard/metrics` para la institución logueada, con ítem de menú solo para ese rol. Se borra `actions/institutions/metrics.ts` |
| d | Invitado | La página del token valida `expires_at` y redirige a `/donate?expired=1`, que muestra un aviso. `create-guest` marca `used_at` con `.is("used_at", null)` antes de crear y aborta si no actualizó nada |
| e | Upload | `serverActions.bodySizeLimit` según la doc instalada de Next. Validar MIME y tamaño en el server con el schema de `lib/validations/donation.ts` |
| f | Limpieza | Borrar los stubs `deleteCampaign`, `deleteUser` y `createUser`, `app/api/metrics` (consulta una tabla `metrics` inexistente), los placeholders money/needs, y el link al PDF |

## 5. Estado de las capas respecto de `.claude/rules`

El patrón objetivo de `01-capas.md` todavía no existe en el código:
- No hay `queries/`, `lib/shared/`, `lib/auth/` ni `lib/policies/`.
- Todas las lecturas pasan por `app/api` (GET) → hooks de TanStack → contexts que guardan datos del
  server (04-frontend lo prohíbe).
- Hay lecturas directas a Supabase desde la UI: `create-donation-drawer.tsx`, con el cliente del
  browser, y `app/donate/[token]/page.tsx`, con el cliente admin.
- Las actions reciben argumentos posicionales, devuelven `{ success, error }`, hacen `throw` y
  exponen `error.message`. Cada una repite la cadena `getUser → user_roles → roles → entidad`.
- Los route handlers arman su propio `NextResponse` con `details: error.message`, sin auth gate y sin
  `.limit()`.
- El rol se resuelve en el cliente (`hooks/use-user.ts`). El proxy solo chequea sesión.

## 6. Backlog de refactor (después de la demo)

1. Transiciones de donación con el estado esperado en el `WHERE`, y `reject` que valide el estado (D3).
2. Edición y borrado del donante restringidos a donaciones `pending`.
3. Contexts → Server Components + `queries/`. Hooks solo para lo que se refetchea en el cliente.
4. Onboarding atómico (función en la DB o transacción) y gate de onboarding en el layout del dashboard.
5. Datos: `status` como enum, `quantity` como entero, `finished` not null (si no se hizo en §4) y
   renombrar `dellivered_date`.
6. Tipos generados con `supabase gen types` en `lib/types/database.ts`.
7. Landing real y `metadata` en las páginas.

## 7. Limitaciones conocidas / fuera de alcance de la demo

Es una demo de un solo usuario, así que no se hace hardening de producción. Quedan registradas:
- El bucket `donations` se lee con `getPublicUrl` y sus policies permiten a cualquier usuario
  autenticado leer, sobrescribir o borrar cualquier objeto (S1/S2). Además, el bucket no se crea en
  ninguna migración.
- Sin rate limit en el mail del invitado (R3).
- `/api/institutions` y `/api/donations` sin auth gate ni tope. `/api/donations` acepta cualquier
  `donor_id`.
- La RLS de `user_roles` permite insertar cualquier `role_id`: cualquiera puede darse rol institución.
- Los adjuntos PDF se aceptan, pero se renderizan con `next/image` y se ven rotos.
- Reemplazar un adjunto no borra el objeto anterior en Storage.
- `guest_tokens` crece sin retención (P5).
- `roles.name` tiene default `'donnor'` (typo) y `campaigns.institution_id` tiene default
  `gen_random_uuid()`.
