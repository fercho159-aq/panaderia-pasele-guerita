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

        // === Server-side validation: reject orders containing inactive products ===
        // Frontends can serve stale data (CDN caches, old browser tabs, etc.), so we
        // must re-check against the live DB right before inserting. Without this,
        // users with a cached page can place orders for items the admin already
        // turned OFF.
        try {
            let selected: Record<string, number> = {};
            const raw = orderData.flavors_selected;
            if (typeof raw === 'string') {
                let parsed: any = raw;
                while (typeof parsed === 'string') { parsed = JSON.parse(parsed); }
                selected = parsed || {};
            } else if (raw && typeof raw === 'object') {
                selected = raw;
            }

            const requestedIds = Object.keys(selected).filter(id => (selected[id] || 0) > 0);
            if (requestedIds.length > 0) {
                const { data: activeFlavors, error: flavorsErr } = await supabase
                    .from('flavors')
                    .select('id, name, active')
                    .in('id', requestedIds);

                if (flavorsErr) {
                    console.error('Flavor validation query failed:', flavorsErr);
                    // Fail closed — if we can't verify, reject the order rather than
                    // letting an unverified order through.
                    return new Response(JSON.stringify({
                        error: 'No pudimos verificar la disponibilidad. Intenta de nuevo en un momento.'
                    }), { status: 503 });
                }

                const activeMap = new Map((activeFlavors || []).map((f: any) => [f.id, f]));
                const inactive: string[] = [];
                const missing: string[] = [];
                for (const id of requestedIds) {
                    const row = activeMap.get(id);
                    if (!row) {
                        missing.push(id);
                    } else if (!row.active) {
                        inactive.push(row.name || id);
                    }
                }

                if (inactive.length > 0 || missing.length > 0) {
                    const names = [...inactive, ...missing].join(', ');
                    return new Response(JSON.stringify({
                        error: `Algunos productos ya no están disponibles: ${names}. Por favor recarga la página y arma tu pedido de nuevo.`,
                        unavailable: [...inactive, ...missing]
                    }), { status: 409 });
                }
            }
        } catch (validationErr) {
            console.error('Order validation failed unexpectedly:', validationErr);
            return new Response(JSON.stringify({
                error: 'No pudimos verificar tu pedido. Intenta de nuevo.'
            }), { status: 500 });
        }

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
