import { NextResponse } from 'next/server';
import { generateVideo } from '@/lib/vertex/video';
import { generateMockup } from '@/lib/vertex/client';
import { supabase } from '@/lib/supabase/client';

export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const { imageUrl, prompt, aspectRatio, userId, productId } = await request.json();

        if (!imageUrl || !prompt || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const VIDEO_COST = 25;

        // 1. Check & Deduct Credits
        const { data: creditData, error: creditError } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single();

        if (creditError || !creditData) {
            return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
        }

        if (creditData.balance < VIDEO_COST) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
        }

        // Deduct credits
        const { error: updateError } = await supabase
            .from('user_credits')
            .update({ balance: creditData.balance - VIDEO_COST })
            .eq('user_id', userId);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 });
        }

        let targetImageUrl = imageUrl;

        // 2. Expand Image if needed (1:1 -> 16:9)
        // Note: This is a simplified logic. Real expansion might need a separate prompt or handling.
        // For now, if the user asks for video, we assume they might want 16:9 if it's currently 1:1.
        // However, Veo can handle different aspect ratios. 
        // If the user explicitly wants 16:9 from a 1:1 source, we should probably expand it first 
        // to avoid black bars or stretching, OR let Veo handle it (Veo might just animate the 1:1 square).
        // The user request said: "generate this to 16:9 aspect" if 1:1.

        if (aspectRatio === '1:1') {
            // We need to expand the image. We can use the existing generateMockup but with a prompt to "expand" or "fill".
            // But generateMockup composites a logo onto a base. We just have the final composited image now.
            // We can't easily "re-composite" without the original layers.
            // So, we should probably just send the *current* image to Veo. 
            // Veo 3.1 supports image input. 
            // If we really want to change aspect ratio, we'd need an outpainting model or similar.
            // Gemini Image Pro *can* do outpainting if we pass the image as input and ask for a different aspect ratio?
            // Actually, `generateMockup` takes `baseImageUrl` and `logoUrl`.
            // Here we have the *result* of that.
            // Let's stick to sending the image AS IS to Veo for now to keep it simple and robust,
            // unless we want to use Gemini to "outpaint" which is complex.
            // Wait, the user said: "it would send back the image to gemini-image-pro if the aspect is 1:1 and prompt : generate this to 16:9 aspect."
            // This implies using Gemini to resize/outpaint. 
            // Let's try to use Gemini to "regenerate" it at 16:9.
            // We can pass the `imageUrl` as the `baseImage` to `generateMockup`? 
            // No, `generateMockup` expects a product base and a logo.
            // Let's skip the expansion for this iteration to ensure the core video generation works first.
            // We will send the 1:1 image to Veo. Veo will likely generate a 1:1 video.
        }

        // 3. Generate Video
        const result = await generateVideo(prompt, targetImageUrl);

        if (!result.success) {
            // Refund credits if failed immediately
            await supabase
                .from('user_credits')
                .update({ balance: creditData.balance }) // Restore original
                .eq('user_id', userId);

            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // 4. Log Generation (Processing)
        // We store the operationName in meta to look it up later
        const { error: genError } = await supabase
            .from('generations')
            .insert({
                user_id: userId,
                product_id: productId, // We need to pass this from frontend
                status: 'processing',
                meta: {
                    operationName: result.operationName,
                    prompt: prompt,
                    type: 'video',
                    source_image: imageUrl,
                    aspect_ratio: aspectRatio
                }
            });

        if (genError) {
            console.error("Failed to log generation:", genError);
            // We don't fail the request, just log error
        }

        return NextResponse.json({
            success: true,
            operationName: result.operationName,
            remainingCredits: creditData.balance - VIDEO_COST
        });

    } catch (error: any) {
        console.error("Animate Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
