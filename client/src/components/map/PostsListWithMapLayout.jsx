import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, ChevronRight, ChevronLeft, X } from "lucide-react";
import PropertyCard from "./PropertyCard";
import PostsMap from "./PostsMap";

// نرسم نسخة واحدة فقط (سطح مكتب أو هاتف) بدل رسم الاثنتين وإخفاء إحداهما بالـ CSS
function useIsDesktop() {
  const query = "(min-width: 1024px)";
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

// ترقيم الصفحات (مدمج هنا، عربي RTL، بدون أي اعتماد على ملفات أخرى)
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const set = new Set([1, totalPages]);
  for (let i = -1; i <= 1; i++) {
    const p = currentPage + i;
    if (p > 1 && p < totalPages) set.add(p);
  }
  const pages = [...set].sort((a, b) => a - b);

  const base =
    "min-w-9 h-9 px-3 inline-flex items-center justify-center rounded-lg border text-sm font-semibold transition-colors";
  const idle = "bg-white border-gray-200 text-gray-700 hover:border-yellow-400";
  const active = "bg-yellow-500 border-yellow-500 text-black";
  const off = "opacity-40 pointer-events-none";

  return (
    <nav dir="rtl" className="mt-6 flex items-center justify-center gap-1.5 flex-wrap" aria-label="ترقيم الصفحات">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${base} ${idle} gap-1 ${currentPage === 1 ? off : ""}`}
      >
        <ChevronRight className="w-4 h-4" /> السابق
      </button>

      {pages.map((p, i) => (
        <span key={p} className="contents">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-gray-400">…</span>}
          <button
            onClick={() => p !== currentPage && onPageChange(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`${base} ${p === currentPage ? active : idle}`}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${base} ${idle} gap-1 ${currentPage === totalPages ? off : ""}`}
      >
        التالي <ChevronLeft className="w-4 h-4" />
      </button>
    </nav>
  );
}

export default function PostsListWithMap({
  posts, // عقارات الصفحة الحالية (للكاردات)
  mapPosts, // كل العقارات المفلترة (للخريطة)
  loading,
  singlePost,
  pagination, // { page, totalPages, total }
  onPageChange, // (page) => void
}) {
  const pagePosts = singlePost ? [singlePost] : posts || [];
  const markers = singlePost ? [singlePost] : mapPosts || pagePosts;

  const isDesktop = useIsDesktop();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);

  const selectedRef = useRef(null);
  const listTopRef = useRef(null);

  const pageKey = pagePosts.map((p) => p.id).join(",");
  const markersKey = markers.map((p) => p.id).join(",");

  // عند تغيير الصفحة أو الفلتر: العودة لأول كارد
  useEffect(() => {
    setCurrentIndex(0);
  }, [pageKey]);

  // إلغاء التحديد إذا اختفى العقار من نتائج الفلترة
  useEffect(() => {
    if (selectedPost && !markers.some((p) => p.id === selectedPost.id)) {
      setSelectedPost(null);
    }
  }, [markersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedPost) {
      selectedRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedPost]);

  const total = pagePosts.length;
  const safeIndex = Math.min(currentIndex, Math.max(total - 1, 0));
  const nextCard = () => setCurrentIndex((i) => (i + 1) % total);
  const prevCard = () => setCurrentIndex((i) => (i - 1 + total) % total);

  const handleMarkerClick = (post) => setSelectedPost(post);

  const handlePageChange = (page) => {
    onPageChange?.(page);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const foundCount = pagination?.total ?? total;

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {/* رأس الصفحة */}
      <motion.div variants={itemVariants} className="space-y-4 m-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-8 h-8 text-yellow-500" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">العقارات المتاحة</h2>
            <p className="text-gray-600 mt-1">
              {loading && total === 0 ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> جاري البحث...
                </span>
              ) : (
                <>
                  وجدنا <span className="font-bold text-yellow-600">{foundCount}</span> عقارات طابق بحثك
                </>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-6 px-2 sm:px-6">
        {/* الخريطة: عرض كامل (كل العقارات المفلترة) */}
        <div className="w-full h-[350px] sm:h-[450px] lg:h-[500px]">
          <div className="rounded-2xl w-full h-full overflow-hidden shadow-lg border border-gray-100">
            <PostsMap posts={markers} className="h-full" onMarkerClick={handleMarkerClick} />
          </div>
        </div>

        {/* العقار الذي تم الضغط عليه في الخريطة */}
        <AnimatePresence>
          {selectedPost && (
            <motion.div
              key={selectedPost.id}
              ref={selectedRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border-2 border-yellow-400 bg-yellow-50/50 p-3 sm:p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-yellow-700">العقار المحدد على الخريطة</span>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-1.5 rounded-full hover:bg-yellow-100 text-gray-600"
                  aria-label="إلغاء التحديد"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-w-sm mx-auto lg:mx-0">
                <PropertyCard post={selectedPost} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* الكاردات (صفحة واحدة) */}
        <div ref={listTopRef} className="scroll-mt-24">
          {total === 0 ? (
            !loading && <EmptyState />
          ) : (
            <div className={loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
              {isDesktop ? (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                  {pagePosts.map((post) => (
                    <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <PropertyCard post={post} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {total > 1 && (
                    <div className="text-center text-xs text-gray-500 font-bold tracking-wider">
                      عقار {safeIndex + 1} من {total} في هذه الصفحة
                    </div>
                  )}
                  <div className="relative px-1">
                    <div className="overflow-hidden pt-1">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={pagePosts[safeIndex].id}
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -40 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <PropertyCard post={pagePosts[safeIndex]} />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {total > 1 && (
                      <>
                        <button
                          onClick={prevCard}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white/95 border border-gray-200 text-gray-800 rounded-full shadow-lg active:scale-90 hover:bg-gray-50 transition-all duration-200"
                          aria-label="العقار السابق"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextCard}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white/95 border border-gray-200 text-gray-800 rounded-full shadow-lg active:scale-90 hover:bg-gray-50 transition-all duration-200"
                          aria-label="العقار التالي"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!singlePost && pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="text-lg font-semibold text-gray-800">لم نجد أي عقارات مطابقة</p>
      <p className="text-gray-500 text-sm mt-1">حاول تغيير معايير أو نطاق البحث في الخريطة</p>
    </div>
  );
}