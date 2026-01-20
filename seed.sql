-- Script de seeding para la base de datos Donareasy
-- Fecha base: 19/01/2026

-- ============================================
-- CONFIGURACIÓN
-- ============================================

-- IDs de instituciones
-- 43b96603-4243-47ab-abf2-dec16504ecaa
-- c6204023-af3a-49f5-9525-2c8ed315ec2f

-- IDs de donantes (ya existen en la tabla donors)
-- User 3f7818a6-d551-4f01-82bd-50c38570c450 → Donor 5e9989de-c2b4-44c1-8a28-59cbbf61e243
-- User 3c6a74ca-de99-465d-b250-80ad4b11b3a6 → Donor e8259ed2-22b0-4a43-a42c-934a23772d9c

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para generar fechas aleatorias posteriores al 19/01/2026
CREATE OR REPLACE FUNCTION random_date_after_2026_01_19() RETURNS timestamp with time zone AS $$
BEGIN
  RETURN '2026-01-19'::date + (random() * 365)::integer * interval '1 day' + 
         (random() * 23)::integer * interval '1 hour' + 
         (random() * 59)::integer * interval '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Función para seleccionar un elemento aleatorio de un array
CREATE OR REPLACE FUNCTION random_array_element(arr text[]) RETURNS text AS $$
BEGIN
  RETURN arr[1 + floor(random() * array_length(arr, 1))::int];
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRANSACCIÓN PRINCIPAL
-- ============================================
-- Todo el seeding se ejecuta dentro de una transacción
-- Si algo falla, se hace ROLLBACK automáticamente
-- 
-- IMPORTANTE: 
-- - Si ocurre un error en cualquier punto, toda la transacción 
--   se revierte automáticamente y NO se insertará ningún dato.
-- - Esto previene datos inconsistentes en caso de fallos.
-- - Solo si todo se ejecuta correctamente, se hace COMMIT.
-- 
-- Para ejecutar: Copia y pega todo este script en el SQL Editor de Supabase

BEGIN;

-- ============================================
-- INSERCIÓN DE DONACIONES
-- ============================================

DO $$
DECLARE
  institution_1 uuid := '43b96603-4243-47ab-abf2-dec16504ecaa';
  institution_2 uuid := 'c6204023-af3a-49f5-9525-2c8ed315ec2f';
  donor_1 uuid := '5e9989de-c2b4-44c1-8a28-59cbbf61e243';
  donor_2 uuid := 'e8259ed2-22b0-4a43-a42c-934a23772d9c';
  
  -- Arrays para valores aleatorios
  delivery_methods text[] := ARRAY['pickup', 'shipment', 'agreement'];
  categories text[] := ARRAY['supplies', 'clothing', 'food', 'other'];
  institutions_array uuid[] := ARRAY[institution_1, institution_2];
  donors_array uuid[] := ARRAY[donor_1, donor_2];
  
  -- Fechas reutilizables
  dates_array timestamp with time zone[] := ARRAY[
    '2026-01-20 10:30:00+00'::timestamp with time zone,
    '2026-01-25 14:15:00+00'::timestamp with time zone,
    '2026-02-01 09:45:00+00'::timestamp with time zone,
    '2026-02-10 16:20:00+00'::timestamp with time zone,
    '2026-02-18 11:00:00+00'::timestamp with time zone,
    '2026-03-05 13:30:00+00'::timestamp with time zone,
    '2026-03-15 08:15:00+00'::timestamp with time zone,
    '2026-03-22 15:45:00+00'::timestamp with time zone,
    '2026-04-01 10:00:00+00'::timestamp with time zone,
    '2026-04-12 12:30:00+00'::timestamp with time zone,
    '2026-04-25 14:00:00+00'::timestamp with time zone,
    '2026-05-05 09:20:00+00'::timestamp with time zone,
    '2026-05-18 16:45:00+00'::timestamp with time zone,
    '2026-06-01 11:15:00+00'::timestamp with time zone,
    '2026-06-15 13:00:00+00'::timestamp with time zone
  ];
  
  -- Razones de cancelación
  cancellation_reasons text[] := ARRAY[
    'No cumple con los requisitos de la institución',
    'Producto en mal estado',
    'Cantidad insuficiente',
    'No se pudo coordinar la entrega',
    'Donación duplicada',
    'Producto vencido',
    'No corresponde a las necesidades actuales',
    'Falta de documentación requerida'
  ];
  
  -- Nombres de productos para donaciones
  product_names text[] := ARRAY[
    'Fideos de paquete',
    'Arroz integral',
    'Lentejas',
    'Aceite de girasol',
    'Leche en polvo',
    'Azúcar',
    'Harina',
    'Sal',
    'Café',
    'Yerba mate',
    'Conservas de tomate',
    'Atún en lata',
    'Arvejas enlatadas',
    'Maíz enlatado',
    'Jabón de tocador',
    'Shampoo',
    'Pasta dental',
    'Papel higiénico',
    'Detergente',
    'Lavandina'
  ];
  
  i integer;
  random_date timestamp with time zone;
  random_institution uuid;
  random_donor uuid;
  random_delivery text;
  random_category text;
  random_name text;
  random_reason text;
  image_name text;
  donation_id bigint;
