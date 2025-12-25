import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../lib/CartContext';
import { useToast } from '../lib/ToastContext';
import { CreditCard, Truck, CheckCircle, Lock, Package, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        zipCode: '',
        paymentMethod: 'cod'
    });

    const [loading, setLoading] = useState(false);

    if (cartItems.length === 0) {
        return (
            <div className="container-pro empty-cart-state">
                <div className="glass-panel p-8 text-center">
                    <Package size={48} className="mx-auto mb-4 text-dim" />
                    <h2>Your cart is empty</h2>
                    <p className="mb-6 text-dim">Looks like you haven't added any tech yet.</p>
                    <button className="btn-premium btn-primary-pro" onClick={() => navigate('/shop')}>
                        Go Shopping
                    </button>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const orderPayload = {
                customer_name: formData.fullName,
                customer_email: formData.email,
                shipping_address: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
                total_amount: cartTotal,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                }))
            };

            const response = await api.post('/orders/', orderPayload);
            const orderId = response.data.id;

            clearCart();
            addToast("Order placed successfully!", "success");
            navigate('/order-success', { state: { orderId: orderId } });

        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.detail
                ? `Error: ${error.response.data.detail}`
                : "Failed to place order. Please try again.";
            addToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page-pro">
            <div className="container-pro">
                <button onClick={() => navigate(-1)} className="back-link">
                    <ArrowLeft size={16} /> Back
                </button>

                <h2 className="page-title">Generic <span className="text-gradient-pro">Checkout</span></h2>

                <div className="checkout-grid-pro">
                    {/* Left Column: Form */}
                    <div className="form-section glass-panel">
                        <div className="panel-header">
                            <h3>Shipping Details</h3>
                            <span className="step-badge">Step 1 of 2</span>
                        </div>

                        <form id="checkout-form" onSubmit={handleSubmit} className="compact-form">
                            <div className="form-group-compact">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                />
                            </div>

                            <div className="form-group-compact">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    autoComplete="email"
                                />
                            </div>

                            <div className="form-group-compact">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Street address"
                                    autoComplete="street-address"
                                />
                            </div>

                            <div className="form-row-compact">
                                <div className="form-group-compact">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        autoComplete="address-level2"
                                    />
                                </div>
                                <div className="form-group-compact">
                                    <label>Zip Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        required
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        autoComplete="postal-code"
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="payment-section mt-6">
                            <div className="panel-header">
                                <h3>Payment Method</h3>
                                <Lock size={14} className="secure-icon" />
                            </div>
                            <div className="payment-options-compact">
                                <div
                                    className={`payment-card ${formData.paymentMethod === 'cod' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                                >
                                    <div className="radio-circle"></div>
                                    <div className="pay-info">
                                        <Truck size={18} />
                                        <span>Cash on Delivery</span>
                                    </div>
                                </div>
                                <div
                                    className={`payment-card ${formData.paymentMethod === 'card' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                                >
                                    <div className="radio-circle"></div>
                                    <div className="pay-info">
                                        <CreditCard size={18} />
                                        <span>Credit Card</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="summary-section">
                        <div className="glass-panel summary-card">
                            <h3>Order Summary</h3>
                            <div className="summary-scroll">
                                {cartItems.map(item => (
                                    <div key={item.id} className="mini-item">
                                        <div className="mini-img">
                                            {/* Placeholder if no image, optimized */}
                                            <div className="img-placeholder">{item.name[0]}</div>
                                        </div>
                                        <div className="mini-details">
                                            <span className="mini-name">{item.name}</span>
                                            <span className="mini-qty">Qty: {item.quantity}</span>
                                        </div>
                                        <span className="mini-price">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-totals">
                                <div className="row">
                                    <span>Subtotal</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="row">
                                    <span>Shipping</span>
                                    <span className="text-success">Free</span>
                                </div>
                                <div className="divider-line"></div>
                                <div className="row total">
                                    <span>Total</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                className="btn-premium btn-primary-pro full-width mt-4"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
                            </button>

                            <div className="secure-badge">
                                <CheckCircle size={12} className="text-success" />
                                <span>SSL Secure Payment</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .checkout-page-pro {
                    padding: 2rem 0 4rem;
                    min-height: 80vh;
                    animation: fadeIn 0.4s ease-out;
                }

                .back-link {
                    background: none;
                    border: none;
                    color: var(--color-text-dim);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                    padding: 0;
                }
                .back-link:hover { color: white; }

                .page-title { margin-bottom: 2rem; }

                .checkout-grid-pro {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 2rem;
                    align-items: start;
                }

                /* Compact Form Styling */
                .form-section { padding: 2rem; }
                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .panel-header h3 { font-size: 1.1rem; margin: 0; font-weight: 700; }
                .step-badge {
                    font-size: 0.7rem;
                    background: rgba(255,255,255,0.1);
                    padding: 0.2rem 0.6rem;
                    border-radius: 20px;
                    color: var(--color-text-secondary);
                }

                .compact-form { display: flex; flex-direction: column; gap: 1rem; }
                
                .form-group-compact label {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 0.3rem;
                    font-weight: 500;
                }
                
                .form-group-compact input {
                    width: 100%;
                    padding: 0.6rem 0.9rem; /* Smaller padding */
                    font-size: 0.95rem;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--color-border);
                }
                .form-group-compact input:focus {
                    background: rgba(0,0,0,0.4);
                    border-color: var(--color-primary);
                }

                .form-row-compact {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .mt-6 { margin-top: 2rem; }
                .secure-icon { color: var(--color-success); }

                /* Payment Options */
                .payment-options-compact {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .payment-card {
                    border: 1px solid var(--color-border);
                    background: rgba(255,255,255,0.02);
                    padding: 0.8rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    transition: var(--transition-fast);
                }

                .payment-card:hover { background: rgba(255,255,255,0.05); }
                .payment-card.active {
                    border-color: var(--color-primary);
                    background: rgba(99, 102, 241, 0.1);
                }

                .radio-circle {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    border: 2px solid var(--color-text-dim);
                    position: relative;
                }

                .payment-card.active .radio-circle {
                    border-color: var(--color-primary);
                }
                .payment-card.active .radio-circle::after {
                    content: '';
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    width: 8px; height: 8px;
                    background: var(--color-primary);
                    border-radius: 50%;
                }

                .pay-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 500; }

                /* Summary Section */
                .summary-card { padding: 1.5rem; position: sticky; top: 2rem; }
                .summary-card h3 { font-size: 1.1rem; margin-bottom: 1.5rem; font-weight: 700; }

                .summary-scroll {
                    max-height: 250px;
                    overflow-y: auto;
                    margin-bottom: 1.5rem;
                    padding-right: 0.5rem;
                }
                
                /* Scrollbar styling */
                .summary-scroll::-webkit-scrollbar { width: 4px; }
                .summary-scroll::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }

                .mini-item {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    margin-bottom: 1rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                }
                .mini-item:last-child { border-bottom: none; }

                .img-placeholder {
                    width: 40px;
                    height: 40px;
                    background: var(--color-bg-secondary);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: var(--color-text-dim);
                }

                .mini-details { flex: 1; }
                .mini-name { display: block; font-size: 0.9rem; color: var(--color-text-primary); margin-bottom: 0.2rem; }
                .mini-qty { font-size: 0.75rem; color: var(--color-text-dim); }
                .mini-price { font-weight: 600; font-size: 0.9rem; }

                .summary-totals .row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.6rem;
                    font-size: 0.9rem;
                    color: var(--color-text-secondary);
                }
                
                .divider-line {
                    height: 1px;
                    background: var(--color-border);
                    margin: 1rem 0;
                }

                .summary-totals .total {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: white;
                }

                .full-width { width: 100%; justify-content: center; }

                .secure-badge {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    font-size: 0.75rem;
                    color: var(--color-text-dim);
                    opacity: 0.7;
                }

                .empty-cart-state {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 60vh;
                }

                @media (max-width: 900px) {
                    .checkout-grid-pro { grid-template-columns: 1fr; }
                    .summary-section { order: -1; }
                    .payment-options-compact { grid-template-columns: 1fr; }
                }

                .text-dim { color: var(--color-text-dim); }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .mb-4 { margin-bottom: 1rem; }
                .mb-6 { margin-bottom: 1.5rem; }
            `}</style>
        </div>
    );
};

export default Checkout;
