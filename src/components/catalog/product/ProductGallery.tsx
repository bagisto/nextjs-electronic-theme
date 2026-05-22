"use client";

import { useState } from "react";
import Image from "next/image";
import { Shimmer } from "@/components/common/Shimmer";
import ProductImageModal from "./ProductImageModal";
import ZoomIcon from "@/components/common/icons/ZoomIcon";

interface ProductGalleryProps {
  images: { src: string; altText: string }[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden">
        <Shimmer className="absolute inset-0 z-10 h-full w-full" rounded="lg" />
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="flex gap-4">
      {/* Thumbnails - Vertical */}
      <div className="flex flex-col gap-3 w-20 shrink-0">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setIsLoading(true);
            }}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
              currentIndex === index
                ? "border-neutral-900 dark:border-white ring-2 ring-neutral-200 dark:ring-neutral-700"
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500"
            }`}
          >
            <Image
              src={image.src}
              alt={image.altText}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div 
        className="flex-1 relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-zoom-in group"
        onClick={() => setIsModalOpen(true)}
      >
        <Image
          src={currentImage.src}
          alt={currentImage.altText}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          onLoad={() => setIsLoading(false)}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        )}
        
        <div className="absolute bottom-4 right-4 p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIcon className="w-5 h-5" />
        </div>
      </div>

      <ProductImageModal
        isOpen={isModalOpen}
        onClose={(index) => {
          setIsModalOpen(false);
          setCurrentIndex(index);
        }}
        images={images}
        initialIndex={currentIndex}
      />
    </div>
  );
}
