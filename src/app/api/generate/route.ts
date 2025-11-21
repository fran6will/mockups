import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateMockup } from '@/lib/vertex/client';

export async function POST(request: Request) {
    try {
        const { productId, logoUrl, aspectRatio } = await request.json();

        if (!productId || !logoUrl) {
            return NextResponse.json({ error: 'Missing productId or logoUrl' }, { status: 400 });
        }

        // 1. Fetch Product Details (Base Image, Overlay Config)
        const { data: product, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // 2. Call Nano Banana Pro (Vertex AI)
        // We pass the base image URL from the product and the user's logo URL
        const prompt = product.custom_prompt && product.custom_prompt.trim() !== '' 
            ? product.custom_prompt 
            : "Apply the logo to the product with realistic texture and lighting.";

        const result = await generateMockup(
            product.base_image_url,
            logoUrl,
            prompt,
            aspectRatio || '1:1'
        );

        // 3. Return the result
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            imageUrl: result.mockUrl
        });

    } catch (e) {
        console.error("Generation failed:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
