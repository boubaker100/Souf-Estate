import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  FileText,
  BookOpen,
  Stamp,
  ShieldCheck,
  MapPin,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react"

// ===================== محتوى الصفحة =====================
// المصادر: القانون المدني الجزائري (المادة 324 مكرر — الشكل الرسمي إجباري
// لنقل الملكية العقارية)، القانون رقم 06-02 المتعلق بتنظيم مهنة الموثق،
// المرسوم 76-63 المتضمن تأسيس السجل العقاري، وممارسات مكاتب التوثيق
// ومحافظات الشهر العقاري في الجزائر.

const coreDocuments = [
  {
    icon: BookOpen,
    title: "الدفتر العقاري",
    description:
      "السند الرسمي الذي تسلّمه المحافظة العقارية لإثبات حق الملكية، ويصدر في المناطق التي أُنجز فيها مسح الأراضي (المناطق «الممسوحة»). هو أقوى إثبات ملكية موجود.",
  },
  {
    icon: FileText,
    title: "عقد الملكية المشهر",
    description:
      "في المناطق غير الممسوحة بعد، يعتمد إثبات الملكية على عقد رسمي (موثّق) مسجَّل ومشهر لدى المحافظة العقارية، وليس عقداً عرفياً غير مشهر.",
  },
  {
    icon: MapPin,
    title: "شهادة الحيازة",
    description:
      "تُسلَّم في المناطق التي لم يُنجز فيها مسح الأراضي بعد ولم تُسجَّل، وتثبت حيازة الشخص أو استغلاله للعقار بانتظار تسوية الوضعية القانونية الكاملة.",
  },
  {
    icon: ShieldCheck,
    title: "شهادة السلبية",
    description:
      "تُثبت خلوّ العقار من أي رهن أو معارضة أو تحفظ قانوني. مهمة جداً خصوصاً عند شراء أرض، للتأكد أن لا نزاع أو دين مسجَّل عليها.",
  },
  {
    icon: Building2,
    title: "شهادة المطابقة",
    description:
      "تُثبت أن البناء أُنجز طبقاً لرخصة البناء الممنوحة والمخططات المصادق عليها. تُطلب من مصلحة التعمير بالبلدية، وضرورية لأي بناء حديث.",
  },
  {
    icon: FileText,
    title: "رخصة البناء",
    description:
      "الوثيقة التي تثبت أن البناء أُقيم بترخيص رسمي من البلدية. غيابها قد يعرّض المشتري لاحقاً لمشاكل قانونية تتعلق بمشروعية البناء نفسه.",
  },
]

const partiesDocuments = [
  {
    role: "على البائع تجهيزه",
    items: [
      "سند الملكية (دفتر عقاري أو عقد موثّق مشهر أو شهادة حيازة)",
      "بطاقة التعريف الوطنية سارية المفعول",
      "شهادة الحالة المدنية الحديثة",
      "شهادة السلبية (عدم الرهن أو النزاع)",
      "شهادة المطابقة ورخصة البناء (للبنايات)",
      "وصل تسديد الرسوم العقارية السنوية",
      "موافقة الشريك/الورثة في حال الملكية المشتركة",
    ],
  },
  {
    role: "على المشتري تجهيزه",
    items: [
      "بطاقة التعريف الوطنية سارية المفعول",
      "شهادة الحالة المدنية",
      "إثبات مصدر الأموال إن طلبه الموثق (للمبالغ الكبيرة)",
      "شهادة عدم الاستفادة من سكن سابق (في بعض حالات السكن الاجتماعي)",
    ],
  },
]

const steps = [
  {
    title: "التحقق من الوضعية القانونية للعقار",
    description:
      "قبل أي التزام، تحقق من وجود دفتر عقاري أو عقد ملكية مشهر باسم البائع، واطلب شهادة سلبية حديثة من المحافظة العقارية للتأكد من خلوّه من الرهون والنزاعات.",
  },
  {
    title: "الاتفاق المبدئي (اختياري)",
    description:
      "قد يوقّع الطرفان وعداً بالبيع أو عربوناً لدى الموثق لتثبيت الاتفاق على السعر والشروط، لكن هذا لا يُعتبر نقلاً للملكية بحد ذاته.",
  },
  {
    title: "تحرير العقد لدى الموثق",
    description:
      "بيع العقار في الجزائر يجب أن يكون في شكل رسمي إلزاماً (المادة 324 مكرر من القانون المدني)، وإلا كان العقد باطلاً. العقد العرفي وحده لا ينقل الملكية ولا يحمي المشتري قانونياً.",
  },
  {
    title: "التسجيل والشهر العقاري",
    description:
      "بعد توقيع العقد، يودعه الموثق لدى مصلحة التسجيل لتسديد رسوم التسجيل، ثم لدى المحافظة العقارية لإشهاره. الملكية الكاملة والنهائية لا تنتقل فعلياً إلا بعد إتمام إجراء الشهر العقاري.",
  },
  {
    title: "استلام نسخة العقد النهائي",
    description:
      "بعد إتمام الشهر، يستلم المشتري نسخته من العقد الموثّق والمشهر، وهو السند الذي يثبت ملكيته النهائية للعقار.",
  },
]

