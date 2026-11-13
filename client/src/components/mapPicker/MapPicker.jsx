import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";

function LocationMarker({ onSelect, initialPosition }) {
  const [position, setPosition] = useState(
    initialPosition ? { lat: Number(initialPosition.lat), lng: Number(initialPosition.lng) } : null
  );

  useEffect(() => {
    if (initialPosition) {
      setPosition({ lat: Number(initialPosition.lat), lng: Number(initialPosition.lng) });
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
    initialPosition ? [Number(initialPosition.lat), Number(initialPosition.lng)] : [33.367, 6.851]
  );

  useEffect(() => {
    if (initialPosition) {
      setCenter([Number(initialPosition.lat), Number(initialPosition.lng)]);
    }
  }, [initialPosition]);

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker onSelect={onSelect} initialPosition={initialPosition} />
    </MapContainer>
  );
}