'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Sparkles, ArrowRight } from 'lucide-react';

interface TryItGateProps {
    children: React.ReactNode;
}

export default function TryItGate({ children }: TryItGateProps) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
            setLoading(false);
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/#try-it`,
            },
        });
    };

    if (loading) {
        return (
            <div className="h-[600px] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-teal/10 animate-pulse" />
            </div>
        );
    }

    if (user) {
        return <>{children}</>;
    }

    return (
        <div className="relative h-[500px] flex items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/50 backdrop-blur-xl shadow-2xl shadow-teal/5">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 z-0"></div>

            <div className="relative z-10 text-center max-w-md px-6">
                <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center text-teal mx-auto mb-6">
                    <Sparkles size={32} />
                </div>

                <h3 className="text-3xl font-bold text-ink mb-4">
                    Ready to create magic?
                </h3>

                <p className="text-ink/60 mb-8 text-lg">
                    Sign in to start your free trial. We'll save your work so you don't lose it.
                </p>

                <button
                    onClick={handleLogin}
                    className="w-full py-4 rounded-xl bg-teal text-cream font-bold text-lg hover:bg-teal/90 hover:shadow-lg hover:shadow-teal/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                    Sign in to Start <ArrowRight size={20} />
                </button>

                <p className="mt-4 text-xs text-ink/40">
                    No credit card required.
                </p>
            </div>
        </div>
    );
}
