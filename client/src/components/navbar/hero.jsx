import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutTextFlip } from "../ui/layout-text-flip"
import { Highlight } from "../ui/hero-highlight"
import { HoverBorderGradient } from "../ui/hover-border-gradient"
import { InteractiveHoverButton } from "../ui/interactive-hover-button"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"

 /**
 * HeroTemplate - مكون Hero احترافي قابل لإعادة الاستخدام
 * 
 * @param {Array<string>} images - مصفوفة عناوين URL للصور
 * @param {number} interval - الفترة الزمنية بين تغيير الصور (ms) - default: 5000
 * @param {string} title - العنوان الرئيسي
 * @param {string} titleHighlight - الجزء المظلل من العنوان
 * @param {string} subtitle - عنوان فرعي صغير في الأعلى
 * @param {string} description - وصف تحت العنوان
 * @param {Array} buttons - مصفوفة أزرار: [{label, href, variant, onClick}]
 * @param {Array} stats - إحصائيات: [{value, label}]
 * @param {string} className - classes إضافية
 */

export default function HeroTemplate({
    images=[
          "/4.jpg",
          "/3.png",
          "/2.png",
          "/10.png",
          "/8.png",
          "/6.png",
          "/9.png",
          "/5.png",
          "/1.png",

         
  ],
  interval = 10000,
  title = "اعثر على منزل",
  titleHighlight = "أحلامك",
  subtitle = "أفضل العقارات في الجزائر",
  description = "آلاف الإعلانات العقارية للبيع والكراء في جميع الدوائر",
  buttons = [],

  className = "",
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0)
  const isLoggedIn = false; 
  const { isSignedIn, isLoaded } = useAuth();
  const handlePublishClick = (e) => {
   if (!isLoaded) {
      e.preventDefault();
      return;
    }
    
    if (!isSignedIn) {
      e.preventDefault();
      navigate("/sign-in", { state: { from: "/dashboard/add" } });
    }else {
    navigate("/sign-in");          // اذهب إلى صفحة تسجيل الدخول
  }
  };

useEffect(() => {
  const handleScroll = () => setScrollY(window.scrollY)
  window.addEventListener("scroll", handleScroll)
  return () => window.removeEventListener("scroll", handleScroll)
}, [])

  // تبديل الصور تلقائياً
  useEffect(() => {
    if ( images.length <= 1) return

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [images.length, interval])



const elOuedCommunes = [
  "الوادي",
  "الرباح",
  "وادي العلندة",
  "البياضة",
  "النخلة",
  "قمار",
  "كوينين",
  "الرقيبة",
  "الحمراية",
  "تغزوت",
  "الدبيلة",
  "حساني عبد الكريم",
  "حاسي خليفة",
  "طالب العربي",
  "دوار الماء",
  "سيدي عون",
  "الطريفاوي",
  "المقرن",
  "بن قشة",
  "ورماس",
  "العقلة",
  "ميه ونسة"
];
  


  return (
    <div className={`shadow-2xl relative w-full h-screen overflow-hidden  ${className}`}>
      {/* Slides Container */}
      
      <AnimatePresence   mode="wait">
        {images.length > 0 && (
<motion.img
               
               className=" absolute inset-0 w-full h-screen object-cover kenburns-top"
               key={images[currentImageIndex]}
               src={images[currentImageIndex]}
               onError={(e) => { e.currentTarget.src = "/souf.png"; }}
              />
        
        )}
      </AnimatePresence>
 
      <div className=" absolute w-full h-50 top-0  bg-gradient-to-b from-black/100 " />
    

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative sm:h-180 h-160 flex flex-col justify-center items-center text-center text-white px-4 sm:px-6 lg:px-8 py-2"
      >
     
        {/* Title */}
  
  


<div className="" >


  <h1
    style={{
      textShadow: `
      -1px -1px 2 black,
       1px -1px 3 black,
      -1px  1px 6 black,
       1px  1px 5 black
      `
    }}
    className=" text-4xl md:text-5xl font-extrabold flex-col text-white drop-shadow-[7px_10px_5px_rgba(0,0,0,0.6)]  leading-relaxed "
  >   
      إبدأ رحلة البحث عن <span className="text-yellow-400">عقارك </span>  من <span className="text-yellow-400">هنا</span>
  </h1>
 
  

<motion.div
  dir="rtl"
  className="relative font-extrabold mt-5 "
>
  
<div className="flex flex-col md:flex-row justify-center items-center text-md shadow-2xs leading-relaxed">
  
  <Highlight>
    ابحث عن عقارات للبيع والكراء بسهولة، مع خريطة تفاعلية.
    في بلديات{" "}
  </Highlight>

  <LayoutTextFlip words={elOuedCommunes} />

</div>
 
</motion.div>
  
</div>

        {/* Description */}
     


        {/* Buttons */}
       
     <div className="flex justify-center mt-12 items-center  gap-2"> 
 {/* أعدنا استخدام Link وأضفنا له فحص onClick */}
      <Link to="/dashboard/add" onClick={handlePublishClick}>
        <HoverBorderGradient
          containerClassName="rounded-full"
          className="font-semibold cursor-pointer dark:bg-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 dark:text-white flex items-center space-x-2"
        >
          <span>نشر إعلان</span>
        </HoverBorderGradient>
      </Link>
       <InteractiveHoverButton 
       className=" cursor-pointer dark:bg-black bg-black text-white dark:text-white flex items-center space-x-2"
       >تصفح</InteractiveHoverButton>
        </div>




       
      </motion.div>

      {/* Stats */}
      
  
     

  
    </div>
  )
}
 
