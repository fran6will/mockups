import { NextResponse } from 'next/server';
import { checkVideoStatus } from '@/lib/vertex/video';
import { supabaseAdmin } from '@/lib/supabase/admin'; // Use admin to bypass RLS if needed, or client if public

export async function POST(request: Request) {
    const { operationName } = await request.json();

    if (!operationName) {
        return NextResponse.json({ error: 'Missing operationName' }, { status: 400 });
    }

    const result = await checkVideoStatus(operationName);

    if (result.status === 'done' && result.videoUri) {
        // 1. Fetch existing record to get current meta
        const { data: existingGen, error: fetchError } = await supabaseAdmin
            .from('generations')
            .select('meta')
            .contains('meta', { operationName: operationName })
            .single();

        if (fetchError || !existingGen) {
            console.error("Failed to fetch generation for update:", fetchError);
            return NextResponse.json(result);
        }

        // 2. Merge meta
        const updatedMeta = {
            ...existingGen.meta,
            videoUrl: result.videoUri,
            type: 'video' // Ensure type is set
        };

        // 3. Update with merged meta
        const { error } = await supabaseAdmin
            .from('generations')
            .update({
                status: 'success',
                meta: updatedMeta
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
