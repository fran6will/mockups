'use client';

import { useState } from 'react';
import { Upload, Download, Loader2, Sparkles, Image as ImageIcon, Monitor, Smartphone, Type, Crop } from 'lucide-react';

interface ImageCompositorProps {
    productId: string;
    baseImageUrl: string;
}

export default function ImageCompositor({ productId, baseImageUrl }: ImageCompositorProps) {
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<string>('1:1');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const aspectRatios = [
        { label: 'Square', value: '1:1', icon: <Crop size={16} /> },
        { label: 'Wide', value: '16:9', icon: <Monitor size={16} /> },
        { label: 'Story', value: '9:16', icon: <Smartphone size={16} /> },
        { label: '4:3', value: '4:3', icon: <ImageIcon size={16} /> },
    ];

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
            setGeneratedImage(null);
        }
    };

    const handleGenerate = async () => {
        if (!logo) return;

        setLoading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(logo);
            reader.onload = async () => {
                const base64Logo = reader.result as string;

                const res = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId,
                        logoUrl: base64Logo,
                        aspectRatio,
                    }),
                });

                const data = await res.json();
                if (data.success) {
                    setGeneratedImage(data.imageUrl);
                } else {
                    alert('Generation failed: ' + data.error);
                }
                setLoading(false);
            };
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert('An error occurred');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Controls */}
            <div className="w-full lg:w-1/3 space-y-6">

                {/* Step 1: Upload */}
                <div className="glass p-8 rounded-3xl transition-transform hover:scale-[1.01] duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal font-bold">1</div>
                        <h3 className="text-xl font-bold text-ink">Upload Product Asset - Design or Pattern</h3>
                    </div>

                    <div className="relative group">
                        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${logo
                            ? 'border-teal bg-teal/5'
                            : 'border-teal/30 bg-white/30 hover:border-teal/60 hover:bg-white/50'
                            }`}>
                            <input
                                type="file"
                                onChange={handleLogoUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                accept="image/*"
                            />
                            <div className="flex flex-col items-center gap-3">
                                {logoPreview ? (
                                    <div className="relative w-24 h-24 mb-2">
                                        <img
                                            src={logoPreview}
                                            alt="Logo Preview"
                                            className="w-full h-full object-contain drop-shadow-md"
                                        />
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-teal shadow-sm">
                                            Change
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload className="text-teal" size={28} />
                                    </div>
                                )}
                                <div className="text-ink/80 font-medium">
                                    {logo ? logo.name : 'Drop logo here or click to browse'}
                                </div>
                                <p className="text-xs text-ink/40">Supports PNG, JPG, SVG</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 2: Settings */}
                <div className="glass p-8 rounded-3xl transition-transform hover:scale-[1.01] duration-300 delay-75">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal font-bold">2</div>
                        <h3 className="text-xl font-bold text-ink">Configuration</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {aspectRatios.map((ratio) => (
                            <button
                                key={ratio.value}
                                onClick={() => setAspectRatio(ratio.value)}
                                className={`flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${aspectRatio === ratio.value
                                    ? 'bg-teal text-cream shadow-lg shadow-teal/20 scale-105'
                                    : 'bg-white/40 text-ink/70 hover:bg-white/80 hover:text-ink'
                                    }`}
                            >
                                {ratio.icon}
                                {ratio.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleGenerate}
                    disabled={!logo || loading}
                    className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${!logo || loading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'
                        : 'bg-gradient-to-r from-teal to-[#1F6666] text-cream shadow-xl shadow-teal/20 hover:shadow-2xl hover:shadow-teal/30 hover:-translate-y-1 active:scale-[0.98]'
                        }`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" />
                            <span>Creating Magic...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="fill-cream" />
                            <span>Generate Mockup</span>
                        </>
                    )}
                </button>

                {generatedImage && (
                    <a
                        href={generatedImage}
                        download="mockup.png"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-white/60 backdrop-blur border border-white text-teal font-bold py-4 rounded-2xl text-center hover:bg-white hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <Download size={20} />
                        Download High-Res
                    </a>
                )}
            </div>

            {/* Right: Preview Area */}
            <div className="w-full lg:w-2/3">
                <div className="glass p-3 rounded-[2rem] shadow-2xl relative aspect-video group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-[2rem] z-10 border border-white/20"></div>

                    <div className="w-full h-full bg-white/50 rounded-[1.5rem] overflow-hidden relative flex items-center justify-center">
                        
                        {/* 1. Image Layer: Shows either the result or the base product */}
                        {generatedImage && !loading ? (
                            <div className="relative w-full h-full">
                                <img 
                                    src={generatedImage} 
                                    alt="Generated Mockup" 
                                    className="w-full h-full object-contain animate-in fade-in duration-700" 
                                />
                                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    AI Generated Preview
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img 
                                    src={baseImageUrl} 
                                    alt="Base Product" 
                                    className={`w-full h-full object-contain transition-all duration-500 ${
                                        loading ? 'opacity-100 grayscale-0' : 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60'
                                    }`} 
                                />
                            </div>
                        )}

                        {/* 2. Loading Overlay Layer */}
                        {loading && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center animate-in fade-in duration-300 bg-transparent">
                                <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-white/50 flex flex-col items-center">
                                    <div className="relative w-20 h-20 mb-4">
                                        <div className="absolute inset-0 rounded-full bg-teal/20 animate-ping"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-teal/20 border-t-teal animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="text-teal animate-pulse" size={28} />
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-ink animate-pulse">Generating...</h4>
                                    <p className="text-ink/60 mt-1 text-xs font-medium">Applying AI magic</p>
                                </div>
                            </div>
                        )}

                        {/* 3. Idle CTA Layer (Only if NOT loading and NO Result) */}
                        {!loading && !generatedImage && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                                <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/50 max-w-xs text-center transform group-hover:scale-105 transition-transform duration-300">
                                    <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-3 text-teal">
                                        <Sparkles size={24} />
                                    </div>
                                    <h4 className="font-bold text-ink mb-1">Ready to Create</h4>
                                    <p className="text-sm text-ink/60">Upload your logo and choose settings to see the result here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-ink/40 font-medium">Powered by Google Gemini</p>
                </div>
            </div>
        </div>
    );
}