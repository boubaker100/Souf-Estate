import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import MapPicker from "@/components/mapPicker/MapPicker";
import UploadWidget from "@/components/ui/uploadWidget/UploadWidget";
import apiRequest from "@/lib/apiRequest";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { usePropertyFormLogic } from "@/lib/Usepropertyformlogic";

const municipalities = [
  "الوادي", "الرباح", "وادي العلندة", "البياضة", "النخلة", "قمار", "كوينين",
  "الرقيبة", "الحمراية", "تغزوت", "الدبيلة", "حساني عبد الكريم", "حاسي خليفة",
  "طالب العربي", "دوار الماء", "سيدي عون", "الطريفاوي", "المقرن", "بن قشة",
  "ورماس", "العقلة", "ميه ونسة",
];

// ===== كل القيم هنا مطابقة حرفياً لـ enum في schema.prisma =====
const availableDocuments = [
  { id: "TITLE_DEED", label: "عقد ملكية" },
  { id: "LAND_BOOK", label: "دفتر عقاري" },
  { id: "BUILDING_PERMIT", label: "رخصة بناء" },
  { id: "CONFORMITY_CERTIFICATE", label: "شهادة المطابقة" },
  { id: "URBAN_CERTIFICATE", label: "شهادة التعمير" },
  { id: "NEGATIVE_CERTIFICATE", label: "شهادة السلبية" },
  { id: "CUSTOM", label: "عقد عرفي" },
  { id: "OTHER", label: "وثائق أخرى (اكتبها في الوصف)" },
];

const PROPERTY_TYPES = [
  ["apartment", "شقة سكنية"],
  ["residence", "سكنة"],
  ["arabic_house", "حوش عربي / جبس"],
  ["villa", "فيلا"],
  ["building", "عمارة"],
  ["land", "أرض للبناء"],
  ["farm_land", "أرض فلاحية"],
  ["garden", "حويطة"],
  ["shop", "محل تجاري"],
  ["office", "مكتب"],
  ["garage", "كراج"],
  ["warehouse", "مستودع / مخزن"],
  ["factory", "مصنع"],
  ["chalet", "شاليه / استراحة"],
  ["farm", "مزرعة"],
  ["other", "أخرى"],
];

const ROOMS = [
  ["STUDIO", "استوديو"],
  ["F1", "غرفة (F1)"],
  ["F2", "غرفتان (F2)"],
  ["F3", "3 غرف (F3)"],
  ["F4", "4 غرف (F4)"],
  ["F5", "5 غرف (F5)"],
  ["F6", "6 غرف (F6)"],
  ["F7", "7 غرف (F7)"],
  ["F8", "8 غرف فأكثر (F8)"],
];

const RENT_PERIODS = [
  ["daily", "بالأيام (المجهزة)"],
  ["weekly", "بالأسابيع"],
  ["monthly", "بالشهور"],
  ["yearly", "بالسنوات"],
];

const CONDITIONS = [
  ["NEW", "جديد / لم يسكن"],
  ["LIKE_NEW", "حالة جيدة"],
  ["OLD", "قديم"],
];

const CONSTRUCTION_STATUS = [
  ["FINISHED", "100% مكتمل"],
  ["ALMOST_FINISHED", "شبه مكتمل"],
  ["HALF_FINISHED", "نصف مكتمل"],
  ["STRUCTURE", "هيكل"],
  ["OTHER", "أخرى"],
];

const MATERIALS = [
  ["CONCRETE", "خرسانة مسلحة"],
  ["PLASTER", "جبس"],
  ["MIXED", "مختلط"],
];

const YES_NO = [
  ["no", "لا يوجد"],
  ["yes", "يوجد"],
];

const labelCls = "block text-sm font-semibold text-gray-900 mb-2";
const triggerCls = "h-11 w-full border-gray-300";

