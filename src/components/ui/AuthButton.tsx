'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { LogIn, LogOut, User, LayoutDashboard, Coins, Mail, X, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { trackPixelEvent } from '@/components/analytics/MetaPixel';

export default function AuthButton() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [credits, setCredits] = useState<number | null>(null);

    // Modal State
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);

    const fetchCredits = async (userId: string) => {
        const { data } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single();

        if (data) {
            setCredits(data.balance);
        }
    };

    useEffect(() => {
        // Check active session
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user || null;
            setUser(currentUser);

            if (currentUser) {
                fetchCredits(currentUser.id);
            }

            setLoading(false);
        };

        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user || null;
            setUser(currentUser);
            if (currentUser) {
                fetchCredits(currentUser.id);
                setIsOpen(false); // Close modal on login
            } else {
                setCredits(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        trackPixelEvent('CompleteRegistration', { content_name: 'Google OAuth' });
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
            },
        });
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        trackPixelEvent('CompleteRegistration', { content_name: 'Magic Link' });
        setIsMagicLinkLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
            },
        });
        setIsMagicLinkLoading(false);

        if (error) {
            alert(error.message);
        } else {
            setMagicLinkSent(true);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    if (loading) {
        return <div className="w-8 h-8 rounded-full bg-teal/10 animate-pulse" />;
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                {credits !== null && (
                    <div className="hidden sm:flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200">
                        <Coins size={14} />
                        <span>{credits}</span>
                    </div>
                )}

                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-bold text-ink hover:text-teal transition-colors"
                >
                    <LayoutDashboard size={18} />
                    <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-red-500 transition-colors"
                    title="Sign Out"
                >
                    <LogOut size={18} />
                </button>
                <div className="w-8 h-8 rounded-full bg-teal text-cream flex items-center justify-center text-xs font-bold overflow-hidden border-2 border-white shadow-sm">
                    {user.user_metadata?.avatar_url ? (
                        <Image
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            fill
                            className="object-cover"
                            sizes="32px"
                        />
                    ) : (
                        user.email?.charAt(0).toUpperCase()
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-white/80 hover:bg-white text-ink font-bold py-2 px-4 rounded-full shadow-sm hover:shadow-md transition-all text-sm border border-ink/5"
            >
                <LogIn size={16} />
                <span>Sign in</span>
            </button>

            {/* Auth Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-ink/40 hover:text-ink transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold text-ink mb-2">Welcome</h2>
                        <p className="text-ink/60 mb-8">Sign in or create an account to access your mockups</p>

                        {magicLinkSent ? (
                            <div className="bg-teal/5 border border-teal/20 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-2">
                                <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4 text-teal">
                                    <Check size={24} />
                                </div>
                                <h3 className="font-bold text-ink mb-2">Check your email</h3>
                                <p className="text-sm text-ink/60 mb-4">
                                    We sent a magic link to <span className="font-bold text-ink">{email}</span>
                                </p>
                                <button
                                    onClick={() => setMagicLinkSent(false)}
                                    className="text-sm text-teal font-bold hover:underline"
                                >
                                    Try a different email
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full flex items-center justify-center gap-3 bg-white border border-ink/10 hover:bg-gray-50 text-ink font-bold py-3 px-4 rounded-xl transition-all"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Continue with Google
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-ink/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-ink/40 font-bold">Or continue with email</span>
                                    </div>
                                </div>

                                <form onSubmit={handleMagicLink} className="space-y-3">
                                    <div>
                                        <label className="sr-only">Email address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink/40">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-3 border border-ink/10 rounded-xl leading-5 bg-white placeholder-ink/40 focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all sm:text-sm"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isMagicLinkLoading || !email}
                                        className="w-full flex items-center justify-center gap-2 bg-ink text-white font-bold py-3 px-4 rounded-xl hover:bg-ink/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isMagicLinkLoading ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            'Send Magic Link'
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
