import { useState, useEffect, useRef } from "react";
import FilterBar from "../../components/filterBar/FilterBar";
import HeroTemplate from "../../components/navbar/hero";
import PostsListWithMap from "@/components/map/PostsListWithMapLayout";
import apiRequest from "../../lib/apiRequest";
import Footer from "@/components/map/Footer";

const LIMIT = 12; // يقبل القسمة على 2 و3 فلا تظهر فراغات في الشبكة

// تحويل الفلاتر إلى query string مع تجاهل القيم الفارغة
const buildParams = (filters, extra = {}) => {
  const params = new URLSearchParams();
  Object.entries({ ...filters, ...extra }).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.append(key, value);
    }
  });
  return params.toString();
};

function HomePage() {
  const [mapFilters, setMapFilters] = useState({});
  const [page, setPage] = useState(1);

  const [posts, setPosts] = useState([]); // كاردات الصفحة الحالية
  const [pagination, setPagination] = useState(null);
  const [mapPosts, setMapPosts] = useState([]); // كل العقارات المفلترة للخريطة
  const [loading, setLoading] = useState(true);

  const debounceTimer = useRef(null);

  // 1) الكاردات: عند تغيير الفلاتر أو الصفحة
  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const qs = buildParams(mapFilters, { page, limit: LIMIT });
        const res = await apiRequest.get(`/api/posts?${qs}`);
        if (cancelled) return;
        setPosts(res.data?.data || []);
        setPagination(res.data?.pagination || null);
      } catch (error) {
        if (cancelled) return;
        console.error(
          "Error fetching posts:",
          error.response?.status,
          error.response?.data || error.message,
        );
        setPosts([]);
        setPagination(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPosts();
    return () => {
      cancelled = true;
    };
  }, [mapFilters, page]);

  // 2) الخريطة: عند تغيير الفلاتر فقط
  useEffect(() => {
    let cancelled = false;

    const fetchMapPosts = async () => {
      try {
        const qs = buildParams(mapFilters, { view: "map" });
        const res = await apiRequest.get(`/api/posts?${qs}`);
        if (!cancelled) setMapPosts(res.data?.data || []);
      } catch (error) {
        if (cancelled) return;
        console.error(
          "Error fetching map posts:",
          error.response?.status,
          error.response?.data || error.message,
        );
        setMapPosts([]);
      }
    };

    fetchMapPosts();
    return () => {
      cancelled = true;
    };
  }, [mapFilters]);

  // تغيير الفلاتر: debounce حتى لا يُرسل طلب مع كل ضغطة مفتاح، ثم الرجوع للصفحة 1
  const handleFilterChange = (newFilters) => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setMapFilters(newFilters);
      setPage(1);
    }, 450);
  };

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">
      <HeroTemplate />

      <section className="w-full p-1 sm:p-8 top-0 z-20 shadow">
        <FilterBar onFilterChange={handleFilterChange} />
      </section>

      <section className="flex-1 w-full">
        <div className="w-full h-auto">
          <PostsListWithMap
            posts={posts}
            mapPosts={mapPosts}
            loading={loading}
            pagination={pagination}
            onPageChange={setPage}
          />
        </div>
      </section>

      <section className="mt-50">
        <Footer />
      </section>
    </div>
  );
}

export default HomePage;