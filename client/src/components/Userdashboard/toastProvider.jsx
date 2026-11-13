import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", ttl = 4000) => {
    const id = Math.random().toString(36).slice(2, 9);
    const toast = { id, message, type };
    setToasts((t) => [toast, ...t]);

    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, ttl);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full px-4 py-3 rounded-lg shadow-lg border flex items-start gap-3 ${
              t.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-white dark:bg-gray-800 border-gray-200"
            }`}
          >
            <div className="flex-1">
              <div className="text-sm font-medium">{t.type === "error" ? "خطأ" : "نجاح"}</div>
              <div className="text-sm mt-1 leading-tight">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="close"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
