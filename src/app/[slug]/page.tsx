import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import ProductClient from '@/components/customer/ProductClient';

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
        '@type': 'Product',
        name: product.title,
        description: product.description || `Create a professional ${product.title} mockup in seconds.`,
        image: product.gallery_image_url || product.base_image_url,
        offers: {
            '@type': 'Offer',
            price: '0.00', // Or dynamic if paid
            priceCurrency: 'CAD',
            availability: 'https://schema.org/InStock',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductClient product={product} slug={slug} />
        </>
    );
}
