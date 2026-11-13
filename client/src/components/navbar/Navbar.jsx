import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { useUser, useClerk } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [showFixedNavbar, setShowFixedNavbar] = useState(false)

  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const location = useLocation()

  const dropdownRef = useRef(null)
  // تم عكس المنطق: بدل التعامل الخاص مع صفحة الداشبورد فقط (وترك كل
  // الصفحات الأخرى تتصرف كالرئيسية الشفافة)، أصبحنا نتعامل بشكل خاص مع
  // الصفحة الرئيسية فقط. أي صفحة أخرى غير الرئيسية (بما فيها الداشبورد
  // وأي صفحة جديدة تُضاف لاحقاً) تحصل تلقائياً على النافبار الثابت/البلور
  // من أول لحظة، دون الحاجة لإضافتها يدوياً في كل مرة.
  const isHomePage = location.pathname === "/"

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setShowFixedNavbar(true)
      } else {
        setShowFixedNavbar(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "دليل الوثائق", href: "/documents-guide" },
    { label: "تواصل معنا", href: "/contact" },
  ]

  const closeSidebar = () => setMobileMenuOpen(false)
  const closeProfileMenu = () => setProfileMenuOpen(false)

  const sidebarVariants = {
    hidden: { opacity: 0, x: 400 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: 400, transition: { duration: 0.3, ease: "easeIn" } },
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const menuItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  }

  const NavbarContent = ({ isFixed }) => (
    <div className="max-w-8xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between h-12">
        <div className="flex shrink-0">
          <Link to="/" className="flex items-center h-10">     
            {isFixed ?  <img src="../../../LOGO4.png" className="w-auto h-full" alt="Logo" /> 
            :            <img src="../../../LOGO3.png" className="w-auto h-full" alt="Logo" /> }
          </Link>
        </div>

        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Button
                  variant="ghost"
                  className={`text-md  font-bold transition-colors ${
                    isFixed ? "text-gray-900 hover:bg-gray-100" : "text-white hover:bg-yellow-500/50 cursor-pointer"
                  }`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isSignedIn ? (
             <div className="hidden md:block relative" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-black/5 transition-colors focus:outline-none"
                >
                    <img 
                      src={user?.imageUrl} 
                      alt={user?.firstName || "Profile"} 
                      className="w-8 h-8 rounded-full border-2 transform-stroke transition-all  border-yellow-400 object-cover" 
                    />
                    <span className={`hidden lg:inline text-sm font-medium ${isFixed ? "text-gray-900" : "text-white"}`}>
                        {user?.firstName}
                    </span>
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 rtl:left-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-[100] text-gray-800 dark:text-gray-200 origin-top-right rtl:origin-top-left"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">مسجل بواسطة</p>
                        <p className="text-sm font-bold truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                      </div>

                      <Link 
                        to="/dashboard" 
                        onClick={closeProfileMenu}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <LayoutDashboard size={16} className="text-yellow-500" />
                        <span>لوحة التحكم</span>
                      </Link>

                      <Link 
                        to="/account" 
                        onClick={closeProfileMenu}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User size={16} className="text-blue-500" />
                        <span>الملف الشخصي</span>
                      </Link>

                      <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                        <button
                          onClick={() => {
                            signOut()
                            closeProfileMenu()
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>تسجيل الخروج</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          ) : (
            <div className="hidden lg:flex gap-2">
              <Link to="/sign-in">
                <Button variant="outline"  size="sm" className={` transition-all ${isFixed ?  "text-gray-900 bg-white/50 border-gray-300" : "text-white hover:text-white border-white hover:bg-white/50 "} text-[14px]`}>
                 تسجيل دخول
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm" className="text-[14px] border-2 border-white bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold">
                 تسجيل حساب
                </Button>
              </Link>
            </div>
          )}
          
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className={isFixed ? "text-gray-900" : "text-white"} />
          </button>
        </div>
      </div>
    </div>
  )

  // على الصفحة الرئيسية: يبدأ شفافاً ويتحول لبلور/ثابت فقط بعد السكرول.
  // على أي صفحة أخرى (بما فيها الداشبورد): يظهر بلور/ثابت من أول لحظة.
  const isCurrentlyFixed = showFixedNavbar || !isHomePage

  return (
    <>
      {isHomePage && (
        <nav className="absolute top-1 left-0 right-0 z-30 w-full py-0 bg-transparent">
          <NavbarContent isFixed={false} />
        </nav>
      )}

      <AnimatePresence>
        {isCurrentlyFixed && (
          <motion.nav
            initial={!isHomePage ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 z-50 w-full py-0 bg-white/30 backdrop-blur shadow-md border-b border-gray-200"
          >
            <NavbarContent isFixed={true} />
          </motion.nav>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial="hidden" animate="visible" exit="exit" variants={backdropVariants} 
              onClick={() => setMobileMenuOpen(false)} 
              className="fixed inset-0 bg-black/60 z-[60] lg:hidden" 
            />
            <motion.div 
              initial="hidden" animate="visible" exit="exit" variants={sidebarVariants} 
              className="fixed right-0 top-0 bottom-0 w-64 bg-gray-900 z-[70] lg:hidden overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-white font-bold">القائمة</h3>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white"><X className="w-6 h-6" /></button>
              </div>
              <div className="py-4 space-y-2 px-4">
                {navLinks.map((link, idx) => (
                  <motion.div key={link.href} custom={idx} initial="hidden" animate="visible" variants={menuItemVariants}>
                    <Link to={link.href} onClick={closeSidebar}>
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-yellow-400/20 hover:text-yellow-400">
                        {link.label}
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="border-t border-white/10 p-4 mt-4">
                {isSignedIn ? (
                   <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg text-white">
                      <img src={user?.imageUrl} className="w-10 h-10 rounded-full border border-yellow-400 object-cover" alt="" />
                      <div className="truncate"><p className="font-bold">{user?.firstName}</p></div>
                    </div>
                    <Link to="/dashboard" onClick={closeSidebar}>
                       <Button variant="outline" className="w-full text-white border-white/20">لوحة التحكم</Button>
                    </Link>
                    <Link to="/account" onClick={closeSidebar}>
                       <Button variant="outline" className="w-full text-white border-white/20">الملف الشخصي</Button>
                    </Link>
                    <Button variant="destructive" className="w-full" onClick={() => { signOut(); setMobileMenuOpen(false); }}>خروج</Button>
                   </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/sign-in" onClick={closeSidebar}><Button className="w-full border-white/20 text-white bg-transparent font-bold">تسجيل دخول</Button></Link>
                    <Link to="/sign-up" onClick={closeSidebar}><Button className="w-full bg-yellow-400 text-black font-bold">تسجيل حساب</Button></Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}