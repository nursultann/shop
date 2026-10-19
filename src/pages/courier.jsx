import { useState, useEffect } from "react";
import axios from "axios";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Фикс иконки маркера Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Иконка для курьера (синяя)
const courierIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Иконка для заказа (красная)
const orderIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Иконка для выбранного заказа (зелёная)
const selectedOrderIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const API = "https://69a007f73188b0b1d537859e.mockapi.io/orders";

// Склад / точка выдачи — ТЦ Бишкек Парк, проспект Манаса
const BISHKEK = [42.8752, 74.6057];

const STATUS_COLORS = {
    pending: { bg: "#fff3cd", text: "#856404", label: "Ожидает" },
    in_transit: { bg: "#cfe2ff", text: "#084298", label: "В пути" },
    delivered: { bg: "#d1e7dd", text: "#0f5132", label: "Доставлен" },
};

function FitBounds({ points }) {
    const map = useMap();
    useEffect(() => {
        if (points && points.length > 1) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points, map]);
    return null;
}

function FlyTo({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 16, { duration: 1.2 });
        }
    }, [position, map]);
    return null;
}

function Courier() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courierPos] = useState(BISHKEK);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [routePoints, setRoutePoints] = useState([]);
    const [routeLoading, setRouteLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [updatingId, setUpdatingId] = useState(null);

    // Поиск адреса
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchMarker, setSearchMarker] = useState(null);
    const [flyTarget, setFlyTarget] = useState(null);

    useEffect(() => {
        axios.get(API).then((res) => {
            setOrders(res.data);
            setLoading(false);
        });
    }, []);

    // Поиск адреса через Nominatim с debounce
    useEffect(() => {
        if (searchQuery.trim().length < 3) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await axios.get("https://nominatim.openstreetmap.org/search", {
                    params: {
                        q: searchQuery,
                        format: "json",
                        limit: 5,
                        countrycodes: "kg",
                        "accept-language": "ru",
                    },
                    headers: { "Accept-Language": "ru" },
                });
                setSearchResults(res.data);
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    function selectSearchResult(result) {
        const pos = [parseFloat(result.lat), parseFloat(result.lon)];
        setSearchMarker(pos);
        setFlyTarget(pos);
        setSearchQuery(result.display_name);
        setSearchResults([]);
    }

    function clearSearch() {
        setSearchQuery("");
        setSearchResults([]);
        setSearchMarker(null);
        setFlyTarget(null);
    }

    const filteredOrders = orders.filter((o) =>
        statusFilter === "all" ? true : o.status === statusFilter
    );

    const ordersWithCoords = filteredOrders.filter(
        (o) => o.lat && o.long && !isNaN(parseFloat(o.lat)) && !isNaN(parseFloat(o.long))
    );

    async function buildRoute(order) {
        if (!courierPos) return;
        if (!order.lat || !order.long) {
            alert("У этого заказа нет координат на карте!");
            return;
        }
        setSelectedOrder(order);
        setRouteLoading(true);
        setRoutePoints([]);

        const toLat = parseFloat(order.lat);
        const toLng = parseFloat(order.long);

        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${courierPos[1]},${courierPos[0]};${toLng},${toLat}?overview=full&geometries=geojson`;
            const res = await axios.get(url);
            const coords = res.data.routes[0].geometry.coordinates;
            setRoutePoints(coords.map(([lng, lat]) => [lat, lng]));
        } catch (e) {
            setRoutePoints([courierPos, [toLat, toLng]]);
        } finally {
            setRouteLoading(false);
        }
    }

    function openGoogleMaps(order) {
        if (!order.lat || !order.long) {
            alert("У этого заказа нет координат!");
            return;
        }
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.lat},${order.long}`, "_blank");
    }

    async function changeStatus(order, newStatus) {
        setUpdatingId(order.id);
        try {
            await axios.put(`${API}/${order.id}`, { ...order, status: newStatus });
            setOrders((prev) =>
                prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
            );
            if (selectedOrder?.id === order.id) {
                setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
            }
        } finally {
            setUpdatingId(null);
        }
    }

    const allBoundsPoints = [
        ...(courierPos ? [courierPos] : []),
        ...ordersWithCoords.map((o) => [parseFloat(o.lat), parseFloat(o.long)]),
    ];

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" />
                    <p className="text-muted">Загрузка...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid mt-3">
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div>
                    <h2 className="mb-0">Панель курьера</h2>
                    <small className="text-muted">
                        Вы: {courierPos[0].toFixed(4)}, {courierPos[1].toFixed(4)}
                    </small>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    {[
                        { value: "all", label: "Все" },
                        { value: "pending", label: "Ожидают" },
                        { value: "in_transit", label: "В пути" },
                        { value: "delivered", label: "Доставлены" },
                    ].map((f) => (
                        <button
                            key={f.value}
                            className={"btn btn-sm " + (statusFilter === f.value ? "btn-primary" : "btn-outline-secondary")}
                            onClick={() => setStatusFilter(f.value)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="row g-3">
                <div className="col-lg-4">
                    <h5 className="mb-2">
                        Заказов: <span className="badge bg-primary">{filteredOrders.length}</span>
                    </h5>
                    {filteredOrders.length === 0 ? (
                        <div className="alert alert-info">Нет заказов</div>
                    ) : (
                        <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
                            {filteredOrders.map((order) => {
                                const statusInfo = STATUS_COLORS[order.status] || { bg: "#f8f9fa", text: "#333", label: order.status };
                                const isSelected = selectedOrder?.id === order.id;

                                return (
                                    <div
                                        key={order.id}
                                        className={"card mb-2 " + (isSelected ? "border-success border-2" : "")}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => buildRoute(order)}
                                    >
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="mb-1">
                                                        {isSelected && ">> "}Заказ #{order.id}
                                                    </h6>
                                                    <p className="mb-1 small"><strong>Клиент:</strong> {order.customerName}</p>
                                                    <p className="mb-1 small"><strong>Тел:</strong> {order.customerPhone}</p>
                                                    <p className="mb-1 small"><strong>Адрес:</strong> {order.address}</p>
                                                    <div className="border rounded p-2 mt-1 mb-1" style={{ fontSize: "0.8rem", background: "#f8f9fa" }}>
                                                        <div className="d-flex justify-content-between">
                                                            <span className="text-muted">Товары</span>
                                                            <span>{order.totalAmount - 400} сом</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between">
                                                            <span className="text-muted">🚴 Доставка</span>
                                                            <span>400 сом</span>
                                                        </div>
                                                        <hr className="my-1" />
                                                        <div className="d-flex justify-content-between">
                                                            <strong>Итого</strong>
                                                            <strong className="text-success">{order.totalAmount} сом</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="badge rounded-pill" style={{ backgroundColor: statusInfo.bg, color: statusInfo.text, border: "1px solid " + statusInfo.text }}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>

                                            <div className="d-flex gap-1 flex-wrap mt-1">
                                                {order.status !== "in_transit" && order.status !== "delivered" && (
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        disabled={updatingId === order.id}
                                                        onClick={(e) => { e.stopPropagation(); changeStatus(order, "in_transit"); }}
                                                    >
                                                        В путь
                                                    </button>
                                                )}
                                                {order.status !== "delivered" && (
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        disabled={updatingId === order.id}
                                                        onClick={(e) => { e.stopPropagation(); changeStatus(order, "delivered"); }}
                                                    >
                                                        Доставлен
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={(e) => { e.stopPropagation(); openGoogleMaps(order); }}
                                                >
                                                    Google Maps
                                                </button>
                                            </div>

                                            {isSelected && routeLoading && (
                                                <div className="mt-2 text-center">
                                                    <div className="spinner-border spinner-border-sm text-primary" />
                                                    <span className="ms-2 small">Строю маршрут...</span>
                                                </div>
                                            )}
                                            {isSelected && !routeLoading && routePoints.length > 0 && (
                                                <div className="mt-2 small text-success fw-bold">Маршрут построен — смотрите на карте</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="col-lg-8">
                    {/* Поиск адреса */}
                    <div className="mb-2 position-relative">
                        <div className="input-group">
                            <span className="input-group-text">🔍</span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Поиск адреса в Бишкеке..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchLoading && (
                                <span className="input-group-text">
                                    <div className="spinner-border spinner-border-sm text-secondary" />
                                </span>
                            )}
                            {searchQuery && (
                                <button className="btn btn-outline-secondary" onClick={clearSearch}>✕</button>
                            )}
                        </div>

                        {/* Выпадающий список результатов */}
                        {searchResults.length > 0 && (
                            <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 9999, top: "100%", maxHeight: 220, overflowY: "auto" }}>
                                {searchResults.map((r) => (
                                    <li
                                        key={r.place_id}
                                        className="list-group-item list-group-item-action"
                                        style={{ cursor: "pointer", fontSize: "0.875rem" }}
                                        onClick={() => selectSearchResult(r)}
                                    >
                                        📍 {r.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
                        <MapContainer center={courierPos} zoom={12} style={{ height: "78vh", width: "100%" }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            {routePoints.length === 0 && <FitBounds points={allBoundsPoints} />}
                            {routePoints.length > 0 && <FitBounds points={routePoints} />}
                            {flyTarget && <FlyTo position={flyTarget} />}

                            <Marker position={courierPos} icon={courierIcon}>
                                <Popup><strong>Вы здесь (курьер)</strong></Popup>
                            </Marker>

                            {/* Маркер найденного адреса */}
                            {searchMarker && (
                                <Marker position={searchMarker}>
                                    <Popup>
                                        <div>
                                            <strong>📍 Найденный адрес</strong>
                                            <br />
                                            <small>{searchQuery}</small>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}

                            {ordersWithCoords.map((order) => {
                                const isSelected = selectedOrder?.id === order.id;
                                const statusInfo = STATUS_COLORS[order.status] || { label: order.status };
                                return (
                                    <Marker
                                        key={order.id}
                                        position={[parseFloat(order.lat), parseFloat(order.long)]}
                                        icon={isSelected ? selectedOrderIcon : orderIcon}
                                        eventHandlers={{ click: () => buildRoute(order) }}
                                    >
                                        <Popup>
                                            <div style={{ minWidth: 180 }}>
                                                <strong>Заказ #{order.id}</strong><br />
                                                {order.customerName}<br />
                                                {order.address}<br />
                                                {order.totalAmount} сом<br />
                                                <button className="btn btn-sm btn-primary mt-2 w-100" onClick={() => buildRoute(order)}>
                                                    Проложить маршрут
                                                </button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}

                            {routePoints.length > 0 && (
                                <Polyline positions={routePoints} color="#0d6efd" weight={5} opacity={0.85} />
                            )}
                        </MapContainer>
                    </div>

                    {selectedOrder && !routeLoading && routePoints.length > 0 && (
                        <div className="mt-2 alert alert-primary d-flex align-items-center justify-content-between py-2">
                            <span>Маршрут до Заказа #{selectedOrder.id} ({selectedOrder.address})</span>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openGoogleMaps(selectedOrder)}>
                                Открыть в Google Maps
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Courier;
