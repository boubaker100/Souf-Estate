// ============================================================
// utils/postPayload.js
// ============================================================
import {
  PostType,
  PropertyType,
  Rooms,
  RentPeriod,
  PropertyCondition,
  ConstructionStatus,
  OwnershipDocument,
  BuildingMaterial,
} from "@prisma/client";

export const ENUMS = {
  type: Object.values(PostType),
  property: Object.values(PropertyType),
  rooms: Object.values(Rooms),
  rentPeriod: Object.values(RentPeriod),
  propertyCondition: Object.values(PropertyCondition),
  constructionStatus: Object.values(ConstructionStatus),
  ownershipDocument: Object.values(OwnershipDocument),
  buildingMaterial: Object.values(BuildingMaterial),
};

export class PostValidationError extends Error {}

function checkEnum(field, value) {
  if (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    !ENUMS[field].includes(value)
  ) {
    throw new PostValidationError(`قيمة الحقل "${field}" غير صالحة`);
  }
}

// null/undefined/"" تبقى null (الحقل غير منطبق)؛ "yes"/"true"/true → true، غير ذلك → false
function parseYesNo(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value;
  return value === "yes" || value === "true";
}

// توافق مع القيم القديمة التي كانت تُرسل من الفورم سابقاً
function mapEnumValue(field, value) {
  if (!value) return null;
  const mapping = {
    propertyCondition: { new: "NEW", good: "LIKE_NEW", old: "OLD", old_house: "OLD" },
    constructionStatus: {
      finished: "FINISHED",
      almost_finished: "ALMOST_FINISHED",
      half_finished: "HALF_FINISHED",
      under_construction: "STRUCTURE",
      other: "OTHER",
    },
    buildingMaterial: { concrete: "CONCRETE", brick: "PLASTER", mixed: "MIXED" },
  };
  return mapping[field]?.[value] ?? value;
}

export function buildPostData(body, existing = null) {
  const isCreate = existing === null;

  const raw = (key) =>
    body[key] !== undefined ? body[key] : isCreate ? null : existing[key];

  // رقم آمن: النص غير الرقمي يصبح null بدل NaN
  const num = (key) => {
    if (body[key] !== undefined && body[key] !== null && body[key] !== "") {
      const n = Number(body[key]);
      return Number.isNaN(n) ? null : n;
    }
    return isCreate ? null : existing[key];
  };

  // الهواتف
  let phones = isCreate ? [] : existing.phones;
  if (Array.isArray(body.phones)) phones = body.phones.filter(Boolean);
  else if (typeof body.phone === "string" && body.phone.trim())
    phones = [body.phone.trim()];

  // الوثائق
  let ownershipDocs = isCreate ? [] : existing.ownershipDocuments || [];
  if (Array.isArray(body.ownershipDocuments)) {
    ownershipDocs = body.ownershipDocuments.filter(Boolean);
    ownershipDocs.forEach((doc) => {
      if (!ENUMS.ownershipDocument.includes(doc)) {
        throw new PostValidationError(`قيمة الوثيقة "${doc}" غير صالحة`);
      }
    });
  } else if (
    typeof body.ownershipDocument === "string" &&
    body.ownershipDocument.trim()
  ) {
    ownershipDocs = [body.ownershipDocument.trim()];
    checkEnum("ownershipDocument", ownershipDocs[0]);
  }

  // التحقق من enum الأساسية
  ["type", "property", "rooms", "rentPeriod"].forEach((field) =>
    checkEnum(field, body[field]),
  );

  // enum مع التحويل ثم التحقق
  const propertyCondition = mapEnumValue("propertyCondition", raw("propertyCondition"));
  const constructionStatus = mapEnumValue(
    "constructionStatus",
    raw("constructionStatus") ?? raw("buildCondition"),
  );
  const buildingMaterial = mapEnumValue(
    "buildingMaterial",
    raw("buildingMaterial") ?? raw("structureType"),
  );
  checkEnum("propertyCondition", propertyCondition);
  checkEnum("constructionStatus", constructionStatus);
  checkEnum("buildingMaterial", buildingMaterial);

  // المساحة المحسوبة
  const width = num("width");
  const length = num("length");
  const area = width && length ? Math.round(width * length * 100) / 100 : null;

  return {
    title: raw("title"),
    price: num("price"),
    type: raw("type"),
    property: raw("property"),
    city: typeof body.city === 'string' ? body.city : null,
    neighborhood: raw("district") || raw("neighborhood"),
    description: raw("description"),

    rooms: raw("rooms") || null,
    bathrooms: num("bathrooms"),

    floor: num("floorNumber") ?? (isCreate ? null : existing.floor),
    buildingFloors: num("floors") ?? (isCreate ? null : existing.buildingFloors),
    facades: num("facades"),

    propertyCondition,
    constructionStatus,
    buildingMaterial,

    ownershipDocuments: ownershipDocs,

    furnished: parseYesNo(raw("furnished")),
    garage: parseYesNo(raw("garage")),
    gas: parseYesNo(raw("gas")),
    waterTank: parseYesNo(raw("waterTank")),
    terrace: parseYesNo(body.roof !== undefined ? body.roof : raw("terrace")),
    electricity: parseYesNo(raw("electricity")),
    sewage: parseYesNo(raw("sewage")),

    constructionYear: num("buildYear") ?? (isCreate ? null : existing.constructionYear),

    rentPeriod: raw("rentPeriod") || null,

    latitude: num("latitude"),
    longitude: num("longitude"),
    width,
    length,
    area,
    hectares: num("hectares"),

    phones,
    images: Array.isArray(body.images) ? body.images : ["https://placehold.co/600x400?text=No+Image"],
    video: body.videoLink
      ? String(body.videoLink).trim()
      : isCreate
        ? null
        : existing.video,
  };
}