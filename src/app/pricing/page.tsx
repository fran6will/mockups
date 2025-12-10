'use client';

import Link from 'next/link';
import { Check, Sparkles, ArrowRight, Settings } from 'lucide-react';
import Header from '@/components/ui/Header';

import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';
import { trackPixelEvent } from '@/components/analytics/MetaPixel';

export default function PricingPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [loadingSub, setLoadingSub] = useState(false);

    const SUBSCRIPTION_URL = 'https://copiecolle.lemonsqueezy.com/buy/1c68621e-5709-4124-adf8-a269def1b5b3';
    const STARTER_PACK_URL = 'https://copiecolle.lemonsqueezy.com/buy/85a300fc-479d-4528-9249-7b5736541316';
    const CREATOR_PACK_URL = 'https://copiecolle.lemonsqueezy.com/buy/373e7490-206a-4245-b484-793667ded21b';
    const AGENCY_PACK_URL = 'https://copiecolle.lemonsqueezy.com/buy/bce3aad8-13c1-4fbf-b123-38396fccf697';

    const getCheckoutUrl = (baseUrl: string, price?: number) => {
        if (!baseUrl) return '#';
        let url = baseUrl;

        // Helper to append params
        const addParam = (key: string, value: string) => {
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}${key}=${value}`;
        };

        // Add discount code (Example)
        // addParam('checkout[discount_code]', 'BF2025');

        if (userId) {
            addParam('checkout[custom][user_id]', userId);
        }

        // Construct redirect URL with success flags for the Pixel
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        let redirectPath = `${origin}/dashboard?payment_success=true`;
        if (price) {
            redirectPath += `&value=${price}`;
        }

        const redirectUrl = encodeURIComponent(redirectPath);
        addParam('checkout[redirect_url]', redirectUrl);

        return url;
    };

    const handleInitiateCheckout = (name: string, value: number) => {
        trackPixelEvent('InitiateCheckout', {
            content_name: name,
            value: value,
            currency: 'CAD'
        });
    };

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUserId(session.user.id);
                fetchSubscription(session.user.id);
            }
        };
        getSession();
    }, []);

    const fetchSubscription = async (uid: string) => {
        setLoadingSub(true);
        const { data } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', uid)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (data) {
            const isActive = data.status === 'active' || data.status === 'on_trial';
            const isCancelledButValid = data.status === 'cancelled' &&
                data.ends_at &&
                new Date(data.ends_at) > new Date();

            if (isActive || isCancelledButValid) {
                setSubscription(data);
            }
        }
        setLoadingSub(false);
    };

    const isPro = !!subscription;

    return (
        <div className="min-h-screen font-sans text-ink selection:bg-teal/20 bg-fixed" style={{
            backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(42, 127, 127, 0.15) 0%, var(--color-cream) 60%)'
        }}>

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

                {/* Pro Member Card (Featured) */}
                <div className="max-w-4xl mx-auto mb-20">
                    <div className="bg-gradient-to-b from-teal to-[#1F6666] text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-teal/30 relative overflow-hidden border border-white/10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-block bg-white text-teal text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider mb-6">
                                    <Sparkles size={12} fill="currentColor" className="inline mr-1" /> Most Popular
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Pro Membership</h2>
                                <p className="text-white/80 text-lg mb-8">
                                    The ultimate toolkit for professional creators. Unlimited possibilities.
                                </p>
                                <div className="text-5xl font-bold mb-2 tracking-tighter flex items-baseline gap-3">
                                    <span>$19.99<span className="text-lg text-white/60 font-bold tracking-normal">/mo CAD</span></span>
                                </div>
                                <div className="bg-yellow-400 text-ink text-xs font-black px-2 py-1 rounded inline-block mb-2 uppercase tracking-wider animate-pulse">
                                    7 Days Free
                                </div>
                                <p className="text-white/60 text-sm mb-8">Then $19.99/mo. Cancel anytime.</p>

                                {userId ? (
                                    isPro ? (
                                        <a
                                            href={subscription.customer_portal_url || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group inline-flex w-full md:w-auto px-8 py-4 rounded-xl bg-white/20 text-white font-bold text-center hover:bg-white/30 transition-all shadow-xl items-center justify-center gap-2 backdrop-blur-sm border border-white/20"
                                        >
                                            <Settings size={18} /> Manage Subscription
                                        </a>
                                    ) : (
                                        <a
                                            href={getCheckoutUrl(SUBSCRIPTION_URL, 19.99)}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleInitiateCheckout('Pro Membership', 19.99);
                                                const url = getCheckoutUrl(SUBSCRIPTION_URL, 19.99);
                                                if (window.gtag_report_conversion) {
                                                    window.gtag_report_conversion(url, 19.99, 'CAD');
                                                } else {
                                                    window.location.href = url;
                                                }
                                            }}
                                            className="group inline-flex w-full md:w-auto px-8 py-4 rounded-xl bg-white text-teal font-bold text-center hover:bg-cream transition-all shadow-xl items-center justify-center gap-2"
                                        >
                                            Start 7-Day Free Trial <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    )
                                ) : (
                                    <button
                                        onClick={async () => {
                                            handleInitiateCheckout('Pro Membership', 19.99);
                                            // For sign-in, we don't track conversion yet as they haven't purchased
                                            await supabase.auth.signInWithOAuth({
                                                provider: 'google',
                                                options: { redirectTo: `${window.location.origin}/pricing` },
                                            });
                                        }}
                                        className="group inline-flex w-full md:w-auto px-8 py-4 rounded-xl bg-white text-teal font-bold text-center hover:bg-cream transition-all shadow-xl items-center justify-center gap-2"
                                    >
                                        Sign in to Start Trial <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 w-full max-w-sm bg-white/10 rounded-3xl p-6 backdrop-blur-sm border border-white/10">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Check size={18} className="text-teal-300" /> Everything in Pro:
                                </h3>
                                <ul className="space-y-4 text-sm">
                                    {[
                                        "Unlimited Image Generation",
                                        "100 Bonus Credits / mo (≈ 4 Videos)",
                                        "Videos: 25 credits each",
                                        "Access to ALL templates",
                                        "Commercial license included",
                                        "Premium 4K export"
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-white/90">
                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Credit Packs Section */}
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-ink mb-4">Need more credits?</h2>
                        <p className="text-ink/60">Top up your balance anytime. Credits never expire.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Starter Pack */}
                        <div className="glass rounded-3xl p-8 border border-teal/10 hover:-translate-y-1 transition-transform duration-300">
                            <h3 className="text-xl font-bold text-ink mb-2">Starter Pack</h3>
                            <div className="text-3xl font-bold text-ink mb-1 flex items-baseline gap-2">
                                <span>$9.99 <span className="text-sm text-ink/40 font-normal">CAD</span></span>
                            </div>
                            <div className="text-teal font-bold mb-6">100 Credits</div>
                            <ul className="space-y-3 text-sm text-ink/70 mb-8">
                                <li className="flex gap-2"><Check size={16} className="text-teal" /> ≈ 20 Images</li>
                                <li className="flex gap-2"><Check size={16} className="text-teal" /> ≈ 4 Videos</li>
                            </ul>
                            {userId ? (
                                <a
                                    href={getCheckoutUrl(STARTER_PACK_URL, 9.99)}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleInitiateCheckout('Starter Pack', 9.99);
                                        const url = getCheckoutUrl(STARTER_PACK_URL, 9.99);
                                        if (window.gtag_report_conversion) {
                                            window.gtag_report_conversion(url, 9.99, 'CAD');
                                        } else {
                                            window.location.href = url;
                                        }
                                    }}
                                    className="block w-full py-3 rounded-xl bg-ink/5 text-ink font-bold text-center hover:bg-teal hover:text-white transition-all"
                                >
                                    Buy Starter
                                </a>
                            ) : (
                                <button
                                    onClick={async () => {
                                        handleInitiateCheckout('Starter Pack', 9.99);
                                        await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: { redirectTo: `${window.location.origin}/pricing` },
                                        });
                                    }}
                                    className="block w-full py-3 rounded-xl bg-ink/5 text-ink font-bold text-center hover:bg-teal hover:text-white transition-all"
                                >
                                    Sign in to Buy
                                </button>
                            )}
                        </div>

                        {/* Creator Pack */}
                        <div className="glass rounded-3xl p-8 border-2 border-teal/20 relative transform md:-translate-y-4 shadow-xl">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal text-white text-xs font-bold px-3 py-1 rounded-full">
                                BEST VALUE
                            </div>
                            <h3 className="text-xl font-bold text-ink mb-2">Creator Pack</h3>
                            <div className="text-3xl font-bold text-ink mb-1 flex items-baseline gap-2">
                                <span>$34.99 <span className="text-sm text-ink/40 font-normal">CAD</span></span>
                            </div>
                            <div className="text-teal font-bold mb-6">500 Credits</div>
                            <ul className="space-y-3 text-sm text-ink/70 mb-8">
                                <li className="flex gap-2"><Check size={16} className="text-teal" /> ≈ 100 Images</li>
                                <li className="flex gap-2"><Check size={16} className="text-teal" /> ≈ 20 Videos</li>
                            </ul>
                            {userId ? (
                                <a
                                    href={getCheckoutUrl(CREATOR_PACK_URL, 34.99)}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleInitiateCheckout('Creator Pack', 34.99);
                                        const url = getCheckoutUrl(CREATOR_PACK_URL, 34.99);
                                        if (window.gtag_report_conversion) {
                                            window.gtag_report_conversion(url, 34.99, 'CAD');
                                        } else {
                                            window.location.href = url;
                                        }
                                    }}
                                    className="block w-full py-3 rounded-xl bg-teal text-white font-bold text-center hover:bg-teal/90 transition-all shadow-lg shadow-teal/20"
                                >
                                    Buy Creator
                                </a>
                            ) : (
                                <button
                                    onClick={async () => {
                                        handleInitiateCheckout('Creator Pack', 34.99);
                                        await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: { redirectTo: `${window.location.origin}/pricing` },
                                        });
                                    }}
                                    className="block w-full py-3 rounded-xl bg-teal text-white font-bold text-center hover:bg-teal/90 transition-all shadow-lg shadow-teal/20"
                                >
                                    Sign in to Buy
                                </button>
                            )}
                        </div>

                        {/* Agency Pack */}
                        <div className="glass rounded-3xl p-8 border border-teal/10 hover:-translate-y-1 transition-transform duration-300">
                            <h3 className="text-xl font-bold text-ink mb-2">Agency Pack</h3>
                            <div className="text-3xl font-bold text-ink mb-1 flex items-baseline gap-2">
                                <span>$59.99 <span className="text-sm text-ink/40 font-normal">CAD</span></span>
                            </div>
                            <div className="text-teal font-bold mb-6">1000 Credits</div>
                            <ul className="space-y-3 text-sm text-ink/70 mb-8">
                                <li className="flex gap-2"><Check size={16} className="text-teal" /> ≈ 200 Images</li>
                                <li className="flex gap-2"><Check size={16} className="text-teal" /> ≈ 40 Videos</li>
                            </ul>
                            {userId ? (
                                <a
                                    href={getCheckoutUrl(AGENCY_PACK_URL, 59.99)}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleInitiateCheckout('Agency Pack', 59.99);
                                        const url = getCheckoutUrl(AGENCY_PACK_URL, 59.99);
                                        if (window.gtag_report_conversion) {
                                            window.gtag_report_conversion(url, 59.99, 'CAD');
                                        } else {
                                            window.location.href = url;
                                        }
                                    }}
                                    className="block w-full py-3 rounded-xl bg-ink/5 text-ink font-bold text-center hover:bg-teal hover:text-white transition-all"
                                >
                                    Buy Agency
                                </a>
                            ) : (
                                <button
                                    onClick={async () => {
                                        handleInitiateCheckout('Agency Pack', 59.99);
                                        await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: { redirectTo: `${window.location.origin}/pricing` },
                                        });
                                    }}
                                    className="block w-full py-3 rounded-xl bg-ink/5 text-ink font-bold text-center hover:bg-teal hover:text-white transition-all"
                                >
                                    Sign in to Buy
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-24 text-center">
                    <p className="text-ink/40 text-sm font-medium">
                        Secure payments powered by Lemon Squeezy. Cancel anytime. Questions? <a href="mailto:copiecolle.ai@gmail.com" className="text-teal hover:underline">copiecolle.ai@gmail.com</a>
                    </p>
                </div>
            </main>
        </div>
    );
}

