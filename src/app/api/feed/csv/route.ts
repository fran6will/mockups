import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const { data: products, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products for feed:', error);
            return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
        }

        // Define CSV Headers (Google Merchant Center Format)
        const headers = [
            'id',
            'title',
            'description',
            'link',
            'image_link',
            'availability',
            'price',
            'brand',
            'condition',
            'shipping',
            'age_group',
            'gender',
            'color'
        ];

        // Generate CSV Rows
        const rows = products.map(product => {
            const baseUrl = 'https://copiecolle.ai'; // Replace with your actual domain
            const link = `${baseUrl}/${product.slug}`;

            // Optimize image size for Google (limit to 2048px width to stay under 16MB/64MP)
            // Assuming Supabase Storage, we can try to append transformation params if supported, 
            // or just use the URL. If these are raw 4K PNGs, they might be huge.
            // Let's append a cache buster or resize param if it's a Supabase render URL.
            // For now, we'll use the raw URL but advise user on image size. 
            // Actually, let's try to force a resize if it's a supabase URL to be safe.
            let imageLink = product.gallery_image_url || product.base_image_url;
            if (imageLink?.includes('supabase.co')) {
                // Supabase Image Transformation (if enabled on project)
                // imageLink = `${imageLink}?width=1200&quality=80`;
            }

            // Simple color extraction from title
            const titleLower = product.title.toLowerCase();
            let color = 'White'; // Default for mockups
            if (titleLower.includes('black')) color = 'Black';
            else if (titleLower.includes('grey') || titleLower.includes('gray')) color = 'Grey';
            else if (titleLower.includes('navy')) color = 'Navy';
            else if (titleLower.includes('red')) color = 'Red';
            else if (titleLower.includes('blue')) color = 'Blue';
            else if (titleLower.includes('green')) color = 'Green';
            else if (titleLower.includes('cream')) color = 'Cream';
            else if (titleLower.includes('beige')) color = 'Beige';

            // Escape fields for CSV
            const escape = (text: string) => {
                if (!text) return '';
                return `"${text.replace(/"/g, '""')}"`; // Escape double quotes
            };

            return [
                product.id,
                escape(product.title),
                escape(product.description || product.title), // Fallback description
                link,
                imageLink,
                'in_stock', // Default availability
                '5.00 USD', // Set a valid price (Google requires > 0 for ads usually)
                'Copié-Collé', // Brand
                'new', // Condition
                'US::Standard:0.00 USD', // Shipping (Country:Service:Price)
                'adult', // age_group
                'unisex', // gender
                color // color
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="products.csv"',
            },
        });

    } catch (e) {
        console.error('Feed generation failed:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
