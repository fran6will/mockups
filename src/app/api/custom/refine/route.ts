import { NextResponse } from 'next/server';
import { refinePrompt } from '@/lib/vertex/client';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const refinedPrompt = await refinePrompt(prompt);

        return NextResponse.json({ refinedPrompt });
    } catch (error: any) {
        console.error('Refine Prompt Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to refine prompt' },
            { status: 500 }
        );
    }
}
