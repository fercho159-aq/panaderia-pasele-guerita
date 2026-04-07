import type { APIRoute } from 'astro';
import { getSupabaseClient } from '@pasele-guerita/core';
import { cookieFlavors, breadFlavors } from '@pasele-guerita/core';

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
            // Return static fallback
            return new Response(JSON.stringify({ cookies: cookieFlavors, breads: breadFlavors, locations: [], dailyLimit: 0 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        const supabase = getSupabaseClient(supabaseUrl as string, anonKey as string);

        const [flavorsRes, locationsRes, settingsRes] = await Promise.all([
            supabase.from('flavors').select('*').eq('active', true).order('category'),
            supabase.from('locations').select('*'),
            supabase.from('flavors').select('id,stock').eq('id', 'daily-limit').single()
        ]);

        if (flavorsRes.error) throw flavorsRes.error;
        if (locationsRes.error) throw locationsRes.error;

        // Separate by category — only return IDs so frontend filters hardcoded lists
        const allDbFlavors = (flavorsRes.data || []).filter((f: any) => f.category !== 'setting');
        const dbCookies = allDbFlavors.filter((f: any) => !f.category || f.category === 'cookie');
        const dbBreads = allDbFlavors.filter((f: any) => f.category === 'bread');

        const cookies = dbCookies.length > 0 ? dbCookies : cookieFlavors;
        const breads = dbBreads.length > 0 ? dbBreads : breadFlavors;

        const dailyLimit = settingsRes.data?.stock ?? 0;

        // Map locations
        const mappedLocations = locationsRes.data.map((loc: any) => ({
            id: loc.id,
            name: loc.name,
            address: loc.address,
            days: loc.days,
            hours: loc.hours,
            type: loc.type,
            isSoldOut: loc.is_sold_out
        }));

        return new Response(JSON.stringify({ cookies, breads, locations: mappedLocations, dailyLimit }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error("Storefront data fetch failed, using fallback", e);
        return new Response(JSON.stringify({ cookies: cookieFlavors, breads: breadFlavors, locations: [], dailyLimit: 0 }), { status: 200 });
    }
}
