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

                {/* Video Showcase & Conversion Section */}
                <div className="mb-20 grid lg:grid-cols-2 gap-12 items-center">
                    {/* Video Placeholder */}
                    <div className="relative aspect-square bg-black rounded-[2rem] overflow-hidden shadow-2xl shadow-teal/20 border-4 border-white/20 group">
                        <video
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster="/hero-wallpaper.png" // Fallback
                        >
                            <source src="https://uvkdeuavzhhkcclrzdjj.supabase.co/storage/v1/object/public/assets/video-preview.mp4" type="video/mp4" />
                            {/* Placeholder Video URL - User will replace */}
                        </video>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                            </div>
                        </div>
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white">
                                <p className="font-bold text-sm">Cinematic Motion</p>
                                <p className="text-xs opacity-80">AI-generated camera movement and physics</p>
                            </div>
                        </div>
                    </div>

                    {/* Conversion CTA */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-ink">
                                Sell More with <span className="text-teal">Animated Mockups</span>
                            </h2>
                            <p className="text-lg text-ink/60 leading-relaxed">
                                <strong>Etsy listings with video get 2x more orders.</strong><br />
                                Don't just show your design—sell the feeling. Our AI adds realistic movement to your mockups, helping you stand out in search results and convert more shoppers.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                "Fully compatible with Etsy Video uploads",
                                "Increase conversion rates by up to 20%",
                                "Showcase fabric quality & realistic physics",
                                "Stop the scroll in crowded search results"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-teal/10 flex items-center justify-center text-teal shrink-0">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-ink/80">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <a
                                href="/pricing"
                                className="inline-flex items-center justify-center gap-2 bg-teal text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-teal/90 hover:scale-105 transition-all shadow-xl shadow-teal/20 w-full sm:w-auto"
                            >
                                Start Selling More
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                            <p className="text-center sm:text-left text-xs text-ink/40 mt-3 font-medium">
                                Perfect for Etsy, Shopify & TikTok Shop
                            </p>
                        </div>
                    </div>
                </div>

                <VideoAnimator />
            </main>
        </div>
    );
}
