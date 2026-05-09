/**
 * CERBERUS GADGET STORE - Customer Dashboard
 * File: frontend-react/src/pages/customer/CustomerDashboard.jsx
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, Star, MapPin, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const STATUS_CONFIG = {
  pending:    { color:'#fbbf24', icon: Clock,         label:'Pending' },
  confirmed:  { color:'#60a5fa', icon: CheckCircle,   label:'Confirmed' },
  processing: { color:'#a78bfa', icon: Package,       label:'Processing' },
  shipped:    { color:'#34d399', icon: Truck,         label:'Shipped' },
  delivered:  { color:'#4ade80', icon: CheckCircle,   label:'Delivered' },
  cancelled:  { color:'#f87171', icon: XCircle,       label:'Cancelled' },
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'My Dashboard — Cerberus';
    Promise.all([
      api.get('/orders?limit=5'),
      api.get('/wishlist')
    ]).then(([ordRes, wishRes]) => {
      setOrders(ordRes.data.data || []);
      setWishlist(wishRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const displayName = user?.display_name || user?.DISPLAY_NAME || user?.first_name || user?.FIRST_NAME || 'Customer';
  const totalOrders = orders.length;
  const delivered   = orders.filter(o => (o.STATUS||o.status) === 'delivered').length;

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <div className="spinner" style={{ width:'40px', height:'40px', border:'3px solid rgba(220,38,38,0.2)', borderTopColor:'#dc2626', borderRadius:'50%' }} />
    </div>
  );

  return (
    <div style={{ padding:'2rem 0 4rem' }}>
      <div className="page-container">
        {/* Header */}
        <div style={{ marginBottom:'2rem' }}>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.75rem', fontWeight:900, color:'#fafafa', marginBottom:'0.25rem' }}>
            Welcome back, {displayName.split(' ')[0]}! 👋
          </h1>
          <p style={{ color:'#71717a', fontSize:'0.9rem' }}>Manage your orders, wishlist and account settings.</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'2.5rem' }}>
          {[
            [Package,'Total Orders', totalOrders,'#3b82f6'],
            [CheckCircle,'Delivered', delivered,'#22c55e'],
            [Heart,'Wishlist Items', wishlist.length,'#ec4899'],
            [Star,'Reviews Given', 0,'#f59e0b'],
          ].map(([Icon,label,val,color]) => (
            <div key={label} className="stat-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                <span style={{ fontSize:'0.75rem', fontWeight:600, color:'#71717a', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
                <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:`Rs. ${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={18} color={color} />
                </div>
              </div>
              <span style={{ fontSize:'2rem', fontWeight:800, color:'#fafafa' }}>{val}</span>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'1.5rem', alignItems:'start' }}>
          {/* Recent Orders */}
          <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.5rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, color:'#fafafa', fontSize:'1.0625rem' }}>Recent Orders</h2>
              <Link to="/orders" style={{ fontSize:'0.8125rem', color:'#dc2626', textDecoration:'none', fontWeight:500 }}>View all →</Link>
            </div>
            {orders.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'#71717a' }}>
                <Package size={36} color="#3f3f46" style={{ marginBottom:'0.75rem' }} />
                <p style={{ fontSize:'0.875rem' }}>No orders yet. Start shopping!</p>
                <Link to="/products" className="btn-cerberus" style={{ display:'inline-flex', marginTop:'1rem', padding:'0.5rem 1.25rem' }}>Browse Products</Link>
              </div>
            ) : (
              <table className="table-dark">
                <thead>
                  <tr><th>Order #</th><th>Date</th><th>Amount</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const status = (order.STATUS||order.status||'pending').toLowerCase();
                    const cfg    = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                    const Icon   = cfg.icon;
                    return (
                      <tr key={order.ORDER_ID||order.order_id}>
                        <td style={{ fontWeight:600, color:'#fafafa' }}>#{order.ORDER_ID||order.order_id}</td>
                        <td style={{ color:'#71717a' }}>{new Date(order.CREATED_AT||order.created_at).toLocaleDateString()}</td>
                        <td style={{ color:'#fafafa', fontWeight:600 }}>Rs. ${Number(order.TOTAL_AMOUNT||order.total_amount||0).toFixed(2)}</td>
                        <td>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:'0.375rem', padding:'3px 10px', borderRadius:'20px',
                            background:`Rs. ${cfg.color}18`, color:cfg.color, fontSize:'0.75rem', fontWeight:600, border:`1px solid ${cfg.color}30` }}>
                            <Icon size={11}/>{cfg.label}
                          </span>
                        </td>
                        <td>
                          <Link to={`/orders/${order.ORDER_ID||order.order_id}`} style={{ fontSize:'0.8rem', color:'#dc2626', textDecoration:'none' }}>Track →</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Wishlist preview */}
          <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.5rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, color:'#fafafa', fontSize:'1.0625rem' }}>Wishlist</h2>
              <Link to="/wishlist" style={{ fontSize:'0.8125rem', color:'#dc2626', textDecoration:'none', fontWeight:500 }}>View all →</Link>
            </div>
            {wishlist.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'#71717a' }}>
                <Heart size={36} color="#3f3f46" style={{ marginBottom:'0.75rem' }} />
                <p style={{ fontSize:'0.875rem' }}>Your wishlist is empty</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {wishlist.slice(0,4).map(item => (
                  <Link key={item.WISHLIST_ID||item.wishlist_id} to={`/products/${item.PRODUCT_ID||item.product_id}`}
                    style={{ display:'flex', gap:'0.75rem', alignItems:'center', textDecoration:'none', padding:'0.625rem', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.04)', transition:'all 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(220,38,38,0.2)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.04)'}>
                    <img src={item.IMAGE_URL||item.image_url||'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100'}
                      style={{ width:'44px', height:'44px', borderRadius:'8px', objectFit:'cover', flexShrink:0 }}
                      onError={e=>e.target.src='https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100'} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.8125rem', fontWeight:600, color:'#fafafa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.NAME||item.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'#dc2626', fontWeight:600 }}>Rs. ${Number(item.PRICE||item.price||0).toFixed(2)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div style={{ marginTop:'1.5rem', background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.5rem' }}>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, color:'#fafafa', marginBottom:'1.25rem', fontSize:'1.0625rem' }}>Account Details</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem' }}>
            {[
              ['Email',    user?.email||user?.EMAIL||'—'],
              ['Role',     'Customer'],
              ['Phone',    user?.PHONE||user?.phone||'Not set'],
              ['City',     user?.CITY||user?.city||'Not set'],
              ['Address',  user?.ADDRESS||user?.address||'Not set'],
            ].map(([label,val]) => (
              <div key={label}>
                <div style={{ fontSize:'0.75rem', color:'#71717a', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.25rem' }}>{label}</div>
                <div style={{ fontSize:'0.9rem', color:'#fafafa', fontWeight:500 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
