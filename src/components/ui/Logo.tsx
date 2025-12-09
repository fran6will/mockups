'use client';

import Image from 'next/image';

interface LogoProps {
    className?: string;
    showText?: boolean;
    variant?: 'light' | 'dark';
}

export default function Logo({ className = '', showText = true, variant = 'dark' }: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative w-8 h-8">
                <Image
                    src="/logo-v2.png"
                    alt="CopiéCollé Logo"
                    fill
                    className="object-contain"
                    sizes="32px"
                    priority
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
