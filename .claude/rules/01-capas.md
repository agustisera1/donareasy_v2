---
paths:
  - "actions/**"
  - "queries/**"
  - "lib/**"
  - "app/api/**"
---

# Capas

Cómo se escribe, consume y revisa el código de servidor. Se mantiene la organización por capa
(`actions/`, `queries/`, `lib/`); lo que define esta regla es qué hace cada capa y de quién puede
depender. El ejemplo canónico es `acceptDonation`.

## El patrón

- **Lecturas y escrituras separadas (CQRS liviano):** toda lectura es una función de `queries/`
  que llama un Server Component; toda escritura es una Server Action de `actions/`. Las dos
  autorizan con `authorize` y devuelven `ServiceResult<T>`.
- **Las lecturas no son Server Actions.** Next despacha las actions de a una por cliente; para leer
  la guía indica un Server Component o un Route Handler
  (`node_modules/next/dist/docs/01-app/02-guides/server-actions.md`).
- **Data Access Layer:** `queries/` y `actions/` son los únicos que hablan con Supabase desde el
  server (`node_modules/next/dist/docs/01-app/02-guides/data-security.md`). La UI nunca importa
  `@/lib/supabase/server`.
- **Core puro:** `lib/types/`, `lib/validations/` y las reglas de dominio (`lib/policies/`) no hacen
  I/O ni importan Supabase o Next. El shell (queries, actions) les pregunta qué hacer.

## Estructura objetivo

```
actions/<dominio>/<verbo>.ts   "use server" — una escritura por archivo
queries/<dominio>/<lectura>.ts "server-only" — lecturas, las llaman Server Components
app/api/<recurso>/route.ts     solo si hay un consumidor cliente real (ver abajo)
lib/
  types/          tipos de dominio (objetivo: derivados de `supabase gen types`)
  validations/    schemas de zod — los usan el form y la action
  policies/       reglas de dominio puras (p. ej. `canAccept(donation, institution)`)
  auth/
    authorize.ts  gate único: sesión + rol + entidad del usuario
  shared/
    result.ts     ServiceResult, ErrorCode, fail()
    revalidate.ts revalidatePaths
    http.ts       toHttpResponse (mapper code → status)
  supabase/       clientes (server, client, proxy)
```

No toda capa necesita todos los archivos: si un dominio no tiene reglas propias, no tiene policy.

## Archivo por archivo

### `lib/shared/result.ts`

```ts
export type ErrorCode =
  | "VALIDATION" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND"
  | "CONFLICT" | "RATE_LIMITED" | "UNAVAILABLE" | "UNEXPECTED";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ErrorCode; error: string };

export const fail = (code: ErrorCode, error: string) => ({ ok: false, code, error }) as const;
```

### `lib/auth/authorize.ts`

Resuelve en un solo lugar lo que hoy cada action repite (`getUser` → `user_roles` → `roles` →
`institutions`/`donors`). Un permiso nombra la operación; el mapa de permisos dice qué rol la tiene.

```ts
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { fail, type ServiceResult } from "@/lib/shared/result";

const PERMISSIONS = {
  "donations:accept": ["institution"],
  "donations:create": ["donor"],
  "campaigns:manage": ["institution"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;
export type Actor = { userId: string; role: Role; entityId: string };

export async function authorize(permission: Permission): Promise<ServiceResult<Actor>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("UNAUTHORIZED", "Iniciá sesión para continuar");

  const actor = await findActor(supabase, user.id); // rol + id de institución o donante
  if (!actor) return fail("FORBIDDEN", "Tu cuenta no tiene un perfil asignado");
  if (!PERMISSIONS[permission].includes(actor.role))
    return fail("FORBIDDEN", "No tenés permiso para hacer esto");

  return { ok: true, data: actor };
}
```

### `lib/validations/donation.ts`

El mismo schema valida el form (feedback inmediato) y la action (la fuente de verdad: una Server
Action se puede llamar directo). El tipo del input se infiere, no se escribe a mano.

```ts
export const acceptDonationSchema = z.object({ donationId: z.int().positive() });
export type AcceptDonationInput = z.infer<typeof acceptDonationSchema>;
```

### `lib/policies/donation.ts`

```ts
import type { Donation } from "@/lib/types";

// Las abiertas (sin institución) las acepta cualquiera; las dirigidas, solo su destino.
export function isAddressedTo(donation: Pick<Donation, "institution_id">, institutionId: string) {
  return donation.institution_id === null || donation.institution_id === institutionId;
}
```

### `actions/donations/accept.ts`

Se lee de arriba abajo: autorizar → validar → cargar → chequear reglas → persistir → revalidar.

**Errores.** El input se valida con zod antes de tocar la DB, así que un error de Supabase es un bug:
se loguea completo y sale como `UNEXPECTED` con mensaje genérico. La excepción es lo que solo la DB
puede detectar (unicidad, carrera): se traduce a un código de dominio (`CONFLICT`).

