'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Show banner after a short delay for smooth entrance
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in slide-in-from-bottom-full duration-500">
            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md border border-teal/10 shadow-2xl rounded-2xl p-6 md:flex items-center justify-between gap-6">
                <div className="flex-1 mb-4 md:mb-0">
                    <h3 className="font-bold text-ink mb-2">We value your privacy</h3>
                    <p className="text-sm text-ink/70 leading-relaxed">
                        By clicking "Accept", you agree to the storing of cookies on your device to enhance site navigation, analyze site usage, and assist in our marketing efforts. For more information, please review our <Link href="/privacy" className="text-teal hover:underline font-medium">Privacy Policy</Link>.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={handleDecline}
                        className="px-6 py-2.5 rounded-xl font-bold text-ink/60 hover:bg-ink/5 transition-colors text-sm"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2.5 rounded-xl font-bold bg-teal text-white hover:bg-teal/90 transition-colors shadow-lg shadow-teal/20 text-sm"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