BEGIN
  -- ============================================
  -- 40 DONACIONES PENDIENTES
  -- ============================================
  FOR i IN 1..40 LOOP
    random_institution := institutions_array[1 + floor(random() * array_length(institutions_array, 1))::int];
    random_donor := donors_array[1 + floor(random() * array_length(donors_array, 1))::int];
    random_delivery := delivery_methods[1 + floor(random() * array_length(delivery_methods, 1))::int];
    random_category := categories[1 + floor(random() * array_length(categories, 1))::int];
    random_name := product_names[1 + floor(random() * array_length(product_names, 1))::int];
    random_date := dates_array[1 + floor(random() * array_length(dates_array, 1))::int];
    image_name := 'donacion-' || floor(random() * 1000000)::text || '-' || floor(random() * 1000000)::text || '.jpg';
    
    INSERT INTO public.donations (
      date_created,
      name,
      amount,
      attachment_name,
      attachment_url,
      status,
      institution_id,
      donor_id,
      description,
      delivery_method,
      category
    ) VALUES (
      random_date,
      random_name || ' x' || (10 + floor(random() * 50))::text,
      NULL,
      image_name,
      'https://jimedbccoyzqwuqufero.supabase.co/storage/v1/object/public/donations/' || image_name,
      'pending',
      random_institution,
      random_donor,
      'Donación de ' || lower(random_name) || ' en buen estado para colaborar con la institución.',
      random_delivery::delivery_type,
      random_category::donation_type
    );
  END LOOP;
  
  -- ============================================
  -- 30 DONACIONES ACEPTADAS
  -- ============================================
  FOR i IN 1..30 LOOP
    random_institution := institutions_array[1 + floor(random() * array_length(institutions_array, 1))::int];
    random_donor := donors_array[1 + floor(random() * array_length(donors_array, 1))::int];
    random_delivery := delivery_methods[1 + floor(random() * array_length(delivery_methods, 1))::int];
    random_category := categories[1 + floor(random() * array_length(categories, 1))::int];
    random_name := product_names[1 + floor(random() * array_length(product_names, 1))::int];
    random_date := dates_array[1 + floor(random() * array_length(dates_array, 1))::int];
    image_name := 'donacion-' || floor(random() * 1000000)::text || '-' || floor(random() * 1000000)::text || '.jpg';
    
    INSERT INTO public.donations (
      date_created,
      date_accepted,
      name,
      amount,
      attachment_name,
      attachment_url,
      status,
      institution_id,
      donor_id,
      description,
      delivery_method,
      category
    ) VALUES (
      random_date - interval '5 days',
      random_date,
      random_name || ' x' || (10 + floor(random() * 50))::text,
      NULL,
      image_name,
      'https://jimedbccoyzqwuqufero.supabase.co/storage/v1/object/public/donations/' || image_name,
      'accepted',
      random_institution,
      random_donor,
      'Donación de ' || lower(random_name) || ' en buen estado para colaborar con la institución.',
      random_delivery::delivery_type,
      random_category::donation_type
    );
  END LOOP;
  
  -- ============================================
  -- 30 DONACIONES RECHAZADAS
  -- ============================================
  FOR i IN 1..30 LOOP
    random_institution := institutions_array[1 + floor(random() * array_length(institutions_array, 1))::int];
    random_donor := donors_array[1 + floor(random() * array_length(donors_array, 1))::int];
    random_delivery := delivery_methods[1 + floor(random() * array_length(delivery_methods, 1))::int];
    random_category := categories[1 + floor(random() * array_length(categories, 1))::int];
    random_name := product_names[1 + floor(random() * array_length(product_names, 1))::int];
    random_date := dates_array[1 + floor(random() * array_length(dates_array, 1))::int];
    random_reason := cancellation_reasons[1 + floor(random() * array_length(cancellation_reasons, 1))::int];
    image_name := 'donacion-' || floor(random() * 1000000)::text || '-' || floor(random() * 1000000)::text || '.jpg';
    
    INSERT INTO public.donations (
      date_created,
      date_cancelled,
      cancellation_reason,
      name,
      amount,
      attachment_name,
      attachment_url,
      status,
      institution_id,
      donor_id,
      description,
      delivery_method,
      category
    ) VALUES (
      random_date - interval '3 days',
      random_date,
      random_reason,
      random_name || ' x' || (10 + floor(random() * 50))::text,
      NULL,
      image_name,
      'https://jimedbccoyzqwuqufero.supabase.co/storage/v1/object/public/donations/' || image_name,
      'rejected',
      random_institution,
      random_donor,
      'Donación de ' || lower(random_name) || ' en buen estado para colaborar con la institución.',
      random_delivery::delivery_type,
      random_category::donation_type
    );
  END LOOP;
