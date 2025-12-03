'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, Image as ImageIcon, Search, RefreshCw } from 'lucide-react';
import Header from '@/components/ui/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminGenerationsPage() {
    const router = useRouter();
    const [generations, setGenerations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 20;

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const adminEmails = ['francis.w.rheaume@gmail.com'];

            if (!session || !session.user.email || !adminEmails.includes(session.user.email.toLowerCase())) {
                router.push('/');
                return;
            }
            fetchGenerations();
        };
        checkAdmin();
    }, []);

    const fetchGenerations = async (pageIndex = 0) => {
        setLoading(true);
        const from = pageIndex * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
            .from('generations')
            .select(`
                *,
                products (
                    title,
                    base_image_url
                )
            `)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Error fetching generations:', error);
        } else {
            if (pageIndex === 0) {
                setGenerations(data || []);
            } else {
                setGenerations(prev => [...prev, ...(data || [])]);
            }
        }
        setLoading(false);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchGenerations(nextPage);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen font-sans text-ink bg-cream">
            <Header className="mb-8" />
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-ink">Generations Log</h1>
                            <p className="text-ink/60 text-sm">Monitor all AI activity in real-time.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setPage(0); fetchGenerations(0); }}
                        className="p-2 bg-white text-ink rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-bold text-sm"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-ink/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-bold text-ink/50 uppercase tracking-wider border-b border-ink/10">
                                    <th className="py-4 px-6">Result</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6">User / IP</th>
                                    <th className="py-4 px-6">Product</th>
                                    <th className="py-4 px-6">Details</th>
                                    <th className="py-4 px-6 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                                {generations.map((gen) => (
                                    <tr key={gen.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            {gen.image_url ? (
                                                <a href={gen.image_url} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-ink/10 relative group">
                                                    <Image
                                                        src={gen.image_url}
                                                        alt="Result"
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                </a>
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-ink/20">
                                                    <ImageIcon size={24} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            {gen.status === 'success' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                    <CheckCircle size={12} /> Success
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                    <XCircle size={12} /> {gen.status}
                                                </span>
                                            )}
                                            {gen.duration_ms && (
                                                <div className="text-[10px] text-ink/40 mt-1 font-mono">
                                                    {(gen.duration_ms / 1000).toFixed(1)}s
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm font-bold text-ink">
                                                {gen.meta?.user_email || (gen.user_id ? 'Registered User' : 'Guest')}
                                            </div>
                                            <div className="text-xs text-ink/40 font-mono mt-0.5">
                                                {gen.ip_address || 'No IP'}
                                            </div>
                                            {gen.user_id && (
                                                <div className="text-[10px] text-ink/30 font-mono mt-0.5 truncate w-24">
                                                    {gen.user_id}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {gen.products?.base_image_url && (
                                                    <img src={gen.products.base_image_url} className="w-6 h-6 rounded object-cover border border-ink/10" alt="" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {gen.products?.title || 'Unknown Product'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-wrap gap-1">
                                                {gen.meta?.image_size && (
                                                    <span className="px-1.5 py-0.5 rounded border border-ink/10 text-[10px] font-bold text-ink/60 bg-white">
                                                        {gen.meta.image_size}
                                                    </span>
                                                )}
                                                {gen.meta?.aspect_ratio && (
                                                    <span className="px-1.5 py-0.5 rounded border border-ink/10 text-[10px] font-bold text-ink/60 bg-white">
                                                        {gen.meta.aspect_ratio}
                                                    </span>
                                                )}
                                            </div>
                                            {gen.error_message && (
                                                <div className="mt-2 text-xs text-red-600 max-w-[200px] truncate" title={gen.error_message}>
                                                    {gen.error_message}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right text-sm text-ink/60">
                                            {formatDate(gen.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {generations.length === 0 && !loading && (
                        <div className="p-12 text-center text-ink/40">
                            <Clock size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No generations found yet.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="p-8 flex justify-center">
                            <Loader2 className="animate-spin text-teal" size={32} />
                        </div>
                    )}

                    {!loading && generations.length > 0 && (
                        <div className="p-4 border-t border-ink/5 flex justify-center">
                            <button
                                onClick={loadMore}
                                className="px-6 py-2 bg-gray-50 hover:bg-gray-100 text-ink/60 font-bold rounded-xl transition-colors text-sm"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
