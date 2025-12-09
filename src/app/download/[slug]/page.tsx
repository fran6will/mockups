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

                <div className="grid md:grid-cols-2 gap-8 mb-16 items-start">
                    {/* Download Card - Dimmed slightly to emphasize AI */}
                    <div className="glass p-8 rounded-3xl shadow-lg border border-white/50 relative overflow-hidden group opacity-80 hover:opacity-100 transition-opacity bg-white/40">

                        <h2 className="text-xl font-bold text-ink mb-2">1. Download PSD</h2>
                        <p className="text-ink/60 mb-8 text-sm">
                            Classic Photoshop file with smart objects. Requires manual editing.
                        </p>

                        <div className="flex justify-center mb-8 grayscale group-hover:grayscale-0 transition-all duration-500">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-sm flex items-center justify-center relative rotate-1">
                                <img
                                    src={link.products.base_image_url}
                                    alt="Preview"
                                    className="w-20 h-20 object-cover rounded-xl opacity-80"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-gray-600 text-white p-1.5 rounded-md shadow-sm">
                                    <span className="text-[10px] font-bold">PSD</span>
                                </div>
                            </div>
                        </div>

                        <a
                            href={getDirectDownloadUrl(link.google_drive_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-white border border-ink/10 text-ink font-bold text-center py-3 rounded-xl hover:bg-gray-50 hover:border-ink/30 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Download size={16} />
                            Download File
                        </a>
                        <p className="text-center text-[10px] text-ink/30 mt-3">
                            Hosted on Google Drive
                        </p>
                    </div>

                    {/* AI Upsell Card - Highlighted & "Tempting" */}
                    <div className="glass p-1 rounded-3xl shadow-2xl relative overflow-hidden group bg-gradient-to-br from-teal via-purple-500 to-teal animate-[gradient_6s_linear_infinite] bg-[length:200%_200%] scale-[1.02] transform ring-4 ring-teal/10">
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-3xl"></div>

                        {/* Best Value Badge */}
                        <div className="absolute top-0 right-0 z-20">
                            <div className="bg-gradient-to-r from-teal to-purple-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl shadow-lg flex items-center gap-1">
                                <Sparkles size={12} className="animate-pulse" />
                                Most Popular
                            </div>
                        </div>

                        <div className="relative z-10 p-8">
                            <div className="flex flex-col mb-4">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-purple-600 font-bold text-xs tracking-widest uppercase mb-2 animate-pulse">Included Free Setup</span>
                                <h2 className="text-3xl lg:text-4xl font-black text-ink leading-none mb-1">
                                    Instant AI Magic.
                                </h2>
                                <p className="text-sm font-medium text-ink/40">Interactive Editor</p>
                            </div>

                            <p className="text-ink/70 mb-8 text-base leading-relaxed">
                                <span className="font-bold text-teal">Skip the PSD.</span> Drag & drop your design and watch our AI professionally light, warp, and blend it onto this product <span className="underline decoration-purple-300 decoration-2 underline-offset-2">in seconds.</span>
                            </p>

                            <div className="flex justify-center mb-10 relative">
                                <div className="w-48 h-48 bg-white rounded-2xl shadow-2xl flex items-center justify-center relative -rotate-3 transition-transform group-hover:rotate-0 duration-500 z-10 border-4 border-white/50">
                                    <img
                                        src={link.products.base_image_url}
                                        alt="AI Preview"
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                    <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
                                        <div className="bg-white/90 p-4 rounded-full backdrop-blur-md border border-white/50 shadow-2xl group-hover:scale-110 transition-transform">
                                            <Sparkles className="text-teal drop-shadow-sm fill-teal/20" size={32} />
                                        </div>
                                    </div>

                                    {/* Floating Tag */}
                                    <div className="absolute -right-6 top-8 bg-ink text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-xl rotate-12 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                        +10 Credits Free
                                    </div>
                                </div>

                                {/* Background Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal/20 rounded-full blur-[80px] -z-10 group-hover:bg-purple-500/20 transition-colors duration-1000"></div>
                            </div>

                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-2 shadow-inner border border-ink/5">
                                <ClaimCreditsButton
                                    productId={link.products.id}
                                    productSlug={link.products.slug}
                                    passwordHash={link.products.password_hash}
                                />
                                <p className="text-center text-[10px] text-ink/40 mt-2 font-medium">
                                    Risk-Free • No Credit Card Required
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-ink/50 font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1 group/item hover:text-teal transition-colors"><div className="w-1 h-1 bg-teal rounded-full"></div> Brower-Based</span>
                                <span className="flex items-center gap-1 group/item hover:text-teal transition-colors"><div className="w-1 h-1 bg-teal rounded-full"></div> 2K Export</span>
                                <span className="flex items-center gap-1 group/item hover:text-teal transition-colors"><div className="w-1 h-1 bg-teal rounded-full"></div> Commercial Use</span>
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
