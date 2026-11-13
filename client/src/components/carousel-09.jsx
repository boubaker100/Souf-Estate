"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function usePreloadImages(images, currentIndex, isFullscreen) {
  React.useEffect(() => {
    if (!Array.isArray(images) || images.length === 0) return;

    const urls = new Set();
    const len = images.length;

    const add = (index) => {
      if (index >= 0 && index < len && images[index]) {
        urls.add(images[index]);
      }
    };

    // Always preload the current image and its neighbors.
    add(currentIndex);
    add(currentIndex - 1);
    add(currentIndex + 1);

    // When fullscreen opens, preload all images for smoother navigation.
    if (isFullscreen) {
      images.forEach((img) => {
        if (img) urls.add(img);
      });
    }

    const cache = [];
    urls.forEach((src) => {
      const img = new Image();
      img.src = src;
      cache.push(img);
    });

    return () => {
      cache.length = 0;
    };
  }, [images, currentIndex, isFullscreen]);
}

export default function ImageCarousel({ images = [] }) {
  const [mainApi, setMainApi] = React.useState(null);
  const [thumbApi, setThumbApi] = React.useState(null);
  const [fullscreenApi, setFullscreenApi] = React.useState(null);

  const [current, setCurrent] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [fullscreenLoaded, setFullscreenLoaded] = React.useState({});
  const [mainLoaded, setMainLoaded] = React.useState({});

  const [zoom, setZoom] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [failedImages, setFailedImages] = React.useState(new Set());
  const dragStartRef = React.useRef({ x: 0, y: 0 });

  const [touchStartDist, setTouchStartDist] = React.useState(null);

  const activeIndex = React.useMemo(() => {
    if (images.length === 0) return 0;
    return clamp(current, 0, images.length - 1);
  }, [current, images.length]);

  usePreloadImages(images, activeIndex, isFullscreen);

  // Track main carousel selection.
  React.useEffect(() => {
    if (!mainApi) return;

    const syncSelection = () => {
      setCurrent(mainApi.selectedScrollSnap());
    };

    syncSelection();
    mainApi.on("select", syncSelection);
    mainApi.on("reInit", syncSelection);

    return () => {
      mainApi.off("select", syncSelection);
      mainApi.off("reInit", syncSelection);
    };
  }, [mainApi]);

  // Sync thumbnails to the active slide.
  React.useEffect(() => {
    if (!thumbApi) return;
    thumbApi.scrollTo(current);
  }, [current, thumbApi]);

  // Open fullscreen on the selected image.
  React.useEffect(() => {
    if (!isFullscreen || !fullscreenApi) return;
    fullscreenApi.scrollTo(current);
  }, [isFullscreen, fullscreenApi, current]);

  // Keep current state in sync when fullscreen carousel changes.
  React.useEffect(() => {
    if (!fullscreenApi) return;

    const syncSelection = () => {
      setCurrent(fullscreenApi.selectedScrollSnap());
    };

    fullscreenApi.on("select", syncSelection);
    fullscreenApi.on("reInit", syncSelection);

    return () => {
      fullscreenApi.off("select", syncSelection);
      fullscreenApi.off("reInit", syncSelection);
    };
  }, [fullscreenApi]);

  // Lock body scroll while fullscreen is open.
  React.useEffect(() => {
    if (typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = isFullscreen ? "hidden" : previousOverflow || "auto";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  // Keyboard shortcuts in fullscreen.
  React.useEffect(() => {
    if (!isFullscreen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
        return;
      }

      if (e.key === "ArrowRight") {
        fullscreenApi?.scrollNext();
      }

      if (e.key === "ArrowLeft") {
        fullscreenApi?.scrollPrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen, fullscreenApi]);

  const resetZoom = React.useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
    setTouchStartDist(null);
  }, []);

  const openFullscreen = React.useCallback(
    (index) => {
      setCurrent(index);
      setIsFullscreen(true);
      resetZoom();
      requestAnimationFrame(() => {
        fullscreenApi?.scrollTo(index, true);
      });
    },
    [fullscreenApi, resetZoom]
  );

  const handleWheel = React.useCallback(
    (e) => {
      if (!isFullscreen) return;
      e.preventDefault();

      const direction = e.deltaY > 0 ? -0.08 : 0.08;
      const nextZoom = clamp(zoom + direction, 1, 3);
      setZoom(nextZoom);

      if (nextZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
    },
    [isFullscreen, zoom]
  );

  const handleDoubleClick = React.useCallback(() => {
    if (!isFullscreen) return;

    if (zoom === 1) {
      setZoom(2);
    } else {
      resetZoom();
    }
  }, [isFullscreen, zoom, resetZoom]);

  const handleMouseDown = React.useCallback(
    (e) => {
      if (!isFullscreen || zoom === 1) return;
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    },
    [isFullscreen, zoom, position.x, position.y]
  );

  const handleMouseMove = React.useCallback(
    (e) => {
      if (!isFullscreen || !isDragging || zoom === 1) return;

      const nextX = e.clientX - dragStartRef.current.x;
      const nextY = e.clientY - dragStartRef.current.y;
      setPosition({ x: nextX, y: nextY });
    },
    [isFullscreen, isDragging, zoom]
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const getTouchDistance = React.useCallback((touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = React.useCallback(
    (e) => {
      if (!isFullscreen) return;

      if (e.touches.length === 2) {
        setTouchStartDist(getTouchDistance(e.touches));
      }
    },
    [isFullscreen, getTouchDistance]
  );

  const handleTouchMove = React.useCallback(
    (e) => {
      if (!isFullscreen) return;

      if (e.touches.length === 2 && touchStartDist) {
        e.preventDefault();
        const newDist = getTouchDistance(e.touches);
        const ratio = newDist / touchStartDist;
        const nextZoom = clamp(zoom * ratio, 1, 3);
        setZoom(nextZoom);
        setTouchStartDist(newDist);
      }
    },
    [isFullscreen, touchStartDist, zoom, getTouchDistance]
  );

  const toggleZoom = React.useCallback(() => {
    if (!isFullscreen) return;

    if (zoom === 1) {
      setZoom(2);
      return;
    }

    resetZoom();
  }, [isFullscreen, zoom, resetZoom]);

  React.useEffect(() => {
  if (!mainApi || !thumbApi) return;

  const onSelect = () => {
    const index = mainApi.selectedScrollSnap();

    setCurrent(index);

    // 👇 هذا هو السحر (auto center)
    thumbApi.scrollTo(index);
  };

  mainApi.on("select", onSelect);

  return () => {
    mainApi.off("select", onSelect);
  };
}, [mainApi, thumbApi]);

  const currentSrc = images[activeIndex] || "";

  const handleImageError = React.useCallback((index) => {
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const PLACEHOLDER = "https://placehold.co/600x400?text=Image+Not+Found";

  if (!images.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No images provided.
      </div>
    );
  }

  return (
    <>
      {/* ================= MAIN IMAGE ================= */}
      <div className="h-[50vh] md:h-[75vh] w-full flex flex-col shadow-2xl mb-8">
        <div className="relative overflow-hidden flex-1">
          <Carousel
            setApi={setMainApi}
            opts={{
              align: "start",
              loop: images.length > 1,
            }}
            className="w-full" 
          >
            <CarouselContent>
              {images.map((img, i) => (
                <CarouselItem key={`${img}-${i}`}>
                  <div className="relative h-[50vh] md:h-[75vh] overflow-hidden bg-muted">
                    {!mainLoaded[i] && (
                      <div className="absolute inset-0 animate-pulse bg-muted" />
                    )}

<img
                       src={failedImages.has(i) ? PLACEHOLDER : img}
                       alt={`Image ${i + 1}`}
                       loading={i === 0 ? "eager" : "lazy"}
                       fetchPriority={i === 0 ? "high" : "auto"}
                       decoding="async"
                       onError={() => handleImageError(i)}
                       onLoad={() =>
                        setMainLoaded((prev) => ({ ...prev, [i]: true }))
                      }
                      className={cn(
                        "h-full w-full object-cover transition-opacity duration-300",
                        mainLoaded[i] ? "opacity-100" : "opacity-0"
                      )}
                    />

                    <button
                      type="button"
                      onClick={() => openFullscreen(i)}
                      className="absolute  bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-sm  text-white backdrop-blur-md transition hover:bg-black/80"
                      aria-label="Open fullscreen"
                    >
                      <Maximize2 size={16} />
                      <span className="hidden sm:inline">Fullscreen</span>
                    </button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-3 border-white/20 bg-black/35 text-white backdrop-blur-md hover:bg-black/55" />
            <CarouselNext className="right-3 border-white/20 bg-black/35 text-white backdrop-blur-md hover:bg-black/55" />
          </Carousel>
        </div>  
         {/* ================= THUMBNAILS ================= */}
      <div className="absolute bottom-3 left-1/4 md:left-1/3 -translate-x-1/4 max-w-3xl w-[95%] z-20">

  {/* ================= DESKTOP (thumbnails) ================= */}
  <div className="hidden md:block">
    <Carousel
      setApi={setThumbApi}
      opts={{
        align: "center",
        dragFree: true,
        containScroll: "keepSnaps",
      }}
      className="w-full"
    >
      <CarouselContent>
        {images.map((img, index) => (
          <CarouselItem
            key={`thumb-${img}-${index}`}
          
            className={cn("basis-1/5 lg:basis-1/7 px-0.5",
            current === index
            ?"mx-3 mt-2 p-1":"my-2.5 mx-1"
          )}
          >
            <button
              onClick={() => mainApi?.scrollTo(index)}
              className={cn(
                "group relative overflow-hidden rounded-xl border transition-all duration-300",

                current === index
                  ? "scale-120 border-white ring-2 ring-white/40 shadow-lg"
                  : "opacity-70 hover:opacity-100 hover:scale-105"
              )}
            >
              <img
                src={img}
                className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </button>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  </div>

  {/* ================= MOBILE (dots) ================= */}
  <div className="flex justify-center gap-2 md:hidden">
    {images.map((_, index) => (
      <button
        key={index}
        onClick={() => mainApi?.scrollTo(index)}
        className={cn(
          "h-2 rounded-full transition-all duration-300",
          current === index
            ? "w-6 bg-white"
            : "w-2 bg-white/50"
        )}
      />
    ))}
  </div>
</div>
    
    
    
      </div>

   

      {/* ================= FULLSCREEN ================= */}
      {isFullscreen && (
        <div className="fixed inset-0 z-1000 animate-[fadeIn_180ms_ease-out] bg-black">
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>

          <button
            type="button"
            onClick={() => {
              setIsFullscreen(false);
              resetZoom();
            }}
            className="absolute right-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            aria-label="Close fullscreen"
          >
            <X size={20} />
          </button>

          <div className="flex h-full w-full flex-col items-center justify-center px-3 pb-3 pt-2 sm:px-6">
            {/* Thumbnails above the fullscreen image */}
       

            {/* Fullscreen image */}
            <div className="relative flex h-full w-full max-w-6xl items-center justify-center overflow-hidden rounded-2xl bg-black/20">
              <Carousel
                setApi={setFullscreenApi}
                opts={{
                  align: "start",
                  loop: images.length > 1,
                  draggable: zoom === 1,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {images.map((img, i) => (
                    <CarouselItem key={`fs-img-${img}-${i}`}>
                      <div
                        className="relative flex h-screen bg-black/20 items-center justify-center overflow-hidden "
                        onWheel={handleWheel}
                        onDoubleClick={handleDoubleClick}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={() => setTouchStartDist(null)}
                        style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
                      >
                        {!fullscreenLoaded[i] && (
                          <div className="absolute inset-0 animate-pulse bg-white/5" />
                        )}

<img
                            src={failedImages.has(i) ? PLACEHOLDER : img}
                            alt={`Fullscreen image ${i + 1}`}
                            loading={i === activeIndex ? "eager" : "lazy"}
                            fetchPriority={i === activeIndex ? "high" : "auto"}
                            decoding="async"
                            onError={() => handleImageError(i)}
                            onLoad={() =>
                            setFullscreenLoaded((prev) => ({ ...prev, [i]: true }))
                          }
                          className={cn(
                            "max-h-full max-w-full select-none object-contain transition-[transform,opacity] duration-200",
                            fullscreenLoaded[i] ? "opacity-100" : "opacity-0"
                          )}
                          draggable={false}
                          style={{
                            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`,
                            transformOrigin: "center center",
                          }}
                        />

                        {/* Zoom controls */}
                        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 px-2 py-2 backdrop-blur-md">
                          <button
                            type="button"
                            onClick={() => setZoom((z) => clamp(Number((z - 0.25).toFixed(2)), 1, 3))}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                            aria-label="Zoom out"
                          >
                            <ZoomOut size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={toggleZoom}
                            className="inline-flex h-9 min-w-24 items-center justify-center rounded-full bg-white/10 px-3 text-sm text-white transition hover:bg-white/20"
                            aria-label="Toggle zoom"
                          >
                            {zoom === 1 ? "Zoom 2x" : "Reset"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setZoom((z) => clamp(Number((z + 0.25).toFixed(2)), 1, 3))}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                            aria-label="Zoom in"
                          >
                            <ZoomIn size={16} />
                          </button>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="left-3 border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/20" />
                <CarouselNext className="right-3 border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/20" />
              </Carousel>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
