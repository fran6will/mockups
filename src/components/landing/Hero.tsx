'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle, Play, Video, Layers } from 'lucide-react';
import { Analytics } from '@/lib/analytics';

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

    const slides = [
        {
            id: 0,
            badge: "#1 AI Mockup & Video Generator",
            badgeIcon: Layers,
            badgeColor: "text-teal bg-teal/5 border-teal/10",
            title: <>Sell More with <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-emerald-600">Instant Mockups</span></>,
            description: "Stop wasting hours on photoshoots. Get 4K, realistic product photos and videos in seconds. No Photoshop needed.",
            cta: "Start Free 7-Day Trial",
            ctaSub: "No credit card required",
            ctaLink: "/pricing",
            visual: (
                <div className="relative w-full max-w-md aspect-[4/5] glass rounded-3xl border border-white/40 shadow-2xl shadow-teal/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                        <Image
                            src="/hero-wallpaper.png"
                            alt="AI Mockup Preview"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                            priority
                        />
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute bottom-8 left-8 right-8 glass p-4 rounded-xl border border-white/60 shadow-lg flex items-center gap-4 backdrop-blur-xl bg-white/40">
                        <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-white shadow-lg">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-ink/50 uppercase tracking-wider">Status</p>
                            <p className="text-sm font-bold text-ink">Generated in 2.4s</p>
                        </div>
                    </div>
                </div>
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
                                            <Link
                                                href={slide.ctaLink}
                                                onClick={() => Analytics.clickTryItFree(`hero_slide_${slide.id}`)}
                                                className="bg-teal text-white font-bold text-lg px-8 py-3 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-teal/20 flex flex-col items-center justify-center leading-tight"
                                            >
                                                <span className="flex items-center gap-2">
                                                    {slide.cta} <ArrowRight size={20} />
                                                </span>
                                                {/* @ts-ignore */}
                                                {slide.ctaSub && <span className="text-[10px] font-medium opacity-80 uppercase tracking-widest">{slide.ctaSub}</span>}
                                            </Link>
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
