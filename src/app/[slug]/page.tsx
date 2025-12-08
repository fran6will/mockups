import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import ProductClient from '@/components/customer/ProductClient';
import { Suspense } from 'react';

type Props = {
    params: Promise<{ slug: string }>;
};

// 1. Generate Dynamic Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    const { data: product } = await supabaseAdmin
        .from('products')
        .select('title, description, gallery_image_url, base_image_url')
        .eq('slug', slug)
        .single();

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    const imageUrl = product.gallery_image_url || product.base_image_url;

    return {
        title: product.title,
        description: product.description || `Create a ${product.title} mockup with AI.`,
        openGraph: {
            title: product.title + ' | CopiéCollé Mockup',
            description: product.description || `Create a professional ${product.title} mockup in seconds.`,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: product.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: product.title,
            description: product.description || `Create a professional ${product.title} mockup in seconds.`,
            images: [imageUrl],
        },
    };
}

// 2. Server Component Page
export default async function Page({ params }: Props) {
    const { slug } = await params;

    // Fetch data on the server
    const { data: product, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !product) {
        notFound();
    }

    // Pass data to the client component
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `${product.title} - AI Mockup Generator`,
        description: product.description || `Create a professional ${product.title} mockup in seconds with AI.`,
        image: product.gallery_image_url || product.base_image_url,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: product.is_free ? '0.00' : '5.00',
            priceCurrency: 'CAD',
            availability: 'https://schema.org/OnlineOnly',
            description: product.is_free ? 'Free mockup template' : '5 credits per generation',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '120',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-teal/20 border-t-teal animate-spin" /></div>}>
                <ProductClient product={product} slug={slug} />
            </Suspense>
        </>
    );
}
