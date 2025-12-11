
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import WelcomeEmail from '@/emails/WelcomeEmail';
import OutOfCreditsEmail from '@/emails/OutOfCreditsEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const to = searchParams.get('to') || 'delivered@resend.dev';
        const type = searchParams.get('type');

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { error: 'RESEND_API_KEY is missing from environment variables' },
                { status: 500 }
            );
        }

        let subject = 'Welcome to Copié-Collé!';
        let reactComponent = WelcomeEmail();

        if (type === 'credits') {
            subject = 'You have used all your credits';
            reactComponent = OutOfCreditsEmail();
        }

        const data = await resend.emails.send({
            from: 'notifications@mail.copiecolle.ai', // Verified domain
            to: to,
            subject: subject,
            react: reactComponent,
        });

        return NextResponse.json({ success: true, destination: to, data });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
