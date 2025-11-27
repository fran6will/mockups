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
            'condition'
        ];

        // Generate CSV Rows
        const rows = products.map(product => {
            const baseUrl = 'https://copiecolle.ai'; // Replace with your actual domain
            const link = `${baseUrl}/${product.slug}`;
            const imageLink = product.gallery_image_url || product.base_image_url;

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
                '0.00 USD', // Default price (adjust if you have pricing logic)
                'Copié-Collé', // Brand
                'new' // Condition
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
