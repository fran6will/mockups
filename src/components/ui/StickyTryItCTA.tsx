'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

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

    const handleTryForFree = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback?next=/create` },
        });
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 px-6 flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-ink text-white rounded-2xl p-4 md:px-6 md:py-4 flex items-center justify-between gap-6 shadow-2xl shadow-ink/20 border border-white/10 w-full max-w-2xl backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal rounded-full flex items-center justify-center text-white font-black text-lg shrink-0">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">20 Free Credits</h3>
                        <p className="text-white/60 text-xs hidden md:block">Sign up and start creating instantly.</p>
                    </div>
                </div>
                <button
                    onClick={handleTryForFree}
                    className="bg-teal text-white font-bold px-6 py-2.5 rounded-xl hover:bg-teal/90 transition-colors whitespace-nowrap text-sm md:text-base flex items-center gap-2"
                >
                    Try for Free <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}

