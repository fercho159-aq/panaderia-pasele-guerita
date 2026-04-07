-- ============================================================
-- EJECUTAR EN: Supabase → SQL Editor
-- Agrega la fila especial para el límite diario de pedidos
-- ============================================================

INSERT INTO public.flavors (id, name, active, stock, category)
VALUES ('daily-limit', 'Límite Diario', false, 0, 'setting')
ON CONFLICT (id) DO NOTHING;
