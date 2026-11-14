import { useNavigate, useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Maximize2, X } from "lucide-react";
import apiRequest from "../../lib/apiRequest";
import { formatPrice } from "@/lib/formatPrice";
import PostsMap from "@/components/map/PostsMap";
import ImageCarousel from "@/components/carousel-09";
import CommentSection from "@/components/comments/CommentSection";
import Navbar from "@/components/navbar/Navbar";

// ===================== قواميس التسميات (مطابقة لـ PropertyCard.jsx و NewPostPage.jsx) =====================
const PROPERTY_LABELS = {
  apartment: "شقة سكنية",
  residence: "سكنة",
  arabic_house: "حوش عربي / جبس",
  villa: "فيلا",
  building: "عمارة",
  land: "أرض للبناء",
  farm_land: "أرض فلاحية",
  garden: "حويطة",
  shop: "محل تجاري",
  office: "مكتب",
  warehouse: "مستودع / مخزن",
  factory: "مصنع",
  chalet: "شاليه / استراحة",
  farm: "مزرعة",
  other: "أخرى",
};

const CONDITION_LABELS = {
  NEW: "جديد / لم يسكن",
  LIKE_NEW: "حالة جيدة",
  OLD: "قديم",
};

const BUILD_CONDITION_LABELS = {
  FINISHED: "100% مكتمل",
  ALMOST_FINISHED: "شبه مكتمل",
  HALF_FINISHED: "نصف مكتمل",
  STRUCTURE: "هيكل",
  OTHER: "أخرى",
};

const STRUCTURE_LABELS = {
  CONCRETE: "خرسانة مسلحة",
  PLASTER: "جبس",
  MIXED: "مختلط",
};

const RENT_PERIOD_SUFFIX = { daily: "/يوم", monthly: "/شهر", yearly: "/سنة" };
const RENT_PERIOD_LABELS = { daily: "بالأيام", monthly: "بالشهور", yearly: "بالسنوات" };

const DOCUMENT_LABELS = {
  TITLE_DEED: "عقد ملكية",
  LAND_BOOK: "دفتر عقاري",
  building_permit: "رخصة بناء",
  CONFORMITY_CERTIFICATE: "شهادة المطابقة",
  URBAN_CERTIFICATE: "شهادة التعمير",
  NEGATIVE_CERTIFICATE: "شهادة السلبية",
  CUSTOM: "عقد عرفي",
  OTHER: "وثائق أخرى",
};

// ===================== دوال مساعدة (مطابقة لـ PropertyCard.jsx) =====================
const hasValue = (v) => {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim() !== "";
  return true;
};

const isYes = (v) => v === "yes" || v === true || v === "true";

