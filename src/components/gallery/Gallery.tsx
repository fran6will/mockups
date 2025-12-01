'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedSupabaseUrl } from '@/lib/utils/supabase-image';
import { Search, Filter, ArrowRight, Lock, Sparkles, CheckCircle, Heart, Users, Image as ImageIcon, Layers } from 'lucide-react';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { getFavorites } from '@/app/actions';

import { useAccess } from '@/hooks/use-access';
import WatermarkOverlay from '@/components/ui/WatermarkOverlay';

const CATEGORIES = [
    "Men's Clothing",
    "Women's Clothing",
    "Kids' Clothing",
    "Accessories",
    "Home & Living",
    "Stationery",
    "Scenes"
];

export default function Gallery() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [allTags, setAllTags] = useState<string[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    // Check global pro access
    const { accessLevel } = useAccess();
    const isPro = accessLevel === 'pro';

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);

            const { data, error } = await supabase
                .from('products')
                .select('id, title, slug, gallery_image_url, base_image_url, category, tags, is_free, is_public, created_by, description')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(data || []);

                // Extract unique tags
                const tags = new Set<string>();
                data?.forEach(p => {
                    if (p.tags && Array.isArray(p.tags) && p.tags.length > 0) {
                        tags.add(p.tags[0]);
                    }
                });
                setAllTags(Array.from(tags));
            }

            // Fetch favorites
            const favs = await getFavorites();
            setFavorites(favs);

            setLoading(false);
        };

        fetchData();
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTag, searchQuery, favorites]);

    const filteredProducts = products.filter(p => {
        if (selectedTag === 'favorites') {
            const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
            return favorites.includes(p.id) && matchesSearch;
        }

        if (selectedTag === 'custom') {
            const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
            // Show products created by user OR tagged as custom
            return (p.created_by === userId || p.tags?.includes('custom')) && matchesSearch;
        }

        if (selectedTag === 'community') {
            const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
            // Show PUBLIC products tagged as community
            return p.is_public && p.tags?.includes('community') && matchesSearch;
        }

        // For general gallery (All or Specific Category), exclude private custom mockups
        if (p.tags?.includes('custom') && !p.is_public) {
            return false;
        }

        // Category Filter
        if (CATEGORIES.includes(selectedTag || '')) {
            const matchesCategory = p.category === selectedTag;
            const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        }

        const matchesTag = selectedTag ? p.tags?.[0] === selectedTag : true;
        const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTag && matchesSearch;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const displayedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top of gallery
        document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
    };

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

                        {/* Main Categories */}
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedTag(cat)}
                                className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all flex items-center justify-between group ${selectedTag === cat
                                    ? 'bg-teal text-cream shadow-md shadow-teal/20'
                                    : 'bg-white/50 text-ink/60 hover:bg-white hover:text-ink hover:pl-5'
                                    }`}
                            >
                                {cat}
                                {selectedTag === cat && <ArrowRight size={14} className="hidden lg:block" />}
                            </button>
                        ))}

                        <div className="hidden lg:block w-full h-px bg-ink/5 my-2"></div>

                        {/* Favorites Filter */}
                        <button
                            onClick={() => setSelectedTag('favorites')}
                            className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all flex items-center justify-between group ${selectedTag === 'favorites'
                                ? 'bg-teal text-cream shadow-md shadow-teal/20'
                                : 'bg-white/50 text-ink/60 hover:bg-white hover:text-ink hover:pl-5'
                                }`}
                        >
                            <span className="flex items-center gap-2"><Heart size={14} className={selectedTag === 'favorites' ? 'fill-current' : ''} /> Favorites</span>
                            {selectedTag === 'favorites' && <ArrowRight size={14} className="hidden lg:block" />}
                        </button>

                        <button
                            onClick={() => setSelectedTag('custom')}
                            className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all flex items-center justify-between group ${selectedTag === 'custom'
                                ? 'bg-teal text-cream shadow-md shadow-teal/20'
                                : 'bg-white/50 text-ink/60 hover:bg-white hover:text-ink hover:pl-5'
                                }`}
                        >
                            <span className="flex items-center gap-2"><Sparkles size={14} /> My Templates</span>
                            {selectedTag === 'custom' && <ArrowRight size={14} className="hidden lg:block" />}
                        </button>

                        <button
                            onClick={() => setSelectedTag('community')}
                            className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all flex items-center justify-between group ${selectedTag === 'community'
                                ? 'bg-teal text-cream shadow-md shadow-teal/20'
                                : 'bg-white/50 text-ink/60 hover:bg-white hover:text-ink hover:pl-5'
                                }`}
                        >
                            <span className="flex items-center gap-2"><Users size={14} /> Community</span>
                            {selectedTag === 'community' && <ArrowRight size={14} className="hidden lg:block" />}
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
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Pinned "Create Custom" Card - Only show on first page and when not searching/filtering favorites */}
                                {currentPage === 1 && !searchQuery && selectedTag !== 'favorites' && (
                                    <Link
                                        href="/custom"
                                        className="group relative bg-gradient-to-br from-teal to-teal-700 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-teal/30 hover:-translate-y-1 transition-all duration-500 border border-teal/20"
                                    >
                                        <div className="aspect-[4/3] relative overflow-hidden flex items-center justify-center bg-white/10 backdrop-blur-sm">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                                            <Sparkles className="text-white w-20 h-20 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                                        </div>
                                        <div className="p-5 relative">
                                            <h3 className="font-bold text-xl text-white mb-2">
                                                Create Yours Now
                                            </h3>
                                            <p className="text-sm text-teal-100 font-medium leading-relaxed">
                                                Can't find what you need? Design your own custom mockup scene with AI.
                                            </p>
                                            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                                <Sparkles size={12} /> AI Powered
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {displayedProducts.map(product => (
                                    <Link
                                        key={product.id}
                                        href={`/${product.slug}`}
                                        className="group block relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-teal/10 hover:-translate-y-1 transition-all duration-500 border border-ink/5"
                                    >
                                        {/* Image Container */}
                                        <WatermarkOverlay showWatermark={!isPro} className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                                            <div className="absolute inset-0 bg-teal/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-multiply"></div>
                                            <Image
                                                src={getOptimizedSupabaseUrl(product.gallery_image_url || product.base_image_url, 600)}
                                                alt={product.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />

                                            {/* Access Badge */}
                                            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
                                                {isPro ? (
                                                    <div className="bg-teal text-cream text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                                        <CheckCircle size={12} /> Unlocked
                                                    </div>
                                                ) : (
                                                    <div className="bg-white/90 backdrop-blur text-ink text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                                        <Lock size={12} className="text-teal" /> Premium
                                                    </div>
                                                )}

                                                {/* Type Badge */}
                                                {product.category === 'Scenes' ? (
                                                    <div className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-purple-200 flex items-center gap-1">
                                                        <ImageIcon size={10} /> Scene
                                                    </div>
                                                ) : (
                                                    <div className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-blue-100 flex items-center gap-1">
                                                        <Layers size={10} /> Mockup
                                                    </div>
                                                )}
                                            </div>

                                            {/* Favorite Button */}
                                            <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <FavoriteButton
                                                    productId={product.id}
                                                    initialIsFavorited={favorites.includes(product.id)}
                                                />
                                            </div>
                                        </WatermarkOverlay>

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

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg hover:bg-ink/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    >
                                        <ArrowRight size={20} className="rotate-180" />
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                            // Logic to show limited page numbers with ellipsis could go here
                                            // For now, simple list if pages < 8, otherwise we might need logic
                                            if (totalPages > 7 && Math.abs(currentPage - page) > 2 && page !== 1 && page !== totalPages) {
                                                if (Math.abs(currentPage - page) === 3) return <span key={page} className="text-ink/40">...</span>;
                                                return null;
                                            }

                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${currentPage === page
                                                        ? 'bg-teal text-white shadow-lg shadow-teal/20 scale-110'
                                                        : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg hover:bg-ink/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
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
