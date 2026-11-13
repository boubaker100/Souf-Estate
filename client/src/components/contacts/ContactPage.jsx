import { motion } from "framer-motion"
import { Mail, Phone, MessageCircle, Facebook, Clock, MapPin } from "lucide-react"

// ===================== معلومات التواصل =====================
// ⚠️ عدّل القيم التالية ببياناتك الحقيقية قبل النشر:
const CONTACT_EMAIL = "contact@example.com" // عدّل هذا بإيميلك الحقيقي
const WHATSAPP_NUMBER = "213500000000" // بصيغة دولية بدون + أو 0 في البداية (مثال جزائري: 2136XXXXXXXX)
const WHATSAPP_DISPLAY = "+213 500 00 00 00" // نفس الرقم لكن بصيغة معروضة للقراءة
const FACEBOOK_URL = "https://facebook.com/yourpage" // عدّل برابط صفحتك الحقيقي

const contactMethods = [
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    description: "للاستفسارات العامة أو الشراكات، نرد عادة خلال 24 ساعة",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: MessageCircle,
    title: "واتساب",
    value: WHATSAPP_DISPLAY,
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    description: "أسرع طريقة للتواصل المباشر، خصوصاً بخصوص إعلان معيّن",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Facebook,
    title: "فيسبوك",
    value: "تابعنا على صفحتنا",
    href: FACEBOOK_URL,
    description: "آخر العروض والإعلانات الجديدة والتحديثات",
    color: "bg-indigo-50 text-indigo-600",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* رأس الصفحة */}

    <div className="relative bg-black text-white pt-28 pb-16 px-4 sm:px-6 overflow-hidden">
      {/* الصورة كخلفية */}
      <img
        src="/2.png"
        alt="Contact"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* طبقة تعتيم لتحسين قراءة النص */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* المحتوى */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <span className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 text-sm font-bold px-4 py-1.5 rounded-full border border-yellow-400/20 mb-4">
          <Phone className="w-4 h-4" />
          تواصل معنا
        </span>

        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-white">
          نحن هنا لمساعدتك
        </h1>

        <p className="text-gray-200 text-lg max-w-xl mx-auto">
          سواء عندك سؤال، اقتراح، أو تحتاج مساعدة بخصوص إعلان، تواصل معنا عبر أي من الطرق التالية.
        </p>
      </motion.div>
    </div>


      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        {/* طرق التواصل */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14"
        >
          {contactMethods.map((method, i) => {
            const Icon = method.icon
            return (
              <motion.a
                key={i}
                href={method.href}
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all text-center"
              >
                <div className={`w-14 h-14 rounded-2xl ${method.color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{method.title}</h3>
                <p className="text-sm font-semibold text-gray-700 mb-2" dir="ltr">
                  {method.value}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">{method.description}</p>
              </motion.a>
            )
          })}
        </motion.div>

        {/* معلومات إضافية */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          >
            <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 mb-1">أوقات الرد</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                من السبت إلى الخميس، من 9 صباحاً إلى 8 مساءً (بتوقيت الجزائر)
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          >
            <MapPin className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 mb-1">منطقة الخدمة</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                  إعلانات العقارات في ولاية الوادي وبلدياتها
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}