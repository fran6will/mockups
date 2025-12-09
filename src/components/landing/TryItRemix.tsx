'use client';

import { useState, useRef } from 'react';
import { Upload, Sparkles, Loader2, Image as ImageIcon, X, UploadCloud, Wand2, Download } from 'lucide-react';
import Image from 'next/image';

export default function TryItRemix() {
    const [image, setImage] = useState<string | null>(null);
    const [styleReferences, setStyleReferences] = useState<string[]>([]);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16' | '16:9'>('1:1');
    const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
    const [showLimitPopup, setShowLimitPopup] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const styleInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target?.result as string);
            reader.readAsDataURL(file);
            setResult(null); // Reset result on new upload
        }
    };

    const handleStyleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + styleReferences.length > 3) {
            alert('Maximum 3 style references allowed');
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setStyleReferences(prev => [...prev, result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeStyleReference = (index: number) => {
        setStyleReferences(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!image || !prompt) return;
        setLoading(true);

        try {
            const response = await fetch('/api/try-it/remix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image,
                    prompt,
                    styleReferences,
                    aspectRatio,
                    imageSize
                }),
            });

            const data = await response.json();

            if (response.status === 429 || data.code === 'LIMIT_REACHED') {
                setShowLimitPopup(true);
                setLoading(false);
                return;
            }

            if (data.error) throw new Error(data.error);
            setResult(data.url);
        } catch (error: any) {
            console.error('Generation failed:', error);
            alert(error.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* How it Works - Copied from Create Scene Remix Mode */}
            <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
                {[
                    { icon: UploadCloud, title: "1. Upload Product", desc: "Upload your existing product photo (with or without design)." },
                    { icon: Wand2, title: "2. Describe Vibe", desc: "Describe the new environment you want to see your product in." },
                    { icon: Download, title: "3. Download", desc: "Get a high-quality marketing image ready for social media." }
                ].map((step, i) => (
                    <div key={i} className="glass p-6 rounded-2xl border border-white/40 shadow-lg shadow-teal/5 relative overflow-hidden group hover:-translate-y-1 transition-transform bg-white/50 backdrop-blur-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl select-none text-teal">
                            {i + 1}
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-teal/10 text-teal">
                            <step.icon size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-ink">{step.title}</h3>
                        <p className="text-sm text-ink/60">{step.desc}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-2xl shadow-teal/5 transition-all duration-500 min-h-[500px] flex flex-col">
                <div className="flex-1 grid md:grid-cols-2 gap-8">
                    {/* Input Side */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-ink/70 mb-2">Upload Product</label>
                            <div
                                className={`aspect-square rounded-2xl border-4 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all hover:border-purple-300 hover:bg-purple-50 group relative overflow-hidden ${!image ? 'border-ink/10' : 'border-purple-500 bg-purple-50'}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {image ? (
                                    <>
                                        <img src={image} alt="Preview" className="w-full h-full object-contain absolute inset-0 p-4" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white font-bold flex items-center gap-2"><Upload size={20} /> Change Image</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Upload size={32} />
                                        </div>
                                        <p className="text-ink font-bold">Click to upload</p>
                                        <p className="text-xs text-ink/40 mt-1">recommends clear background</p>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            {/* Try Example Button */}
                            {!image && (
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await fetch('/test_base.png');
                                            const blob = await response.blob();
                                            const reader = new FileReader();
                                            reader.onload = (e) => {
                                                setImage(e.target?.result as string);
                                                setPrompt("A professional studio shot on a marble podium, cinematic lighting, soft shadows, 4k.");
                                                setResult(null);
                                            };
                                            reader.readAsDataURL(blob);
                                        } catch (err) {
                                            console.error("Failed to load example", err);
                                        }
                                    }}
                                    className="text-xs text-teal font-bold hover:underline flex items-center justify-center gap-1 w-full mt-2"
                                >
                                    <Sparkles size={12} />
                                    No image? Try with an example
                                </button>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-ink/70 mb-2">Describe the Scene</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g. A minimal concrete podium with soft morning sunlight..."
                                className="w-full bg-white border border-ink/10 rounded-xl p-4 text-ink focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all h-32 resize-none shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-ink/70 mb-2 uppercase tracking-wider">
                                3. Style References <span className="text-teal font-normal">(Optional, Max 3)</span>
                            </label>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {styleReferences.map((ref, index) => (
                                    <div key={index} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-ink/10 group">
                                        <Image src={ref} alt={`Style ${index + 1}`} fill className="object-cover" />
                                        <button
                                            onClick={() => removeStyleReference(index)}
                                            className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {styleReferences.length < 3 && (
                                    <div
                                        onClick={() => styleInputRef.current?.click()}
                                        className="w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-ink/10 flex items-center justify-center cursor-pointer hover:border-teal/50 hover:bg-teal/5 transition-all"
                                    >
                                        <Upload size={16} className="text-ink/40" />
                                    </div>
                                )}
                            </div>
                            <input
                                ref={styleInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleStyleUpload}
                            />
                        </div>

                        {/* Settings: Aspect Ratio & Resolution */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-ink/70 mb-2">Aspect Ratio</label>
                                <div className="flex bg-white p-1 rounded-xl border border-ink/10 shadow-sm">
                                    {['1:1', '9:16', '16:9'].map((ratio) => (
                                        <button
                                            key={ratio}
                                            onClick={() => setAspectRatio(ratio as any)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${aspectRatio === ratio
                                                ? 'bg-purple-600 text-white shadow-sm'
                                                : 'text-ink/60 hover:bg-gray-50'}`}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-ink/70 mb-2">Quality</label>
                                <div className="flex bg-white p-1 rounded-xl border border-ink/10 shadow-sm">
                                    {['1K', '2K', '4K'].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setImageSize(size as any)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${imageSize === size
                                                ? 'bg-purple-600 text-white shadow-sm'
                                                : 'text-ink/60 hover:bg-gray-50'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!image || !prompt || loading}
                            className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="fill-current group-hover:scale-110 transition-transform" />}
                            {loading ? 'Generating...' : 'Remix Image'}
                        </button>
                    </div>

                    {/* Result Side */}
                    <div className="flex items-center justify-center min-h-[400px] md:min-h-0 relative bg-ink/5 rounded-2xl p-4">
                        <div
                            className="relative bg-white rounded-2xl border border-ink/5 shadow-inner flex items-center justify-center overflow-hidden w-full transition-all duration-500 ease-in-out"
                            style={{ aspectRatio: aspectRatio.replace(':', '/') }}
                        >
                            {result ? (
                                <Image src={result} alt="Generated Result" fill className="object-cover" />
                            ) : (
                                <div className="text-center p-8 opacity-40">
                                    <ImageIcon size={48} className="mx-auto mb-4 text-ink/20" />
                                    <p className="font-bold text-ink">Your masterpiece will appear here</p>
                                </div>
                            )}

                            {loading && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                                    <div className="text-center">
                                        <Loader2 size={48} className="animate-spin text-teal mx-auto mb-4" />
                                        <p className="font-bold text-teal animate-pulse">Creating scene...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Limit Reached Modal */}
            {showLimitPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full text-center space-y-6 shadow-2xl border border-teal/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal via-purple-500 to-teal"></div>
                        <button
                            onClick={() => setShowLimitPopup(false)}
                            className="absolute top-4 right-4 text-ink/30 hover:text-ink transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <div className="w-24 h-24 bg-teal/10 text-teal rounded-full flex items-center justify-center mx-auto animate-bounce">
                            <Sparkles size={48} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-ink mb-3 tracking-tight">Whoa, slow down Picasso! 🎨</h3>
                            <p className="text-lg text-ink/60 leading-relaxed">
                                You've used up your free samples. Ready to create without limits?
                            </p>
                        </div>
                        <div className="grid gap-3 pt-2">
                            <a href="/pricing" className="w-full bg-gradient-to-r from-teal to-teal/80 text-cream font-bold py-4 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal/20">
                                <Sparkles size={18} /> Get Unlimited Access
                            </a>
                            <button
                                onClick={() => setShowLimitPopup(false)}
                                className="text-sm font-bold text-ink/40 hover:text-ink transition-colors"
                            >
                                No thanks, I'll wait
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
