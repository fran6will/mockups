import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const { data: products, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products for XML feed:', error);
            return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
        }

        const baseUrl = 'https://copiecolle.ai';

        // Build XML following Google Merchant RSS 2.0 format
        const items = products.map(product => {
            const link = `${baseUrl}/${product.slug}`;
            const imageLink = product.gallery_image_url || product.base_image_url;
            const description = product.description || `Professional ${product.title} mockup template for AI generation`;

            // Extract color from title
            const titleLower = product.title.toLowerCase();
            let color = 'White';
            if (titleLower.includes('black')) color = 'Black';
            else if (titleLower.includes('grey') || titleLower.includes('gray')) color = 'Grey';
            else if (titleLower.includes('navy')) color = 'Navy';
            else if (titleLower.includes('cream')) color = 'Cream';
            else if (titleLower.includes('beige')) color = 'Beige';

            // Category mapping
            let googleCategory = '5181'; // Default: Apparel & Accessories
            if (product.category === 'Home & Living') googleCategory = '536';
            else if (product.category === 'Stationery') googleCategory = '932';
            else if (product.category === 'Accessories') googleCategory = '167';

            return `
    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.title} - AI Mockup Template]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>5.00 CAD</g:price>
      <g:brand>Copié-Collé</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>299</g:google_product_category>
      <g:product_type><![CDATA[Software > Design Software > AI Mockup Generator]]></g:product_type>
      <g:is_bundle>no</g:is_bundle>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
        }).join('\n');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Copié-Collé Product Feed</title>
    <link>${baseUrl}</link>
    <description>AI-powered mockup templates for online sellers</description>
${items}
  </channel>
</rss>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        });

    } catch (e) {
        console.error('XML feed generation failed:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
