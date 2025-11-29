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
    const category = formData.get('category') as string;

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
            category: category || null,
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
    const baseImageUrl = formData.get('baseImageUrl') as string;
    const galleryImageUrl = formData.get('galleryImageUrl') as string;
    const description = formData.get('description') as string;
    const tagsString = formData.get('tags') as string;
    const category = formData.get('category') as string;
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
        category: category || null,
        is_free: isFree
    };

    if (baseImageUrl) {
        updateData.base_image_url = baseImageUrl;
    }

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

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFavorite(productId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    // Check if already favorited
    const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

    if (existing) {
        // Remove favorite
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', existing.id);

        if (error) return { error: error.message };
        revalidatePath('/dashboard');
        revalidatePath('/gallery');
        revalidatePath(`/${productId}`); // Ideally we'd know the slug, but this might not work perfectly without it. 
        // Actually, we can just revalidate the path where the user is, or general paths.
        return { favorited: false };
    } else {
        // Add favorite
        const { error } = await supabase
            .from('favorites')
            .insert({
                user_id: user.id,
                product_id: productId
            });

        if (error) return { error: error.message };
        revalidatePath('/dashboard');
        revalidatePath('/gallery');
        return { favorited: true };
    }
}

export async function getFavorites() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

    return data?.map(f => f.product_id) || [];
}

export async function createVariant(productId: string, name: string, baseImageUrl: string) {
    if (!productId || !name || !baseImageUrl) {
        return { error: 'Missing fields' };
    }

    const { data, error } = await supabaseAdmin
        .from('product_variants')
        .insert({
            product_id: productId,
            name,
            base_image_url: baseImageUrl
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    return { success: true, data };
}

export async function deleteVariant(id: string) {
    if (!id) return { error: 'Missing ID' };

    const { error } = await supabaseAdmin
        .from('product_variants')
        .delete()
        .eq('id', id);

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

import { analyzeMockupImage } from '@/lib/vertex/client';

export async function analyzeImageAction(imageUrl: string) {
    try {
        const analysis = await analyzeMockupImage(imageUrl);
        return { success: true, data: analysis };
    } catch (error: any) {
        console.error("Analysis Action Error:", error);
        return { error: error.message };
    }
}
