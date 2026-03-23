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
            return new Response(JSON.stringify({ 
                cookies: cookieFlavors, 
                breads: breadFlavors,
                locations: [] 
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        const supabase = getSupabaseClient(supabaseUrl as string, anonKey as string);

        const [flavorsRes, locationsRes] = await Promise.all([
            supabase.from('flavors').select('*').eq('active', true).order('category'),
            supabase.from('locations').select('*')
        ]);

        if (flavorsRes.error) throw flavorsRes.error;
        if (locationsRes.error) throw locationsRes.error;

        // Separate by category, merging DB data with static descriptions as fallback
        const allDbFlavors = flavorsRes.data || [];
        
        const mergeWithStatic = (dbItems: any[], staticItems: any[]) =>
            dbItems.map((dbItem: any) => {
                const staticMatch = staticItems.find(s => s.id === dbItem.id);
                return { ...staticMatch, ...dbItem };
            });

        const dbCookies = allDbFlavors.filter((f: any) => !f.category || f.category === 'cookie');
        const dbBreads = allDbFlavors.filter((f: any) => f.category === 'bread');

        const cookies = dbCookies.length > 0 ? mergeWithStatic(dbCookies, cookieFlavors) : cookieFlavors;
        const breads = dbBreads.length > 0 ? mergeWithStatic(dbBreads, breadFlavors) : breadFlavors;

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

        return new Response(JSON.stringify({ cookies, breads, locations: mappedLocations }), { 
            status: 200, headers: { 'Content-Type': 'application/json' } 
        });

    } catch (e) {
        console.error("Storefront data fetch failed, using fallback", e);
        return new Response(JSON.stringify({ cookies: cookieFlavors, breads: breadFlavors, locations: [] }), { status: 200 });
    }
}
