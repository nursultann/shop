import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Фикс иконки маркера Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Координаты Бишкека по умолчанию
const BISHKEK = [42.8746, 74.5698];

// Компонент для клика по карте
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
}

const OrdersDetail = () => {
    const id = useParams().id;
    const [order, setOrder] = useState(null);
    // Координаты маркера на карте
    const [markerLat, setMarkerLat] = useState(BISHKEK[0]);
    const [markerLng, setMarkerLng] = useState(BISHKEK[1]);
    
    useEffect(() => {
        axios.get(`https://69a007f73188b0b1d537859e.mockapi.io/orders/${id}`).then((res) => {
            setOrder(res.data);
            if (res.data.lat && res.data.long) {
                setMarkerLat(res.data.lat);
                setMarkerLng(res.data.long);
            }
        });
    }, []);
    return (
        <div>
            {order ? (
                <div className="card p-3">
                    <h5>Заказ #{order.id}</h5>
                    <p><strong>Имя:</strong> {order.customerName}</p>
                    <p><strong>Телефон:</strong> {order.customerPhone}</p>
                    <p><strong>Адрес:</strong> {order.address}</p>
                    <p><strong>Примечание:</strong> {order.note}</p>
                    <p><strong>Статус:</strong> {order.status}</p>
                    <p><strong>Сумма:</strong> {order.totalAmount} сом</p>

                    <MapContainer center={[markerLat, markerLng]} zoom={13} style={{ height: "400px", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={[markerLat, markerLng]} />
                        <MapClickHandler onMapClick={(latlng) => {
                            setMarkerLat(latlng.lat);
                            setMarkerLng(latlng.lng);
                        }} />
                    </MapContainer>
                </div>
            ) : (
                <p>Заказ не найден</p>
            )}

        </div>
    )
}

export default OrdersDetail