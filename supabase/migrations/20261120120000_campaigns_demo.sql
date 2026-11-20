-- Campañas: estado explícito y dueño obligatorio. Donaciones: vínculo opcional con la campaña.
update public.campaigns set finished = false where finished is null;

alter table public.campaigns
  alter column finished set default false,
  alter column finished set not null,
  alter column institution_id drop default,
  alter column institution_id set not null;

alter table public.donations
  add column if not exists campaign_id uuid null
    references public.campaigns (id) on delete set null;

create index if not exists donations_campaign_id_idx on public.donations (campaign_id);
