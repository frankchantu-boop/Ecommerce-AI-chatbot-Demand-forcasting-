import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ShoppingCart, Eye, Star } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../lib/CartContext';
import './Shop.css';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPriceRange, setSelectedPriceRange] = useState('All');
    const [sortBy, setSortBy] = useState('Featured');
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products/');
                setProducts(response.data);

                // Extract unique categories
                const uniqueCats = ['All', ...new Set(response.data.map(p => p.category))];
                setCategories(uniqueCats);
            } catch (err) {
                console.error("Backend offline or empty", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter & Sort Logic
    useEffect(() => {
        let result = [...products];

        // 1. Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.description.toLowerCase().includes(lowerQuery) ||
                p.category.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Category Filter
        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        // 3. Price Filter (Strict Type Safety)
        if (selectedPriceRange !== 'All') {
            const getPrice = (p) => parseFloat(p.price);

            if (selectedPriceRange === 'Under $50') {
                result = result.filter(p => getPrice(p) < 50);
            } else if (selectedPriceRange === '$50 - $200') {
                result = result.filter(p => getPrice(p) >= 50 && getPrice(p) <= 200);
            } else if (selectedPriceRange === 'Premium ($200+)') {
                result = result.filter(p => getPrice(p) > 200);
            }
        }

        // 4. Sorting
        if (sortBy === 'Price: Low to High') {
            result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortBy === 'Price: High to Low') {
            result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        }

        setFilteredProducts(result);
    }, [products, searchQuery, selectedCategory, selectedPriceRange, sortBy]);

    const handleAddToCart = (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <div className="shop-page-pro">
            <div className="container-pro">
                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
                            Catalog <span className="text-gradient-pro">Collection</span>
                        </h2>
                        <p className="text-dim">Discover AI-curated excellence for your workflow.</p>
                    </div>
                </div>

                <div className="shop-layout">
                    {/* Sidebar Filters */}
                    <aside className="shop-sidebar">
                        <div className="glass-panel p-6" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
                            <div className="filter-group">
                                <h3>
                                    Categories <SlidersHorizontal size={16} />
                                </h3>
                                <div className="filter-list">
                                    {categories.map(cat => (
                                        <div
                                            key={cat}
                                            className={`filter-item ${selectedCategory === cat ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(cat)}
                                        >
                                            <div className="filter-checkbox"></div>
                                            <span>{cat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <h3>Price Range</h3>
                                {['All', 'Under $50', '$50 - $200', 'Premium ($200+)'].map(range => (
                                    <div
                                        key={range}
                                        className={`filter-item ${selectedPriceRange === range ? 'active' : ''}`}
                                        onClick={() => setSelectedPriceRange(range)}
                                    >
                                        <div className="filter-checkbox"></div>
                                        <span>{range}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Grid */}
                    <main className="shop-main">
                        <div className="shop-header">
                            <span className="results-count">Showing {filteredProducts.length} results</span>
                            <div className="sort-wrapper">
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option>Featured</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-state text-center py-12">
                                <div className="spinner mb-4 mx-auto"></div>
                                <p className="text-dim">Synthesizing Catalog...</p>
                            </div>
                        ) : (
                            <div className="product-grid-pro">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="pro-card group">
                                        <div className="pc-img-container">
                                            <img
                                                src={product.image_url || `https://picsum.photos/seed/${product.id + 100}/500/500`}
                                                alt={product.name}
                                                className="pc-img"
                                                loading="lazy"
                                            />
                                            <div className="pc-overlay">
                                                <div className="pc-actions">
                                                    <button
                                                        className="action-btn"
                                                        onClick={(e) => handleAddToCart(product, e)}
                                                        title="Add to Cart"
                                                    >
                                                        <ShoppingCart size={20} />
                                                    </button>
                                                    <Link to={`/product/${product.id}`} className="action-btn" title="View Details">
                                                        <Eye size={20} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pc-info">
                                            <span className="pc-category">{product.category}</span>
                                            <h3 className="pc-title">{product.name}</h3>

                                            <div className="pc-tags">
                                                <span className="tag">In Stock</span>
                                                <span className="tag">Fast Ship</span>
                                            </div>

                                            <div className="pc-footer">
                                                <div className="pc-price">${product.price}</div>
                                                <div className="rating">
                                                    <Star size={14} fill="#eab308" color="#eab308" />
                                                    <span>4.9</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Shop;
