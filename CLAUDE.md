# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint check
```

There are no tests configured in this project.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Architecture Overview

**Donareasy** is a Next.js 15 (App Router) donation platform for Argentina connecting donors with institutions. The app uses Supabase for auth and database, TanStack Query for client-side caching, and shadcn/ui + Tailwind for styling.

### Route Structure

- `/` — Landing page
- `/auth` — Login, signup, password reset (Supabase cookie-based auth)
- `/onboarding` — Role selection (donor vs institution) and profile setup after signup
- `/dashboard` — Protected area with sidebar layout; contains `/campaign`, `/donations`, `/institutions`, `/metrics`

### Data Flow Pattern

The app uses a layered pattern for data operations:

1. **API Routes** (`app/api/`) — GET endpoints that fetch data from Supabase (e.g., `/api/campaigns`, `/api/donations`, `/api/institutions`, `/api/user`, `/api/metrics`)
2. **Server Actions** (`actions/`) — `"use server"` functions for mutations (create/update/delete/status changes). Organized by domain: `actions/campaign/`, `actions/donations/`, `actions/institutions/`, `actions/user/`
3. **Hooks** (`hooks/`) — TanStack Query wrappers (`use-campaigns.ts`, `use-donations.ts`, `use-institutions.ts`, `use-user.ts`) that call API routes and manage cache
4. **Contexts** (`contexts/`) — React contexts (`campaigns-context.tsx`, `donations-context.tsx`, `institutions-context.tsx`) that combine hooks with UI state (drawer open/close, selected item)

### Supabase Client Usage

- **Server components / Server Actions**: `import { createClient } from "@/lib/supabase/server"` — always create a new instance per function call (never store in a global)
- **Client components**: `import { createClient } from "@/lib/supabase/client"`
- **Proxy**: `lib/supabase/proxy.ts` for session refresh

### Key Shared Libraries

- `lib/types/` — All TypeScript types exported via `lib/types/index.ts`. Entities: Campaign, Donation, Donor, Institution, User, Role, UserRole, Good, DonationTypes
- `lib/validations/` — Zod schemas per domain (campaign, donation, donor, institution) + `index.ts` barrel
- `lib/utils.ts` — `cn()` for class merging, `formatDate()` (es-AR locale), `formatCurrency()` (ARS), `calculatePercentage()`
- `lib/constants.ts` — `deliveryMethodTranslations` and `categoryTranslations` for donation categories (supplies, clothing, food, other) and delivery methods (pickup, shipment, agreement)

### UI Conventions

- Components live in `components/` organized by feature (e.g., `components/campaigns/`, `components/sidebar/`, `components/onboarding/`)
- Base UI primitives in `components/ui/` (shadcn/ui)
- TanStack Query global config: 2min staleTime, 5min gcTime, no refetch on window focus, 1 retry
- Toast notifications via `sonner`
- Currency is always Argentine Pesos (ARS); dates use Spanish (es-AR) locale
