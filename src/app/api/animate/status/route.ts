import { NextResponse } from 'next/server';
import { checkVideoStatus } from '@/lib/vertex/video';
import { supabaseAdmin } from '@/lib/supabase/admin'; // Use admin to bypass RLS if needed, or client if public

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const operationName = searchParams.get('operationName');

    if (!operationName) {
        return NextResponse.json({ error: 'Missing operationName' }, { status: 400 });
    }

    const result = await checkVideoStatus(operationName);

    if (result.status === 'done' && result.videoUri) {
        // Update generation record
        // We use a JSON containment query to find the record with this operationName in meta
        const { error } = await supabaseAdmin
            .from('generations')
            .update({
                status: 'success',
                // We store video URL in meta since image_url might be expected to be an image
                // But wait, if we want it to show up in dashboard easily, maybe we should put it in image_url?
                // But it's a video. Let's put it in meta and update dashboard.
                // Actually, let's put it in BOTH if possible, or just meta.
                // Let's update meta.
                meta: {
                    operationName, // Keep existing
                    videoUrl: result.videoUri,
                    type: 'video'
                }
            })
            .contains('meta', { operationName: operationName });

        if (error) {
            console.error("Failed to update generation status:", error);
        }
    } else if (result.status === 'error') {
        await supabaseAdmin
            .from('generations')
            .update({
                status: 'error',
                error_message: result.error
            })
            .contains('meta', { operationName: operationName });
    }

    return NextResponse.json(result);
}
