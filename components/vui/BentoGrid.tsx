"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Heart, Download, X, User } from "lucide-react";
import { Button } from "@/components/ui/buttonShadcn";
import React from "react";

// Static Unsplash images - replace these URLs with your preferred images
const staticImages = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    alt: "Beautiful mountain landscape with reflection in lake",
    photographer: "John Doe",
    username: "johndoe",
    likes: 1240,
    downloads: 892,
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
    alt: "Misty forest with tall trees",
    photographer: "Jane Smith",
    username: "janesmith",
    likes: 856,
    downloads: 634,
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
    alt: "Serene lake surrounded by mountains",
    photographer: "Mike Johnson",
    username: "mikej",
    likes: 2103,
    downloads: 1456,
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80",
    alt: "Desert sand dunes at sunset",
    photographer: "Sarah Wilson",
    username: "sarahw",
    likes: 945,
    downloads: 723,
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80",
    alt: "Rolling green hills countryside",
    photographer: "Tom Brown",
    username: "tombrown",
    likes: 678,
    downloads: 445,
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&q=80",
    alt: "Ocean waves crashing on rocks",
    photographer: "Lisa Davis",
    username: "lisad",
    likes: 1567,
    downloads: 1203,
  },
  {
    id: "7",
    url: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&q=80",
    alt: "Snow-capped mountain peaks",
    photographer: "Alex Chen",
    username: "alexc",
    likes: 892,
    downloads: 567,
  },
  {
    id: "8",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80",
    alt: "Autumn forest with golden leaves",
    photographer: "Emma Taylor",
    username: "emmat",
    likes: 734,
    downloads: 489,
  },
  {
    id: "9",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    alt: "Peaceful valley with river",
    photographer: "David Lee",
    username: "davidl",
    likes: 1245,
    downloads: 834,
  },
  {
    id: "10",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
    alt: "Dramatic cliff overlooking ocean",
    photographer: "Rachel Green",
    username: "rachelg",
    likes: 1876,
    downloads: 1345,
  },
  {
    id: "11",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
    alt: "Majestic mountain range with golden sunrise",
    photographer: "James Rodriguez",
    username: "jamesrod",
    likes: 2234,
    downloads: 1567,
  },
  {
    id: "12",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    alt: "Majestic mountain range with golden sunrise",
    photographer: "James Rodriguez",
    username: "jamesrod",
    likes: 2234,
    downloads: 1567,
  },
];

// Responsive grid items with different layouts for different screen sizes
const gridItems = [
  {
    id: 1,
    className:
      "col-span-2 row-span-1 sm:col-span-2 sm:row-span-1 md:col-span-3 md:row-span-1 lg:col-span-3 lg:row-span-1",
  },
  {
    id: 2,
    className:
      "col-span-2 row-span-1 sm:col-span-2 sm:row-span-1 md:col-span-3 md:row-span-1 lg:col-span-3 lg:row-span-1",
  },
  {
    id: 3,
    className:
      "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2 md:col-span-4 md:row-span-2 lg:col-span-4 lg:row-span-2",
  },
  {
    id: 4,
    className:
      "col-span-2 row-span-1 sm:col-span-2 sm:row-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2",
  },
  {
    id: 5,
    className:
      "col-span-2 row-span-1 sm:col-span-4 sm:row-span-1 md:col-span-6 md:row-span-1 lg:col-span-6 lg:row-span-1",
  },
  {
    id: 6,
    className:
      "col-span-2 row-span-1 sm:col-span-2 sm:row-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2",
  },
  {
    id: 7,
    className:
      "col-span-2 row-span-2 sm:col-span-2 sm:row-span-3 md:col-span-4 md:row-span-3 lg:col-span-4 lg:row-span-3",
  },
  {
    id: 8,
    className:
      "col-span-2 row-span-1 sm:col-span-2 sm:row-span-1 md:col-span-2 md:row-span-1 lg:col-span-2 lg:row-span-1",
  },
  {
    id: 9,
    className:
      "col-span-2 row-span-1 sm:col-span-4 sm:row-span-1 md:col-span-6 md:row-span-1 lg:col-span-6 lg:row-span-1",
  },
  {
    id: 10,
    className:
      "col-span-2 row-span-1 sm:col-span-2 sm:row-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2",
  },
  {
    id: 11,
    className:
      "col-span-2 row-span-1 sm:col-span-2 sm:row-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2",
  },
  {
    id: 12,
    className:
      "col-span-2 row-span-1 sm:col-span-2 sm:row-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2",
  },
];

