"use client";

import { FC, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Shimmer } from "@/components/common/Shimmer";

interface ImageCarouselProps {
    options: {
        images: {
            image: string;
            link: string;
            title?: string;
        }[];
    };
}

const ImageCarousel: FC<ImageCarouselProps> = ({ options }) => {
    const { images } = options;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const autoplayRef = useRef<NodeJS.Timeout | null>(null);

    const getFullImageUrl = useCallback((imagePath: string): string => {
        if (!imagePath) return "";
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        const backendUrl = process.env.NEXT_PUBLIC_BAGISTO_ENDPOINT;
        if (!backendUrl) return "";

        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        const cleanBase = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

        return `${cleanBase}/${cleanPath}`;
    }, []);

    const startAutoplay = useCallback(() => {
        if (!images || images.length <= 1) return;

        autoplayRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
    }, [images]);

    const stopAutoplay = useCallback(() => {
        if (autoplayRef.current) {
            clearInterval(autoplayRef.current);
            autoplayRef.current = null;
        }
    }, []);

    const _handleDotClick = useCallback((index: number) => {
        setCurrentIndex(index);
        setIsPaused(true);
        stopAutoplay();

        setTimeout(() => {
            setIsPaused(false);
        }, 10000);
    }, [stopAutoplay]);

    const goToPrev = useCallback(() => {
        if (!images) return;
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setIsPaused(true);
        stopAutoplay();
        setTimeout(() => setIsPaused(false), 10000);
    }, [images, stopAutoplay]);

    const goToNext = useCallback(() => {
        if (!images) return;
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsPaused(true);
        stopAutoplay();
        setTimeout(() => setIsPaused(false), 10000);
    }, [images, stopAutoplay]);

    useEffect(() => {
        if (!isPaused && images && images.length > 1) {
            startAutoplay();
        }
        return () => stopAutoplay();
    }, [isPaused, images, startAutoplay, stopAutoplay]);

    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const mouseStartX = useRef<number | null>(null);
    const mouseEndX = useRef<number | null>(null);

    if (!Array.isArray(images) || images.length === 0) return null;

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        touchEndX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = () => {
        if (touchStartX.current !== null && touchEndX.current !== null) {
            const distance = touchStartX.current - touchEndX.current;
            if (distance > 50) {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            } else if (distance < -50) {
                setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
            }
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        mouseStartX.current = e.clientX;
    };
    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        mouseEndX.current = e.clientX;
        if (mouseStartX.current !== null && mouseEndX.current !== null) {
            const distance = mouseStartX.current - mouseEndX.current;
            if (distance > 50) {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            } else if (distance < -50) {
                setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
            }
        }
        mouseStartX.current = null;
        mouseEndX.current = null;
    };

    return (
        <section className="relative w-full mt-15">
            <div
                className="group relative w-full overflow-hidden bg-gradient-to-br from-sky-100 via-orange-50 to-rose-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900"
                style={{ position: 'relative', width: '100%' }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                {/* Main carousel area */}
                <div className="relative w-full max-w-[1920px] mx-auto aspect-[320/613] md:aspect-[1920/781]">
                    {images.map((img, index) => {
                        const imageUrl = getFullImageUrl(img.image);
                        const isActive = index === currentIndex;
                        const altText = img.title || `Banner ${index + 1}`;

                        return (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-all duration-700 ease-in-out ${isActive ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-[1.02]"}`}
                            >
                                {img.link ? (
                                    <Link
                                        href={`/${img.link}`}
                                        className="block h-full w-full"
                                        aria-label={`View ${altText}`}
                                    >
                                        <div className="relative h-full w-full">
                                            <Shimmer className="h-full w-full" />
                                            <Image
                                                src={imageUrl}
                                                alt={altText}
                                                fill
                                                className="object-cover object-center !z-0"
                                                priority={index === 0}
                                                sizes="100vw"
                                            />
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="relative h-full w-full">
                                        <Shimmer className="h-full w-full" />
                                        <Image
                                            src={imageUrl}
                                            alt={altText}
                                            fill
                                            className="object-cover object-center !z-0"
                                            priority={index === 0}
                                            sizes="100vw"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                </div>

                {/* Navigation arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrev}
                            type="button"
                            aria-label="Previous slide"
                            className="absolute left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 flex items-center justify-center transition-all duration-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer"
                        >
                            <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <button
                            onClick={goToNext}
                            type="button"
                            aria-label="Next slide"
                            className="absolute right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 flex items-center justify-center transition-all duration-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer"
                        >
                            <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </>
                )}


            </div>
        </section>
    );
};

export default ImageCarousel;
