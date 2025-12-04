'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Link as LinkIcon, Trash2, ExternalLink, Copy, Plus, Save, Loader2, FileText } from 'lucide-react';

interface Product {
    id: string;
    title: string;
    base_image_url: string;
    password_hash: string;
}

interface EtsyLink {
    id: string;
    slug: string;
    product_id: string;
    google_drive_url: string;
    created_at: string;
    products?: Product; // Joined data
}

export default function EtsyLinksManager({ products }: { products: Product[] }) {
    const [links, setLinks] = useState<EtsyLink[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [selectedProductId, setSelectedProductId] = useState('');
    const [driveUrl, setDriveUrl] = useState('');
    const [customSlug, setCustomSlug] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('etsy_links')
            .select(`
                *,
                products (
                    id,
                    title,
                    base_image_url,
                    password_hash
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching links:', error);
        } else {
            setLinks(data || []);
        }
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!selectedProductId || !driveUrl) return;
        setIsCreating(true);

        try {
            const slug = customSlug || Math.random().toString(36).substring(2, 10);

            const { error } = await supabase
                .from('etsy_links')
                .insert({
                    product_id: selectedProductId,
                    google_drive_url: driveUrl,
                    slug: slug
                });

            if (error) throw error;

            // Reset form
            setSelectedProductId('');
            setDriveUrl('');
            setCustomSlug('');
            fetchLinks();

        } catch (error: any) {
            alert('Error creating link: ' + error.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this secret link?')) return;

        const { error } = await supabase
            .from('etsy_links')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting link');
        } else {
            fetchLinks();
        }
    };

    const copyToClipboard = (slug: string) => {
        const url = `${window.location.origin}/download/${slug}`;
        navigator.clipboard.writeText(url);
        alert('Copied to clipboard: ' + url);
    };

    return (
        <div className="glass p-8 rounded-3xl shadow-2xl mt-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                    <LinkIcon size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-ink">Etsy Secret Links</h2>
                    <p className="text-xs text-ink/50">Manage download pages for Etsy customers</p>
                </div>
            </div>

            {/* Create Form */}
            <div className="bg-white/50 p-6 rounded-2xl border border-white/60 mb-8">
                <h3 className="font-bold text-sm text-ink mb-4 uppercase tracking-wider">Create New Link</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-ink/50 mb-1">Product</label>
                        <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="w-full bg-white border border-ink/10 rounded-xl p-3 text-sm outline-none focus:border-purple-500 transition-all"
                        >
                            <option value="">Select a Product...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-ink/50 mb-1">Google Drive URL</label>
                        <input
                            type="text"
                            value={driveUrl}
                            onChange={(e) => setDriveUrl(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="w-full bg-white border border-ink/10 rounded-xl p-3 text-sm outline-none focus:border-purple-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-ink/50 mb-1">Custom Slug (Optional)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customSlug}
                                onChange={(e) => setCustomSlug(e.target.value)}
                                placeholder="random-string"
                                className="w-full bg-white border border-ink/10 rounded-xl p-3 text-sm outline-none focus:border-purple-500 transition-all"
                            />
                            <button
                                onClick={handleCreate}
                                disabled={isCreating || !selectedProductId || !driveUrl}
                                className="bg-purple-600 text-white px-6 rounded-xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                            >
                                {isCreating ? <Loader2 className="animate-spin" size={20} /> : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-bold text-ink/50 uppercase tracking-wider border-b border-ink/10">
                            <th className="pb-3 pl-2">Product</th>
                            <th className="pb-3">Slug / URL</th>
                            <th className="pb-3">Drive Link</th>
                            <th className="pb-3 text-right pr-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {links.map(link => (
                            <tr key={link.id} className="border-b border-ink/5 hover:bg-white/30 transition-colors group">
                                <td className="py-3 pl-2">
                                    <div className="flex items-center gap-3">
                                        {link.products?.base_image_url && (
                                            <img src={link.products.base_image_url} className="w-8 h-8 rounded bg-gray-100 object-cover" />
                                        )}
                                        <span className="font-bold text-ink">{link.products?.title || 'Unknown Product'}</span>
                                    </div>
                                </td>
                                <td className="py-3 font-mono text-xs text-purple-600">
                                    /download/{link.slug}
                                </td>
                                <td className="py-3 text-xs text-ink/60 max-w-[200px] truncate">
                                    {link.google_drive_url}
                                </td>
                                <td className="py-3 text-right pr-2">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                const url = `/admin/tools/pdf-generator?slug=${link.slug}&password=${link.products?.password_hash || ''}&title=${encodeURIComponent(link.products?.title || '')}`;
                                                window.open(url, '_blank');
                                            }}
                                            className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                                            title="Generate PDF"
                                        >
                                            <FileText size={16} />
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(link.slug)}
                                            className="p-2 bg-teal/10 text-teal rounded-lg hover:bg-teal/20 transition-colors"
                                            title="Copy Link"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <a
                                            href={`/download/${link.slug}`}
                                            target="_blank"
                                            className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                            title="Open Page"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(link.id)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {links.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-ink/40 italic">
                                    No secret links created yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
