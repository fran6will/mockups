'use client';
import { useState } from 'react';
import { Upload, Wand2, Loader2, Save, Trash2 } from 'lucide-react';

// Simplified helper for Client-Side file-to-base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

type Step = 'upload' | 'planning' | 'review_plan' | 'generating' | 'done';

type BatchPlan = {
    productAnalysis: any;
    styleAnalysis: any;
    prompts: string[];
};

type GenerationResult = {
    prompt: string;
    status: 'pending' | 'loading' | 'success' | 'error';
    imageUrl?: string;
    error?: string;
    saved?: boolean;
};

export default function BatchCreatorPage() {
    const [step, setStep] = useState<Step>('upload');
    const [blankProductFile, setBlankProductFile] = useState<File | null>(null);
    const [styleRefFile, setStyleRefFile] = useState<File | null>(null);
    const [plan, setPlan] = useState<BatchPlan | null>(null);
    const [generations, setGenerations] = useState<GenerationResult[]>([]);

    // New State for Mode & Collection
    const [mode, setMode] = useState<'coherent' | 'diverse'>('coherent');
    const [collectionName, setCollectionName] = useState<string>(`Batch ${new Date().toLocaleDateString()}`);

    // Upload & Plan
    const handlePlanBatch = async () => {
        if (!blankProductFile || !styleRefFile) return;

        setStep('planning');
        try {
            // Convert files to base64 immediately for sending to API
            const productBase64 = await fileToBase64(blankProductFile);
            const styleBase64 = await fileToBase64(styleRefFile);

            const res = await fetch('/api/admin/batch-create', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'plan',
                    blankProductUrl: productBase64,
                    styleImageUrl: styleBase64,
                    mode: mode // Pass mode
                })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setPlan(data);
            // Initialize generations state
            setGenerations(data.prompts.map((p: string) => ({
                prompt: p,
                status: 'pending'
            })));
            setStep('review_plan');

        } catch (error) {
            console.error(error);
            alert("Analysis failed. See console.");
            setStep('upload');
        }
    };

    // Execute Batch
    const handleGenerateAll = async () => {
        if (!blankProductFile || !styleRefFile || !plan) return;
        setStep('generating');

        const productBase64 = await fileToBase64(blankProductFile);
        const styleBase64 = await fileToBase64(styleRefFile);

        // We run these sequentially or in limited parallel to avoid hitting rate limits too hard?
        // Let's do them one by one for this prototype to see progress clearly.
        const newGenerations = [...generations];

        for (let i = 0; i < newGenerations.length; i++) {
            newGenerations[i] = { ...newGenerations[i], status: 'loading' };
            setGenerations([...newGenerations]);

            try {
                const res = await fetch('/api/admin/batch-create', {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'execute',
                        blankProductUrl: productBase64,
                        styleImageUrl: styleBase64,
                        prompt: newGenerations[i].prompt
                    })
                });
                const data = await res.json();

                if (data.success && data.mockUrl) {
                    newGenerations[i] = {
                        ...newGenerations[i],
                        status: 'success',
                        imageUrl: data.mockUrl
                    };
                } else {
                    newGenerations[i] = {
                        ...newGenerations[i],
                        status: 'error',
                        error: data.error || 'Unknown error'
                    };
                }
            } catch (err: any) {
                newGenerations[i] = {
                    ...newGenerations[i],
                    status: 'error',
                    error: err.message
                };
            }
            // Update state after each one
            setGenerations([...newGenerations]);
        }
        setStep('done');
    };

    return (
        <div className="min-h-screen bg-[#F2F0E9] p-8 text-[#1A1A1A]">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-serif font-bold text-[#E94E1B]">Batch Creator (Agentic)</h1>
                    <p className="text-[#2A7F7F]">Generate multiple mockup variations from a single product + style reference.</p>
                </header>

                <div className="bg-white/50 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-xl">

                    {/* STEP 1: UPLOAD */}
                    {step === 'upload' && (
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">1. Blank Product</h3>
                                <div className="border-2 border-dashed border-[#2A7F7F]/30 rounded-xl p-8 flex flex-col items-center justify-center bg-white/40 hover:bg-white/60 transition-colors relative h-64">
                                    {blankProductFile ? (
                                        <div className="absolute inset-0 p-2">
                                            <img src={URL.createObjectURL(blankProductFile)} className="w-full h-full object-contain rounded-lg" />
                                            <button onClick={() => setBlankProductFile(null)} className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-sm text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                onChange={(e) => e.target.files?.[0] && setBlankProductFile(e.target.files[0])}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                accept="image/*"
                                            />
                                            <Upload className="w-10 h-10 text-[#2A7F7F] mb-2" />
                                            <p className="text-sm text-gray-500 text-center">Upload Clean Product Image</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">2. Style Reference</h3>
                                <div className="border-2 border-dashed border-[#E94E1B]/30 rounded-xl p-8 flex flex-col items-center justify-center bg-white/40 hover:bg-white/60 transition-colors relative h-64">
                                    {styleRefFile ? (
                                        <div className="absolute inset-0 p-2">
                                            <img src={URL.createObjectURL(styleRefFile)} className="w-full h-full object-cover rounded-lg" />
                                            <button onClick={() => setStyleRefFile(null)} className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-sm text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                onChange={(e) => e.target.files?.[0] && setStyleRefFile(e.target.files[0])}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                accept="image/*"
                                            />
                                            <Upload className="w-10 h-10 text-[#E94E1B] mb-2" />
                                            <p className="text-sm text-gray-500 text-center">Upload Style Vibe Image</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-2 mt-4 space-y-4">
                                <div>
                                    <h3 className="font-bold text-lg mb-2">3. Creativity Mode</h3>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setMode('coherent')}
                                            className={`flex-1 p-4 rounded-xl border transition-all text-left ${mode === 'coherent' ? 'border-[#2A7F7F] bg-[#2A7F7F]/10 ring-2 ring-[#2A7F7F]' : 'border-gray-200 hover:bg-white/60'}`}
                                        >
                                            <div className="font-bold text-[#2A7F7F] mb-1">Coherent</div>
                                            <p className="text-xs text-gray-500">Sticks strictly to the style reference. Consistent lighting and vibe.</p>
                                        </button>
                                        <button
                                            onClick={() => setMode('diverse')}
                                            className={`flex-1 p-4 rounded-xl border transition-all text-left ${mode === 'diverse' ? 'border-[#E94E1B] bg-[#E94E1B]/10 ring-2 ring-[#E94E1B]' : 'border-gray-200 hover:bg-white/60'}`}
                                        >
                                            <div className="font-bold text-[#E94E1B] mb-1">Diverse</div>
                                            <p className="text-xs text-gray-500">Creatively diverges. varied settings and angles. More experimental.</p>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-center pt-4">
                                    <button
                                        className="bg-[#2A7F7F] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        onClick={handlePlanBatch}
                                        disabled={!blankProductFile || !styleRefFile}
                                    >
                                        <Wand2 size={20} />
                                        Analyze & Plan Batch
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PLANNING LOADING */}
                    {step === 'planning' && (
                        <div className="text-center py-20">
                            <Loader2 className="w-12 h-12 text-[#2A7F7F] animate-spin mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">
                                Analyzing ({mode} mode)...
                            </h3>
                            <p className="text-gray-500">Gemini is studying the product shape and style vibe.</p>
                        </div>
                    )}

                    {/* STEP 3: REVIEW PLAN */}
                    {step === 'review_plan' && plan && (
                        <div>
                            <div className="grid grid-cols-2 gap-6 mb-8 bg-white/40 p-6 rounded-xl">
                                <div>
                                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Product Analysis</h4>
                                    <p className="font-medium text-sm">{plan.productAnalysis.description}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Style Analysis ({mode})</h4>
                                    <p className="font-medium text-sm">{plan.styleAnalysis.description}</p>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg mb-4">Proposed Scenes</h3>
                            <div className="space-y-4 mb-8">
                                {generations.map((gen, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 items-start">
                                        <div className="bg-[#2A7F7F]/10 text-[#2A7F7F] font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                                            {idx + 1}
                                        </div>
                                        <textarea
                                            value={gen.prompt}
                                            onChange={(e) => {
                                                const newGens = [...generations];
                                                newGens[idx].prompt = e.target.value;
                                                setGenerations(newGens);
                                            }}
                                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm h-16 resize-none"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setStep('upload')}
                                    className="px-6 py-3 rounded-full font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleGenerateAll}
                                    className="bg-[#E94E1B] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <Wand2 size={20} />
                                    Generate All ({generations.length})
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4 & 5: GENERATING / DONE */}
                    {(step === 'generating' || step === 'done') && (
                        <div>
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                {step === 'generating' ? <Loader2 className="animate-spin text-[#E94E1B]" /> : <Wand2 className="text-[#2A7F7F]" />}
                                {step === 'generating' ? 'Generating Batch...' : 'Batch Complete!'}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {generations.map((gen, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                        <div className="aspect-square bg-gray-50 relative flex items-center justify-center">
                                            {gen.status === 'pending' && <p className="text-gray-400 text-sm">Waiting...</p>}
                                            {gen.status === 'loading' && <Loader2 className="w-8 h-8 text-[#E94E1B] animate-spin" />}
                                            {gen.status === 'error' && (
                                                <div className="p-4 text-center">
                                                    <p className="text-red-500 font-bold mb-1">Failed</p>
                                                    <p className="text-xs text-red-400">{gen.error}</p>
                                                </div>
                                            )}
                                            {gen.status === 'success' && gen.imageUrl && (
                                                <div className="relative w-full h-full">
                                                    <img src={gen.imageUrl} className="w-full h-full object-cover" />
                                                    {gen.saved && (
                                                        <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-md">
                                                            <div className="w-6 h-6 flex items-center justify-center font-bold text-xs">✓</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <p className="text-xs text-gray-500 line-clamp-2" title={gen.prompt}>{gen.prompt}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {step === 'done' && (
                                <div className="mt-8 flex flex-col items-center gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 w-full max-w-md">
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Collection Name (Tag)</label>
                                        <input
                                            type="text"
                                            value={collectionName}
                                            onChange={(e) => setCollectionName(e.target.value)}
                                            className="w-full text-lg font-bold border-none p-0 focus:ring-0 text-[#1A1A1A] placeholder-gray-300"
                                            placeholder="e.g. Summer Vibes 2025"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all"
                                        >
                                            Start New Batch
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const successfulGens = generations.filter(g => g.status === 'success' && g.imageUrl && !g.saved);
                                                if (successfulGens.length === 0) return;

                                                const newGens = [...generations];

                                                for (let i = 0; i < newGens.length; i++) {
                                                    if (newGens[i].status === 'success' && !newGens[i].saved) {
                                                        try {
                                                            const res = await fetch('/api/admin/batch-create', {
                                                                method: 'POST',
                                                                body: JSON.stringify({
                                                                    action: 'save',
                                                                    imageUrl: newGens[i].imageUrl,
                                                                    prompt: newGens[i].prompt,
                                                                    collectionName: collectionName // Pass collection name
                                                                })
                                                            });
                                                            const data = await res.json();
                                                            if (data.success) {
                                                                newGens[i].saved = true;
                                                            }
                                                        } catch (e) {
                                                            console.error("Failed to save", e);
                                                        }
                                                        setGenerations([...newGens]);
                                                    }
                                                }
                                            }}
                                            className="bg-[#2A7F7F] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                                        >
                                            <Save size={20} />
                                            Save All to Collection
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
