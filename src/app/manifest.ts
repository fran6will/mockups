import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'CopiéCollé | AI Mockup Generator',
        short_name: 'CopiéCollé',
        description: 'Create photorealistic product mockups in seconds with AI. No Photoshop required.',
        start_url: '/',
        display: 'standalone',
        background_color: '#F2F0E9',
        theme_color: '#2A7F7F',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
