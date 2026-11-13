import { useMemo } from "react";

/**
 * جدول الحقول حسب نوع العقار: كل نوع = قائمة الحقول التي تظهر له فقط.
 * أي حقل غير مذكور = مخفي. (كان سابقاً ناقصاً electricity/sewage في عدة أنواع
 * فتختفي من الفورم بالخطأ)
 */
const f = (...keys) => Object.fromEntries(keys.map((k) => [k, true]));

const ALL_FIELDS = [
  "rooms", "bathrooms", "floor", "buildingFloors", "facades",
  "propertyCondition", "constructionStatus", "buildingMaterial", "constructionYear",
  "furnished", "garage", "gas", "waterTank", "terrace", "dimensions",
  "electricity", "sewage",
];

const PROPERTY_FIELD_MATRIX = {
  apartment: f("rooms", "bathrooms", "floor", "propertyCondition", "buildingMaterial",
    "furnished", "garage", "gas", "waterTank", "electricity", "sewage"),
  residence: f("rooms", "bathrooms", "buildingFloors", "facades", "propertyCondition",
    "constructionStatus", "buildingMaterial", "constructionYear", "furnished", "garage",
    "gas", "waterTank", "terrace", "dimensions", "electricity", "sewage"),
  arabic_house: f("rooms", "bathrooms", "facades", "propertyCondition", "constructionStatus",
    "constructionYear", "furnished", "garage", "gas", "terrace", "dimensions",
    "electricity", "sewage"),
  villa: f("rooms", "bathrooms", "buildingFloors", "facades", "propertyCondition",
    "constructionStatus", "constructionYear", "furnished", "garage", "gas", "waterTank",
    "terrace", "dimensions", "electricity", "sewage"),
  building: f("buildingFloors", "facades", "propertyCondition", "constructionStatus",
    "buildingMaterial", "constructionYear", "garage", "gas", "waterTank", "terrace",
    "dimensions", "electricity", "sewage"),
  land: f("facades", "dimensions", "electricity"),
  farm_land: f("facades", "dimensions", "electricity"),
  garden: f("dimensions", "electricity"),
  shop: f("bathrooms", "floor", "facades", "propertyCondition", "constructionStatus",
    "buildingMaterial", "constructionYear", "furnished", "garage", "gas", "dimensions",
    "electricity", "sewage"),
  office: f("rooms", "bathrooms", "floor", "propertyCondition", "constructionStatus",
    "buildingMaterial", "constructionYear", "furnished", "garage", "gas", "dimensions",
    "electricity", "sewage"),
  garage: f("facades", "propertyCondition", "constructionStatus", "buildingMaterial",
    "constructionYear", "dimensions", "electricity"),
  warehouse: f("bathrooms", "facades", "propertyCondition", "constructionStatus",
    "buildingMaterial", "constructionYear", "garage", "waterTank", "dimensions",
    "electricity", "sewage"),
  factory: f("bathrooms", "facades", "propertyCondition", "constructionStatus",
    "buildingMaterial", "constructionYear", "garage", "gas", "waterTank", "dimensions",
    "electricity", "sewage"),
  chalet: f("rooms", "bathrooms", "buildingFloors", "facades", "propertyCondition",
    "constructionStatus", "buildingMaterial", "constructionYear", "furnished", "garage",
    "gas", "terrace", "dimensions", "electricity", "sewage"),
  farm: f("rooms", "bathrooms", "buildingFloors", "facades", "propertyCondition",
    "constructionStatus", "buildingMaterial", "constructionYear", "furnished", "garage",
    "gas", "terrace", "dimensions", "electricity", "sewage"),
  other: f(...ALL_FIELDS),
};

const DEFAULT_FIELDS = PROPERTY_FIELD_MATRIX.other;

export const usePropertyFormLogic = (formData) => {
  return useMemo(() => {
    const { property, type: postType } = formData;
    const isRent = postType === "rent";
    const fields = PROPERTY_FIELD_MATRIX[property] ?? DEFAULT_FIELDS;

    return {
      disableRentPeriod: !isRent,
      disableRooms: !fields.rooms,
      disableBathrooms: !fields.bathrooms,
      disableFloor: !fields.floor,
      disableBuildingFloors: !fields.buildingFloors,
      disableFacades: !fields.facades,
      disablePropertyCondition: !fields.propertyCondition,
      disableConstructionStatus: !fields.constructionStatus,
      disableBuildingMaterial: !fields.buildingMaterial,
      disableConstructionYear: !fields.constructionYear,
      disableFurnished: !fields.furnished,
      disableGarage: !fields.garage,
      disableGas: !fields.gas,
      disableWaterTank: !fields.waterTank,
      disableTerrace: !fields.terrace,
      disableDimensions: !fields.dimensions,
      disableElectricity: !fields.electricity,
      disableSewage: !fields.sewage,
      disableOwnershipDocuments: false,
    };
  }, [formData.property, formData.type]);
};

export { PROPERTY_FIELD_MATRIX };