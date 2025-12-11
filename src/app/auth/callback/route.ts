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
                    // Grant 20 free credits
                    await supabaseAdmin.from('user_credits').insert({
                        user_id: user.id, // Sync user_id with Auth ID for RLS
                        auth_user_id: user.id,
                        email: user.email,
                        balance: 20
                    });

                    // Log Transaction
                    await supabaseAdmin.from('transactions').insert({
                        user_id: user.id,
                        amount: 20,
                        type: 'credit',
                        description: 'Welcome Bonus'
                    });
                }
            }

            // Redirect logic
            let redirectUrl = next;

            // Handle full URL redirects (e.g. from ClaimCreditsButton)
            if (redirectUrl.startsWith('http')) {
                return NextResponse.redirect(redirectUrl);
            }

            // If no specific destination (and not a full URL), fallback to /create
            if (!redirectUrl ||
                redirectUrl === '/' ||
                redirectUrl === '/dashboard' ||
                redirectUrl === '') {
                redirectUrl = '/create';
            }

            return NextResponse.redirect(`${origin}${redirectUrl}`);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
