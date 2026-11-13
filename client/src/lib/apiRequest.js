
import axios from "axios";

const apiRequest = axios.create({
  // في Vercel نستخدم رابط Render، ومحلياً نستخدم Vite Proxy
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// معالجة الاستجابات غير المتوقعة
apiRequest.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response?.data &&
      typeof error.response.data === "string" &&
      error.response.data.startsWith("<!DOCTYPE")
    ) {
      return Promise.reject(
        new Error("فشل الاتصال – تأكد من تسجيل الدخول")
      );
    }

    return Promise.reject(error);
  }
);

export default apiRequest;
