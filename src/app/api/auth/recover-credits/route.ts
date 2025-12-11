import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Recovery] Checking credits for user:', user.id);

    // Step 1: Check if credits exist by AUTH ID (correct state)
    const { data: byUserId } = await supabaseAdmin
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (byUserId) {
        console.log('[Recovery] Credits already exist by user_id.');
        return NextResponse.json({ success: true, recovered: false });
    }

    // Step 2: Check if there's an orphaned row by EMAIL
    const { data: byEmail } = await supabaseAdmin
        .from('user_credits')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

    if (byEmail) {
        // Link the existing email row to this auth user
        console.log('[Recovery] Linking orphaned email row to auth user:', user.id);
        await supabaseAdmin
            .from('user_credits')
            .update({ user_id: user.id, auth_user_id: user.id })
            .eq('email', user.email);
        return NextResponse.json({ success: true, recovered: true, linked: true });
    }

    // Step 3: No row at all - create new
    console.log('[Recovery] No credits found. Creating new record...');
    const { error } = await supabaseAdmin.from('user_credits').insert({
        user_id: user.id,
        auth_user_id: user.id,
        email: user.email,
        balance: 20
    });

    if (error) {
        console.error('[Recovery] Failed to create credits:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log transaction
    await supabaseAdmin.from('transactions').insert({
        user_id: user.id,
        amount: 20,
        type: 'credit',
        description: 'Welcome Bonus (Recovery)'
    });

    console.log('[Recovery] Credits created successfully.');
    return NextResponse.json({ success: true, recovered: true });
}
