-- Aprobación manual de instituciones y onboarding atómico.
-- Ref: Supabase "Database Functions" y "Row Level Security".

alter table public.institutions
  add column approved boolean not null default false;

update public.institutions set approved = true;

-- Una institución pendiente no tiene id efectivo: las policies de campaigns y donations la excluyen.
create or replace function private.current_institution_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.institutions
  where user_id = (select auth.uid()) and approved
$$;

drop policy if exists "institutions: lectura" on public.institutions;

create policy "institutions: lectura" on public.institutions
  for select to authenticated
  using (approved or user_id = (select auth.uid()));

create or replace function public.complete_donor_onboarding(
  p_name text,
  p_lastname text,
  p_dni integer,
  p_address text,
  p_province text,
  p_city text,
  p_phone text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role_id)
  select auth.uid(), id from public.roles where name = 'donor';

  insert into public.donors (name, lastname, dni, address, province, city, phone, user_id)
  values (p_name, p_lastname, p_dni, p_address, p_province, p_city, p_phone, auth.uid());

  update public.users set onboarding_complete = true where id = auth.uid();
end;
$$;

create or replace function public.complete_institution_onboarding(
  p_name text,
  p_director text,
  p_address text,
  p_province text,
  p_city text,
  p_phone text,
  p_foundation_date date,
  p_bank text,
  p_lore text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role_id)
  select auth.uid(), id from public.roles where name = 'institution';

  insert into public.institutions
    (name, director, address, province, city, phone, foundation_date, bank, lore, user_id)
  values
    (p_name, p_director, p_address, p_province, p_city, p_phone, p_foundation_date, p_bank, p_lore, auth.uid());

  update public.users set onboarding_complete = true where id = auth.uid();
end;
$$;

revoke all on function public.complete_donor_onboarding(text, text, integer, text, text, text, text) from public, anon;
revoke all on function public.complete_institution_onboarding(text, text, text, text, text, text, date, text, text) from public, anon;
grant execute on function public.complete_donor_onboarding(text, text, integer, text, text, text, text) to authenticated;
grant execute on function public.complete_institution_onboarding(text, text, text, text, text, text, date, text, text) to authenticated;
