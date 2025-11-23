'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase/client';
import ImageCompositor from '@/components/customer/ImageCompositor';
import { Lock, ArrowRight, Info, Zap, RefreshCw, Ban, Star } from 'lucide-react';
import Banner from '@/components/ui/Banner';
import Header from '@/components/ui/Header';
import { useAccess } from '@/hooks/use-access';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Check Pro Access
    const { accessLevel } = useAccess();
    const isPro = accessLevel === 'pro';

    useEffect(() => {
        const fetchProduct = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                setError('Product not found');
            } else {
                setProduct(data);
            }
            setLoading(false);
        };

        fetchProduct();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cream">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal mb-4"></div>
            <p className="text-ink/50 font-bold animate-pulse">Loading Studio...</p>
        </div>
    );

    if (error || !product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-ink">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-ink/60">The product you are looking for does not exist.</p>
            <a href="/gallery" className="mt-6 text-teal font-bold hover:underline">Return to Gallery</a>
        </div>
    );

    return (
        <div className="min-h-screen font-sans text-ink selection:bg-teal/20 bg-fixed" style={{
             backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(42, 127, 127, 0.15) 0%, var(--color-cream) 60%)'
        }}>
            <Banner />
            <Header />

            <main className="max-w-7xl mx-auto p-4 lg:p-8 pt-8">
                
                {/* Guest Welcome Card - Only show if NOT Pro */}
                {!isPro && (
                    <div className="glass mb-8 p-8 rounded-3xl border border-white/50 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-4 text-ink flex items-center gap-2">
                                <span className="text-3xl">✨</span> Premium Mockup Studio
                            </h2>
                            <p className="text-lg text-ink/80 mb-6 leading-relaxed max-w-3xl">
                                You are moments away from a professional product shot. 
                                If you have an access code (from a purchase), enter it below. 
                                Otherwise, sign in to unlock this template.
                            </p>

                            <div className="grid md:grid-cols-3 gap-6 text-sm text-ink/80 mb-8">
                                <div className="flex flex-col gap-3 bg-white/30 p-4 rounded-2xl border border-white/40">
                                    <div className="bg-red-100 text-red-600 w-10 h-10 rounded-full flex items-center justify-center"><Ban size={20} /></div>
                                    <div>
                                        <strong>No Photoshop Needed</strong><br />
                                        Forget complex software. This tool runs entirely in your browser.
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 bg-white/30 p-4 rounded-2xl border border-white/40">
                                    <div className="bg-teal/10 text-teal w-10 h-10 rounded-full flex items-center justify-center"><Zap size={20} /></div>
                                    <div>
                                        <strong>AI-Powered Realism</strong><br />
                                        Our engine automatically handles lighting, texture, and warping.
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 bg-white/30 p-4 rounded-2xl border border-white/40">
                                    <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center"><Star size={20} /></div>
                                    <div>
                                        <strong>Professional Quality</strong><br />
                                        Generate high-resolution images ready for your shop.
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start p-4 bg-teal/5 border border-teal/10 rounded-xl text-sm text-ink/70">
                                <Info size={20} className="shrink-0 text-teal mt-0.5" />
                                <p>
                                    <strong>Tip:</strong> AI tools work best with transparent PNG logos. 
                                    If the result isn't perfect, try adjusting the scale or rotation and regenerating.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <ImageCompositor
                    productId={product.id}
                    baseImageUrl={product.base_image_url}
                    passwordHash={product.password_hash}
                />

                <SimilarProducts currentProduct={product} />
            </main>
        </div>
    );
}

function SimilarProducts({ currentProduct }: { currentProduct: any }) {
    const [similar, setSimilar] = useState<any[]>([]);

    useEffect(() => {
        const fetchSimilar = async () => {
            if (!currentProduct.tags || currentProduct.tags.length === 0) return;

            const { data } = await supabase
                .from('products')
                .select('*')
                .contains('tags', currentProduct.tags)
                .neq('id', currentProduct.id)
                .limit(3);

            if (data) setSimilar(data);
        };
        fetchSimilar();
    }, [currentProduct]);

    if (similar.length === 0) return null;

    return (
        <div className="mt-20 border-t border-ink/5 pt-12">
            <h3 className="text-2xl font-bold text-ink mb-8">You might also like</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {similar.map(product => (
                    <a
                        key={product.id}
                        href={`/${product.slug}`}
                        className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-teal/10 hover:-translate-y-1 transition-all duration-500 border border-ink/5"
                    >
                        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                            <div className="absolute inset-0 bg-teal/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-multiply"></div>
                            <img
                                src={product.gallery_image_url || product.base_image_url}
                                alt={product.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="p-4">
                             <h4 className="text-ink font-bold group-hover:text-teal transition-colors">{product.title}</h4>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}