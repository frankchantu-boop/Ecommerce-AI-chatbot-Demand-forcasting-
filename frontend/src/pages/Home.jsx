import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, Zap, ShieldCheck, Mail, ShoppingCart, Eye, ChevronRight, CheckCircle } from 'lucide-react';
import { useToast } from '../lib/ToastContext';
import { useCart } from '../lib/CartContext';
import api from '../lib/api';
import heroBg from '../assets/hero_bg.png';

const Home = () => {
  const { addToast } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/products?limit=4');
        setFeaturedProducts(response.data);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    setIsSubscribed(true);
    addToast("Welcome to the inner circle! Check your email for a 10% surprise.", "success");
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleViewProduct = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="aitech-home">
      {/* Announcement Ribbon */}
      <div className="sell-ribbon">
        <div className="marquee-content">
          <span>🚀 Winter Tech Sale is LIVE! Get up to <b>40% OFF</b> with code: <b>AI2025</b> — Limited Time Only — </span>
          <span>🚀 Winter Tech Sale is LIVE! Get up to <b>40% OFF</b> with code: <b>AI2025</b> — Limited Time Only — </span>
          <span>🚀 Winter Tech Sale is LIVE! Get up to <b>40% OFF</b> with code: <b>AI2025</b> — Limited Time Only — </span>
        </div>
      </div>

      {/* Hero Section Pro */}
      <section className="hero-pro">
        <div className="hero-overlay"></div>
        <img src={heroBg} alt="Tech Background" className="hero-bg-img" fetchpriority="high" />

        <div className="container-pro hero-content-pro">
          <div className="hero-tag">AI-CURATED EXCELLENCE</div>
          <h1 className="hero-h1">
            Elevate Your <br />
            <span className="text-gradient-pro">Digital Lifestyle</span>
          </h1>
          <p className="hero-p">
            Experience the next generation of shopping with AI-driven inventory and
            premium selection designed for the modern enthusiast.
          </p>
          <div className="hero-btns">
            <Link to="/shop" className="btn-premium btn-primary-pro">
              Explore Collections <ArrowRight size={18} />
            </Link>
            <Link to="/shop" className="btn-premium btn-secondary-pro">
              View Hot Deals
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="trust-bar glass-panel">
        <div className="container-pro trust-grid">
          <div className="trust-item">
            <ShieldCheck size={20} className="trust-icon" />
            <div>
              <h6>Secure Payments</h6>
              <span>PCI DSS Compliant</span>
            </div>
          </div>
          <div className="trust-item">
            <Zap size={20} className="trust-icon" />
            <div>
              <h6>Express Shipping</h6>
              <span>Global Delivery in 48h</span>
            </div>
          </div>
          <div className="trust-item">
            <Star size={20} className="trust-icon" />
            <div>
              <h6>Curated Quality</h6>
              <span>Top-Tier Verified Brands</span>
            </div>
          </div>
          <div className="trust-item">
            <TrendingUp size={20} className="trust-icon" />
            <div>
              <h6>Smart Forecasts</h6>
              <span>AI-Predictive Pricing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section container-pro">
        <div className="section-head">
          <h2 className="section-h2">Featured <span className="text-gradient-pro">Innovation</span></h2>
          <Link to="/shop" className="view-all">View Entire Catalog <ChevronRight size={16} /></Link>
        </div>

        <div className="products-grid-home">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="skeleton-card"></div>)
          ) : (
            featuredProducts.map((product, index) => (
              <div key={product.id} className="modern-product-card" onClick={() => handleViewProduct(product.id)} style={{ cursor: 'pointer' }}>
                <div className="p-img-wrapper">
                  <img
                    src={product.image_url || `https://picsum.photos/seed/${product.id + 100}/500/500`}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="p-overlay">
                    <button className="p-action-btn" onClick={(e) => handleAddToCart(product, e)} title="Add to Cart">
                      <ShoppingCart size={18} />
                    </button>
                    <button className="p-action-btn" onClick={(e) => { e.stopPropagation(); handleViewProduct(product.id); }} title="Quick View">
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-info">
                  <span className="p-category">{product.category}</span>
                  <h3 className="p-title">{product.name}</h3>
                  <div className="p-bottom">
                    <span className="p-price">${product.price}</span>
                    <div className="p-rating">
                      <Star size={12} fill="#eab308" color="#eab308" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="stats-section">
        <div className="container-pro stats-grid">
          <div className="stat-card">
            <h3>98%</h3>
            <p>Customer Satisfaction</p>
          </div>
          <div className="stat-card">
            <h3>15k+</h3>
            <p>Orders Delivered</p>
          </div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>AI Support Active</p>
          </div>
        </div>
      </section>

      {/* Newsletter 2.0 */}
      <section className="newsletter-pro container-pro">
        <div className="news-inner glass-panel">
          <div className="news-content">
            {isSubscribed ? (
              <div className="news-success" style={{ animation: 'fadeIn 0.5s ease' }}>
                <CheckCircle size={64} color="var(--color-success)" style={{ marginBottom: '1.5rem' }} />
                <h2>You're In!</h2>
                <p>Thanks for joining the inner circle. Space cleared, inspiration incoming.</p>
              </div>
            ) : (
              <>
                <h2>Join the <span className="text-gradient-pro">AITECH Inner Circle</span></h2>
                <p>Be the first to get access to AI-predicted price drops and limited edition drops.</p>
                <form className="news-form-pro" onSubmit={handleSubscribe}>
                  <div className="news-input-wrapper">
                    <Mail className="mail-icon" size={20} />
                    <input type="email" placeholder="Enter your business email" required />
                  </div>
                  <button type="submit" className="btn-premium btn-primary-pro">Join Now</button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <style>{`
                .aitech-home {
                    padding-bottom: 6rem;
                    animation: fadeIn 0.8s ease-out;
                }

                .sell-ribbon {
                    background: linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
                    color: #94a3b8;
                    padding: 0.75rem 0;
                    font-size: 0.8rem;
                    overflow: hidden;
                    white-space: nowrap;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .marquee-content {
                    display: inline-block;
                    animation: marquee 30s linear infinite;
                    will-change: transform;
                    transform: var(--gpu-accelerate);
                }

                .marquee-content span {
                    margin-right: 5rem;
                    display: inline-block;
                }

                .marquee-content b {
                    color: #818cf8;
                }

                @keyframes marquee {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-33.33%, 0, 0); }
                }

                .hero-pro {
                    position: relative;
                    height: 85vh;
                    min-height: 600px;
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                }

                .hero-bg-img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    z-index: -1;
                    filter: brightness(0.6);
                    will-change: opacity;
                }

                .hero-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, var(--color-bg-deep) 0%, transparent 100%);
                    z-index: 0;
                }

                .hero-content-pro {
                    position: relative;
                    z-index: 1;
                    max-width: 800px;
                    animation: slideInRight 1s ease-out;
                }

                .hero-tag {
                    color: var(--color-primary);
                    font-weight: 800;
                    letter-spacing: 3px;
                    font-size: 0.75rem;
                    margin-bottom: 1rem;
                }

                .hero-h1 {
                    font-size: clamp(3rem, 8vw, 5.5rem);
                    font-weight: 900;
                    line-height: 1;
                    margin-bottom: 2rem;
                }

                .hero-p {
                    font-size: 1.25rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 3rem;
                    max-width: 600px;
                }

                .hero-btns {
                    display: flex;
                    gap: 1.5rem;
                }

                .trust-bar {
                    margin: -3rem auto 0;
                    position: relative;
                    z-index: 10;
                    width: fit-content;
                    padding: 1.5rem 3rem;
                    border-radius: 100px;
                }

                .trust-grid {
                    display: flex;
                    gap: 4rem;
                    align-items: center;
                }

                .trust-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .trust-icon { color: var(--color-primary); }
                .trust-item h6 { font-size: 0.9rem; font-weight: 700; margin: 0; color: white; }
                .trust-item span { font-size: 0.7rem; color: var(--color-text-dim); text-transform: uppercase; letter-spacing: 1px; }

                .featured-section { padding: 8rem 0 4rem; }
                .section-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 3.5rem;
                }

                .section-h2 { font-size: 2.5rem; font-weight: 800; margin: 0; }
                .view-all { color: var(--color-text-secondary); text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; transition: 0.2s; }
                .view-all:hover { color: white; }

                .products-grid-home {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 2rem;
                }

                .modern-product-card {
                    background: var(--color-bg-secondary);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    border: 1px solid var(--color-border);
                    transition: var(--transition-fast);
                    will-change: transform;
                    transform: var(--gpu-accelerate);
                }

                .modern-product-card:hover {
                    transform: translateY(-10px);
                    border-color: var(--color-primary);
                    box-shadow: var(--shadow-premium);
                }

                .p-img-wrapper {
                    height: 320px;
                    position: relative;
                    overflow: hidden;
                }

                .p-img-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
                .modern-product-card:hover .p-img-wrapper img { transform: scale(1.1); }

                .p-overlay {
                    position: absolute;
                    bottom: 1.5rem;
                    left: 50%;
                    transform: translateX(-50%) translateY(20px);
                    display: flex;
                    gap: 0.75rem;
                    opacity: 0;
                    transition: 0.3s;
                }

                .modern-product-card:hover .p-overlay { opacity: 1; transform: translateX(-50%) translateY(0); }

                .p-action-btn {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    background: white;
                    color: black;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: var(--shadow-md);
                    transition: 0.2s;
                }

                .p-action-btn:hover { background: var(--color-primary); color: white; transform: rotate(15deg); }

                .p-info { padding: 1.5rem; }
                .p-category { font-size: 0.7rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; letter-spacing: 1px; }
                .p-title { font-size: 1.15rem; font-weight: 700; margin: 0.5rem 0; color: white; }
                .p-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; }
                .p-price { font-size: 1.25rem; font-weight: 800; color: white; }
                .p-rating { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--color-text-secondary); }

                .skeleton-card {
                    height: 400px;
                    background: rgba(255,255,255,0.02);
                    border-radius: var(--radius-lg);
                    animation: skeletonPulse 1.5s infinite;
                }

                @keyframes skeletonPulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }

                .stats-section { padding: 6rem 0; background: var(--color-bg-accent); }
                .stats-grid { display: flex; justify-content: space-between; text-align: center; }
                .stat-card h3 { font-size: 3.5rem; font-weight: 900; color: white; margin: 0; }
                .stat-card p { font-size: 1rem; color: var(--color-text-dim); text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }

                .newsletter-pro { padding: 6rem 0; }
                .news-inner { padding: 5rem; border-radius: var(--radius-xl); text-align: center; }
                .news-content { max-width: 600px; margin: 0 auto; }
                .news-content h2 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
                .news-content p { color: var(--color-text-secondary); margin-bottom: 2.5rem; }

                .news-form-pro {
                    display: flex;
                    gap: 1rem;
                }
                .news-input-wrapper {
                    position: relative;
                    flex: 1;
                }
                .mail-icon {
                    position: absolute;
                    left: 1.25rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--color-text-dim);
                }
                .news-form-pro input {
                    width: 100%;
                    padding-left: 3.5rem;
                }

                @media (max-width: 968px) {
                    .trust-bar { border-radius: var(--radius-lg); padding: 1.5rem; width: 90%; }
                    .trust-grid { flex-direction: column; gap: 1.5rem; align-items: flex-start; }
                    .stats-grid { flex-direction: column; gap: 3rem; }
                    .hero-btns { flex-direction: column; }
                    .news-form-pro { flex-direction: column; }
                }
            `}</style>
    </div>
  );
};

export default Home;
