import { SignIn } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

function SignInPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const interval = 10000;

  // تم تصحيح مسارات الصور لتشير إلى مجلد public بشكل صحيح
  const images = [
    "/4.webp",
    "/3.webp",
    "/2.webp",
    "/10.webp",
    "/8.webp",
    "/6.webp",
    "/9.webp",
    "/5.webp",
    "/1.webp",
  ];

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    // أضفنا relative و overflow-hidden للحاوية الرئيسية
    <div className="relative flex justify-center items-center min-h-screen bg-gray-100 overflow-hidden"> 
      
      {/* 1. طبقة الصورة الخلفية (z-0) */}
      <AnimatePresence mode="wait">
        {images.length > 0 && (
          <motion.img
            key={images[currentImageIndex]}
            src={images[currentImageIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full object-cover z-0"
            onError={(e) => { e.currentTarget.src = "/souf.webp"; }}
          />
        )}
      </AnimatePresence>

      {/* 2. طبقة التدرج اللوني (z-0) */}
      <div className="absolute w-full h-50 top-0 bg-gradient-to-b from-black/80 to-transparent z-0" />

      {/* 3. طبقة كارد تسجيل الدخول (رفعنا الطبقة باستخدام relative و z-10) */}
      <div className="relative z-10">
        <SignIn 
          routing="path" 
          path="/sign-in" 
          fallbackRedirectUrl="/" 
        />
      </div>

    </div>
  );
}

export default SignInPage;