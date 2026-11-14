import { Marker, Popup } from "react-leaflet";
import "./pin.scss";
import { Link } from "react-router-dom";
import { getImageUrl } from "@/lib/getImageUrl";
import { formatPrice } from "@/lib/formatPrice";

function Pin({ item }) {
  return (
    <Marker position={[item.latitude, item.longitude]}>
      <Popup>
        <div className="popupContainer">
          <img src={getImageUrl(item.images)} alt={item.title || "صورة عقار"} onError={(e) => { e.currentTarget.src = "/souf.webp"; }} />
          <div className="textContainer">
            <Link to={`/${item.id}`}>{item.title}</Link>
            <span>{item.bedroom} bedroom</span>
            <b>{formatPrice(item.price)}</b>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default Pin;
