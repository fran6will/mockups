'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CheckCircle, XCircle, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Header from '@/components/ui/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminReviewsPage() {
    const router = useRouter();
    const [pendingProducts, setPendingProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const adminEmails = ['francis.w.rheaume@gmail.com'];

            if (!session || !session.user.email || !adminEmails.includes(session.user.email.toLowerCase())) {
                router.push('/');
                return;
            }
            fetchPending();
        };
        checkAdmin();
    }, []);

    const fetchPending = async () => {
        setLoading(true);
        // Fetch products that are pending AND tagged as community
        // Note: We need to filter by tags in JS or use .contains if possible
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'pending')
            .contains('tags', ['community'])
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        setPendingProducts(data || []);
        setLoading(false);
    };

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            const { error } = await supabase
                .from('products')
                .update({ status: 'approved', is_public: true })
                .eq('id', id);

            if (error) throw error;

            // Remove from list
            setPendingProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error approving:', error);
            alert('Failed to approve');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Reject this mockup? It will remain private.')) return;
        setActionLoading(id);
        try {
            const { error } = await supabase
                .from('products')
                .update({ status: 'rejected', is_public: false })
                .eq('id', id);

            if (error) throw error;

            // Remove from list
            setPendingProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error rejecting:', error);
            alert('Failed to reject');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen font-sans text-ink bg-cream">
            <Header className="mb-8" />
            <div className="max-w-6xl mx-auto px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-bold text-ink">Community Reviews</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-teal" size={40} />
                    </div>
                ) : pendingProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-ink/5">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-ink mb-2">All Caught Up!</h2>
                        <p className="text-ink/60">No pending community mockups to review.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pendingProducts.map(product => (
                            <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-ink/5 flex flex-col">
                                <div className="aspect-square relative bg-gray-100">
                                    <img
                                        src={product.base_image_url}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                        {product.title}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-1">Prompt</p>
                                        <p className="text-sm text-ink/80 line-clamp-3 italic">"{product.custom_prompt || 'No prompt'}"</p>
                                    </div>
                                    <div className="mt-auto grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleReject(product.id)}
                                            disabled={actionLoading === product.id}
                                            className="py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={18} /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleApprove(product.id)}
                                            disabled={actionLoading === product.id}
                                            className="py-3 rounded-xl font-bold text-green-600 bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {actionLoading === product.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
