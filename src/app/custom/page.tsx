'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Sparkles, Loader2, Image as ImageIcon, CheckCircle, AlertCircle, Download, Wand2, LayoutTemplate, Palette, Plus, X } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/ui/Header';
import { getOptimizedSupabaseUrl } from '@/lib/utils/supabase-image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function CustomMockupPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'template' | 'remix'>('template');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [title, setTitle] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successProduct, setSuccessProduct] = useState<any>(null);
    const [consent, setConsent] = useState(false);
    const [userTemplates, setUserTemplates] = useState<any[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [styleReferences, setStyleReferences] = useState<File[]>([]);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16' | '16:9'>('1:1');

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
        if (!file || !prompt || !title || (mode === 'template' && !consent)) return;

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

            // Convert style references to base64
            const styleRefsBase64 = await Promise.all(styleReferences.map(async (ref) => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(ref);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                });
            }));

            const response = await fetch('/api/custom/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: base64,
                    prompt,
                    title,
                    aspectRatio,
                    styleReferences: styleRefsBase64
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

    const handleDownload = async () => {
        if (!successProduct?.base_image_url) return;
        try {
            const response = await fetch(getOptimizedSupabaseUrl(successProduct.base_image_url, 2000));
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${successProduct.slug || 'custom-scene'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Download failed", e);
            // Fallback: Open in new tab
            window.open(getOptimizedSupabaseUrl(successProduct.base_image_url, 2000), '_blank');
        }
    };

    const handleRefinePrompt = async () => {
        if (!prompt) return;
        setIsRefining(true);
        try {
            const response = await fetch('/api/custom/refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await response.json();
            if (data.refinedPrompt) {
                setPrompt(data.refinedPrompt);
            }
        } catch (error) {
            console.error("Failed to refine prompt", error);
        } finally {
            setIsRefining(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream font-sans text-ink">
            <Header />

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-12 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal/10 rounded-full blur-[120px] -z-10"></div>

                    {/* Mode Selector */}
                    <div className="inline-flex bg-white p-1 rounded-xl shadow-sm border border-ink/5 mb-8">
                        <button
                            onClick={() => setMode('template')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'template' ? 'bg-teal text-white shadow-md' : 'text-ink/60 hover:bg-gray-50'}`}
                        >
                            <LayoutTemplate size={16} /> Template Mode
                        </button>
                        <button
                            onClick={() => setMode('remix')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'remix' ? 'bg-purple-600 text-white shadow-md' : 'text-ink/60 hover:bg-gray-50'}`}
                        >
                            <Palette size={16} /> Remix Mode
                        </button>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-ink">
                        {mode === 'template' ? (
                            <>Create Reusable <span className="text-teal">Templates</span></>
                        ) : (
                            <>Remix Your <span className="text-purple-600">Product Shots</span></>
                        )}
                    </h1>
                    <p className="text-lg text-ink/60 max-w-2xl mx-auto leading-relaxed">
                        {mode === 'template'
                            ? "Upload a blank product to create a reusable scene for your store."
                            : "Upload a finished product shot to instantly place it in a new professional environment."
                        }
                    </p>
                </div>

                {/* How it Works */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {(mode === 'template' ? [
                        { icon: UploadCloud, title: "1. Upload Blank", desc: "Upload a clean photo of your blank product (e.g. from Printify)." },
                        { icon: Sparkles, title: "2. Describe Scene", desc: "Tell the AI where to place it. 'On a marble table', 'In a cozy coffee shop'." },
                        { icon: LayoutTemplate, title: "3. Get Template", desc: "We'll generate a reusable template you can use for unlimited mockups." }
                    ] : [
                        { icon: UploadCloud, title: "1. Upload Product", desc: "Upload your existing product photo (with or without design)." },
                        { icon: Wand2, title: "2. Describe Vibe", desc: "Describe the new environment you want to see your product in." },
                        { icon: Download, title: "3. Download", desc: "Get a high-quality marketing image ready for social media." }
                    ]).map((step, i) => (
                        <div key={i} className="glass p-6 rounded-2xl border border-white/40 shadow-lg shadow-teal/5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                            <div className={`absolute top-0 right-0 p-4 opacity-10 font-black text-6xl select-none ${mode === 'template' ? 'text-teal' : 'text-purple-600'}`}>
                                {i + 1}
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${mode === 'template' ? 'bg-teal/10 text-teal' : 'bg-purple-100 text-purple-600'}`}>
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
                        <h2 className="text-3xl font-bold mb-4">
                            {mode === 'template' ? "Template Created!" : "Image Remixed!"}
                        </h2>
                        <p className="text-ink/60 mb-8 max-w-md mx-auto">
                            {mode === 'template'
                                ? `Your custom template "${successProduct.title}" is ready. You can now use it to generate mockups.`
                                : "Your product has been successfully placed in the new scene."
                            }
                        </p>

                        <div className="aspect-square w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-lg mb-8 border border-ink/5 relative">
                            <Image
                                src={getOptimizedSupabaseUrl(successProduct.base_image_url, 600)}
                                alt="Generated Scene"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>

                        <div className="flex justify-center gap-4">
                            {mode === 'template' && (
                                <button
                                    onClick={() => router.push(`/${successProduct.slug}`)}
                                    className="bg-teal text-white font-bold px-8 py-4 rounded-xl hover:bg-teal/90 transition-all shadow-lg shadow-teal/20 flex items-center gap-2"
                                >
                                    <Sparkles size={20} /> Use Template
                                </button>
                            )}

                            <button
                                onClick={handleDownload}
                                className={`${mode === 'remix' ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200' : 'bg-white text-ink hover:bg-gray-50 border border-ink/5'} font-bold px-8 py-4 rounded-xl transition-all shadow-lg flex items-center gap-2`}
                            >
                                <Download size={20} /> Download Image
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
                                {mode === 'template' ? "Create Another" : "Remix Another"}
                            </button>
                        </div>
                        {mode === 'template' && (
                            <p className="text-xs text-ink/40 mt-6">
                                Note: This template is currently private. An admin may review it for public release.
                            </p>
                        )}
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
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${mode === 'template' ? 'bg-teal/10 text-teal' : 'bg-purple-100 text-purple-600'}`}>
                                            <UploadCloud size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-ink mb-2">
                                            {mode === 'template' ? "Upload Blank Product" : "Upload Product Shot"}
                                        </h3>
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
                                <label className="block text-sm font-bold text-ink/70 mb-2">
                                    {mode === 'template' ? "Template Title" : "Project Name"}
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={mode === 'template' ? "e.g. White Hoodie on Hanger" : "e.g. Summer Campaign Shot"}
                                    className={`w-full bg-gray-50 border border-ink/10 rounded-xl p-4 text-ink focus:ring-2 outline-none transition-all ${mode === 'template' ? 'focus:ring-teal/20 focus:border-teal' : 'focus:ring-purple-200 focus:border-purple-600'}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-ink/70 mb-2">Aspect Ratio</label>
                                <div className="flex bg-gray-50 p-1 rounded-xl border border-ink/10">
                                    {['1:1', '9:16', '16:9'].map((ratio) => (
                                        <button
                                            key={ratio}
                                            onClick={() => setAspectRatio(ratio as any)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${aspectRatio === ratio
                                                ? (mode === 'template' ? 'bg-teal text-white shadow-sm' : 'bg-purple-600 text-white shadow-sm')
                                                : 'text-ink/60 hover:bg-white/50'
                                                }`}
                                        >
                                            {ratio === '1:1' ? 'Square' : ratio === '9:16' ? 'Story' : 'Wide'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-ink/70">Scene Prompt</label>
                                    <button
                                        onClick={handleRefinePrompt}
                                        disabled={!prompt || isRefining}
                                        className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-lg transition-colors disabled:opacity-50 ${mode === 'template' ? 'text-teal hover:bg-teal/5' : 'text-purple-600 hover:bg-purple-50'}`}
                                    >
                                        <Wand2 size={12} className={isRefining ? "animate-spin" : ""} />
                                        {isRefining ? "Refining..." : "Magic Refine"}
                                    </button>
                                </div>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe the scene you want... e.g. 'Folded on a rustic wooden table with coffee beans nearby, cinematic lighting'"
                                    className={`w-full bg-gray-50 border border-ink/10 rounded-xl p-4 text-ink focus:ring-2 outline-none transition-all h-32 resize-none ${mode === 'template' ? 'focus:ring-teal/20 focus:border-teal' : 'focus:ring-purple-200 focus:border-purple-600'}`}
                                />
                                <p className="text-xs text-ink/40 mt-2">
                                    {mode === 'template'
                                        ? "The AI will place your blank product into this scene while keeping the product itself unchanged."
                                        : "The AI will place your product into this new environment, adjusting lighting and shadows naturally."
                                    }
                                </p>
                            </div>

                            {mode === 'remix' && (
                                <div>
                                    <label className="block text-sm font-bold text-ink/70 mb-2">Style References (Optional)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {styleReferences.map((ref, i) => (
                                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-ink/10 group">
                                                <img src={URL.createObjectURL(ref)} alt="Reference" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setStyleReferences(prev => prev.filter((_, idx) => idx !== i))}
                                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {styleReferences.length < 3 && (
                                            <label className="aspect-square rounded-lg border-2 border-dashed border-ink/10 hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center justify-center cursor-pointer transition-all text-ink/40 hover:text-purple-600">
                                                <Plus size={20} />
                                                <span className="text-[10px] font-bold mt-1">Add Ref</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            setStyleReferences(prev => [...prev, e.target.files![0]]);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-xs text-ink/40 mt-2">
                                        Upload up to 3 images to guide the style, lighting, or mood.
                                    </p>
                                </div>
                            )}

                            {mode === 'template' && (
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
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}

                            <button
                                onClick={handleGenerate}
                                disabled={!file || !prompt || !title || (mode === 'template' && !consent) || isGenerating}
                                className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${mode === 'template' ? 'bg-teal hover:bg-teal/90 shadow-teal/20' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'}`}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="animate-spin" /> {mode === 'template' ? "Generating Template..." : "Remixing Image..."}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="fill-current" /> {mode === 'template' ? "Generate Template" : "Remix Product Shot"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )
                }

                {/* User Templates Carousel */}
                {
                    userTemplates.length > 0 && (
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
                                            <Image
                                                src={getOptimizedSupabaseUrl(template.base_image_url, 400)}
                                                alt={template.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                sizes="240px"
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
                    )
                }
            </main >
        </div >
    );
}
