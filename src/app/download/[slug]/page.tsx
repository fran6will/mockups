import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Download, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import Header from '@/components/ui/Header';
import ClaimCreditsButton from '@/components/customer/ClaimCreditsButton';

export const metadata = {
    title: 'Download Your Mockup | Copié-Collé',
    description: 'Download your purchased Etsy mockup and try it with our AI tool.',
    robots: 'noindex, nofollow' // Keep it secret
};

export default async function DownloadPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    // 1. Fetch the Secret Link Data
    const { data: link, error } = await supabase
        .from('etsy_links')
        .select(`
            *,
            products (
                id,
                title,
                slug,
                base_image_url,
                description,
                password_hash
            )
        `)
        .eq('slug', slug)
        .single();

    if (error || !link) {
        console.error('Link fetch error:', error);
        notFound();
    }

    // 2. Fetch Recommendations (Random 3 products, excluding current)
    const { data: recommendations } = await supabase
        .from('products')
        .select('id, title, slug, base_image_url, is_free')
        .neq('id', link.product_id)
        .limit(3);

    // Helper to convert Drive URL to Direct Download
    const getDirectDownloadUrl = (url: string) => {
        console.log('Processing Drive URL:', url); // Debug log
        try {
            let id = '';
            // Handle standard drive.google.com/file/d/ID/view
            const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (idMatch && idMatch[1]) {
                id = idMatch[1];
            } else {
                // Handle drive.google.com/open?id=ID
                const idParamMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
                if (idParamMatch && idParamMatch[1]) {
                    id = idParamMatch[1];
                }
            }

            if (id) {
                // Add confirm=t to attempt to bypass large file virus scan warning
                return `https://drive.google.com/uc?export=download&id=${id}&confirm=t`;
            }

            return url;
        } catch (e) {
            console.error('Error parsing Drive URL:', e);
            return url;
        }
    };

    return (
        <div className="min-h-screen font-sans text-ink bg-[#F2F0E9]">
            <Header className="mb-8" />

            <main className="max-w-4xl mx-auto px-6 pb-20">
                {/* Hero Section */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-teal/10 rounded-full mb-6 text-teal">
                        <ShoppingBag size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4 tracking-tight">
                        Thank you for your purchase!
                    </h1>
                    <p className="text-lg text-ink/60 max-w-xl mx-auto">
                        We appreciate your support. Here is your download and a special bonus to help you create stunning product images.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* Download Card */}
                    <div className="glass p-8 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20"></div>

                        <h2 className="text-2xl font-bold text-ink mb-2">1. Download PSD</h2>
                        <p className="text-ink/60 mb-8 text-sm">
                            Get your high-quality Photoshop file with smart objects.
                        </p>

                        <div className="flex justify-center mb-8">
                            <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center relative rotate-3 transition-transform group-hover:rotate-0 duration-500">
                                <img
                                    src={link.products.base_image_url}
                                    alt="Preview"
                                    className="w-28 h-28 object-cover rounded-xl"
                                />
                                <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white p-2 rounded-lg shadow-md">
                                    <span className="text-xs font-bold">PSD</span>
                                </div>
                            </div>
                        </div>

                        <a
                            href={getDirectDownloadUrl(link.google_drive_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-blue-600 text-white font-bold text-center py-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={20} />
                            Download Files
                        </a>
                        <p className="text-center text-xs text-ink/40 mt-3">
                            Opens in Google Drive
                        </p>
                    </div>

                    {/* AI Upsell Card - Highlighted */}
                    <div className="glass p-1 rounded-3xl shadow-2xl relative overflow-hidden group bg-gradient-to-br from-teal/20 via-purple-500/20 to-teal/20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-3xl"></div>

                        {/* Best Value Badge */}
                        <div className="absolute top-0 right-0 z-20">
                            <div className="bg-gradient-to-r from-teal to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl shadow-lg flex items-center gap-1">
                                <Sparkles size={12} className="animate-pulse" />
                                BEST VALUE
                            </div>
                        </div>

                        <div className="relative z-10 p-8">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal/30 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>

                            <div className="flex flex-col mb-4">
                                <span className="text-teal font-bold text-xs tracking-widest uppercase mb-1">New Feature</span>
                                <h2 className="text-3xl font-bold text-ink leading-tight">
                                    Instant Mockup Generator
                                </h2>
                            </div>

                            <p className="text-ink/70 mb-8 text-sm leading-relaxed">
                                Don't waste time in Photoshop. Upload your design and get a <span className="font-bold text-teal">photorealistic result in seconds</span> using our AI engine.
                            </p>

                            <div className="flex justify-center mb-10 relative">
                                <div className="w-40 h-40 bg-white rounded-2xl shadow-2xl flex items-center justify-center relative -rotate-6 transition-transform group-hover:rotate-0 duration-500 z-10 border-4 border-white">
                                    <img
                                        src={link.products.base_image_url}
                                        alt="AI Preview"
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                    <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                                        <div className="bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/50 shadow-lg">
                                            <Sparkles className="text-white drop-shadow-md" size={32} />
                                        </div>
                                    </div>

                                    {/* Floating UI Elements for "Tech" feel */}
                                    <div className="absolute -right-4 -top-4 bg-white p-2 rounded-lg shadow-lg text-[10px] font-bold text-ink/60 flex items-center gap-1 animate-bounce delay-700">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        AI Ready
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border border-teal/20 rounded-full animate-[spin_8s_linear_infinite]"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-dashed border-purple-500/20 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>
                            </div>

                            <div className="bg-white/50 rounded-2xl p-1 backdrop-blur-sm shadow-inner">
                                <ClaimCreditsButton
                                    productId={link.products.id}
                                    productSlug={link.products.slug}
                                    passwordHash={link.products.password_hash}
                                />
                            </div>

                            <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-ink/40 font-medium uppercase tracking-wider">
                                <span className="flex items-center gap-1"><div className="w-1 h-1 bg-teal rounded-full"></div> No Photoshop</span>
                                <span className="flex items-center gap-1"><div className="w-1 h-1 bg-teal rounded-full"></div> 4K Export</span>
                                <span className="flex items-center gap-1"><div className="w-1 h-1 bg-teal rounded-full"></div> Commercial Use</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                {recommendations && recommendations.length > 0 && (
                    <div className="mt-20 border-t border-ink/5 pt-12">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-ink">You might also like</h3>
                            <Link href="/" className="text-teal font-bold text-sm flex items-center gap-1 hover:underline">
                                View all <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {recommendations.map((product: any) => (
                                <Link key={product.id} href={`/${product.slug}`} className="group block">
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-ink/5 hover:shadow-md transition-all relative aspect-square mb-3">
                                        <img
                                            src={product.base_image_url}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {product.is_free && (
                                            <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                                FREE
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-ink group-hover:text-teal transition-colors truncate">
                                        {product.title}
                                    </h4>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
