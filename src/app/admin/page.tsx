'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Upload, Save, Loader2, ShieldCheck } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function AdminPage() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [password, setPassword] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpload = async () => {
        if (!file || !title || !slug || !password) {
            setMessage('Please fill all fields');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // 1. Upload Image
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('mockup-bases')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('mockup-bases')
                .getPublicUrl(filePath);

            // 2. Insert Product Record via Server Action (Bypasses RLS)
            const formData = new FormData();
            formData.append('title', title);
            formData.append('slug', slug);
            formData.append('password', password);
            formData.append('baseImageUrl', publicUrl);
            formData.append('customPrompt', customPrompt);

            const { createProduct } = await import('../actions');
            const result = await createProduct(formData);

            if (result.error) throw new Error(result.error);

            setMessage('Product created successfully!');
            // Reset form
            setTitle('');
            setSlug('');
            setPassword('');
            setCustomPrompt('');
            setFile(null);

        } catch (error: any) {
            console.error(error);
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8 font-sans text-ink">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center shadow-lg shadow-teal/30">
                            <ShieldCheck className="text-cream" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-ink tracking-tight">
                            Admin Dashboard
                        </h1>
                    </div>
                    <Logo showText={false} className="opacity-50 hover:opacity-100 transition-opacity" />
                </header>

                <div className="glass p-8 rounded-3xl shadow-2xl transition-all hover:shadow-teal/10">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-ink">
                        <span className="bg-teal/10 text-teal text-xs px-2 py-1 rounded-full">New</span>
                        Create Product Template
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-ink/80 mb-2">Product Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white/40 border border-white/60 rounded-xl p-4 text-ink focus:ring-2 focus:ring-teal focus:border-transparent outline-none transition placeholder:text-ink/30"
                                placeholder="e.g. Vintage Heavyweight Tee"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-ink/80 mb-2">URL Slug</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 text-sm">/</span>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="w-full bg-white/40 border border-white/60 rounded-xl p-4 pl-8 text-ink focus:ring-2 focus:ring-teal focus:border-transparent outline-none transition placeholder:text-ink/30"
                                        placeholder="vintage-tee"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-ink/80 mb-2">Access Password</label>
                                <input
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/40 border border-white/60 rounded-xl p-4 text-ink focus:ring-2 focus:ring-teal focus:border-transparent outline-none transition placeholder:text-ink/30"
                                    placeholder="Set a secure password"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-ink/80 mb-2">
                                Custom Prompt Hint <span className="text-ink/40 font-normal">(Optional)</span>
                            </label>
                            <textarea
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                className="w-full bg-white/40 border border-white/60 rounded-xl p-4 text-ink focus:ring-2 focus:ring-teal focus:border-transparent outline-none transition h-24 resize-none placeholder:text-ink/30"
                                placeholder="Guide the AI: 'Place logo on the left chest pocket area. Maintain fabric wrinkles.'"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-ink/80 mb-2">Base Image (High Quality)</label>
                            <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group relative ${file ? 'border-teal bg-teal/5' : 'border-teal/30 bg-white/30 hover:border-teal/60 hover:bg-white/50'}`}>
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    accept="image/*"
                                />
                                {file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-teal text-cream rounded-full flex items-center justify-center">
                                            <Save size={20} />
                                        </div>
                                        <div className="text-teal font-bold">{file.name}</div>
                                        <div className="text-xs text-teal/60">Click to change</div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-14 h-14 bg-teal/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload className="text-teal" size={24} />
                                        </div>
                                        <span className="font-medium text-ink/70 group-hover:text-teal transition-colors">Drop base image here or click to browse</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg ${loading
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-teal text-cream hover:bg-teal/90 hover:shadow-teal/20 hover:-translate-y-1'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Creating Product...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Create Product Template
                                    </>
                                )}
                            </button>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl text-center font-medium animate-in fade-in slide-in-from-bottom-2 ${message.includes('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                {message}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}