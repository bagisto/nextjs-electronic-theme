"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: (index: number) => void;
  images: { src: string; altText: string }[];
  initialIndex: number;
}

export default function ProductImageModal({
  isOpen,
  onClose,
  images,
  initialIndex,
}: ProductImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
       
      setCurrentIndex(initialIndex);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose(currentIndex);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col bg-white dark:bg-neutral-900"
      >
        {/* Header - Close Button */}
        <div className="absolute top-6 right-6 z-[10000]">
          <button
            onClick={() => onClose(currentIndex)}
            className="p-2 cursor-pointer rounded-full bg-neutral-100/80 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 transition-all duration-200 shadow-sm backdrop-blur-md"
            aria-label="Close"
          >
            <XMarkIcon className="w-8 h-8 text-neutral-800 dark:text-neutral-200" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative flex items-center justify-center">
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 md:left-8 cursor-pointer z-[10000] p-3 rounded-full bg-neutral-200/50 hover:bg-neutral-200 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 transition-all duration-300 backdrop-blur-md group"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="w-8 h-8 text-neutral-700 dark:text-neutral-300 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 cursor-pointer md:right-8 z-[10000] p-3 rounded-full bg-neutral-200/50 hover:bg-neutral-200 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 transition-all duration-300 backdrop-blur-md group"
                aria-label="Next image"
              >
                <ChevronRightIcon className="w-8 h-8 text-neutral-700 dark:text-neutral-300 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {/* Large Image Display */}
          <div className="relative w-full h-full p-10 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative w-full h-full max-w-4xl"
              >
                <Image
                  src={images[currentIndex].src}
                  alt={images[currentIndex].altText}
                  fill
                  className="object-contain"
                  priority
                  sizes="100vw"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Thumbnails Section */}
        <div className="w-full pb-10 flex flex-col items-center gap-2">
          <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide max-w-full">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative w-24 h-24 rounded-xl cursor-pointer overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                  currentIndex === index
                    ? "border-neutral-900 dark:border-white ring-4 ring-neutral-200 dark:ring-neutral-800"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.altText}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
          {images.length > 1 && (
             <div className="text-sm font-semibold tracking-wider text-neutral-400">
                {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
             </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
