import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Left Column: Copy */}
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-teal/5 text-teal px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6 border border-teal/10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Sparkles size={16} />
                            <span>#1 AI Mockup Generator</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold text-ink mb-6 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            Sell More with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-[#1F6666]">
                                Instant Mockups
                            </span>
                        </h1>

                        <p className="text-xl text-ink/60 mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            Stop wasting hours on photoshoots. Upload your design and get professional, 4K product images in seconds. Perfect for Etsy, Shopify, and POD.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                            <Link
                                href="/gallery"
                                className="bg-teal text-cream font-bold text-lg px-8 py-4 rounded-xl hover:bg-teal/90 hover:shadow-lg hover:shadow-teal/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                Start Creating Free <ArrowRight size={20} />
                            </Link>
                            <Link
                                href="/pricing"
                                className="bg-white text-ink font-bold text-lg px-8 py-4 rounded-xl border border-ink/10 hover:bg-gray-50 hover:border-ink/20 transition-all flex items-center justify-center gap-2"
                            >
                                View Pricing
                            </Link>
                        </div>

                        <div className="mt-10 flex items-center gap-6 text-sm font-bold text-ink/40 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-teal" /> No Photoshop
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-teal" /> 4K Resolution
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-teal" /> Commercial Use
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visual */}
                    <div className="relative lg:h-[600px] w-full flex items-center justify-center animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                        {/* Abstract Background Blobs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal/20 rounded-full blur-[100px] opacity-50"></div>

                        {/* Floating Cards / Mockup Preview */}
                        <div className="relative w-full max-w-md aspect-[4/5] glass rounded-3xl border border-white/40 shadow-2xl shadow-teal/20 overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-700">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                                {/* Placeholder for a hero image - using a div for now */}
                                <div className="w-full h-full flex items-center justify-center text-ink/10">
                                    <span className="text-9xl font-bold">AI</span>
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute bottom-8 left-8 right-8 glass p-4 rounded-xl border border-white/60 shadow-lg flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-white">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-ink/50 uppercase">Status</p>
                                    <p className="text-sm font-bold text-ink">Generated in 2.4s</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
