'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getOptimizedSupabaseUrl } from '@/lib/utils/supabase-image';
import ImageCompositor from '@/components/customer/ImageCompositor';
import { CheckCircle2 } from 'lucide-react';

interface Product {
    id: string;
    slug: string;
    title: string;
    base_image_url: string;
    gallery_image_url?: string;
    password_hash: string | null;
}

interface TryItPlaygroundProps {
    products: Product[];
}

export default function TryItPlayground({ products }: TryItPlaygroundProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);

    return (
        <div className="space-y-8">
            {/* Product Selector Carousel */}
            <div className="flex items-center justify-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {products.map((product) => (
                    <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`relative group flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${selectedProduct.id === product.id
                            ? 'border-teal ring-4 ring-teal/10 scale-110 shadow-xl shadow-teal/20'
                            : 'border-transparent hover:border-teal/30 hover:scale-105 opacity-70 hover:opacity-100'
                            }`}
                    >
                        <Image
                            src={getOptimizedSupabaseUrl(product.gallery_image_url || product.base_image_url, 200)}
                            alt={product.title}
                            fill
                            unoptimized
                            sizes="96px"
                            className="object-cover"
                        />
                        {selectedProduct.id === product.id && (
                            <div className="absolute inset-0 bg-teal/10 flex items-center justify-center">
                                <div className="bg-teal text-white rounded-full p-1 shadow-sm">
                                    <CheckCircle2 size={16} />
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] font-bold py-1 px-2 truncate backdrop-blur-sm">
                            {product.title}
                        </div>
                    </button>
                ))}
            </div>

            {/* Editor Area */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-2xl shadow-teal/5 transition-all duration-500">
                <div key={selectedProduct.id} className="animate-in fade-in zoom-in-95 duration-300">
                    <ImageCompositor
                        productId={selectedProduct.id}
                        productSlug={selectedProduct.slug}
                        baseImageUrl={selectedProduct.base_image_url}
                        passwordHash={selectedProduct.password_hash || ""}
                        isFree={true}
                        galleryImageUrl={selectedProduct.gallery_image_url}
                    />
                </div>
            </div>
        </div>
    );
}

