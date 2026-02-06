'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, Loader2, Sparkles, Download, Image as ImageIcon, Lock, ArrowRight, Coins, Mail, Layers, Trash2, Plus, X, Info, Video, Play, Film, Share2 } from 'lucide-react';
import Image from 'next/image';
import { Layer } from '@/lib/utils/image';
import { getOptimizedSupabaseUrl } from '@/lib/utils/supabase-image';
import { supabase } from '@/lib/supabase/client';
// FabricCanvas import removed
import { useAccess } from '@/hooks/use-access';
import { useSearchParams } from 'next/navigation';
import ShareModal from '@/components/ui/ShareModal';
import WatermarkOverlay from '@/components/ui/WatermarkOverlay';
import UnlockModal from './UnlockModal';
import { Analytics } from '@/lib/analytics';

// Witty loading messages to entertain users during generation
const wittyMessages = [
    "Brewing some AI magic... ✨",
    "Teaching robots to appreciate art...",
    "Convincing pixels to behave...",
    "Making your design look fabulous...",
    "Sprinkling creative dust... 🎨",
    "Wrapping your logo in style...",
    "Almost there, perfecting the shadows...",
    "AI is having a 'eureka!' moment...",
    "Photoshop? Never heard of her. 💅",
    "Generating pure awesomeness...",
    "Your mockup is on its way... 📦",
    "Training tiny digital artists...",
];

function WittyLoadingMessage() {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % wittyMessages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className="animate-pulse transition-all duration-500">
            {wittyMessages[messageIndex]}
        </span>
    );
}


interface ImageCompositorProps {
    productId: string;
    productSlug: string;
    baseImageUrl: string;
    passwordHash: string;
    isFree?: boolean;
    category?: string;
    galleryImageUrl?: string;
}

