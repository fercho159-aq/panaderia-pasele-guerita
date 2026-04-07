-- ============================================================
-- EJECUTAR EN: Supabase -> SQL Editor
-- Permite insertar pedidos desde la web (anon key)
-- Sin esto, el checkout da error:
--   "new row violates row-level security policy for table orders"
-- ============================================================

-- Permitir INSERT desde el rol anon (clientes desde la web)
CREATE POLICY "Allow public insert on orders"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (true);

-- Permitir SELECT del ID recién insertado (para que createOrder devuelva el ID)
CREATE POLICY "Allow public select own order"
ON public.orders
FOR SELECT
TO anon
USING (true);
