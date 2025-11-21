import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');

        const blob = await response.blob();
        const headers = new Headers();
        headers.set('Content-Type', blob.type);
        headers.set('Content-Disposition', 'attachment; filename="mockup-4k.png"');

        return new NextResponse(blob, { headers });
    } catch (error) {
        return NextResponse.json({ error: 'Download failed' }, { status: 500 });
    }
}
