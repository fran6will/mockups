'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowRight, Sparkles, LayoutTemplate, Wand2, User } from 'lucide-react';
import { getOptimizedSupabaseUrl } from '@/lib/utils/supabase-image';

// Mapped directly from product data
// product.description -> Creator Name
// product.tags -> includes 'template' or 'remixed'

export default function TrendingCarousel() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            // Priority 1: Fetch explicitly trending items
            const { data: trendingData } = await supabase
                .from('products')
                .select('*')
                .eq('is_trending', true)
                .order('created_at', { ascending: false })
                .limit(20);

            let displayItems = trendingData || [];

            // STRICT MODE: No fallback to recent items requested by user.
            // Only explicitly "is_trending" items created via dashboard will show.

            const filtered = displayItems.filter(p => {
                // Exclude private custom mockups
                if (p.tags?.includes('custom') && !p.is_public) return false;
                return true;
            });

            // Quadruple for infinite scroll (safer for wide screens)
            const scrollItems = filtered.slice(0, 10);
            if (scrollItems.length > 0) {
                setProducts([...scrollItems, ...scrollItems, ...scrollItems, ...scrollItems]);
            } else {
                setProducts([]);
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
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Sparkles size={20} className="fill-current" />
                        </div>
                        <h2 className="text-2xl font-bold text-ink">Community Showcase</h2>
                    </div>
                    <Link href="/gallery" className="text-teal font-bold text-sm hover:underline flex items-center gap-1">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="overflow-hidden">
                    <div className="flex w-max animate-scroll">
                        {loading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="min-w-[280px] md:min-w-[320px] aspect-[4/5] bg-teal/5 rounded-2xl animate-pulse"></div>
                            ))
                        ) : (
                            products.map((product, index) => {
                                return (
                                    <div
                                        key={`${product.id}-${index}`} // Unique key for duplicates
                                        className="min-w-[280px] md:min-w-[320px] pr-6 group relative transition-all duration-300 cursor-default"
                                    >
                                        <div className="aspect-[4/5] relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-teal/10 border border-ink/5">
                                            <Image
                                                src={getOptimizedSupabaseUrl(product.gallery_image_url || product.base_image_url, 400)}
                                                alt={product.title}
                                                fill
                                                unoptimized
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>

                                            {/* Top badges */}
                                            {/* Top badges */}
                                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {product.tags?.includes('remixed') ? (
                                                    <div className="backdrop-blur-md bg-white/10 border border-white/20 px-2 py-1 rounded-full flex items-center gap-1.5">
                                                        <Wand2 size={12} className="text-purple-200" />
                                                        <span className="text-[10px] font-medium text-white/90 uppercase tracking-wide">Remixed</span>
                                                    </div>
                                                ) : (
                                                    <div className="backdrop-blur-md bg-white/10 border border-white/20 px-2 py-1 rounded-full flex items-center gap-1.5">
                                                        <LayoutTemplate size={12} className="text-blue-200" />
                                                        <span className="text-[10px] font-medium text-white/90 uppercase tracking-wide">Template</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal/80 to-purple-500/80 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                                                        <User size={12} className="text-white" />
                                                    </div>
                                                    <span className="text-xs font-medium text-white/90 shadow-black/50 drop-shadow-md">
                                                        Generated by {product.description || 'Anonymous'}
                                                    </span>
                                                </div>

                                                <h3 className="text-white font-bold text-lg mb-2 truncate leading-tight">{product.title}</h3>

                                                <div className="flex flex-wrap gap-1.5">
                                                    {product.tags?.slice(0, 2).map((tag: string) => (
                                                        <span key={tag} className="text-[10px] bg-white/10 backdrop-blur-md border border-white/10 text-white/80 px-2 py-0.5 rounded-md font-medium">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
