'use client';

import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Header from '@/components/ui/Header';
import Banner from '@/components/ui/Banner';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';

export default function PricingPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [lemonSqueezyCheckoutUrl, setLemonSqueezyCheckoutUrl] = useState<string>('#');


    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUserId(session.user.id);
            }
        };
        getSession();
    }, []);

    useEffect(() => {
        const baseUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL;
        if (baseUrl) {
            let url = baseUrl;
            // Add user_id to passthrough
            if (userId) {
                url += `?passthrough[user_id]=${userId}`;
            }

            // Add redirect_url
            // We use window.location.origin because this runs on the client
            console.log('Current origin:', window.location.origin);
            const redirectUrl = encodeURIComponent(`${window.location.origin}/dashboard`);
            // Check if we already have query params (we likely do from passthrough)
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}checkout[redirect_url]=${redirectUrl}`;

            setLemonSqueezyCheckoutUrl(url);
        } else {
            console.error('NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL is not set');
        }
    }, [userId]);

    return (
        <div className="min-h-screen font-sans text-ink selection:bg-teal/20 bg-fixed" style={{
            backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(42, 127, 127, 0.15) 0%, var(--color-cream) 60%)'
        }}>
            <Banner />
            <Header />

            <main className="max-w-7xl mx-auto px-6 pb-20 pt-12">
                <div className="text-center mb-20">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-teal/10 text-teal text-sm font-bold uppercase tracking-wider border border-teal/10">
                        Membership
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-ink tracking-tight">
                        Unlock Your Creative Potential
                    </h1>
                    <p className="text-xl text-ink/60 max-w-2xl mx-auto leading-relaxed">
                        Choose the plan that fits your workflow. Whether you're a one-off creator or a power user, we have you covered.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">

                    {/* Pay As You Go Card */}
                    <div className="glass rounded-[2.5rem] p-8 flex flex-col relative md:hover:-translate-y-2 transition-transform duration-500 border-2 border-teal/10">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2 text-ink">Pay As You Go</h2>
                            <p className="text-ink/60 text-sm">Flexible credits.</p>
                        </div>
                        <div className="text-4xl font-bold mb-6 text-ink tracking-tighter">
                            $4.99<span className="text-sm text-ink/40 font-bold tracking-normal">/50 credits</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1 text-sm">
                            {[
                                "50 generations included",
                                "Credits never expire",
                                "No monthly commitment",
                                "Access to all tools"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-ink/80 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-teal/10 flex items-center justify-center text-teal shrink-0">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-auto">
                            {userId ? (
                                <a
                                    href={`https://copiecolle.lemonsqueezy.com/buy/7e455bb9-014b-442d-b6e3-3e0b39b7b492?checkout[custom][user_id]=${userId}&checkout[redirect_url]=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`)}`}
                                    className="group block w-full py-3 rounded-xl bg-teal/10 text-teal font-bold text-center hover:bg-teal hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                                >
                                    Buy 50 Credits <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </a>
                            ) : (
                                <button
                                    onClick={async () => {
                                        await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: {
                                                redirectTo: `${window.location.origin}/pricing`,
                                            },
                                        });
                                    }}
                                    className="group block w-full py-3 rounded-xl bg-teal/10 text-teal font-bold text-center hover:bg-teal hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                                >
                                    Sign in to Buy <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Pro Member Card */}
                    <div className="bg-gradient-to-b from-teal to-[#1F6666] text-white rounded-[2.5rem] p-8 shadow-2xl shadow-teal/30 transform md:scale-105 relative flex flex-col border border-white/10 z-10">
                        <div className="absolute -top-4 inset-x-0 flex justify-center">
                            <div className="bg-white text-teal text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1">
                                <Sparkles size={12} fill="currentColor" /> Most Popular
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2">Pro Member</h2>
                            <p className="text-white/80 text-sm">Unlimited creative freedom.</p>
                        </div>
                        <div className="text-4xl font-bold mb-6 tracking-tighter">
                            $19<span className="text-sm text-white/60 font-bold tracking-normal">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1 text-sm">
                            {[
                                "Access to ALL templates",
                                "Priority generation speed",
                                "Early access to new drops",
                                "Commercial license included",
                                "Premium 4K export"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-auto">
                            {userId ? (
                                <a
                                    href={lemonSqueezyCheckoutUrl}
                                    className="group block w-full py-3 rounded-xl bg-white text-teal font-bold text-center hover:bg-cream transition-all shadow-xl flex items-center justify-center gap-2 text-sm"
                                >
                                    Get Pro Access <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </a>
                            ) : (
                                <button
                                    onClick={async () => {
                                        await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: {
                                                redirectTo: `${window.location.origin}/pricing`,
                                            },
                                        });
                                    }}
                                    className="group block w-full py-3 rounded-xl bg-white text-teal font-bold text-center hover:bg-cream transition-all shadow-xl flex items-center justify-center gap-2 text-sm"
                                >
                                    Sign in to Subscribe <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>

                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    </div>
                </div>

                <div className="mt-24 text-center">
                    <p className="text-ink/40 text-sm font-medium">
                        Secure payments powered by Lemon Squeezy. Cancel anytime.
                    </p>
                </div>
            </main>
        </div>
    );
}
