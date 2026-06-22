import { useState } from "react";
import { useEffect } from "react";
import product from "../data/products";
function Home() {
    const [items, setItems] = useState([]);

    function fetchItems() {
        // Simulate fetching data from an API
        let fetchedItems = product;
        setItems(fetchedItems);
    }

    useEffect(() => {
        fetchItems();
    }, []);

    function filterItemsByCategory(category) {
        // Simulate filtering items based on category
        let filteredItems = product.filter(item => item.category === category);
         setItems(filteredItems);
        if (category === 'all') {
            filteredItems = product;
            setItems(filteredItems);
        }
       
    }

    function filterItemsByLocation(location) {
        // Simulate filtering items based on location
        let filteredItems = product.filter(item => item.location === location);
        setItems(filteredItems);
            if (location === 'all') {
                filteredItems = product;
                setItems(filteredItems);
            }
    }
    function sortItemsByPrice(order) {
        // Simulate sorting items based on price
        let sortedItems = [...items].sort((a, b) => {
            if (order === 'asc') {
                return a.price - b.price;
            } else {
                return b.price - a.price;
            }
        });
        setItems(sortedItems);
    }
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <p>This is the main landing page of our application.</p>
            <div className="container">
                <div className="row">
                    <div className="col-3">
                        <h2>Categories</h2>
                        <ul>
                            <li><button onClick={() => filterItemsByCategory('all')}>All</button></li>
                            <li><button onClick={() => filterItemsByCategory('smartphones')}>Smartphones</button></li>
                            <li><button onClick={() => filterItemsByCategory('electronics')}>Electronics</button></li>
                            <li><button onClick={() => filterItemsByCategory('fashion')}>Fashion</button></li>
                        </ul>
                        <h2>Locations</h2>
                        <ul>
                            <li><button onClick={() => filterItemsByLocation('USA')}>USA</button></li>
                            <li><button onClick={() => filterItemsByLocation('China')}>China</button></li>
                        </ul>
                        <h2>Sort by Price</h2>
                        <select onChange={(e) => sortItemsByPrice(e.target.value)}>
                            <option value="asc">Low to High</option>
                            <option value="desc">High to Low</option>
                        </select>
                    </div>
                    <div className="col-9">
                        <div className="row">
                            {
                                items.length > 0 ? (
                                    <>
                                        {items.map((item) => (
                                            <div className="col-4">
                                                <div className="card">
                                                    <img src={item.image} className="card-img-top" alt={item.name} />
                                                    <div className="card-body">
                                                        <h5 className="card-title">{item.name}</h5>
                                                        <p className="card-text">{item.price}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <p>Loading...</p>
                                )
                            }
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
export default Home;