const faqs = [
  {
    q: "هل العقد العرفي (بدون موثق) يحمي المشتري؟",
    a: "لا. القانون الجزائري يشترط الشكل الرسمي لأي عقد ينقل ملكية عقارية، تحت طائلة البطلان. العقد العرفي وحده لا يكفي لإثبات الملكية ولا يحمي المشتري في حال نزاع.",
  },
  {
    q: "من يتحمل مصاريف الموثق، البائع أم المشتري؟",
    a: "العرف السائد في الجزائر أن المشتري هو من يتحمل غالبية أتعاب ومصاريف التوثيق والتسجيل، ما لم يتفق الطرفان على خلاف ذلك صراحة في العقد.",
  },
  {
    q: "ماذا لو اختلفت المساحة الفعلية عن المساحة المذكورة في الدفتر العقاري؟",
    a: "يُنصح بطلب معاينة ميدانية أو مسح مساحي قبل التوقيع، وإثارة أي فرق مع الموثق قبل إتمام العقد، لأن الفرق قد يؤثر على السعر وقد يستوجب تصحيح الوثائق الرسمية أولاً.",
  },
  {
    q: "هل يمكن شراء أرض بدون دفتر عقاري؟",
    a: "نعم في بعض الحالات، إذا كانت المنطقة غير ممسوحة بعد، ويُعتمد حينها على شهادة الحيازة أو عقد ملكية مشهر، لكن ينصح بشدة بطلب شهادة سلبية والتأكد من عدم وجود نزاع على الأرض قبل الشراء.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function DocumentsGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white pt-28 pb-16 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <span className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 text-sm font-bold px-4 py-1.5 rounded-full border border-yellow-400/20 mb-4">
            <Stamp className="w-4 h-4" />
            دليل قانوني
          </span> 
          <h1 className="text-3xl not-first:mt-8  md:text-5xl font-extrabold flex  leading-normal text-gray-100 mb-4">
            الوثائق والإجراءات القانونية لبيع وشراء العقار في الجزائر
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            دليل مبسّط للوثائق المطلوبة والخطوات الرسمية عند التعامل في العقار، لحماية حقوقك قانونياً وتفادي النصب.
          </p>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* تنبيه هام */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-5"
        >
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 mb-1">هذا الدليل للتوعية العامة فقط</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              المعلومات هنا تعريفية ولا تغني عن استشارة موثق (كاتب عدل) مرخّص أو محامٍ مختص، فالإجراءات قد تختلف
              حسب طبيعة العقار وولاية إنجازه. تحقق دائماً من آخر التحديثات القانونية قبل اتخاذ أي قرار.
            </p>
          </div>
        </motion.div>

        {/* الوثائق الأساسية */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-12 t">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">الوثائق الأساسية لإثبات الملكية</h2>
            <p className="text-gray-600">
              أي معاملة عقارية جادة تبدأ بالتحقق من هذه الوثائق قبل الاتفاق على أي مبلغ.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {coreDocuments.map((doc, i) => {
              const Icon = doc.icon
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{doc.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{doc.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* وثائق كل طرف */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            ماذا يحتاج كل طرف؟
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partiesDocuments.map((party, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
              >
                <h3 className="font-bold text-gray-900 text-lg mb-4 pb-3 border-b border-gray-100">{party.role}</h3>
                <ul className="space-y-3">
                  {party.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* خطوات المعاملة */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">خطوات المعاملة الرسمية</h2>
            <p className="text-gray-600">
              القانون الجزائري يشترط الشكل الرسمي (التوثيق) لنقل ملكية العقار، ولا يكفي الاتفاق الشفهي أو العقد العرفي.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute right-5 top-2 bottom-2 w-0.5 bg-gray-200 hidden sm:block" />
            <div className="space-y-6">
              {steps.map((step, i) => (
                <motion.div key={i} variants={itemVariants} className="relative flex items-start gap-5">
                  <div className="hidden sm:flex w-11 h-11 rounded-full bg-gray-900 text-white items-center justify-center font-bold flex-shrink-0 z-10">
                    {i + 1}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-1.5">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* الأسئلة الشائعة */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            أسئلة شائعة
          </motion.h2>

          <div className="space-y-4">
            {faqs.map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
              >
                <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* دعوة للعمل */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-900 rounded-2xl p-8 sm:p-10 text-center text-white"
        >
          <h2 className="text-2xl font-bold mb-3">جاهز للبحث عن عقارك؟</h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            تصفّح إعلانات العقارات المتوفرة الآن، وتأكد دائماً من مطابقة الوثائق المذكورة في الإعلان لما ذُكر في هذا الدليل.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors"
          >
            تصفّح الإعلانات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}