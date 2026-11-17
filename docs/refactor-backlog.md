# Features y backlog de refactor

Escaneo del código del 2026-11-16 (sin correr la app). Solo se refactoriza lo **desarrollado**; lo
**sin hacer** queda fuera de alcance.

## Inventario de features de negocio

| # | Feature | Estado | Qué hay / qué falta |
|---|---|---|---|
| 1 | Landing | Desarrollado | Hero con accesos a login, registro y donación como invitado |
| 2 | Auth (login, registro, recuperar y cambiar contraseña) | Desarrollado | Flujos de Supabase completos; el login redirige según `onboarding_complete` |
| 3 | Onboarding (elegir rol + perfil de donante o institución) | Desarrollado | `createDonor` / `createInstitution` crean el rol, el perfil y marcan `onboarding_complete`. `createUser()` es un stub sin uso |
| 4 | Perfil (ver, editar, cerrar sesión) | Desarrollado - incompleto | Ver y editar funcionan. Eliminar cuenta: `actions/user/delete.ts` es un stub sin UI |
| 5 | Campañas (institución crea, edita, finaliza; todos listan y ven) | Desarrollado - incompleto | Tabla con filtros, drawers, finalizar, y "Donar" que lleva a donaciones con la campaña preseleccionada. Eliminar: `actions/campaign/delete.ts` es un stub sin UI |
| 6 | Donaciones de donante (crear con adjunto, editar, ver; dirigidas o abiertas) | Desarrollado - incompleto | Completo salvo eliminar: `actions/donations/delete.ts` existe pero no hay UI que la use |
| 7 | Gestión de donaciones de institución (aceptar, rechazar con motivo, entregar) | Desarrollado | Incluye tomar donaciones abiertas |
| 8 | Directorio de instituciones (listar, ver detalle) | Desarrollado | Tabla con filtros y drawer de detalle |
| 9 | Métricas por institución (drawer) | Desarrollado | Estados, categorías, métodos de entrega y montos recaudados |
| 10 | Donación como invitado (`/donate`: pedir enlace por mail, donar con token) | Desarrollado | Token de 30 minutos enviado con Resend |
| 11 | Página de métricas (`/dashboard/metrics`) | Sin hacer | Placeholder; se sacó del menú. `app/api/metrics` consulta una tabla `metrics` que no figura en el schema |
| 12 | Donaciones de dinero / necesidades (`/dashboard/donations/money`, `/needs`) | Sin hacer | Placeholders sin links desde ningún lado |

Los stubs sin uso (11, 12, `createUser`, `deleteUser`, `deleteCampaign`, `app/api/metrics`) se
pueden borrar en el primer branch de refactor; si alguno se quiere implementar, es feature nueva.

## Backlog de refactor (solo features desarrolladas)

**0. Fundaciones (antes que cualquier feature).** `lib/shared/{result,http,revalidate}.ts`,
`lib/auth/authorize.ts` (hoy cada action repite ~50 líneas de `getUser` → rol → entidad),
`server-only`, tipos generados de Supabase, primeros primitivos en `components/common/`
(`FormField`, `ConfirmDialog`, `EmptyState`). Arreglar los 5 errores de lint actuales
(`use-mobile.ts`, `tailwind.config.ts`, …) para que el hook de Stop no moleste.

**Datos (transversal).** Schema en `supabase/migrations/` y RLS por dueño hechos. Falta: `status`
como enum, tipos generados (`supabase gen types`), RLS de `notifications` cuando se implemente.

| Feature | Hallazgos principales | Tamaño |
|---|---|---|
| 10 Invitado | **Prioridad por seguridad:** mail sin rate limit; service role key; `used_at` se chequea y después se actualiza (carrera); adjuntos con `getPublicUrl`; form de 489 líneas | M |
| 5 Campañas | Actions con `throw`/`error.message`, sin `ServiceResult` ni `revalidatePath`; lectura por route handler + context; tabla de 473 líneas. **Buen piloto del patrón** | M |
| 6 + 7 Donaciones | Lo mismo que campañas, más: transiciones de estado sin estado esperado en el `WHERE` (dos instituciones pueden aceptar a la vez); drawers de 729 y 651 líneas y tabla de 644; `watch()` y `useEffect` en drawers; dialogs → `ConfirmDialog` | L |
| 8 + 9 Instituciones y métricas | Route handler sin auth, sin manejo de error ni tope; métricas es una lectura hecha como Server Action → `queries/` | M |
| 3 + 4 Onboarding y perfil | `use-user` resuelve el rol en el cliente para los tres contexts; `use-update-user` con toasts y refetch manual; `edit-drawer` de 372 líneas | M |
| 2 Auth | Forms sin RHF + zod; `error.message` de Supabase directo al usuario | S |
| 1 Landing | Revisar contra `04-frontend.md` (tokens, `metadata`); probablemente poco | S |

Orden sugerido: 0 → Invitado → Campañas (piloto) → Donaciones → Instituciones y métricas →
Onboarding y perfil → Auth → Landing.
