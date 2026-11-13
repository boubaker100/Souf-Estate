import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  PlusCircle
} from "lucide-react";

const userLinks = [
  { to: "/dashboard/add", label: "نشر إعلان جديد", icon: PlusCircle },
  { to: "/dashboard/my-posts", label: "إعلاناتي", icon: FileText },
  { to: "/account", label: "إعدادات الحساب", icon: Settings },
];

const adminLinks = [
  { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { to: "/admin/users", label: "المستخدمين", icon: Users },
  { to: "/admin/posts", label: "الإعلانات", icon: FileText },
];

export default function Sidebar({ role, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const links = role === "ADMIN" ? adminLinks : userLinks;

  const SidebarContent = (
    <motion.aside
      // تغيير اتجاه الحركة من اليسار (-40 بدلاً من 40)
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      // تغيير border-l إلى border-r لأن السايد بار صار يساراً
      className={`h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        <div className="hidden lg:flex items-center justify-between mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
          {!collapsed && (
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
              {role === "ADMIN" ? "لوحة الإدارة" : "القائمة السريعة"}
            </span>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="space-y-1.5">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                    isActive
                      ? "bg-yellow-500 text-gray-900 shadow-sm font-bold"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  }`
                }
              >
                <Icon size={20} className={collapsed ? "mx-auto" : ""} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </motion.aside>
  );

  return (
    <>
      {/* 1. السايد بار للشاشات الكبيرة: تغيير right-0 إلى left-0 */}
      <div className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] z-30">
        {SidebarContent}
      </div>

      {/* 2. السايد بار للموبايل */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* تغيير right-0 إلى left-0 وتعديل x ليفتح من اليسار (-100%) */}
            <motion.div
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 z-50 shadow-2xl p-5 lg:hidden flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <span className="font-bold text-lg text-gray-800 dark:text-white">قائمة التحكم</span>
                <button
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-2 flex-1">
                {links.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                          isActive
                            ? "bg-yellow-500 text-gray-900 font-bold shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`
                      }
                    >
                      <Icon size={22} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}