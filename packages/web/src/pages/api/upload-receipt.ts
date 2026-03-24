import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { getSupabaseClient } from '@pasele-guerita/core';

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('receipt') as File;
        const customerName = formData.get('customer_name') as string;

        if (!file) {
            return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean filename
        const safeName = customerName ? customerName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'unknown';
        const fileName = `receipt_${safeName}_${Date.now()}${path.extname(file.name)}`;
        
        // Define path - saving to public/receipts so it's statically served
        const publicDir = path.join(process.cwd(), 'public', 'receipts');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        
        const filePath = path.join(publicDir, fileName);
        fs.writeFileSync(filePath, buffer);

        const fileUrl = `/receipts/${fileName}`;

        return new Response(JSON.stringify({ success: true, url: fileUrl }), { status: 200 });
    } catch (e) {
        console.error("Failed to upload receipt:", e);
        return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
    }
}
