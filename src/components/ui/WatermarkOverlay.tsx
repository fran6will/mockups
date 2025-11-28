import React from 'react';

interface WatermarkOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    text?: string;
    className?: string;
    showWatermark?: boolean;
    allowInteraction?: boolean;
}

export default function WatermarkOverlay({
    children,
    text = "Copié-Collé",
    className = "",
    showWatermark = true,
    allowInteraction = false,
    ...props
}: WatermarkOverlayProps) {
    if (!showWatermark) return <div className={className} {...props}>{children}</div>;

    return (
        <div
            className={`relative overflow-hidden group select-none ${className}`}
            onContextMenu={(e) => {
                e.preventDefault();
                props.onContextMenu?.(e);
            }}
            {...props}
        >
            {children}

            {/* Watermark Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center opacity-30 mix-blend-overlay">
                <div className="rotate-[-30deg] transform">
                    <div className="grid grid-cols-2 gap-12">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <span key={i} className="text-4xl font-black text-white/50 whitespace-nowrap">
                                {text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transparent overlay to block drag/save - only if interaction is NOT allowed */}
            {!allowInteraction && (
                <div className="absolute inset-0 z-30 bg-transparent" />
            )}
        </div>
    );
}
