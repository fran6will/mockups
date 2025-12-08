import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Check and grant free credits for new users
            const { data: { user } } = await supabase.auth.getUser();

            if (user && user.email) {
                const { data: existingCredits } = await supabaseAdmin
                    .from('user_credits')
                    .select('user_id')
                    .eq('email', user.email)
                    .single();

                if (!existingCredits) {
                    // Grant 5 free credits
                    await supabaseAdmin.from('user_credits').insert({
                        user_id: user.id, // Sync user_id with Auth ID for RLS
                        auth_user_id: user.id,
                        email: user.email,
                        balance: 5
                    });

                    // Log Transaction
                    await supabaseAdmin.from('transactions').insert({
                        user_id: user.id,
                        amount: 5,
                        type: 'credit',
                        description: 'Welcome Bonus'
                    });

                    // New user - redirect to home page #tryout section
                    return NextResponse.redirect(`${origin}/#tryout`);
                }
            }

            // Redirect logic - force #tryout for homepage sign-ins
            let redirectUrl = next;
            if (!redirectUrl || redirectUrl === '/' || redirectUrl === '/dashboard') {
                redirectUrl = '/#tryout';
            } else if (redirectUrl === '/' && !redirectUrl.includes('#')) {
                // If coming from homepage without hash, add #tryout
                redirectUrl = '/#tryout';
            }

            return NextResponse.redirect(`${origin}${redirectUrl}`);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
