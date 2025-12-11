import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';
import WelcomeEmail from '@/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

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
                // Wrap credit logic in try/catch - redirect MUST happen regardless
                try {
                    // Step 1: Check if user already has credits by their AUTH ID (correct state)
                    const { data: byUserId } = await supabaseAdmin
                        .from('user_credits')
                        .select('id')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (!byUserId) {
                        // Step 2: Check if they have an orphaned row by EMAIL (from Etsy claim)
                        const { data: byEmail } = await supabaseAdmin
                            .from('user_credits')
                            .select('id, user_id')
                            .eq('email', user.email)
                            .maybeSingle();

                        if (byEmail) {
                            // Link the existing email row to this auth user
                            console.log('[Callback] Linking existing email row to auth user:', user.id);
                            await supabaseAdmin
                                .from('user_credits')
                                .update({ user_id: user.id, auth_user_id: user.id })
                                .eq('email', user.email);
                        } else {
                            // Completely new user - create fresh row with welcome bonus
                            console.log('[Callback] Creating new credits for user:', user.id);
                            const { error: insertError } = await supabaseAdmin.from('user_credits').insert({
                                user_id: user.id,
                                auth_user_id: user.id,
                                email: user.email,
                                balance: 20
                            });

                            if (insertError) {
                                console.error('[Callback] Failed to insert credits:', insertError);
                            } else {
                                // Log welcome transaction
                                await supabaseAdmin.from('transactions').insert({
                                    user_id: user.id,
                                    amount: 20,
                                    type: 'credit',
                                    description: 'Welcome Bonus'
                                });

                                // Send Welcome Email
                                try {
                                    if (process.env.RESEND_API_KEY) {
                                        await resend.emails.send({
                                            from: 'notifications@mail.copiecolle.ai',
                                            to: user.email,
                                            subject: 'Welcome to Copié-Collé! (20 Credits Inside)',
                                            react: WelcomeEmail(),
                                        });
                                        console.log('[Callback] Welcome email sent to:', user.email);
                                    }
                                } catch (emailError) {
                                    console.error('[Callback] Failed to send welcome email:', emailError);
                                }
                            }
                        }
                    }
                } catch (creditError) {
                    // Log but don't block - the redirect MUST happen
                    console.error('[Callback] Credit creation failed (will recover later):', creditError);
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
