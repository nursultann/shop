import { useEffect, useState } from "react";

const Orders = () => {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const response = await fetch("https://69a007f73188b0b1d537859e.mockapi.io/orders");
            if (response.status === 200) {
                const data = await response.json();
                setOrders(data);
            } else {
                console.error("Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div>
            <h1>Orders</h1>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <ul>
                    {orders.map((order) => (
                        <li key={order.id}>
                            <p>Order ID: {order.id}</p>
                            <p>Customer Name: {order.customerName}</p>
                            <p>Customer Phone: {order.customerPhone}</p>
                            <p>Address: {order.address}</p>
                            <p>Total Amount: {order.totalAmount}</p>
                            <p>Status: {order.status}</p>
                            <p>Note: {order.note}</p>
                        </li>
                    ))}
                </ul>
            )}

        </div>
    )
}

export default Orders