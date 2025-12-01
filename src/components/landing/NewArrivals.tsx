'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedSupabaseUrl } from '@/lib/utils/supabase-image';
import { ArrowRight, Droplets, Image as ImageIcon, Layers } from 'lucide-react';

export default function NewArrivals() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNew = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('id, title, slug, gallery_image_url, base_image_url, category, tags, is_public')
                .order('created_at', { ascending: false })
                .limit(20); // Fetch more to allow for filtering

            if (!error && data) {
                const filtered = data.filter(p => {
                    // Exclude private custom mockups
                    if (p.tags?.includes('custom') && !p.is_public) return false;
                    return true;
                });
                setProducts(filtered.slice(0, 4));
            }
            setLoading(false);
        };

        fetchNew();
    }, []);

    if (!loading && products.length === 0) return null;

    return (
        <section className="py-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Droplets size={20} className="fill-current" />
                        </div>
                        <h2 className="text-2xl font-bold text-ink">Fresh Drops</h2>
                    </div>
                    <Link href="/gallery" className="text-teal font-bold text-sm hover:underline flex items-center gap-1">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[4/3] bg-teal/5 rounded-2xl animate-pulse"></div>
                        ))
                    ) : (
                        products.map(product => (
                            <Link
                                key={product.id}
                                href={`/${product.slug}`}
                                className="group block relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-teal/10 transition-all duration-300 border border-ink/5"
                            >
                                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                                    <Image
                                        src={getOptimizedSupabaseUrl(product.gallery_image_url || product.base_image_url, 600)}
                                        alt={product.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-teal/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-multiply"></div>

                                    {/* Type Badge */}
                                    <div className="absolute top-3 right-3 z-20">
                                        {product.category === 'Scenes' ? (
                                            <div className="bg-purple-100/90 backdrop-blur text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-purple-200 flex items-center gap-1">
                                                <ImageIcon size={10} /> Scene
                                            </div>
                                        ) : (
                                            <div className="bg-white/90 backdrop-blur text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-blue-100 flex items-center gap-1">
                                                <Layers size={10} /> Mockup
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-ink mb-1 truncate group-hover:text-teal transition-colors">{product.title}</h3>
                                    <p className="text-xs text-ink/40 font-bold uppercase tracking-wider">
                                        {product.tags?.[0] || 'New'}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
