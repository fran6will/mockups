'use client';

import { useState, useRef } from 'react';
import Header from '@/components/ui/Header';
import { Loader2, Sparkles, AlertTriangle, Lock, Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useAccess } from '@/hooks/use-access';
import Link from 'next/link';

export default function ExperimentalPage() {
    const { accessLevel, isLoading: isAccessLoading } = useAccess();
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target?.result as string);
            reader.readAsDataURL(file);
            setResult(null);
        }
    };

    const handleGenerate = async () => {
        if (!prompt) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/experimental/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, image }),
            });

            const data = await response.json();
            console.log("DEBUG: API Response Data:", data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate');
            }

            let outputUrl: string | null = null;

            if (Array.isArray(data.output) && data.output.length > 0) {
                const item = data.output[0];
                if (typeof item === 'string') {
                    outputUrl = item;
                } else if (typeof item === 'object' && item !== null) {
                    // Handle potential object return (e.g. file object)
                    // Replicate sometimes returns a stream/file object that needs to be stringified or has a url property
                    console.log("DEBUG: Output item is object:", item);
                    if ('url' in item) {
                        outputUrl = (item as any).url;
                    } else {
                        outputUrl = String(item); // Last resort
                    }
                }
            } else if (typeof data.output === 'string') {
                outputUrl = data.output;
            } else if (typeof data.output === 'object' && data.output !== null) {
                console.log("DEBUG: Output is object:", data.output);
                if ('url' in data.output) {
                    outputUrl = (data.output as any).url;
                } else {
                    // If it's a stream object, it might serialize to {}
                    outputUrl = String(data.output);
                }
            }

            if (outputUrl && outputUrl !== '[object Object]' && (outputUrl.startsWith('http') || outputUrl.startsWith('data:image'))) {
                setResult(outputUrl);
            } else {
                console.error("Unexpected output format:", data.output);
                throw new Error('No valid image URL found in response. Check console for details.');
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (isAccessLoading) {
        return (
            <div className="min-h-screen bg-grid-pattern bg-grain flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-teal)]" />
            </div>
        );
    }

    if (accessLevel !== 'pro') {
        return (
            <div className="min-h-screen bg-grid-pattern bg-grain">
                <Header />
                <main className="pt-32 pb-20 px-4 md:px-8 flex items-center justify-center min-h-[80vh]">
                    <div className="max-w-md w-full glass p-8 rounded-3xl text-center space-y-6">
                        <div className="w-16 h-16 bg-[var(--color-teal)]/10 text-[var(--color-teal)] rounded-full flex items-center justify-center mx-auto">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--color-ink)]">Experimental Access</h1>
                        <p className="text-[var(--color-ink)]/60">
                            This experimental lab is reserved for Pro members (including Free Trial).
                        </p>
                        <Link
                            href="/pricing"
                            className="block w-full py-4 rounded-xl bg-[var(--color-ink)] text-white font-bold text-lg hover:opacity-90 transition-all"
                        >
                            Start 7-Day Free Trial
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-grid-pattern bg-grain">
            <Header />
            <main className="pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium border border-purple-500/20 backdrop-blur-sm">
                            <Sparkles className="w-4 h-4" />
                            <span>Experimental Labs</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-ink)]">
                            Remix Your Product Shots
                        </h1>
                        <p className="text-lg text-[var(--color-ink)]/60 max-w-2xl mx-auto">
                            Upload a product photo and let Seedream 4.5 reimagine the scene. Perfect for creating new marketing assets from existing shots.
                        </p>
                    </div>

                    {/* Playground Card */}
                    <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-2xl shadow-teal/5 transition-all duration-500 min-h-[500px] flex flex-col">
                        <div className="flex-1 grid md:grid-cols-2 gap-8">
                            {/* Input Side */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-2 uppercase tracking-wider">1. Upload Image (Optional)</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${image ? 'border-teal bg-teal/5' : 'border-ink/10 hover:border-teal/50 hover:bg-white/40'}`}
                                    >
                                        {image ? (
                                            <>
                                                <Image src={image} alt="Upload" fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                                                    Change Image
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center p-6">
                                                <div className="w-12 h-12 bg-teal/10 text-teal rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Upload size={20} />
                                                </div>
                                                <p className="font-bold text-ink text-sm">Upload Product Shot</p>
                                                <p className="text-xs text-ink/40 mt-1">Remix the scene & lighting</p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-2 uppercase tracking-wider">2. Prompt</label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="A bottle of perfume on a marble table, cinematic lighting, 8k..."
                                        className="w-full h-32 bg-white border border-white/60 rounded-xl p-4 text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !prompt}
                                    className="w-full bg-[var(--color-ink)] text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Remix Scene
                                        </>
                                    )}
                                </button>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}
                            </div>

                            {/* Result Side */}
                            <div className="bg-white rounded-2xl border border-ink/5 shadow-inner flex items-center justify-center relative overflow-hidden min-h-[300px] md:min-h-0">
                                {result ? (
                                    <div className="relative w-full h-full min-h-[300px]">
                                        <Image src={result} alt="Generated Result" fill className="object-contain" unoptimized />
                                        <a
                                            href={result}
                                            download="seedream-generation.webp"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute bottom-4 right-4 bg-white/90 text-[var(--color-ink)] px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-white transition-all"
                                        >
                                            Download
                                        </a>
                                    </div>
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
                                            <p className="font-bold text-teal animate-pulse">Creating magic...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-sm text-[var(--color-ink)]/40">
                        Powered by Replicate & ByteDance. Results may vary.
                    </div>

                </div>
            </main>
        </div>
    );
}
