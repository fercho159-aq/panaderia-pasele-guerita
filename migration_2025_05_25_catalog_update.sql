-- =====================================================================
-- 2025-05-25 — Catalog update requested by client (Fer)
--
-- Changes:
--   1. Remove "Cacao con arándanos" (pan-cacao-arandanos) — out of menu
--   2. Add new bread: "Hogaza Golden Milk" — replaces the cacao slot ($12)
--   3. Add new cookie: "Durazno" (Spring special)
--   4. Add new cookie: "Chocomenta"
--   5. Update blueberry cookie name -> "Ube - Blueberry"
--
-- IMPORTANT: This script ONLY syncs IDs and metadata in Supabase so that
-- the admin dashboard can manage stock / active toggles for the new items.
-- The customer-facing name / description / image / price still live in
-- packages/core/src/flavors.config.ts (hardcoded).
--
-- Run order: this is idempotent — safe to re-run.
-- =====================================================================

-- 1) Remove the discontinued bread.
DELETE FROM public.flavors WHERE id = 'pan-cacao-arandanos';

-- 2) New bread: Hogaza Golden Milk.
INSERT INTO public.flavors (id, name, active, stock, category)
VALUES ('hogaza-golden-milk', 'Hogaza Golden Milk', true, 100, 'bread')
ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        active = EXCLUDED.active,
        category = EXCLUDED.category;

-- 3) New cookie: Durazno (Spring special).
INSERT INTO public.flavors (id, name, active, stock, category)
VALUES ('durazno', 'Durazno', true, 100, 'cookie')
ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        active = EXCLUDED.active,
        category = EXCLUDED.category;

-- 4) New cookie: Chocomenta.
INSERT INTO public.flavors (id, name, active, stock, category)
VALUES ('chocomenta', 'Chocomenta', true, 100, 'cookie')
ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        active = EXCLUDED.active,
        category = EXCLUDED.category;

-- 5) Update blueberry display name in the admin dashboard.
--    (Customer-facing label is also in flavors.config.ts; this keeps the
--     admin panel consistent so Maria sees the same label.)
UPDATE public.flavors
SET name = 'Ube - Blueberry'
WHERE id = 'blueberry';

-- Sanity check (optional — comment out before running in production).
-- SELECT id, name, category, active, stock FROM public.flavors ORDER BY category, name;
