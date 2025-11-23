import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { generateMockup } from '@/lib/vertex/client';

export async function POST(request: Request) {
    const startTime = Date.now();
    let productIdString = null;

    try {
        const { productId, logoUrl, aspectRatio, email } = await request.json();
        productIdString = productId;

        if (!productId || !logoUrl || !email) {
            return NextResponse.json({ error: 'Missing required fields (productId, logoUrl, email)' }, { status: 400 });
        }

        // 0. Check Auth Session (for History)
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        // 0.5 Check Credits (Legacy Email System)
        // We still use the email-based credit system for now, even if logged in.
        // Ideally we'd merge them, but for now let's keep using the email from the request
        // to deduct credits, but link the history to the authUser if present.
        const { data: user, error: userError } = await supabaseAdmin
            .from('user_credits')
            .select('*')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found. Please claim credits first.' }, { status: 403 });
        }

        if (user.balance < 1) {
            return NextResponse.json({ error: 'Insufficient credits. Please purchase more.' }, { status: 402 });
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

        // 3. Log Usage & Deduct Credit
        const duration = Date.now() - startTime;

        if (result.success) {
            // Deduct Credit
            await supabaseAdmin
                .from('user_credits')
                .update({ balance: user.balance - 1, total_used: user.total_used + 1 })
                .eq('user_id', user.user_id);

            // Log Transaction
            await supabaseAdmin
                .from('transactions')
                .insert([{
                    user_id: user.user_id,
                    amount: -1,
                    type: 'debit',
                    description: 'Mockup Generation'
                }]);

            // 3.5 Upload to Storage (New!)
            let publicUrl = null;
            try {
                if (result.mockUrl) {
                    // Convert Data URL to Buffer
                    const base64Data = result.mockUrl.split(',')[1];
                    const buffer = Buffer.from(base64Data, 'base64');
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

                    const { error: uploadError } = await supabaseAdmin.storage
                        .from('generated-mockups')
                        .upload(fileName, buffer, {
                            contentType: 'image/png',
                            upsert: false
                        });

                    if (!uploadError) {
                        const { data: urlData } = supabaseAdmin.storage
                            .from('generated-mockups')
                            .getPublicUrl(fileName);
                        publicUrl = urlData.publicUrl;
                    } else {
                        console.error("Failed to upload generated image:", uploadError);
                    }
                }
            } catch (uploadErr) {
                console.error("Error processing image upload:", uploadErr);
            }

            // 4. Save to Generations Table
            try {
                await supabaseAdmin.from('generations').insert({
                    product_id: productId,
                    status: 'success',
                    duration_ms: duration,
                    meta: { aspect_ratio: aspectRatio, user_email: email },
                    user_id: authUser?.id || null, // Link to auth user if logged in
                    image_url: publicUrl
                });
            } catch (logError) {
                console.error("Failed to log generation usage:", logError);
            }
        } else {
            // Log failure
            try {
                await supabaseAdmin.from('generations').insert({
                    product_id: productId,
                    status: 'error',
                    duration_ms: duration,
                    error_message: result.error,
                    meta: { aspect_ratio: aspectRatio, user_email: email },
                    user_id: authUser?.id || null
                });
            } catch (logError) {
                console.error("Failed to log error usage:", logError);
            }
        }

        // 5. Return the result
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            imageUrl: result.mockUrl,
            remainingCredits: user.balance - 1
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
