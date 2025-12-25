import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ToastProvider } from './lib/ToastContext'
import { CartProvider } from './lib/CartContext'
import ChatbotWidget from './components/ChatbotWidget'

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Cart = lazy(() => import('./pages/Cart'));
const About = lazy(() => import('./pages/About'));
const Profile = lazy(() => import('./pages/Profile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminForecasting = lazy(() => import('./pages/admin/Forecasting'));

// Loading Component
const PageLoader = () => (
  <div style={{
    height: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8'
  }}>
    <div className="spinner"></div>
  </div>
);

function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </ToastProvider>
  )
}

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {!isAdminPath && <Navbar />}
      <main className="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="forecasting" element={<AdminForecasting />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      {!isAdminPath && <Footer />}
      <ChatbotWidget />
    </div>
  )
}

export default App
