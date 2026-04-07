-- ============================================================
-- EJECUTAR EN: Supabase -> SQL Editor
-- Agrega los sabores de galleta que faltan en la tabla flavors:
--   - Blueberry (regular)
--   - Sugar Free de Platano y Chocolate
--   - Sugar Free de Platano y Nuez
--   - Sugar Free de Blueberry
-- ============================================================

INSERT INTO public.flavors (id, name, active, stock, category) VALUES
(
  'blueberry',
  'Blueberry',
  true,
  0,
  'cookie'
),
(
  'sugar-free-platano-choco',
  'Sugar Free de Platano y Chocolate',
  true,
  0,
  'cookie'
),
(
  'sugar-free-platano-nuez',
  'Sugar Free de Platano y Nuez',
  true,
  0,
  'cookie'
),
(
  'sugar-free-blueberry',
  'Sugar Free de Blueberry',
  true,
  0,
  'cookie'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name;

-- Asegurar que TODAS las galletas existentes tengan category = 'cookie'
UPDATE public.flavors SET category = 'cookie' WHERE category IS NULL;
