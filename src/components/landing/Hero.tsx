'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle, Play, Video } from 'lucide-react';


export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
                setIsVisible(true);
            }, 500); // Wait for fade out
        }, 6000); // Switch every 6 seconds

        return () => clearInterval(timer);
    }, []);

    const slides = [
        {
            id: 0,
            badge: "New: Video Generation",
            badgeIcon: Video,
            title: <>Stop the Scroll with <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-[#1F6666]">Animated Mockups</span></>,
            description: "Don't just show your design—sell the feeling. Our AI adds realistic movement to your mockups, helping you stand out in search results and convert more shoppers.",
            cta: "Try Video Generator",
            ctaLink: "/animate",
            visual: (
                <div className="relative w-full max-w-md aspect-square glass rounded-3xl border border-white/40 shadow-2xl shadow-teal/20 overflow-hidden transform -rotate-2 hover:rotate-0 transition-transform duration-700">
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
                    <div className="absolute bottom-8 left-8 right-8 glass p-4 rounded-xl border border-white/60 shadow-lg flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-white">
                            <Play size={20} className="fill-current" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-ink/50 uppercase">Effect</p>
                            <p className="text-sm font-bold text-ink">Cinematic Motion</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 1,
            badge: "#1 AI Mockup Generator",
            badgeIcon: Sparkles,
            title: <>Sell More with <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-[#1F6666]">Instant Mockups</span></>,
            description: "Stop wasting hours on photoshoots or settling for poor quality Canva mockups. Upload your design and get professional, 4K product images in seconds.",
            cta: "Start Creating Free",
            visual: (
                <div className="relative w-full max-w-md aspect-[4/5] glass rounded-3xl border border-white/40 shadow-2xl shadow-teal/20 overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                            src="/hero-wallpaper.png"
                            alt="AI Mockup Preview"
                            className="w-full h-full object-cover"
                        />
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
            )
        }
    ];

    const activeSlide = slides[currentSlide];

    return (
        <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Left Column: Copy */}
                    <div className={`max-w-2xl transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="inline-flex items-center gap-2 bg-teal/5 text-teal px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6 border border-teal/10">
                            <activeSlide.badgeIcon size={16} />
                            <span>{activeSlide.badge}</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold text-ink mb-6 tracking-tight leading-[1.1] min-h-[160px] lg:min-h-[220px]">
                            {activeSlide.title}
                        </h1>

                        <p className="text-xl text-ink/60 mb-8 leading-relaxed min-h-[84px]">
                            {activeSlide.description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href={activeSlide.ctaLink || "/#try-it"}
                                className="bg-teal text-cream font-bold text-lg px-8 py-4 rounded-xl hover:bg-teal/90 hover:shadow-lg hover:shadow-teal/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                {activeSlide.cta} <ArrowRight size={20} />
                            </Link>
                            <Link
                                href="/pricing"
                                className="bg-white text-ink font-bold text-lg px-8 py-4 rounded-xl border border-ink/10 hover:bg-gray-50 hover:border-ink/20 transition-all flex items-center justify-center gap-2"
                            >
                                View Pricing
                            </Link>
                        </div>

                        <div className="mt-10 flex items-center gap-6 text-sm font-bold text-ink/40">
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
                        <div className="mt-8 flex gap-2">
                            {slides.map((slide, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setIsVisible(false);
                                        setTimeout(() => {
                                            setCurrentSlide(index);
                                            setIsVisible(true);
                                        }, 300);
                                    }}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-8 bg-teal' : 'w-2 bg-ink/10 hover:bg-ink/20'}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Visual */}
                    <div className="relative lg:h-[600px] w-full flex items-center justify-center">
                        {/* Abstract Background Blobs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal/20 rounded-full blur-[100px] opacity-50 transition-colors duration-1000"></div>

                        <div className={`w-full flex justify-center transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                            {activeSlide.visual}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
