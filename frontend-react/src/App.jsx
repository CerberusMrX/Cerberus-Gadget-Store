/**
 * CERBERUS GADGET STORE - App Router
 * File: frontend-react/src/App.jsx
 */
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import api from './api/axios';

import Navbar          from './components/Navbar';
import Footer          from './components/Footer';
import ProtectedRoute  from './components/ProtectedRoute';

// Public Pages
import HomePage           from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage  from './pages/ProductDetailPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';

// Customer Pages
import CartPage           from './pages/CartPage';
import CheckoutPage       from './pages/CheckoutPage';
import CustomerDashboard  from './pages/customer/CustomerDashboard';
import OrdersPage         from './pages/customer/OrdersPage';
import WishlistPage       from './pages/customer/WishlistPage';

// Seller Pages
import SellerDashboard    from './pages/seller/SellerDashboard';

// Admin Pages
import AdminDashboard     from './pages/admin/AdminDashboard';

// ── Layout Wrappers ───────────────────────────────────────────
function Layout({ children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <Navbar />
      <main style={{ flex:1 }}>{children}</main>
      <Footer />
    </div>
  );
}

function DashLayout({ children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <Navbar />
      <main style={{ flex:1 }}>{children}</main>
    </div>
  );
}

// ── Order Detail Page (inline) ────────────────────────────────
function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => { setOrder(r.data.data); document.title = `Order #${id} — Cerberus`; })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <div className="spinner" style={{ width:'40px', height:'40px', border:'3px solid rgba(220,38,38,0.2)', borderTopColor:'#dc2626', borderRadius:'50%' }} />
    </div>
  );

  if (!order) return (
    <div style={{ textAlign:'center', padding:'4rem', color:'#71717a' }}>Order not found.</div>
  );

  const items    = order.ITEMS || [];
  const events   = order.DELIVERY_EVENTS || [];
  const total    = order.TOTAL_AMOUNT || order.total_amount;
  const tracking = order.TRACKING_NO  || order.tracking_no;
  const carrier  = order.CARRIER      || order.carrier;
  const estDate  = order.ESTIMATED_DATE || order.estimated_date;

  return (
    <div style={{ padding:'2rem 0 4rem' }}>
      <div className="page-container" style={{ maxWidth:'900px' }}>
        <div style={{ marginBottom:'1.5rem' }}>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.5rem', fontWeight:800, color:'#fafafa' }}>Order #{id}</h1>
          <p style={{ color:'#71717a', fontSize:'0.875rem' }}>
            Status: <span style={{ color:'#fafafa', fontWeight:600 }}>{order.STATUS || order.status}</span>
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1.5rem', alignItems:'start' }}>
          <div>
            {/* Items */}
            <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.25rem', marginBottom:'1.25rem' }}>
              <h3 style={{ fontWeight:700, color:'#fafafa', marginBottom:'1rem' }}>Items Ordered</h3>
              {items.map((item, i) => (
                <div key={i} style={{ display:'flex', gap:'0.875rem', alignItems:'center', paddingBottom:'0.75rem', borderBottom:'1px solid rgba(255,255,255,0.05)', marginBottom:'0.75rem' }}>
                  <img src={item.IMAGE_URL||item.image_url||'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100'}
                    style={{ width:'52px', height:'52px', objectFit:'cover', borderRadius:'10px' }}
                    onError={e=>e.target.src='https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100'} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, color:'#fafafa', fontSize:'0.9rem' }}>{item.NAME||item.name}</div>
                    <div style={{ color:'#71717a', fontSize:'0.8rem' }}>{item.BRAND||item.brand} × {item.QUANTITY||item.quantity}</div>
                  </div>
                  <div style={{ fontWeight:700, color:'#fafafa' }}>
                    Rs. ${Number(((item.UNIT_PRICE||item.unit_price)||0) * ((item.QUANTITY||item.quantity)||1)).toFixed(2)}
                  </div>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'flex-end', fontWeight:800, color:'#fafafa', fontSize:'1.0625rem' }}>
                Total: Rs. ${Number(total||0).toFixed(2)}
              </div>
            </div>

            {/* Delivery Timeline */}
            {events.length > 0 && (
              <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.25rem' }}>
                <h3 style={{ fontWeight:700, color:'#fafafa', marginBottom:'1rem' }}>📦 Delivery Timeline</h3>
                <div style={{ position:'relative', paddingLeft:'1.75rem' }}>
                  <div style={{ position:'absolute', left:'7px', top:0, bottom:0, width:'2px', background:'rgba(255,255,255,0.06)' }} />
                  {events.map((ev, i) => (
                    <div key={i} style={{ position:'relative', paddingBottom:'1.25rem' }}>
                      <div style={{ position:'absolute', left:'-1.5rem', width:'14px', height:'14px', borderRadius:'50%', top:'2px',
                        background:  i === events.length-1 ? '#dc2626' : '#27272a',
                        border:      `2px solid ${i === events.length-1 ? '#dc2626' : '#3f3f46'}` }} />
                      <div style={{ fontWeight:600, color:'#fafafa', fontSize:'0.875rem', marginBottom:'0.2rem', textTransform:'capitalize' }}>
                        {(ev.status||'').replace(/_/g,' ')}
                      </div>
                      {ev.location && <div style={{ fontSize:'0.8rem', color:'#71717a' }}>📍 {ev.location}</div>}
                      {ev.notes    && <div style={{ fontSize:'0.8rem', color:'#a1a1aa' }}>{ev.notes}</div>}
                      <div style={{ fontSize:'0.75rem', color:'#52525b', marginTop:'0.25rem' }}>
                        {new Date(ev.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tracking Panel */}
          <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.25rem', position:'sticky', top:'80px' }}>
            <h3 style={{ fontWeight:700, color:'#fafafa', marginBottom:'1rem' }}>Tracking Details</h3>
            {[
              ['Tracking No',   tracking || 'Generating...'],
              ['Carrier',       carrier  || 'Cerberus Logistics'],
              ['Est. Delivery', estDate  ? new Date(estDate).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}) : '3–5 business days'],
              ['Ship To',       (order.SHIPPING_ADDRESS||order.shipping_address||'—')],
              ['City',          (order.SHIPPING_CITY||order.shipping_city||'—')],
              ['Payment',       (order.METHOD||order.payment_method||'—')],
            ].map(([label, val]) => (
              <div key={label} style={{ marginBottom:'0.875rem' }}>
                <div style={{ fontSize:'0.7rem', color:'#71717a', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.2rem' }}>{label}</div>
                <div style={{ fontSize:'0.875rem', color:'#fafafa', fontWeight:500, wordBreak:'break-word' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#18181b',
                color: '#fafafa',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: '500',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              },
              success: { iconTheme: { primary:'#4ade80', secondary:'#18181b' } },
              error:   { iconTheme: { primary:'#f87171', secondary:'#18181b' } }
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/"            element={<Layout><HomePage /></Layout>} />
            <Route path="/products"    element={<Layout><ProductListingPage /></Layout>} />
            <Route path="/products/:id"element={<Layout><ProductDetailPage /></Layout>} />
            <Route path="/login"       element={<Layout><LoginPage /></Layout>} />
            <Route path="/register"    element={<Layout><RegisterPage /></Layout>} />

            {/* Customer */}
            <Route path="/cart" element={
              <ProtectedRoute roles={['customer']}>
                <Layout><CartPage /></Layout>
              </ProtectedRoute>} />
            <Route path="/checkout" element={
              <ProtectedRoute roles={['customer']}>
                <Layout><CheckoutPage /></Layout>
              </ProtectedRoute>} />
            <Route path="/dashboard/customer" element={
              <ProtectedRoute roles={['customer']}>
                <Layout><CustomerDashboard /></Layout>
              </ProtectedRoute>} />
            <Route path="/orders" element={
              <ProtectedRoute roles={['customer']}>
                <Layout><OrdersPage /></Layout>
              </ProtectedRoute>} />
            <Route path="/orders/:id" element={
              <ProtectedRoute roles={['customer','admin']}>
                <Layout><OrderDetailPage /></Layout>
              </ProtectedRoute>} />
            <Route path="/wishlist" element={
              <ProtectedRoute roles={['customer']}>
                <Layout><WishlistPage /></Layout>
              </ProtectedRoute>} />

            {/* Seller */}
            <Route path="/dashboard/seller" element={
              <ProtectedRoute roles={['seller']}>
                <DashLayout><SellerDashboard /></DashLayout>
              </ProtectedRoute>} />

            {/* Admin */}
            <Route path="/dashboard/admin" element={
              <ProtectedRoute roles={['admin']}>
                <DashLayout><AdminDashboard /></DashLayout>
              </ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
