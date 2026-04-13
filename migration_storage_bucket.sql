-- ============================================================
-- EJECUTAR EN: Supabase -> SQL Editor
-- Crea el bucket "receipts" para almacenar comprobantes de pago
-- ============================================================

-- Crear bucket público para recibos
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir que cualquiera pueda subir archivos (la API usa service role key,
-- pero por si acaso también permitimos desde anon)
CREATE POLICY "Allow public upload to receipts"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'receipts');

-- Permitir lectura pública (para que el admin pueda ver los recibos)
CREATE POLICY "Allow public read receipts"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'receipts');
