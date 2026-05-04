-- ============================================================
-- EJECUTAR EN: Supabase -> SQL Editor
-- Agrega columna amount_paid para rastrear anticipos
-- ============================================================

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2) DEFAULT 0;

-- Verificar:
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'amount_paid';
