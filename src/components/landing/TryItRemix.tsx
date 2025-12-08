'use client';

import { useState, useRef } from 'react';
import { Upload, Sparkles, Loader2, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

export default function TryItRemix() {
    const [image, setImage] = useState<string | null>(null);
    const [styleReferences, setStyleReferences] = useState<string[]>([]);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
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
                    aspectRatio: '1:1'
                }),
            });

            const data = await response.json();
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
        <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-2xl shadow-teal/5 transition-all duration-500 min-h-[500px] flex flex-col">
            <div className="flex-1 grid md:grid-cols-2 gap-8">
                {/* Input Side */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-ink/70 mb-2 uppercase tracking-wider">1. Upload Your Product</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${image ? 'border-teal bg-teal/5' : 'border-ink/10 hover:border-teal/50 hover:bg-white/40'}`}
                        >
                            {image ? (
                                <>
                                    <Image src={image} alt="Upload" fill className="object-contain p-4" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                                        Change Image
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                    <div className="w-12 h-12 bg-teal/10 text-teal rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Upload size={20} />
                                    </div>
                                    <p className="font-bold text-ink text-sm">Click to Upload</p>
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
                        <label className="block text-xs font-bold text-ink/70 mb-2 uppercase tracking-wider">2. Describe the Scene</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Sitting on a marble table in a modern kitchen with sunlight streaming in..."
                            className="w-full h-32 bg-white border border-white/60 rounded-xl p-4 text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none resize-none"
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

                    <button
                        onClick={handleGenerate}
                        disabled={!image || !prompt || loading}
                        className="w-full bg-teal text-white font-bold py-4 rounded-xl shadow-lg shadow-teal/20 hover:shadow-xl hover:shadow-teal/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        {loading ? 'Generating Magic...' : 'Generate Product Shot'}
                    </button>
                </div>

                {/* Result Side */}
                <div className="bg-white rounded-2xl border border-ink/5 shadow-inner flex items-center justify-center relative overflow-hidden min-h-[300px] md:min-h-0">
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
    );
}
