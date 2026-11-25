import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { InteractiveMapWrapper } from "@/components/map/InteractiveMapWrapper";

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

  useEffect(() => {
    if (initialPosition && isValidLatLng(initialPosition.lat, initialPosition.lng)) {
      setCenter([Number(initialPosition.lat), Number(initialPosition.lng)]);
    } else {
      setCenter(DEFAULT_CENTER);
    }
  }, [initialPosition]);

  return (
    <InteractiveMapWrapper className="w-full h-full">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker onSelect={onSelect} initialPosition={initialPosition} />
      </MapContainer>
    </InteractiveMapWrapper>
  );
}