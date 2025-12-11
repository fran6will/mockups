import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Header from '@/components/ui/Header';
import TryItPlayground from '@/components/landing/TryItPlayground';
import { Sparkles, Loader2, ArrowRight, Zap, Crown, Coins, LayoutDashboard } from 'lucide-react';
import { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Mockup | CopiéCollé',
    description: 'Generate stunning product mockups with AI. Upload your design and see it on real products in seconds.',
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function CreatePage() {
    // Check if user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    // Fetch user's credit balance
    const { data: credits } = await supabaseAdmin
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .single();

    const balance = credits?.balance ?? 0;

    // Check if user is Pro
    const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('status, ends_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    const isActive = subscription?.status === 'active' || subscription?.status === 'on_trial';
    const isCancelledButValid = subscription?.status === 'cancelled' &&
        subscription?.ends_at && new Date(subscription.ends_at) > new Date();
    const isPro = isActive || isCancelledButValid;

    // Fetch free products (same as TryItSection)
    const { data: freeProducts } = await supabaseAdmin
        .from('products')
        .select('id, slug, title, base_image_url, gallery_image_url, password_hash')
        .eq('is_free', true)
        .limit(5);

    if (!freeProducts || freeProducts.length === 0) {
        return (
            <div className="min-h-screen font-sans text-ink selection:bg-teal/20 bg-grid-pattern bg-grain">
                <Header />
                <main className="max-w-7xl mx-auto px-6 py-24 text-center">
                    <h1 className="text-3xl font-bold mb-4">No Templates Available</h1>
                    <p className="text-ink/60 mb-8">We're setting up new templates. Check back soon!</p>
                    <Link href="/" className="text-teal font-bold hover:underline">
                        Go Home
                    </Link>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans text-ink selection:bg-teal/20 bg-grid-pattern bg-grain relative overflow-hidden">
            <Header />

            {/* High-Converting Floating Trial Banner - Only show if not Pro */}
            {!isPro && (
                <div className="fixed bottom-6 left-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className="max-w-2xl mx-auto bg-gradient-to-r from-ink via-ink to-purple-900 text-white py-4 px-6 rounded-2xl shadow-2xl shadow-ink/30 border border-white/10">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center justify-center w-8 h-8 bg-yellow-400 text-ink rounded-full animate-pulse">
                                    <Crown size={16} />
                                </div>
                                <p className="font-bold text-sm sm:text-base text-center sm:text-left">
                                    🔓 Unlock <span className="text-yellow-400">500+ mockups</span> & <span className="text-yellow-400">4K exports</span>
                                </p>
                            </div>
                            <Link
                                href="/pricing"
                                className="bg-yellow-400 text-ink font-black text-sm px-5 py-2.5 rounded-full hover:bg-yellow-300 hover:scale-105 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap"
                            >
                                <Zap size={14} className="fill-current" /> Try FREE for 7 Days
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <main className="relative z-10 pt-8 pb-24">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal/5 rounded-full blur-3xl -z-10"></div>

                <div className="max-w-7xl mx-auto px-6">
                    {/* Welcome Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 text-teal font-bold text-sm mb-6">
                            <Sparkles size={16} />
                            <span>You have <strong>{balance}</strong> credits</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-ink mb-6 tracking-tight">
                            Create Your <span className="text-teal">Mockup</span>
                        </h1>
                        <p className="text-lg text-ink/60 max-w-2xl mx-auto">
                            Pick a template, upload your design, and hit generate. It's that simple.
                        </p>
                    </div>

                    {/* Editor */}
                    <Suspense fallback={
                        <div className="h-[600px] flex items-center justify-center">
                            <Loader2 className="animate-spin text-teal" size={32} />
                        </div>
                    }>
                        <TryItPlayground products={freeProducts} />
                    </Suspense>

                    {/* Enhanced Bottom Section */}
                    <div className="mt-16 space-y-8">
                        {/* Upsell - Only show if not Pro */}
                        {!isPro && (
                            <div className="text-center bg-gradient-to-br from-ink/5 to-purple-500/5 rounded-3xl p-8 border border-ink/10">
                                <p className="text-lg font-bold text-ink mb-2">Want unlimited mockups and videos?</p>
                                <p className="text-sm text-ink/50 mb-6">Choose the option that works best for you</p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        href="/pricing"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal text-white font-bold hover:bg-teal/90 hover:scale-105 transition-all shadow-lg shadow-teal/20"
                                    >
                                        <Crown size={18} /> View Pro Plans
                                    </Link>
                                    <Link
                                        href="/pricing#credits"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-ink font-bold hover:bg-ink/5 transition-all border border-ink/10 shadow-sm"
                                    >
                                        <Coins size={18} /> Buy Credit Packs
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Dashboard Link */}
                        <div className="text-center">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 text-ink/60 hover:text-teal font-bold transition-colors"
                            >
                                <LayoutDashboard size={18} /> View your generations in Dashboard <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

