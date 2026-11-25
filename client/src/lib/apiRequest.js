import axios from "axios";

const apiRequest = axios.create({
  // في Vercel نستخدم رابط Render، ومحلياً نستخدم Vite Proxy
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

// ✅ إضافة Clerk Bearer Token لكل طلب
apiRequest.interceptors.request.use(
  async (config) => {
    try {
      if (typeof window !== "undefined" && window.Clerk?.session) {
        const token = await window.Clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.warn("Failed to attach Clerk token:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// معالجة الاستجابات غير المتوقعة
apiRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.data &&
      typeof error.response.data === "string" &&
      error.response.data.startsWith("<!DOCTYPE")
    ) {
      return Promise.reject(new Error("فشل الاتصال – تأكد من تسجيل الدخول"));
    }
    return Promise.reject(error);
  }
);

export default apiRequest;