import Header from '@/components/ui/Header';
import Gallery from '@/components/gallery/Gallery';
import Footer from '@/components/ui/Footer';

export const metadata = {
    title: 'Mockup Gallery | Copié-Collé',
    description: 'Browse our collection of high-quality, AI-powered mockups.',
};

export default function GalleryPage() {
    return (
        <div className="min-h-screen font-sans text-ink bg-[#F2F0E9]">
            <Header />
            <main className="pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4 tracking-tight">
                            Explore Our Collection
                        </h1>
                        <p className="text-lg text-ink/60 max-w-2xl mx-auto">
                            Discover premium, photorealistic mockups for your brand.
                            From apparel to accessories, find the perfect canvas for your designs.
                        </p>
                    </div>
                    <Gallery />
                </div>
            </main>
            <Footer />
        </div>
    );
}