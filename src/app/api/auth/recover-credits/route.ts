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

    // Check if credits exist using Service Role (bypassing RLS)
    const { data: existing } = await supabaseAdmin
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid error if missing

    if (!existing) {
        console.log('[Recovery] No credits found. Creating new record...');
        // Create credits
        const { error } = await supabaseAdmin.from('user_credits').insert({
            user_id: user.id,
            auth_user_id: user.id,
            email: user.email,
            balance: 20 // Default welcome credits
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

    console.log('[Recovery] Credits already exist.');
    return NextResponse.json({ success: true, recovered: false });
}
