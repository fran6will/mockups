'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Sparkles, Loader2, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/ui/Header';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function CustomMockupPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [title, setTitle] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successProduct, setSuccessProduct] = useState<any>(null);
    const [consent, setConsent] = useState(false);
    const [userTemplates, setUserTemplates] = useState<any[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
        multiple: false
    });

    useEffect(() => {
        const fetchUserTemplates = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoadingTemplates(false);
                return;
            }

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('created_by', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching user templates:", error);
                setError("Failed to load your templates.");
            } else {
                setUserTemplates(data || []);
            }
            setLoadingTemplates(false);
        };
        fetchUserTemplates();
    }, [successProduct]); // Refresh when a new product is created

    const handleGenerate = async () => {
        if (!file || !prompt || !title || !consent) return;

        setIsGenerating(true);
        setError(null);

        try {
            // Convert file to base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
            });

            const response = await fetch('/api/custom/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: base64,
                    prompt,
                    title
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create custom mockup');
            }

            setSuccessProduct(data.product);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream font-sans text-ink">
            <Header />

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal/10 rounded-full blur-[120px] -z-10"></div>
                    <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur border border-white/60 px-4 py-1.5 rounded-full text-sm font-bold text-teal mb-6 shadow-sm">
                        <Sparkles size={16} />
                        <span>AI Scene Generator</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-ink">
                        Create Your Own <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-purple-600">Magic Scenes</span>
                    </h1>
                    <p className="text-xl text-ink/60 max-w-2xl mx-auto leading-relaxed">
                        Don't see the template you need? Upload a blank product photo and describe the scene. Our AI will place it in a professional environment instantly.
                    </p>
                </div>

                {/* How it Works */}
                <div className="grid md:grid-cols-3 gap-6 mb-20">
                    {[
                        { icon: UploadCloud, title: "1. Upload Product", desc: "Upload a clean photo of your product on a plain background (like from Printify)." },
                        { icon: Sparkles, title: "2. Describe Scene", desc: "Tell the AI where to place it. 'On a marble table', 'In a cozy coffee shop', etc." },
                        { icon: CheckCircle, title: "3. Get Template", desc: "We'll generate a reusable template that you can use to create unlimited mockups." }
                    ].map((step, i) => (
                        <div key={i} className="glass p-6 rounded-2xl border border-white/40 shadow-lg shadow-teal/5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-teal select-none">
                                {i + 1}
                            </div>
                            <div className="w-12 h-12 bg-teal/10 text-teal rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <step.icon size={24} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                            <p className="text-sm text-ink/60">{step.desc}</p>
                        </div>
                    ))}
                </div>

                {successProduct ? (
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-teal/10 text-center animate-in zoom-in-95 duration-500 mb-16">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Template Created!</h2>
                        <p className="text-ink/60 mb-8 max-w-md mx-auto">
                            Your custom template "{successProduct.title}" is ready. You can now use it to generate mockups.
                        </p>

                        <div className="aspect-square w-64 mx-auto rounded-2xl overflow-hidden shadow-lg mb-8 border border-ink/5">
                            <img src={successProduct.base_image_url} alt="Generated Scene" className="w-full h-full object-cover" />
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => router.push(`/${successProduct.slug}`)}
                                className="bg-teal text-white font-bold px-8 py-4 rounded-xl hover:bg-teal/90 transition-all shadow-lg shadow-teal/20 flex items-center gap-2"
                            >
                                <Sparkles size={20} /> Use Template
                            </button>
                            <button
                                onClick={() => {
                                    setSuccessProduct(null);
                                    setFile(null);
                                    setPreview(null);
                                    setPrompt('');
                                    setTitle('');
                                }}
                                className="bg-gray-100 text-ink font-bold px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Create Another
                            </button>
                        </div>
                        <p className="text-xs text-ink/40 mt-6">
                            Note: This template is currently private. An admin may review it for public release.
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-12 items-start mb-20">
                        {/* Left: Upload */}
                        <div className="space-y-6">
                            <div
                                {...getRootProps()}
                                className={`aspect-square rounded-[2rem] border-4 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-teal bg-teal/5' : 'border-ink/10 hover:border-teal/30 hover:bg-white'
                                    } ${preview ? 'bg-white border-solid border-ink/5' : ''}`}
                            >
                                <input {...getInputProps()} />
                                {preview ? (
                                    <div className="relative w-full h-full group">
                                        <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                            <p className="text-white font-bold flex items-center gap-2">
                                                <UploadCloud size={20} /> Change Image
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-teal/10 text-teal rounded-full flex items-center justify-center mb-6">
                                            <UploadCloud size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-ink mb-2">Upload Blank Product</h3>
                                        <p className="text-ink/50 text-sm max-w-[200px]">
                                            Drag & drop or click to upload. <br />(PNG or JPG, max 5MB)
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right: Form */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-ink/5 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-ink/70 mb-2">Template Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. White Hoodie on Hanger"
                                    className="w-full bg-gray-50 border border-ink/10 rounded-xl p-4 text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-ink/70 mb-2">Scene Prompt</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe the scene you want... e.g. 'Folded on a rustic wooden table with coffee beans nearby, cinematic lighting'"
                                    className="w-full bg-gray-50 border border-ink/10 rounded-xl p-4 text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all h-32 resize-none"
                                />
                                <p className="text-xs text-ink/40 mt-2">
                                    The AI will place your blank product into this scene while keeping the product itself unchanged.
                                </p>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-900">
                                    <label className="flex items-center gap-2 cursor-pointer font-bold mb-1">
                                        <input
                                            type="checkbox"
                                            checked={consent}
                                            onChange={(e) => setConsent(e.target.checked)}
                                            className="accent-teal w-4 h-4"
                                        />
                                        I agree to the terms
                                    </label>
                                    <p className="opacity-80 text-xs">
                                        By generating this template, you consent that it may be reviewed by admins and potentially offered as a public template in the gallery.
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}

                            <button
                                onClick={handleGenerate}
                                disabled={!file || !prompt || !title || !consent || isGenerating}
                                className="w-full bg-teal text-white font-bold py-4 rounded-xl hover:bg-teal/90 transition-all shadow-lg shadow-teal/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="animate-spin" /> Generating Scene...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="fill-current" /> Generate Template
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* User Templates Carousel */}
                {userTemplates.length > 0 && (
                    <div className="mt-16 border-t border-ink/5 pt-16">
                        <h2 className="text-2xl font-bold text-ink mb-8 flex items-center gap-2">
                            <Sparkles className="text-teal" /> Your Custom Templates
                        </h2>

                        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar">
                            {userTemplates.map(template => (
                                <div
                                    key={template.id}
                                    onClick={() => router.push(`/${template.slug}`)}
                                    className="snap-center min-w-[240px] group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-teal/10 transition-all duration-300 border border-ink/5 cursor-pointer"
                                >
                                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                                        <img
                                            src={template.base_image_url}
                                            alt={template.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white font-bold bg-white/20 backdrop-blur px-4 py-2 rounded-full">Use Template</span>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="absolute top-3 right-3">
                                            {template.status === 'approved' ? (
                                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Public</span>
                                            ) : template.status === 'rejected' ? (
                                                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Rejected</span>
                                            ) : (
                                                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Pending</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-ink text-sm truncate">{template.title}</h3>
                                        <p className="text-xs text-ink/40 mt-1">
                                            {new Date(template.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
