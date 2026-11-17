-- RLS por dueño para las features implementadas. Ref: Supabase "Row Level Security"
-- y "RLS performance recommendations" (security definer helpers, (select auth.uid())).

create schema if not exists private;

create or replace function private.current_donor_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.donors where user_id = (select auth.uid())
$$;

create or replace function private.current_institution_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.institutions where user_id = (select auth.uid())
$$;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
revoke all on function private.current_donor_id() from public, anon;
revoke all on function private.current_institution_id() from public, anon;
grant execute on function private.current_donor_id() to authenticated;
grant execute on function private.current_institution_id() to authenticated;

drop policy if exists "Users can manage campaigns" on public.campaigns;
drop policy if exists "Allow users to manipulate donations" on public.donations;
drop policy if exists "Enable read access to all users" on public.donors;
drop policy if exists "Enable read access to all users" on public.institutions;
drop policy if exists "Enable read access for all users" on public.roles;
drop policy if exists "Enable read access for all users" on public.user_roles;
drop policy if exists "Enable read access for all users" on public.users;
drop policy if exists "Service role inserts notifications" on public.notifications;
drop policy if exists "Service role updates notifications" on public.notifications;

-- guest_tokens: solo el servidor con service role (flujo de invitado), sin policies.
alter table public.guest_tokens enable row level security;

-- users: la fila la crea el trigger handle_new_auth_user.
create policy "users: lee la propia" on public.users
  for select to authenticated
  using (id = (select auth.uid()));

create policy "users: actualiza la propia" on public.users
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "roles: lectura" on public.roles
  for select to authenticated
  using (true);

create policy "user_roles: lee el propio" on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "user_roles: se asigna en el onboarding" on public.user_roles
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "institutions: lectura" on public.institutions
  for select to authenticated
  using (true);

create policy "institutions: crea la propia" on public.institutions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "institutions: actualiza la propia" on public.institutions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Un donante es visible para quien puede ver alguna de sus donaciones.
create policy "donors: lee el propio o el de donaciones visibles" on public.donors
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (select 1 from public.donations d where d.donor_id = donors.id)
  );

create policy "donors: crea el propio" on public.donors
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "donors: actualiza el propio" on public.donors
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "campaigns: lectura" on public.campaigns
  for select to authenticated
  using (true);

create policy "campaigns: la institución crea las suyas" on public.campaigns
  for insert to authenticated
  with check (institution_id = (select private.current_institution_id()));

create policy "campaigns: la institución actualiza las suyas" on public.campaigns
  for update to authenticated
  using (institution_id = (select private.current_institution_id()))
  with check (institution_id = (select private.current_institution_id()));

-- Donaciones abiertas (institution_id null): visibles y aceptables por cualquier institución.
create policy "donations: donante o institución destino" on public.donations
  for select to authenticated
  using (
    donor_id = (select private.current_donor_id())
    or institution_id = (select private.current_institution_id())
    or (institution_id is null and (select private.current_institution_id()) is not null)
  );

create policy "donations: el donante crea las suyas" on public.donations
  for insert to authenticated
  with check (donor_id = (select private.current_donor_id()));

create policy "donations: el donante edita las suyas" on public.donations
  for update to authenticated
  using (donor_id = (select private.current_donor_id()))
  with check (donor_id = (select private.current_donor_id()));

create policy "donations: la institución gestiona las suyas o abiertas" on public.donations
  for update to authenticated
  using (
    institution_id = (select private.current_institution_id())
    or (institution_id is null and (select private.current_institution_id()) is not null)
  )
  with check (institution_id = (select private.current_institution_id()));

create policy "donations: el donante borra las suyas" on public.donations
  for delete to authenticated
  using (donor_id = (select private.current_donor_id()));

-- A3 / P1: columnas de FK usadas en las policies.
create index if not exists donations_donor_id_idx on public.donations (donor_id);
create index if not exists donations_institution_id_idx on public.donations (institution_id);
create index if not exists campaigns_institution_id_idx on public.campaigns (institution_id);
