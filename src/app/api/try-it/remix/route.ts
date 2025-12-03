import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateScene } from '@/lib/vertex/client';

export const maxDuration = 60;

export async function POST(request: Request) {
    const startTime = Date.now();
    let ip = '127.0.0.1';

    try {
        const { image, prompt, styleReferences = [], aspectRatio = '1:1' } = await request.json();

        if (!image || !prompt) {
            return NextResponse.json({ error: 'Missing image or prompt' }, { status: 400 });
        }

        // 1. Get IP Address
        const forwardedFor = request.headers.get('x-forwarded-for');
        ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

        // 2. Check Rate Limit (3 per IP)
        const { count, error: countError } = await supabaseAdmin
            .from('generations')
            .select('*', { count: 'exact', head: true })
            .eq('ip_address', ip)
            .eq('status', 'success')
            // Filter for only "Try It" generations (where product_id is null) to avoid counting paid usage?
            // Actually, let's just count ALL usage from this IP to be safe/strict.
            // Or better, filter by a meta tag to separate "Try It" usage.
            .contains('meta', { source: 'try-it-remix' });

        if (countError) {
            console.error("Error checking rate limit:", countError);
        } else if ((count || 0) >= 3) {
            return NextResponse.json({
                error: 'Free trial limit reached. Please sign up to create more!',
                code: 'LIMIT_REACHED'
            }, { status: 429 });
        }

        // 3. Generate Scene
        const sceneResult = await generateScene(image, prompt, styleReferences, aspectRatio);

        if (!sceneResult.success || !sceneResult.mockUrl) {
            throw new Error(sceneResult.error || 'Failed to generate scene');
        }

        // 4. Log Usage
        const duration = Date.now() - startTime;
        await supabaseAdmin.from('generations').insert({
            product_id: null, // Null for guest usage
            status: 'success',
            duration_ms: duration,
            meta: {
                source: 'try-it-remix',
                aspect_ratio: aspectRatio,
                prompt_snippet: prompt.substring(0, 50)
            },
            ip_address: ip,
            image_url: null // Don't save image URL to DB to save space/privacy for guests
        });

        // 5. Return Result
        return NextResponse.json({
            success: true,
            url: sceneResult.mockUrl
        });

    } catch (error: any) {
        console.error('TryIt Remix Error:', error);

        // Log Error
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
