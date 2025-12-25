import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut, TrendingUp, Search, Bell, User, ExternalLink } from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [globalSearch, setGlobalSearch] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Low Stock Alert', message: 'Wireless Headphones are below 10 units.', time: '2 mins ago', type: 'warning' },
        { id: 2, title: 'New Order', message: 'Order #ORD-1024 just came in!', time: '15 mins ago', type: 'info' },
        { id: 3, title: 'System Update', message: 'Dashboard performance has been optimized.', time: '1 hour ago', type: 'success' }
    ]);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_email');
        localStorage.removeItem('last_activity');
        navigate('/admin/login');
    };

    const handleClearNotifications = () => {
        setNotifications([]);
        setShowNotifications(false);
    };

    const navItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
        { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Orders' },
        { path: '/admin/forecasting', icon: <TrendingUp size={20} />, label: 'Forecasting' },
    ];

    return (
        <div className="admin-layout-wrapper">
            <aside className="modern-sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">A</div>
                    <div className="brand-info">
                        <h2>Admin Pro</h2>
                        <span className="online-status">System Active</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <div className="nav-icon-wrapper">{item.icon}</div>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="nav-item logout-btn">
                        <div className="nav-icon-wrapper"><LogOut size={18} /></div>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main-view">
                <header className="admin-navbar-pro">
                    <div className="nav-left">
                        <div className="breadcrumb-pro">
                            <span className="b-dim">Control Panel</span>
                            <span className="b-sep">/</span>
                            <span className="b-active">{location.pathname.split('/').pop()}</span>
                        </div>
                    </div>

                    <div className="nav-right">
                        <div className="admin-search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Global Search..."
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
                            />
                        </div>

                        <div className="admin-nav-actions">
                            <div className="notif-wrapper">
                                <button
                                    className={`nav-action-btn ${showNotifications ? 'active' : ''}`}
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    title="Notifications"
                                >
                                    <Bell size={20} />
                                    {notifications.length > 0 && <span className="notif-dot"></span>}
                                </button>

                                {showNotifications && (
                                    <div className="notif-dropdown glass-heavy">
                                        <div className="notif-header">
                                            <h3>Notifications</h3>
                                            {notifications.length > 0 && (
                                                <button onClick={handleClearNotifications}>Clear All</button>
                                            )}
                                        </div>
                                        <div className="notif-list">
                                            {notifications.length > 0 ? (
                                                notifications.map(n => (
                                                    <div key={n.id} className={`notif-item ${n.type}`}>
                                                        <div className="n-point"></div>
                                                        <div className="n-content">
                                                            <span className="n-title">{n.title}</span>
                                                            <p className="n-msg">{n.message}</p>
                                                            <span className="n-time">{n.time}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="notif-empty">
                                                    <Bell size={32} />
                                                    <p>Inbox is clean!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link to="/" className="nav-action-btn" title="View Store">
                                <ExternalLink size={20} />
                            </Link>
                            <div className="admin-profile-pill">
                                <div className="p-avatar">
                                    <User size={18} />
                                </div>
                                <span className="p-name">Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-scroll-container">
                    <Outlet context={{ globalSearch, setGlobalSearch }} />
                </div>
            </main>

            <style>{`
                .admin-layout-wrapper {
                    display: flex;
                    height: 100vh;
                    background: #020617;
                    color: white;
                    overflow: hidden;
                    font-family: 'Inter', sans-serif;
                }

                .modern-sidebar {
                    width: 230px;
                    display: flex;
                    flex-direction: column;
                    padding: 1.5rem 1rem;
                    background: #0f172a;
                    border-right: 1px solid rgba(255,255,255,0.05);
                    z-index: 10;
                    box-shadow: 10px 0 30px rgba(0,0,0,0.5);
                }

                .sidebar-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    padding: 0 0.5rem;
                }

                .brand-info h2 {
                    font-size: 1.2rem;
                    font-weight: 800;
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                
                .online-status {
                    font-size: 0.65rem;
                    color: #10b981;
                    text-transform: uppercase;
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                .brand-icon {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 1.2rem;
                }

                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                    padding: 0.75rem 1rem;
                    border-radius: 10px;
                    color: #94a3b8;
                    font-weight: 500;
                    font-size: 0.9rem;
                    text-decoration: none !important;
                    transition: all 0.2s ease;
                }

                .nav-icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }

                .nav-item.active {
                    background: linear-gradient(90deg, rgba(99, 102, 241, 0.15), transparent);
                    color: #818cf8;
                    font-weight: 700;
                }

                .nav-item.active .nav-icon-wrapper {
                    color: #818cf8;
                }

                .sidebar-footer {
                    margin-top: auto;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }

                .logout-btn {
                    color: #f43f5e;
                    width: 100%;
                    border: 1px solid rgba(244, 63, 94, 0.1);
                }

                .logout-btn:hover {
                    background: rgba(244, 63, 94, 0.1);
                    color: #fb7185;
                }

                .admin-main-view {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #020617;
                }

                .admin-navbar-pro {
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 2rem;
                    background: #0f172a;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .nav-left {
                    display: flex;
                    align-items: center;
                }

                .breadcrumb-pro {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .b-dim { color: #64748b; }
                .b-sep { color: #334155; }
                .b-active { color: white; text-transform: capitalize; }

                .nav-right {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                .admin-search-box {
                    background: #1e293b;
                    border-radius: 10px;
                    padding: 0.5rem 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #64748b;
                    border: 1px solid transparent;
                    transition: 0.2s;
                }

                .admin-search-box:focus-within {
                    border-color: #4f46e5;
                    box-shadow: 0 0 15px rgba(79, 70, 229, 0.1);
                }

                .admin-search-box input {
                    background: transparent;
                    border: none;
                    color: white;
                    outline: none;
                    font-size: 0.85rem;
                    width: 200px;
                }

                .admin-nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .nav-action-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    position: relative;
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: 0.2s;
                    text-decoration: none !important;
                }

                .nav-action-btn:hover {
                    background: rgba(255,255,255,0.05);
                    color: white;
                }

                .notif-dot {
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    width: 8px;
                    height: 8px;
                    background: #f43f5e;
                    border-radius: 50%;
                    border: 2px solid #0f172a;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(244, 63, 94, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
                }

                .notif-wrapper {
                    position: relative;
                }

                .notif-dropdown {
                    position: absolute;
                    top: calc(100% + 15px);
                    right: -10px;
                    width: 320px;
                    background: #0f172a;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px;
                    padding: 1.25rem;
                    z-index: 100;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .notif-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .notif-header h3 {
                    font-size: 1rem;
                    font-weight: 700;
                    margin: 0;
                }

                .notif-header button {
                    background: transparent;
                    border: none;
                    color: #6366f1;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .notif-list {
                    max-height: 280px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    padding-right: 0.5rem;
                }

                .notif-item {
                    display: flex;
                    gap: 1rem;
                    padding: 0.75rem;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.02);
                    transition: 0.2s;
                }

                .notif-item:hover {
                    background: rgba(255,255,255,0.05);
                }

                .n-point {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    margin-top: 5px;
                    flex-shrink: 0;
                }

                .warning .n-point { background: #eab308; box-shadow: 0 0 8px #eab308; }
                .info .n-point { background: #3b82f6; box-shadow: 0 0 8px #3b82f6; }
                .success .n-point { background: #22c55e; box-shadow: 0 0 8px #22c55e; }

                .n-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }

                .n-title {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: white;
                }

                .n-msg {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    margin: 0;
                    line-height: 1.4;
                }

                .n-time {
                    font-size: 0.7rem;
                    color: #64748b;
                    font-weight: 500;
                    margin-top: 2px;
                }

                .notif-empty {
                    padding: 2rem;
                    text-align: center;
                    color: #475569;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                }

                .admin-profile-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: rgba(255,255,255,0.03);
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .p-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #334155;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                }

                .p-name {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: white;
                }

                .content-scroll-container {
                    flex: 1;
                    padding: 2rem;
                    overflow-y: auto;
                }
                
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
