import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const response = await axios.get("https://69a007f73188b0b1d537859e.mockapi.io/products");
            if (response.status === 200) {
                setProducts(response.data);
            } else {
                console.error("Failed to fetch products");
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const addToCart = async (product) => {
        // Implement the logic to add the product to the cart
        //API request to add the product to the cart can be made here, for example:
        //         {
        //     "createdAt": "2026-06-12T18:09:55.376935",
        //     "customerName": "test",
        //     "customerPhone": "+99999999999",
        //     "items": [
        //       {
        //         "productId": "fb-skin-1",
        //         "productName": "Сыворотка с гиалуроновой кислотой",
        //         "price": 12500,
        //         "quantity": 2,
        //         "imageUrl": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80"
        //       }
        //     ],
        //     "address": "Ош",
        //     "totalAmount": 25000,
        //     "status": "confirmed",
        //     "note": "test",
        //     "id": "1"
        //   },
        console.log("Adding to cart:", product);
        const cartItem = {
            "customerName": "test",
            "customerPhone": "+99999999999",
            "items": [
                {
                    "productId": product.id,
                    "productName": product.title,
                    "price": product.price,
                    "quantity": 1,
                    "imageUrl": product.imageUrl
                }
            ],
            "address": "Ош",
            "totalAmount": 25000,
            "status": "confirmed",
            "note": "test",
            "id": "1"

        };
        console.log("Cart item:", cartItem);

        try {
            const response = await axios.post("https://69a007f73188b0b1d537859e.mockapi.io/products", cartItem);
            if (response.status === 201) {
                console.log("Product added to cart successfully");
            } else {
                console.error("Failed to add product to cart");
            }
        } catch (error) {
            console.error("Error adding product to cart:", error);
        }

    }

    return (
        <div>
            <h1>Products</h1>
            <div className="container">
                <div className="row">
                    {loading ? (
                        <div>Loading...</div>
                    ) : null}
                    {products.map((product) => (
                        <div className="col-md-4" key={product.id}>
                            <div className="card">
                                <img src={product.imageUrl} className="card-img-top" alt={product.title} />
                                <div className="card-body">
                                    <h5 className="card-title fw-bold">{product.title}</h5>
                                    <p className="card-text text-muted mb-2"
                                        style={{ whiteSpace: 'nowrap', lineHeight: '1.5', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.description}</p>
                                    <p className="card-text fw-bold">${product.price}</p>
                                    <button className="btn btn-primary" onClick={() => addToCart(product)}>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Products