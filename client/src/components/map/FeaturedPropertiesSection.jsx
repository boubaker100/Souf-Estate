import { motion } from "framer-motion"
import { Star, ArrowRight, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { getImageUrl } from "@/lib/getImageUrl"
import { formatPrice } from "@/lib/formatPrice"

export default function FeaturedPropertiesSection({ properties = [] }) {
  // أفضل العقارات (يمكن الحصول عليها من API أو بناءً على التقييم)
  const featuredProps = properties.slice(0, 6)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
    hover: {
      y: -10,
      transition: { duration: 0.3 },
    },
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* الرأس */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold text-sm">الأكثر طلباً</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            أفضل العقارات
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اختر من بين أفضل العقارات المتاحة والمختارة بعناية لتحصل على أفضل سعر وموقع
          </p>
        </motion.div>

        {/* الكاردات */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {featuredProps && featuredProps.length > 0 ? (
            featuredProps.map((property, index) => (
              <motion.div
                key={property.id}
                variants={cardVariants}
                whileHover="hover"
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* الصورة */} 
                <div className="relative h-56 bg-gradient-to-br from-gray-300 to-gray-400 overflow-hidden">
                  <img
                    src={getImageUrl(property.images)}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = "/souf.webp"; }}
                  />

                  {/* النجمة الذهبية */}
                  <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 rounded-full p-3 shadow-lg">
                    <Star className="w-5 h-5 fill-current" />
                  </div>

                  {/* التصنيف */}
                  <div className="absolute bottom-4 left-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* المحتوى */}
                <div className="p-6 space-y-4">
                  {/* السعر والنوع */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-3xl font-bold text-yellow-600">
                        {formatPrice(property.price)}
                      </p>
                      {property.type === "rent" && (
                        <p className="text-sm text-gray-500">
                          {property.rentPeriod === "daily"
                            ? "/يوم"
                            : property.rentPeriod === "monthly"
                            ? "/شهر"
                            : "/سنة"}
                        </p>
                      )}
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                      {property.type === "rent" ? "كراء" : "بيع"}
                    </div>
                  </div>

                  {/* العنوان */}
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {property.title}
                  </h3>

                  {/* الموقع */}
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    📍 {property.municipality || property.city}
                  </p>

                  {/* المواصفات السريعة */}
                  <div className="flex gap-2 flex-wrap">
                    {property.rooms && (
                      <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {property.rooms} غرفة
                      </span>
                    )}
                    <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {property.furnished === "true" ? "مجهزة" : "غير مجهزة"}
                    </span>
                  </div>

                  {/* الزر */}
                  <Link
                    to={`/${property.id}`}
                    className="block w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-xl transition-all duration-300 text-center flex items-center justify-center gap-2 group/btn"
                  >
                    عرض التفاصيل
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">لم تتوفر عقارات مميزة في الوقت الحالي</p>
            </div>
          )}
        </motion.div>

        {/* الزر الأسفل */}
        {featuredProps && featuredProps.length > 0 && (
          <motion.div variants={itemVariants} className="text-center">
            <Link to="/posts">
              <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold px-8 py-3 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all">
                عرض جميع العقارات
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            </Link>
          </motion.div>
        )}

        {/* الإحصائيات في الأسفل */}
        <motion.div
          variants={itemVariants}
          className="mt-16 bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 border border-yellow-200 rounded-2xl p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600">+500</p>
              <p className="text-gray-600 mt-2">عقار مسجل</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600">+1000</p>
              <p className="text-gray-600 mt-2">عملية شراء ناجحة</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600">100%</p>
              <p className="text-gray-600 mt-2">ثقة المستخدمين</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600">24/7</p>
              <p className="text-gray-600 mt-2">دعم العملاء</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}