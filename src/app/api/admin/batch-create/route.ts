import { NextRequest, NextResponse } from 'next/server';
import { analyzeAndPlanBatch, executeBatchItem } from '@/lib/vertex/batch-agent';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    // 1. Auth Check - ROBUST FALLBACK
    const supabase = await createClient();
    const { data: { user: sessionUser } } = await supabase.auth.getUser();

    let user = sessionUser;

    if (!user) {
        console.warn("No session found. Attempting to fall back to Admin user for internal tool...");
        const { supabaseAdmin } = await import('@/lib/supabase/admin');

        // Hardcoded admin email for internal tool fallback
        const ADMIN_EMAIL = 'francis.w.rheaume@gmail.com';

        // Note: listUsers is an admin API
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

        if (users) {
            const adminUser = users.find(u => u.email === ADMIN_EMAIL);
            if (adminUser) {
                console.log(`Fallback successful: Using admin ID ${adminUser.id}`);
                user = adminUser;
            }
        }
    }

    if (!user) {
        return NextResponse.json({ error: "Unauthorized - Could not find valid user session or fallback admin." }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action } = body; // Removed blankProductUrl, styleImageUrl, prompt from here as they are destructured within specific actions

        console.log(`Batch Endpoint called with action: ${action}`);

        if (action === 'plan') {
            const { blankProductUrl, styleImageUrl, mode } = body; // accept mode

            if (!blankProductUrl || !styleImageUrl) {
                return NextResponse.json({ error: "Missing images for planning" }, { status: 400 });
            }
            // Pass mode to agent
            const plan = await analyzeAndPlanBatch(blankProductUrl, styleImageUrl, mode || 'coherent');
            return NextResponse.json(plan);

        } else if (action === 'execute') {
            const { blankProductUrl, styleImageUrl, prompt } = body; // Destructure here for execute action
            if (!blankProductUrl || !styleImageUrl || !prompt) {
                return NextResponse.json({ error: "Missing parameters for execution" }, { status: 400 });
            }
            const result = await executeBatchItem(blankProductUrl, styleImageUrl, prompt);

            if (!result.success) {
                return NextResponse.json({ error: result.error }, { status: 500 });
            }
            return NextResponse.json(result);

        } else if (action === 'save') {
            const { imageUrl, prompt, collectionName } = body; // accept collectionName

            if (!imageUrl || !prompt) {
                return NextResponse.json({ error: "Missing parameters for save" }, { status: 400 });
            }

            // Use admin client for storage/db ops
            const { supabaseAdmin } = await import('@/lib/supabase/admin');

            // 1. Upload to Storage
            // Handle data:image/png;base64, prefix
            const base64Data = imageUrl.split(';base64,').pop();
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `batch-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from('mockup-bases')
                .upload(fileName, buffer, {
                    contentType: 'image/png',
                    upsert: false
                });

            if (uploadError) {
                console.error("Storage Upload Error:", uploadError);
                throw new Error('Failed to upload image: ' + uploadError.message);
            }

            const { data: urlData } = supabaseAdmin.storage
                .from('mockup-bases')
                .getPublicUrl(fileName);

            const publicUrl = urlData.publicUrl;

            // 2. AI Analysis for Auto-Fill (Intelligent Metadata)
            // Import the analysis function
            const { analyzeMockupImage } = await import('@/lib/vertex/client');

            // Analyze the image to get SEO details
            // We pass the publicUrl, 'mockup' type, and the prompt as a hint for the keyword/product name
            console.log(`Running AI Analysis for batch item: ${publicUrl}`);
            const analysis = await analyzeMockupImage(publicUrl, 'mockup', 'Batch Product', prompt);

            // Use AI-generated details, falling back to prompt if something fails (though analyzeMockupImage is robust)
            const title = analysis.title || (prompt.charAt(0).toUpperCase() + prompt.slice(1).substring(0, 60));
            const description = analysis.description || `High-quality mockup featuring: ${prompt}.`;
            // Ensure unique slug
            const baseSlug = analysis.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const slug = `${baseSlug}-${Math.random().toString(36).substring(7)}`;

            // Use authenticated user ID
            const userId = user.id;

            // Prepare tags: Merge AI tags with system tags
            const tags = ['batch-generated'];
            if (collectionName) {
                tags.push(`collection:${collectionName}`);
            }
            if (analysis.tags && Array.isArray(analysis.tags)) {
                // Add unique tags from AI
                analysis.tags.forEach((tag: string) => {
                    if (!tags.includes(tag)) tags.push(tag);
                });
            }

            const { data: product, error: dbError } = await supabaseAdmin
                .from('products')
                .insert({
                    title: title,
                    slug: slug,
                    description: description, // Save the detailed description
                    base_image_url: publicUrl,
                    password_hash: 'batch', // Default batch password
                    custom_prompt: analysis.custom_prompt || 'Place the design realistically on the product.',
                    user_id: userId,
                    created_by: userId,
                    status: 'approved',
                    is_public: true,
                    tags: tags,
                    category: 'Mockups' // Default category
                })
                .select()
                .single();

            if (dbError) {
                console.error("Database Insert Error:", dbError);
                throw new Error('Failed to save product: ' + dbError.message);
            }

            return NextResponse.json({ success: true, product });

        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Batch API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
