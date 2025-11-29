
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Try loading from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    console.log('Checking products...');
    const { data: products, error } = await supabase
        .from('products')
        .select('id, title, is_public, category, tags');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${products.length} products.`);

    const publicCount = products.filter(p => p.is_public).length;
    const privateCount = products.filter(p => !p.is_public).length;
    const nullPublicCount = products.filter(p => p.is_public === null).length;

    console.log(`Public: ${publicCount}`);
    console.log(`Private (false): ${privateCount}`);
    console.log(`Null is_public: ${nullPublicCount}`);

    if (products.length > 0) {
        console.log('Sample product:', products[0]);
    }
}

checkProducts();
