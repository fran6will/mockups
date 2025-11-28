'use client';

import { useState, useEffect } from 'react';
import { Timer, Sparkles, X } from 'lucide-react';

export default function BlackFridayBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // Target: Cyber Monday (Dec 2nd, 2024 at midnight) or just 3 days from now for demo
        // Let's set it to a fixed date for the "Black Friday" feel
        const targetDate = new Date('2024-12-03T00:00:00').getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(interval);
                setIsVisible(false);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="bg-ink text-cream relative overflow-hidden">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-ink to-teal-900 animate-gradient-x opacity-50"></div>

            <div className="max-w-7xl mx-auto px-4 py-3 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center sm:text-left">

                <div className="flex items-center gap-2 animate-pulse">
                    <Sparkles className="text-yellow-400" size={20} fill="currentColor" />
                    <span className="font-black text-yellow-400 tracking-widest uppercase text-sm sm:text-base">Black Friday Sale</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">50% OFF</span>
                    <span className="text-white/60 text-xs sm:text-sm font-bold uppercase tracking-wider">Everything</span>
                </div>

                <div className="hidden sm:flex items-center gap-4 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
                    <div className="text-center">
                        <span className="block text-xs font-bold text-white/40 uppercase">Ends in</span>
                    </div>
                    <div className="flex gap-2 font-mono font-bold text-white">
                        <span>{String(timeLeft.days).padStart(2, '0')}d</span>
                        <span>:</span>
                        <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
                        <span>:</span>
                        <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
                        <span>:</span>
                        <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/60 uppercase">Use Code:</span>
                    <span className="bg-white text-ink font-black px-2 py-1 rounded text-sm select-all cursor-pointer hover:bg-yellow-400 transition-colors">BF2025</span>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors sm:hidden"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
