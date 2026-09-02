import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
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

function Checkout() {
    const navigate = useNavigate();

    // Данные формы
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [address, setAddress] = useState("");
    const [note, setNote] = useState("");

    // Координаты маркера на карте
    const [markerLat, setMarkerLat] = useState(BISHKEK[0]);
    const [markerLng, setMarkerLng] = useState(BISHKEK[1]);

    // Корзина из localStorage
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem("cart");
        if (saved) {
            setCart(JSON.parse(saved));
        }
    }, []);

    // Клик по карте — ставит маркер
    function handleMapClick(latlng) {
        setMarkerLat(latlng.lat);
        setMarkerLng(latlng.lng);
    }

    // Стоимость доставки по городу
    const DELIVERY_FEE = 400;

    // Сумма товаров
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Итоговая сумма с доставкой
    const total = subtotal + DELIVERY_FEE;

    // Отправка заказа
    function submitOrder(e) {
        e.preventDefault();

        const order = {
            customerName: customerName,
            customerPhone: customerPhone,
            address: address,
            note: note,
            lat: markerLat,
            long: markerLng,
            items: cart,
            totalAmount: total,
            status: "pending",
        };

        axios.post("https://69a007f73188b0b1d537859e.mockapi.io/orders", order).then(() => {
            alert("Заказ оформлен!");
            localStorage.removeItem("cart");
            navigate("/orders");
        });
    }

    return (
        <div className="container mt-4">
            <h1>Оформление заказа</h1>
            <button className="btn btn-secondary mb-3" onClick={() => navigate("/products")}>
                ← Назад к товарам
            </button>

            <div className="row">
                {/* Левая колонка — форма */}
                <div className="col-md-6">
                    <form onSubmit={submitOrder}>
                        <h4>Данные получателя</h4>

                        <div className="mb-3">
                            <label className="form-label">Имя</label>
                            <input
                                type="text"
                                className="form-control"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                                placeholder="Иван Иванов"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Телефон</label>
                            <input
                                type="tel"
                                className="form-control"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                required
                                placeholder="+996 700 000 000"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Адрес доставки</label>
                            <input
                                type="text"
                                className="form-control"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                placeholder="ул. Чуй, 123"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Комментарий</label>
                            <textarea
                                className="form-control"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Позвоните за 30 минут..."
                                rows={3}
                            />
                        </div>

                        <p className="text-muted">
                            📍 Координаты: {markerLat.toFixed(5)}, {markerLng.toFixed(5)}
                        </p>

                        {/* Состав заказа */}
                        <h4 className="mt-3">Состав заказа</h4>
                        {cart.length === 0 ? (
                            <p>Корзина пуста</p>
                        ) : (
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Название</th>
                                        <th>Кол-во</th>
                                        <th>Сумма</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.price * item.quantity} сом</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* Блок с итогами отдельно от таблицы */}
                        {cart.length > 0 && (
                            <div className="border rounded p-3 mt-2 bg-light">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Сумма товаров</span>
                                    <span>{subtotal} сом</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">🚴 Доставка по городу</span>
                                    <span>{DELIVERY_FEE} сом</span>
                                </div>
                                <hr className="my-2" />
                                <div className="d-flex justify-content-between">
                                    <strong>Итого</strong>
                                    <strong className="text-success fs-5">{total} сом</strong>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn btn-success w-100 mt-3" disabled={cart.length === 0}>
                            Подтвердить заказ
                        </button>
                    </form>
                </div>

                {/* Правая колонка — карта */}
                <div className="col-md-6">
                    <h4>Укажите адрес на карте</h4>
                    <p className="text-muted">Нажмите на карту, чтобы поставить метку</p>
                    <MapContainer center={BISHKEK} zoom={13} style={{ height: 500, width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <MapClickHandler onMapClick={handleMapClick} />
                        <Marker position={[markerLat, markerLng]} />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
