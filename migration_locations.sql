-- ============================================================
-- EJECUTAR EN: Supabase → SQL Editor
-- Actualiza las ubicaciones de pickup al nuevo listado 2024
-- ============================================================

-- 1. Quitar el FK temporalmente para poder borrar ubicaciones con órdenes existentes
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_location_id_fkey;

-- 2. Borrar ubicaciones antiguas
DELETE FROM public.locations;

-- 3. Insertar las nuevas ubicaciones
INSERT INTO public.locations (id, name, address, days, hours, type, is_sold_out) VALUES
(
  'huitzizilin-dallas',
  'Huitzizilin Café — Dallas',
  '1836 W Jefferson Blvd #120, Dallas, TX 75208',
  ARRAY['Wednesday', 'Saturday'],
  'Mié 7am–4pm · Sáb 7am–3pm',
  'pickup',
  false
),
(
  'tutti-frutti-hurst',
  'Tutti Frutti — Hurst, TX',
  '394 E Pipeline Rd, Hurst, TX 76053',
  ARRAY['Wednesday'],
  'Mié 2pm–8pm',
  'pickup',
  false
),
(
  'irving-sat',
  'Irving',
  '6440 N MacArthur Blvd, Irving, TX 75039',
  ARRAY['Saturday'],
  'Sáb 10:50am',
  'pickup',
  false
),
(
  'carrollton-sat',
  'Carrollton',
  '2150 N Josey Ln, Carrollton, TX 75006',
  ARRAY['Saturday'],
  'Sáb 11:20am',
  'pickup',
  false
),
(
  'plano-sat',
  'Plano',
  '1001 14th St, Plano, TX 75074',
  ARRAY['Saturday'],
  'Sáb 12:10pm',
  'pickup',
  false
),
(
  'garland-sat',
  'Garland',
  '500 W Miller Rd, Garland, TX 75041',
  ARRAY['Saturday'],
  'Sáb 1:00pm',
  'pickup',
  false
),
(
  'special-coordination',
  'Lavon · Princeton · Wylie',
  'Selecciona esta opción y te haremos llegar los días donde podemos coordinar tu entrega.',
  ARRAY['Wednesday', 'Saturday'],
  'Coordinación personalizada',
  'delivery',
  false
);

-- 4. Restaurar el FK apuntando a la tabla actualizada
ALTER TABLE public.orders
  ADD CONSTRAINT orders_location_id_fkey
  FOREIGN KEY (location_id) REFERENCES public.locations(id);
