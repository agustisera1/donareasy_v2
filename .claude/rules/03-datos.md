---
paths:
  - "DB.sql"
  - "seed.sql"
  - "supabase/**"
  - "queries/**"
  - "actions/**"
  - "lib/types/**"
---

# Datos / persistencia

Criterios para construir y revisar el modelo de datos en PostgreSQL (Supabase): constraints,
índices, tipos, RLS y dónde vive el schema. Las secciones de criterios no dependen del proyecto. Lo
propio de este repo está al final, en **En este repo**.

**Cómo se usa:** los criterios se aplican solo a lo que cambió en la tarea, antes de reportarla. Cada
uno es **Base** (se cumple siempre) o **Condicional** (solo si se cumple su "Aplica cuando"); un
condicional se descarta con un motivo concreto del proyecto, para que la omisión sea una decisión y
no un olvido. Lo que el cambio no cumple se corrige sin reportarlo; lo que ya estaba mal fuera del
cambio va como "para otro branch: X".

**Cómo se mide un índice:** `EXPLAIN ANALYZE` sobre datos de volumen realista y después de
`ANALYZE`. Con 20 filas el planner hace seq scan aunque el índice exista: el veredicto sale de leer
la consulta contra el índice, el plan lo confirma. Ref: [PG 11.12][pg-examine].

---

## Modelo (Base)

- **D1. Un índice de performance se justifica por el costo que evita, no por existir la
  consulta.** Hace falta cuando, sin él, la consulta recorre **toda** la tabla (su costo crece con el
  total, no con lo que devuelve) y corre en un camino frecuente, como la carga de una pantalla. Si un
  índice existente ya reduce la consulta a un puñado de filas, ordenarlas en memoria no cuesta y no
  hace falta otro. Verificación: para cada consulta del alcance, nombrar qué recorre sin índice y si
  ese costo crece con el total. Ref: [PG 11.3][pg-multi].

  ```sql
  -- donations WHERE institution_id = $1 ORDER BY date_created DESC LIMIT 20
  -- ✅ (institution_id, date_created DESC): sin él recorre las donaciones de todas las instituciones
  -- ❌ además un índice solo en (institution_id): es prefijo del anterior
  ```

- **D2. Ningún índice sobra.** Cada índice tiene la justificación de D1 o respalda un constraint.
  Un índice que es prefijo de otro es redundante, y cada índice cuesta en cada escritura.
  Verificación: para cada índice, nombrar la consulta o el constraint que lo usa.

- **D3. Las invariantes las garantiza la base, no un chequeo previo en el código.** Unicidad,
  existencia, rango y estados válidos se declaran como `UNIQUE`, FK, `CHECK` o un `enum`. Un `select`
  seguido de un `insert` pierde contra dos requests concurrentes; un cambio de estado lleva el
  estado esperado en el `WHERE`. Verificación: para cada regla "no puede haber dos X", "X debe
  existir" o "X solo pasa de A a B", señalar el constraint o el `WHERE` que la sostiene.
  Ref: [PG 5.5][pg-constraints].

  ```sql
  -- ❌ status text DEFAULT 'pending'  → admite cualquier string
  CREATE TYPE donation_status AS ENUM ('pending', 'accepted', 'rejected', 'delivered');
  ALTER TABLE donations ADD CONSTRAINT donations_amount_positive CHECK (amount IS NULL OR amount > 0);
  ```

  ```ts
  // ✅ transición atómica: si otro request ya la aceptó, no actualiza nada
  .update({ status: "accepted" }).eq("id", id).eq("status", "pending").select("id")
  ```

- **D4. El schema vive en el repo y se aplica con un comando, separado del seed.** Migraciones
  versionadas en `supabase/migrations/` (CLI de Supabase: `supabase migration new`, `supabase db
  push`); lo que el dashboard cambia a mano se trae con `supabase db diff`. El seed solo inserta datos
  y la app funciona sin él. Verificación: todo cambio de tabla, índice, policy o función tiene su
  migración; ningún objeto existe solo porque alguien lo creó en el dashboard. Ref: [Supabase —
  Database migrations][sb-migrations].

