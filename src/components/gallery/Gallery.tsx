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
                // Extract unique tags (Primary tag only - first one)
                const tags = new Set<string>();
                data?.forEach(p => {
                    if (p.tags && Array.isArray(p.tags) && p.tags.length > 0) {
                        tags.add(p.tags[0]);
                    }
                });
                setAllTags(Array.from(tags));
            }
            setLoading(false);
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesTag = selectedTag ? p.tags?.[0] === selectedTag : true;
        const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTag && matchesSearch;
    });

    return (
        <section id="gallery" className="max-w-7xl mx-auto px-6 pb-20 pt-8 scroll-mt-28">

            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-ink mb-4 tracking-tight">
                    The Collection
                </h2>
                <p className="text-lg text-ink/60 max-w-2xl mx-auto">
                    Professional, AI-ready templates for your brand.
                </p>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-[240px_1fr] gap-8 lg:gap-12 items-start">

                {/* Sidebar (Desktop) / Horizontal Scroll (Mobile) */}
                <aside className="w-full lg:sticky lg:top-32 space-y-8">

                    {/* Search - Mobile Only (Top) */}
                    <div className="lg:hidden relative w-full mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={20} />
                        <input
                            type="text"
                            placeholder="Search mockups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-ink/10 rounded-xl pl-12 pr-4 py-3 text-ink placeholder:text-ink/40 font-medium focus:ring-2 focus:ring-teal/20 outline-none"
                        />
                    </div>

                    {/* Categories Header */}
                    <div className="hidden lg:block">
                        <h3 className="font-bold text-lg text-ink mb-4 flex items-center gap-2">
                            <Filter size={18} /> Categories
                        </h3>
                    </div>

                    {/* Tags List */}
                    <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all flex items-center justify-between group ${selectedTag === null
                                ? 'bg-teal text-cream shadow-md shadow-teal/20'
                                : 'bg-white/50 text-ink/60 hover:bg-white hover:text-ink hover:pl-5'
                                }`}
                        >
                            All Mockups
                            {selectedTag === null && <ArrowRight size={14} className="hidden lg:block" />}
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all flex items-center justify-between group ${selectedTag === tag
                                    ? 'bg-teal text-cream shadow-md shadow-teal/20'
                                    : 'bg-white/50 text-ink/60 hover:bg-white hover:text-ink hover:pl-5'
                                    }`}
                            >
                                {tag}
                                {selectedTag === tag && <ArrowRight size={14} className="hidden lg:block" />}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="w-full">

                    {/* Search Bar (Desktop) */}
                    <div className="hidden lg:block relative w-full mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={20} />
                        <input
                            type="text"
                            placeholder="Search for 'hoodie', 'mug', 'frame'..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-ink/10 rounded-2xl pl-12 pr-4 py-4 text-ink placeholder:text-ink/40 font-medium focus:ring-2 focus:ring-teal/20 outline-none shadow-sm"
                        />
                    </div>

                    {/* Results Count */}
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-sm font-bold text-ink/40 uppercase tracking-wider">
                            {loading ? 'Loading...' : `${filteredProducts.length} Results`}
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-[4/3] bg-teal/5 rounded-3xl animate-pulse border border-teal/5"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    <div className="p-5 relative">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-ink mb-1 group-hover:text-teal transition-colors line-clamp-1">
                                                    {product.title}
                                                </h3>
                                                {product.description && (
                                                    <p className="text-sm text-ink/60 mb-3 line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-2">
                                                    {product.tags && product.tags.length > 0 && (
                                                        <span className="text-[10px] bg-ink/5 text-ink/60 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                                            {product.tags[0]}
                                                        </span>
                                                    )}
                                                </div>
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
                </div>
            </div>
        </section>
    );
}
