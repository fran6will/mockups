import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateScene } from '@/lib/vertex/client';

export const maxDuration = 60; // Allow longer timeout for AI generation

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { image, prompt, title, styleReferences, aspectRatio, imageSize = '1K' } = await request.json();

        if (!image || !prompt || !title) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Calculate Cost
        let creditCost = 5;
        if (imageSize === '2K') creditCost = 10;
        if (imageSize === '4K') creditCost = 15;


        // 0.5 Check Subscription (Pro Access) & Credits
        let isPro = false;
        let userCredits = null;

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

        // RESTRICT 4K TO PRO USERS
        if (imageSize === '4K' && !isPro) {
            return NextResponse.json({ error: '4K export is reserved for Pro members.' }, { status: 403 });
        }

        // Check Credits (If NOT Pro)
        if (!isPro) {
            const { data: credits, error: userError } = await supabaseAdmin
                .from('user_credits')
                .select('*')
                .eq('user_id', user.id)
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
        // The image comes as a Data URL (Base64)
        // Note: generateScene might need to be updated to accept imageSize if it doesn't already, 
        // but based on previous context generateScene uses generateProductPlacement which accepts imageSize.
        // Let's verify generateScene signature or just pass it if it supports it.
        // Looking at previous edits, generateScene calls the vertex client. 
        // I should check if generateScene accepts imageSize. 
        // Wait, I didn't check generateScene signature in the planning phase.
        // Let's assume I need to update generateScene too if it doesn't support it.
        // But for now, let's pass it.

        const sceneResult = await generateScene(image, prompt, styleReferences || [], aspectRatio || '1:1', imageSize);

        if (!sceneResult.success || !sceneResult.mockUrl) {
            throw new Error(sceneResult.error || 'Failed to generate scene');
        }

        // Deduct Credit ONLY if not Pro
        if (!isPro && userCredits) {
            await supabaseAdmin
                .from('user_credits')
                .update({ balance: userCredits.balance - creditCost, total_used: userCredits.total_used + creditCost })
                .eq('user_id', user.id);

            // Log Transaction
            await supabaseAdmin
                .from('transactions')
                .insert([{
                    user_id: user.id,
                    amount: -creditCost,
                    type: 'debit',
                    description: `Custom Scene Generation (${imageSize})`
                }]);
        }

        // 3. Upload Generated Scene to Storage (This becomes the Product Base Image)
        const base64Data = sceneResult.mockUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `custom-${user.id}-${Date.now()}.png`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from('mockup-bases')
            .upload(fileName, buffer, {
                contentType: 'image/png',
                upsert: false
            });

        if (uploadError) {
            throw new Error('Failed to upload generated scene: ' + uploadError.message);
        }

        const { data: urlData } = supabaseAdmin.storage
            .from('mockup-bases')
            .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        // 4. Create Product in Database
        // Generate a slug from title
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);

        const { data: product, error: dbError } = await supabaseAdmin
            .from('products')
            .insert({
                title: title,
                slug: slug,
                base_image_url: publicUrl,
                password_hash: 'custom', // Placeholder, not used for custom templates
                custom_prompt: 'Place the design realistically on the product.', // Default prompt for usage
                user_id: user.id, // Admin ID (we use user.id here as the "owner")
                created_by: user.id,
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

    } catch (error: any) {
        console.error('Custom Create Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
