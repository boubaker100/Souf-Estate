import { Link } from "react-router-dom";
import {
  Bookmark, Loader2, RefreshCw, AlertCircle, Compass
} from "lucide-react";
import PropertyCard from "@/components/map/PropertyCard";
import { useSavedPostsQuery } from "@/hooks/useSavedPosts";

export default function SavedPostsPage() {
  const { data: posts = [], isLoading: loading, isError, refetch, isFetching } = useSavedPostsQuery();

  return (
    <div className="space-y-6">
      {/* الترويسة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-white">
            الإعلانات المحفوظة
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {posts.length > 0
              ? `إجمالي ${posts.length} إعلان محفوظ`
              : "العقارات التي حفظتها للرجوع إليها لاحقاً"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
            title="تحديث القائمة"
          >
            <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* حالة التحميل */}
      {loading && posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mb-2" />
          <p className="font-medium text-sm">جاري تحميل الإعلانات المحفوظة...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 space-y-4">
          <AlertCircle size={48} className="mx-auto text-red-400" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-300">
            حدث خطأ أثناء التحميل
          </h3>
          <p className="text-sm text-gray-500">تعذر تحميل الإعلانات المحفوظة. حاول من جديد.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-sm"
            >
              <RefreshCw size={16} />إعادة المحاولة
            </button>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
          <Bookmark size={48} className="mx-auto text-gray-400" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">
            لا توجد إعلانات محفوظة بعد
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            تصفح العقارات واضغط على أيقونة القلب لحفظ إعلانك المفضل والرجوع إليه لاحقاً.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-gray-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm"
          >
            <Compass size={18} />
            <span>تصفح العقارات</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} to={`/${post.id}`} className="block">
              <PropertyCard post={post} isOwner={false} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}