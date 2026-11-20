-- Donación de invitado atómica: consumir el token, crear el donante y la donación en una transacción.
-- El `for update` serializa dos envíos del mismo link (D3). Ref: Supabase "Database Functions".
create or replace function public.create_guest_donation(
  p_token uuid,
  p_institution_id uuid,
  p_delivery_method text,
  p_category text,
  p_name text,
  p_description text,
  p_amount numeric,
  p_attachment_url text,
  p_attachment_name text
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token public.guest_tokens%rowtype;
  v_donor_id uuid;
  v_donation_id bigint;
begin
  select * into v_token from public.guest_tokens where token = p_token for update;

  if not found then
    raise exception 'guest_token_not_found' using errcode = 'GT001';
  end if;
  if v_token.used_at is not null then
    raise exception 'guest_token_used' using errcode = 'GT002';
  end if;
  if v_token.expires_at <= now() then
    raise exception 'guest_token_expired' using errcode = 'GT003';
  end if;

  update public.guest_tokens set used_at = now() where id = v_token.id;

  insert into public.donors (name, lastname, email, phone, is_guest, user_id)
  values (v_token.name, v_token.lastname, v_token.email, v_token.phone, true, null)
  returning id into v_donor_id;

  insert into public.donations
    (donor_id, institution_id, status, delivery_method, category, name, description, amount,
     attachment_url, attachment_name)
  values
    (v_donor_id, p_institution_id, 'pending', p_delivery_method, p_category, p_name, p_description,
     p_amount, p_attachment_url, p_attachment_name)
  returning id into v_donation_id;

  return v_donation_id;
end;
$$;

revoke execute on function public.create_guest_donation from public, anon, authenticated;
grant execute on function public.create_guest_donation to service_role;