END $$;

-- ============================================
-- INSERCIÓN DE CAMPAÑAS
-- ============================================

DO $$
DECLARE
  institution_1 uuid := '43b96603-4243-47ab-abf2-dec16504ecaa';
  institution_2 uuid := 'c6204023-af3a-49f5-9525-2c8ed315ec2f';
  institutions_array uuid[] := ARRAY[institution_1, institution_2];
  
  -- Nombres de campañas
  campaign_types text[] := ARRAY[
    'Recolección de alimentos no perecederos',
    'Campaña de ropa de abrigo',
    'Recolección de útiles escolares',
    'Campaña de productos de higiene',
    'Recolección de medicamentos',
    'Campaña de juguetes',
    'Recolección de materiales de construcción',
    'Campaña de productos para bebés',
    'Recolección de libros',
    'Campaña de muebles',
    'Recolección de electrodomésticos',
    'Campaña de calzado',
    'Recolección de productos de limpieza',
    'Campaña de ropa de cama',
    'Recolección de herramientas',
    'Campaña de alimentos para mascotas',
    'Recolección de material médico',
    'Campaña de productos para adultos mayores',
    'Recolección de material deportivo',
    'Campaña de productos de cocina'
  ];
  
  -- Descripciones de campañas
  campaign_descriptions text[] := ARRAY[
    'Necesitamos alimentos no perecederos para ayudar a familias en situación de vulnerabilidad. Aceptamos arroz, fideos, aceite, conservas y productos enlatados.',
    'Buscamos ropa de abrigo en buen estado para el invierno. Aceptamos camperas, bufandas, guantes y gorros de todas las tallas.',
    'Recolectamos útiles escolares para niños y adolescentes. Necesitamos cuadernos, lápices, mochilas, cartucheras y material didáctico.',
    'Campaña para recolectar productos de higiene personal: jabón, shampoo, pasta dental, papel higiénico y toallas sanitarias.',
    'Necesitamos medicamentos con receta médica válida. Por favor, verificar fecha de vencimiento antes de donar.',
    'Recolectamos juguetes nuevos o en buen estado para niños de todas las edades. Priorizamos juguetes educativos.',
    'Buscamos materiales de construcción para refacciones: pintura, herramientas, tornillos, clavos y materiales de plomería.',
    'Campaña de productos para bebés: pañales, leche en polvo, mamaderas, ropa y accesorios en buen estado.',
    'Recolectamos libros en buen estado para nuestra biblioteca comunitaria. Aceptamos libros de todas las temáticas.',
    'Necesitamos muebles en buen estado: mesas, sillas, camas, armarios y estanterías para equipar espacios comunitarios.',
    'Campaña de electrodomésticos funcionales: heladeras, cocinas, microondas y otros electrodomésticos en buen estado.',
    'Recolectamos calzado nuevo o en buen estado de todas las tallas para niños, jóvenes y adultos.',
    'Buscamos productos de limpieza: detergente, lavandina, escobas, trapos y productos desinfectantes.',
    'Campaña de ropa de cama: sábanas, mantas, almohadas y frazadas en buen estado para familias necesitadas.',
    'Recolectamos herramientas manuales y eléctricas: martillos, destornilladores, taladros y herramientas de jardinería.',
    'Necesitamos alimentos para mascotas: comida seca y húmeda para perros y gatos de todas las edades.',
    'Campaña de material médico: vendas, gasas, termómetros y material descartable para nuestro dispensario.',
    'Recolectamos productos específicos para adultos mayores: bastones, andadores, productos de cuidado personal y medicamentos.',
    'Buscamos material deportivo: pelotas, raquetas, colchonetas y equipamiento deportivo en buen estado.',
    'Campaña de productos de cocina: ollas, sartenes, utensilios de cocina y vajilla para equipar comedores comunitarios.'
  ];
  
  -- Fechas de inicio (pueden repetirse)
  start_dates date[] := ARRAY[
    '2026-01-15'::date,
    '2026-01-20'::date,
    '2026-02-01'::date,
    '2026-02-10'::date,
    '2026-02-20'::date,
    '2026-03-01'::date,
    '2026-03-10'::date,
    '2026-03-20'::date,
    '2026-04-01'::date,
    '2026-04-15'::date
  ];
  
  -- Fechas de terminación (posteriores al 19/01/2026)
  termination_dates date[] := ARRAY[
    '2026-02-20'::date,
    '2026-03-01'::date,
    '2026-03-15'::date,
    '2026-03-30'::date,
    '2026-04-15'::date,
    '2026-04-30'::date,
    '2026-05-15'::date,
    '2026-05-30'::date,
    '2026-06-15'::date,
    '2026-06-30'::date,
    '2026-07-15'::date,
    '2026-07-30'::date,
    '2026-08-15'::date,
    '2026-08-30'::date,
    '2026-09-15'::date
  ];
  
  i integer;
  random_institution uuid;
  random_type text;
  random_description text;
  random_start_date date;
  random_termination_date date;
