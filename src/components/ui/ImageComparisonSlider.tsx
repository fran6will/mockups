'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ImageComparisonSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
}

export default function ImageComparisonSlider({
    beforeImage,
    afterImage,
    beforeLabel = "Before",
    afterLabel = "After"
}: ImageComparisonSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial scan animation
    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;

            // 2.5s duration: start at 50, go to 65, then 35, then back to 50
            if (progress < 2500 && !isDragging && !isHovered) {
                const p = progress / 2500;
                // Sine wave oscillation for smooth "look here" effect
                const move = 50 + Math.sin(p * Math.PI * 2) * 15;
                setSliderPosition(move);
                animationFrame = requestAnimationFrame(animate);
            } else if (!isDragging && !isHovered) {
                setSliderPosition(50); // Reset to center
            }
        };

        const timeout = setTimeout(() => {
            animationFrame = requestAnimationFrame(animate);
        }, 1000); // Start after 1s delay

        return () => {
            clearTimeout(timeout);
            cancelAnimationFrame(animationFrame);
        };
    }, [isDragging, isHovered]);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
        setSliderPosition(percent);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        handleMove(e.clientX);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            handleMove(e.clientX);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging) return;
            // Prevent scroll on mobile while dragging slider
            if (e.cancelable) e.preventDefault();
            handleMove(e.touches[0].clientX);
        };

        const handleEnd = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging]);

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden cursor-col-resize select-none shadow-2xl shadow-teal/20 border border-white/40 touch-none group"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* After Image (Right side - CopiéCollé) - Reference */}
            <div className="absolute inset-0">
                <Image
                    src={afterImage}
                    alt={afterLabel}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center" // Ensure center alignment
                    priority
                />

                {/* CopiéCollé Label */}
                <div className="absolute bottom-4 right-4 z-20">
                    <div className="bg-teal text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform transition-transform group-hover:scale-110">
                        ✨ CopiéCollé
                    </div>
                </div>
            </div>

            {/* Before Image (Left side - Canva) - Wraps in a container that matches parent width */}
            <div
                className="absolute inset-y-0 left-0 overflow-hidden z-10"
                style={{ width: `${sliderPosition}%` }}
            >
                {/* Inner container must be full width of parent to maintain image alignment */}
                <div className="relative h-full w-full min-w-full">
                    {/* 
                        CRITICAL FIX: 
                        We use containerRef width if available, otherwise just 100% of parent 
                        This ensures the image inside scales exactly like the background image
                     */}
                    <div
                        className="absolute inset-0"
                        style={{ width: containerRef.current ? containerRef.current.offsetWidth : '100%' }}
                    >
                        <Image
                            src={beforeImage}
                            alt={beforeLabel}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover object-center" // Ensure center alignment matches background
                            priority
                        />
                    </div>
                </div>

                {/* Canva Label - Sticks to bottom left */}
                <div className="absolute bottom-4 left-4 z-20 whitespace-nowrap">
                    <div className="bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm transform transition-transform group-hover:scale-110">
                        😐 Canva
                    </div>
                </div>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize z-30"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
                {/* Handle Knob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-teal transition-transform hover:scale-110 active:scale-95">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-teal">
                        <path d="M8 5L3 12L8 19M16 5L21 12L16 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Drag Hint - Only show if not interacting */}
            {!isDragging && !isHovered && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 pointer-events-none z-30 opacity-0 animate-fade-in-delayed">
                    <div className="bg-black/40 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
                        Slide
                    </div>
                </div>
            )}
        </div>
    );
}