```ts
"use server";
import { authorize } from "@/lib/auth/authorize";
import { isAddressedTo } from "@/lib/policies/donation";
import { fail, type ServiceResult } from "@/lib/shared/result";
import { revalidatePaths } from "@/lib/shared/revalidate";
import { createClient } from "@/lib/supabase/server";
import { acceptDonationSchema, type AcceptDonationInput } from "@/lib/validations";

export async function acceptDonation(input: AcceptDonationInput): Promise<ServiceResult<null>> {
  const auth = await authorize("donations:accept");
  if (!auth.ok) return auth;

  const parsed = acceptDonationSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const supabase = await createClient();
  const { donationId } = parsed.data;
  const institutionId = auth.data.entityId;

  const { data: donation, error: loadError } = await supabase
    .from("donations").select("id, status, institution_id").eq("id", donationId).maybeSingle();
  if (loadError) return unexpected("[acceptDonation] load", loadError);

  // Una donación dirigida a otra institución se lee igual que una inexistente.
  if (!donation || !isAddressedTo(donation, institutionId))
    return fail("NOT_FOUND", "Donación no encontrada");
  if (donation.status !== "pending")
    return fail("CONFLICT", "Solo se pueden aceptar donaciones pendientes");

  // El estado esperado va en el WHERE: si otra institución ganó la carrera, no actualiza nada.
  const { data: updated, error: updateError } = await supabase
    .from("donations")
    .update({ status: "accepted", date_accepted: new Date().toISOString(), institution_id: institutionId })
    .eq("id", donationId).eq("status", "pending")
    .select("id");
  if (updateError) return unexpected("[acceptDonation] update", updateError);
  if (updated.length === 0) return fail("CONFLICT", "La donación ya fue tomada por otra institución");

  revalidatePaths([{ path: "/dashboard/donations" }]);
  return { ok: true, data: null };
}
```

`unexpected(tag, error)` = `console.error(tag, error)` + `fail("UNEXPECTED", "No se pudo completar
la operación")`; vive en `lib/shared/result.ts`.

### `queries/donations/list-institution-donations.ts`

Sin `"use server"`: no es un endpoint, la llama un Server Component.

```ts
import "server-only";

export async function listInstitutionDonations(): Promise<ServiceResult<Donation[]>> {
  const auth = await authorize("donations:accept");
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donations").select("*")
    .or(`institution_id.eq.${auth.data.entityId},institution_id.is.null`)
    .order("date_created", { ascending: false })
    .limit(100);
  if (error) return unexpected("[listInstitutionDonations]", error);
  return { ok: true, data };
}
```

### `app/api/**/route.ts`

Existe solo si hay un consumidor cliente que no puede recibir el dato desde un Server Component
(p. ej. un hook de TanStack Query que refetchea por su cuenta). El handler llama a la misma función
de `queries/` y responde con `toHttpResponse(result)`; nunca arma su propio `NextResponse` de error.

```ts
export async function GET() {
  return toHttpResponse(await listInstitutionDonations());
}
```

### `lib/shared/revalidate.ts`

```ts
import { revalidatePath } from "next/cache";

export type RevalidationTarget = { path: string; type?: "layout" | "page" };

export function revalidatePaths(targets: RevalidationTarget[]) {
  for (const { path, type } of targets) revalidatePath(path, type);
}
```

## Consumidores

```tsx
// Server Component: lee de queries y pasa filas o null al componente (ver 04-frontend.md).
const result = await listInstitutionDonations();
return <DonationsTable rows={result.ok ? result.data : null} />;

// Client Component: escribe con la action y muestra el error tal cual (ya es friendly).
const result = await acceptDonation({ donationId });
if (!result.ok) toast.error(result.error);
```

## Checklist

Se aplica solo a lo que cambió en la tarea, antes de reportarla: lo que el cambio no cumple se
corrige sin reportarlo; lo que ya estaba mal fuera del cambio va como "para otro branch: X".

- **Solo `actions/**` lleva `"use server"`.** Verificación: grep `"use server"` fuera de `actions/` da 0.
- **Todo archivo de `queries/` y `lib/auth/` empieza con `import "server-only"`.** Verificación: grep.
- **`lib/types`, `lib/validations` y `lib/policies` son puros.** Verificación: sus imports no incluyen `@/lib/supabase`, `next/`, `@/actions` ni `@/queries`.
- **La UI no habla con Supabase desde el server.** Verificación: ningún archivo de `components/`, `hooks/` ni `contexts/` importa `@/lib/supabase/server`.
- **Cada action y query arranca con `authorize`.** Lo público (flujo de invitado con token) se marca como excepción explícita y valida su token en la primera línea.
- **Actions y queries nunca hacen `throw` ni devuelven `error.message`.** Verificación: grep `throw` y `error.message` en `actions/` y `queries/` da 0.
- **Toda action exportada recibe un único objeto de input y devuelve `ServiceResult`.** Verificación: firmas de `actions/**`.
- **`revalidatePath` solo se llama desde `lib/shared/revalidate.ts`.** Verificación: grep `revalidatePath(` fuera de ese archivo da 0.
- **Ningún Route Handler `GET` escribe ni arma su propio status.** Verificación: grep `status:` en `app/api/` da 0.
