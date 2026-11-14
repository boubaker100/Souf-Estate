import { useState } from "react";
import { Menu, Bell, Sun, Moon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";

export default function DashboardHeader({ role, onMenuClick }) {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-white dark:bg-gray-900 shadow-md flex  items-center justify-between px-4 lg:px-8"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-lg font-semibold hidden sm:block">
          {role === "ADMIN" ? "لوحة تحكم الأدمن" : "لوحة التحكم"}
        </h1>
      </div>

      {/* Center - Search */}
      <div className="hidden md:block w-1/3">
        <input
          type="text"
          placeholder="بحث..."
          className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <button className="relative" aria-label="الnotifications">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            3
          </span>
        </button>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} aria-label="تبernel المظهر">
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User */}
        <UserButton afterSignOutUrl="/" />
      </div>
    </motion.header>
  );
}
