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

        const { image, prompt, title } = await request.json();

        if (!image || !prompt || !title) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Upload Original Blank Image (Optional, but good for reference)
        // We can skip this for now to save storage, or store it if needed.
        // Let's just use it directly for generation.

        // 2. Generate Scene using AI
        // The image comes as a Data URL (Base64)
        const sceneResult = await generateScene(image, prompt);

        if (!sceneResult.success || !sceneResult.mockUrl) {
            throw new Error(sceneResult.error || 'Failed to generate scene');
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
                tags: ['custom', 'community']
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
