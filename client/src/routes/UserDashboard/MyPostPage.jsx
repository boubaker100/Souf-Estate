import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileText, PlusCircle, Loader2, RefreshCw, AlertCircle
} from "lucide-react";
import apiRequest from "../../lib/apiRequest";
import PropertyCard from "@/components/map/PropertyCard";
import Pagination from "../../components/dashboard/components/Pagination";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { useToast } from "@/components/Userdashboard/toastProvider";

export default function MyPostsPage() {
  const { page, limit, search, sort, updateParams } = usePaginatedQuery();
  const { addToast } = useToast();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest.get("/api/dashboard/my-posts", {
        params: { page, limit, search, sort },
        headers: { "Cache-Control": "no-cache" },
      });
      setPosts(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      setError("فشل تحميل الإعلانات");
      addToast("فشل تحميل الإعلانات", "error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sort, addToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, refreshKey]);

  useEffect(() => {
    if (location.state?.newPost) {
      addToast("تم نشر إعلانك بنجاح!", "success");
      setRefreshKey((prev) => prev + 1);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, addToast]);

  const handleDelete = async (postId) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا الإعلان نهائياً؟")) return;
    try {
      const res = await apiRequest.delete(`/api/dashboard/${postId}`);
      if (res.data.success) {
        addToast("تم حذف الإعلان بنجاح", "success");
        if (posts.length === 1 && page > 1) {
          updateParams({ page: page - 1 });
        } else {
          setRefreshKey((prev) => prev + 1);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || "حدث خطأ أثناء الحذف", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* الترويسة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-white">
            إعلاناتي
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {meta
              ? `إجمالي ${meta.total} إعلان`
              : "إدارة وتعديل العقارات الخاصة بك"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
            title="تحديث القائمة"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            to="/dashboard/add"
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all text-sm"
          >
            <PlusCircle size={18} />
            <span>إعلان جديد</span>
          </Link>
        </div>
      </div>

      {/* حالة التحميل */}
      {loading && posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mb-2" />
          <p className="font-medium text-sm">جاري تحميل إعلاناتك...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 space-y-4">
          <AlertCircle size={48} className="mx-auto text-red-400" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-300">
            حدث خطأ أثناء التحميل
          </h3>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-sm"
          >
            <RefreshCw size={16} /> إعادة المحاولة
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
          <FileText size={48} className="mx-auto text-gray-400" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">
            لا توجد إعلانات عقارية حتى الآن!
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            لم تقم بنشر أي عقار بعد. ابدأ الآن واعرض عقارك للآلاف من المهتمين.
          </p>
          <Link
            to="/dashboard/add"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-gray-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm"
          >
            <PlusCircle size={18} />
            <span>نشر أول إعلان لك</span>
          </Link>
        </div>
      ) : (
        <>
          {/* شبكة عرض الإعلانات باستخدام PropertyCard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} to={`/${post.id}`} className="block">
                <PropertyCard
                  post={post}
                  isOwner={true}
                  onDelete={handleDelete}
                />
              </Link>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="pt-4 flex justify-center">
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                onPageChange={(p) => updateParams({ page: p })}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}