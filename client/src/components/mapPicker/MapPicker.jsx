import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import { MousePointerClick, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

const isValidLatLng = (lat, lng) => {
  const nLat = Number(lat);
  const nLng = Number(lng);
  return (
    Number.isFinite(nLat) &&
    Number.isFinite(nLng) &&
    nLat >= -90 &&
    nLat <= 90 &&
    nLng >= -180 &&
    nLng <= 180
  );
};

const DEFAULT_CENTER = [33.3683, 6.8674]; // El Oued

function LocationMarker({ onSelect, initialPosition }) {
  const [position, setPosition] = useState(
    initialPosition && isValidLatLng(initialPosition.lat, initialPosition.lng)
      ? { lat: Number(initialPosition.lat), lng: Number(initialPosition.lng) }
      : null
  );

  useEffect(() => {
    if (initialPosition && isValidLatLng(initialPosition.lat, initialPosition.lng)) {
      setPosition({ lat: Number(initialPosition.lat), lng: Number(initialPosition.lng) });
    } else {
      setPosition(null);
    }
  }, [initialPosition]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ onSelect, initialPosition }) {
  const [center, setCenter] = useState(
    initialPosition && isValidLatLng(initialPosition.lat, initialPosition.lng)
      ? [Number(initialPosition.lat), Number(initialPosition.lng)]
      : DEFAULT_CENTER
  );

  const [isMapActive, setIsMapActive] = useState(false);

  useEffect(() => {
    if (initialPosition && isValidLatLng(initialPosition.lat, initialPosition.lng)) {
      setCenter([Number(initialPosition.lat), Number(initialPosition.lng)]);
    } else {
      setCenter(DEFAULT_CENTER);
    }
  }, [initialPosition]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker onSelect={onSelect} initialPosition={initialPosition} />
      </MapContainer>

      {/* Overlay - only on mobile */}
      {!isMapActive && (
        <div
          className="md:hidden absolute inset-0 z-[400] flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px] cursor-pointer rounded-xl"
          onClick={() => setIsMapActive(true)}
        >
          <div className="bg-white/95 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-semibold text-gray-800">اضغط للتفاعل مع الخريطة</span>
          </div>
        </div>
      )}

      {/* Close button - only when active, mobile only */}
      {isMapActive && (
        <button
          type="button"
          className="md:hidden absolute top-2 left-2 z-[400] bg-white/95 hover:bg-white p-2 rounded-full shadow-lg"
          onClick={() => setIsMapActive(false)}
          aria-label="إنهاء التفاعل مع الخريطة"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>
      )}
    </div>
  );
}