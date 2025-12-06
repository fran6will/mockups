import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const { productId, password, email: inputEmail } = await request.json();

        // 0. Check Auth Session
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        const email = authUser ? authUser.email : inputEmail;

        if (!productId || !password || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Verify Product Password
        const { data: product, error: productError } = await supabaseAdmin
            .from('products')
            .select('password_hash')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (product.password_hash !== password) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        // 2. Find or Create User (Smart Linking)
        let user = null;

        // A. Try finding by Auth ID first
        if (authUser) {
            const { data: authCreditUser } = await supabaseAdmin
                .from('user_credits')
                .select('*')
                .eq('auth_user_id', authUser.id)
                .single();
            user = authCreditUser;
        }

        // B. If not found by Auth ID, try by Email
        if (!user) {
            const { data: emailCreditUser } = await supabaseAdmin
                .from('user_credits')
                .select('*')
                .eq('email', email)
                .single();
            user = emailCreditUser;

            // If found by email BUT we are logged in, link the accounts now!
            if (user && authUser && !user.auth_user_id) {
                await supabaseAdmin
                    .from('user_credits')
                    .update({ auth_user_id: authUser.id })
                    .eq('user_id', user.user_id);
                user.auth_user_id = authUser.id; // Update local obj
            }
        }

        // C. If still not found, Create New
        if (!user) {
            const { data: newUser, error: createError } = await supabaseAdmin
                .from('user_credits')
                .insert([{
                    email,
                    balance: 0,
                    auth_user_id: authUser?.id || null
                }])
                .select()
                .single();

            if (createError) throw createError;
            user = newUser;
        }

        // 3. Check if already claimed for this product
        const { data: claim, error: claimError } = await supabaseAdmin
            .from('product_claims')
            .select('*')
            .eq('user_id', user.user_id)
            .eq('product_id', productId)
            .single();

        if (claim) {
            return NextResponse.json({
                success: true,
                message: 'Welcome back!',
                balance: user.balance,
                userId: user.user_id
            });
        }

        // 4. Award Credits (Transaction)
        const CREDITS_TO_AWARD = 200;

        // A. Add Claim record
        const { error: claimInsertError } = await supabaseAdmin
            .from('product_claims')
            .insert([{ user_id: user.user_id, product_id: productId }]);

        if (claimInsertError) {
            return NextResponse.json({
                success: true,
                message: 'Welcome back!',
                balance: user.balance,
                userId: user.user_id
            });
        }

        // B. Update Balance
        const { data: updatedUser, error: updateError } = await supabaseAdmin
            .from('user_credits')
            .update({ balance: user.balance + CREDITS_TO_AWARD })
            .eq('user_id', user.user_id)
            .select()
            .single();

        if (updateError) throw updateError;

        // C. Log Transaction
        await supabaseAdmin
            .from('transactions')
            .insert([{
                user_id: user.user_id,
                amount: CREDITS_TO_AWARD,
                type: 'credit',
                description: 'Etsy Purchase Claim'
            }]);

        return NextResponse.json({
            success: true,
            message: '200 Credits Added!',
            balance: updatedUser.balance,
            userId: updatedUser.user_id
        });

    } catch (error: any) {
        console.error('Claim error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
