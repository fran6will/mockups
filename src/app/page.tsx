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
// import NewArrivals from '@/components/landing/NewArrivals';
import Features from '@/components/landing/Features';
import BackgroundDoodles from '@/components/ui/BackgroundDoodles';
import TryItSection from '@/components/landing/TryItSection';
import StatsSection from '@/components/landing/StatsSection';

export default function HomePage() {
    return (
        <div className="min-h-screen font-sans text-ink selection:bg-teal/20 bg-grid-pattern bg-grain relative overflow-hidden">
            <BackgroundDoodles />
            <Banner />
            <Header />

            <main className="relative z-10">
                <Hero />

                {/* Free Trial CTA */}
                <div className="max-w-7xl mx-auto px-6 mb-12 -mt-8 relative z-20">
                    <div className="bg-ink text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-ink/10 border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-ink font-black text-xl shrink-0 animate-pulse">
                                7
                            </div>
                            <div>
                                <h3 className="font-bold text-xl md:text-2xl">Try Pro Free for 7 Days</h3>
                                <p className="text-white/60 text-sm">Unlimited generations. Cancel anytime.</p>
                            </div>
                        </div>
                        <a href="/pricing" className="bg-white text-ink font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors whitespace-nowrap">
                            Start Free Trial
                        </a>
                    </div>
                </div>

                <StatsSection />

                <TrendingCarousel />
                <TryItSection />
                {/* <NewArrivals /> */}
                <Features />
                <Gallery />
            </main>
        </div>
    );
}
