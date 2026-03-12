import { getSupabaseClient } from './supabase';
import { PickupLocation } from './types';

// Let's create a singleton client instance assuming the env vars are available globally
// In a real SSR app like Astro, you'd pass the client down or rebuild it per request
// For client-side React components, we use the public anon key.
export const createBrowserClient = () => {
    // In Astro, env vars are often available via process.env or import.meta.env depending on the context
    let url = '';
    let anonKey = '';

    try {
        // @ts-ignore
        url = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
        // @ts-ignore
        anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
    } catch (e) {
        url = process.env.PUBLIC_SUPABASE_URL || '';
        anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || '';
    }

    if (!url || !anonKey) {
        throw new Error('Supabase variables are missing');
    }
    return getSupabaseClient(url, anonKey);
};

export async function fetchActiveFlavors() {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
        .from('flavors')
        .select('*')
        .eq('active', true);

    if (error) throw error;
    return data;
}

export async function fetchLocations() {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
        .from('locations')
        .select('*');

    if (error) throw error;

    // We need to map database columns 'is_sold_out' to 'isSoldOut' to match our TS Interface
    return data.map((loc: any): PickupLocation => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        days: loc.days,
        hours: loc.hours,
        type: loc.type,
        isSoldOut: loc.is_sold_out
    }));
}

export async function createOrder(orderData: any) {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

    if (error) throw error;
    return data;
}
