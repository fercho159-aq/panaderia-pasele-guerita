import type { APIRoute } from 'astro';
import { getSupabaseClient } from '@pasele-guerita/core';

export const POST: APIRoute = async ({ request }) => {
    try {
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
            console.error("Missing Service Role Key for storage upload.");
            return new Response(JSON.stringify({ error: 'Missing credentials' }), { status: 500 });
        }

        const supabaseAdmin = getSupabaseClient(supabaseUrl as string, serviceKey as string);

        const formData = await request.formData();
        const file = formData.get('receipt') as File;
        const customerName = formData.get('customer_name') as string;

        if (!file) {
            return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const safeName = customerName ? customerName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'unknown';
        const fileExtension = file.name ? file.name.split('.').pop() : 'jpg';
        const fileName = `receipt_${safeName}_${Date.now()}.${fileExtension}`;
        
        // Ensure bucket exists (ignores if it already exists)
        await supabaseAdmin.storage.createBucket('receipts', { public: true });

        // Upload to Supabase Storage
        const { error: uploadError } = await supabaseAdmin.storage
            .from('receipts')
            .upload(fileName, buffer, {
                contentType: file.type || 'image/jpeg',
                upsert: true
            });

        if (uploadError) {
            console.error("Supabase storage upload error:", uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('receipts')
            .getPublicUrl(fileName);

        return new Response(JSON.stringify({ success: true, url: publicUrl }), { status: 200 });
    } catch (e) {
        console.error("Failed to upload receipt:", e);
        return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
    }
}