- **D5. Cada dato se guarda con el tipo que lo modela.** Instantes: `timestamptz`; fechas de
  calendario sin hora: `date`. Plata (ARS): `numeric(12,2)`, nunca `float` ni `money`. Cantidades:
  enteros, no `text`. Verificación: revisar los tipos de cada columna del alcance. Ref: [PG wiki —
  Don't Do This][pg-dont].

- **D6. Los tipos de TypeScript salen del schema.** `supabase gen types typescript` genera
  `lib/types/database.ts`; los tipos de dominio de `lib/types/` se derivan de él
  (`Tables<"donations">`, `Pick`, `Omit`) en vez de escribirse a mano. Verificación: ningún tipo de
  fila de `lib/types/` duplica a mano columnas de una tabla. Ref: [Supabase — Generating
  types][sb-types].

## Autorización en la base (Base)

- **A1. RLS habilitado en toda tabla del schema `public`.** Con la publishable key, el cliente del
  browser llega directo a PostgREST: sin RLS, cualquiera con sesión lee y escribe toda la tabla, no
  importa lo que hagan las actions. Verificación: `select relname from pg_class where relrowsecurity
  = false` sobre `public` da 0. Ref: [Supabase — Row Level Security][sb-rls].

- **A2. Las policies repiten la regla de ownership de `authorize` (defensa en profundidad).** Una
  policy por operación (`select`, `insert`, `update`, `delete`) y por rol, con `auth.uid()` envuelto
  en `(select auth.uid())` para que se evalúe una vez por consulta. Verificación: cada tabla del
  alcance tiene sus policies en una migración y cada `using`/`with check` compara contra el dueño.

  ```sql
  create policy "institución lee sus donaciones" on donations for select to authenticated
  using (institution_id in (select id from institutions where user_id = (select auth.uid())));
  ```

- **A3. Las columnas usadas en policies están indexadas.** Una policy es un `WHERE` que se agrega a
  cada consulta. Verificación: cada columna comparada en un `using` tiene índice (aplica D1).
  Ref: [Supabase — RLS performance][sb-rls-perf].

- **A4. La service role key nunca llega al cliente y se usa solo donde no hay usuario.** Flujo de
  invitado, jobs, webhooks. Verificación: grep de `SERVICE_ROLE` fuera de `lib/supabase/` y de
  `process.env` sin prefijo `NEXT_PUBLIC_` en código cliente.

## PostgreSQL (Base)

- **P1. Toda FK tiene un índice en la columna que referencia.** Postgres no lo crea solo, y sin él
  cada `DELETE` del padre recorre la tabla hija. Verificación: cada FK tiene un índice (o una PK) cuya
  primera columna es la de la FK.

- **P2. En un índice compuesto, primero las columnas con igualdad, después una con rango u
  orden.** Más de tres columnas rara vez rinde. Verificación: el orden de columnas del índice contra
  el `WHERE` y el `ORDER BY` de la consulta. Ref: [PG 11.3][pg-multi].

- **P3. Un índice parcial solo se usa si el `WHERE` de la consulta implica su predicado
  literalmente.** Con un parámetro (`status <> $1`) el planner no puede probarlo y no lo usa.
  Ref: [PG 11.8][pg-partial].

  ```sql
  CREATE INDEX donations_pending_idx ON donations (date_created) WHERE status = 'pending';
  ```

- **P4. La unicidad compara lo que el dominio considera igual.** Si dos valores distintos en bytes
  son el mismo para el negocio (`A@x.com` y `a@x.com`), se normaliza antes de guardar con un `CHECK`
  que lo garantice, o el `UNIQUE` va sobre la expresión. Ref: [PG 11.7][pg-expr].

  ```sql
  CREATE UNIQUE INDEX users_email_lower ON users (lower(email));
  ```

### Condicionales

- **P5. Una tabla que solo crece tiene retención.** Aplica a tablas de eventos, logs o tokens de
  invitado. Se define cuándo una fila deja de servir y quién la borra (`pg_cron`, una función
  programada). Verificación: existe el job o una decisión documentada en
  `docs/known-limitations.md` de no hacerlo.

- **P6. Una referencia que la FK no puede expresar declara quién mantiene la consistencia.** Aplica
  cuando un id apunta a otro sistema (un objeto de Storage, `auth.users`). Lo que una FK resolvería
  con `ON DELETE` se decide y se implementa en la action que borra. Verificación: para cada
  referencia, ¿qué pasa con lo que apunta al recurso borrado?

---

## En este repo

**Dónde vive cada cosa (objetivo):** migraciones en `supabase/migrations/`, aplicadas con
`supabase db push`; seed en `supabase/seed.sql`; tipos generados en `lib/types/database.ts`.

**Estado actual:** `DB.sql` es un dump de referencia ("for context only, not meant to be run"), sin
índices propios, RLS ni policies versionadas, y puede estar desactualizado respecto de la base real
(p. ej. `donations.institution_id` figura `NOT NULL`, pero el código trata donaciones abiertas con
`null`). Pasar a migraciones (D4) es el primer paso del refactor de datos; hasta entonces, ante una
duda sobre el schema, confirmar contra la base y no contra `DB.sql`.

| Criterio | Ref |
|---|---|
| Ejemplos canónicos | Pendiente: se completa a medida que el refactor deja referencias |

[pg-examine]: https://www.postgresql.org/docs/current/using-explain.html
[pg-multi]: https://www.postgresql.org/docs/current/indexes-multicolumn.html
[pg-partial]: https://www.postgresql.org/docs/current/indexes-partial.html
[pg-expr]: https://www.postgresql.org/docs/current/indexes-expressional.html
[pg-constraints]: https://www.postgresql.org/docs/current/ddl-constraints.html
[pg-dont]: https://wiki.postgresql.org/wiki/Don%27t_Do_This
[sb-migrations]: https://supabase.com/docs/guides/deployment/database-migrations
[sb-types]: https://supabase.com/docs/guides/api/rest/generating-types
[sb-rls]: https://supabase.com/docs/guides/database/postgres/row-level-security
[sb-rls-perf]: https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations
