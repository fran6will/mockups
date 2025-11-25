'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { LogIn, LogOut, User, LayoutDashboard, Coins } from 'lucide-react';
import Link from 'next/link';

export default function AuthButton() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [credits, setCredits] = useState<number | null>(null);

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
            } else {
                setCredits(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
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
                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        user.email?.charAt(0).toUpperCase()
                    )}
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={handleLogin}
            className="flex items-center gap-2 bg-white/80 hover:bg-white text-ink font-bold py-2 px-4 rounded-full shadow-sm hover:shadow-md transition-all text-sm border border-ink/5"
        >
            <LogIn size={16} />
            <span>Sign in</span>
        </button>
    );
}
