'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Upload, Sparkles, Loader2, ArrowRight, CheckCircle, Image as ImageIcon, Copy, RefreshCw, Wand2, Save } from 'lucide-react';
import Header from '@/components/ui/Header';
import { generatePSeoStrategyAction, generatePSeoItemAction, savePSeoResultAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function PSeoPage() {
    const router = useRouter(); // For future redirects

    // Inputs
    const [seedKeyword, setSeedKeyword] = useState('');
    const [guidance, setGuidance] = useState('');
    const [baseImage, setBaseImage] = useState<File | null>(null);
    const [logoImage, setLogoImage] = useState<File | null>(null); // Optional

    // State
    const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
    const [strategy, setStrategy] = useState<any[]>([]);

    const [isProcessingBatch, setIsProcessingBatch] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [progress, setProgress] = useState(0);

    // Saving State
    const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
    const [isSaving, setIsSaving] = useState<Record<number, boolean>>({});

    // Upload Helper
    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `pseo-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('mockup-bases')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('mockup-bases')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleGenerateStrategy = async () => {
        if (!seedKeyword) return;
        setIsGeneratingStrategy(true);
        setStrategy([]);
        setResults([]);

        try {
            const result = await generatePSeoStrategyAction(seedKeyword, guidance);
            if (result.error) throw new Error(result.error);
            setStrategy(result.data || []);
        } catch (error: any) {
            alert('Error generating strategy: ' + error.message);
        } finally {
            setIsGeneratingStrategy(false);
        }
    };

    const handleStartBatch = async () => {
        // Base image is mandatory. Logo is optional for "Scene" mode.
        if (!baseImage || strategy.length === 0) {
            alert("Please upload a base product image and generate a strategy first.");
            return;
        }

        setIsProcessingBatch(true);
        setResults([]);
        setProgress(0);
        setSavedIds(new Set()); // Reset saved state

        try {
            // 1. Upload Base Image (Mandatory)
            const baseImageUrl = await uploadImage(baseImage);

            // 2. Upload Logo (Optional)
            let logoUrl: string | undefined = undefined;
            if (logoImage) {
                logoUrl = await uploadImage(logoImage);
            }

            // 3. Loop through strategy items
            const newResults = [];

            for (let i = 0; i < strategy.length; i++) {
                const angle = strategy[i];

                // Call server action for single item
                const itemResult = await generatePSeoItemAction({
                    angle,
                    baseImageUrl,
                    logoUrl, // Pass undefined if no logo
                    seedKeyword
                });

                if (itemResult.success && itemResult.data) {
                    newResults.push(itemResult.data);
                    setResults(prev => [...prev, itemResult.data]);
                } else {
                    console.error("Failed item:", angle.title, itemResult.error);
                    setResults(prev => [...prev, { ...angle, error: itemResult.error }]);
                }

                setProgress(((i + 1) / strategy.length) * 100);
            }

        } catch (error: any) {
            alert('Batch Error: ' + error.message);
        } finally {
            setIsProcessingBatch(false);
        }
    };

    const handleSaveItem = async (item: any, idx: number) => {
        if (savedIds.has(idx) || isSaving[idx]) return;

        setIsSaving(prev => ({ ...prev, [idx]: true }));
        try {
            const result = await savePSeoResultAction(item);
            if (result.success) {
                setSavedIds(prev => new Set(prev).add(idx));
                // Optional: Notify success via toast?
            } else {
                alert('Failed to save: ' + result.error);
            }
        } catch (e: any) {
            alert('Error saving: ' + e.message);
        } finally {
            setIsSaving(prev => ({ ...prev, [idx]: false }));
        }
    };

    // Helper to safely get tags array
    const getTags = (item: any) => {
        if (Array.isArray(item.tags)) return item.tags;
        if (typeof item.tags === 'string') return item.tags.split(',').map((t: string) => t.trim());
        return [];
    };

    return (
        <div className="min-h-screen font-sans text-ink bg-[#f8f9fa]">
            <Header className="mb-8" />
            <div className="max-w-7xl mx-auto px-6 pb-20">

                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-teal rounded-2xl shadow-lg shadow-teal/20 mb-4">
                        <Wand2 className="text-cream" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-ink mb-2">Programmatic SEO Engine</h1>
                    <p className="text-ink/60 max-w-xl mx-auto">
                        Turn one product idea into a complete SEO campaign.
                        Generate optimized titles, tags, and photorealistic mockups automatically.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-10">

                    {/* LEFT COLUMN: Inputs & Strategy */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* 1. Setup Card */}
                        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-ink/5 border border-ink/5">
                            <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center text-xs">1</span>
                                Campaign Setup
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-1 uppercase">Seed Keyword / Product</label>
                                    <input
                                        type="text"
                                        value={seedKeyword}
                                        onChange={(e) => setSeedKeyword(e.target.value)}
                                        placeholder="e.g. Vintage Hoodie"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-1 uppercase">
                                        Campaign Direction (Optional)
                                        <span className="block text-[10px] text-ink/40 normal-case font-normal mt-0.5">Guide the AI (e.g. "Focus on color variants", "Outdoor lifestyle").</span>
                                    </label>
                                    <textarea
                                        value={guidance}
                                        onChange={(e) => setGuidance(e.target.value)}
                                        placeholder="e.g. Generate 5 color variants (Red, Blue, Green, Black, White) or Make all scenes cozy and warm."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all resize-none h-20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-1 uppercase">
                                        Base Product (Mandatory)
                                        <span className="block text-[10px] text-ink/40 normal-case font-normal mt-0.5">The blank item to be placed in scenes.</span>
                                    </label>
                                    <div
                                        onClick={() => document.getElementById('baseImage')?.click()}
                                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${baseImage ? 'border-teal bg-teal/5' : 'border-gray-200 hover:border-teal/50 hover:bg-gray-50'}`}
                                    >
                                        <input type="file" id="baseImage" className="hidden" accept="image/*" onChange={(e) => setBaseImage(e.target.files?.[0] || null)} />
                                        {baseImage ? (
                                            <div className="flex items-center justify-center gap-2 text-teal text-sm font-bold">
                                                <CheckCircle size={16} /> {baseImage.name.slice(0, 20)}...
                                            </div>
                                        ) : (
                                            <div className="text-ink/40 text-xs">
                                                <Upload className="mx-auto mb-1" size={20} />
                                                <span>Upload Template</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-ink/70 mb-1 uppercase">
                                        Design / Logo (Optional)
                                        <span className="block text-[10px] text-ink/40 normal-case font-normal mt-0.5">Upload ONLY if you want to place a design on the product. Leave empty for scene generation.</span>
                                    </label>
                                    <div
                                        onClick={() => document.getElementById('logoImage')?.click()}
                                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${logoImage ? 'border-teal bg-teal/5' : 'border-gray-200 hover:border-teal/50 hover:bg-gray-50'}`}
                                    >
                                        <input type="file" id="logoImage" className="hidden" accept="image/*" onChange={(e) => setLogoImage(e.target.files?.[0] || null)} />
                                        {logoImage ? (
                                            <div className="flex items-center justify-center gap-2 text-teal text-sm font-bold">
                                                <CheckCircle size={16} /> {logoImage.name.slice(0, 20)}...
                                            </div>
                                        ) : (
                                            <div className="text-ink/40 text-xs">
                                                <ImageIcon className="mx-auto mb-1" size={20} />
                                                <span>Upload Logo (Optional)</span>
                                            </div>
                                        )}
                                    </div>
                                    {logoImage && (
                                        <button onClick={(e) => { e.stopPropagation(); setLogoImage(null); }} className="text-[10px] text-red-500 hover:underline mt-1 w-full text-right">
                                            Remove Logo
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={handleGenerateStrategy}
                                    disabled={!seedKeyword || isGeneratingStrategy}
                                    className="w-full bg-ink text-white font-bold py-3 rounded-xl hover:bg-ink/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isGeneratingStrategy ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                    Generate Strategy
                                </button>
                            </div>
                        </div>

                        {/* 2. Strategy List */}
                        {strategy.length > 0 && (
                            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-ink/5 border border-ink/5 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center text-xs">2</span>
                                    Review Angles ({strategy.length})
                                </h2>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                                    {strategy.map((item, idx) => (
                                        <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-teal/30 transition-colors group">
                                            <h3 className="font-bold text-sm text-ink">{item.title}</h3>
                                            <p className="text-xs text-ink/60 mt-1">{item.keyword}</p>
                                            <p className="text-[10px] text-ink/40 mt-1 italic truncate group-hover:whitespace-normal group-hover:text-ink/60 transition-all">
                                                "{item.image_prompt}"
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {!baseImage && (
                                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-sm text-amber-800 animate-pulse">
                                        <div className="mt-0.5 text-amber-600">⚠️</div>
                                        <div>
                                            <p className="font-bold">Missing Base Product</p>
                                            <p className="text-xs mt-1 opacity-80">You must upload a Base Product image (Step 1) to generate scenes.</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleStartBatch}
                                    disabled={!baseImage || isProcessingBatch}
                                    className={`w-full mt-6 font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 relative overflow-hidden ${!baseImage || isProcessingBatch
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-teal to-emerald-500 text-white shadow-teal/20 hover:shadow-xl'
                                        }`}
                                >
                                    {isProcessingBatch ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Processing Batch ({Math.round(progress)}%)
                                            <div className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300" style={{ width: `${progress}%` }} />
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={20} />
                                            Execute Batch
                                        </>
                                    )}
                                </button>

                                {!logoImage && baseImage && (
                                    <p className="text-center text-[10px] text-ink/40 mt-3">
                                        * Running in <strong>Scene Mode</strong> (No Logo applied)
                                    </p>
                                )}
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: Results Grid */}
                    <div className="lg:col-span-8">
                        {results.length === 0 && !isProcessingBatch ? (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-ink/30 border-2 border-dashed border-ink/10 rounded-3xl bg-white/50">
                                <Sparkles size={48} className="mb-4 opacity-50" />
                                <p className="font-bold text-lg">Detailed Results will appear here</p>
                                <p className="text-sm">Configure your campaign settings to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-ink flex items-center gap-3">
                                    Generated Assets
                                    <span className="text-sm font-normal text-ink/50 bg-white px-3 py-1 rounded-full border border-ink/10">
                                        {results.length} / {strategy.length} Completed
                                    </span>
                                </h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {results.map((item, idx) => (
                                        <div key={idx} className="bg-white rounded-3xl shadow-xl shadow-ink/5 border border-ink/5 overflow-hidden group animate-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                                            {/* Image Area */}
                                            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-red-400 font-bold bg-red-50">
                                                        Failed to Generate
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a href={item.image_url} download={`pseo-${idx}.png`} className="bg-white/90 p-2 rounded-full shadow-lg text-ink hover:text-teal backdrop-blur-sm">
                                                        <Copy size={16} />
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-5">
                                                <div className="flex gap-2 mb-2">
                                                    {getTags(item).slice(0, 3).map((tag: string, i: number) => (
                                                        <span key={i} className="text-[10px] uppercase font-bold text-teal bg-teal/5 px-2 py-1 rounded-md">{tag}</span>
                                                    ))}
                                                </div>
                                                <h3 className="font-bold text-lg text-ink leading-tight mb-2">{item.title}</h3>
                                                <p className="text-xs text-ink/60 line-clamp-2 min-h-[2.5em]">{item.description}</p>

                                                <div className="mt-4 pt-4 border-t border-ink/5 flex items-center justify-between">
                                                    <code className="text-[10px] bg-gray-100 px-2 py-1 rounded text-ink/50 font-mono">
                                                        /{item.slug}
                                                    </code>
                                                    <button
                                                        onClick={() => handleSaveItem(item, idx)}
                                                        disabled={savedIds.has(idx) || isSaving[idx]}
                                                        className={`text-xs font-bold flex items-center gap-1 hover:underline transition-colors ${savedIds.has(idx) ? 'text-emerald-500 cursor-default no-underline' : 'text-teal'
                                                            }`}
                                                    >
                                                        {isSaving[idx] ? (
                                                            <>Saving <Loader2 size={12} className="animate-spin" /></>
                                                        ) : savedIds.has(idx) ? (
                                                            <>Saved <CheckCircle size={14} /></>
                                                        ) : (
                                                            <>Save Draft <Save size={14} /></>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {isProcessingBatch && results.length < strategy.length && (
                                        <div className="aspect-[3/4] rounded-3xl border-2 border-dashed border-teal/20 bg-teal/5 flex flex-col items-center justify-center text-teal animate-pulse">
                                            <Loader2 size={32} className="animate-spin mb-2" />
                                            <span className="text-sm font-bold">Generating Variation #{results.length + 1}...</span>
                                            <p className="text-xs text-teal/60 mt-2 max-w-[200px] text-center px-4">Creating photo-realistic composite...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
