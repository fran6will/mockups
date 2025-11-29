
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Try loading from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables');
    console.error('URL:', supabaseUrl ? 'Found' : 'Missing');
    console.error('Key:', supabaseKey ? 'Found' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCategories() {
    console.log('Fetching products...');
    const { data: products, error } = await supabase
        .from('products')
        .select('id, title, slug, category');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${products.length} products.`);

    let updatedCount = 0;

    for (const p of products) {
        if (p.category) continue; // Skip if already categorized

        let newCategory = 'Accessories'; // Default
        const text = (p.title + ' ' + p.slug).toLowerCase();

        if (text.includes('hoodie') || text.includes('sweatshirt') || text.includes('men')) {
            newCategory = "Men's Clothing";
        } else if (text.includes('women') || text.includes('tee') || text.includes('shirt') || text.includes('crop') || text.includes('tank')) {
            newCategory = "Women's Clothing";
        } else if (text.includes('kid') || text.includes('baby') || text.includes('onesie') || text.includes('youth') || text.includes('toddler')) {
            newCategory = "Kids' Clothing";
        } else if (text.includes('mug') || text.includes('cup') || text.includes('frame') || text.includes('canvas') || text.includes('poster') || text.includes('pillow') || text.includes('wall')) {
            newCategory = "Home & Living";
        } else if (text.includes('tote') || text.includes('bag') || text.includes('hat') || text.includes('cap') || text.includes('case')) {
            newCategory = "Accessories";
        }

        console.log(`Updating "${p.title}" -> ${newCategory}`);

        const { error: updateError } = await supabase
            .from('products')
            .update({ category: newCategory })
            .eq('id', p.id);

        if (updateError) {
            console.error(`Failed to update ${p.title}:`, updateError);
        } else {
            updatedCount++;
        }
    }

    console.log(`Done! Updated ${updatedCount} products.`);
}

updateCategories();
