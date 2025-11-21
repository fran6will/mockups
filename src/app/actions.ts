'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';

export async function createProduct(formData: FormData) {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const password = formData.get('password') as string;
    const baseImageUrl = formData.get('baseImageUrl') as string;
    const customPrompt = formData.get('customPrompt') as string;

    if (!title || !slug || !password || !baseImageUrl) {
        return { error: 'Missing fields' };
    }

    // Use supabaseAdmin (Service Role) to bypass RLS
    const { data, error } = await supabaseAdmin
        .from('products')
        .insert({
            title,
            slug,
            password_hash: password,
            base_image_url: baseImageUrl,
            custom_prompt: customPrompt || '',
            overlay_config: {},
        })
        .select()
        .single();

    if (error) {
        console.error('Server Action Error:', error);
        return { error: error.message };
    }

    return { success: true, data };
}
