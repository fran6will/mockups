'use client';

import { X, Copy, Check, Facebook, Twitter } from 'lucide-react';
import { useState } from 'react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    productTitle?: string;
}

export default function ShareModal({ isOpen, onClose, imageUrl, productTitle = 'Check out this mockup!' }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const shareUrl = imageUrl; // In a real app, this might be a link to the generation page
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(`Created with CopiéCollé: ${productTitle}`);

    const socialLinks = [
        {
            name: 'Pinterest',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-600">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.173 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" />
                </svg>
            ),
            url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedUrl}&description=${encodedText}`
        },
        {
            name: 'Twitter',
            icon: <Twitter className="w-6 h-6 text-[#1DA1F2]" fill="currentColor" />,
            url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-6 h-6 text-[#1877F2]" fill="currentColor" />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        }
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative z-10 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-ink/40 hover:text-ink transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-ink mb-1">Share Mockup</h2>
                <p className="text-sm text-ink/60 mb-6">Show off your design to the world.</p>

                {/* Preview */}
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-6 border border-ink/5 relative">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
                </div>

                {/* Social Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {socialLinks.map((social) => (
                        <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-ink/5"
                        >
                            {social.icon}
                            <span className="text-xs font-bold text-ink/70">{social.name}</span>
                        </a>
                    ))}
                </div>

                {/* Copy Link */}
                <div className="relative">
                    <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="w-full bg-gray-50 border border-ink/10 rounded-xl pl-4 pr-12 py-3 text-sm text-ink/60 focus:outline-none"
                    />
                    <button
                        onClick={handleCopy}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-teal hover:bg-teal/10 rounded-lg transition-colors"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
