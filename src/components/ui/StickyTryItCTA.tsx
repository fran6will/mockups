'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';

export default function StickyTryItCTA() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling past 600px (roughly past hero)
            const scrolled = window.scrollY > 600;

            // Hide when near the bottom/footer to avoid clash? 
            // Optional: The user didn't ask to hide it, but standard practice.
            // For now, let's keep it simple as requested: "following me"
            setIsVisible(scrolled);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 px-6 flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-ink text-white rounded-2xl p-4 md:px-6 md:py-4 flex items-center justify-between gap-6 shadow-2xl shadow-ink/20 border border-white/10 w-full max-w-2xl backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-ink font-black text-lg shrink-0 animate-pulse">
                        7
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">Try Pro Free</h3>
                        <p className="text-white/60 text-xs hidden md:block">Unlimited generations. Cancel anytime.</p>
                    </div>
                </div>
                <a href="/pricing" className="bg-white text-ink font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors whitespace-nowrap text-sm md:text-base">
                    Start Free Trial
                </a>
            </div>
        </div>
    );
}
