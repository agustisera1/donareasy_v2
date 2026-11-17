# Donareasy

Plataforma de donaciones para Argentina que conecta donantes con instituciones.
Next.js (App Router) + Supabase + TanStack Query + shadcn/ui.

## Correr localmente

1. Crear `.env.local` con:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   ```

2. Instalar y levantar:

   ```bash
   npm install
   npm run dev   # http://localhost:3000
   ```

## Datos de demo

Las migraciones viven en `supabase/migrations/`. Con `SUPABASE_SERVICE_ROLE_KEY` en `.env`:

```bash
npm run db:reset   # borra datos de public (salvo roles), usuarios de Auth y adjuntos
npm run db:seed    # reset + 2 instituciones, 2 donantes, campañas y donaciones
```

### Usuarios de prueba

Contraseña de todas las cuentas: `demo1234`.

| Rol | Email | Perfil |
|---|---|---|
| Institución | `hogar@demo.donareasy.com` | Hogar Santa Rita (Córdoba) |
| Institución | `comedor@demo.donareasy.com` | Comedor Los Peques (La Plata) |
| Donante | `lucia@demo.donareasy.com` | Lucía Gómez (Córdoba) |
| Donante | `martin@demo.donareasy.com` | Martín Pérez (La Plata) |
