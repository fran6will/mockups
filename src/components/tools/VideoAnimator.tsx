'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Upload, Film, Play, Download, X, AlertCircle, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VideoAnimator() {
    const [user, setUser] = useState<any>(null);
    const [credits, setCredits] = useState<number | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [generationStatus, setGenerationStatus] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const VIDEO_COST = 25;

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                fetchCredits(session.user.id);
            } else {
                // Redirect or show login prompt? For now, let's just show state.
            }
        };
        checkUser();
    }, []);

    const fetchCredits = async (userId: string) => {
        const { data } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single();
        if (data) setCredits(data.balance);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage(e.target?.result as string);
            setError(null);
            setGeneratedVideoUrl(null); // Reset previous video
        };
        reader.readAsDataURL(file);
    };

    const handleAnimate = async () => {
        if (!user) {
            // Trigger login or redirect
            router.push('/pricing'); // Or login
            return;
        }
        if ((credits || 0) < VIDEO_COST) {
            setError(`Insufficient credits. You need ${VIDEO_COST} credits.`);
            return;
        }
        if (!uploadedImage) return;

        setIsGenerating(true);
        setError(null);
        setGenerationStatus('Initializing...');

        try {
            // 1. Start Generation
            const response = await fetch('/api/animate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    imageUrl: uploadedImage,
                    prompt: prompt || "Animate this image cinematically",
                    aspectRatio: '1:1', // Default for now, or detect from image
                    productId: null // Standalone
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start generation');
            }

            // Update credits locally
            if (data.remainingCredits !== undefined) {
                setCredits(data.remainingCredits);
            }

            const operationName = data.operationName;
            setGenerationStatus('Animating... (this usually takes 1-2 minutes)');

            // 2. Poll for Status
            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await fetch('/api/animate/status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ operationName })
                    });

                    if (!statusRes.ok) return; // Retry next tick

                    const statusData = await statusRes.json();

                    if (statusData.status === 'done') {
                        clearInterval(pollInterval);
                        setIsGenerating(false);

                        if (statusData.error) {
                            setError(statusData.error);
                        } else if (statusData.videoUri) {
                            setGeneratedVideoUrl(statusData.videoUri);
                        }
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 5000);

        } catch (err: any) {
            setIsGenerating(false);
            setError(err.message);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Top Section: Visuals */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Upload */}
                <div
                    className={`aspect-square rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${uploadedImage ? 'border-teal/20 bg-teal/5' : 'border-ink/10 hover:border-teal/50 hover:bg-teal/5'
                        }`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {uploadedImage ? (
                        <img src={uploadedImage} alt="Upload" className="w-full h-full object-contain p-8" />
                    ) : (
                        <div className="text-center p-6">
                            <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6 text-teal">
                                <Upload size={32} />
                            </div>
                            <p className="font-bold text-ink text-lg mb-2">Click to upload image</p>
                            <p className="text-ink/40">JPG or PNG, max 5MB</p>
                        </div>
                    )}

                    {uploadedImage && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold backdrop-blur-sm">
                            Change Image
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                </div>

                {/* Right: Result */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-ink/5 shadow-sm aspect-square flex flex-col relative overflow-hidden">
                    <div className="absolute top-6 left-8 flex items-center gap-2 z-10">
                        <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal">
                            <Film size={16} />
                        </div>
                        <span className="font-bold text-ink">Result</span>
                    </div>

                    <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-3xl border border-ink/5 overflow-hidden relative mt-12">
                        {generatedVideoUrl ? (
                            <div className="relative w-full h-full flex items-center justify-center bg-black">
                                <video
                                    src={generatedVideoUrl}
                                    controls
                                    autoPlay
                                    loop
                                    className="max-w-full max-h-full"
                                />
                                <a
                                    href={generatedVideoUrl}
                                    download
                                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                                    title="Download Video"
                                >
                                    <Download size={20} />
                                </a>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-teal/20 border-t-teal rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-ink/60 font-medium animate-pulse">Generating magic...</p>
                            </div>
                        ) : (
                            <div className="text-center text-ink/20">
                                <Play size={48} className="mx-auto mb-2 opacity-50" />
                                <p className="font-medium">Video will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Controls */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-ink/5 shadow-sm">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Warning & Info */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                            <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
                                <AlertTriangle size={18} />
                                <span>Experimental</span>
                            </div>
                            <p className="text-sm text-amber-900/80 leading-relaxed">
                                Video generation is in beta. Please be precise in your prompt. Bad generations are not reimbursed.
                            </p>
                        </div>
                        {user && credits !== null && (
                            <div className="text-center p-4 bg-gray-50 rounded-2xl border border-ink/5">
                                <p className="text-sm text-ink/60 mb-1">Available Credits</p>
                                <p className="text-2xl font-bold text-teal">{credits}</p>
                            </div>
                        )}
                    </div>

                    {/* Prompt Input */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-ink mb-3 ml-1">Animation Prompt</label>
                            <div className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe how you want the image to move (e.g., 'Fabric ripples in the wind', 'Camera zoom in')..."
                                    className="w-full p-6 rounded-2xl bg-gray-50 border border-ink/5 focus:border-teal focus:ring-4 focus:ring-teal/10 outline-none transition-all resize-none h-32 text-base"
                                />
                                <div className="absolute bottom-4 right-4">
                                    <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-ink/40 border border-ink/5">
                                        Optional
                                    </div>
                                </div>
                            </div>

                            {/* Pro Tips */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-teal bg-teal/5 px-3 py-1.5 rounded-full">
                                    <Sparkles size={12} /> Pro Tips:
                                </div>
                                {["The camera slowly pushes in", "Visual slow product shot", "Fabric moving gently in the wind"].map((tip, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPrompt(tip)}
                                        className="text-xs text-ink/60 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors border border-ink/5"
                                    >
                                        "{tip}"
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleAnimate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 ${!uploadedImage || isGenerating
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-teal to-[#1F6666] text-white shadow-teal/20'
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    {generationStatus}
                                </>
                            ) : (
                                <>
                                    <Sparkles size={24} />
                                    Generate Video <span className="opacity-60 text-base font-normal">({VIDEO_COST} Credits)</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
