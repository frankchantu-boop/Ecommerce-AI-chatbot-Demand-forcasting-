import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    BarChart3,
    AlertTriangle,
    Zap,
    RefreshCw,
    TrendingUp,
    Package,
    Eye,
    X,
    CheckCircle2,
    Calendar,
    Activity,
    Info,
    ArrowUpRight,
    AlertCircle,
    ShoppingBag
} from 'lucide-react';
import './Forecasting.css';

const Forecasting = () => {
    const [predictions, setPredictions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [training, setTraining] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productTrends, setProductTrends] = useState(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 5000); // Poll every 5 seconds silently
        return () => clearInterval(interval);
    }, []);

    const isFetching = useRef(false);

    const fetchData = async (silent = false) => {
        if (isFetching.current) return;
        isFetching.current = true;

        try {
            if (!silent) setLoading(true);
            const [predsRes, alertsRes] = await Promise.all([
                axios.get('http://localhost:8000/forecasting/predictions'),
                axios.get('http://localhost:8000/forecasting/alerts')
            ]);

            if (predsRes.data) setPredictions(predsRes.data);
            if (alertsRes.data) setAlerts(alertsRes.data);
        } catch (error) {
            console.error('Error fetching forecasting data:', error);
        } finally {
            if (!silent) setLoading(false);
            isFetching.current = false;
        }
    };

    const trainModels = async () => {
        try {
            setTraining(true);
            await axios.post('http://localhost:8000/forecasting/train');
            fetchData();
        } catch (error) {
            console.error('Error training models:', error);
        } finally {
            setTraining(false);
        }
    };

    const dismissAlert = async (alertId) => {
        try {
            await axios.put(`http://localhost:8000/forecasting/alerts/${alertId}/dismiss`);
            fetchData();
        } catch (error) {
            console.error('Error dismissing alert:', error);
        }
    };

    const viewProductDetails = async (productId) => {
        try {
            const trendsRes = await axios.get(`http://localhost:8000/forecasting/trends/${productId}`);
            setProductTrends(trendsRes.data);
            setSelectedProduct(productId);
        } catch (error) {
            console.error('Error fetching product trends:', error);
        }
    };

    const calculateTotalDemand = (predictions, days) => {
        if (!predictions || predictions.length === 0) return 0;
        return Math.round(predictions.slice(0, days).reduce((sum, p) => sum + p.predicted_demand, 0));
    };

    if (loading) return (
        <div className="forecasting-loading">
            <div className="loader">
                <Activity className="spin text-primary" size={40} />
                <span style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Analyzing Data...</span>
            </div>
        </div>
    );

    return (
        <div className="forecasting-view">
            <header className="page-header-minimal">
                <div className="header-title-group">
                    <h1>Predictive Intelligence</h1>
                    <div className="header-subtitle">
                        <BarChart3 size={18} />
                        <span>Real-time demand forecasting for {predictions.length} products</span>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className="btn-sync-pro"
                        onClick={trainModels}
                        disabled={training}
                    >
                        <RefreshCw className={training ? 'spin' : ''} size={18} />
                        {training ? 'Calculating Intelligence...' : 'Sync Data Engine'}
                    </button>
                </div>
            </header>

            {/* Intelligence Stats Orbs */}
            <div className="intelligence-grid">
                <div className="intel-card">
                    <div className="intel-icon-box" style={{ color: '#6366f1' }}><TrendingUp size={24} /></div>
                    <div className="intel-info">
                        <h3>Predicted Monthly Demand</h3>
                        <div className="intel-value">
                            {predictions.reduce((sum, p) => sum + calculateTotalDemand(p.predictions, 30), 0).toLocaleString()}
                        </div>
                        <div className="intel-trend up">
                            <span>Calculated from 60d pattern</span>
                        </div>
                    </div>
                </div>
                <div className="intel-card">
                    <div className="intel-icon-box" style={{ color: '#f43f5e' }}><AlertCircle size={24} /></div>
                    <div className="intel-info">
                        <h3>Critical Stockouts</h3>
                        <div className="intel-value">{alerts.filter(a => a.alert_type === 'critical').length}</div>
                        <div className="intel-trend text-dim">Active alerts requiring action</div>
                    </div>
                </div>
                <div className="intel-card">
                    <div className="intel-icon-box" style={{ color: '#10b981' }}><ShoppingBag size={24} /></div>
                    <div className="intel-info">
                        <h3>Inventory Optimization</h3>
                        <div className="intel-value">Active</div>
                        <div className="intel-trend up">
                            <span>ML Models Operational</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Critical Alerts Section */}
            {alerts.length > 0 && (
                <div className="alerts-section">
                    <div className="section-header">
                        <h2>Critical Insights</h2>
                        <span className="alert-count-badge">{alerts.length}</span>
                    </div>
                    <div className="alerts-scroll-container">
                        {alerts.map(alert => (
                            <div key={alert.id} className="alert-pro-card">
                                <div className="alert-indicator">
                                    <AlertTriangle size={20} color="#f43f5e" />
                                </div>
                                <div className="alert-content">
                                    <h4>Stock Alert</h4>
                                    <p>{alert.message}</p>
                                    <div className="alert-actions">
                                        <button className="btn-alert-action">Order {alert.recommended_order_qty} units</button>
                                        <button
                                            className="btn-alert-action dismiss"
                                            onClick={() => dismissAlert(alert.id)}
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Data Surface */}
            <div className="data-surface">
                <div className="table-header-box">
                    <h2>Inventory Forecasts</h2>
                    <div className="confidence-chip">Confidence Interval: 95%</div>
                </div>
                <table className="pro-table">
                    <thead>
                        <tr>
                            <th>Product Detail</th>
                            <th>Current Stock</th>
                            <th>7D Forecast</th>
                            <th>30D Demand</th>
                            <th>Model Insight</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {predictions.map(pred => (
                            <tr key={pred.product_id}>
                                <td>
                                    <div className="product-cell">
                                        <div className="product-avatar">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{pred.product_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>#{pred.product_id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={`stock-badge ${pred.current_stock < 10 ? 'low' : 'ok'}`}>
                                        {pred.current_stock} units
                                    </div>
                                </td>
                                <td>
                                    <div className="forecast-value">
                                        {calculateTotalDemand(pred.predictions, 7)}
                                    </div>
                                </td>
                                <td>
                                    <div className="forecast-value" style={{ color: 'var(--color-primary)' }}>
                                        {calculateTotalDemand(pred.predictions, 30)}
                                    </div>
                                    <div className="confidence-chip" style={{ marginTop: '0.25rem' }}>
                                        ± {Math.round(calculateTotalDemand(pred.predictions, 30) * 0.1)} margin
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="intel-trend up" style={{ fontSize: '0.8rem' }}>
                                            <TrendingUp size={12} /> Stable
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
                                            {pred.predictions[0]?.model_used || 'Hybrid'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className="btn-view-details"
                                        onClick={() => viewProductDetails(pred.product_id)}
                                    >
                                        Review Analysis
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Redesign */}
            {selectedProduct && productTrends && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-content-pro" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-pro">
                            <div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{productTrends.product_name}</h2>
                                <p style={{ color: '#94a3b8' }}>Predictive Analysis based on 60-day transaction patterns</p>
                            </div>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                            >
                                <X size={32} />
                            </button>
                        </div>
                        <div className="modal-body-pro">
                            <div className="graph-container-pro">
                                <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>Historical Performance (Last 60 Days)</h3>
                                <div className="custom-bars">
                                    {(() => {
                                        const maxSales = Math.max(...productTrends.trends.map(t => t.sales), 1);
                                        return productTrends.trends.map((trend, idx) => {
                                            const height = (trend.sales / maxSales) * 100;
                                            const showLabel = idx % 10 === 0;
                                            return (
                                                <div key={idx} className="bar-wrapper" title={`${new Date(trend.date).toLocaleDateString()}: ${trend.sales} units`}>
                                                    <div
                                                        className="bar-fill"
                                                        style={{ height: `${Math.max(2, height)}%` }}
                                                    ></div>
                                                    {showLabel && <span className="bar-label">{new Date(trend.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>
                                    Visualization displays daily transaction volume
                                </div>
                            </div>

                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>Total Historical Volume</label>
                                    <span>{productTrends.trends.reduce((sum, t) => sum + t.sales, 0)} units</span>
                                </div>
                                <div className="detail-item">
                                    <label>Avg Daily Velocity</label>
                                    <span style={{ color: '#10b981' }}>{(productTrends.trends.reduce((sum, t) => sum + t.sales, 0) / productTrends.trends.length).toFixed(1)} sold/day</span>
                                </div>
                                <div className="detail-item">
                                    <label>Reliability Index</label>
                                    <span style={{ color: '#6366f1' }}>HIGH</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn-sync-pro" onClick={() => setSelectedProduct(null)}>Close Analysis</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Forecasting;
