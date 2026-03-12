import type { APIRoute } from 'astro';
import { getSupabaseClient } from '@pasele-guerita/core';

export const GET: APIRoute = async ({ request, cookies }) => {
    // Auth Check
    if (!cookies.has('admin_token')) {
        return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    // Server client (must use Service Role Key to bypass RLS and read Orders)
    let supabaseUrl = '';
    let serviceKey = '';
    try {
        // @ts-ignore
        if (import.meta.env.PUBLIC_SUPABASE_URL) supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
        // @ts-ignore
        if (import.meta.env.SUPABASE_SERVICE_ROLE_KEY) serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    } catch (e) { }
    if (!supabaseUrl && process.env.PUBLIC_SUPABASE_URL) supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
    if (!serviceKey && process.env.SUPABASE_SERVICE_ROLE_KEY) serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = getSupabaseClient(supabaseUrl as string, serviceKey as string);

    try {
        if (type === 'flavors') {
            const { data } = await supabase.from('flavors').select('*').order('name');
            return new Response(JSON.stringify(data || []), { status: 200 });
        }
        if (type === 'locations') {
            const { data } = await supabase.from('locations').select('*').order('name');
            return new Response(JSON.stringify(data || []), { status: 200 });
        }
        if (type === 'orders') {
            const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
            return new Response(JSON.stringify(data || []), { status: 200 });
        }
        return new Response('Invalid type', { status: 400 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Server error fetching data' }), { status: 500 });
    }
}
