import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateMockup } from '@/lib/vertex/client';

export async function POST(request: Request) {
    const startTime = Date.now();
    let productIdString = null;

    try {
        const { productId, logoUrl, aspectRatio } = await request.json();
        productIdString = productId;

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
        const prompt = product.custom_prompt && product.custom_prompt.trim() !== '' 
            ? product.custom_prompt 
            : "Apply the logo to the product with realistic texture and lighting.";

        const result = await generateMockup(
            product.base_image_url,
            logoUrl,
            prompt,
            aspectRatio || '1:1'
        );

        // 3. Log Usage
        const duration = Date.now() - startTime;
        try {
            await supabaseAdmin.from('generations').insert({
                product_id: productId,
                status: result.success ? 'success' : 'error',
                duration_ms: duration,
                error_message: result.success ? null : result.error,
                meta: { aspect_ratio: aspectRatio }
            });
        } catch (logError) {
            console.error("Failed to log generation usage:", logError);
        }

        // 4. Return the result
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            imageUrl: result.mockUrl
        });

    } catch (e: any) {
        console.error("Generation failed:", e);
        
        // Log catastrophic failure
        if (productIdString) {
             try {
                await supabaseAdmin.from('generations').insert({
                    product_id: productIdString,
                    status: 'crash',
                    duration_ms: Date.now() - startTime,
                    error_message: e.message || 'Unknown server error'
                });
            } catch (logError) {
                console.error("Failed to log crash usage:", logError);
            }
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
