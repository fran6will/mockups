import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/ui/Header';
import { Download, Calendar, Image as ImageIcon } from 'lucide-react';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    // Fetch user's generations
    const { data: generations, error } = await supabase
        .from('generations')
        .select(`
            *,
            products (
                title,
                base_image_url
            )
        `)
        .eq('user_id', user.id)
        .eq('status', 'success')
        .order('created_at', { ascending: false });

    // Fetch subscription
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, ends_at, customer_portal_url')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    const isPro = subscription && (
        subscription.status === 'active' ||
        subscription.status === 'on_trial' ||
        (subscription.status === 'cancelled' && subscription.ends_at && new Date(subscription.ends_at) > new Date())
    );

    return (
        <div className="min-h-screen font-sans text-ink selection:bg-teal/20">
            <Header />

            <main className="max-w-7xl mx-auto px-6 pb-20">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-ink mb-4 tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-xl text-ink/60">
                            Welcome back, {user.user_metadata?.full_name || user.email}.
                        </p>
                    </div>

                    {/* Membership Status Card */}
                    <div className="bg-white p-6 rounded-2xl border border-ink/5 shadow-sm flex items-center gap-6">
                        <div>
                            <div className="text-sm text-ink/40 font-bold uppercase tracking-wider mb-1">Membership</div>
                            <div className="flex items-center gap-2">
                                {isPro ? (
                                    <>
                                        <div className="w-3 h-3 rounded-full bg-teal animate-pulse"></div>
                                        <span className="font-bold text-teal text-lg">Pro Member</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                        <span className="font-bold text-ink/60 text-lg">Free Tier</span>
                                    </>
                                )}
                            </div>
                        </div>
                        {isPro && subscription?.customer_portal_url && (
                            <a
                                href={subscription.customer_portal_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-ink/5 hover:bg-ink/10 text-ink font-bold rounded-lg text-sm transition-colors"
                            >
                                Manage
                            </a>
                        )}
                        {!isPro && (
                            <a
                                href="/pricing"
                                className="px-4 py-2 bg-teal text-cream hover:bg-teal/90 font-bold rounded-lg text-sm transition-colors shadow-lg shadow-teal/20"
                            >
                                Upgrade
                            </a>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-ink mb-4">Your Creations</h2>
                </div>

                {generations && generations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {generations.map((gen: any) => (
                            <div key={gen.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-ink/5 hover:shadow-xl hover:shadow-teal/10 transition-all duration-300">
                                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                    {gen.image_url ? (
                                        <img
                                            src={gen.image_url}
                                            alt="Generated Mockup"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-ink/20">
                                            <ImageIcon size={48} />
                                        </div>
                                    )}

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                        {gen.image_url && (
                                            <a
                                                href={gen.image_url}
                                                download={`mockup-${gen.id}.png`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-white text-ink font-bold py-3 px-6 rounded-full flex items-center gap-2 hover:bg-teal hover:text-cream transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
                                            >
                                                <Download size={18} />
                                                Download
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold text-lg text-ink truncate pr-4">
                                            {gen.products?.title || 'Unknown Product'}
                                        </h3>
                                        <span className="text-xs font-mono bg-ink/5 px-2 py-1 rounded text-ink/50">
                                            {gen.meta?.aspect_ratio || '1:1'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-ink/40">
                                        <Calendar size={14} />
                                        {new Date(gen.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-ink/10">
                        <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6 text-teal">
                            <ImageIcon size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-ink mb-2">No mockups yet</h3>
                        <p className="text-ink/60 mb-8 max-w-md mx-auto">
                            You haven't generated any mockups yet. Visit the gallery to pick a product and start creating!
                        </p>
                        <a href="/gallery" className="inline-flex items-center gap-2 bg-teal text-cream font-bold py-3 px-8 rounded-xl hover:bg-teal/90 transition-all shadow-lg shadow-teal/20">
                            Browse Gallery
                        </a>
                    </div>
                )}
            </main>
        </div>
    );
}
