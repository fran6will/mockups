
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixCarousel() {
    console.log("Marking 5 random products as free...");

    // 1. Get 5 random product IDs
    const { data: products, error } = await supabaseAdmin
        .from('products')
        .select('id')
        .limit(50); // Get a pool

    if (error || !products) {
        console.error("Error fetching products:", error);
        return;
    }

    // Shuffle and pick 5
    const shuffled = products.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    const ids = selected.map(p => p.id);

    console.log("Selected IDs:", ids);

    // 2. Update them to is_free = true
    const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ is_free: true })
        .in('id', ids);

    if (updateError) {
        console.error("Error updating products:", updateError);
    } else {
        console.log("Success! 5 products are now free.");
    }
}

fixCarousel();
