'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';

export default function StickyTryItCTA() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling past 500px (roughly past hero)
            const scrolled = window.scrollY > 500;

            // Hide when near the tryout section (user is already there)
            const tryoutSection = document.getElementById('tryout');
            if (tryoutSection) {
                const rect = tryoutSection.getBoundingClientRect();
                const isNearTryout = rect.top < window.innerHeight && rect.bottom > 0;
                setIsVisible(scrolled && !isNearTryout);
            } else {
                setIsVisible(scrolled);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTryout = () => {
        const element = document.getElementById('tryout');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <button
            onClick={scrollToTryout}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-teal text-white font-bold px-6 py-3 rounded-full shadow-xl shadow-teal/30 hover:scale-105 hover:shadow-2xl transition-all duration-300 ${isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-20 opacity-0 pointer-events-none'
                }`}
            aria-label="Try it free"
        >
            <Sparkles size={18} className="animate-pulse" />
            <span>Try It Free</span>
            <ChevronDown size={16} className="animate-bounce" />
        </button>
    );
}
