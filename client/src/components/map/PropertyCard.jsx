import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { ar } from "date-fns/locale";
import {
  MapPin,
  Phone,
  Home,
  Bed,
  Ruler,
  Heart,
  Share2,
  Clock,
  Activity,
  Edit,
  Trash2,
  Sofa,
  Car,
  Flame,
  Building2,
  Layers,
  Compass,
  CalendarDays,
  Sun,
  PlayCircle,
  Images,
  ChevronRight,
  ChevronLeft,
  Zap,
  Droplets,
} from "lucide-react";

// ===================== قواميس التسميات =====================
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

const RENT_PERIOD_SUFFIX = { daily: "/يوم", monthly: "/شهر", yearly: "/سنة" };

// ===================== دوال مساعدة =====================
const hasValue = (v) => {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim() !== "";
  return true;
};

const isYes = (v) => v === "yes" || v === true || v === "true";

const formatDZD = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "0";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const getAreaLabel = (post) => {
    if (hasValue(post.hectares)) return `${post.hectares} هكتارات`;
  if (hasValue(post.length) && hasValue(post.width)) {
    const total = Math.round(Number(post.length) * Number(post.width));
    if (!Number.isNaN(total))
      return `${total} م² (${post.length}×${post.width})`;
  }
  return null;
};

