import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(2);
    console.log(JSON.stringify(data, null, 2));
}

main();
