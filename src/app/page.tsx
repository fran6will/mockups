import { Metadata } from 'next';
import Gallery from '@/components/gallery/Gallery';

export const metadata: Metadata = {
    title: 'CopiéCollé | AI Mockup Generator for Online Sellers & POD',
    description: 'Create photorealistic product mockups in seconds with AI. The best mockup generator for online sellers, Etsy shops, and Print on Demand businesses. No Photoshop required.',
    keywords: ['mockup generator', 'AI mockups', 'product photography', 'print on demand', 'apparel mockups', 'ecommerce'],
    openGraph: {
        title: 'CopiéCollé | AI Mockup Generator for Online Sellers & POD',
        description: 'Create photorealistic product mockups in seconds with AI. No Photoshop required.',
        type: 'website',
    },
};

import Header from '@/components/ui/Header';
import Banner from '@/components/ui/Banner';
import Hero from '@/components/landing/Hero';
import TrendingCarousel from '@/components/landing/TrendingCarousel';
import NewArrivals from '@/components/landing/NewArrivals';
import Features from '@/components/landing/Features';

export default function HomePage() {
    return (
        <div className="min-h-screen font-sans text-ink selection:bg-teal/20 bg-grid-pattern bg-grain">
            <Banner />
            <Header />

            <main className="relative z-10">
                <Hero />
                <TrendingCarousel />
                <Features />
                <NewArrivals />
                <Gallery />
            </main>
        </div>
    );
}
