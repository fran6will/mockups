import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { generateScene } from '@/lib/vertex/client';

export const maxDuration = 60;

export async function POST(request: Request) {
    const startTime = Date.now();
    let ip = '127.0.0.1';

    try {
        // 1. Get Params
        const { image, prompt, styleReferences = [], aspectRatio = '1:1', imageSize = '1K' } = await request.json();

        if (!image || !prompt) {
            return NextResponse.json({ error: 'Missing image or prompt' }, { status: 400 });
        }

        // 2. Get IP Address
        const forwardedFor = request.headers.get('x-forwarded-for');
        ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

        // 3. Auth & Credit Check
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        let userId: string | null = null;
        let isPro = false;
        let userCredits = null;
        let creditCost = 5;
        if (imageSize === '2K') creditCost = 10;
        if (imageSize === '4K') creditCost = 15;

        if (authUser) {
            userId = authUser.id;

            // Check Subscription
            const { data: subscription } = await supabaseAdmin
                .from('subscriptions')
                .select('status, ends_at')
                .eq('user_id', authUser.id)
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (subscription) {
                const isActive = subscription.status === 'active' || subscription.status === 'on_trial';
                const isCancelledButValid = subscription.status === 'cancelled' &&
                    subscription.ends_at &&
                    new Date(subscription.ends_at) > new Date();

                if (isActive || isCancelledButValid) {
                    isPro = true;
                }
            }

            // Check Credits (if not Pro)
            if (!isPro) {
                const { data: user, error } = await supabaseAdmin
                    .from('user_credits')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .single();
                if (user && !error) userCredits = user;
            }
        }

        // 4. Enforce Rules

        // Rule A: 4K is Pro only
        if (imageSize === '4K' && !isPro) {
            return NextResponse.json({ error: '4K export is reserved for Pro members.' }, { status: 403 });
        }

        // Rule B: Payment / Limits
        if (authUser && !isPro) {
            // Authenticated but not Pro -> Use Credits
            if (!userCredits) {
                return NextResponse.json({ error: 'No credit account found. Please claim intro credits.' }, { status: 403 });
            }
            if (userCredits.balance < creditCost) {
                return NextResponse.json({ error: `Insufficient credits. Requires ${creditCost} credits.` }, { status: 402 });
            }
        } else if (!authUser) {
            // Guest -> Check IP Limit (Free Trial)
            const { count, error: countError } = await supabaseAdmin
                .from('generations')
                .select('*', { count: 'exact', head: true })
                .eq('ip_address', ip)
                .eq('status', 'success')
                .contains('meta', { source: 'try-it-remix' }); // Count only remix usage against this limit? Or all? Let's stick to remix for now to avoid blocking main try-it users.

            if (countError) {
                console.error("Error checking rate limit:", countError);
            } else if ((count || 0) >= 3) {
                return NextResponse.json({
                    error: 'Free trial limit reached. Please sign up to create more!',
                    code: 'LIMIT_REACHED'
                }, { status: 429 });
            }
        }

        // 5. Generate Scene
        const sceneResult = await generateScene(image, prompt, styleReferences, aspectRatio, imageSize);

        if (!sceneResult.success || !sceneResult.mockUrl) {
            throw new Error(sceneResult.error || 'Failed to generate scene');
        }

        // 6. Deduct Credits (if applicable) & Log
        const duration = Date.now() - startTime;
        let publicUrl: string | null = null;

        // 6.5 Upload to Supabase Storage to allow persistent URLs in logging
        try {
            if (sceneResult.mockUrl) {
                // Convert Data URL to Buffer
                const base64Data = sceneResult.mockUrl.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                const fileName = `remix-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

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
                    console.error("Failed to upload generated remix image:", uploadError);
                }
            }
        } catch (uploadErr) {
            console.error("Error processing remix image upload:", uploadErr);
        }

        if (authUser && !isPro && userCredits) {
            await supabaseAdmin
                .from('user_credits')
                .update({ balance: userCredits.balance - creditCost, total_used: userCredits.total_used + creditCost })
                .eq('user_id', authUser.id);

            // Log Transaction
            await supabaseAdmin
                .from('transactions')
                .insert([{
                    user_id: authUser.id,
                    amount: -creditCost,
                    type: 'debit',
                    description: `Remix Generation (${imageSize})`
                }]);
        }

        // Log to Generations
        await supabaseAdmin.from('generations').insert({
            product_id: null,
            status: 'success',
            duration_ms: duration,
            meta: {
                source: 'try-it-remix',
                aspect_ratio: aspectRatio,
                image_size: imageSize,
                prompt_snippet: prompt.substring(0, 50)
            },
            ip_address: ip,
            user_id: userId,
            image_url: publicUrl || null // Now populated with the public URL
        });

        // 7. Return Result
        return NextResponse.json({
            success: true,
            url: sceneResult.mockUrl,
            remainingCredits: isPro ? 999 : (userCredits ? userCredits.balance - creditCost : 0)
        });

    } catch (error: any) {
        console.error('TryIt Remix Error:', error);

        await supabaseAdmin.from('generations').insert({
            product_id: null,
            status: 'error',
            duration_ms: Date.now() - startTime,
            error_message: error.message,
            meta: { source: 'try-it-remix' },
            ip_address: ip
        });

        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
