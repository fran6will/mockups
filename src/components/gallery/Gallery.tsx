'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { Search, Filter, ArrowRight, Lock, Sparkles, CheckCircle } from 'lucide-react';

import { useAccess } from '@/hooks/use-access';

export default function Gallery() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [allTags, setAllTags] = useState<string[]>([]);

    // Check global pro access
    const { accessLevel } = useAccess();
    const isPro = accessLevel === 'pro';

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(data || []);

                // Extract unique tags
                const tags = new Set<string>();
                data?.forEach(p => {
                    if (p.tags && Array.isArray(p.tags)) {
                        p.tags.forEach((t: string) => tags.add(t));
                    }
                });
                setAllTags(Array.from(tags));
            }
            setLoading(false);
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesTag = selectedTag ? p.tags?.includes(selectedTag) : true;
        const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTag && matchesSearch;
    });

    return (
        <section id="gallery" className="max-w-7xl mx-auto px-6 pb-20 pt-8">



            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-ink mb-4 tracking-tight">
                    The Collection
                </h2>
                <p className="text-lg text-ink/60 max-w-2xl mx-auto">
                    Professional, AI-ready templates for your brand.
                </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12 glass p-2 rounded-2xl">

                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={20} />
                    <input
                        type="text"
                        placeholder="Search mockups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none outline-none pl-12 pr-4 py-3 text-ink placeholder:text-ink/40 font-medium"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 px-2 no-scrollbar">
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`whitespace-nowrap px-5 py-2 rounded-xl font-bold text-sm transition-all ${selectedTag === null
                            ? 'bg-teal text-cream shadow-md shadow-teal/20'
                            : 'bg-white/40 text-ink/60 hover:bg-white/60 hover:text-ink'
                            }`}
                    >
                        All
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`whitespace-nowrap px-5 py-2 rounded-xl font-bold text-sm transition-all capitalize ${selectedTag === tag
                                ? 'bg-teal text-cream shadow-md shadow-teal/20'
                                : 'bg-white/40 text-ink/60 hover:bg-white/60 hover:text-ink'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="aspect-[4/3] bg-teal/5 rounded-3xl animate-pulse border border-teal/5"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map(product => (
                        <Link
                            key={product.id}
                            href={`/${product.slug}`}
                            className="group block relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-teal/10 hover:-translate-y-1 transition-all duration-500 border border-ink/5"
                        >
                            {/* Image Container */}
                            <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                                <div className="absolute inset-0 bg-teal/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-multiply"></div>
                                <img
                                    src={product.gallery_image_url || product.base_image_url}
                                    alt={product.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* Access Badge */}
                                <div className="absolute top-4 right-4 z-20">
                                    {isPro ? (
                                        <div className="bg-teal text-cream text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                            <CheckCircle size={12} /> Unlocked
                                        </div>
                                    ) : (
                                        <div className="bg-white/90 backdrop-blur text-ink text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                            <Lock size={12} className="text-teal" /> Premium
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6 relative">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-ink mb-1 group-hover:text-teal transition-colors">
                                            {product.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {product.tags?.slice(0, 2).map((tag: string) => (
                                                <span key={tag} className="text-xs text-ink/40 font-bold uppercase tracking-wider">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-teal/5 rounded-full flex items-center justify-center text-teal opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && filteredProducts.length === 0 && (
                <div className="glass rounded-3xl p-12 text-center">
                    <div className="w-20 h-20 bg-teal/5 rounded-full flex items-center justify-center mx-auto mb-6 text-teal">
                        <Search size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-ink mb-2">No results found</h3>
                    <p className="text-ink/60">
                        We couldn't find any mockups matching "{searchQuery}". Try a different keyword.
                    </p>
                    <button
                        onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                        className="mt-6 text-teal font-bold hover:underline"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </section>
    );
}
