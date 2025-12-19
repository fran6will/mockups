'use client';

import { useEffect, useState } from 'react';
import { Users, Activity } from 'lucide-react';

export default function LiveActivity() {
    const [activeUsers, setActiveUsers] = useState(14); // Start with a believable number
    const [isIncreasing, setIsIncreasing] = useState(true);

    useEffect(() => {
        // Initial random set
        setActiveUsers(Math.floor(Math.random() * (22 - 3 + 1)) + 3);

        const interval = setInterval(() => {
            setActiveUsers(prev => {
                const change = Math.floor(Math.random() * 2) + 1; // Change by 1 or 2 (Calmer)
                const shouldIncrease = Math.random() > 0.5;

                let next = shouldIncrease ? prev + change : prev - change;

                // Clamp between 3 and 22
                if (next > 22) next = 22;
                if (next < 3) next = 3;

                setIsIncreasing(next > prev);
                return next;
            });
        }, 8000); // Update every 8 seconds (Calmer)

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="pb-12 pt-0 -mt-8 relative z-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-center">
                    <div className="relative group cursor-default">
                        {/* Ambient Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-teal/20 via-purple-500/10 to-teal/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 rounded-full"></div>

                        <div className="relative inline-flex items-center gap-5 bg-white/70 backdrop-blur-2xl border border-white/60 px-10 py-5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(42,127,127,0.1)] transition-all duration-700 hover:-translate-y-0.5">
                            <div className="relative flex items-center justify-center w-4 h-4">
                                <span className="absolute w-full h-full bg-teal rounded-full animate-[ping_3s_ease-in-out_infinite] opacity-30"></span>
                                <span className="relative block w-2.5 h-2.5 bg-teal rounded-full shadow-[0_0_12px_rgba(42,127,127,0.8)]"></span>
                            </div>

                            <p className="text-xl font-medium text-ink/80 flex items-center gap-2.5 tracking-tight">
                                <span className="font-bold text-3xl text-teal tabular-nums transition-all duration-1000 ease-out">
                                    {activeUsers}
                                </span>
                                <span className="text-ink/60 font-medium">creators are designing right now</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
