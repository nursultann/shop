import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Products() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    // Загрузить продукты
    useEffect(() => {
        axios.get("https://69a007f73188b0b1d537859e.mockapi.io/products").then((res) => {
            setProducts(res.data);
        });
    }, []);

    // Сохранять корзину в localStorage при каждом изменении
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // Добавить в корзину
    function addToCart(product) {
        const exists = cart.find((item) => item.id === product.id);
        if (exists) {
            setCart(cart.map((item) =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    }

    // Убрать из корзины
    function removeFromCart(id) {
        setCart(cart.filter((item) => item.id !== id));
    }

    // Итоговая сумма
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Перейти к оформлению заказа
    function goToCheckout() {
        localStorage.setItem("cart", JSON.stringify(cart));
        navigate("/checkout");
    }

    return (
        <div className="container mt-4">
            <h1>Продукты</h1>

            {/* Корзина */}
            <div className="card mb-4 p-3">
                <h2>Корзина</h2>
                {cart.length === 0 ? (
                    <p>Корзина пуста</p>
                ) : (
                    <>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Фото</th>
                                    <th>Название</th>
                                    <th>Цена</th>
                                    <th>Кол-во</th>
                                    <th>Сумма</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <img src={item.imageUrl} alt={item.name} width={50} height={50} style={{ objectFit: "cover" }} />
                                        </td>
                                        <td>{item.name}</td>
                                        <td>{item.price} сом</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.price * item.quantity} сом</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>
                                                Удалить
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p><strong>Итого: {total} сом</strong></p>
                        <button className="btn btn-success" onClick={goToCheckout}>
                            Оформить заказ
                        </button>
                    </>
                )}
            </div>

            {/* Список продуктов */}
            <div className="row">
                {products.map((product) => (
                    <div className="col-md-4 mb-4" key={product.id}>
                        <div className="card h-100">
                            <img src={product.imageUrl} className="card-img-top" alt={product.name} style={{ height: 200, objectFit: "cover" }} />
                            <div className="card-body">
                                <h5 className="card-title">{product.name}</h5>
                                <p className="card-text text-muted">{product.description}</p>
                                <p><strong>Цена:</strong> {product.price} сом</p>
                                <p><strong>Категория:</strong> {product.category}</p>
                                <p><strong>На складе:</strong> {product.stock} шт.</p>
                                <p><strong>Доступен:</strong> {product.isAvailable ? "Да" : "Нет"}</p>
                                <button className="btn btn-primary" onClick={() => addToCart(product)}>
                                    В корзину
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Products;