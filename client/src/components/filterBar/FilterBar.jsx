import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RotateCcw } from "lucide-react"

const municipalities = [
  "الوادي", "الرباح", "وادي العلندة", "البياضة", "النخلة", "قمار", "كوينين",
  "الرقيبة", "الحمراية", "تغزوت", "الدبيلة", "حساني عبد الكريم", "حاسي خليفة",
  "طالب العربي", "دوار الماء", "سيدي عون", "الطريفاوي", "المقرن", "بن قشة",
  "ورماس", "العقلة", "ميه ونسة",
]

// ===== القيم مطابقة تماماً لـ schema.prisma ولفورم الإضافة =====
const propertyTypes = [
  { value: "apartment", label: "شقة سكنية" },
  { value: "residence", label: "سكنة" },
  { value: "arabic_house", label: "حوش عربي / جبس" },
  { value: "villa", label: "فيلا" },
  { value: "building", label: "عمارة" },
  { value: "land", label: "أرض للبناء" },
  { value: "farm_land", label: "أرض فلاحية" },
  { value: "garden", label: "حويطة" },
  { value: "shop", label: "محل تجاري" },
  { value: "office", label: "مكتب" },
  { value: "garage", label: "كراج" },
  { value: "warehouse", label: "مستودع / مخزن" },
  { value: "factory", label: "مصنع" },
  { value: "chalet", label: "شاليه / استراحة" },
  { value: "farm", label: "مزرعة" },
  { value: "other", label: "أخرى" },
]

const roomsOptions = ["STUDIO", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"]

const rentPeriods = [
  { value: "daily", label: "يومي" },
  { value: "weekly", label: "أسبوعي" },
  { value: "monthly", label: "شهري" },
  { value: "yearly", label: "سنوي" },
]

const publishDateOptions = [
  { value: "today", label: "آخر يوم" },
  { value: "week", label: "آخر أسبوع" },
  { value: "month", label: "آخر شهر" },
  { value: "3months", label: "آخر 3 أشهر" },
  { value: "6months", label: "آخر 6 أشهر" },
  { value: "year", label: "آخر سنة" },
]

const initialFilters = {
  type: "",
  property: "",
  city: "",
  minPrice: "",
  maxPrice: "",
  rooms: "",
  rentPeriod: "",
  furnished: "",
  publishDate: "",
  minArea: "",
  maxArea: "",
  minHectares: "",
  maxHectares: "",
}

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
}

const selectClass =
  "h-11 w-full border-gray-300 bg-white text-gray-900 hover:border-yellow-400 focus:ring-yellow-400"
const inputClass =
  "h-9 w-full border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 hover:border-yellow-400 focus:ring-yellow-400"
const disabledClass = "opacity-50 cursor-not-allowed"

function Cell({ i, label, children }) {
  return (
    <motion.div custom={i} variants={itemVariants} className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </motion.div>
  )
}

function Row({ delay = 0, children }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: delay } } }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {children}
    </motion.div>
  )
}