function SinglePage() {
  const [isLoading, setIsLoading] = useState(false);
  const response = useLoaderData();
  const post = response?.data || response;
  const [saved, setSaved] = useState(post?.isSaved);
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);

  const isRent = post?.type === "rent";
  const isBareLand = post?.property === "land" || post?.property === "farm_land";
  const primaryPhone =
    Array.isArray(post?.phones) && post.phones.length > 0
      ? post.phones[0]
      : post?.phone;

  // العنوان: إذا لم يكتب المعلن عنواناً، نعرض "نوع العقار + نوع العملية"
  // بدلاً من ترك العنوان فارغاً (مثال: "شقة سكنية للبيع")
  const propertyLabel = post
    ? PROPERTY_LABELS[post.property] || post.property
    : null;
  const displayTitle = hasValue(post?.title)
    ? post.title
    : propertyLabel
      ? `${propertyLabel} ${isRent ? "للكراء" : "للبيع"}`
      : isRent
        ? "عقار للكراء"
        : "عقار للبيع";

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(primaryPhone || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // يعود الزر لطبيعته بعد ثانيتين
  };

  useEffect(() => {
    if (!post?.id) return;
    apiRequest.post(`/api/posts/${post.id}/view`).catch(() => {});
  }, [post?.id]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 font-bold text-xl">العقار غير موجود</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!isSignedIn) return navigate("/sign-in");
    setIsLoading(true); // تفعيل حالة التحميل
    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      setSaved((prev) => !prev);
      console.log(err);
    } finally {
      setIsLoading(false); // إيقاف حالة التحميل
    }
  };

  // مساحة الأرض/العقار: هكتارات للأراضي الفلاحية، أو طول×عرض لغيرها
  const getAreaValue = () => {
    if (hasValue(post.hectares)) return `${post.hectares} هكتار`;
    if (hasValue(post.length) && hasValue(post.width)) {
      const total = Math.round(Number(post.length) * Number(post.width));
      if (!Number.isNaN(total)) return `${post.length}×${post.width} م² (${total} م²)`;
    }
    return null;
  };

  // قائمة المواصفات السريعة الكاملة — كل بطاقة تُعرض فقط إذا توفرت قيمتها،
  // وبنفس استثناءات الأراضي المطبّقة في PropertyCard.jsx (لا معنى لعرض
  // "عدد الغرف" أو "الطابق" على قطعة أرض فارغة).
  const quickSpecs = [
    { icon: "/utility.webp", title: "نوع العقار", value: propertyLabel },
    {
      icon: "/bed.webp",
      title: "التصميم الداخلي",
      value: !isBareLand && hasValue(post.rooms) ? post.rooms : null,
    },
    {
      icon: "/pet.webp",
      title: "عدد الحمامات",
      value: !isBareLand && hasValue(post.bathrooms) ? `${post.bathrooms}` : null,
    },
    { icon: "/size.webp", title: "المساحة", value: getAreaValue() },
    {
      icon: "/size.webp",
      title: "رقم الطابق",
      value: !isBareLand && hasValue(post.floor) ? `${post.floor}` : null,
    },
    {
      icon: "/utility.webp",
      title: "عدد الطوابق",
      value: !isBareLand && hasValue(post.buildingFloors) ? `${post.buildingFloors}` : null,
    },
    {
      icon: "/size.webp",
      title: "عدد الواجهات",
      value: !isBareLand && hasValue(post.facades) ? `${post.facades}` : null,
    },
    {
      icon: "/utility.webp",
      title: "سنة البناء",
      value: !isBareLand && hasValue(post.constructionYear) ? `${post.constructionYear}` : null,
    },
    {
      icon: "/pet.webp",
      title: "التأثيث",
      value: !isBareLand && isYes(post.furnished) ? "مؤثث" : null,
    },
    {
      icon: "/fee.webp",
      title: "مدة الكراء",
      value: isRent && hasValue(post.rentPeriod) ? RENT_PERIOD_LABELS[post.rentPeriod] || post.rentPeriod : null,
    },
    {
      icon: "/utility.webp",
      title: "حالة العقار",
      value: hasValue(post.propertyCondition)
        ? CONDITION_LABELS[post.propertyCondition] || post.propertyCondition
        : null,
    },
    {
      icon: "/utility.webp",
      title: "حالة البناء",
      value: !isBareLand && hasValue(post.constructionStatus)
        ? BUILD_CONDITION_LABELS[post.constructionStatus] || post.constructionStatus
        : null,
    },
    {
      icon: "/utility.webp",
      title: "بنية العقار",
      value: !isBareLand && hasValue(post.buildingMaterial)
        ? STRUCTURE_LABELS[post.buildingMaterial] || post.buildingMaterial
        : null,
    },
  ].filter((spec) => hasValue(spec.value));

  // شارات المرافق — تُعرض فقط عند توفرها بشكل إيجابي (نفس منطق PropertyCard.jsx):
  // false هنا لا تعني بالضرورة "غير متوفر" بل قد تعني عدم انطباق المفهوم
  // على نوع العقار، فلا نعرض حالة سلبية توحي بمعلومة غير دقيقة.
  const amenities = [
    !isBareLand && isYes(post.garage) ? "كراج متوفر" : null,
    !isBareLand && isYes(post.terrace) ? "تيراس / سطح" : null,
    isYes(post.gas) ? "غاز المدينة" : null,
    isYes(post.electricity) ? "كهرباء متوفرة" : null,
    isYes(post.sewage) ? "صرف صحي" : null,
    !isBareLand && isYes(post.waterTank) ? "خزان أرضي" : null,
  ].filter(Boolean);

  const documents = Array.isArray(post.ownershipDocuments)
    ? post.ownershipDocuments.map((d) => DOCUMENT_LABELS[d] || d)
    : [];

  return (
    
    <div className="flex flex-col lg:flex-row h-full min-h-screen mt-15 bg-gray-50">
        
      
      {/* القسم الرئيسي */}
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <ImageCarousel images={post.images} />

          <div className="p-6 md:p-10">
            {/* بطاقة المعلن */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-8 border border-gray-100">
              <img
                src={post.user?.avatar || "/noavatar.webp"}
                alt="user"
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className=" gap-2">
                <p className="font-bold text-gray-800">
                  {post.user?.username || "مستخدم"}
                </p>

                <p className="text-[14px] text-gray-500 mt-0.5">
                  {(() => {
                    const date = new Date(post.createdAt);
                    const day = date.getDate();
                    const month = date.getMonth() + 1;
                    const year = date.getFullYear();
                    return `${year}-${month}-${day}`;
                  })()}
                </p>
              </div>
            </div>

            {/* العنوان والسعر */}
            <div className="flex justify-between items-start gap-4 mb-8">
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {displayTitle}
                </h1>

                {/* الموقع */}
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                  <img
                    src="/pin.webp"
                    alt="location"
                    className="w-4 h-4 opacity-70"
                  />
                  <span>
                    {[post.neighborhood, post.city].filter(hasValue).join(" - ") || post.city}
                  </span>
                </div>

                {/* زر نسخ الرقم */}
                {hasValue(primaryPhone) && (
                  <div className="flex">
                    <button
                      onClick={handleCopyPhone}
                      className={`mt-8 flex items-center gap-4 px-3 py-1.5 rounded-lg font-bold  transition-all border ${
                        copied
                          ? " text-green-800 font-semibold border-green-200"
                          : " text-gray-600 bg-gray-50 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      <img src="/phone.webp" alt="phone" className="w-4 h-4 " />
                      {copied ? "تم النسخ ! " : primaryPhone}
                    </button>
                  </div>
                )}
              </div>

              <div className="text-2xl font-bold text-lime-700 bg-lime-50 px-4 py-2 rounded-xl border border-lime-100 whitespace-nowrap">
                {formatPrice(post.price)}
                {isRent && post.rentPeriod && (
                  <span className="text-sm font-medium text-lime-600">
                    {RENT_PERIOD_SUFFIX[post.rentPeriod] || ""}
                  </span>
                )}
              </div>
            </div>

            <hr className="border-gray-100 mb-8" />

            {/* الوصف */}
            {hasValue(post.description) && (
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  تفاصيل العقار
                </h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(post.description),
                  }}
                ></div>
              </div>
            )}

            {/* التعليقات — تظهر هنا فقط في سطح المكتب (تحت الوصف مباشرة).
                في الهاتف تظهر لاحقاً أسفل زر "حفظ الإعلان" في القسم الجانبي. */}
            <div className="hidden lg:block">
              <CommentSection postId={post.id} />
            </div>
          </div>
        </div>
      </div>

      {/* القسم الجانبي */}
      <div className="w-full lg:w-[400px] bg-white border-l border-gray-100 p-6 lg:p-8 overflow-y-auto">
        <section className="space-y-8">
          {/* مواصفات سريعة — تعرض الآن كل الحقول المتوفرة من نموذج الإضافة */}
          {quickSpecs.length > 0 && (
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                مواصفات سريعة
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {quickSpecs.map((spec, i) => (
                  <FeatureCard
                    key={i}
                    icon={spec.icon}
                    title={spec.title}
                    value={spec.value}
                  />
                ))}
              </div>
            </div>
          )}

          {/* المرافق المتوفرة */}
          {amenities.length > 0 && (
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                الخدمات المتوفرة
              </h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* الوثائق المتوفرة (لإعلانات البيع فقط) */}
          {!isRent && documents.length > 0 && (
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                الوثائق المتوفرة
              </h3>
              <div className="flex flex-wrap gap-2">
                {documents.map((doc, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100"
                  >
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* رابط الفيديو (إن وُجد) */}
          {hasValue(post.video) && (
            <a
              href={post.video}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition"
            >
              مشاهدة فيديو العقار
            </a>
          )}

          {/* الموقع على الخريطة — قسم مستقل بعنوانه الخاص */}
          {hasValue(post.latitude) && hasValue(post.longitude) && (
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-3">
                الموقع الجغرافي
              </h3>
              <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-inner border border-gray-200">
                <PostsMap posts={[post]} />
                <button
                  type="button"
                  onClick={() => setMapExpanded(true)}
                  className="absolute cursor-pointer bottom-3 left-3 z-[400] flex items-center gap-1.5 bg-white text-gray-800 text-xs font-bold px-3 py-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  تكبير الخريطة
                </button>
              </div>
            </div>
          )}

          {/* الأزرار */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
            {hasValue(primaryPhone) && (
              <a
                href={`tel:${primaryPhone}`}
                className="w-full text-center bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-200"
              >
                اتصل الآن
              </a>
            )}
            <button
              disabled={isLoading}
              onClick={handleSave}
              className={`w-full font-bold py-4 rounded-xl border-2 transition ${
                saved
                  ? "bg-orange-100 border-orange-500 text-orange-700"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              {saved ? "تم الحفظ" : "حفظ الإعلان"}
            </button>
          </div>

          {/* التعليقات — نسخة الهاتف فقط، تظهر آخر شيء في الصفحة (بعد زر
              حفظ الإعلان)، بينما نسخة سطح المكتب تظهر تحت الوصف مباشرة */}
          <div className="lg:hidden">
            <CommentSection postId={post.id} />
          </div>
        </section>
      </div>

      {/* نافذة الخريطة بحجم كامل الشاشة */}
      {mapExpanded && (
        <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4 sm:p-8">
          <div className="relative w-full h-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={() => setMapExpanded(false)}
              className="absolute top-4 right-0 mx-3 cursor-pointer hover:bg-gray-100 z-[1001] flex items-center gap-1.5 bg-white text-gray-800 text-sm font-bold px-3 py-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <X className=" w-4 h-4" />
             
            </button>
            <PostsMap posts={[post]} className="h-full" />
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, value }) {
  return (
    <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3 border border-gray-100">
      <img src={icon} alt={title} className="w-5 h-5 opacity-80" />
      <div>
        <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
          {title}
        </p>
        <p className="text-sm font-semibold text-gray-700">{value}</p>
      </div>
    </div>
  );
}

export default SinglePage;