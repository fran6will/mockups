'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Upload, Save, Loader2, ShieldCheck, Edit, Trash2, X, Plus, UploadCloud, CheckCircle, Image as ImageIcon, Layers, Sparkles, Users } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Header from '@/components/ui/Header';
import Link from 'next/link';

import { useRouter } from 'next/navigation';
import { analyzeImageAction } from '../actions';

const CATEGORIES = [
    "Men's Clothing",
    "Women's Clothing",
    "Kids' Clothing",
    "Accessories",
    "Home & Living",
    "Stationery",
    "Scenes"
];

export default function AdminPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isFree, setIsFree] = useState(false);
    const [slug, setSlug] = useState('');
    const [category, setCategory] = useState('');
    const [password, setPassword] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');
    const [tags, setTags] = useState('');
    const [baseImage, setBaseImage] = useState<File | null>(null);
    const [galleryImage, setGalleryImage] = useState<File | null>(null);
    const [productType, setProductType] = useState<'mockup' | 'scene'>('mockup');

    const [variants, setVariants] = useState<any[]>([]);
    const [variantName, setVariantName] = useState('');
    const [variantImage, setVariantImage] = useState<File | null>(null);
    const [variantLoading, setVariantLoading] = useState(false);

    const [editingProduct, setEditingProduct] = useState<any>(null);

    // AI Hints
    const [productNameHint, setProductNameHint] = useState('');
    const [keywordsHint, setKeywordsHint] = useState('');

    const [loading, setLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const adminEmails = ['francis.w.rheaume@gmail.com'];

            if (!session || !session.user.email || !adminEmails.includes(session.user.email.toLowerCase())) {
                console.warn("Admin access denied. User:", session?.user?.email);
                router.push('/');
                return;
            }
            fetchProducts();
        };
        checkAdmin();
    }, []);

    const fetchProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        setProducts(data || []);
    };

    const handleEdit = (product: any) => {
        setEditingId(product.id);
        setEditingProduct(product);
        setTitle(product.title);
        setDescription(product.description || '');
        setIsFree(product.is_free || false);
        setSlug(product.slug);
        setCategory(product.category || '');
        setPassword(product.password_hash);
        setCustomPrompt(product.custom_prompt || '');
        setTags(product.tags ? product.tags.join(', ') : '');
        setBaseImage(null);
        setGalleryImage(null);
        setMessage('');
        fetchVariants(product.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fetchVariants = async (productId: string) => {
        const { data } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: true });
        setVariants(data || []);
    };

    const handleCreateVariant = async () => {
        if (!variantName || !variantImage || !editingId) return;
        setVariantLoading(true);

        try {
            const fileExt = variantImage.name.split('.').pop();
            const fileName = `variant-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('mockup-bases')
                .upload(filePath, variantImage);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('mockup-bases')
                .getPublicUrl(filePath);

            const { createVariant } = await import('../actions');
            const result = await createVariant(editingId, variantName, data.publicUrl);

            if (result.error) throw new Error(result.error);

            setVariantName('');
            setVariantImage(null);
            fetchVariants(editingId);
        } catch (error: any) {
            alert('Error creating variant: ' + error.message);
        } finally {
            setVariantLoading(false);
        }
    };

    const handleDeleteVariant = async (id: string) => {
        if (!confirm('Delete variant?')) return;
        const { deleteVariant } = await import('../actions');
        await deleteVariant(id);
        if (editingId) fetchVariants(editingId);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        resetForm();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        const { deleteProduct } = await import('../actions');
        const result = await deleteProduct(id);

        if (result.success) {
            fetchProducts();
        } else {
            alert('Error deleting product');
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setTitle('');
        setDescription('');
        setIsFree(false);
        setSlug('');
        setCategory('');
        setPassword('');
        setCustomPrompt('');
        setTags('');
        setBaseImage(null);
        setGalleryImage(null);
        setVariants([]);
        setVariantName('');
        setVariantImage(null);
        setMessage('');
        setMessage('');
        setProductNameHint('');
        setKeywordsHint('');
    };

    const handleMagicFill = async () => {
        if (!baseImage) {
            setMessage('Error: Please upload a base image first');
            return;
        }

        setIsAnalyzing(true);
        setMessage('Analyzing image with AI...');

        try {
            // 1. Upload Image to get URL
            const fileExt = baseImage.name.split('.').pop();
            const fileName = `analysis-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('mockup-bases')
                .upload(filePath, baseImage);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('mockup-bases')
                .getPublicUrl(filePath);

            const imageUrl = data.publicUrl;

            // 2. Call Server Action
            const result = await analyzeImageAction(imageUrl, productType, productNameHint, keywordsHint);

            if (result.error) throw new Error(result.error);
            if (!result.data) throw new Error("No data returned");

            const { title, description, tags, slug, custom_prompt } = result.data;

            // 3. Fill Form
            if (title) setTitle(title);
            if (description) setDescription(description);
            if (tags) setTags(tags);
            if (slug) setSlug(slug);
            if (custom_prompt) setCustomPrompt(custom_prompt);

            // Auto-set category if scene
            if (productType === 'scene') {
                setCategory('Scenes');
            }

            // Generate a random password if empty
            if (!password) {
                setPassword(Math.random().toString(36).slice(-8));
            }

            setMessage('Success: Form filled with AI magic! ✨');

        } catch (error: any) {
            console.error(error);
            setMessage('Error analyzing image: ' + error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async () => {
        if (!title || !slug || !password) {
            setMessage('Error: Please fill in all required fields');
            return;
        }

        if (!editingId && !baseImage) {
            setMessage('Error: Base image is required for new products');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            let publicUrl = '';
            let galleryPublicUrl = '';
            const MAX_SIZE = 50 * 1024 * 1024; // 50MB

            if (baseImage) {
                if (baseImage.size > MAX_SIZE) {
                    throw new Error(`Base image is too large (${(baseImage.size / 1024 / 1024).toFixed(2)}MB). Max size is 50MB.`);
                }
                const fileExt = baseImage.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('mockup-bases')
                    .upload(filePath, baseImage);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('mockup-bases')
                    .getPublicUrl(filePath);
                publicUrl = data.publicUrl;
            }

            if (galleryImage) {
                const fileExt = galleryImage.name.split('.').pop();
                const fileName = `gallery-${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('mockup-bases')
                    .upload(filePath, galleryImage);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('mockup-bases')
                    .getPublicUrl(filePath);
                galleryPublicUrl = data.publicUrl;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('slug', slug);
            formData.append('category', category);
            formData.append('password', password);
            formData.append('customPrompt', customPrompt);
            formData.append('tags', tags);
            formData.append('is_free', String(isFree));

            if (publicUrl) {
                formData.append('baseImageUrl', publicUrl);
            } else if (editingId) {
                const p = products.find(p => p.id === editingId);
                if (p) formData.append('baseImageUrl', p.base_image_url);
            }

            if (galleryPublicUrl) {
                formData.append('galleryImageUrl', galleryPublicUrl);
            } else if (editingId) {
                const p = products.find(p => p.id === editingId);
                if (p && p.gallery_image_url) formData.append('galleryImageUrl', p.gallery_image_url);
            }

            if (editingId) {
                formData.append('id', editingId);
                const { updateProduct } = await import('../actions');
                const result = await updateProduct(formData);
                if (result.error) throw new Error(result.error);
                setMessage('Success: Product updated!');
            } else {
                const { createProduct } = await import('../actions');
                const result = await createProduct(formData);
                if (result.error) throw new Error(result.error);
                setMessage('Success: Product created!');
            }

            resetForm();
            setEditingId(null);
            fetchProducts();

        } catch (error: any) {
            console.error(error);
            setMessage('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen font-sans text-ink">
            <Header className="mb-8" />
            <div className="max-w-6xl mx-auto px-8">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center shadow-lg shadow-teal/30">
                            <ShieldCheck className="text-cream" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-ink tracking-tight">
                            Admin Dashboard
                        </h1>
                    </div>
                    <Link href="/admin/reviews" className="bg-white text-ink font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 border border-ink/5">
                        <Users size={20} className="text-teal" />
                        Review Community
                    </Link>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <div className="glass p-8 rounded-3xl shadow-2xl sticky top-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                                    {editingId ? <Edit size={20} className="text-teal" /> : <Plus size={20} className="text-teal" />}
                                    {editingId ? 'Edit Product' : 'New Product'}
                                </h2>
                                {editingId && (
                                    <button onClick={handleCancelEdit} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full hover:bg-red-200 transition-colors">
                                        Cancel
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-1 uppercase tracking-wider">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-white/50 border border-white/60 rounded-xl p-3 text-sm text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                                        placeholder="Product Title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-1 uppercase tracking-wider">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-white/50 border border-white/60 rounded-xl p-3 text-sm text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all h-24 resize-none"
                                        placeholder="Product description for SEO..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-1 uppercase tracking-wider">Slug</label>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="w-full bg-white/50 border border-white/60 rounded-xl p-3 text-sm text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                                        placeholder="url-slug"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-1 uppercase tracking-wider">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-white/50 border border-white/60 rounded-xl p-3 text-sm text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select Category...</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-1 uppercase tracking-wider">Password</label>
                                    <input
                                        type="text"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/50 border border-white/60 rounded-xl p-3 text-sm text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all font-mono"
                                        placeholder="Secret Code"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-1 uppercase tracking-wider">Tags</label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="w-full bg-white/50 border border-white/60 rounded-xl p-3 text-sm text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                                        placeholder="comma, separated, tags"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-1 uppercase tracking-wider">Custom Prompt</label>
                                    <textarea
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        className="w-full bg-white/50 border border-white/60 rounded-xl p-3 text-sm text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all h-20 resize-none"
                                        placeholder="AI Instructions..."
                                    />
                                </div>

                                {/* Is Free Checkbox */}
                                <div className="flex items-center gap-2 p-3 bg-teal/5 rounded-xl border border-teal/10">
                                    <input
                                        type="checkbox"
                                        id="isFree"
                                        checked={isFree}
                                        onChange={(e) => setIsFree(e.target.checked)}
                                        className="w-5 h-5 accent-teal rounded cursor-pointer"
                                    />
                                    <label htmlFor="isFree" className="font-bold text-ink text-sm cursor-pointer select-none">
                                        Is Free Product? <span className="text-teal text-xs font-normal">(For Homepage Trial)</span>
                                    </label>
                                </div>

                                {/* Product Type Toggle */}
                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-2 uppercase tracking-wider">AI Analysis Mode</label>
                                    <div className="flex bg-white/50 p-1 rounded-xl border border-white/60">
                                        <button
                                            onClick={() => setProductType('mockup')}
                                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${productType === 'mockup' ? 'bg-teal text-white shadow-md' : 'text-ink/60 hover:bg-white/50'}`}
                                        >
                                            Mockup
                                        </button>
                                        <button
                                            onClick={() => setProductType('scene')}
                                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${productType === 'scene' ? 'bg-teal text-white shadow-md' : 'text-ink/60 hover:bg-white/50'}`}
                                        >
                                            Scene
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-ink/40 mt-1 ml-1">
                                        {productType === 'mockup' ? "For placing designs ON a product (e.g. Hoodie)" : "For placing a product INTO a scene (e.g. Table)"}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-1 uppercase tracking-wider">Base Image (Required)</label>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-ink/70 mb-1 uppercase tracking-wider">Product Name (Hint)</label>
                                            <input
                                                type="text"
                                                value={productNameHint}
                                                onChange={(e) => setProductNameHint(e.target.value)}
                                                className="w-full bg-white/50 border border-white/60 rounded-xl p-2 text-xs text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                                                placeholder="e.g. Gildan 18000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-ink/70 mb-1 uppercase tracking-wider">Keywords (Hint)</label>
                                            <input
                                                type="text"
                                                value={keywordsHint}
                                                onChange={(e) => setKeywordsHint(e.target.value)}
                                                className="w-full bg-white/50 border border-white/60 rounded-xl p-2 text-xs text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                                                placeholder="e.g. Sublimation, Vintage"
                                            />
                                        </div>
                                    </div>

                                    <div
                                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${baseImage ? 'border-teal bg-teal/5' : 'border-ink/10 hover:border-teal/50 hover:bg-white/40'}`}
                                        onClick={() => document.getElementById('baseImageInput')?.click()}
                                    >
                                        <input
                                            type="file"
                                            id="baseImageInput"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => setBaseImage(e.target.files?.[0] || null)}
                                        />
                                        {baseImage ? (
                                            <div className="flex items-center justify-center gap-2 text-teal font-bold">
                                                <CheckCircle size={20} />
                                                {baseImage.name}
                                            </div>
                                        ) : (
                                            <div className="text-ink/40">
                                                <UploadCloud className="mx-auto mb-2" size={32} />
                                                <p className="font-bold">Upload Base Image (4K)</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Magic Fill Button */}
                                    <button
                                        onClick={handleMagicFill}
                                        disabled={!baseImage || isAnalyzing}
                                        className={`w-full mt-3 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!baseImage || isAnalyzing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/20'}`}
                                    >
                                        {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                        {isAnalyzing ? 'Analyzing...' : 'Auto-Fill Details with AI'}
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-1 uppercase tracking-wider">Gallery Image (Optional)</label>
                                    <div
                                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${galleryImage ? 'border-teal bg-teal/5' : 'border-ink/10 hover:border-teal/50 hover:bg-white/40'}`}
                                        onClick={() => document.getElementById('galleryImageInput')?.click()}
                                    >
                                        <input
                                            type="file"
                                            id="galleryImageInput"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => setGalleryImage(e.target.files?.[0] || null)}
                                        />
                                        {galleryImage ? (
                                            <div className="flex items-center justify-center gap-2 text-teal font-bold">
                                                <CheckCircle size={20} />
                                                {galleryImage.name}
                                            </div>
                                        ) : (
                                            <div className="text-ink/40">
                                                <ImageIcon size={32} className="mx-auto mb-2" />
                                                <p className="font-bold">Upload Gallery Thumbnail (Optional)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-teal text-cream font-bold py-3 rounded-xl hover:bg-teal/90 hover:shadow-lg hover:shadow-teal/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {editingId ? 'Update Product' : 'Create Product'}
                                </button>

                                {editingId && (
                                    <div className="mt-8 pt-8 border-t border-ink/10">
                                        <h3 className="font-bold text-ink mb-4 flex items-center gap-2">
                                            <Layers size={18} className="text-teal" /> Variants
                                        </h3>

                                        <div className="space-y-4 mb-6">
                                            {variants.map(v => (
                                                <div key={v.id} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-ink/5">
                                                    <img src={v.base_image_url} alt={v.name} className="w-10 h-10 rounded object-cover bg-gray-100" />
                                                    <span className="font-bold text-sm flex-1">{v.name}</span>
                                                    <button
                                                        onClick={() => handleDeleteVariant(v.id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-3 bg-teal/5 p-4 rounded-xl border border-teal/10">
                                            <input
                                                type="text"
                                                value={variantName}
                                                onChange={(e) => setVariantName(e.target.value)}
                                                placeholder="Variant Name (e.g. Red)"
                                                className="w-full bg-white border border-white/60 rounded-lg p-2 text-sm outline-none focus:border-teal"
                                            />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setVariantImage(e.target.files?.[0] || null)}
                                                className="text-xs w-full"
                                            />
                                            <button
                                                onClick={handleCreateVariant}
                                                disabled={variantLoading || !variantName || !variantImage}
                                                className="w-full bg-teal text-white font-bold py-2 rounded-lg text-xs hover:bg-teal/90 disabled:opacity-50"
                                            >
                                                {variantLoading ? 'Uploading...' : 'Add Variant'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {message && (
                                    <div className={`p-3 rounded-xl text-center font-bold text-xs ${message.startsWith('Error') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-2">
                        <div className="glass p-8 rounded-3xl shadow-2xl">
                            <h2 className="text-xl font-bold text-ink mb-6">Product List ({products.length})</h2>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs font-bold text-ink/50 uppercase tracking-wider border-b border-ink/10">
                                            <th className="pb-3 pl-2">Image</th>
                                            <th className="pb-3">Title</th>
                                            <th className="pb-3">Slug</th>
                                            <th className="pb-3">Tags</th>
                                            <th className="pb-3 text-right pr-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {products.map((product) => (
                                            <tr key={product.id} className="border-b border-ink/5 hover:bg-white/30 transition-colors group">
                                                <td className="py-3 pl-2">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-ink/10">
                                                        <img src={product.base_image_url} alt={product.title} className="w-full h-full object-cover" />
                                                    </div>
                                                </td>
                                                <td className="py-3 font-bold text-ink">
                                                    <div>{product.title}</div>
                                                    {product.is_free && (
                                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">FREE</span>
                                                    )}
                                                    {product.category && (
                                                        <span className="block text-[10px] text-ink/40 font-normal mt-0.5">{product.category}</span>
                                                    )}
                                                </td>
                                                <td className="py-3 text-ink/60 font-mono text-xs">{product.slug}</td>
                                                <td className="py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {product.tags?.slice(0, 2).map((tag: string) => (
                                                            <span key={tag} className="text-[10px] bg-teal/10 text-teal px-2 py-0.5 rounded-full">{tag}</span>
                                                        ))}
                                                        {product.tags?.length > 2 && <span className="text-[10px] text-ink/40">+{product.tags.length - 2}</span>}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-right pr-2">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {products.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-ink/40 italic">
                                                    No products found. Create one to get started.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}