export interface Layer {
    id: string;
    file?: File; // Optional - restored layers from localStorage won't have this
    name?: string; // Optional - for displaying layer name when file is not available
    rotation: number;
    scale: number;
    moveX: number;
    moveY: number;
    skewX: number;
    skewY: number;
    opacity?: number;
    previewUrl: string; // For UI display
}

export async function compositeImages(layers: Layer[]): Promise<File> {
    return new Promise(async (resolve, reject) => {
        if (layers.length === 0) {
            reject(new Error('No layers to process'));
            return;
        }

        const ORIGINAL_WORLD_SIZE = 1024; // This is the coordinate system that moveX, moveY, scale are relative to
        const NEW_MAX_SIZE = 2048; // Increased to 2048 for better quality with Gemini Pro

        const canvas = document.createElement('canvas');
        canvas.width = NEW_MAX_SIZE;
        canvas.height = NEW_MAX_SIZE;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
        }

        // Load all images first
        const loadedImages = await Promise.all(layers.map(layer => {
            return new Promise<{ img: HTMLImageElement, layer: Layer }>((resolveImg, rejectImg) => {
                const img = new Image();
                img.src = layer.previewUrl;
                img.onload = () => resolveImg({ img, layer });
                img.onerror = () => rejectImg(new Error(`Failed to load layer ${layer.id}`));
            });
        }));

        // Calculate scaling factor from original world size to new canvas size
        const scaleFactor = NEW_MAX_SIZE / ORIGINAL_WORLD_SIZE;

        // Draw each layer
        loadedImages.forEach(({ img, layer }) => {
            const rads = (layer.rotation * Math.PI) / 180;
            const skewXRads = (layer.skewX * Math.PI) / 180;
            const skewYRads = (layer.skewY * Math.PI) / 180;

            ctx.save(); // Save state before transforming

            // Translate to center of canvas
            ctx.translate(NEW_MAX_SIZE / 2, NEW_MAX_SIZE / 2);

            // Apply User Moves (relative to center), scaled for the new canvas size
            ctx.translate(layer.moveX * scaleFactor, layer.moveY * scaleFactor);

            // Apply Transforms
            ctx.rotate(rads);
            ctx.transform(1, Math.tan(skewYRads), Math.tan(skewXRads), 1, 0, 0); // Skew
            // Apply scale, also scaled by our scaleFactor (because layer.scale is relative to ORIGINAL_WORLD_SIZE)
            ctx.scale(layer.scale * scaleFactor, layer.scale * scaleFactor);

            // Draw Image Centered at current origin
            ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

            ctx.restore(); // Restore state for next layer
        });

        // Convert to blob/file
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Failed to composite images'));
                return;
            }
            const compositedFile = new File([blob], "composite.webp", {
                type: 'image/webp',
                lastModified: Date.now(),
            });
            resolve(compositedFile);
        }, 'image/webp', 0.85);
    });
}
