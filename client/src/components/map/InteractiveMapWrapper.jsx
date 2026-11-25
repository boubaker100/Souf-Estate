import { useState, useEffect, useRef } from "react";
import { MousePointerClick } from "lucide-react";

export function InteractiveMapWrapper({ children, className = "", height }) {
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setIsActive(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={height ? { height } : undefined}
    >
      {children}

      {!isActive && (
        <div
          className="md:hidden absolute inset-0 z-[9999] flex items-center justify-center bg-black/10 cursor-pointer"
          style={{ touchAction: "pan-y" }}
          onClick={() => setIsActive(true)}
        >
          <div className="bg-white/95 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
            <MousePointerClick className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-semibold text-gray-800">اضغط للتفاعل مع الخريطة</span>
          </div>
        </div>
      )}
    </div>
  );
}
