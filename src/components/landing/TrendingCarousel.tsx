'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';

export default function TrendingCarousel() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            // Fallback to simple select if is_trending column is missing or not populated
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .limit(10);

            if (!error && data) {
                setProducts(data);
            }
            setLoading(false);
        };

        fetchTrending();
    }, []);

    if (!loading && products.length === 0) return null;

    return (
        <section className="py-16 bg-white/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <Flame size={20} className="fill-current" />
                        </div>
                        <h2 className="text-2xl font-bold text-ink">What's Hot</h2>
                    </div>
                    <Link href="/gallery" className="text-teal font-bold text-sm hover:underline flex items-center gap-1">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar">
                    {loading ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="min-w-[280px] md:min-w-[320px] aspect-[4/5] bg-teal/5 rounded-2xl animate-pulse"></div>
                        ))
                    ) : (
                        products.map(product => (
                            <Link
                                key={product.id}
                                href={`/${product.slug}`}
                                className="snap-center min-w-[280px] md:min-w-[320px] group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-teal/10 transition-all duration-300 border border-ink/5"
                            >
                                <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                                    <img
                                        src={product.gallery_image_url || product.base_image_url}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 className="text-white font-bold text-lg mb-1 truncate">{product.title}</h3>
                                        <div className="flex items-center gap-2">
                                            {product.tags?.slice(0, 2).map((tag: string) => (
                                                <span key={tag} className="text-[10px] bg-white/20 backdrop-blur text-white px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
