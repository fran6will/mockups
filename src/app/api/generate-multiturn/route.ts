import { NextResponse } from 'next/server';
import { generateMockupMultiTurn } from '@/lib/vertex/client';

export const maxDuration = 60;

/**
 * Multi-turn mockup generation API.
 * Experimental endpoint for local testing only.
 * 
 * Enable via: ?mode=overlay on product pages
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            baseImageUrl,       // Base mockup image
            designImageUrl,     // Raw design image
            instruction,        // User's custom instruction
            previousResultUrl,  // Previous generated image (for refinement)
            history,            // Conversation history
            aspectRatio = '1:1',
            imageSize = '1K'
        } = body;

        // For refinement, we might not have base/design images, but we need previousResultUrl + instruction
        // For first turn, we need base + design + instruction
        const isRefinement = !!previousResultUrl;

        if (!isRefinement && (!baseImageUrl || !designImageUrl || !instruction)) {
            return NextResponse.json(
                { error: 'Missing required fields (baseImageUrl, designImageUrl, instruction)' },
                { status: 400 }
            );
        }

        console.log('[Multi-Turn API] Request:', {
            isRefinement,
            hasBase: !!baseImageUrl,
            hasDesign: !!designImageUrl,
            instruction,
            historyLength: history?.length || 0,
        });

        const result = await generateMockupMultiTurn(
            baseImageUrl,
            designImageUrl,
            instruction,
            previousResultUrl,
            history,
            aspectRatio,
            imageSize
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error, history: result.history },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            imageUrl: result.mockUrl,
            modelResponse: result.modelResponse,
            history: result.history
        });

    } catch (error: any) {
        console.error('[Multi-Turn API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
