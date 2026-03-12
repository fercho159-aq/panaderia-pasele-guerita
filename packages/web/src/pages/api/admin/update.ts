import type { APIRoute } from 'astro';
import { getSupabaseClient } from '@pasele-guerita/core';

export const POST: APIRoute = async ({ request, cookies }) => {
    // Auth Check
    if (!cookies.has('admin_token')) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const body = await request.json();
        const { type, id, status } = body;

        // We MUST use the Service Role Key here because our RLS blocks anonymous updates.
        // The service role key bypasses RLS securely on the server.
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

        if (!serviceKey) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY required for updates.");
            return new Response(JSON.stringify({ error: 'Server misconfiguration: Missing Service Role Key' }), { status: 500 });
        }

        const supabaseAdmin = getSupabaseClient(supabaseUrl as string, serviceKey as string);

        if (type === 'flavor') {
            const { error } = await supabaseAdmin.from('flavors').update({ active: status }).eq('id', id);
            if (error) throw error;
        } else if (type === 'location') {
            const { error } = await supabaseAdmin.from('locations').update({ is_sold_out: status }).eq('id', id);
            if (error) throw error;
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        console.error("Update failed", e);
        return new Response(JSON.stringify({ error: 'Server error updating data' }), { status: 500 });
    }
}