const gridItems2 = [
  {
    id: 1,
    className:
      "col-span-2 row-span-1 sm:col-span-2 sm:row-span-1 md:col-span-3 md:row-span-1 lg:col-span-3 lg:row-span-1",
  },
  {
    id: 2,
    className:
      "col-span-2 row-span-1 sm:col-span-2 sm:row-span-1 md:col-span-3 md:row-span-1 lg:col-span-3 lg:row-span-1",
  },
  {
    id: 3,
    className:
      "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2 md:col-span-4 md:row-span-2 lg:col-span-4 lg:row-span-2",
  },
  {
    id: 4,
    className:
      "col-span-2 row-span-1 sm:col-span-2 sm:row-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2",
  },
];

// Image Dialog Component
function ImageDialog({
  image,
  isOpen,
  onClose,
}: {
  image: (typeof staticImages)[0] | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // ESC key functionality
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset image loaded state when image changes
  React.useEffect(() => {
    setImageLoaded(false);
  }, [image]);

  if (!image) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateX: -15 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotateX: 15 }}
            transition={{
              type: "spring",
              duration: 0.6,
              bounce: 0.3,
              ease: "easeOut",
            }}
            className="relative max-w-5xl max-h-[95vh] w-full bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
            style={{
              transformStyle: "preserve-3d",
              perspective: "1000px",
            }}
          >
            {/* Enhanced Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.2 }}
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-2 sm:p-3 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            {/* Image Container with Loading State */}
            <div className="relative aspect-[4/3] w-full bg-gray-100 dark:bg-gray-800">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full"
                  />
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: imageLoaded ? 1 : 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px"
                  priority
                  onLoad={() => setImageLoaded(true)}
                />
              </motion.div>

              {/* Image Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Enhanced Image Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-4">
                <div className="flex-1">
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 leading-tight"
                  >
                    {image.alt}
                  </motion.h3>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center text-gray-600 dark:text-gray-300 mb-4"
                  >
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-sm">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="font-semibold">
                        {image.photographer}
                      </span>
                      <span className="mx-1 sm:mx-2 text-gray-400 dark:text-gray-500">
                        •
                      </span>
                      <span className="text-xs sm:text-sm opacity-75">
                        @{image.username}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center space-x-4 sm:space-x-8"
                >
                  <div className="flex items-center bg-red-50 dark:bg-red-900/20 px-3 sm:px-4 py-1 sm:py-2 rounded-full">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-red-500" />
                    <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                      {image.likes.toLocaleString()}
                    </span>
                    <span className="ml-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                      likes
                    </span>
                  </div>

                  <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 sm:px-4 py-1 sm:py-2 rounded-full">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-blue-500" />
                    <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                      {image.downloads.toLocaleString()}
                    </span>
                    <span className="ml-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                      downloads
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-300 text-sm sm:text-base"
                    onClick={() =>
                      window.open(
                        `https://unsplash.com/@${image.username}`,
                        "_blank"
                      )
                    }
                  >
                    View on Unsplash
                  </Button>
                </motion.div>
              </div>

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800"
              >
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                  Press{" "}
                  <kbd className="px-1 sm:px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                    ESC
                  </kbd>{" "}
                  to close
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function BentoGrid() {
  const [refreshKey] = useState(0);
  const [selectedImage, setSelectedImage] = useState<
    (typeof staticImages)[0] | null
  >(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const openImageDialog = (image: (typeof staticImages)[0]) => {
    setSelectedImage(image);
    setDialogOpen(true);
  };

  const closeImageDialog = () => {
    setDialogOpen(false);
    setTimeout(() => setSelectedImage(null), 300);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 auto-rows-[150px] sm:auto-rows-[180px] lg:auto-rows-[200px]">
        <AnimatePresence mode="wait">
          {gridItems.map((item, index) => {
            const image = staticImages[index];
            if (!image) return null;

            const isHovered = hoveredItem === image.id;

            return (
              <motion.div
                key={`${image.id}-${refreshKey}`}
                className={`${item.className} relative group overflow-hidden rounded-xl sm:rounded-2xl bg-gray-200 dark:bg-gray-700 cursor-pointer`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: [0.4, 0.0, 0.2, 1],
                  type: "spring",
                  damping: 20,
                  stiffness: 300,
                }}
                whileHover={{
                  scale: 1.02,
                  zIndex: 10,
                  rotateY: 1,
                  transition: { duration: 0.4, ease: "easeOut" },
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.1 },
                }}
                onHoverStart={() => setHoveredItem(image.id)}
                onHoverEnd={() => setHoveredItem(null)}
                onClick={() => openImageDialog(image)}
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 group-hover:contrast-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />

                {/* Enhanced Overlay with gradient animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />

                {/* Enhanced Content overlay with staggered animations */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 lg:p-4 text-white"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{
                    y: isHovered ? "0%" : "100%",
                    opacity: isHovered ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0.0, 0.2, 1],
                    delay: isHovered ? 0.1 : 0,
                  }}
                >
                  <div className="space-y-2 sm:space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        y: isHovered ? 0 : 10,
                      }}
                      transition={{ delay: isHovered ? 0.2 : 0, duration: 0.3 }}
                    >
                      <p className="font-bold text-xs sm:text-sm truncate mb-1 drop-shadow-lg">
                        {image.alt}
                      </p>
                      <p className="text-xs opacity-90 truncate drop-shadow-md">
                        by {image.photographer}
                      </p>
                    </motion.div>

                    <motion.div
                      className="flex items-center justify-between text-xs flex-wrap gap-1 sm:gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        y: isHovered ? 0 : 10,
                      }}
                      transition={{ delay: isHovered ? 0.3 : 0, duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <motion.span
                          className="flex items-center bg-white/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full backdrop-blur-md border border-white/20 text-xs"
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(255,255,255,0.3)",
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 text-red-400" />
                          <span className="hidden sm:inline">
                            {image.likes}
                          </span>
                          <span className="sm:hidden">
                            {Math.floor(image.likes / 1000)}k
                          </span>
                        </motion.span>
                        <motion.span
                          className="flex items-center bg-white/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full backdrop-blur-md border border-white/20 text-xs"
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(255,255,255,0.3)",
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 text-blue-400" />
                          <span className="hidden sm:inline">
                            {image.downloads}
                          </span>
                          <span className="sm:hidden">
                            {Math.floor(image.downloads / 1000)}k
                          </span>
                        </motion.span>
                      </div>
                      <motion.div
                        className="text-xs bg-white/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full backdrop-blur-md border border-white/40 font-medium whitespace-nowrap flex-shrink-0"
                        animate={{
                          scale: isHovered ? [1, 1.02, 1] : 1,
                          opacity: isHovered ? [0.9, 1, 0.95] : 0.9,
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                          ease: "easeInOut",
                        }}
                      >
                        <span className="hidden sm:inline">
                          Click to expand
                        </span>
                        <span className="sm:hidden">Tap</span>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Enhanced Hover border effect with animated gradient */}
                <motion.div
                  className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(45deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1), rgba(255,255,255,0.4))",
                    backgroundSize: "200% 200%",
                  }}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    backgroundPosition: isHovered
                      ? ["0% 0%", "100% 100%"]
                      : "0% 0%",
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    backgroundPosition: {
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    },
                  }}
                />

                {/* Shimmer effect on hover - enhanced */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                  initial={{ x: "-100%" }}
                  animate={{
                    x: isHovered ? "100%" : "-100%",
                  }}
                  transition={{
                    duration: 1.2,
                    ease: "easeInOut",
                    repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                    repeatDelay: 2,
                  }}
                />

                {/* Corner accent */}
                <motion.div
                  className="absolute top-2 left-2 sm:top-3 sm:left-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full backdrop-blur-sm"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isHovered ? 1 : 0,
                    opacity: isHovered ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, delay: isHovered ? 0.4 : 0 }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Image Dialog */}
      <ImageDialog
        image={selectedImage}
        isOpen={dialogOpen}
        onClose={closeImageDialog}
      />
    </div>
  );
}

