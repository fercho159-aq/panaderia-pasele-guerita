-- =========================================================
-- Migration: Add 'category' to flavors and insert bread types
-- Run this in your Supabase SQL Editor
-- =========================================================

-- 1. Add category column (default 'cookie' so existing rows are preserved)
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'cookie';
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS ingredients TEXT;
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS is_sourdough BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS is_gluten_free BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE flavors ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) NOT NULL DEFAULT 12.00;

-- 2. Update existing cookies to have correct category
UPDATE flavors SET category = 'cookie' WHERE category IS NULL OR category = '';

-- 3. Insert the 3 sourdough bread items
INSERT INTO flavors (name, active, category, description, ingredients, is_sourdough, is_gluten_free, price) VALUES
(
    'Hogaza Clásica',
    TRUE,
    'bread',
    'Nuestro pan de masa madre insignia. Corteza crujiente, miga abierta y un sabor ligeramente ácido que solo se logra con fermentación lenta de 48 horas.',
    'Harina de trigo de fuerza, agua, sal marina, masa madre activa. Sin conservadores, sin levadura comercial.',
    TRUE,
    FALSE,
    18.00
),
(
    'Pan de Centeno',
    TRUE,
    'bread',
    'Denso, nutritivo y con un perfil de sabor terroso característico. Alto en fibra y con un índice glucémico más bajo que el pan blanco tradicional.',
    'Harina de centeno integral, harina de trigo, agua, sal marina, semillas de alcaravea, masa madre activa.',
    TRUE,
    FALSE,
    20.00
),
(
    'Multigrano con Semillas',
    TRUE,
    'bread',
    'La opción más completa nutricionalmente. Una mezcla de granos y semillas que aporta textura, sabor y bienestar en cada rebanada.',
    'Harina integral, harina de avena, semillas de girasol, pepitas, linaza, ajonjolí, agua, sal, masa madre activa.',
    TRUE,
    FALSE,
    22.00
)
ON CONFLICT (name) DO NOTHING;
