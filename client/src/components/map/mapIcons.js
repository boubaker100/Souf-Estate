import L from "leaflet";

// ملاحظة: تم استبدال شكل "الدمعة" الكلاسيكي بدبوس دائري مسطح حديث مع ظل
// خفيف — أسلوب أقرب لخرائط Google/Airbnb. هذا الشكل أوضح وأسهل للتمييز
// عند تقارب عدد كبير من العلامات على نفس المنطقة، بعكس شكل الدمعة الذي
// يتشابك بصرياً بسهولة ويبدو تقليدياً.
// الألوان موحّدة مع الكارد (PropertyCard.jsx): أزرق للبيع (#2563eb =
// Tailwind blue-600) وأخضر للكراء (#059669 = Tailwind emerald-600).

function createPinIcon(hexColor) {
  return L.divIcon({
    className: "custom-pin-icon",
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: ${hexColor};
        border: 3px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.28), 0 1px 3px rgba(0,0,0,0.18);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

export const rentIcon = createPinIcon("#059669"); // أخضر — كراء
export const buyIcon = createPinIcon("#2563eb"); // أزرق — بيع