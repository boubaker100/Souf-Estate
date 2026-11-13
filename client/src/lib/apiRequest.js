import axios from "axios";

const apiRequest = axios.create({
  // لا تستخدم baseURL مطلق، بل اعتمد على الـ proxy
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// معالجة 304 (الكاش) وتحويل استجابات HTML غير المتوقعة
apiRequest.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.startsWith('<!DOCTYPE')) {
      return Promise.reject(new Error("فشل الاتصال – تأكد من تسجيل الدخول"));
    }
    return Promise.reject(error);
  }
);

export default apiRequest;