export default function ImageCompositor({ productId, productSlug, baseImageUrl, passwordHash, isFree = false, category, galleryImageUrl }: ImageCompositorProps) {
    const searchParams = useSearchParams();
    const [showAccessCodeInput, setShowAccessCodeInput] = useState(searchParams.get('unlock') === 'true' || searchParams.get('code') !== null);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

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

    // Reference Images State (for Scenes)
    const [referenceImages, setReferenceImages] = useState<{ id: string, file: File, previewUrl: string }[]>([]);

    const onDropReferences = useCallback((acceptedFiles: File[]) => {
        if (referenceImages.length + acceptedFiles.length > 3) {
            setError("Maximum 3 reference images allowed");
            return;
        }

        const newRefs = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            previewUrl: URL.createObjectURL(file)
        }));

        setReferenceImages(prev => [...prev, ...newRefs]);
        setError(null);
    }, [referenceImages]);

    const { getRootProps: getRefRootProps, getInputProps: getRefInputProps, isDragActive: isRefDragActive } = useDropzone({
        onDrop: onDropReferences,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'] },
        maxFiles: 3 - referenceImages.length,
        disabled: referenceImages.length >= 3
    });

    const removeReference = (id: string) => {
        setReferenceImages(prev => prev.filter(ref => ref.id !== id));
    };

    // Credit System State
    // Initialize unlocked to true for free products to prevent race condition
    const [isUnlocked, setIsUnlocked] = useState(isFree);
    const [passwordInput, setPasswordInput] = useState(searchParams.get('code') || '');
    const [emailInput, setEmailInput] = useState('');
    const [credits, setCredits] = useState<number | null>(null);


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

    // Pure AI Mode (Standard)
    const [customInstruction, setCustomInstruction] = useState('');

    const { accessLevel, isLoading: isAccessLoading } = useAccess(productSlug);


    // Determine cost based on resolution
    const getCost = (size: '1K' | '2K' | '4K') => {
        if (size === '2K') return 10;
        if (size === '4K') return 15;
        return 5;
    };
    const currentCost = getCost(imageSize);

    // Sample designs for users who don't have their own design ready
    const SAMPLE_DESIGNS = [
        { url: '/samples/sample-logo.svg', name: 'sample-logo.svg', label: 'Logo', description: 'Star + text logo' },
        { url: '/samples/sample-text.svg', name: 'sample-text.svg', label: 'Quote', description: 'Motivational text' },
        { url: '/samples/sample-graphic.svg', name: 'sample-graphic.svg', label: 'Graphic', description: 'Abstract pattern' },
    ];

    const loadSampleImage = async (sampleUrl: string, sampleName: string) => {
        try {
            const response = await fetch(sampleUrl);
            const blob = await response.blob();
            const file = new File([blob], sampleName, { type: blob.type || "image/svg+xml" });

            const previewUrl = URL.createObjectURL(file);
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new window.Image();
                image.src = previewUrl;
                image.onload = () => resolve(image);
                image.onerror = reject;
            });

            const TARGET_SIZE = 1600;
            let scale = 1;
            if (img.width > TARGET_SIZE || img.height > TARGET_SIZE) {
                const scaleX = TARGET_SIZE / img.width;
                const scaleY = TARGET_SIZE / img.height;
                scale = Math.min(scaleX, scaleY);
            }
            scale = Number(scale.toFixed(2));

            const layerId = 'sample-' + Math.random().toString(36).substr(2, 6);
            const newLayer = {
                id: layerId,
                file,
                previewUrl,
                rotation: 0,
                scale,
                moveX: 0,
                moveY: 0,
                skewX: 0,
                skewY: 0,
                opacity: 1
            };

            setLayers([newLayer]);
            setActiveLayerId(layerId);
            setGeneratedImage(null);
            setError(null);
        } catch (e) {
            console.error("Failed to load sample image", e);
        }
    };

    // Backward-compatible demo loader for ?demo=true URL param
    const loadDemoImage = () => loadSampleImage('/logo-v2.png', 'sample-pattern.png');

    useEffect(() => {
        // Check if there's an access code in URL - this takes priority
        const hasAccessCode = searchParams.get('code');

        if (isFree && !hasAccessCode) {
            // Allow guests to see the UI, but prompt on generate
            // Only auto-unlock if there's NO access code (Etsy buyers need to claim credits)
            setIsUnlocked(true);
        } else if (accessLevel === 'pro') {
            setIsUnlocked(true);
            setCredits(999); // Infinite credits for pro
        } else if (accessLevel === 'guest') {
            setIsUnlocked(true);
            // We don't set credits here because we don't know them yet.
            // They will be updated after the first generation or if we add a fetchCredits call.
        } else if (user && !hasAccessCode) {
            // Only auto-unlock for logged-in users if they don't have an access code
            // If they have a code, they might want to claim video credits
            setIsUnlocked(true);
        }

        // Demo Mode: Auto-load sample image
        if (searchParams.get('demo') === 'true' && layers.length === 0) {
            loadDemoImage();
        }

        // Auto-open unlock modal if code or unlock param is present and not yet unlocked
        if ((hasAccessCode || searchParams.get('unlock') === 'true') && !isUnlocked && !showUnlockModal) {
            setShowUnlockModal(true);
        }
    }, [accessLevel, isFree, user, searchParams, layers.length, isUnlocked]);

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

                // Restore saved layers after sign-in
                const savedLayersKey = `pending_layers_${productSlug}`;
                const savedLayers = localStorage.getItem(savedLayersKey);
                if (savedLayers) {
                    try {
                        const parsed = JSON.parse(savedLayers);
                        // Only restore if we don't already have layers
                        if (layers.length === 0 && parsed.length > 0) {
                            setLayers(parsed);
                            setActiveLayerId(parsed[0].id);

                            // Scroll to the tryout section after a short delay
                            setTimeout(() => {
                                const tryoutElement = document.getElementById('tryout');
                                if (tryoutElement) {
                                    tryoutElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }, 100);
                        }
                        localStorage.removeItem(savedLayersKey);
                    } catch (e) {
                        console.error('Failed to restore layers:', e);
                        localStorage.removeItem(savedLayersKey);
                    }
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [productSlug]);



    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (layers.length >= 3) {
            setError("Maximum 3 layers allowed");
            return;
        }

        try {
            const newLayers = await Promise.all(acceptedFiles.map(async file => {
                const previewUrl = URL.createObjectURL(file);

                // Load image to get dimensions for auto-scaling
                const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                    const image = new window.Image();
                    image.src = previewUrl;
                    image.onload = () => resolve(image);
                    image.onerror = reject;
                });

                // Auto-scale to fit within 1600x1600 (leaving room in 2000x2000 canvas)
                const TARGET_SIZE = 1600;
                let scale = 1;
                if (img.width > TARGET_SIZE || img.height > TARGET_SIZE) {
                    const scaleX = TARGET_SIZE / img.width;
                    const scaleY = TARGET_SIZE / img.height;
                    scale = Math.min(scaleX, scaleY);
                }

                // Round to 2 decimals
                scale = Number(scale.toFixed(2));

                return {
                    id: Math.random().toString(36).substr(2, 9),
                    file,
                    previewUrl,
                    rotation: 0,
                    scale,
                    moveX: 0,
                    moveY: 0,
                    skewX: 0,
                    skewY: 0,
                    opacity: 1
                };
            }));

            setLayers(prev => [...prev, ...newLayers]);
            if (newLayers.length > 0) {
                setActiveLayerId(newLayers[0].id);
            }
            setGeneratedImage(null);
            setError(null);
        } catch (err) {
            console.error("Error loading image:", err);
            setError("Failed to load image dimensions");
        }
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

        // Check unlock via modal
        if (!isUnlocked) {
            setShowUnlockModal(true);
            return;
        }

        setIsGenerating(true);
        setError(null);

        // Auto-scroll to preview on mobile
        if (previewRef.current) {
            previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Track generate event
        Analytics.generateMockup(productSlug, imageSize);

        try {
            // 1. Get raw design image from first layer (bypass canvas composition)
            const designLayer = layers[0];
            let designImageUrl = designLayer.previewUrl;

            // Convert blob URL to base64 if needed
            if (designImageUrl.startsWith('blob:')) {
                const response = await fetch(designImageUrl);
                const blob = await response.blob();
                designImageUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
            }

            // 2. Call AI API (Standard Mode)
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    logoUrl: designImageUrl, // Standard API expects 'logoUrl'
                    aspectRatio,
                    imageSize,
                    email: user?.email,
                    // If we have custom instructions, we can append them to the prompt or handle differently
                    // The standard API expects 'customPrompt' in product config, or we pass it?
                    // Let's check prompt logic in route. Currently route uses product.custom_prompt or default.
                    // If we want to support the custom instruction input from UI, we might need to update the route or pass it in a way the route ignores or uses.
                    // For now, let's stick to the core requirement: make it work like before.
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.code === 'FREE_LIMIT_REACHED' || response.status === 402) {
                    setShowLimitPopup(true);
                    return;
                }
                throw new Error(data.error || 'Generation failed');
            }

            setGeneratedImage(data.imageUrl);

            // Update credits from response
            if (data.remainingCredits !== undefined) {
                setCredits(data.remainingCredits);
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGoogleSignIn = async () => {
        Analytics.clickSignUp('product_page');

        // Save current layers to localStorage before redirect so they persist
        // Convert blob URLs to base64 data URLs since blob URLs are session-only
        if (layers.length > 0) {
            try {
                const layersToSave = await Promise.all(layers.map(async (layer) => {
                    let base64Url = layer.previewUrl;

                    // If it's a blob URL, convert to data URL
                    if (layer.previewUrl.startsWith('blob:')) {
                        const response = await fetch(layer.previewUrl);
                        const blob = await response.blob();
                        base64Url = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(blob);
                        });
                    }

                    return {
                        id: layer.id,
                        name: layer.file?.name || layer.name || 'Restored Layer',
                        previewUrl: base64Url,
                        rotation: layer.rotation,
                        scale: layer.scale,
                        moveX: layer.moveX,
                        moveY: layer.moveY,
                        skewX: layer.skewX,
                        skewY: layer.skewY,
                        opacity: layer.opacity
                    };
                }));
                localStorage.setItem(`pending_layers_${productSlug}`, JSON.stringify(layersToSave));
            } catch (e) {
                console.error('Failed to save layers:', e);
            }
        }

        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search + window.location.hash)}`
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

    // UNLOCKED STATE (Now Default)
    // We render the canvas for everyone. The 'Unlock' happens on Generate.

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <UnlockModal
                isOpen={showUnlockModal}
                onClose={() => setShowUnlockModal(false)}
                onUnlock={(balance) => {
                    setIsUnlocked(true);
                    setCredits(balance);
                    window.location.href = window.location.pathname;
                }}
                productId={productId}
                productSlug={productSlug}
                isFree={isFree}
                user={user}
                passwordInput={passwordInput}
                setPasswordInput={setPasswordInput}
                emailInput={emailInput}
                setEmailInput={setEmailInput}
                initialShowAccessCodeInput={showAccessCodeInput}
                onSignIn={handleGoogleSignIn}
            />

            {/* Top Section: Canvas / Preview */}
            <div className="max-w-2xl mx-auto w-full" ref={previewRef}>
                <WatermarkOverlay
                    {...getRootProps()}
                    className="glass p-4 rounded-[2.5rem] border border-white/40 shadow-2xl bg-white/30 aspect-square flex items-center justify-center relative overflow-hidden group"
                    showWatermark={!isUnlocked}
                    allowInteraction={true}
                >
                    <input {...inputProps} aria-label="Upload image" />
                    {!generatedImage && layers.length === 0 && (
                        <div className="text-center text-ink/30 relative z-10">
                            <div className="w-24 h-24 bg-ink/5 rounded-full flex items-center justify-center mx-auto mb-4 pointer-events-none">
                                <ImageIcon size={40} />
                            </div>
                            <p className="font-medium pointer-events-none">
                                {category === 'Scenes' ? "Drag & Drop your product photo" : "Drag & Drop your logo here"}
                            </p>
                            <p className="text-sm opacity-60 mt-2 pointer-events-none">or try a sample design</p>

                            {/* Sample Design Cards */}
                            <div className="mt-6 relative z-50 flex justify-center gap-3 flex-wrap">
                                {SAMPLE_DESIGNS.map((sample) => (
                                    <button
                                        key={sample.url}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            loadSampleImage(sample.url, sample.name);
                                        }}
                                        className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-white/50 shadow-lg shadow-teal/5 hover:bg-white hover:scale-105 hover:shadow-xl hover:shadow-teal/10 transition-all cursor-pointer w-28"
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-ink/80 flex items-center justify-center overflow-hidden border border-ink/10">
                                            <img
                                                src={sample.url}
                                                alt={sample.label}
                                                className="w-12 h-12 object-contain"
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-ink/70 group-hover:text-teal transition-colors">
                                            {sample.label}
                                        </span>
                                        <span className="text-[10px] text-ink/40 leading-tight">
                                            {sample.description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Base Image (Show Gallery Image if available, otherwise Base Image) */}
                    <Image
                        src={getOptimizedSupabaseUrl(galleryImageUrl || currentBaseImage, 1200)}
                        alt="Base"
                        fill
                        draggable={false}
                        unoptimized
                        onContextMenu={(e) => e.preventDefault()}
                        className={`object-cover transition-opacity duration-700 pointer-events-none select-none ${generatedImage ? 'opacity-0' : 'opacity-100'}`}
                    />

                    {/* Layers / Dropzone Area - Canvas Removed for Pure AI Mode */}
                    {layers.length > 0 && !generatedImage && (
                        <div className="absolute inset-0 z-10 pointer-events-none">
                            {/* Canvas is hidden. Design is just in layer list. */}
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
                        <div className="relative w-full h-full z-30 group">
                            <img
                                src={generatedImage}
                                alt="Generated Mockup"
                                className="w-full h-full object-contain rounded-2xl"
                            />
                            {/* Action buttons - Bottom bar on mobile, hover overlay on desktop */}
                            <div className="absolute inset-x-0 bottom-0 md:inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent md:bg-black/40 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end md:justify-center gap-3 p-4 md:p-6 rounded-b-2xl md:rounded-2xl md:backdrop-blur-sm">
                                <a
                                    href={generatedImage}
                                    download={`mockup-${imageSize}.png`}
                                    className="bg-white text-ink font-bold px-5 py-2.5 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-xl text-sm md:text-base"
                                >
                                    <Download size={16} />
                                    Download {imageSize}
                                </a>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowAnimateDialog(true)}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-xl border border-white/20 text-sm"
                                    >
                                        <Video size={14} />
                                        <span className="hidden md:inline">Animate</span>
                                    </button>
                                    <button
                                        onClick={() => setShowShareModal(true)}
                                        className="bg-white/90 text-ink font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-xl text-sm"
                                    >
                                        <Share2 size={14} />
                                        <span className="hidden md:inline">Share</span>
                                    </button>
                                </div>
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
                        <div className="absolute inset-0 z-40 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
                            <div className="relative">
                                {/* Animated rings */}
                                <div className="w-24 h-24 border-4 border-teal/10 rounded-full absolute animate-ping"></div>
                                <div className="w-24 h-24 border-4 border-teal/20 border-t-teal rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="text-teal animate-pulse" size={28} />
                                </div>
                            </div>
                            <p className="font-bold text-teal text-lg mt-6 text-center px-8">
                                {isAnimating ? animationStatus : <WittyLoadingMessage />}
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
                                <Image
                                    src={getOptimizedSupabaseUrl(baseImageUrl, 200)}
                                    alt="Default Variant"
                                    fill
                                    sizes="80px"
                                    unoptimized
                                    className="object-cover"
                                />
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
                                    <Image
                                        src={getOptimizedSupabaseUrl(v.base_image_url, 200)}
                                        alt={v.name}
                                        fill
                                        sizes="80px"
                                        unoptimized
                                        className="object-cover"
                                    />
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

            {/* Mobile Controls (Visible only on mobile) */}
            {activeLayer && (
                <div className="block md:hidden bg-white rounded-2xl p-4 border border-ink/5 shadow-sm mb-6">
                    <div className="grid grid-cols-2 gap-4">
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
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold text-ink/40 uppercase mb-1 block">Opacity</label>
                            <input
                                type="range"
                                min="0" max="1" step="0.01"
                                value={activeLayer.opacity ?? 1}
                                onChange={(e) => updateActiveLayer({ opacity: Number(e.target.value) })}
                                className="w-full accent-teal h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Section: Controls */}
            <div className="grid md:grid-cols-3 gap-8 items-start">
                {/* Col 1: Layers & Upload */}
                <div className="space-y-6 bg-white rounded-[2rem] p-6 border border-ink/5 shadow-sm h-full">
                    {/* Reference Images Section (Scenes Only) */}
                    {category === 'Scenes' && (
                        <div className="mb-6 pb-6 border-b border-ink/5">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-ink/40 uppercase tracking-wider flex items-center gap-2">
                                    Product References <span className="bg-teal/10 text-teal px-1.5 py-0.5 rounded text-[10px]">AI Helper</span>
                                </label>
                                <span className="text-[10px] text-ink/40">{referenceImages.length}/3</span>
                            </div>
                            <p className="text-[10px] text-ink/50 mb-3 leading-relaxed">
                                Upload extra photos of your product (different angles, close-ups) to help the AI understand its shape and details.
                            </p>

                            <div className="grid grid-cols-4 gap-2">
                                {referenceImages.map(ref => (
                                    <div key={ref.id} className="relative aspect-square rounded-lg overflow-hidden group border border-ink/10">
                                        <Image src={ref.previewUrl} alt="Ref" fill className="object-cover" />
                                        <button
                                            onClick={() => removeReference(ref.id)}
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {referenceImages.length < 3 && (
                                    <div {...getRefRootProps()} className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${isRefDragActive ? 'border-teal bg-teal/5' : 'border-ink/10 hover:border-teal/50 hover:bg-teal/5'}`}>
                                        <input {...getRefInputProps()} />
                                        <Plus size={16} className="text-ink/40" />
                                        <span className="text-[8px] text-ink/40 font-bold mt-1">ADD</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
                        <p className="text-sm font-bold text-ink">
                            UPLOAD YOUR DESIGN
                        </p>
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
                                    <p className="text-sm font-bold text-ink truncate">{layer.file?.name || layer.name || 'Design'}</p>
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

                    {/* Active Layer Controls Removed */}
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
                                let cost = 5;
                                if (size === '2K') cost = 10;
                                if (size === '4K') cost = 15;

                                const isDisabled = (isFree && accessLevel !== 'pro') && size !== '1K';
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
                        <p className="text-[10px] text-ink/40 mt-2">
                            Preview shows full image. Output will be cropped to {aspectRatio}.
                        </p>
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
                            <span className="font-bold text-teal">{currentCost} Credits</span>
                        </div>

                        {/* Custom Instructions */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-ink/50 uppercase tracking-wider">
                                <Sparkles size={12} className="text-teal" />
                                Custom Instructions (Optional)
                            </div>
                            <textarea
                                value={customInstruction}
                                onChange={(e) => setCustomInstruction(e.target.value)}
                                placeholder="E.g., 'Place logo on the pocket', 'Make it look embroidered', 'Add shadow'..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-ink/80 placeholder:text-ink/30 focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none resize-none h-24"
                            />
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={!user ? handleGoogleSignIn : handleGenerate}
                            disabled={isGenerating || layers.length === 0}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${isGenerating || layers.length === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-teal text-white hover:bg-teal/90 hover:shadow-teal/20 hover:-translate-y-0.5'
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="animate-spin" /> Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    {!user
                                        ? `Sign in to Generate (${currentCost} Credits)`
                                        : `Generate (${currentCost} Credits)`
                                    }
                                </>
                            )}
                        </button>

                        <p className="text-[10px] text-ink/40 text-center leading-tight">
                            AI placement is experimental. Results may vary. <br />
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
                                    <span className="font-bold">25 Credits</span>
                                </div>

                                <button
                                    onClick={handleAnimate}
                                    disabled={!videoPrompt.trim() || (credits !== null && credits < 25)}
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
                            <div className="w-24 h-24 bg-teal/10 text-teal rounded-full flex items-center justify-center mx-auto">
                                <Sparkles size={48} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-ink mb-3 tracking-tight">You're on a roll! 🚀</h3>
                                <p className="text-lg text-ink/60 leading-relaxed">
                                    You've used your free credits. Start a <strong>7-day free trial</strong> to keep creating unlimited mockups.
                                </p>
                            </div>
                            <div className="grid gap-3 pt-2">
                                <a href="/pricing" className="w-full bg-gradient-to-r from-teal to-teal/80 text-cream font-bold py-4 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal/20">
                                    <Sparkles size={18} /> Start 7-Day Free Trial
                                </a>
                                <p className="text-xs text-ink/40">No credit card required. Cancel anytime.</p>
                                <button
                                    onClick={() => setShowLimitPopup(false)}
                                    className="text-sm font-bold text-ink/40 hover:text-ink transition-colors"
                                >
                                    Maybe later
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


        </div >
    );
}