# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint check
npx tsc --noEmit  # Type check
```

There are no tests configured in this project.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Architecture Overview

**Donareasy** is a Next.js 16 (App Router) donation platform for Argentina connecting donors with institutions. The app uses Supabase for auth and database, TanStack Query for client-side caching, and shadcn/ui + Tailwind for styling.

### Route Structure

- `/` — Landing page
- `/auth` — Login, signup, password reset (Supabase cookie-based auth)
- `/onboarding` — Role selection (donor vs institution) and profile setup after signup
- `/dashboard` — Protected area with sidebar layout; contains `/campaign`, `/donations`, `/institutions`, `/metrics`
- `/donate` — Guest donation flow (token-based access)

### Data Flow Pattern

**Target state** (see `.claude/rules/01-capas.md`). Existing code still follows the older pattern
(GET route handlers in `app/api/` consumed by TanStack Query hooks); it migrates gradually.

1. **Queries** (`queries/<domain>/`) — reads. `import "server-only"`, called from Server Components. Return `ServiceResult<T>`.
2. **Server Actions** (`actions/<domain>/`) — writes only (`"use server"`). Authorize → validate → load → check rules → persist → revalidate. Return `ServiceResult<T>`.
3. **Route Handlers** (`app/api/`) — only when a real client consumer needs them (e.g. TanStack Query refetch). Never write on `GET`.
4. **Hooks** (`hooks/`) — TanStack Query wrappers for data the client must refetch on its own.
5. **Contexts** (`contexts/`) — UI state only (drawer open/close, selected item); never a copy of server data.

Reads do not go through Server Actions: Next dispatches them one at a time per client
(`node_modules/next/dist/docs/01-app/02-guides/server-actions.md`).

### Supabase Client Usage

- **Server components / Server Actions**: `import { createClient } from "@/lib/supabase/server"` — always create a new instance per function call (never store in a global)
- **Client components**: `import { createClient } from "@/lib/supabase/client"`
- **Proxy**: `lib/supabase/proxy.ts` for session refresh

### Key Shared Libraries

- `lib/types/` — All TypeScript types exported via `lib/types/index.ts`. Entities: Campaign, Donation, Donor, Institution, User, Role, UserRole, Good, DonationTypes
- `lib/validations/` — Zod schemas per domain (campaign, donation, donor, institution) + `index.ts` barrel. Same schema validates the form and the action
- `lib/utils.ts` — `cn()` for class merging, `formatDate()` (es-AR locale), `formatCurrency()` (ARS), `calculatePercentage()`
- `lib/constants.ts` — `deliveryMethodTranslations` and `categoryTranslations` for donation categories (supplies, clothing, food, other) and delivery methods (pickup, shipment, agreement)

### UI Conventions

- Components live in `components/` organized by feature (e.g., `components/campaigns/`, `components/sidebar/`, `components/onboarding/`)
- Base UI primitives in `components/ui/` (shadcn/ui, vendored: not edited by hand)
- TanStack Query global config: 2min staleTime, 5min gcTime, no refetch on window focus, 1 retry
- Toast notifications via `sonner`
- UI copy and user-facing error messages in Spanish (es-AR)
- Currency is always Argentine Pesos (ARS); dates use Spanish (es-AR) locale

## Implementar sobre la guía oficial

Toda solución que use una librería o plataforma (React, Next, Supabase, TanStack Query, React Hook
Form, una spec web) sigue el patrón que documenta su guía oficial. Aplica igual a un refactor y a la
feature chica que nace de arreglar otra cosa.

- **Antes de escribir código:** leer la sección de la guía que cubre el caso y nombrarla en la
  propuesta. Para Next, la guía es la instalada en `node_modules/next/dist/docs/` (ver `AGENTS.md`).
  Si la doc no lo dice, leer el código fuente o los tipos instalados en `node_modules`.
- **Si no hay patrón documentado, o la solución se aparta de él, es un parche:** frenar y consultarlo
  antes de implementarlo.
- **Al cerrar el cambio:** cada `useEffect`, estado manual o llamada imperativa nueva se justifica con
  la regla de `.claude/rules/` o la sección de la doc que la respalda. Para React: "Efectos y estado
  externo" en `04-frontend.md`.

## Reglas — `.claude/rules/`

**Antes de modificar código, leé las reglas de `.claude/rules/` de las áreas que toca la tarea y alineá el cambio con ellas.**

Un archivo por área. Las que tienen `paths:` se cargan solo al tocar archivos que matchean.

| Archivo | Cubre | Se carga |
|---|---|---|
| `01-capas.md` | Capas (queries, actions, route handlers), `ServiceResult`, `authorize`, forma de una action | `actions/`, `queries/`, `lib/`, `app/api/` |
| `02-api.md` | Criterios de contrato: errores, auth, validación, idempotencia, listas, HTTP | `actions/`, `queries/`, `app/api/`, `lib/shared/` |
| `03-datos.md` | Modelo de datos en PostgreSQL / Supabase: constraints, índices, tipos, RLS, migraciones | `DB.sql`, `seed.sql`, `supabase/`, `queries/`, `actions/` |
| `04-frontend.md` | Capas de UI, tokens, estados, efectos, TanStack Query, forms, confirmaciones, guidelines | `components/`, `app/**/*.tsx`, `contexts/`, `hooks/`, estilos |

**Código existente:** no todo cumple estas reglas todavía. Se aplican a lo que cambia en la tarea:
lo que el cambio no cumple se corrige; lo que ya estaba mal fuera del cambio se reporta como
"para otro branch: X".

## Comentarios y docs

- **Comentarios:** solo lo que no se deduce del código, máximo 2 líneas por bloque (lo aplica el hook
  `.claude/hooks/check-comments.mjs`).
- **Docs:** `README.md` (qué es, cómo correrlo) y `docs/known-limitations.md`. Una limitación nueva va
  a `docs/known-limitations.md`, no a un comentario.

## Hooks — `.claude/hooks/`

- `check-comments.mjs` (PreToolUse): rechaza bloques de comentario de más de 2 líneas.
- `check-types-lint.mjs` (Stop): si el turno editó `.ts`/`.tsx`, corre `tsc --noEmit` y eslint sobre
  los archivos editados.
- `check-reply-length.mjs` (Stop): respuestas de 5 líneas como máximo.
