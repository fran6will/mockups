import Header from '@/components/ui/Header';
import Banner from '@/components/ui/Banner';
import VideoAnimator from '@/components/tools/VideoAnimator';

export default function AnimatePage() {
    return (
        <div className="min-h-screen font-sans text-ink selection:bg-teal/20 bg-fixed" style={{
            backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(42, 127, 127, 0.15) 0%, var(--color-cream) 60%)'
        }}>
            <Banner />
            <Header />

            <main className="max-w-7xl mx-auto px-6 pb-20 pt-12">
                <div className="text-center mb-16">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-teal/10 text-teal text-sm font-bold uppercase tracking-wider border border-teal/10">
                        New Feature
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ink tracking-tight">
                        Animate Your Mockups
                    </h1>
                    <p className="text-xl text-ink/60 max-w-2xl mx-auto leading-relaxed">
                        Upload any static image and bring it to life with AI-powered cinematic motion.
                    </p>
                </div>

                <VideoAnimator />
            </main>
        </div>
    );
}
