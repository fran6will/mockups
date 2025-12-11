import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';
import OutOfCreditsEmail from '@/emails/OutOfCreditsEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
    // 1. Security Check (Vercel Cron)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // 2. Find users created yesterday (24h-48h window)
        // We look for the 'Welcome Bonus' transaction timestamp
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const { data: newUsers, error } = await supabaseAdmin
            .from('transactions')
            .select('user_id, created_at, user_credits(email, auth_user_id)')
            .eq('description', 'Welcome Bonus') // Identifies signup
            .lt('created_at', yesterday.toISOString())
            .gt('created_at', twoDaysAgo.toISOString());

        if (error) throw error;

        if (!newUsers || newUsers.length === 0) {
            return NextResponse.json({ message: 'No users found from yesterday.' });
        }

        console.log(`[Cron] Found ${newUsers.length} users from yesterday.`);
        let sentCount = 0;

        // 3. Process each user
        for (const record of newUsers) {
            // @ts-ignore - Supabase join types can be tricky
            const email = record.user_credits?.email;
            const userId = record.user_id;

            if (email) {
                // Optional: Check if they upgraded to Pro (skip them)
                // This would require checking your subscription table logic
                // For now, we assume we send it to everyone as a follow-up

                await resend.emails.send({
                    from: 'notifications@mail.copiecolle.ai',
                    to: email,
                    subject: 'You\'ve almost used all your free credits',
                    react: OutOfCreditsEmail(),
                });
                sentCount++;
            }
        }

        return NextResponse.json({ success: true, sent: sentCount });

    } catch (error) {
        console.error('[Cron] Error:', error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
