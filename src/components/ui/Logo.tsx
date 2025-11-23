'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

interface LogoProps {
    className?: string;
    showText?: boolean;
    variant?: 'light' | 'dark';
}

export default function Logo({ className = '', showText = true, variant = 'dark' }: LogoProps) {
    const [hasCustomLogo, setHasCustomLogo] = useState(false);

    useEffect(() => {
        // Check if custom logo exists
        const checkLogo = async () => {
            try {
                const res = await fetch('/logo.png', { method: 'HEAD' });
                if (res.ok) setHasCustomLogo(true);
            } catch {
                setHasCustomLogo(false);
            }
        };
        checkLogo();
    }, []);

    if (hasCustomLogo) {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <div className="relative w-8 h-8">
                    <Image
                        src="/logo.png"
                        alt="CopiéCollé Logo"
                        fill
                        className="object-contain"
                        sizes="32px"
                    />
                </div>
                {showText && (
                    <span className={`font-bold text-xl tracking-tight ${variant === 'light' ? 'text-cream' : 'text-ink'}`}>
                        CopiéCollé
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center shadow-lg shadow-teal/30 rotate-3 hover:rotate-6 transition-transform">
                <Sparkles className="text-cream" size={20} />
            </div>
            {showText && (
                <span className={`font-bold text-xl tracking-tight ${variant === 'light' ? 'text-cream' : 'text-ink'}`}>
                    CopiéCollé
                </span>
            )}
        </div>
    );
}