function Field({ label, children }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function OptionSelect({ value, onChange, options, placeholder }) {
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className={triggerCls}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// تحويلات آمنة: النص غير الرقمي يصبح null بدل NaN
const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
};
const toFloat = (v) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? null : n;
};

export default function NewPostPage() {
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [transactionType, setTransactionType] = useState("buy");
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phones, setPhones] = useState([""]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [displayPrice, setDisplayPrice] = useState("");
  const finalImages = images.length > 0 ? images : ["https://placehold.co/600x400?text=No+Image"];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    district: "",
    videoLink: "",
    type: "buy",
    property: "apartment",
    rentPeriod: "monthly",
    rooms: "F2",
    bathrooms: "1",
    furnished: "false",
    length: "",
    width: "",
    hectares: "",
    facades: "",
    waterTank: "no",
    floors: "",
    floorNumber: "",
    buildYear: "",
    propertyCondition: "LIKE_NEW",
    buildCondition: "FINISHED",
    structureType: "CONCRETE",
    garage: "no",
    gas: "no",
    roof: "no",
    electricity: "no",
    sewage: "no",
  });

  // ============ المنطق الشرطي ============
  const {
    disableElectricity,
    disableSewage,
    disableRentPeriod,
    disableRooms,
    disableBathrooms,
    disableFloor,
    disableBuildingFloors,
    disableFacades,
    disablePropertyCondition,
    disableConstructionStatus,
    disableBuildingMaterial,
    disableConstructionYear,
    disableFurnished: disableFurnishedByPropertyType,
    disableWaterTank,
    disableTerrace,
    disableDimensions: disableDimensionsByPropertyType,
    disableGas,
    disableGarage,
  } = usePropertyFormLogic(formData);

  const disableFurnished = transactionType === "buy" || disableFurnishedByPropertyType;
  const disableDimensions = transactionType === "rent" || disableDimensionsByPropertyType;

  const showElectricity = !disableElectricity;
  const showSewage = !disableSewage;
  const showRentPeriod = !disableRentPeriod;
  const showRooms = !disableRooms;
  const showBathrooms = !disableBathrooms;
  const showFloorNumber = !disableFloor;
  const showFloorsCount = !disableBuildingFloors;
  const showFacades = !disableFacades;
  const showPropertyCondition = !disablePropertyCondition;
  const showConstructionStatus = !disableConstructionStatus;
  const showBuildingMaterial = !disableBuildingMaterial;
  const showConstructionYear = !disableConstructionYear;
  const showFurnished = !disableFurnished;
  const showWaterTank = !disableWaterTank && transactionType !== "rent";
  const showTerrace = !disableTerrace;
  const showDimensions = !disableDimensions && formData.property !== "farm_land";
  const showHectares = formData.property === "farm_land";
  const showGas = !disableGas;
  const showGarage = !disableGarage;

  // ============ دوال إدارة النموذج ============
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "property") {
        if (["land", "farm_land"].includes(value)) {
          newData.rooms = null;
          newData.bathrooms = null;
          newData.waterTank = "no";
          newData.floors = null;
          newData.floorNumber = null;
          newData.buildYear = null;
          if (value === "farm_land") newData.facades = null;
        } else {
          // العودة لنوع غير أرض: نعيد القيم الافتراضية التي مُسحت
          newData.rooms = prev.rooms ?? "F2";
          newData.bathrooms = prev.bathrooms ?? "1";
        }
      }
      return newData;
    });

    if (name === "type") setTransactionType(value);
  };

  const toggleAmenity = (key) => {
    setFormData((prev) => ({ ...prev, [key]: prev[key] === "yes" ? "no" : "yes" }));
  };

  const handlePhoneChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    const updated = [...phones];
    updated[index] = cleaned;
    setPhones(updated);
  };

  const addPhoneField = () => setPhones([...phones, ""]);

  const removePhoneField = (indexToRemove) => {
    if (indexToRemove === 0) return;
    setPhones(phones.filter((_, i) => i !== indexToRemove));
  };

  // نخزن id (قيمة الـ enum) وليس العنوان العربي
  const handleDocumentToggle = (docId) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId) ? prev.filter((d) => d !== docId) : [...prev, docId],
    );
  };

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const formatPrice = (value) => {
    const digits = (value || "").replace(/\D/g, "");
    return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
  };

  const handlePriceChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, price: digits }));
    setDisplayPrice(formatPrice(digits));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const validPhones = phones.map((p) => p.trim()).filter(Boolean);

      if (validPhones.length === 0) {
        toast.error("يرجى إدخال رقم هاتف واحد على الأقل للمواصلة");
        return;
      }
      if (!location) {
        toast.error("يرجى تحديد موقع العقار على الخريطة");
        return;
      }

      // الحقول غير المنطبقة تُرسل null (وليس false) حتى لا تظهر كـ "لا يوجد"
      const yesNo = (show, value) => (show ? value : null);

      const postData = {
        title: formData.title,
        description: formData.description,
        price: toInt(formData.price) || 0,
        type: formData.type,
        property: formData.property,
        city: formData.city,
        district: formData.district,
        videoLink: formData.videoLink,
        phones: validPhones,
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lng),
        images: finalImages,

        rooms: showRooms ? formData.rooms : null,
        bathrooms: showBathrooms ? toInt(formData.bathrooms) : null,
        rentPeriod: formData.type === "rent" ? formData.rentPeriod : null,
        furnished: showFurnished ? formData.furnished === "true" : null,

        width: showDimensions ? toFloat(formData.width) : null,
        length: showDimensions ? toFloat(formData.length) : null,
        hectares: showHectares ? toFloat(formData.hectares) : null,
        facades: showFacades ? toInt(formData.facades) : null,
        floors: showFloorsCount ? toInt(formData.floors) : null,
        floorNumber: showFloorNumber ? toInt(formData.floorNumber) : null,
        buildYear: showConstructionYear ? toInt(formData.buildYear) : null,

        // أسماء الحقول التي يقرأها الباك إند + قيم enum مباشرة
        propertyCondition: showPropertyCondition ? formData.propertyCondition : null,
        constructionStatus: showConstructionStatus ? formData.buildCondition : null,
        buildingMaterial: showBuildingMaterial ? formData.structureType : null,
        ownershipDocuments: formData.type === "buy" ? selectedDocuments : [],

        waterTank: yesNo(showWaterTank, formData.waterTank),
        gas: yesNo(showGas, formData.gas),
        electricity: yesNo(showElectricity, formData.electricity),
        sewage: yesNo(showSewage, formData.sewage),
        roof: yesNo(showTerrace, formData.roof),
        garage: yesNo(showGarage, formData.garage),
      };

      await apiRequest.post("/api/dashboard/add", postData);

      toast.success("تم نشر الإعلان بنجاح!");
      setTimeout(() => {
        navigate("/dashboard/my-posts", { state: { newPost: true } });
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ أثناء نشر الإعلان";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const amenityOptions = [
    { key: "gas", label: "غاز المدينة", show: showGas },
    { key: "electricity", label: "كهرباء متوفرة", show: showElectricity },
    { key: "sewage", label: "صرف صحي", show: showSewage },
    { key: "waterTank", label: "خزان أرضي", show: showWaterTank },
  ].filter((o) => o.show);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إضافة إعلان عقاري جديد</h1>
          <p className="text-gray-600">
            أدخل تفاصيل عقارك بدقة لعرضه أمام المشترين والمستأجرين
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <motion.form
              onSubmit={handleSubmit}
              className="bg-gray-50 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8 border border-gray-200/80"
            >
              {/* 1. المعلومات العامة والموقع */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-3">
                  المعلومات العامة والموقع
                </h3>

                <Field label="عنوان الإعلان *">
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="مثال: منزل فاخر للبيع في وسط المدينة"
                    required
                    className="h-11 w-full border-gray-300"
                  />
                </Field>

                <Field label="وصف العقار">
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="أضف وصفاً مفصلاً ومميزات العقار والأماكن القريبة منه..."
                    rows={4}
                    className="w-full border-gray-300 resize-none"
                  />
                </Field>

                <Field label="رابط فيديو للعقار (اختياري)">
                  <Input
                    name="videoLink"
                    value={formData.videoLink}
                    onChange={handleInputChange}
                    placeholder="مثال: https://www.youtube.com/watch?v=..."
                    dir="ltr"
                    className="h-11 w-full border-gray-300 text-left"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="نوع العملية *">
                    <OptionSelect
                      value={formData.type}
                      onChange={(v) => handleSelectChange("type", v)}
                      options={[
                        ["buy", "بيع"],
                        ["rent", "كراء"],
                      ]}
                    />
                  </Field>

                  <Field label="السعر (دج)">
                    <Input
                      name="price"
                      inputMode="numeric"
                      value={displayPrice}
                      onChange={handlePriceChange}
                      placeholder="0.00"
                      style={{ lineHeight: "1.7" }}
                      className="w-full border-gray-300 font-medium"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="البلدية *">
                    <OptionSelect
                      value={formData.city}
                      onChange={(v) => handleSelectChange("city", v)}
                      placeholder="اختر البلدية"
                      options={municipalities.map((m) => [m, m])}
                    />
                  </Field>

                  <Field label="الحي / الشارع *">
                    <Input
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="مثال: حي الصحن الثاني .. حي القواطين .."
                      required
                      style={{ lineHeight: "1.7" }}
                      className="w-full text-sm border-gray-300"
                    />
                  </Field>
                </div>
              </div>

              {/* 2. مواصفات العقار */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-3">مواصفات العقار</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="نوع العقار *">
                    <OptionSelect
                      value={formData.property}
                      onChange={(v) => handleSelectChange("property", v)}
                      options={PROPERTY_TYPES}
                    />
                  </Field>

                  {showRooms && (
                    <Field label="عدد الغرف *">
                      <OptionSelect
                        value={formData.rooms}
                        onChange={(v) => handleSelectChange("rooms", v)}
                        options={ROOMS}
                      />
                    </Field>
                  )}

                  {showBathrooms && (
                    <Field label="عدد الحمامات">
                      <Input
                        lang="en"
                        name="bathrooms"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.bathrooms || ""}
                        onChange={handleInputChange}
                        placeholder="—"
                        className={triggerCls}
                      />
                    </Field>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {showFurnished && (
                    <Field label="التأثيث">
                      <OptionSelect
                        value={formData.furnished}
                        onChange={(v) => handleSelectChange("furnished", v)}
                        options={[
                          ["false", "غير مؤثث"],
                          ["true", "مؤثث"],
                        ]}
                      />
                    </Field>
                  )}

                  {showRentPeriod && (
                    <Field label="مدة الكراء">
                      <OptionSelect
                        value={formData.rentPeriod}
                        onChange={(v) => handleSelectChange("rentPeriod", v)}
                        placeholder="—"
                        options={RENT_PERIODS}
                      />
                    </Field>
                  )}

                  {showTerrace && (
                    <Field label="التيراس / السطح">
                      <OptionSelect
                        value={formData.roof || "no"}
                        onChange={(v) => handleSelectChange("roof", v)}
                        options={YES_NO}
                      />
                    </Field>
                  )}

                  {showGarage && (
                    <Field label="الكراج">
                      <OptionSelect
                        value={formData.garage || "no"}
                        onChange={(v) => handleSelectChange("garage", v)}
                        options={YES_NO}
                      />
                    </Field>
                  )}

                  {showFloorsCount && (
                    <Field label="عدد الطوابق">
                      <Input
                        type="number"
                        name="floors"
                        inputMode="numeric"
                        min="0"
                        value={formData.floors || ""}
                        onChange={handleInputChange}
                        className={triggerCls}
                      />
                    </Field>
                  )}
                </div>
              </div>

              {/* 3. البنية والأبعاد */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-3">
                  البنية والأبعاد التقنية
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {showDimensions && (
                    <>
                      <Field label="الطول (متر)">
                        <Input
                          name="length"
                          inputMode="decimal"
                          value={formData.length}
                          onChange={handleInputChange}
                          className={triggerCls}
                        />
                      </Field>
                      <Field label="العرض (متر)">
                        <Input
                          name="width"
                          inputMode="decimal"
                          value={formData.width}
                          onChange={handleInputChange}
                          className={triggerCls}
                        />
                      </Field>
                    </>
                  )}
                  {showHectares && (
                    <Field label="المساحة بالهكتار">
                      <Input
                        name="hectares"
                        inputMode="decimal"
                        value={formData.hectares}
                        onChange={handleInputChange}
                        placeholder="مثال: 1.5"
                        className={triggerCls}
                      />
                    </Field>
                  )}
                  {showFacades && (
                    <Field label="عدد الواجهات">
                      <Input
                        name="facades"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.facades || ""}
                        onChange={handleInputChange}
                        className={triggerCls}
                      />
                    </Field>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {showFloorNumber && (
                    <Field label="رقم الطابق">
                      <Input
                        name="floorNumber"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.floorNumber || ""}
                        onChange={handleInputChange}
                        className={triggerCls}
                      />
                    </Field>
                  )}
                  {showConstructionYear && (
                    <Field label="سنة الإنشاء">
                      <Input
                        name="buildYear"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.buildYear || ""}
                        onChange={handleInputChange}
                        placeholder="مثال: 2020"
                        className={triggerCls}
                      />
                    </Field>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {showPropertyCondition && (
                    <Field label="حالة العقار">
                      <OptionSelect
                        value={formData.propertyCondition}
                        onChange={(v) => handleSelectChange("propertyCondition", v)}
                        placeholder="—"
                        options={CONDITIONS}
                      />
                    </Field>
                  )}
                  {showConstructionStatus && (
                    <Field label="حالة البناء">
                      <OptionSelect
                        value={formData.buildCondition}
                        onChange={(v) => handleSelectChange("buildCondition", v)}
                        placeholder="اختر حالة البناء"
                        options={CONSTRUCTION_STATUS}
                      />
                    </Field>
                  )}
                  {showBuildingMaterial && (
                    <Field label="بنية العقار (خرسانة/جبس)">
                      <OptionSelect
                        value={formData.structureType}
                        onChange={(v) => handleSelectChange("structureType", v)}
                        options={MATERIALS}
                      />
                    </Field>
                  )}
                </div>
              </div>

              {amenityOptions.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenityOptions.map((option) => (
                    <label
                      key={option.key}
                      className={`flex items-center gap-3 px-4 py-3 bg-white rounded-lg border cursor-pointer transition-colors ${
                        formData[option.key] === "yes"
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-gray-200 hover:border-yellow-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData[option.key] === "yes"}
                        onChange={() => toggleAmenity(option.key)}
                        className="shrink-0 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-800">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* الوثائق */}
              {transactionType === "buy" && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-3">
                    الوثائق المتوفرة للعقار
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    قم بتحديد الوثائق المتاحة لتظهر بشكل مؤكد في صفحة الإعلان الرسمية
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableDocuments.map((doc) => (
                      <label
                        key={doc.id}
                        className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-yellow-400 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => handleDocumentToggle(doc.id)}
                          className="shrink-0 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400 w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-800">{doc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* الهواتف */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-lg font-bold text-gray-900">أرقام الهواتف للتواصل</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPhoneField}
                    disabled={phones.length >= 5}
                    className="flex items-center gap-1.5 shrink-0 cursor-pointer border-yellow-900 hover:bg-gray-200 focus:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" /> إضافة رقم آخر
                  </Button>
                </div>

                <div className="space-y-3">
                  {phones.map((phone, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder={
                          index === 0 ? "الرقم الرئيسي (إجباري)" : `رقم إضافي ${index} (اختياري)`
                        }
                        value={phone}
                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                        dir="ltr"
                        className="h-11 w-full border-gray-300 text-left"
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removePhoneField(index)}
                          className="h-11 w-11 shrink-0"
                          title="حذف الرقم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* الموقع */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-3">
                  تحديد الموقع على الخريطة *
                </h3>
                <div className="h-[420px] rounded-xl overflow-hidden border border-gray-300 relative">
                  <MapPicker className="w-full h-full" onSelect={(loc) => setLocation(loc)} />
                </div>
              </div>

              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

              {/* زر الإرسال: type=submit فقط (بدون onClick) حتى لا يُرسل مرتين */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg rounded-xl transition-colors"
                >
                  {loading ? "جاري النشر..." : "نشر الإعلان"}
                </Button>
              </div>
            </motion.form>
          </div>

          {/* العمود الجانبي */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 flex flex-col gap-6">
              <div className="bg-gray-50 rounded-2xl shadow-sm p-6 border border-gray-200/80">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">صور العقار *</h3>

                <div className="bg-blue-50/60 rounded-xl p-4 mb-4 border border-blue-100">
                  <p className="text-sm font-semibold text-blue-800 mb-3">
                    نصائح لصور احترافية تسرع عملية البيع/الكراء:
                  </p>
                  <ul className="space-y-2 text-xs text-gray-600 list-disc list-inside">
                    <li>
                      <strong className="text-gray-800">الإضاءة الطبيعية:</strong> افتح النوافذ
                      والستائر والتقط الصور في وضح النهار.
                    </li>
                    <li>
                      <strong className="text-gray-800">الوضع الأفقي:</strong> امسك هاتفك بالعرض
                      (Landscape) لتصوير مساحة أوسع للغرفة.
                    </li>
                    <li>
                      <strong className="text-gray-800">الترتيب والنظافة:</strong> رتب المكان وأخفِ
                      الأغراض الشخصية لتبدو المساحات أكبر.
                    </li>
                    <li>
                      <strong className="text-gray-800">الشمولية:</strong> صوّر الواجهة الخارجية،
                      المطبخ، الحمام، وأي ملحقات (حديقة/شرفة).
                    </li>
                    <li>
                      <strong className="text-gray-800">الواقعية:</strong> تجنب استخدام الفلاتر أو
                      الصور المهتزة؛ دع الزبون يرى العقار على حقيقته.
                    </li>
                  </ul>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white">
                  <UploadWidget
                    uwConfig={{
                      multiple: true,
                      cloudName: "lamadev",
                      uploadPreset: "estate",
                      maxImageFileSize: 2000000,
                      folder: "posts",
                    }}
                    setState={setImages}
                  />

                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden border border-gray-200"
                        >
                          <img
                            src={img}
                            alt={`عقار ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="حذف الصورة"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 rounded-2xl shadow-sm p-6 border border-yellow-200">
                <h3 className="text-lg font-bold text-yellow-800 border-b border-yellow-200 pb-3 mb-4">
                  نصائح لإعلان ناجح
                </h3>
                <ul className="list-disc list-inside space-y-2 text-yellow-800 font-medium text-sm">
                  <li>التقط صوراً واضحة ومشرقة للعقار لتجذب أكبر عدد من المهتمين.</li>
                  <li>اكتب وصفاً دقيقاً يبرز أهم المميزات والخدمات القريبة.</li>
                  <li>حدد السعر بشكل واقعي ومناسب لأسعار السوق الحالية.</li>
                  <li>تأكد من صحة أرقام التواصل والوثائق وموقع العقار على الخريطة.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}