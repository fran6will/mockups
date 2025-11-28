'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, Loader2, Sparkles, Download, Image, Lock, ArrowRight, Coins, Mail, RotateCw, Maximize, Layers, Trash2, Plus, X, Info, Video, Play, Film, Share2 } from 'lucide-react';
import { compositeImages, Layer } from '@/lib/utils/image';
import { supabase } from '@/lib/supabase/client';
import FabricCanvas from './FabricCanvas';
import { useAccess } from '@/hooks/use-access';
import { useSearchParams } from 'next/navigation';
import ShareModal from '@/components/ui/ShareModal';
import WatermarkOverlay from '@/components/ui/WatermarkOverlay';

interface ImageCompositorProps {
    productId: string;
    productSlug: string;
    baseImageUrl: string;
    passwordHash: string;
    isFree?: boolean;
}

export default function ImageCompositor({ productId, productSlug, baseImageUrl, passwordHash, isFree = false }: ImageCompositorProps) {
    const searchParams = useSearchParams();
    const [showAccessCodeInput, setShowAccessCodeInput] = useState(searchParams.get('unlock') === 'true' || searchParams.get('code') !== null);

    // Variant State
    const [variants, setVariants] = useState<any[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [currentBaseImage, setCurrentBaseImage] = useState(baseImageUrl);

    useEffect(() => {
        const fetchVariants = async () => {
            const { data } = await supabase
                .from('product_variants')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: true });
            setVariants(data || []);
        };
        fetchVariants();
    }, [productId]);

    const handleVariantSelect = (variant: any | null) => {
        setSelectedVariant(variant);
        setCurrentBaseImage(variant ? variant.base_image_url : baseImageUrl);
    };

    // Layer State
    const [layers, setLayers] = useState<Layer[]>([]);
    const [activeLayerId, setActiveLayerId] = useState<string | null>(null);

    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16' | '16:9'>('1:1');
    const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
    const [error, setError] = useState<string | null>(null);

    // Credit System State
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [credits, setCredits] = useState<number | null>(null);
    const [unlockError, setUnlockError] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [showCreditPopup, setShowCreditPopup] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    const [showLimitPopup, setShowLimitPopup] = useState(false);

    // Video Generation State
    const [isAnimating, setIsAnimating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [showAnimateDialog, setShowAnimateDialog] = useState(false);
    const [videoPrompt, setVideoPrompt] = useState('');
    const [animationStatus, setAnimationStatus] = useState<string>('');

    const [showShareModal, setShowShareModal] = useState(false);

    const { accessLevel, isLoading: isAccessLoading } = useAccess(productSlug);


    // Determine cost based on resolution
    const getCost = (size: '1K' | '2K' | '4K') => {
        if (size === '2K') return 4;
        if (size === '4K') return 6;
        return 2;
    };
    const currentCost = getCost(imageSize);

    useEffect(() => {
        if (isFree) {
            // Only unlock if user is logged in (to capture email)
            if (user) {
                setIsUnlocked(true);
            } else {
                setIsUnlocked(false);
            }
        } else if (accessLevel === 'pro') {
            setIsUnlocked(true);
            setCredits(999); // Infinite credits for pro
        } else if (accessLevel === 'guest') {
            setIsUnlocked(true);
            // We don't set credits here because we don't know them yet.
            // They will be updated after the first generation or if we add a fetchCredits call.
        }
    }, [accessLevel, isFree, user]);

    // Load state from local storage on mount & Check Auth
    useEffect(() => {
        const fetchCredits = async (userId: string) => {
            console.log("DEBUG: Fetching credits for user:", userId);
            const { data, error } = await supabase
                .from('user_credits')
                .select('balance')
                .eq('user_id', userId)
                .single();

            console.log("DEBUG: Credits fetch result:", { data, error });

            if (data) {
                setCredits(data.balance);
                if (data.balance > 0) {
                    setIsUnlocked(true);
                }
            }
        };

        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    setEmailInput(session.user.email || '');
                    await fetchCredits(session.user.id);
                } else {
                    const storedEmail = localStorage.getItem(`user_email`);
                    if (storedEmail) {
                        setEmailInput(storedEmail);
                    }
                }
            } finally {
                setIsAuthChecking(false);
            }
        };
        checkAuth();

        // Listen for auth changes (e.g. sign in/out in another tab or same tab)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                setEmailInput(session.user.email || '');
                fetchCredits(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleUnlockAndClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsClaiming(true);
        setUnlockError('');

        try {
            const response = await fetch('/api/claim-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    password: passwordInput,
                    email: emailInput
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to unlock');
            }

            // Success
            setIsUnlocked(true);
            setCredits(data.balance);
            if (!user) {
                localStorage.setItem('user_email', emailInput);
            }

            // Persist unlocked state for this product
            const unlockedProducts = JSON.parse(localStorage.getItem('unlocked_products') || '[]');
            if (!unlockedProducts.includes(productSlug)) {
                unlockedProducts.push(productSlug);
                localStorage.setItem('unlocked_products', JSON.stringify(unlockedProducts));
            }

        } catch (err: any) {
            setUnlockError(err.message);
        } finally {
            setIsClaiming(false);
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (layers.length >= 3) {
            setError("Maximum 3 layers allowed");
            return;
        }

        const newLayers = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            previewUrl: URL.createObjectURL(file),
            rotation: 0,
            scale: 1,
            moveX: 0,
            moveY: 0,
            skewX: 0,
            skewY: 0
        }));

        setLayers(prev => [...prev, ...newLayers]);
        setActiveLayerId(newLayers[0].id); // Select the first new layer
        setGeneratedImage(null);
        setError(null);
    }, [layers]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        noClick: true,
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: 3 - layers.length,
        disabled: layers.length >= 3
    } as any);

    // Filter out refKey if it exists in inputProps to avoid React warning/error
    const { refKey, ...inputProps } = getInputProps() as any;

    // Helper to update active layer
    const updateActiveLayer = (updates: Partial<Layer>) => {
        if (!activeLayerId) return;
        setLayers(prev => prev.map(layer =>
            layer.id === activeLayerId ? { ...layer, ...updates } : layer
        ));
    };

    const deleteLayer = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setLayers(prev => prev.filter(l => l.id !== id));
        if (activeLayerId === id) {
            setActiveLayerId(null);
        }
    };

    const activeLayer = layers.find(l => l.id === activeLayerId);

    const handleGenerate = async () => {
        if (layers.length === 0) return;

        if (!emailInput) {
            setError("Please sign in to generate mockups.");
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            // 1. Composite Layers
            const compositedFile = await compositeImages(layers);

            // 2. Convert to Base64 and Call API
            const base64Image = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(compositedFile);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
            });

            // 3. Call API
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    logoUrl: base64Image,
                    aspectRatio,
                    email: emailInput,
                    imageSize,
                    variantImageUrl: currentBaseImage !== baseImageUrl ? currentBaseImage : undefined
                }),
            });

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                // Handle non-JSON responses (e.g., 413 Content Too Large from Vercel/Nginx)
                if (response.status === 413) {
                    throw new Error('Image too large. Please reduce layers or file size.');
                }
                throw new Error(`Server error (${response.status}). Please try again.`);
            }

            if (!response.ok) {
                if (data.code === 'FREE_LIMIT_REACHED') {
                    setShowLimitPopup(true);
                    return;
                }
                throw new Error(data.error || 'Failed to generate mockup');
            }

            setGeneratedImage(data.imageUrl);
            if (data.remainingCredits !== undefined) {
                setCredits(data.remainingCredits);
                if (data.remainingCredits <= 0) {
                    setShowCreditPopup(true);
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGoogleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search)}`
            }
        });
    };

    const handleAnimate = async () => {
        if (!generatedImage || !user) return;

        setIsAnimating(true);
        setShowAnimateDialog(false);
        setAnimationStatus('Initializing video engine...');
        setError(null);

        try {
            // 1. Start Generation
            const response = await fetch('/api/animate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: generatedImage,
                    prompt: videoPrompt,
                    aspectRatio,
                    userId: user.id,
                    email: user.email,
                    productId: productId // Pass productId for dashboard tracking
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start animation');
            }

            if (data.remainingCredits !== undefined) {
                setCredits(data.remainingCredits);
            }

            const operationName = data.operationName;
            setAnimationStatus('Generating video... (this usually takes 1-2 minutes)');

            // 2. Poll for Status
            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await fetch('/api/animate/status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ operationName })
                    });
                    const statusData = await statusRes.json();

                    if (statusData.status === 'done') {
                        clearInterval(pollInterval);
                        setVideoUrl(statusData.videoUri);
                        setIsAnimating(false);
                        setAnimationStatus('');
                    } else if (statusData.status === 'error') {
                        clearInterval(pollInterval);
                        throw new Error(statusData.error || 'Video generation failed');
                    }
                    // If processing, continue polling
                } catch (pollError: any) {
                    clearInterval(pollInterval);
                    setError(pollError.message);
                    setIsAnimating(false);
                }
            }, 5000); // Poll every 5 seconds

        } catch (err: any) {
            console.error(err);
            setError(err.message);
            setIsAnimating(false);
        }
    };

    if (isAuthChecking) {
        return (
            <div className="max-w-6xl mx-auto min-h-[400px] flex items-center justify-center">
                <div className="glass p-12 rounded-3xl border border-white/40 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-teal" size={32} />
                    <p className="text-ink/50 font-medium">Checking access...</p>
                </div>
            </div>
        );
    }

    if (!isUnlocked) {
        return (
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Locked Controls */}
                <div className="space-y-6">
                    <div className="glass p-6 rounded-3xl border border-white/40 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <div className="flex items-center gap-2 text-ink/80 font-bold mb-2">
                                <Lock size={20} className="text-teal" />
                                Unlock Template
                            </div>
                            <p className="text-sm text-ink/60">
                                {isFree
                                    ? "Create a free account to try this mockup."
                                    : user
                                        ? "Unlock this premium template to start creating."
                                        : "Join CopiéCollé to unlock this template."
                                }
                            </p>
                        </div>

                        {!user ? (
                            <div className="bg-teal/5 p-6 rounded-xl border border-teal/10 space-y-4">
                                <p className="text-sm text-ink/70 font-medium text-center">
                                    {isFree
                                        ? "Sign up to generate your mockup instantly."
                                        : "To ensure your designs and credits are saved, you need a free account."
                                    }
                                </p>
                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    className="w-full bg-white text-ink font-bold py-3 rounded-xl border border-ink/10 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Sign in with Google
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="p-3 bg-teal/5 rounded-xl flex items-center gap-3 border border-teal/10">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-teal font-bold text-xs border border-teal/10">
                                        <CheckCircle size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-ink/50 uppercase">Logged in as</p>
                                        <p className="text-sm font-bold text-ink truncate">{user.email}</p>
                                    </div>
                                </div>

                                {showAccessCodeInput ? (
                                    <form onSubmit={handleUnlockAndClaim} className="space-y-4">
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
                                            <input
                                                type="password"
                                                value={passwordInput}
                                                onChange={(e) => {
                                                    setPasswordInput(e.target.value);
                                                    setUnlockError('');
                                                }}
                                                className="w-full bg-white/50 border border-white/60 rounded-xl pl-10 pr-4 py-3 text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all font-mono placeholder:font-sans"
                                                placeholder="Enter Access Code"
                                                required
                                            />
                                        </div>

                                        {unlockError && (
                                            <p className="text-red-500 text-xs font-bold ml-1">{unlockError}</p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isClaiming}
                                            className="w-full bg-teal text-cream font-bold py-4 rounded-xl hover:bg-teal/90 hover:shadow-lg hover:shadow-teal/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isClaiming ? <Loader2 className="animate-spin" /> : <>Unlock Template <ArrowRight size={18} /></>}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm text-ink/70 text-center">
                                            This is a premium template.
                                        </p>
                                        <a
                                            href="/pricing"
                                            className="w-full bg-teal text-cream font-bold py-4 rounded-xl hover:bg-teal/90 hover:shadow-lg hover:shadow-teal/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Sparkles size={18} /> Get Unlimited Access
                                        </a>
                                        <p className="text-xs text-ink/40 text-center">
                                            Have an Etsy access code? Use your secret link to unlock.
                                        </p>
                                        <button
                                            onClick={() => setShowAccessCodeInput(true)}
                                            className="w-full text-teal font-bold text-sm hover:underline"
                                        >
                                            Enter Access Code
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Locked Preview */}
                <div className="glass p-4 rounded-[2rem] border border-white/40 shadow-2xl bg-white/30 min-h-[500px] flex items-center justify-center relative overflow-hidden">
                    <img src={currentBaseImage} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" />
                    <div className="relative z-10 bg-white/80 backdrop-blur px-6 py-3 rounded-full font-bold text-ink shadow-lg flex items-center gap-2">
                        <Lock size={18} /> Preview Locked
                    </div>
                </div>
            </div>
        );
    }

    // UNLOCKED STATE
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Top Section: Canvas / Preview */}
            <div className="max-w-2xl mx-auto w-full">
                <WatermarkOverlay
                    {...getRootProps()}
                    className="glass p-4 rounded-[2.5rem] border border-white/40 shadow-2xl bg-white/30 aspect-square flex items-center justify-center relative overflow-hidden group"
                    showWatermark={!isUnlocked}
                    allowInteraction={true}
                >
                    <input {...inputProps} />
                    {!generatedImage && layers.length === 0 && (
                        <div className="text-center text-ink/30 pointer-events-none">
                            <div className="w-24 h-24 bg-ink/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Image size={40} />
                            </div>
                            <p className="font-medium">Drag & Drop your logo here</p>
                            <p className="text-sm opacity-60 mt-2">or use the controls below</p>
                        </div>
                    )}

                    {/* Base Image */}
                    <img
                        src={currentBaseImage}
                        alt="Base"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none select-none ${generatedImage ? 'opacity-0' : 'opacity-100'}`}
                    />

                    {/* Layers / Dropzone Area */}
                    {layers.length > 0 && !generatedImage && (
                        <div className="absolute inset-0 z-10">
                            <FabricCanvas
                                layers={layers}
                                activeLayerId={activeLayerId}
                                onSelectLayer={setActiveLayerId}
                                onUpdateLayer={(id: string, updates: Partial<Layer>) => {
                                    setLayers(prev => prev.map(layer =>
                                        layer.id === id ? { ...layer, ...updates } : layer
                                    ));
                                }}
                                aspectRatio={aspectRatio}
                            />
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-ink/60 shadow-sm pointer-events-none border border-white/20">
                                Interactive Canvas • Drag to Move • Pinch to Scale
                            </div>
                        </div>
                    )}

                    {/* Dropzone Overlay (when dragging) */}
                    {/* Dropzone Overlay (when dragging) */}
                    {isDragActive && (
                        <div className="absolute inset-0 z-20 outline-none bg-teal/20 backdrop-blur-sm flex items-center justify-center border-4 border-teal border-dashed rounded-[2rem] m-4 pointer-events-none">
                            <div className="bg-white text-teal font-bold px-8 py-4 rounded-2xl shadow-xl transform scale-110 transition-transform">
                                Drop to Add Layer
                            </div>
                        </div>
                    )}

                    {/* Generated Result */}
                    {generatedImage && !videoUrl && (
                        <div className="relative w-full h-full z-30">
                            <img
                                src={generatedImage}
                                alt="Generated Mockup"
                                className="w-full h-full object-contain rounded-2xl"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 rounded-2xl backdrop-blur-sm">
                                <a
                                    href={generatedImage}
                                    download="mockup.png"
                                    className="bg-white text-ink font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-xl"
                                >
                                    <Download size={18} />
                                    Download 4K
                                </a>
                                <button
                                    onClick={() => setShowAnimateDialog(true)}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-xl border border-white/20"
                                >
                                    <Video size={18} />
                                    Animate (10 Credits)
                                </button>
                                <button
                                    onClick={() => setShowShareModal(true)}
                                    className="bg-white text-ink font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-xl"
                                >
                                    <Share2 size={18} />
                                    Share
                                </button>
                            </div>
                        </div>
                    )}

                    <ShareModal
                        isOpen={showShareModal}
                        onClose={() => setShowShareModal(false)}
                        imageUrl={generatedImage || ''}
                        productTitle={productSlug}
                    />

                    {/* Video Player */}
                    {videoUrl && (
                        <div className="relative w-full h-full z-30 bg-black">
                            <video
                                src={videoUrl}
                                controls
                                autoPlay
                                loop
                                className="w-full h-full object-contain"
                            />
                            <button
                                onClick={() => setVideoUrl(null)}
                                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-md"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {/* Loading States */}
                    {(isGenerating || isAnimating) && (
                        <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
                            <div className="w-20 h-20 border-4 border-teal/20 border-t-teal rounded-full animate-spin mb-4"></div>
                            <p className="font-bold text-teal animate-pulse text-lg">
                                {isAnimating ? animationStatus : 'Designing your product...'}
                            </p>
                        </div>
                    )}
                </WatermarkOverlay>

                {/* Variant Carousel */}
                {variants.length > 0 && (
                    <div className="mt-8">
                        <p className="text-center text-xs font-bold text-ink/40 uppercase tracking-wider mb-4">Select Style</p>
                        <div className="flex justify-center gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                            {/* Default Variant */}
                            <button
                                onClick={() => handleVariantSelect(null)}
                                className={`snap-center shrink-0 relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 group ${!selectedVariant
                                    ? 'border-teal ring-4 ring-teal/10 scale-110 shadow-lg'
                                    : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                            >
                                <img src={baseImageUrl} className="w-full h-full object-cover" />
                                <div className={`absolute inset-0 bg-black/20 transition-opacity ${!selectedVariant ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'}`}></div>
                                {!selectedVariant && (
                                    <div className="absolute bottom-0 inset-x-0 bg-teal/90 text-white text-[8px] font-bold py-0.5 text-center uppercase tracking-wider">
                                        Default
                                    </div>
                                )}
                            </button>

                            {/* Other Variants */}
                            {variants.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => handleVariantSelect(v)}
                                    className={`snap-center shrink-0 relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 group ${selectedVariant?.id === v.id
                                        ? 'border-teal ring-4 ring-teal/10 scale-110 shadow-lg'
                                        : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                                >
                                    <img src={v.base_image_url} className="w-full h-full object-cover" />
                                    <div className={`absolute inset-0 bg-black/20 transition-opacity ${selectedVariant?.id === v.id ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'}`}></div>
                                    {selectedVariant?.id === v.id && (
                                        <div className="absolute bottom-0 inset-x-0 bg-teal/90 text-white text-[8px] font-bold py-0.5 text-center uppercase tracking-wider truncate px-1">
                                            {v.name}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Section: Controls */}
            <div className="grid md:grid-cols-3 gap-8 items-start">
                {/* Col 1: Layers & Upload */}
                <div className="space-y-6 bg-white rounded-[2rem] p-6 border border-ink/5 shadow-sm h-full">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-ink flex items-center gap-2">
                            <Layers size={18} className="text-teal" /> Layers
                        </h3>
                        <span className="text-xs text-ink/40">{layers.length}/3</span>
                    </div>

                    {/* Upload Button */}
                    <div {...getRootProps()} onClick={open} className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${isDragActive ? 'border-teal bg-teal/5' : 'border-ink/10 hover:border-teal/50 hover:bg-teal/5'}`}>
                        <input {...inputProps} />
                        <div className="w-10 h-10 bg-teal/10 text-teal rounded-full flex items-center justify-center mx-auto mb-2">
                            <Plus size={20} />
                        </div>
                        <p className="text-sm font-bold text-ink">Add Design</p>
                        <p className="text-xs text-ink/40">Drop or click to upload</p>
                    </div>

                    {/* Layer List */}
                    <div className="space-y-2">
                        {layers.map((layer, index) => (
                            <div
                                key={layer.id}
                                onClick={() => setActiveLayerId(layer.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${activeLayerId === layer.id ? 'bg-teal/5 border-teal/30 shadow-sm' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                            >
                                <img src={layer.previewUrl} className="w-10 h-10 rounded-lg object-cover bg-white border border-ink/5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-ink truncate">{layer.file.name}</p>
                                    <p className="text-xs text-ink/40">Layer {index + 1}</p>
                                </div>
                                <button
                                    onClick={(e) => deleteLayer(layer.id, e)}
                                    className="text-ink/20 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Active Layer Controls (Compact) */}
                    {activeLayer && (
                        <div className="pt-4 border-t border-ink/5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-ink/40 uppercase mb-1 block">Scale</label>
                                    <input
                                        type="range"
                                        min="0.1" max="3" step="0.1"
                                        value={activeLayer.scale}
                                        onChange={(e) => updateActiveLayer({ scale: Number(e.target.value) })}
                                        className="w-full accent-teal h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-ink/40 uppercase mb-1 block">Rotate</label>
                                    <input
                                        type="range"
                                        min="-180" max="180"
                                        value={activeLayer.rotation}
                                        onChange={(e) => updateActiveLayer({ rotation: Number(e.target.value) })}
                                        className="w-full accent-teal h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Col 2: Settings */}
                <div className="space-y-6 bg-white rounded-[2rem] p-6 border border-ink/5 shadow-sm h-full">
                    <h3 className="font-bold text-ink flex items-center gap-2 mb-2">
                        <Sparkles size={18} className="text-teal" /> Settings
                    </h3>

                    {/* Resolution */}
                    <div>
                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider mb-3 block">Resolution</label>
                        <div className="grid grid-cols-1 gap-2">
                            {(['1K', '2K', '4K'] as const).map((size) => {
                                let cost = 2;
                                if (size === '2K') cost = 4;
                                if (size === '4K') cost = 6;

                                const isDisabled = isFree && size !== '1K';
                                return (
                                    <button
                                        key={size}
                                        onClick={() => !isDisabled && setImageSize(size)}
                                        disabled={isDisabled}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${imageSize === size
                                            ? 'bg-teal/5 border-teal text-teal font-bold'
                                            : isDisabled
                                                ? 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed'
                                                : 'bg-white border-ink/10 text-ink/60 hover:border-teal/30'
                                            }`}
                                    >
                                        <span>{size}</span>
                                        {isDisabled ? <span className="text-[10px] font-bold bg-gray-200 px-2 py-0.5 rounded text-gray-400">PRO</span> : null}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider mb-3 block">Aspect Ratio</label>
                        <div className="flex gap-2">
                            {(['1:1', '9:16', '16:9'] as const).map((ratio) => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${aspectRatio === ratio
                                        ? 'bg-teal/5 border-teal text-teal'
                                        : 'bg-white border-ink/10 text-ink/60 hover:border-teal/30'
                                        }`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Col 3: Action */}
                <div className="space-y-6">
                    {/* Pro Tip Box */}
                    <div className="bg-gradient-to-br from-teal/10 to-teal/5 border border-teal/10 rounded-[2rem] p-6">
                        <div className="flex items-start gap-3">
                            <div className="bg-white p-2 rounded-full shadow-sm text-teal">
                                <Info size={16} />
                            </div>
                            <div>
                                <p className="font-bold text-teal text-sm mb-1">Pro Tip</p>
                                <p className="text-xs text-ink/60 leading-relaxed">
                                    Roughly place your design. The AI will automatically perfect the lighting, shadows, and texture wrapping.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Generate Action */}
                    <div className="bg-white rounded-[2rem] p-6 border border-ink/5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-ink/40">Account</span>
                            <span className="font-bold text-ink truncate max-w-[120px]">{emailInput || 'Guest'}</span>
                        </div>

                        <div className="h-px bg-ink/5"></div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-ink/40">Cost</span>
                            <span className="font-bold text-teal">{isFree ? 'Free' : `${currentCost} Credits`}</span>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={layers.length === 0 || isGenerating || (!isFree && credits !== null && credits < currentCost)}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${layers.length === 0 || isGenerating
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-teal text-white hover:bg-teal/90 shadow-teal/20 hover:-translate-y-0.5'
                                }`}
                        >
                            {isGenerating ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <Sparkles className="fill-current" />
                            )}
                            {isGenerating ? 'Generating...' : 'Generate'}
                        </button>

                        <p className="text-[10px] text-ink/40 text-center leading-tight">
                            AI generation is experimental. Results may vary. <br />
                            Credits are consumed per generation.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {
                showCreditPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl border border-teal/20 relative">
                            <button
                                onClick={() => setShowCreditPopup(false)}
                                className="absolute top-4 right-4 text-ink/30 hover:text-ink transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                                <Coins size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-ink mb-2">Running low on credits!</h3>
                                <p className="text-ink/60">
                                    You've used your 5 free generations. Upgrade to Pro for unlimited mockups or purchase a credit pack.
                                </p>
                            </div>
                            <div className="grid gap-3">
                                <a href="/pricing" className="w-full bg-teal text-cream font-bold py-4 rounded-xl hover:bg-teal/90 transition-all flex items-center justify-center gap-2">
                                    <Sparkles size={18} /> Get Unlimited Access
                                </a>
                                <button
                                    onClick={() => setShowCreditPopup(false)}
                                    className="w-full bg-transparent text-ink/50 font-bold py-3 hover:text-ink transition-colors"
                                >
                                    Maybe later
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showAnimateDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                        <div className="bg-white rounded-[2rem] p-8 max-w-md w-full space-y-6 shadow-2xl border border-purple-500/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500"></div>

                            <button
                                onClick={() => setShowAnimateDialog(false)}
                                className="absolute top-4 right-4 text-ink/30 hover:text-ink transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                                    <Film size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-ink">Animate Mockup</h3>
                                <p className="text-ink/60 mt-2">
                                    Turn your static design into a cinematic video using Google Veo.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-ink/50 uppercase tracking-wider mb-2">
                                        Camera Movement Prompt
                                    </label>
                                    <textarea
                                        value={videoPrompt}
                                        onChange={(e) => setVideoPrompt(e.target.value)}
                                        placeholder="e.g. Slow camera dolly in, cinematic lighting, 4k..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-ink focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all h-32 resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-between text-sm bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-100">
                                    <span className="font-bold flex items-center gap-2"><Coins size={14} /> Cost</span>
                                    <span className="font-bold">10 Credits</span>
                                </div>

                                <button
                                    onClick={handleAnimate}
                                    disabled={!videoPrompt.trim() || (credits !== null && credits < 10)}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    <Play size={18} className="fill-current" /> Generate Video
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showLimitPopup && (
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
                )
            }
        </div >
    );
}