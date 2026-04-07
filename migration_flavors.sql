-- ============================================================
-- EJECUTAR EN: Supabase → SQL Editor
-- Agrega los sabores de Pan de Masa Madre a la tabla flavors
-- para que el toggle del admin los afecte en la web.
-- ============================================================

INSERT INTO public.flavors (id, name, active, stock, category) VALUES
(
  'hogaza-natural',
  'Natural',
  true,
  0,
  'bread'
),
(
  'pan-centeno-avena',
  'Centeno con corteza de avena',
  true,
  0,
  'bread'
),
(
  'pan-semillas',
  'Semillas',
  true,
  0,
  'bread'
),
(
  'pan-cacao-arandanos',
  'Cacao con arándanos',
  true,
  0,
  'bread'
),
(
  'jalapeño-cheddar',
  'Jalapeño Cheddar',
  true,
  0,
  'bread'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name;

-- Asegurar que las galletas existentes tengan category = 'cookie'
UPDATE public.flavors SET category = 'cookie' WHERE category IS NULL;
