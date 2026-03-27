-- Migration: Add dedicated columns for order metadata
-- Run this in the Supabase SQL Editor

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Optional: Copy existing data from customer_name string-packing if needed
-- This is approximate since customer_name was packing "Name | 📝 [REGALO] ... | 📎 Comprobante ..."
-- But for now, we just want to enable future orders to use the new columns.
