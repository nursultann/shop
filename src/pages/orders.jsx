import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Orders() {
    const [orders, setOrders] = useState([]);

    // Загрузить заказы
    useEffect(() => {
        axios.get("https://69a007f73188b0b1d537859e.mockapi.io/orders").then((res) => {
            setOrders(res.data);
        });
    }, []);

    // Удалить заказ
    function deleteOrder(id) {
        axios.delete(`https://69a007f73188b0b1d537859e.mockapi.io/orders/${id}`).then(() => {
            setOrders(orders.filter((order) => order.id !== id));
        });
    }

    return (
        <div className="container mt-4">
            <h1>Заказы</h1>

            {orders.length === 0 ? (
                <p>Заказов нет</p>
            ) : (
                <div className="row">
                    {orders.map((order) => (
                        <div className="col-md-6 mb-4" key={order.id}>
                            <div className="card p-3">
                                <h5>Заказ #{order.id}</h5>
                                <p><strong>Имя:</strong> {order.customerName}</p>
                                <p><strong>Телефон:</strong> {order.customerPhone}</p>
                                <p><strong>Адрес:</strong> {order.address}</p>
                                <p><strong>Сумма:</strong> {order.totalAmount} сом</p>
                                <p><strong>Статус:</strong> {order.status}</p>
                                <p><strong>Комментарий:</strong> {order.note}</p>

                                {/* Товары в заказе */}
                                {order.items && order.items.length > 0 && (
                                    <div>
                                        <strong>Товары:</strong>
                                        <ul>
                                            {order.items.map((item, index) => (
                                                <li key={index}>
                                                    {item.name} — {item.price} сом × {item.quantity}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <button className="btn btn-danger btn-sm mt-2" onClick={() => deleteOrder(order.id)}>
                                    Удалить заказ
                                </button>
                                <a href={`/orders/${order.id}`} className="btn btn-primary btn-sm mt-2 ms-2">
                                    Подробнее
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Orders;