'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle, Play, Video, Layers } from 'lucide-react';

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const slides = [
        {
            id: 0,
            badge: "New: Video Generation",
            badgeIcon: Video,
            badgeColor: "text-teal bg-teal/5 border-teal/10",
            title: <>Stop the Scroll with <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-emerald-600">Animated Mockups</span></>,
            description: "Don't just show your design—sell the feeling. Our AI adds realistic movement to your mockups, helping you stand out in search results and convert more shoppers.",
            cta: "Try Video Generator",
            ctaLink: "/animate",
            visual: (
                <div className="relative w-full max-w-md aspect-square glass rounded-3xl border border-white/40 shadow-2xl shadow-teal/20 overflow-hidden">
                    <div className="absolute inset-0 bg-black">
                        <video
                            className="w-full h-full object-cover opacity-90"
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster="/hero-wallpaper.png"
                        >
                            <source src="https://uvkdeuavzhhkcclrzdjj.supabase.co/storage/v1/object/public/assets/video-preview.mp4" type="video/mp4" />
                        </video>
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute bottom-8 left-8 right-8 glass p-4 rounded-xl border border-white/60 shadow-lg flex items-center gap-4 backdrop-blur-xl bg-white/40">
                        <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-white shadow-lg">
                            <Play size={20} className="fill-current ml-0.5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-ink/50 uppercase tracking-wider">Effect</p>
                            <p className="text-sm font-bold text-ink">Cinematic Motion</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 1,
            badge: "#1 AI Mockup Generator",
            badgeIcon: Layers,
            badgeColor: "text-blue-600 bg-blue-50 border-blue-100",
            title: <>Sell More with <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Instant Mockups</span></>,
            description: "Stop wasting hours on photoshoots or settling for poor quality Canva mockups. Upload your design and get professional, 4K product images in seconds.",
            cta: "Start Creating Free",
            ctaLink: "/#try-it",
            visual: (
                <div className="relative w-full max-w-md aspect-[4/5] glass rounded-3xl border border-white/40 shadow-2xl shadow-blue-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                            src="/hero-wallpaper.png"
                            alt="AI Mockup Preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute bottom-8 left-8 right-8 glass p-4 rounded-xl border border-white/60 shadow-lg flex items-center gap-4 backdrop-blur-xl bg-white/40">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
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
        {
            id: 2,
            badge: "Custom Templates",
            badgeIcon: Sparkles,
            badgeColor: "text-purple-600 bg-purple-50 border-purple-100",
            title: <>Create Your Own <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Magic Scenes</span></>,
            description: "Have a specific vision? Upload any blank product photo and describe the scene. Our AI will place your product in a professional environment instantly.",
            cta: "Create Custom Mockup",
            ctaLink: "/custom",
            visual: (
                <div className="relative w-full max-w-md aspect-[4/5] glass rounded-3xl border border-white/40 shadow-2xl shadow-purple-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                        <div className="relative w-3/4 aspect-square bg-white rounded-xl shadow-2xl transform rotate-3 border border-ink/5 p-2">
                            <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center text-ink/20 border border-dashed border-ink/10">
                                <Sparkles size={48} />
                            </div>
                            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                                AI Generated
                            </div>
                        </div>
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute bottom-8 left-8 right-8 glass p-4 rounded-xl border border-white/60 shadow-lg flex items-center gap-4 backdrop-blur-xl bg-white/40">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-ink/50 uppercase tracking-wider">Feature</p>
                            <p className="text-sm font-bold text-ink">Text-to-Mockup</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);

        return () => clearInterval(timer);
    }, [isAutoPlaying, slides.length]);

    return (
        <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
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
                                        className={`col-start-1 row-start-1 transition-all duration-700 ease-in-out ${
                                            isActive 
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
                                                className="bg-ink text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-ink/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-ink/20 flex items-center justify-center gap-2"
                                            >
                                                {slide.cta} <ArrowRight size={20} />
                                            </Link>
                                            <Link
                                                href="/pricing"
                                                className="bg-white/50 backdrop-blur-sm text-ink font-bold text-lg px-8 py-4 rounded-2xl border border-ink/10 hover:bg-white hover:border-ink/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                View Pricing
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

                        {/* Slide Indicators */}
                        <div className="mt-8 flex gap-3 z-20 relative">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentSlide(index);
                                        setIsAutoPlaying(false); // Pause on interaction
                                    }}
                                    className={`h-2 rounded-full transition-all duration-500 ${currentSlide === index ? 'w-12 bg-ink' : 'w-2 bg-ink/10 hover:bg-ink/30'}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Visual Stack */}
                    <div className="relative lg:h-[600px] w-full flex items-center justify-center perspective-1000">
                        {/* Abstract Background Blobs */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-60 animate-pulse transition-colors duration-1000 ${
                            currentSlide === 0 ? 'bg-teal/20' :
                            currentSlide === 1 ? 'bg-blue-500/20' :
                            'bg-purple-500/20'
                        }`}></div>
                        
                        <div className="grid grid-cols-1 grid-rows-1 w-full h-full">
                            {slides.map((slide, index) => {
                                const isActive = currentSlide === index;
                                return (
                                    <div
                                        key={slide.id}
                                        className={`col-start-1 row-start-1 w-full h-full flex items-center justify-center transition-all duration-1000 ease-out transform ${
                                            isActive 
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
