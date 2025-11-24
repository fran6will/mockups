'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';

export async function createProduct(formData: FormData) {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const password = formData.get('password') as string;
    const baseImageUrl = formData.get('baseImageUrl') as string;
    const galleryImageUrl = formData.get('galleryImageUrl') as string;
    const customPrompt = formData.get('customPrompt') as string;
    const tagsString = formData.get('tags') as string;

    const description = formData.get('description') as string;
    const isFree = formData.get('is_free') === 'true';

    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];

    if (!title || !slug || !password || !baseImageUrl) {
        return { error: 'Missing fields' };
    }

    // Use supabaseAdmin (Service Role) to bypass RLS
    const { data, error } = await supabaseAdmin
        .from('products')
        .insert({
            title,
            slug,
            description: description || '',
            password_hash: password, // INSECURE: For demo only
            base_image_url: baseImageUrl,
            gallery_image_url: galleryImageUrl || null,
            custom_prompt: customPrompt || '',
            overlay_config: {},
            tags: tags,
            is_free: isFree
        })
        .select()
        .single();

    if (error) {
        console.error('Server Action Error:', error);
        return { error: error.message };
    }

    return { success: true, data };
}

export async function updateProduct(formData: FormData) {
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const password = formData.get('password') as string;
    const customPrompt = formData.get('customPrompt') as string;
    const galleryImageUrl = formData.get('galleryImageUrl') as string;
    const description = formData.get('description') as string;
    const tagsString = formData.get('tags') as string;
    const isFree = formData.get('is_free') === 'true';

    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];

    if (!id || !title || !slug || !password) {
        return { error: 'Missing fields' };
    }

    const updateData: any = {
        title,
        slug,
        description: description || '',
        password_hash: password,
        custom_prompt: customPrompt || '',
        gallery_image_url: galleryImageUrl || null,
        tags: tags,
        is_free: isFree
    };

    const { data, error } = await supabaseAdmin
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    return { success: true, data };
}

export async function deleteProduct(id: string) {
    if (!id) return { error: 'Missing ID' };

    const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}