export function BentoGridShowcase() {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8 bg-background">
      <BentoGrid />
    </div>
  );
}

export function BentoGridTheme() {
  const [refreshKey] = useState(0);
  const [selectedImage, setSelectedImage] = useState<
    (typeof staticImages)[0] | null
  >(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const openImageDialog = (image: (typeof staticImages)[0]) => {
    setSelectedImage(image);
    setDialogOpen(true);
  };

  const closeImageDialog = () => {
    setDialogOpen(false);
    setTimeout(() => setSelectedImage(null), 300);
  };

  return (
    <>
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2 sm:gap-3 lg:gap-4 auto-rows-[150px] sm:auto-rows-[180px] lg:auto-rows-[200px]">
        <AnimatePresence mode="wait">
          {gridItems2.map((item, index) => {
            const image = staticImages[index];
            if (!image) return null;
            const isHovered = hoveredItem === image.id;
            return (
              <motion.div
                key={`${image.id}-${refreshKey}`}
                className={`${item.className} relative group overflow-hidden rounded-xl sm:rounded-2xl bg-gray-200 dark:bg-gray-700 cursor-pointer`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: [0.4, 0.0, 0.2, 1],
                  type: "spring",
                  damping: 20,
                  stiffness: 300,
                }}
                whileHover={{
                  scale: 1.02,
                  zIndex: 10,
                  rotateY: 1,
                  transition: { duration: 0.4, ease: "easeOut" },
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.1 },
                }}
                onHoverStart={() => setHoveredItem(image.id)}
                onHoverEnd={() => setHoveredItem(null)}
                onClick={() => openImageDialog(image)}
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 group-hover:contrast-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />

                {/* Enhanced Overlay with gradient animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />

                {/* Enhanced Content overlay with staggered animations */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 lg:p-4 text-white"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{
                    y: isHovered ? "0%" : "100%",
                    opacity: isHovered ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0.0, 0.2, 1],
                    delay: isHovered ? 0.1 : 0,
                  }}
                >
                  <div className="space-y-2 sm:space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        y: isHovered ? 0 : 10,
                      }}
                      transition={{ delay: isHovered ? 0.2 : 0, duration: 0.3 }}
                    >
                      <p className="font-bold text-xs sm:text-sm truncate mb-1 drop-shadow-lg">
                        {image.alt}
                      </p>
                      <p className="text-xs opacity-90 truncate drop-shadow-md">
                        by {image.photographer}
                      </p>
                    </motion.div>

                    <motion.div
                      className="flex items-center justify-between text-xs flex-wrap gap-1 sm:gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        y: isHovered ? 0 : 10,
                      }}
                      transition={{ delay: isHovered ? 0.3 : 0, duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <motion.span
                          className="flex items-center bg-white/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full backdrop-blur-md border border-white/20 text-xs"
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(255,255,255,0.3)",
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 text-red-400" />
                          <span className="hidden sm:inline">
                            {image.likes}
                          </span>
                          <span className="sm:hidden">
                            {Math.floor(image.likes / 1000)}k
                          </span>
                        </motion.span>
                        <motion.span
                          className="flex items-center bg-white/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full backdrop-blur-md border border-white/20 text-xs"
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(255,255,255,0.3)",
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 text-blue-400" />
                          <span className="hidden sm:inline">
                            {image.downloads}
                          </span>
                          <span className="sm:hidden">
                            {Math.floor(image.downloads / 1000)}k
                          </span>
                        </motion.span>
                      </div>
                      <motion.div
                        className="text-xs bg-white/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full backdrop-blur-md border border-white/40 font-medium whitespace-nowrap flex-shrink-0"
                        animate={{
                          scale: isHovered ? [1, 1.02, 1] : 1,
                          opacity: isHovered ? [0.9, 1, 0.95] : 0.9,
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                          ease: "easeInOut",
                        }}
                      >
                        <span className="hidden sm:inline">
                          Click to expand
                        </span>
                        <span className="sm:hidden">Tap</span>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Enhanced Hover border effect with animated gradient */}
                <motion.div
                  className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(45deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1), rgba(255,255,255,0.4))",
                    backgroundSize: "200% 200%",
                  }}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    backgroundPosition: isHovered
                      ? ["0% 0%", "100% 100%"]
                      : "0% 0%",
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    backgroundPosition: {
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    },
                  }}
                />

                {/* Shimmer effect on hover - enhanced */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                  initial={{ x: "-100%" }}
                  animate={{
                    x: isHovered ? "100%" : "-100%",
                  }}
                  transition={{
                    duration: 1.2,
                    ease: "easeInOut",
                    repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                    repeatDelay: 2,
                  }}
                />

                {/* Corner accent */}
                <motion.div
                  className="absolute top-2 left-2 sm:top-3 sm:left-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full backdrop-blur-sm"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isHovered ? 1 : 0,
                    opacity: isHovered ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, delay: isHovered ? 0.4 : 0 }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <ImageDialog
        image={selectedImage}
        isOpen={dialogOpen}
        onClose={closeImageDialog}
      />
    </>
  );
}