BEGIN
  FOR i IN 1..20 LOOP
    random_institution := institutions_array[1 + floor(random() * array_length(institutions_array, 1))::int];
    random_type := campaign_types[i];
    random_description := campaign_descriptions[i];
    random_start_date := start_dates[1 + floor(random() * array_length(start_dates, 1))::int];
    random_termination_date := termination_dates[1 + floor(random() * array_length(termination_dates, 1))::int];
    
    -- Asegurar que termination_date sea posterior a start_date
    IF random_termination_date <= random_start_date THEN
      random_termination_date := random_start_date + interval '30 days';
    END IF;
    
    INSERT INTO public.campaigns (
      start_date,
      termination_date,
      type,
      description,
      quantity,
      institution_id,
      finished
    ) VALUES (
      random_start_date,
      random_termination_date,
      random_type,
      random_description,
      NULL,
      random_institution,
      CASE WHEN random_termination_date < CURRENT_DATE THEN true ELSE false END
    );
  END LOOP;
END $$;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Contar donaciones por estado
DO $$
DECLARE
  pending_count integer;
  accepted_count integer;
  rejected_count integer;
  campaigns_count integer;
BEGIN
  SELECT COUNT(*) INTO pending_count FROM public.donations WHERE status = 'pending';
  SELECT COUNT(*) INTO accepted_count FROM public.donations WHERE status = 'accepted';
  SELECT COUNT(*) INTO rejected_count FROM public.donations WHERE status = 'rejected';
  SELECT COUNT(*) INTO campaigns_count FROM public.campaigns;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICACIÓN DE SEEDING';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Donaciones pendientes: %', pending_count;
  RAISE NOTICE 'Donaciones aceptadas: %', accepted_count;
  RAISE NOTICE 'Donaciones rechazadas: %', rejected_count;
  RAISE NOTICE 'Total donaciones: %', (pending_count + accepted_count + rejected_count);
  RAISE NOTICE 'Total campañas: %', campaigns_count;
  RAISE NOTICE '========================================';
  
  -- Validar que se insertaron los datos esperados
  IF pending_count < 40 THEN
    RAISE EXCEPTION 'Error: Se esperaban al menos 40 donaciones pendientes, pero se encontraron %', pending_count;
  END IF;
  
  IF accepted_count < 30 THEN
    RAISE EXCEPTION 'Error: Se esperaban al menos 30 donaciones aceptadas, pero se encontraron %', accepted_count;
  END IF;
  
  IF rejected_count < 30 THEN
    RAISE EXCEPTION 'Error: Se esperaban al menos 30 donaciones rechazadas, pero se encontraron %', rejected_count;
  END IF;
  
  IF campaigns_count < 20 THEN
    RAISE EXCEPTION 'Error: Se esperaban al menos 20 campañas, pero se encontraron %', campaigns_count;
  END IF;
  
  RAISE NOTICE '✓ Seeding completado exitosamente';
END $$;

-- Si llegamos aquí, todo salió bien - hacer COMMIT
COMMIT;

-- ============================================
-- LIMPIEZA DE FUNCIONES TEMPORALES
-- ============================================
-- Estas funciones se eliminan después del COMMIT
-- para no afectar la transacción

DROP FUNCTION IF EXISTS random_date_after_2026_01_19();
DROP FUNCTION IF EXISTS random_array_element(text[]);

-- ============================================
-- CONSULTAS DE VERIFICACIÓN FINAL
-- ============================================

-- Contar donaciones por estado
SELECT 
  status,
  COUNT(*) as cantidad
FROM public.donations
GROUP BY status
ORDER BY status;

-- Contar campañas por institución
SELECT 
  institution_id,
  COUNT(*) as cantidad_campanas
FROM public.campaigns
GROUP BY institution_id;

-- Contar donaciones por institución
SELECT 
  institution_id,
  COUNT(*) as cantidad_donaciones
FROM public.donations
GROUP BY institution_id;
