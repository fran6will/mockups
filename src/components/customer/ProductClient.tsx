'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import ImageCompositor from '@/components/customer/ImageCompositor';
import { Zap, Ban, Star } from 'lucide-react';
import Banner from '@/components/ui/Banner';
import Header from '@/components/ui/Header';
import { useAccess } from '@/hooks/use-access';

interface ProductClientProps {
    product: any;
    slug: string;
}

export default function ProductClient({ product: initialProduct, slug }: ProductClientProps) {
    // We use the initialProduct passed from the server, so no loading state needed for the main product
    const [product] = useState<any>(initialProduct);
    
    // Check Pro Access
    const { accessLevel } = useAccess();
    const isPro = accessLevel === 'pro';

    // If for some reason product is missing (should be handled by server page returning 404), show error
    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-ink">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
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

                {/* Product Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4 tracking-tight">
                        {product.title}
                    </h1>
                    {product.description && (
                        <p className="text-lg text-ink/60 max-w-2xl mx-auto line-clamp-2">
                            {product.description}
                        </p>
                    )}
                </div>

                {/* Guest Access Banner - Compact Version */}
                {!isPro && (
                    <div className="mb-8 p-4 bg-white/60 backdrop-blur-md border border-teal/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center text-teal shrink-0">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink text-sm">Premium Template</h3>
                                <p className="text-xs text-ink/60">Sign in or use a credit to unlock this 4K mockup.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-ink/50">
                            <span className="flex items-center gap-1"><Ban size={14} /> No Photoshop</span>
                            <span className="hidden sm:flex items-center gap-1"><Star size={14} /> Commercial Use</span>
                        </div>
                    </div>
                )}

                <ImageCompositor
                    productId={product.id}
                    productSlug={slug}
                    baseImageUrl={product.base_image_url}
                    passwordHash={product.password_hash}
                    isFree={product.is_free}
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
