'use client';

import Link from 'next/link';
import { useState } from 'react';
import Logo from '@/components/ui/Logo';
import AuthButton from '@/components/ui/AuthButton';
import { Menu, X } from 'lucide-react';

export default function Header({ className = "" }: { className?: string }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${className}`}>
            {/* Magic Gradient Border */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal/20 to-transparent"></div>

            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl -z-10"></div>

            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="hover:opacity-80 transition-opacity group">
                        <Logo showText={true} />
                    </Link>
                    <nav className="hidden md:flex items-center gap-1">
                        <Link href="/animate" className="relative px-4 py-2 rounded-full text-ink/60 hover:text-teal hover:bg-teal/5 font-medium transition-all group flex items-center gap-2">
                            Animate
                            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm group-hover:shadow-md transition-shadow">NEW</span>
                        </Link>
                        <Link href="/custom" className="px-4 py-2 rounded-full text-ink/60 hover:text-teal hover:bg-teal/5 font-medium transition-all">Custom</Link>
                        <Link href="/#gallery" className="px-4 py-2 rounded-full text-ink/60 hover:text-teal hover:bg-teal/5 font-medium transition-all">Gallery</Link>
                        <Link href="/pricing" className="px-4 py-2 rounded-full text-ink/60 hover:text-teal hover:bg-teal/5 font-medium transition-all">Pricing</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <AuthButton />

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-ink/60 hover:text-ink transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-ink/5 shadow-xl animate-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col p-6 space-y-4">
                        <Link
                            href="/animate"
                            className="flex items-center justify-between px-4 py-3 rounded-xl bg-ink/5 text-ink font-bold hover:bg-teal/10 hover:text-teal transition-all"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <span>Animate</span>
                            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
                        </Link>
                        <Link
                            href="/custom"
                            className="px-4 py-3 rounded-xl text-ink/60 font-medium hover:bg-ink/5 hover:text-ink transition-all"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Custom
                        </Link>
                        <Link
                            href="/#gallery"
                            className="px-4 py-3 rounded-xl text-ink/60 font-medium hover:bg-ink/5 hover:text-ink transition-all"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Gallery
                        </Link>
                        <Link
                            href="/pricing"
                            className="px-4 py-3 rounded-xl text-ink/60 font-medium hover:bg-ink/5 hover:text-ink transition-all"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Pricing
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
