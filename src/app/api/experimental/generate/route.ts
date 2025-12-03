import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { supabaseAdmin } from '@/lib/supabase/admin';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
    console.log("DEBUG: Using Hardcoded Token");

    try {
        const { prompt, image } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        let imageUrl = null;

        if (image && image.startsWith('data:image')) {
            // Upload to Supabase
            const base64Data = image.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `input-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from('generated-mockups')
                .upload(fileName, buffer, {
                    contentType: 'image/png',
                    upsert: false
                });

            if (uploadError) {
                console.error("Upload failed:", uploadError);
                throw new Error("Failed to upload input image");
            }

            const { data: urlData } = supabaseAdmin.storage
                .from('generated-mockups')
                .getPublicUrl(fileName);

            imageUrl = urlData.publicUrl;
        }

        const input: any = {
            prompt: prompt,
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 90
        };

        if (imageUrl) {
            input.image_input = [imageUrl];
            // When using image input, we might want to match aspect ratio or keep 1:1. 
            // User didn't specify, but let's default to keeping 1:1 unless they want otherwise.
            // Actually, let's set aspect_ratio to match_input_image if they upload one?
            // For now, just fixing the parameter name is the request.
        }

        const output = await replicate.run(
            "bytedance/seedream-4.5",
            {
                input: input
            }
        );

        console.log("DEBUG: Raw Replicate Output:", output);

        // Handle ReadableStream output
        if (Array.isArray(output) && output.length > 0 && output[0] instanceof ReadableStream) {
            console.log("DEBUG: Processing ReadableStream output...");
            const stream = output[0];
            const reader = stream.getReader();
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
            }

            // Combine chunks
            const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
            const combined = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
                combined.set(chunk, offset);
                offset += chunk.length;
            }

            // Convert to base64
            const buffer = Buffer.from(combined);
            const base64 = buffer.toString('base64');
            const dataUri = `data:image/jpeg;base64,${base64}`;

            console.log("DEBUG: Stream converted to Data URI. Length:", dataUri.length);
            return NextResponse.json({ output: [dataUri] });
        }

        return NextResponse.json({ output });
    } catch (error: any) {
        console.error("Replicate generation failed:", error);
        return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
    }
}