// كل عنصر في هذه الشبكة له عنوان صريح (label) فوق القيمة كي لا يبقى المستخدم
// حائراً بمعنى قيمة مثل "حالة جيدة" أو "F3" بدون سياق.
// ملاحظة: تم حذف "حالة العقار"، "عدد الحمامات"، "بنية العقار"، "الخزان الأرضي"،
// "رابط الفيديو" و "الوثائق" من هذا الكارد المبسّط بطلب من صاحب المنتج،
// على أن تبقى متاحة في صفحة تفاصيل العقار الكاملة.
export default function PropertyCard({ post, isOwner = false, onDelete }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    post.images && post.images.length > 0
      ? post.images
      : ["https://placehold.co/600x400?text=No+Image"];
  const isRent = post.type === "rent";
  const primaryPhone =
    Array.isArray(post.phones) && post.phones.length > 0
      ? post.phones[0]
      : post.phone;

  // تاريخ النشر
  let postedLabel = null;
  let exactDateLabel = null;
  if (hasValue(post.createdAt)) {
    const date = new Date(post.createdAt);
    if (!Number.isNaN(date.getTime())) {
      postedLabel = formatDistanceToNowStrict(date, {
        addSuffix: true,
        locale: ar,
      });
      exactDateLabel = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
  }

  // الأراضي (أرض للبناء / أرض فلاحية) لا تملك مفهوم "غرف" أو "طوابق" أو
  // "واجهات" بالمعنى المعماري، حتى لو وصلت قيمة رقمية بالخطأ من قاعدة
  // البيانات (كما حصل مع facades هنا). نخفي هذه الحقول دائماً لهذا النوع
  // من العقارات بدل الاعتماد فقط على وجود القيمة.
  const isBareLand = post.property === "land" || post.property === "farm_land";

  // شبكة المواصفات الأساسية — كل عنصر بعنوان واضح، تُعرض فقط عند توفر قيمتها
  const coreSpecs = [
    {
      icon: Home,
      label: "نوع العقار",
      value: hasValue(post.property)
        ? PROPERTY_LABELS[post.property] || post.property
        : null,
    },
    {
      icon: Bed,
      label: "عدد الغرف",
      value: !isBareLand && hasValue(post.rooms) ? post.rooms : null,
    },
    {
      icon: Layers,
      label: "رقم الطابق",
      value: !isBareLand && hasValue(post.floor) ? `${post.floor}` : null,
    },
    {
      icon: Building2,
      label: "عدد الطوابق",
      value:
        !isBareLand && hasValue(post.buildingFloors)
          ? `${post.buildingFloors}`
          : null,
    },
    {
      icon: Compass,
      label: "عدد الواجهات",
      value: !isBareLand && hasValue(post.facades) ? `${post.facades}` : null,
    },
    { icon: Ruler, label: "المساحة", value: getAreaLabel(post) },

    {
      icon: CalendarDays,
      label: "سنة البناء",
      value:
        !isBareLand && hasValue(post.constructionYear)
          ? `${post.constructionYear}`
          : null,
    },
  ]
    .filter((spec) => hasValue(spec.value))
    .slice(0, 6);

  // شارات المرافق — تُعرض فقط إذا كانت القيمة إيجابية (المرفق متوفر فعلاً).
  // لا نعرض شارة "غير متوفر" عندما تكون القيمة false، لأن false قد تعني
  // ببساطة أن الحقل لا ينطبق على نوع هذا العقار (مثلاً: أرض للبيع ليس لها
  // "تيراس" أو "غاز مدينة" أو "كراج" بالمعنى المنطقي)، وليس بالضرورة أن
  // المرفق مفقود فعلياً. عرض شارات سلبية في هذه الحالة يعطي انطباعاً
  // مضللاً وغير منطقي.
  const amenityChips = [
    !isBareLand && isYes(post.furnished) ? { icon: Sofa, text: "مؤثثة" } : null,
    !isBareLand && isYes(post.garage) ? { icon: Car, text: "كراج متوفر" } : null,
    isYes(post.gas) ? { icon: Flame, text: "غاز المدينة" } : null,
    !isBareLand && isYes(post.terrace) ? { icon: Sun, text: "تيراس / سطح" } : null,
    isYes(post.electricity) ? { icon: Zap, text: "كهرباء متوفرة" } : null,
    isYes(post.sewage) ? { icon: Droplets, text: "صرف صحي" } : null,
  ].filter(Boolean);

  // نظام الألوان: "كراء" = أخضر (يطابق مؤشرات الخريطة)، "بيع" = أزرق.
  const theme = {
    badge: isRent ? "bg-emerald-600 text-white" : "bg-blue-600 text-white",
    priceText: isRent
      ? "from-emerald-700 to-emerald-600"
      : "from-blue-700 to-blue-600",
    pinIcon: isRent ? "text-emerald-600" : "text-blue-600",
    specIcon: isRent ? "text-emerald-700" : "text-blue-700",
    detailBtn: isRent
      ? "hover:bg-emerald-600 hover:text-white"
      : "hover:bg-blue-600 hover:text-white",
  };

  const goToImage = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const nextImage = (e) =>
    goToImage(e, (currentImageIndex + 1) % images.length);
  const prevImage = (e) =>
    goToImage(e, (currentImageIndex - 1 + images.length) % images.length);

  const ImageTag = isOwner ? "div" : Link;
  const imageTagProps = isOwner ? {} : { to: `/${post.id}` };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-200 flex flex-col justify-between h-full"
    >
      {/* 1. قسم الصور */}
      <ImageTag
        {...imageTagProps}
        className="relative h-56 bg-gray-100 overflow-hidden group block"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt={post.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            {/* مناطق لمس شفافة كاملة الارتفاع للتنقل بالنقر على جانبَي الصورة */}
            <button
              type="button"
              aria-label="الصورة السابقة"
              onClick={prevImage}
              className="absolute inset-y-0 right-0 w-1/3 z-[5]"
            />
            <button
              type="button"
              aria-label="الصورة التالية"
              onClick={nextImage}
              className="absolute inset-y-0 left-0 w-1/3 z-[5]"
            />

            {/* أسهم مرئية واضحة فوق مناطق اللمس، تظهر دائماً على الهاتف وبتأثير hover على سطح المكتب */}
            <button
              type="button"
              aria-label="الصورة السابقة"
              onClick={prevImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/45 text-white backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="الصورة التالية"
              onClick={nextImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/45 text-white backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}

        <div className="absolute top-3 right-3 z-20">
          <span
            className={`${theme.badge} px-3 py-1.5 rounded-full text-xs font-black shadow-md flex items-center gap-1 transition-colors duration-300`}
          >
            <Activity className="w-3.5 h-3.5" />
            {isRent ? "كراء" : "بيع"}
          </span>
        </div>

        {hasValue(post.video) && (
          <a
            href={post.video}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2.5 right-3 z-20 flex items-center gap-1 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" /> فيديو
          </a>
        )}

        {images.length > 1 &&
          (images.length <= 8 ? (
            <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`صورة ${i + 1}`}
                  onClick={(e) => goToImage(e, i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentImageIndex
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
              <Images className="w-3.5 h-3.5" />
              {currentImageIndex + 1}/{images.length}
            </div>
          ))}

        {!isOwner && (
          <div className="absolute top-3 left-3 flex gap-2 z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className={`p-2 rounded-full backdrop-blur-md active:scale-90 transition-all duration-200 shadow-[0_2px_6px_rgba(0,0,0,0.12)] ${
                isFavorite
                  ? "bg-red-500 text-white"
                  : "bg-white/90 text-gray-700 hover:bg-white"
              }`}
            >
              <Heart
                className="w-4 h-4"
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white active:scale-90 backdrop-blur-md transition-all duration-200 shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </ImageTag>

      {/* 2. محتوى الكارد السفلي */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
            <p
              className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.priceText} transition-all duration-300`}
            >
              {hasValue(post.price) && post.price > 0
                ? formatDZD(post.price)
                : "السعر عند الطلب"}
              <span className="text-sm font-medium text-gray-400 mr-1">
                {" "}
                دج
                {isRent && hasValue(post.rentPeriod)
                  ? RENT_PERIOD_SUFFIX[post.rentPeriod] || ""
                  : ""}
              </span>
            </p>
            {postedLabel && (
              <div
                className="flex items-center gap-1 text-gray-400 text-[11px] font-medium bg-gray-50 px-2.5 py-1 rounded-md shrink-0"
                title={exactDateLabel}
              >
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {postedLabel}
              </div>
            )}
          </div>

          <h3
            className="text-lg font-bold text-gray-900 line-clamp-1"
            title={hasValue(post.title) ? post.title : "عنوان غير محدد"}
          >
            {hasValue(post.title)
              ? post.title
              : hasValue(post.property)
                ? `${PROPERTY_LABELS[post.property] || post.property} ${isRent ? "للكراء" : "للبيع"}`
                : isRent
                  ? "عقار للكراء"
                  : "عقار للبيع"}
          </h3>

          {(hasValue(post.neighborhood) || hasValue(post.city)) && (
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <MapPin
                className={`w-4 h-4 ${theme.pinIcon} flex-shrink-0 transition-colors duration-300`}
              />
              <span className="font-semibold text-gray-700">
                {[post.neighborhood, post.city].filter(hasValue).join(" - ")}
              </span>
            </div>
          )}
        </div>

        {/* 3. شبكة المواصفات الأساسية — كل بطاقة تحمل عنوانها الخاص فوق القيمة */}
        {coreSpecs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {coreSpecs.map((spec, i) => {
              const Icon = spec.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-2.5 bg-gray-50 border border-gray-100 rounded-xl min-w-0"
                >
                  <Icon className={`w-4 h-4 ${theme.specIcon} flex-shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium truncate">
                      {spec.label}
                    </p>
                    <p className="w-full font-bold text-xs text-gray-800 ">
                      {spec.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. شارات المرافق — كلها إيجابية (مرفق متوفر فعلاً)، لذلك لون واحد ثابت */}
        {amenityChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {amenityChips.map((chip, i) => {
              const Icon = chip.icon;
              return (
                <span
                  key={`a-${i}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100"
                >
                  <Icon className="w-3 h-3" /> {chip.text}
                </span>
              );
            })}
          </div>
        )}

        {/* 5. رقم الهاتف الأول — عرض نصي فقط، بدون اتصال مباشر */}
        {!isOwner && hasValue(primaryPhone) && (
          <div
            className="flex items-center gap-1.5 text-gray-600 text-xs font-semibold"
            dir="ltr"
          >
            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{primaryPhone}</span>
          </div>
        )}

        {/* 6. أزرار الإجراءات — ظل خفيف بالراحة، يرتفع بلطف عند hover، مع تأثير ضغط عند click */}
        <div className="flex gap-2.5 pt-3 border-t border-gray-50 mt-auto">
          {isOwner ? (
            <>
              <Link
                to={`/dashboard/edit/${post.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-white text-blue-600 hover:bg-blue-600 hover:text-white active:scale-[0.97] font-bold py-2.5 px-3 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 text-xs border border-blue-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.25)]"
              >
                <Edit className="w-4 h-4" /> تعديل الإعلان
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(post.id);
                }}
                className="bg-white text-red-500 hover:bg-red-500 hover:text-white active:scale-[0.97] border border-red-100 rounded-2xl transition-all duration-200 flex items-center justify-center px-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.25)]"
                title="حذف الإعلان"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              to={`/${post.id}`}
              className={`flex-1 bg-gray-900 ${theme.detailBtn} active:scale-[0.98] text-white font-bold py-3 px-4 rounded-2xl transition-all duration-200 text-center text-xs sm:text-sm shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.18)]`}
            >
              معاينة التفاصيل الكاملة
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}