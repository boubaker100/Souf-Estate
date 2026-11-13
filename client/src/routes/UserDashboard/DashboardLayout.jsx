import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

// 1. استدعاء الناف بار الأصلي للموقع بدلاً من هيدر الداشبورد
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "@/components/Userdashboard/sidebar";
import ToastProvider from "@/components/Userdashboard/toastProvider";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        
        {/* 2. وضعنا الناف بار الأصلي هنا في الأعلى مع تثبيته (sticky) */}
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 w-full">
          <Navbar /> 
        </header>

        {/* حاوية السايد بار والمحتوى */}
        <div className="flex flex-1 relative">
          
          <Sidebar 
            setCollapsed={setCollapsed} 
            collapsed={collapsed}  
            role="USER" 
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />

          {/* 🔥 التعديل هنا: 
            قمنا بتغيير lg:mr-20 إلى lg:ml-20 
            وتغيير lg:mr-64 إلى lg:ml-64 
            لكي نترك مساحة فارغة من ناحية اليسار للسايد بار 
          */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* هنا ستظهر صفحات إعلاناتي، أو إضافة إعلان، إلخ */}
                <Outlet />
              </motion.div>
            </main>
          </div>

        </div>
      </div>
    </ToastProvider>
  );
}