-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  start_date date NOT NULL,
  termination_date date,
  type text NOT NULL,
  description text NOT NULL,
  quantity text,
  institution_id uuid DEFAULT gen_random_uuid(),
  finished boolean,
  CONSTRAINT campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT campaigns_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.donations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  date_created timestamp with time zone NOT NULL DEFAULT now(),
  date_accepted timestamp with time zone,
  date_cancelled timestamp with time zone,
  cancellation_reason character varying,
  dellivered_date timestamp with time zone,
  name text,
  amount numeric,
  attachment_name text,
  donor_id uuid NOT NULL,
  attachment_url text NOT NULL,
  status text DEFAULT 'pending'::text,
  institution_id uuid NOT NULL,
  description text,
  delivery_method USER-DEFINED DEFAULT 'agreement'::delivery_type,
  category USER-DEFINED DEFAULT 'other'::donation_type,
  CONSTRAINT donations_pkey PRIMARY KEY (id),
  CONSTRAINT donations_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT donations_donor_id_fkey FOREIGN KEY (donor_id) REFERENCES public.donors(id)
);
CREATE TABLE public.donors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  lastname text NOT NULL,
  dni integer NOT NULL,
  address character varying NOT NULL,
  province text NOT NULL,
  city text NOT NULL,
  phone text NOT NULL,
  user_id uuid UNIQUE,
  CONSTRAINT donors_pkey PRIMARY KEY (id),
  CONSTRAINT donnors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_roles(user_id)
);
CREATE TABLE public.institutions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  director text NOT NULL,
  address character varying NOT NULL,
  province text NOT NULL,
  city text NOT NULL,
  phone text NOT NULL,
  foundation_date date DEFAULT now(),
  bank text,
  lore character varying,
  user_id uuid UNIQUE,
  CONSTRAINT institutions_pkey PRIMARY KEY (id),
  CONSTRAINT institutions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_roles(user_id)
);
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'donnor'::text,
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role_id uuid NOT NULL,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text NOT NULL UNIQUE,
  onboarding_complete boolean DEFAULT false,
  is_active boolean DEFAULT true,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);