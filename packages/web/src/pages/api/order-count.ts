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
            return new Response(JSON.stringify({ count: 0 }), { status: 200 });
        }

        const supabase = getSupabaseClient(supabaseUrl as string, anonKey as string);
        const today = new Date().toISOString().split('T')[0];
        const { count, error } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .neq('status', 'Cancelado')
            .gte('created_at', today);

        if (error) throw error;
        return new Response(JSON.stringify({ count: count ?? 0 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ count: 0 }), { status: 200 });
    }
}
