import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateScene } from '@/lib/vertex/client';

export const maxDuration = 60; // Allow longer timeout for AI generation

export async function POST(request: Request) {
    const startTime = Date.now();
    try {
        const authHeader = request.headers.get('Authorization');
        const shopHeader = request.headers.get('x-shopify-shop');
        const internalSecret = process.env.INTERNAL_API_SECRET;
        let isInternal = false;

        if (authHeader === `Bearer ${internalSecret}`) {
            isInternal = true;
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user && !isInternal) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use a placeholder ID if it's an internal call without a user
        const effectiveUserId = user?.id || (shopHeader ? `shopify:${shopHeader}` : 'shopify-internal');
        const effectiveUserEmail = user?.email || (shopHeader ? `admin@${shopHeader}` : 'shopify@internal.cc');

        const { image, imageUrl, prompt, title, styleReferences, aspectRatio, imageSize = '1K', mode = 'template', action } = await request.json();

        // QUICK CREDIT CHECK ACTION
        if (action === "check_credits" && isInternal && shopHeader) {
            const { data: credits } = await supabaseAdmin
                .from('user_credits')
                .select('balance')
                .eq('user_id', effectiveUserId)
                .single();

            return NextResponse.json({
                success: true,
                remainingCredits: credits ? credits.balance : 10
            });
        }

        // Get IP Address for logging (if in remix mode)
        const forwardedFor = request.headers.get('x-forwarded-for');
        const userIp = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

        if ((!image && !imageUrl && action !== "check_credits") || !prompt || !title) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Calculate Cost
        let creditCost = 5;
        if (imageSize === '2K') creditCost = 10;
        if (imageSize === '4K') creditCost = 15;


        // 0.5 Check Subscription (Pro Access) & Credits
        let isPro = false;
        let userCredits = null;

        if (isInternal && shopHeader) {
            // Check if this shop has a credit entry or active subscription
            const { data: credits, error: creditError } = await supabaseAdmin
                .from('user_credits')
                .select('*')
                .eq('user_id', effectiveUserId)
                .single();

            if (credits && !creditError) {
                userCredits = credits;
                // For now, only check credits. We can expand to Shopify-specific subscriptions later.
            } else {
                // AUTO-INITIALIZE 10 FREE CREDITS FOR NEW SHOPS
                const { data: newCredits, error: initError } = await supabaseAdmin
                    .from('user_credits')
                    .insert([{
                        user_id: effectiveUserId,
                        email: effectiveUserEmail,
                        balance: 10,
                        total_used: 0
                    }])
                    .select()
                    .single();

                if (!initError) userCredits = newCredits;
            }
        } else if (user) {
            const { data: subscription } = await supabaseAdmin
                .from('subscriptions')
                .select('status, ends_at')
                .eq('user_id', user.id)
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
        }

        // RESTRICT 4K TO PRO USERS
        if (imageSize === '4K' && !isPro) {
            return NextResponse.json({ error: '4K export is reserved for Pro members.' }, { status: 403 });
        }

        // Check Credits (If NOT Pro)
        if (!isPro) {
            const { data: credits, error: userError } = await supabaseAdmin
                .from('user_credits')
                .select('*')
                .eq('user_id', effectiveUserId)
                .single();

            if (credits && !userError) {
                userCredits = credits;
            }

            if (!userCredits) {
                return NextResponse.json({ error: 'User credits not found. Please claim credits first.' }, { status: 403 });
            }

            if (userCredits.balance < creditCost) {
                return NextResponse.json({ error: `Insufficient credits. This requires ${creditCost} credits.` }, { status: 402 });
            }
        }

        // 2. Generate Scene using AI
        console.log(`[API] Calling generateScene for user: ${effectiveUserId}`);
        const sceneResult = await generateScene(imageUrl || image, prompt, styleReferences || [], aspectRatio || '1:1', imageSize);

        if (!sceneResult.success || !sceneResult.mockUrl) {
            console.error(`[API] Scene generation failed: ${sceneResult.error || 'No mockUrl'}`);
            throw new Error(sceneResult.error || 'Failed to generate scene');
        }

        console.log(`[API] Scene generation successful. Length: ${sceneResult.mockUrl.length}`);

        // Deduct Credit ONLY if not Pro
        if (!isPro && userCredits) {
            await supabaseAdmin
                .from('user_credits')
                .update({ balance: userCredits.balance - creditCost, total_used: userCredits.total_used + creditCost })
                .eq('user_id', effectiveUserId);

            // Log Transaction
            await supabaseAdmin
                .from('transactions')
                .insert([{
                    user_id: effectiveUserId,
                    amount: -creditCost,
                    type: 'debit',
                    description: `Custom ${mode === 'template' ? 'Scene' : 'Remix'} Generation (${imageSize})`
                }]);
        }

        // 3. Upload Generated Scene to Storage
        const parts = sceneResult.mockUrl.split(',');
        const base64Data = parts.length > 1 ? parts[1] : parts[0];
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `custom-${effectiveUserId.replace(/:/g, '-')}-${Date.now()}.png`;

        const bucketName = mode === 'remix' ? 'generated-mockups' : 'mockup-bases';
        console.log(`[API] Uploading to bucket: ${bucketName}, file: ${fileName}`);

        const { error: uploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(fileName, buffer, {
                contentType: 'image/png',
                upsert: false
            });

        if (uploadError) {
            console.error(`[API] Storage upload failed:`, uploadError);
            throw new Error('Failed to upload generated scene: ' + uploadError.message);
        }

        const { data: urlData } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        // 4. Handle Result based on Mode
        if (mode === 'remix') {
            // REMIX MODE: Insert into Generations table
            // Only set user_id if it's a valid UUID (not a shopify: string)
            const dbUserId = effectiveUserId.startsWith('shopify:') ? null : effectiveUserId;

            await supabaseAdmin.from('generations').insert({
                product_id: null, // No specific product template used
                status: 'success',
                duration_ms: Date.now() - startTime,
                meta: {
                    aspect_ratio: aspectRatio,
                    user_email: effectiveUserEmail,
                    image_size: imageSize,
                    prompt: prompt,
                    title: title,
                    mode: 'remix',
                    shopify_shop: effectiveUserId.startsWith('shopify:') ? effectiveUserId.replace('shopify:', '') : null
                },
                user_id: dbUserId,
                image_url: publicUrl,
                ip_address: userIp
            });

            // Return a "fake" product structure so the frontend can display it without changes
            const fakeProduct = {
                id: 'generated-' + Date.now(),
                title: title,
                slug: null, // Results in no "Use Template" button
                base_image_url: publicUrl,
                status: 'generated'
            };

            return NextResponse.json({ success: true, product: fakeProduct });

        } else {
            // TEMPLATE MODE: Create Product in Database
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);

            const { data: product, error: dbError } = await supabaseAdmin
                .from('products')
                .insert({
                    title: title,
                    slug: slug,
                    base_image_url: publicUrl,
                    password_hash: 'custom',
                    custom_prompt: 'Place the design realistically on the product.',
                    user_id: effectiveUserId,
                    created_by: effectiveUserId,
                    status: 'pending',
                    is_public: false,
                    tags: ['custom']
                })
                .select()
                .single();

            if (dbError) {
                throw new Error('Failed to save product: ' + dbError.message);
            }

            return NextResponse.json({ success: true, product });
        }

    } catch (error: any) {
        console.error('Custom Create Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