function FilterSelect({ value, onChange, placeholder, options, disabled }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={`${selectClass} ${disabled ? disabledClass : ""}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function FilterBar({ onFilterChange }) {
  const [filters, setFilters] = useState(initialFilters)

  const isLand = filters.property === "land" || filters.property === "farm_land"
  const isFarmLand = filters.property === "farm_land"
  const isBuy = filters.type === "buy"

  const handleChange = (name, value) => {
    const updated = { ...filters, [name]: value }

    // تنظيف الفلاتر التي تصبح غير منطبقة، وإلا تبقى مُرسلة بصمت وتُفرغ النتائج
    if (name === "property") {
      const land = value === "land" || value === "farm_land"
      if (land) {
        updated.rooms = ""
        updated.furnished = ""
      }
      if (value === "farm_land") {
        updated.minArea = ""
        updated.maxArea = ""
      } else {
        updated.minHectares = ""
        updated.maxHectares = ""
      }
    }

    if (name === "type" && value === "buy") {
      updated.rentPeriod = ""
      updated.furnished = "" // إعلانات البيع لا تحمل قيمة التأثيث
    }

    setFilters(updated)
    onFilterChange(updated)
  }

  const handleReset = () => {
    setFilters(initialFilters)
    onFilterChange(initialFilters)
  }

  const activeCount = Object.values(filters).filter((v) => v).length

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 px-6 sm:px-10 py-8 shadow-lg border border-gray-200"
    >
      <div className="max-w-6xl mx-auto text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          ابحث عن عقار احلامك في ولاية الوادي
        </h1>
        <p className="my-4 text-gray-600">
          فيلتر البحث يساعدك في تحديد العقار الذي تريده بدقة
        </p>
      </div>

      <div className="space-y-4">
        {/* الصف الأول */}
        <Row>
          <Cell i={0} label="نوع العملية">
            <FilterSelect
              value={filters.type}
              onChange={(v) => handleChange("type", v)}
              placeholder="كراء/بيع"
              options={[
                { value: "buy", label: "بيع" },
                { value: "rent", label: "كراء" },
              ]}
            />
          </Cell>
          <Cell i={1} label="نوع العقار">
            <FilterSelect
              value={filters.property}
              onChange={(v) => handleChange("property", v)}
              placeholder="اختر نوع العقار"
              options={propertyTypes}
            />
          </Cell>
          <Cell i={2} label="البلدية">
            <FilterSelect
              value={filters.city}
              onChange={(v) => handleChange("city", v)}
              placeholder="اختر البلدية"
              options={municipalities.map((m) => ({ value: m, label: m }))}
            />
          </Cell>
          <Cell i={3} label="عدد الغرف">
            <FilterSelect
              value={filters.rooms}
              onChange={(v) => handleChange("rooms", v)}
              placeholder="اختر عدد الغرف"
              disabled={isLand}
              options={roomsOptions.map((r) => ({
                value: r,
                label: r === "STUDIO" ? "استوديو" : r,
              }))}
            />
          </Cell>
        </Row>

        {/* الصف الثاني */}
        <Row delay={0.15}>
          <Cell i={0} label="السعر من (دج)">
            <Input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleChange("minPrice", e.target.value)}
              placeholder="مثال: 5000000"
              className={inputClass}
            />
          </Cell>
          <Cell i={1} label="السعر إلى (دج)">
            <Input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleChange("maxPrice", e.target.value)}
              placeholder="مثال: 50000000"
              className={inputClass}
            />
          </Cell>
          <Cell i={2} label="تاريخ النشر">
            <FilterSelect
              value={filters.publishDate}
              onChange={(v) => handleChange("publishDate", v)}
              placeholder="اختر التاريخ"
              options={publishDateOptions}
            />
          </Cell>
          <Cell i={3} label="مدة الكراء">
            <FilterSelect
              value={filters.rentPeriod}
              onChange={(v) => handleChange("rentPeriod", v)}
              placeholder="اختر مدة الكراء"
              disabled={isBuy}
              options={rentPeriods}
            />
          </Cell>
        </Row>

        {/* الصف الثالث */}
        <Row delay={0.25}>
          <Cell i={0} label="التأثيث">
            <FilterSelect
              value={filters.furnished}
              onChange={(v) => handleChange("furnished", v)}
              placeholder="مؤثث/غير مؤثث"
              disabled={isLand || isBuy}
              options={[
                { value: "true", label: "مؤثث" },
                { value: "false", label: "غير مؤثث" },
              ]}
            />
          </Cell>

          {!isFarmLand && (
            <>
              <Cell i={2} label="المساحة من (م²)">
                <Input
                  type="number"
                  value={filters.minArea}
                  onChange={(e) => handleChange("minArea", e.target.value)}
                  placeholder="مثال: 100"
                  className={inputClass}
                />
              </Cell>
              <Cell i={3} label="المساحة إلى (م²)">
                <Input
                  type="number"
                  value={filters.maxArea}
                  onChange={(e) => handleChange("maxArea", e.target.value)}
                  placeholder="مثال: 300"
                  className={inputClass}
                />
              </Cell>
            </>
          )}

          {isFarmLand && (
            <>
              <Cell i={2} label="المساحة من (هكتار)">
                <Input
                  type="number"
                  step="0.01"
                  value={filters.minHectares}
                  onChange={(e) => handleChange("minHectares", e.target.value)}
                  placeholder="مثال: 1"
                  className={inputClass}
                />
              </Cell>
              <Cell i={3} label="المساحة إلى (هكتار)">
                <Input
                  type="number"
                  step="0.01"
                  value={filters.maxHectares}
                  onChange={(e) => handleChange("maxHectares", e.target.value)}
                  placeholder="مثال: 5"
                  className={inputClass}
                />
              </Cell>
            </>
          )}
        </Row>

        <div className="flex items-center justify-between gap-4 pt-2">
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-11 border-2 border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 hover:border-yellow-400 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            إعادة تعيين
          </Button>

          {activeCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <p className="text-sm text-blue-900 font-medium">
                ✓ عدد الفلاتر المفعلة: {activeCount}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}