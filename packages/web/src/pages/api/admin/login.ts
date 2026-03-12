import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        const clientPassword = body.password;

        let adminPassword = 'guerita2026';
        try {
            // @ts-ignore
            if (import.meta.env.ADMIN_PASSWORD) adminPassword = import.meta.env.ADMIN_PASSWORD;
            // @ts-ignore
            else if (process.env.ADMIN_PASSWORD) adminPassword = process.env.ADMIN_PASSWORD;
        } catch (e) { }

        if (clientPassword === adminPassword) {
            // Set a simple auth cookie that expires in 1 day
            cookies.set('admin_token', 'authenticated', {
                path: '/',
                httpOnly: false, // Accessible by client-side JS for basic logout UI
                maxAge: 60 * 60 * 24, // 1 day
                sameSite: 'lax',
            });
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
}
