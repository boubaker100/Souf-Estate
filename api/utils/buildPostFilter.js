// ============================================================
// utils/buildPostFilter.js
// ============================================================
// دالة فلترة موحّدة تُستخدم في:
//   1) getPosts (القائمة العامة)  — بدون userId → تُظهر الإعلانات ACTIVE فقط
//   2) my-posts (لوحة المستخدم)   — مع userId  → كل إعلانات المستخدم

import { ENUMS } from "./postPayload.js";

function parseBooleanParam(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function safeEnumValue(enumList, value) {
  if (!value) return undefined;
  return enumList.includes(value) ? value : undefined;
}

// تحويل آمن للأرقام: يرجع undefined بدل NaN حتى لا ينهار Prisma
const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? undefined : n;
};
const toFloat = (v) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? undefined : n;
};

// بناء شرط نطاق (gte/lte) بدون إضافته إذا كانت القيمتان غير صالحتين
function rangeFilter(min, max, parser) {
  const range = {};
  const lo = min !== undefined && min !== "" ? parser(min) : undefined;
  const hi = max !== undefined && max !== "" ? parser(max) : undefined;
  if (lo !== undefined) range.gte = lo;
  if (hi !== undefined) range.lte = hi;
  return Object.keys(range).length ? range : undefined;
}

const PUBLISH_DATE_RANGES = {
  today: 1,
  week: 7,
  month: 30,
  "3months": 90,
  "6months": 180,
  year: 365,
};

export function buildPostFilter(query, userId) {
  const {
    search,
    status,
    type,
    city,
    property,
    rooms,
    rentPeriod,
    propertyCondition,
    constructionStatus,
    buildingMaterial,
    ownershipDocument,
    terrace,
    furnished,
    garage,
    gas,
    electricity,
    sewage,
    waterTank,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    minHectares,
    maxHectares,
    minBathrooms,
    minFacades,
    publishDate,
  } = query;

  const filter = {};

  if (userId) {
    // لوحة المستخدم: إعلاناته فقط، ويمكنه تصفية الحالة اختيارياً
    filter.userId = userId;
    if (status) filter.status = String(status);
  } else {
    // القائمة العامة: الإعلانات المنشورة فقط، ولا يمكن للزائر تغييرها
    filter.status = "ACTIVE";
  }

  // 1. البحث النصي
  if (search) {
    filter.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // 2. enum مباشرة
  if (safeEnumValue(ENUMS.type, type)) filter.type = type;
  if (safeEnumValue(ENUMS.property, property)) filter.property = property;
  if (city) filter.city = city;
  if (safeEnumValue(ENUMS.rooms, rooms)) filter.rooms = rooms;
  if (safeEnumValue(ENUMS.rentPeriod, rentPeriod)) filter.rentPeriod = rentPeriod;
  if (safeEnumValue(ENUMS.propertyCondition, propertyCondition))
    filter.propertyCondition = propertyCondition;
  if (safeEnumValue(ENUMS.constructionStatus, constructionStatus))
    filter.constructionStatus = constructionStatus;
  if (safeEnumValue(ENUMS.buildingMaterial, buildingMaterial))
    filter.buildingMaterial = buildingMaterial;

  // 3. الوثائق (مصفوفة)
  if (safeEnumValue(ENUMS.ownershipDocument, ownershipDocument)) {
    filter.ownershipDocuments = { has: ownershipDocument };
  }

  // 4. Boolean
  const boolFields = { terrace, furnished, garage, gas, electricity, sewage, waterTank };
  Object.entries(boolFields).forEach(([key, rawValue]) => {
    const parsed = parseBooleanParam(rawValue);
    if (parsed !== undefined) filter[key] = parsed;
  });

  // 5. السعر
  const price = rangeFilter(minPrice, maxPrice, toInt);
  if (price) filter.price = price;

  // 6. المساحة بالمتر المربع (حقل area المحسوب = width × length)
  const area = rangeFilter(minArea, maxArea, toFloat);
  if (area) filter.area = area;

  // 7. الهكتار
  const hectares = rangeFilter(minHectares, maxHectares, toFloat);
  if (hectares) filter.hectares = hectares;

  // 8. حد أدنى للحمامات/الواجهات
  const bath = toInt(minBathrooms);
  if (bath !== undefined) filter.bathrooms = { gte: bath };
  const fac = toInt(minFacades);
  if (fac !== undefined) filter.facades = { gte: fac };

  // 9. تاريخ النشر
  if (publishDate && PUBLISH_DATE_RANGES[publishDate]) {
    const since = new Date();
    since.setDate(since.getDate() - PUBLISH_DATE_RANGES[publishDate]);
    filter.createdAt = { gte: since };
  }

  return filter;
}