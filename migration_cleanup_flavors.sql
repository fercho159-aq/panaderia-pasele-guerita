-- ============================================================
-- EJECUTAR EN: Supabase -> SQL Editor
-- Limpia duplicados y entradas incorrectas en flavors
-- Agrega el nuevo sabor Bicolor y actualiza precios
-- ============================================================

-- 1) Eliminar entradas duplicadas/incorrectas de GALLETAS
DELETE FROM public.flavors WHERE id IN (
  'classic-sourdough',
  'nuevo'
);
-- Eliminar duplicados por nombre (quedarse con el ID correcto)
DELETE FROM public.flavors WHERE name = 'Dragon' AND id != 'dragon-pitahaya';
DELETE FROM public.flavors WHERE name = 'Dragón' AND id != 'dragon-pitahaya';
DELETE FROM public.flavors WHERE name = 'Matcha' AND id != 'matcha-dark';
-- Eliminar el 4to sugar free si existe
DELETE FROM public.flavors WHERE id = 'sugar-free-platano' OR (name LIKE 'Sugar Free de Plátano' AND id NOT IN ('sugar-free-platano-choco', 'sugar-free-platano-nuez'));

-- 2) Eliminar entradas incorrectas de PANES
DELETE FROM public.flavors WHERE id IN (
  'hogaza-clasica',
  'multigrano',
  'pan-multigrano'
);
-- Eliminar duplicado de centeno
DELETE FROM public.flavors WHERE name LIKE '%Centeno%' AND id != 'pan-centeno-avena';
-- Eliminar "Hogaza Clásica" si tiene otro ID
DELETE FROM public.flavors WHERE name LIKE '%Hogaza Cl%' AND id != 'hogaza-natural';

-- 3) Reemplazar Mango y Coco por Bicolor con Frambuesa
DELETE FROM public.flavors WHERE id = 'mango-coco';
INSERT INTO public.flavors (id, name, active, stock, category)
VALUES ('bicolor-frambuesa', 'Bicolor con Frambuesa', true, 0, 'cookie')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category;

-- 4) Actualizar precio de Jalapeño Cheddar a $12
UPDATE public.flavors SET name = 'Jalapeño Cheddar' WHERE id = 'jalapeño-cheddar';

-- 5) Asegurar que todos tengan category correcta
UPDATE public.flavors SET category = 'cookie' WHERE category IS NULL;
