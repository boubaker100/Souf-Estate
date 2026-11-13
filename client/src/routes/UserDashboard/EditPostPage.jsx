import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { usePropertyFormLogic } from "@/lib/Usepropertyformlogic";

const municipalities = [
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
  "ميه ونسة",
];

const availableDocuments = [
  { id: "TITLE_DEED", label: "عقد ملكية" },
  { id: "LAND_BOOK", label: "دفتر عقاري" },
  { id: "building_permit", label: "رخصة بناء" },
  { id: "CONFORMITY_CERTIFICATE", label: "شهادة المطابقة " },
  { id: "URBAN_CERTIFICATE", label: "شهادة التعمير " },
  { id: "NEGATIVE_CERTIFICATE", label: "شهادة السلبية " },
  { id: "CUSTOM", label: "عقد عرفي" },
  { id: "OTHER", label: "وثائق أخرى(اكتبها في الوصف)" },
];

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [transactionType, setTransactionType] = useState("buy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phones, setPhones] = useState([""]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [pageLoading, setPageLoading] = useState(true); // تحميل الصفحة
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
    propertyCondition: "good",
    buildCondition: "finished",
    structureType: "concrete",
    garage: "no",
    gas: "no",
    roof: "no",
     electricity: "no",
  sewage: "no",
  });

  // جلب بيانات الإعلان عند التحميل
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await apiRequest.get("/api/posts/" + id);
        const postData = res.data;

        // تعبئة النموذج
        setFormData({
          title: postData.title || "",
          description: postData.description || "",
          price: postData.price || "",
          city: postData.city || "",
district: postData.neighborhood || "",
           videoLink: postData.video || "",
           type: postData.type || "buy",
           property: postData.property || "apartment",
           rentPeriod: postData.rentPeriod || "monthly",
           rooms: postData.rooms || "F2",
           bathrooms: postData.bathrooms ? String(postData.bathrooms) : "1",
           furnished: postData.furnished ? "true" : "false",
           length: postData.length ? String(postData.length) : "",
           width: postData.width ? String(postData.width) : "",
           facades: postData.facades ? String(postData.facades) : "",
           waterTank: postData.waterTank || "no",
           floors: postData.buildingFloors ? String(postData.buildingFloors) : "",
           floorNumber: postData.floor ? String(postData.floor) : "",
           buildYear: postData.constructionYear ? String(postData.constructionYear) : "",
           propertyCondition: postData.propertyCondition || "good",
           buildCondition: postData.constructionStatus || "finished",
           structureType: postData.buildingMaterial || "concrete",
           garage: postData.garage || "no",
           gas: postData.gas || "no",
           roof: postData.terrace || "no",
        });
        setDisplayPrice(formatPrice(String(postData.price)));
        setTransactionType(postData.type || "buy");
        setImages(postData.images || []);
        setLocation({
          lat: postData.latitude,
          lng: postData.longitude,
        });

        // أرقام الهواتف
        if (postData.phones && postData.phones.length > 0) {
          setPhones(postData.phones);
        } else if (postData.phone) {
          // دعم قديم: رقم واحد فقط
          setPhones([postData.phone]);
        }

        // الوثائق
        if (postData.documents && Array.isArray(postData.documents)) {
          setSelectedDocuments(postData.documents);
        } else {
          setSelectedDocuments([]);
        }
      } catch (err) {
        toast.error("فشل في تحميل بيانات الإعلان");
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // ============ المنطق الشرطي ============
  const {
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
      disableElectricity,
  disableSewage,
  } = usePropertyFormLogic(formData);

  const disableFurnished =
    transactionType === "buy" || disableFurnishedByPropertyType;
  const disableDimensions =
    transactionType === "rent" || disableDimensionsByPropertyType;

  // إظهار/إخفاء الحقول
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
  // إظهار الطول/العرض فقط لغير الأراضي الفلاحية
  const showDimensions =
    !disableDimensions && formData.property !== "farm_land";

  // إظهار حقل الهكتارات فقط للأرض الفلاحية
  const showHectares = formData.property === "farm_land";
  const showGas = !disableGas;

  // ============ دوال إدارة النموذج ============
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const toggleAmenity = (key) => {
  setFormData(prev => ({
    ...prev,
    [key]: prev[key] === "yes" ? "no" : "yes",
  }));
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
        }
      }
      return newData;
    });

    if (name === "type") {
      setTransactionType(value);
    }
  };

  // ضع هذا الكود خارج المكون (في أعلى الملف بعد imports)
  const formatPrice = (value) => {
    const digitsOnly = value.replace(/\D/g, ""); // نحذف أي شيء غير الأرقام
    if (!digitsOnly) return "";
    // نضيف نقطة كل 3 أرقام
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const handlePriceChange = (e) => {
    const raw = e.target.value; // النص المُدخل
    const digits = raw.replace(/\D/g, ""); // استخراج الأرقام فقط
    setFormData((prev) => ({ ...prev, price: digits })); // تخزين الأرقام الخام
    setDisplayPrice(formatPrice(digits)); // تحديث العرض المُنسق
  };

  const handlePhoneChange = (index, value) => {
    const cleanedValue = value.replace(/\D/g, "").slice(0, 10);
    const updatedPhones = [...phones];
    updatedPhones[index] = cleanedValue;
    setPhones(updatedPhones);
  };

  const addPhoneField = () => {
    setPhones([...phones, ""]);
  };

  const removePhoneField = (indexToRemove) => {
    if (indexToRemove === 0) return;
    setPhones(phones.filter((_, index) => index !== indexToRemove));
  };

  const handleDocumentToggle = (docLabel) => {
    setSelectedDocuments((prev) =>
      prev.includes(docLabel)
        ? prev.filter((item) => item !== docLabel)
        : [...prev, docLabel],
    );
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ============ حفظ التعديلات ============
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const validPhones = phones.map((p) => p.trim()).filter((p) => p !== "");
      if (validPhones.length === 0) {
        toast.error("يرجى إدخال رقم هاتف واحد على الأقل للمواصلة");
        setLoading(false);
        return;
      }

      if (!location) {
        toast.error("يرجى تحديد موقع العقار على الخريطة");
        setLoading(false);
        return;
      }

      if (images.length === 0) {
        toast.error("يرجى رفع صور العقار");
        setLoading(false);
        return;
      }

      const postData = {
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price) || 0,
        type: formData.type,
        property: formData.property,
        city: formData.city,
        district: formData.district,
        videoLink: formData.videoLink,
phones: validPhones,
         ownershipDocuments: selectedDocuments,
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lng),
        images: finalImages,
        rooms: showRooms ? formData.rooms : null,
        bathrooms: showBathrooms ? parseInt(formData.bathrooms) : null,
        rentPeriod: formData.type === "rent" ? formData.rentPeriod : null,
        furnished: showFurnished ? formData.furnished === "true" : false,
        width:
          showDimensions && formData.width ? parseFloat(formData.width) : null,
        length:
          showDimensions && formData.length
            ? parseFloat(formData.length)
            : null,
        hectares:
          showHectares && formData.hectares
            ? parseFloat(formData.hectares)
            : null,
        facades:
          showFacades && formData.facades ? parseInt(formData.facades) : null,
        waterTank: showWaterTank ? formData.waterTank : null,
        floors:
          showFloorsCount && formData.floors ? parseInt(formData.floors) : null,
        floorNumber:
          showFloorNumber && formData.floorNumber
            ? parseInt(formData.floorNumber)
            : null,
        buildYear:
          showConstructionYear && formData.buildYear
            ? parseInt(formData.buildYear)
            : null,
        propertyCondition: showPropertyCondition
          ? formData.propertyCondition
          : null,
        buildCondition: showConstructionStatus ? formData.buildCondition : null,
        structureType: showBuildingMaterial ? formData.structureType : null,
        gas: showGas ? formData.gas : null,
        electricity: showElectricity ? formData.electricity : null,
sewage: showSewage ? formData.sewage : null,
        roof: showTerrace ? formData.roof : null,
      };

      await apiRequest.put("/dashboard/" + id, {
        post: postData,
      });
      toast.success("تم حفظ التعديلات بنجاح!");
      setTimeout(() => {
        navigate("/dashboard/my-posts");
      }, 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "حدث خطأ أثناء حفظ التعديلات";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  const amenityOptions = [
  { key: "gas", label: "غاز المدينة" },
  { key: "electricity", label: "كهرباء متوفرة" },
  { key: "sewage", label: "صرف صحي" },
  { key: "waterTank", label: "خزان أرضي" },
].filter((option) => {
  // إظهار الخيار فقط إذا كان نوع العقار يدعمه
  switch (option.key) {
    case "gas": return showGas;
    case "waterTank": return showWaterTank;
    case "electricity": return showElectricity;
    case "sewage": return showSewage;
    default: return false;
  }
});

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">جاري تحميل بيانات الإعلان...</p>
      </div>
    );
  }


  return (
    <div
      className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            تعديل الإعلان العقاري
          </h1>
          <p className="text-gray-600">قم بتعديل تفاصيل عقارك المدرج</p>
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

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    عنوان الإعلان *
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="مثال: منزل فاخر للبيع في وسط المدينة"
                    required
                    className="h-11 w-full border-gray-300 "
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    وصف العقار
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="أضف وصفاً مفصلاً ومميزات العقار والأماكن القريبة منه..."
                    rows={4}
                    className="w-full border-gray-300 resize-none "
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    رابط فيديو للعقار (اختياري)
                  </label>
                  <Input
                    name="videoLink"
                    value={formData.videoLink}
                    onChange={handleInputChange}
                    placeholder="مثال: https://www.youtube.com/watch?v=..."
                    dir="ltr"
                    className="h-11 w-full border-gray-300 text-left "
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      نوع العملية *
                    </label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => handleSelectChange("type", v)}
                    >
                      <SelectTrigger className="h-11 w-full border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">بيع</SelectItem>
                        <SelectItem value="rent">كراء</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      السعر (دج)
                    </label>
                    <Input
                      name="price"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={displayPrice}
                      onChange={handlePriceChange}
                      placeholder="0.00"
                      style={{ lineHeight: "1.7" }}
                      className=" w-full border-gray-300 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      البلدية *
                    </label>
                    <Select
                      required
                      value={formData.city}
                      onValueChange={(v) => handleSelectChange("city", v)}
                    >
                      <SelectTrigger className="h-11 w-full border-gray-300">
                        <SelectValue placeholder="اختر البلدية" />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalities.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      الحي / الشارع *
                    </label>
                    <Input
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="مثال: حي الصحن الثاني .. حي القواطين .."
                      required
                      style={{ lineHeight: "1.7" }}
                      className=" w-full text-sm border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* 2. تصنيف ومواصفات العقار */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-3">
                  مواصفات العقار
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      نوع العقار *
                    </label>
                    <Select
                      required
                      value={formData.property}
                      onValueChange={(v) => handleSelectChange("property", v)}
                    >
                      <SelectTrigger className="h-11 w-full border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">شقة سكنية</SelectItem>
                        <SelectItem value="residence">سكنة</SelectItem>
                        <SelectItem value="arabic_house">
                          حوش عربي / جبس
                        </SelectItem>
                        <SelectItem value="villa">فيلا</SelectItem>
                        <SelectItem value="building">عمارة</SelectItem>

                        <SelectItem value="land">أرض للبناء</SelectItem>
                        <SelectItem value="farm_land">أرض فلاحية</SelectItem>
                        <SelectItem value="garden">حويطة</SelectItem>
                        <SelectItem value="shop">محل تجاري</SelectItem>
                        <SelectItem value="office">مكتب</SelectItem>
                        <SelectItem value="garage">كراج</SelectItem>
                        <SelectItem value="warehouse">مستودع / مخزن</SelectItem>
                        <SelectItem value="factory">مصنع</SelectItem>
                        <SelectItem value="chalet">شاليه / استراحة</SelectItem>
                        <SelectItem value="farm">مزرعة</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {showRooms && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        عدد الغرف *
                      </label>
                      <Select
                        required
                        value={formData.rooms || ""}
                        onValueChange={(v) => handleSelectChange("rooms", v)}
                      >
                        <SelectTrigger className="h-11 w-full border-gray-300">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="F1">غرف 1 (F1)</SelectItem>
                          <SelectItem value="F2">غرف 2 (F2)</SelectItem>
                          <SelectItem value="F3">3 غرف (F3)</SelectItem>
                          <SelectItem value="F4">4 غرف (F4)</SelectItem>
                          <SelectItem value="F5">5 غرف (F5)</SelectItem>
                          <SelectItem value="F6">6 غرف (F6)</SelectItem>
                          <SelectItem value="F7">7 غرف (F7)</SelectItem>
                          <SelectItem value="F8">8 غرف (F8)</SelectItem>
                          <SelectItem value="F9">+9 غرف (F9)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {showBathrooms && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        عدد الحمامات
                      </label>
                      <Input
                        lang="en"
                        name="bathrooms"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={formData.bathrooms || ""}
                        onChange={handleInputChange}
                        placeholder="—"
                        className="h-11 w-full border-gray-300"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {showFurnished && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        التأثيث
                      </label>
                      <Select
                        value={formData.furnished}
                        onValueChange={(v) =>
                          handleSelectChange("furnished", v)
                        }
                      >
                        <SelectTrigger className="h-11 w-full border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">غير مؤثث</SelectItem>
                          <SelectItem value="true">مؤثث</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {showRentPeriod && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        مدة الكراء
                      </label>
                      <Select
                        value={formData.rentPeriod}
                        onValueChange={(v) =>
                          handleSelectChange("rentPeriod", v)
                        }
                      >
                        <SelectTrigger className="h-11 w-full border-gray-300">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">
                            (المجهزة و اللفنادق) بالأيام
                          </SelectItem>
                          <SelectItem value="monthly">بالشهور</SelectItem>
                          <SelectItem value="yearly">بالسنوات </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {showTerrace && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        التيراس / السطح
                      </label>
                      <Select
                        value={formData.roof || "no"}
                        onValueChange={(v) => handleSelectChange("roof", v)}
                      >
                        <SelectTrigger className="h-11 w-full border-gray-300">
                          <SelectValue placeholder="اختر..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">لا يوجد</SelectItem>
                          <SelectItem value="yes">يوجد</SelectItem>
                          <SelectItem value="shared">مشترك</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. البنية والأبعاد التقنية */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-3">
                  البنية والأبعاد التقنية
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {showDimensions && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        الطول (متر)
                      </label>
                      <Input
                        name="length"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.length}
                        onChange={handleInputChange}
                        className="h-11 w-full border-gray-300"
                      />
                    </div>
                  )}
                  {showDimensions && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        العرض (متر)
                      </label>
                      <Input
                        name="width"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.width}
                        onChange={handleInputChange}
                        className="h-11 w-full border-gray-300"
                      />
                    </div>
                  )}
                  {showHectares && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        المساحة بالهكتار
                      </label>
                      <Input
                        name="hectares"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={formData.hectares}
                        onChange={handleInputChange}
                        placeholder="مثال: 1.5"
                        className="h-11 w-full border-gray-300"
                      />
                    </div>
                  )}
                  {showFacades && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        عدد الواجهات
                      </label>
                      <Input
                        name="facades"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="1"
                        max="4"
                        value={formData.facades || ""}
                        onChange={handleInputChange}
                        className="h-11 w-full border-gray-300"
                      />
                    </div>
                  )}
              
                </div>

             

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {showFloorsCount && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        عدد الطوابق
                      </label>
                      <Input
                        name="floors"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="1"
                        value={formData.floors || ""}
                        onChange={handleInputChange}
                        className="h-11 w-full border-gray-300"
                      />
                    </div>
                  )}
                  {showFloorNumber && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        رقم الطابق
                      </label>
                      <Input
                        name="floorNumber"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.floorNumber || ""}
                        onChange={handleInputChange}
                        className="h-11 w-full border-gray-300"
                      />
                    </div>
                  )}
                  {showConstructionYear && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        سنة الإنشاء
                      </label>
                      <Input
                        name="buildYear"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.buildYear || ""}
                        onChange={handleInputChange}
                        placeholder="مثال: 2020"
                        className="h-11 w-full border-gray-300"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {showPropertyCondition && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        حالة العقار
                      </label>
                      <Select
                        value={formData.propertyCondition || ""}
                        onValueChange={(v) =>
                          handleSelectChange("propertyCondition", v)
                        }
                      >
                        <SelectTrigger className="h-11 w-full border-gray-300">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">جديد / لم يسكن</SelectItem>
                          <SelectItem value="good">حالة جيدة</SelectItem>
                          <SelectItem value="old_house">قديم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {showConstructionStatus && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        حالة البناء
                      </label>
                      <Select
                        value={formData.buildCondition || ""}
                        onValueChange={(v) =>
                          handleSelectChange("buildCondition", v)
                        }
                      >
                        <SelectTrigger className="h-11 w-full border-gray-300">
                          <SelectValue placeholder="اختر حالة البناء" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="finished">100% مكتمل</SelectItem>
                          <SelectItem value="almost_finished">
                            شبه مكتمل
                          </SelectItem>
                          <SelectItem value="almost_finished">
                            نصف مكتمل
                          </SelectItem>
                          <SelectItem value="under_construction">
                            قيد الإنشاء
                          </SelectItem>
                          <SelectItem value="STRUCTURE">هيكل</SelectItem>
                          <SelectItem value="other">اخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {showBuildingMaterial && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        بنية العقار (خرسانة/جبس)
                      </label>
                      <Select
                        value={formData.structureType || ""}
                        onValueChange={(v) =>
                          handleSelectChange("structureType", v)
                        }
                      >
                        <SelectTrigger className="h-12 w-full border-gray-300">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concrete">خرسانة مسلحة</SelectItem>
                          <SelectItem value="brick"> جبس</SelectItem>
                          <SelectItem value="mixed">مختلط</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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

              {/* الوثائق المطلوبة (تظهر للبيع فقط) */}
              {transactionType === "buy" && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-3">
                    الوثائق المتوفرة للعقار
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    قم بتحديث الوثائق المتاحة لتظهر في صفحة الإعلان
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableDocuments.map((doc) => (
                      <label
                        key={doc.id}
                        className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-yellow-400 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.label)}
                          onChange={() => handleDocumentToggle(doc.label)}
                          className="shrink-0 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400 w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-800">
                          {doc.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* أرقام الهواتف */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    أرقام الهواتف للتواصل
                  </h3>
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
                          index === 0
                            ? "الرقم الرئيسي (إجباري)"
                            : `رقم إضافي ${index + 1} (اختياري)`
                        }
                        value={phone}
                        onChange={(e) =>
                          handlePhoneChange(index, e.target.value)
                        }
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

              {/* الموقع الجغرافي */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-3">
                  تحديد الموقع على الخريطة *
                </h3>
                <div className="h-[420px] rounded-xl overflow-hidden border border-gray-300 relative">
                  <MapPicker onSelect={(loc) => setLocation(loc)} initialPosition={location} />
                </div>
              </div>

              {/* زر الحفظ */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg rounded-xl transition-colors"
                >
                  {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
              </div>
              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}
            </motion.form>
          </div>

          {/* العمود الجانبي */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 flex flex-col gap-6">
              <div className="bg-gray-50 rounded-2xl shadow-sm p-6 border border-gray-200/80">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">
                  صور العقار *
                </h3>

                <div className="bg-blue-50/60 rounded-xl p-4 mb-4 border border-blue-100">
                  <p className="text-sm font-semibold text-blue-800 mb-3">
                    نصائح لصور احترافية:
                  </p>
                  <ul className="space-y-2 text-xs text-gray-600 list-disc list-inside">
                    <li>
                      <strong className="text-gray-800">
                        الإضاءة الطبيعية:
                      </strong>{" "}
                      افتح النوافذ والستائر والتقط الصور في وضح النهار.
                    </li>
                    <li>
                      <strong className="text-gray-800">الوضع الأفقي:</strong>{" "}
                      امسك هاتفك بالعرض (Landscape) لتصوير مساحة أوسع للغرفة.
                    </li>
                    <li>
                      <strong className="text-gray-800">
                        الترتيب والنظافة:
                      </strong>{" "}
                      رتب المكان وأخفِ الأغراض الشخصية لتبدو المساحات أكبر.
                    </li>
                    <li>
                      <strong className="text-gray-800">الشمولية:</strong> صوّر
                      الواجهة الخارجية، المطبخ، الحمام، وأي ملحقات (حديقة/شرفة).
                    </li>
                    <li>
                      <strong className="text-gray-800">الواقعية:</strong> تجنب
                      استخدام الفلاتر أو الصور المهتزة.
                    </li>
                  </ul>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white">
                  <UploadWidget
                    uwConfig={{
                      multiple: true,
                      cloudName: "lamadev", // غيّر إذا احتجت
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
                  <li>
                    التقط صوراً واضحة ومشرقة للعقار لتجذب أكبر عدد من المهتمين.
                  </li>
                  <li>اكتب وصفاً دقيقاً يبرز أهم المميزات والخدمات القريبة.</li>
                  <li>حدد السعر بشكل واقعي ومناسب لأسعار السوق الحالية.</li>
                  <li>
                    تأكد من صحة أرقام التواصل والوثائق وموقع العقار على الخريطة.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
