-- ============================================================
-- EJECUTAR EN: Supabase -> SQL Editor
-- Borra TODOS los pedidos de prueba antes del lanzamiento
-- ⚠️  IRREVERSIBLE — correr solo una vez antes de producción
-- ============================================================

DELETE FROM public.orders;

-- Opcional: resetear el contador interno de IDs (si usas SERIAL/SEQUENCE)
-- ALTER SEQUENCE public.orders_id_seq RESTART WITH 1;

-- Verificar que quedó vacío:
SELECT COUNT(*) AS pedidos_restantes FROM public.orders;
