'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, CheckCircle, Play, Video, Layers } from 'lucide-react';
import { Analytics } from '@/lib/analytics';
import { supabase } from '@/lib/supabase/client';
import ImageComparisonSlider from '@/components/ui/ImageComparisonSlider';


export default function Hero() {
    // const [currentSlide, setCurrentSlide] = useState(0);
    // const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const currentSlide = 0; // Force first slide

    const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

    // Defer video loading to prioritize LCP
    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldLoadVideo(true);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    const handleTryForFree = async () => {
        Analytics.clickTryItFree('hero_try_for_free');
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback?next=/create` },
        });
    };

    const slides = [
        {
            id: 0,
            badge: "#1 AI Mockup & Video Generator",
            badgeIcon: Layers,
            badgeColor: "text-teal bg-teal/5 border-teal/10",
            title: <>Sell More with <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-emerald-600">Instant Mockups</span></>,
            description: "Stop wasting hours on photoshoots. Get 4K, realistic product photos and videos in seconds. No Photoshop needed.",
            cta: "Try for Free",
            visual: (
                <ImageComparisonSlider
                    beforeImage="/canva_bad.png"
                    afterImage="/hero-wallpaper.png"
                    beforeLabel="Canva"
                    afterLabel="CopiéCollé"
                />
            )
        },
    ];

    /*
    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);

        return () => clearInterval(timer);
    }, [isAutoPlaying, slides.length]);
    */

    return (
        <section className="relative pt-12 pb-12 lg:pt-24 lg:pb-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left Column: Copy Stack */}
                    <div className="relative min-h-[500px] flex flex-col justify-center">
                        {/* The 'grid stack' trick: All slides occupy the same cell */}
                        <div className="grid grid-cols-1 grid-rows-1">
                            {slides.map((slide, index) => {
                                const isActive = currentSlide === index;
                                return (
                                    <div
                                        key={slide.id}
                                        className={`col-start-1 row-start-1 transition-all duration-700 ease-in-out ${isActive
                                            ? 'opacity-100 translate-y-0 pointer-events-auto z-10'
                                            : 'opacity-0 translate-y-4 pointer-events-none z-0'
                                            }`}
                                    >
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-8 border ${slide.badgeColor}`}>
                                            <slide.badgeIcon size={16} />
                                            <span>{slide.badge}</span>
                                        </div>

                                        <h1 className="text-5xl lg:text-7xl font-bold text-ink mb-6 tracking-tight leading-[1.1]">
                                            {slide.title}
                                        </h1>

                                        <p className="text-xl text-ink/60 mb-10 leading-relaxed max-w-lg">
                                            {slide.description}
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                onClick={handleTryForFree}
                                                className="bg-teal text-white font-bold text-lg px-8 py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-teal/20 flex items-center justify-center gap-2"
                                            >
                                                {slide.cta} <ArrowRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-12 flex items-center gap-6 text-sm font-bold text-ink/40 z-20 relative">
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

                    {/* Right Column: Visual Stack */}
                    <div className="relative lg:h-[600px] w-full flex items-center justify-center perspective-1000">
                        {/* Abstract Background Blobs */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-60 animate-pulse transition-colors duration-1000 ${currentSlide === 0 ? 'bg-teal/20' :
                            currentSlide === 1 ? 'bg-blue-500/20' :
                                'bg-purple-500/20'
                            }`}></div>

                        <div className="grid grid-cols-1 grid-rows-1 w-full h-full">
                            {slides.map((slide, index) => {
                                const isActive = currentSlide === index;
                                return (
                                    <div
                                        key={slide.id}
                                        className={`col-start-1 row-start-1 w-full h-full flex items-center justify-center transition-all duration-1000 ease-out transform ${isActive
                                            ? 'opacity-100 translate-x-0 rotate-0 scale-100 z-10 blur-0'
                                            : index < currentSlide
                                                ? 'opacity-0 -translate-x-12 -rotate-6 scale-95 z-0 blur-sm'
                                                : 'opacity-0 translate-x-12 rotate-6 scale-95 z-0 blur-sm'
                                            }`}
                                    >
                                        {slide.visual}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
