---
paths:
  - "actions/**"
  - "queries/**"
  - "app/api/**"
  - "app/auth/**/route.ts"
  - "lib/shared/**"
  - "lib/auth/**"
---

# Contrato de API

Criterios para construir y revisar el contrato entre cliente y server: Server Actions (RPC), queries
que consumen los Server Components y Route Handlers. Las secciones de criterios no dependen del
proyecto.

**Cómo se usa:** los criterios se aplican solo a lo que cambió en la tarea, antes de reportarla. Cada
uno es **Base** (se cumple siempre) o **Condicional** (solo si se cumple su "Aplica cuando"); un
condicional se descarta con un motivo concreto del proyecto, para que la omisión sea una decisión y
no un olvido. Lo que el cambio no cumple se corrige sin reportarlo; lo que ya estaba mal fuera del
cambio va como "para otro branch: X".

`fail(code, msg)` abrevia `{ ok: false, code, error: msg }` (`lib/shared/result.ts`, ver `01-capas.md`).

---

## Común — todo transporte (Base)

- **C1. Un solo formato de error, sin detalles internos.** Todo error que sale del server tiene la
  misma forma: un `code` para la máquina y un mensaje en español para la persona. Un error inesperado
  se loguea completo y sale con un mensaje genérico. Verificación: grep de `error.message`,
  `String(error)`, `details:` y `err.stack` en el código que arma respuestas da 0.

  ```ts
  if (error) {
    console.error("[createDonation]", error);
    return fail("UNEXPECTED", "No se pudo registrar la donación");
  }
  ```

- **C2. Cada error lleva el código que corresponde a su causa.** Verificación: revisar cada
  `return fail(...)` contra la tabla.

  | Situación | Código |
  |---|---|
  | El input no cumple el schema | `VALIDATION` |
  | No hay sesión | `UNAUTHORIZED` |
  | Hay sesión pero no hay permiso (rol) | `FORBIDDEN` |
  | El recurso no existe, su id está mal formado, o es ajeno y no se quiere confirmar que existe | `NOT_FOUND` |
  | El **estado actual** del recurso impide la operación, o perdió una carrera | `CONFLICT` |
  | Superó la cota | `RATE_LIMITED` |
  | Una dependencia está caída y reintentar tiene sentido (Supabase Storage, Resend) | `UNAVAILABLE` |
  | Bug o falla no prevista | `UNEXPECTED` |

  ```ts
  if (!donation) return fail("NOT_FOUND", "Donación no encontrada");
  if (donation.status !== "pending") return fail("CONFLICT", "Solo se pueden aceptar donaciones pendientes");
  ```

- **C3. Autenticado por defecto y con ownership del recurso.** Cada entrada autoriza en su primera
  línea (`authorize`), y toda carga por id compara al dueño. Lo público se marca como excepción
  explícita. Verificación: cada action, query y handler arranca con el gate; cada carga por id de
  datos de un usuario va seguida de un chequeo de ownership.

  ```ts
  const auth = await authorize("campaigns:manage");
  if (!auth.ok) return auth;

  const campaign = await loadCampaign(supabase, input.campaignId);
  if (!campaign || campaign.institution_id !== auth.data.entityId)
    return fail("NOT_FOUND", "Campaña no encontrada");
  ```

- **C4. El input se valida con un schema en el borde, antes de tocar la DB.** Verificación: toda
  entrada que recibe datos hace `safeParse` antes del primer acceso a Supabase.

  ```ts
  const parsed = createCampaignSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);
  ```

- **C5. El input no trae valores que el server puede calcular o que lo identifican.** Dueño
  (`donor_id`, `institution_id` propio, `user_id`), estado inicial, fechas de alta/aceptación/entrega
  y totales los pone el server. Verificación: ningún schema de input tiene `donor_id`, `user_id`,
  `status`, `date_*`, `*_date` de sistema ni totales calculados.

  ```ts
  // ❌ { amount, donor_id, status: "pending", date_created }
  const input = z.object({ institutionId: z.uuid(), amount: z.number().positive() });
  const row = { ...input, donor_id: auth.data.entityId, status: "pending" };
  ```

- **C6. Naming consistente en todo el contrato.** El id del recurso tiene un solo nombre, el casing
  es uno solo por capa (input de actions en camelCase; filas de Supabase en snake_case) y las fechas
  viajan en ISO-8601. Verificación: grep de los nombres de id y de los args de los schemas de input.

