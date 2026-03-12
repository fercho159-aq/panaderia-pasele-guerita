-- ==========================================
-- SUPABASE SCHEMA - PÁSELE GÜERITA V3
-- ==========================================

-- 1. Flavors/Inventory Table
CREATE TABLE IF NOT EXISTS public.flavors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    stock INTEGER DEFAULT 100 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Initial Flavors
INSERT INTO public.flavors (id, name, active, stock) VALUES
('choco-nuts', 'Choco Nuts', true, 100),
('matcha', 'Matcha', true, 100),
('dragon', 'Dragón', true, 100),
('classic', 'Classic Sourdough', true, 100)
ON CONFLICT (id) DO NOTHING;

-- 2. Locations Table
CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    days TEXT[] NOT NULL,
    hours TEXT NOT NULL,
    type TEXT NOT NULL,
    is_sold_out BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Initial Locations
INSERT INTO public.locations (id, name, address, days, hours, type, is_sold_out) VALUES
('pos-1', 'Bishop Arts District (POS)', '400 N Bishop Ave, Dallas, TX', ARRAY['Saturday'], '9:00 AM - 1:00 PM', 'pos', false),
('pos-2', 'Deep Ellum Market (POS)', '2800 Main St, Dallas, TX', ARRAY['Wednesday'], '10:00 AM - 2:00 PM', 'pos', false),
('pickup-1', 'White Rock Lake (Pickup)', '8300 E Lawther Dr, Dallas, TX', ARRAY['Saturday'], '8:30 AM - 12:30 PM', 'pickup', false),
('pickup-2', 'Victory Park (Pickup)', '2500 Victory Ave, Dallas, TX', ARRAY['Wednesday', 'Saturday'], '11:00 AM - 3:00 PM', 'pickup', false),
('del-1', 'Uptown Area (Delivery)', 'Zip Codes: 75204, 75201', ARRAY['Wednesday'], '3:00 PM - 6:00 PM', 'delivery', false),
('del-2', 'Oak Lawn (Delivery)', 'Zip Codes: 75219', ARRAY['Wednesday'], '1:00 PM - 4:00 PM', 'delivery', false),
('del-3', 'Highland Park (Delivery)', 'Zip Codes: 75205', ARRAY['Saturday'], '2:00 PM - 5:00 PM', 'delivery', false),
('del-4', 'Preston Hollow (Delivery)', 'Zip Codes: 75225', ARRAY['Saturday'], '10:00 AM - 2:00 PM', 'delivery', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    location_id TEXT REFERENCES public.locations(id) NOT NULL,
    pickup_day TEXT NOT NULL,
    box_size INTEGER NOT NULL,
    flavors_selected JSONB NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configure RLS (Row Level Security)
-- Allow anonymous read access for locations and flavors (for the storefront checkout)
ALTER TABLE public.flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for Storefront (Public access)
CREATE POLICY "Allow public read-only access to flavors" ON public.flavors FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Allow public to insert orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Policies for Admin Dashboard (Authenticated users)
CREATE POLICY "Allow authenticated users full access to flavors" ON public.flavors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to locations" ON public.locations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
