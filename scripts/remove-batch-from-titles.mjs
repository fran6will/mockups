import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeBatchFromTitles() {
    // Fetch all products with "Batch" in title
    const { data: products, error } = await supabase
        .from('products')
        .select('id, title')
        .ilike('title', '%Batch%');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${products.length} products with "Batch" in title:`);

    for (const product of products) {
        const newTitle = product.title.replace(/\s*Batch\s*/gi, ' ').replace(/\s+/g, ' ').trim();
        console.log(`  "${product.title}" → "${newTitle}"`);

        const { error: updateError } = await supabase
            .from('products')
            .update({ title: newTitle })
            .eq('id', product.id);

        if (updateError) {
            console.error(`  Error updating:`, updateError);
        } else {
            console.log(`  ✓ Updated`);
        }
    }

    console.log('Done!');
}

removeBatchFromTitles();