- **C7. Una escritura crítica se puede reintentar sin duplicar ni mentir.** Una escritura es
  crítica cuando duplicarla cuesta plata o un cupo: acá, las donaciones (sobre todo las de dinero) y
  el alta de invitado. Hay dos formas válidas: una unicidad natural en la DB que además **reconoce el
  reintento** y devuelve el resultado original, o una clave de idempotencia. Verificación: para cada
  escritura crítica, ¿qué pasa si el mismo request llega dos veces?

  ```ts
  // Cliente: la clave se genera una vez por intención (al montar el form), no por intento.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  // Server: índice único en (donor_id, idempotency_key).
  const previous = await findDonationByKey(supabase, auth.data.entityId, input.idempotencyKey);
  if (previous) return { ok: true, data: previous };
  ```

- **C8. Toda lista que crece tiene tope, y la que crece sin fin, paginación.** El tope lo pone el
  server aunque el cliente no mande `limit`. Para listas donde se insertan datos mientras se pagina
  (donaciones, notificaciones) se usa cursor, no offset. Verificación: cada query que devuelve una
  lista tiene `.limit()`; el `limit` del cliente pasa por un clamp.

  ```ts
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);
  const { data } = await supabase.from("donations").select("*")
    .lt("date_created", input.before ?? new Date().toISOString())
    .order("date_created", { ascending: false }).limit(limit);
  return { items: data, nextCursor: data.length === limit ? data.at(-1)!.date_created : null };
  ```

## Server Actions y Route Handlers

### Base

- **R1. `GET` nunca escribe.** Las Server Actions son siempre `POST`, así que esto aplica a los
  route handlers (incluido `app/auth/confirm/route.ts`, donde el intercambio de token lo exige
  Supabase y es la excepción documentada). Verificación: ningún handler `GET` llama a un insert,
  update o delete de datos de la app.

- **R2. El status HTTP se asigna en un único lugar, a partir del `code`.** Todo route handler
  responde a través de ese mapper. Verificación: grep de `status:` fuera del mapper da 0; los
  handlers no arman su propio `NextResponse.json({ error })`.

  ```ts
  const STATUS: Record<ErrorCode, number> = {
    VALIDATION: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404,
    CONFLICT: 409, RATE_LIMITED: 429, UNAVAILABLE: 503, UNEXPECTED: 500,
  };
  export const toHttpResponse = <T>(r: ServiceResult<T>) =>
    Response.json(r, { status: r.ok ? 200 : STATUS[r.code] });
  ```

- **R3. Las entradas abusables tienen cota y responden `RATE_LIMITED`.** Login, signup, reset de
  password y todo lo que dispare un mail o un trabajo caro (acá: `request-guest-access`, que manda
  mail con Resend, y la subida a Storage). La cota va antes del trabajo caro y devuelve el mismo
  mensaje exista o no la cuenta (anti-enumeración). Verificación: cada entrada de ese tipo llama al
  rate limiter antes de la query o el envío. Las de auth propias de Supabase usan sus rate limits
  configurados en el proyecto.

- **R4. Todas las actions tienen la misma forma: un solo objeto de input y un `ServiceResult` de
  salida.** Con un objeto, sumar un campo no rompe a quien llama y el mismo schema valida el form y
  la action. Verificación: ninguna action exportada recibe más de un parámetro ni devuelve otra cosa
  que `ServiceResult`.

  ```ts
  export async function rejectDonation(input: RejectDonationInput): Promise<ServiceResult<null>>
  ```

- **R5. Una lectura no es una Server Action.** Next despacha las actions de a una por cliente; leer
  por una action serializa la pantalla. Se lee desde un Server Component (`queries/`) o, si hay un
  consumidor cliente real, desde un Route Handler. Verificación: ninguna función de `actions/` solo
  hace `select`. Ref: `node_modules/next/dist/docs/01-app/02-guides/server-actions.md`.

### Condicionales

| # | Criterio | Aplica cuando |
|---|---|---|
| R6 | Recursos con sustantivos en plural, anidados solo si dependen del padre (`/institutions/{id}/campaigns`), filtros por query string | Un Route Handler es una API de recursos, no un endpoint puntual |
| R7 | Versionado explícito (`/v1/...`) y cambios solo aditivos dentro de una versión | Hay clientes que no se despliegan junto al server (mobile, terceros) |
| R8 | API keys para server-to-server | Hay consumidores externos o servicios que llaman sin sesión de usuario |
| R9 | Cache HTTP (`Cache-Control`, `ETag`) | Hay lecturas públicas o costosas servidas por un Route Handler |

## Archivos subidos (Supabase Storage)

- **S1. El server valida tipo y tamaño antes de subir, y la ruta del objeto la arma el server.**
  Nunca se confía en el `name` ni el `type` que manda el cliente. Verificación: `actions/storage/*`
  hace `safeParse` del archivo (tipo MIME permitido, tamaño máximo) y construye la key con el id del
  actor.
- **S2. Un bucket con datos de usuarios es privado y se lee con signed URLs de vida corta.**
  Verificación: ningún `getPublicUrl` sobre un bucket que guarde comprobantes o datos personales.

