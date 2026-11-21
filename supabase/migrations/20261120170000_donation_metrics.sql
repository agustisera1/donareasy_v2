-- Métricas de donaciones de una institución (y opcionalmente de una de sus campañas).
-- Cualquiera ve los conteos; los montos solo vuelven si quien llama es la institución dueña.
create or replace function public.donation_metrics(p_institution_id uuid, p_campaign_id uuid default null)
returns table (
  status text,
  category public.donation_type,
  delivery_method public.delivery_type,
  is_money boolean,
  donations bigint,
  amount numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    d.status,
    d.category,
    d.delivery_method,
    d.amount is not null,
    count(*),
    case
      when p_institution_id = (select private.current_institution_id())
        then coalesce(sum(d.amount), 0)
    end
  from public.donations d
  where d.institution_id = p_institution_id
    and (p_campaign_id is null or d.campaign_id = p_campaign_id)
  group by 1, 2, 3, 4
$$;

revoke execute on function public.donation_metrics from public, anon;
grant execute on function public.donation_metrics to authenticated;
