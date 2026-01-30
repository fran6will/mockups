import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Blog | Copié-Collé',
    description: 'AI insights, mockup tips, and updates from the Copié-Collé team. Stay ahead of the curve in AI-powered product visualization.',
};

// Blog posts data - can be moved to a CMS or database later
const posts = [
    {
        slug: 'google-genie-3-ai-3d-ecommerce-revolution',
        title: 'Google Genie 3: The Rise of Generative 3D Worlds in E-commerce',
        excerpt: 'Dive into how Google Genie 3 and world-model AI are transforming online retail into immersive 3D virtual shopping experiences. Discover the future of AI e-commerce.',
        date: 'January 30, 2026',
        readTime: '12 min read',
        category: 'Innovation',
        image: '/hero-wallpaper.png',
    },
    {
        slug: 'bytedance-seedream-4-5-release-review',
        title: 'ByteDance 4.5 (Seedream) Just Dropped: The New King of AI Consistency?',
        excerpt: 'ByteDance has released Seedream 4.5, a new AI image model targeting professional creators. Discover how it outperforms Midjourney in consistency and spatial reasoning.',
        date: 'November 28, 2025',
        readTime: '4 min read',
        category: 'AI News',
        image: '/hero-wallpaper.png',
    },
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-cream">
            <Header />
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold text-ink mb-4 tracking-tight">
                            Blog
                        </h1>
                        <p className="text-lg text-ink/60 max-w-xl mx-auto">
                            AI insights, mockup tips, and updates from the Copié-Collé team.
                        </p>
                    </div>

                    {/* Posts Grid */}
                    <div className="grid gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/${post.slug}`}
                                className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-teal/10 transition-all duration-500 border border-ink/5"
                            >
                                <div className="grid md:grid-cols-[1fr_1.5fr] gap-6">
                                    {/* Image */}
                                    <div className="aspect-[16/10] md:aspect-auto relative bg-gray-100 overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-teal/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 md:p-8 flex flex-col justify-center">
                                        <div className="flex items-center gap-4 text-sm text-ink/40 mb-4">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {post.date}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                {post.readTime}
                                            </span>
                                        </div>

                                        <h2 className="text-2xl md:text-3xl font-bold text-ink mb-3 group-hover:text-teal transition-colors leading-tight">
                                            {post.title}
                                        </h2>

                                        <p className="text-ink/60 mb-6 line-clamp-2">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center text-teal font-bold group-hover:gap-3 gap-2 transition-all">
                                            Read Article <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Empty State for future */}
                    {posts.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-ink/40 text-lg">No posts yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
