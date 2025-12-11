'use client';

import { supabase } from '@/lib/supabase/client';
import { fetchUserCredits } from '@/app/actions';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import AuthButton from '@/components/ui/AuthButton';
import { Menu, X, ChevronDown, Box, Video, Beaker } from 'lucide-react';

export default function Header({ className = "" }: { className?: string }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [credits, setCredits] = useState<number>(0); // Default to 0 (show button)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkCredits = async (userId: string) => {
            const result = await fetchUserCredits(userId);
            if (result.balance !== undefined) {
                setCredits(result.balance);
            }
            setLoading(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                checkCredits(session.user.id);
            } else {
                setCredits(0);
                setLoading(false);
            }
        });

        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                checkCredits(session.user.id);
            } else {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const showFreeCta = !loading && credits === 0;

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${className}`}>
            {/* Magic Gradient Border */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal/20 to-transparent"></div>

            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl -z-10"></div>

            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="hover:opacity-80 transition-opacity group">
                        <Logo showText={true} />
                    </Link>
                    <nav className="hidden md:flex items-center gap-1">
                        <Link href="/#gallery" className="px-4 py-2 rounded-full text-ink/60 hover:text-teal hover:bg-teal/5 font-medium transition-all text-sm">Mockup Gallery</Link>

                        {/* Special Conversion CTA - Only show if no credits */}
                        {showFreeCta && (
                            <Link
                                href="/create"
                                className="bg-gradient-to-r from-teal to-teal/80 text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-teal/20 hover:scale-105 transition-all text-sm flex items-center gap-2 mx-1"
                            >
                                Start creating for free
                            </Link>
                        )}

                        {/* Products Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 px-4 py-2 rounded-full text-ink/60 hover:text-teal hover:bg-teal/5 font-medium transition-all text-sm">
                                Products
                                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px]">
                                <div className="bg-white/95 backdrop-blur-xl border border-ink/5 rounded-2xl shadow-xl p-2 flex flex-col gap-1 overflow-hidden">
                                    <Link href="/custom" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-teal/5 hover:text-teal text-ink/60 transition-colors text-sm font-medium">
                                        <div className="p-1.5 rounded-lg bg-teal/10 text-teal">
                                            <Box size={16} />
                                        </div>
                                        Create Scene
                                    </Link>
                                    <Link href="/animate" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-teal/5 hover:text-teal text-ink/60 transition-colors text-sm font-medium">
                                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                                            <Video size={16} />
                                        </div>
                                        <div>
                                            Animate
                                            <span className="ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                                        </div>
                                    </Link>
                                    <Link href="/experimental" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-teal/5 hover:text-teal text-ink/60 transition-colors text-sm font-medium">
                                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                                            <Beaker size={16} />
                                        </div>
                                        <div>
                                            Experimental
                                            <span className="ml-2 bg-teal/10 text-teal text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-teal/20">LAB</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link href="/pricing" className="px-4 py-2 rounded-full text-ink/60 hover:text-teal hover:bg-teal/5 font-medium transition-all text-sm">Pricing</Link>
                        <Link href="/faq" className="px-4 py-2 rounded-full text-ink/60 hover:text-teal hover:bg-teal/5 font-medium transition-all text-sm">Help</Link>
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
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-ink/5 shadow-xl animate-in slide-in-from-top-2 duration-200 h-screen overflow-y-auto pb-24">
                    <nav className="flex flex-col p-6 space-y-2">
                        {showFreeCta && (
                            <Link
                                href="/create"
                                className="w-full bg-gradient-to-r from-teal to-teal/80 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-teal/20 flex items-center justify-center gap-2 mb-4"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Start creating for free
                            </Link>
                        )}

                        <Link
                            href="/#gallery"
                            className="px-4 py-3 rounded-xl text-ink/60 font-medium hover:bg-ink/5 hover:text-ink transition-all"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Mockup Gallery
                        </Link>

                        <div className="pt-2 pb-2">
                            <div className="px-4 text-xs font-bold text-ink/30 uppercase tracking-wider mb-2">Products</div>
                            <Link
                                href="/custom"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink/60 font-medium hover:bg-ink/5 hover:text-ink transition-all"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Box size={18} />
                                Create Scene
                            </Link>
                            <Link
                                href="/animate"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink/60 font-medium hover:bg-ink/5 hover:text-ink transition-all"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Video size={18} />
                                <div className="flex items-center gap-2">
                                    Animate
                                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
                                </div>
                            </Link>
                            <Link
                                href="/experimental"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink/60 font-medium hover:bg-ink/5 hover:text-ink transition-all"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Beaker size={18} />
                                <div className="flex items-center gap-2">
                                    Experimental
                                    <span className="bg-teal/10 text-teal text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal/20">LAB</span>
                                </div>
                            </Link>
                        </div>

                        <Link
                            href="/pricing"
                            className="px-4 py-3 rounded-xl text-ink/60 font-medium hover:bg-ink/5 hover:text-ink transition-all"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/faq"
                            className="px-4 py-3 rounded-xl text-ink/60 font-medium hover:bg-ink/5 hover:text-ink transition-all"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Help
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
