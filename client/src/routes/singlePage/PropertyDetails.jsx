 import { 
  MapPin, 
  Home, 
  DollarSign, 
  Phone, 
  Maximize, 
  Armchair, 
  Calendar, 
  Tag, 
  Building2 
} from "lucide-react";

const PropertyDetails = ({ post }) => {
  
  // قاموس لتحويل القيم الإنجليزية إلى عربية
  const translate = {
    type: {
      rent: "كراء",
      buy: "بيع"
    },
    property: {
      apartment: "شقة سكنية",
      house: " منزل أرضي",
      building: "فيلا",
      land: "أرض",
      farm_land: "أرض فلاحية",
      shop: "محل تجاري",
      other: "عقار آخر"
    },
    rentPeriod: {
      daily: "يومي",
      monthly: "شهري",
      yearly: "سنوي"
    }
  };

  const areaSize = (post.width && post.length) ? post.width * post.length : null;

  const items = [
    // 1. المدينة / الموقع
    { 
      label: "البلدية / الموقع:", 
      icon: <MapPin className="text-blue-500" />, 
      text: post.city, 
      bold: true 
    },
    
    // 2. السعر
    { 
      label: "السعر:", 
      icon: <DollarSign className="text-yellow-600" />, 
      text: `${post.price?.toLocaleString()} دج`, 
      bold: true 
    },

    // 3. نوع العملية
    { 
      label: "نوع العملية:", 
      icon: <Tag className="text-purple-500" />, 
      text: translate.type[post.type] || post.type 
    },

    // 4. نوع العقار
    { 
      label: "نوع العقار:", 
      icon: <Building2 className="text-indigo-500" />, 
      text: translate.property[post.property] || post.property 
    },

    // 5. عدد الغرف
    { 
      label: "عدد الغرف:", 
      icon: <Home className="text-green-500" />, 
      text: post.rooms 
    },

    // 6. المساحة والأبعاد
    areaSize && { 
      label: "المساحة الإجمالية:", 
      icon: <Maximize className="text-blue-400" />, 
      text: `${areaSize} متر² (${post.width}م × ${post.length}م)` 
    },

    // 7. التجهيز (مفروش)
    { 
      label: "حالة التأثيث:", 
      icon: <Armchair className="text-orange-500" />, 
      text: post.furnished ? "مفروش" : "غير مفروش",
      textColor: post.furnished ? "text-green-600" : "text-gray-500"
    },

    // 8. مدة الكراء (تظهر فقط في حالة الكراء)
    post.rentPeriod && { 
      label: "نظام الكراء:", 
      icon: <Calendar className="text-red-500" />, 
      text: translate.rentPeriod[post.rentPeriod] || post.rentPeriod 
    },

    // 9. رقم الهاتف
    post.phone && { 
      label: "رقم الهاتف للتواصل:", 
      icon: <Phone className="text-blue-600" />, 
      text: post.phone,
      bold: true
    }

  ].filter(Boolean);

  return (
    <div className="w-full max-w-2xl mt-4 bg-white p-6 flex flex-col gap-4 shadow-sm rounded-xl border border-gray-100" dir="rtl">
      {items.map((it, i) => (
        <div key={i} className="flex flex-col border-b last:border-0 pb-3 last:pb-0 border-gray-50">
          <span className="text-gray-400 text-xs mb-1 font-medium">{it.label}</span>
          <div className={`flex items-center gap-3 ${it.textColor || "text-gray-800"}`}>
            <span className="shrink-0">{it.icon}</span>
            <p className={`${it.bold ? "font-bold text-lg" : "text-base font-medium"}`}>
              {it.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
// مكون الخانة الواحدة (Feature Item) لضمان التناسق

export default PropertyDetails;