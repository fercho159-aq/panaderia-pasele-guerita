import type { APIRoute } from 'astro';
import { getSupabaseClient } from '@pasele-guerita/core';

export const GET: APIRoute = async () => {
    try {
        let supabaseUrl = '';
        let anonKey = '';

        try {
            // @ts-ignore
            if (import.meta.env.PUBLIC_SUPABASE_URL) supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
            // @ts-ignore
            if (import.meta.env.PUBLIC_SUPABASE_ANON_KEY) anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
        } catch (e) { }

        if (!supabaseUrl && process.env.PUBLIC_SUPABASE_URL) supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
        if (!anonKey && process.env.PUBLIC_SUPABASE_ANON_KEY) anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !anonKey) {
            console.error("Missing Supabase config for storefront data.");
            return new Response(JSON.stringify({ error: 'Supabase variables are missing' }), { status: 500 });
        }

        const supabase = getSupabaseClient(supabaseUrl as string, anonKey as string);

        const [flavorsRes, locationsRes] = await Promise.all([
            supabase.from('flavors').select('*').eq('active', true),
            supabase.from('locations').select('*')
        ]);

        if (flavorsRes.error) throw flavorsRes.error;
        if (locationsRes.error) throw locationsRes.error;

        // Map locations to match PickupLocation type exactly
        const mappedLocations = locationsRes.data.map((loc: any) => ({
            id: loc.id,
            name: loc.name,
            address: loc.address,
            days: loc.days,
            hours: loc.hours,
            type: loc.type,
            isSoldOut: loc.is_sold_out
        }));

        return new Response(JSON.stringify({ 
            flavors: flavorsRes.data, 
            locations: mappedLocations 
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        console.error("Storefront data fetch failed", e);
        return new Response(JSON.stringify({ error: 'Server error fetching data' }), { status: 500 });
    }
}
