import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { rentIcon, buyIcon } from "./mapIcons";
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

// إعداد أيقونات Leaflet الافتراضية
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// إزالة الـ padding الافتراضي لصندوق popup في Leaflet خاصة بهذه البطاقة فقط
// (عبر className="property-popup")، حتى يلامس الشريط الملوّن العلوي حواف
// البطاقة تماماً بدل الاعتماد على margin سالب يخمّن قيمة padding Leaflet
// الداخلية التي قد تختلف بين الإصدارات.
if (
  typeof document !== "undefined" &&
  !document.getElementById("property-popup-style")
) {
  const style = document.createElement("style");
  style.id = "property-popup-style";
  style.textContent = `
    .property-popup .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 0.75rem; }
    .property-popup .leaflet-popup-content { margin: 0; width: 280px !important; }
  `;
  document.head.appendChild(style);
}

const EL_OUED_CENTER = [33.3564, 6.8632];

// نفس قاموس تسميات نوع العقار المستخدم في PropertyCard.jsx، حتى يكون
// النص المعروض في الـ popup مطابقاً لما يظهر في الكارد (بدل عرض القيمة
// الخام مثل "land" كما هي).
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

const formatDZD = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "0";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function PostsMap({
  posts,
  className = "h-[300px]",
  onMarkerClick,
}) {
  // 1. تحديد مركز الخريطة بناءً على أول عقار متاح أو المركز الافتراضي
  const mapCenter =
    posts?.length === 1 && posts[0]?.latitude
      ? [Number(posts[0].latitude), Number(posts[0].longitude)]
      : EL_OUED_CENTER;

  return (
    <MapContainer
      center={mapCenter}
      zoom={10}
      className={`w-full ${className}  rounded-2xl shadow-md`}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* عرض الـ Markers بناءً على البيانات التي تصل من الأب فقط */}
      {(posts || [])
        .filter((post) => post.latitude && post.longitude)
        .map((post) => {
          const isRent = post.type === "rent";
          const primaryPhone = Array.isArray(post.phones) && post.phones.length > 0 ? post.phones[0] : null;
          const propertyLabel = PROPERTY_LABELS[post.property] || post.property;

          return (
            <Marker
              key={post.id}
              position={[Number(post.latitude), Number(post.longitude)]}
              icon={isRent ? rentIcon : buyIcon}
              eventHandlers={{
                // عند الضغط على العلامة نُعلم المكوّن الأب بالعقار المختار،
                // ليقوم بتمرير الكارد المطابق إليه في القائمة الجانبية أو الكاروسيل
                click: () => onMarkerClick && onMarkerClick(post),
              }}
            >
              <Popup minWidth={260} maxWidth={280} className="property-popup">
                <div dir="rtl">
                  {/* شريط علوي ملوّن رفيع يحمل نوع الصفقة — يعمل كهوية بصرية للبطاقة
                      بدل شارة صغيرة، ويطابق لون الماركر مباشرة */}
                  <div
                    className={`px-4 py-2.5 flex items-center ${
                      isRent ? "bg-emerald-600" : "bg-blue-600"
                    }`}
                  >
                    <span className="text-3xl mx-auto font-bold text-white tracking-wide">
                      {propertyLabel
                        ? `${propertyLabel} ${isRent ? "للكراء" : "للبيع"}`
                        : isRent
                        ? "عقار للكراء"
                        : "عقار للبيع"}
                    </span>
                  </div>

                  <div className="px-4 pt-3 pb-4 space-y-3">
                    {/* السعر — العنصر الأهم، بحجم أكبر وثقل بصري واضح */}
                    <div className="flex items-baseline gap-1.5 border-b border-gray-100 pb-3">
                      <span className="text-2xl font-black text-gray-900 leading-none">
                        {post.price && post.price > 0
                          ? formatDZD(post.price)
                          : "السعر عند الطلب"}
                      </span>
                      <span className="text-sm font-semibold text-gray-400">
                        دج
                      </span>
                      {isRent && post.rentPeriod && (
                        <span className="text-xs font-medium text-gray-400">
                          {RENT_PERIOD_SUFFIX[post.rentPeriod] || ""}
                        </span>
                      )}
                    </div>

                    {/* رقم الهاتف — صف مستقل بخلفية هادئة بدل نص عادي معلّق */}
                    {primaryPhone && (
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span
                          className="text-sm font-bold text-gray-700"
                          dir="ltr"
                        >
                          {primaryPhone}
                        </span>
                      </div>
                    )}

                    {/* زر عرض التفاصيل — عريض وبثقل بصري واضح كإجراء رئيسي للبطاقة */}
                    <Link
                      to={`/${post.id}`}
                      style={{ color: "white" }}
                      className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-black py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors duration-200"
                    >
                      عرض التفاصيل الكاملة
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* مفتاح الخريطة */}
      <div className="absolute bottom-6 left-6 bg-white p-3 rounded-xl shadow-md z-0 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-600 rounded-full"></span>
          <span>كراء</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
          <span>بيع</span>
        </div>
      </div>
    </MapContainer>
  );
}
