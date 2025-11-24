'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowRight, Droplets } from 'lucide-react';

export default function NewArrivals() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNew = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(4);

            if (!error && data) {
                setProducts(data);
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
                                    <img
                                        src={product.gallery_image_url || product.base_image_url}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-teal/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-multiply"></div>
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
