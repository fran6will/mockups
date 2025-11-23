'use client';

import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric'; // Fabric v6 import
import { Layer } from '@/lib/utils/image';

interface FabricCanvasProps {
    layers: Layer[];
    activeLayerId: string | null;
    onSelectLayer: (id: string | null) => void;
    onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
    aspectRatio: '1:1' | '9:16' | '16:9';
}

export default function FabricCanvas({
    layers,
    activeLayerId,
    onSelectLayer,
    onUpdateLayer,
    aspectRatio
}: FabricCanvasProps) {
    const canvasEl = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState(false);

    // Track if the user is currently interacting with the canvas
    // We use a ref so we can access it inside callbacks without re-binding
    const isInteracting = useRef(false);

    // Initialize Canvas
    useEffect(() => {
        if (!canvasEl.current || !containerRef.current) return;

        console.log("Initializing Fabric Canvas...");

        // Create canvas
        const canvas = new fabric.Canvas(canvasEl.current, {
            preserveObjectStacking: true,
            selection: false,
            controlsAboveOverlay: true,
        });

        canvasRef.current = canvas;

        setIsReady(true);

        return () => {
            console.log("Disposing Fabric Canvas");
            canvas.dispose();
            canvasRef.current = null;
        };
    }, []);

    // Handle Events
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleSelection = (e: any) => {
            const active = e.selected?.[0] as any;
            if (active && active.data?.id) {
                onSelectLayer(active.data.id);
            }
        };

        const handleInteractionStart = () => {
            isInteracting.current = true;
        };

        const handleInteractionEnd = () => {
            isInteracting.current = false;
            // Force a sync after interaction ends to ensure final state is correct
            // But we might not need to do anything special if onUpdateLayer was called correctly
        };

        const handleUpdate = (e: any) => {
            const target = e.target as any;
            if (!target || !target.data?.id) return;

            // World Center is always 512, 512 (half of 1024)
            const WORLD_CENTER = 512;

            // Calculate relative move from world center
            // target.left/top are in world coordinates because we use setZoom
            const moveX = (target.left || 0) - WORLD_CENTER;
            const moveY = (target.top || 0) - WORLD_CENTER;

            // Normalize rotation
            let rotation = target.angle || 0;
            rotation = rotation % 360;
            if (rotation > 180) rotation -= 360;

            onUpdateLayer(target.data.id, {
                moveX: Math.round(moveX),
                moveY: Math.round(moveY),
                rotation: Math.round(rotation),
                scale: Number((target.scaleX || 1).toFixed(2)),
                skewX: Math.round(target.skewX || 0),
                skewY: Math.round(target.skewY || 0)
            });
        };

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', () => onSelectLayer(null));

        // Interaction state tracking
        canvas.on('mouse:down', handleInteractionStart);
        canvas.on('mouse:up', handleInteractionEnd);
        // Also track object events just in case
        canvas.on('object:moving', handleInteractionStart);
        canvas.on('object:scaling', handleInteractionStart);
        canvas.on('object:rotating', handleInteractionStart);
        canvas.on('object:skewing', handleInteractionStart);
        canvas.on('object:modified', handleInteractionEnd);


        // Update on all interactions for smooth slider sync
        canvas.on('object:modified', handleUpdate);
        canvas.on('object:moving', handleUpdate);
        canvas.on('object:scaling', handleUpdate);
        canvas.on('object:rotating', handleUpdate);
        canvas.on('object:skewing', handleUpdate);

        return () => {
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.off('selection:cleared');

            canvas.off('mouse:down', handleInteractionStart);
            canvas.off('mouse:up', handleInteractionEnd);

            canvas.off('object:moving', handleInteractionStart);
            canvas.off('object:scaling', handleInteractionStart);
            canvas.off('object:rotating', handleInteractionStart);
            canvas.off('object:skewing', handleInteractionStart);
            canvas.off('object:modified', handleInteractionEnd);

            canvas.off('object:modified', handleUpdate);
            canvas.off('object:moving', handleUpdate);
            canvas.off('object:scaling', handleUpdate);
            canvas.off('object:rotating', handleUpdate);
            canvas.off('object:skewing', handleUpdate);
        };
    }, [isReady, onSelectLayer, onUpdateLayer]);

    // Render Layers
    const renderLayers = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // World Center
        const WORLD_CENTER = 512;

        // 1. Remove layers that are no longer in props
        const currentObjects = canvas.getObjects();
        currentObjects.forEach(obj => {
            const objAny = obj as any;
            const exists = layers.find(l => l.id === objAny.data?.id);
            if (!exists) {
                canvas.remove(obj);
            }
        });

        // 2. Add or Update layers
        for (const layer of layers) {
            let obj = currentObjects.find(o => (o as any).data?.id === layer.id) as fabric.Image | undefined;

            if (!obj) {
                // Create new object
                try {
                    const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
                        const img = new Image();
                        img.src = layer.previewUrl;
                        img.onload = () => resolve(img);
                        img.onerror = reject;
                    });

                    // CRITICAL: Check again if it exists, because another render cycle might have added it while we were waiting
                    // This prevents race conditions where rapid updates (like resize) cause duplicates
                    const existsNow = canvas.getObjects().find(o => (o as any).data?.id === layer.id);

                    if (existsNow) {
                        // If it exists now, use the existing one and update it in the next block
                        obj = existsNow as fabric.Image;
                    } else {
                        obj = new fabric.Image(imgEl, {
                            data: { id: layer.id },
                            originX: 'center',
                            originY: 'center',
                            cornerColor: '#2A7F7F',
                            cornerStyle: 'circle',
                            borderColor: '#2A7F7F',
                            transparentCorners: false,
                            cornerSize: 10,
                            // Initial position
                            left: WORLD_CENTER + layer.moveX,
                            top: WORLD_CENTER + layer.moveY,
                            angle: layer.rotation,
                            scaleX: layer.scale,
                            scaleY: layer.scale,
                            skewX: layer.skewX,
                            skewY: layer.skewY,
                        });

                        canvas.add(obj);
                    }
                } catch (err) {
                    console.error("Failed to load layer image", err);
                    continue;
                }
            } else {
                // Update properties ONLY if they differ significantly AND we are not currently interacting with this object
                // This prevents jitter when the update comes from the canvas itself

                const isActive = canvas.getActiveObject() === obj;

                // If the user is actively interacting with THIS object, skip updates from props
                // This assumes the props are updating BECAUSE of the interaction
                // If the user is interacting with ANOTHER object, we still update this one
                if (isActive && isInteracting.current) {
                    continue;
                }

                const targetLeft = WORLD_CENTER + layer.moveX;
                const targetTop = WORLD_CENTER + layer.moveY;

                // We use a slightly larger threshold to avoid fighting floating point errors during drag
                if (Math.abs((obj.left || 0) - targetLeft) > 1) obj.set('left', targetLeft);
                if (Math.abs((obj.top || 0) - targetTop) > 1) obj.set('top', targetTop);
                if (Math.abs((obj.angle || 0) - layer.rotation) > 1) obj.set('angle', layer.rotation);
                if (Math.abs((obj.scaleX || 1) - layer.scale) > 0.01) {
                    obj.scale(layer.scale);
                }
                if (Math.abs((obj.skewX || 0) - layer.skewX) > 1) obj.set('skewX', layer.skewX);
                if (Math.abs((obj.skewY || 0) - layer.skewY) > 1) obj.set('skewY', layer.skewY);

                // Force update coordinates if we changed something
                obj.setCoords();
            }

            // Active State
            if (activeLayerId === layer.id && canvas.getActiveObject() !== obj) {
                canvas.setActiveObject(obj);
            }
        }

        canvas.requestRenderAll();
    };

    // Handle Resize & Zoom
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const resizeCanvas = () => {
            const container = containerRef.current;
            if (!container) return;

            const width = container.clientWidth;
            const height = width; // Force square for now

            if (canvasRef.current) {
                canvasRef.current.setDimensions({ width, height });
            }

            // Calculate Zoom
            // World size is 1024.
            const scale = width / 1024;
            if (canvasRef.current) {
                canvasRef.current.setZoom(scale);
            }

            renderLayers();
        };

        const observer = new ResizeObserver(resizeCanvas);
        observer.observe(containerRef.current);

        // Initial call
        resizeCanvas();

        return () => observer.disconnect();
    }, [isReady, renderLayers]);

    // Sync when props change
    useEffect(() => {
        if (isReady) {
            renderLayers();
        }
    }, [layers, activeLayerId, isReady]);

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full">
            <canvas ref={canvasEl} className="w-full h-full" />
        </div>
    );
}
