-- Insertar solo los sabores faltantes con las columnas que SÍ existen en tu base de datos actual
-- (id, name, active, stock, category)

INSERT INTO public.flavors (id, name, active, stock, category)
VALUES
  ('fresa-coco', 'Fresa y Coco', true, 100, 'cookie'),
  ('mango-coco', 'Mango y Coco', true, 100, 'cookie'),
  ('abuelita', 'Chocolate Abuelita Mexicano', true, 100, 'cookie'),
  ('matcha-dark', 'Matcha y Chocolate Oscuro', true, 100, 'cookie'),
  ('dragon-pitahaya', 'Dragon', true, 100, 'cookie'),
  ('sugar-free-platano', 'Sugar Free de Plátano', true, 100, 'cookie')
ON CONFLICT (id) DO NOTHING;
