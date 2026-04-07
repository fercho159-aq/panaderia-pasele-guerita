import type { APIRoute } from 'astro';
import { getSupabaseClient } from '@pasele-guerita/core';

export const POST: APIRoute = async ({ request }) => {
    try {
        const orderData = await request.json();

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
            return new Response(JSON.stringify({ error: 'Server misconfiguration' }), { status: 500 });
        }

        const supabase = getSupabaseClient(supabaseUrl as string, serviceKey as string);

        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select('id')
            .single();

        if (error) throw error;

        return new Response(JSON.stringify({ id: data.id }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        console.error('Order creation failed:', e);
        return new Response(JSON.stringify({ error: e?.message || 'Error creating order' }), { status: 500 });
    }
}
