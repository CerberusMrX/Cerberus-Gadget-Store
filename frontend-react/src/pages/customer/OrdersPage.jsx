/**
 * CERBERUS GADGET STORE - Orders Page
 * File: frontend-react/src/pages/customer/OrdersPage.jsx
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import api from '../../api/axios';

const STATUS_CONFIG = {
  pending:    { color:'#fbbf24', icon:Clock,       label:'Pending'    },
  confirmed:  { color:'#60a5fa', icon:CheckCircle, label:'Confirmed'  },
  processing: { color:'#a78bfa', icon:Package,     label:'Processing' },
  shipped:    { color:'#34d399', icon:Truck,       label:'Shipped'    },
  delivered:  { color:'#4ade80', icon:CheckCircle, label:'Delivered'  },
  cancelled:  { color:'#f87171', icon:XCircle,     label:'Cancelled'  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'My Orders — Cerberus';
    api.get('/orders').then(r => setOrders(r.data.data || [])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <div className="spinner" style={{ width:'40px', height:'40px', border:'3px solid rgba(220,38,38,0.2)', borderTopColor:'#dc2626', borderRadius:'50%' }} />
    </div>
  );

  return (
    <div style={{ padding:'2rem 0 4rem' }}>
      <div className="page-container">
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.75rem', fontWeight:800, color:'#fafafa', marginBottom:'2rem' }}>My Orders</h1>

        {orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'#71717a' }}>
            <Package size={56} color="#27272a" style={{ marginBottom:'1rem' }} />
            <h3 style={{ color:'#a1a1aa', marginBottom:'0.5rem' }}>No orders yet</h3>
            <Link to="/products" className="btn-cerberus" style={{ display:'inline-flex', marginTop:'1rem' }}>Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {orders.map(order => {
              const oid    = order.ORDER_ID  || order.order_id;
              const status = ((order.STATUS  || order.status) || 'pending').toLowerCase();
              const cfg    = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
              const Icon   = cfg.icon;
              const total  = order.TOTAL_AMOUNT  || order.total_amount;
              const date   = order.CREATED_AT    || order.created_at;
              const tracking = order.TRACKING_NO || order.tracking_no;
              const delivStatus = order.DELIVERY_STATUS || order.delivery_status;

              return (
                <div key={oid} style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.25rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem' }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.375rem' }}>
                        <span style={{ fontWeight:700, color:'#fafafa', fontSize:'1rem' }}>Order #{oid}</span>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'0.375rem', padding:'3px 10px', borderRadius:'20px',
                          background:`Rs. ${cfg.color}18`, color:cfg.color, fontSize:'0.75rem', fontWeight:600, border:`1px solid ${cfg.color}30` }}>
                          <Icon size={11}/>{cfg.label}
                        </span>
                      </div>
                      <div style={{ fontSize:'0.8rem', color:'#71717a' }}>Placed on {new Date(date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div>
                      {tracking && (
                        <div style={{ fontSize:'0.8rem', color:'#a1a1aa', marginTop:'0.25rem' }}>
                          Tracking: <span style={{ color:'#fafafa', fontFamily:'monospace' }}>{tracking}</span>
                          {delivStatus && <span style={{ marginLeft:'0.5rem', color:'#34d399', fontWeight:500 }}>· {delivStatus}</span>}
                        </div>
                      )}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                      <span style={{ fontWeight:800, fontSize:'1.25rem', color:'#fafafa' }}>Rs. ${Number(total||0).toFixed(2)}</span>
                      <Link to={`/orders/${oid}`} style={{ display:'flex', alignItems:'center', gap:'0.25rem', color:'#dc2626', textDecoration:'none', fontSize:'0.875rem', fontWeight:600 }}>
                        View Details <ChevronRight size={14}/>
                      </Link>
                    </div>
                  </div>
                  {/* Delivery progress bar */}
                  <div style={{ marginTop:'1rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.375rem' }}>
                      {['Confirmed','Processing','Shipped','Delivered'].map((s,i) => {
                        const steps = ['confirmed','processing','shipped','delivered'];
                        const done  = ['confirmed','processing','shipped','delivered'].indexOf(status) >= i;
                        return (
                          <div key={s} style={{ flex:1, textAlign:'center' }}>
                            <div style={{ width:'12px', height:'12px', borderRadius:'50%', margin:'0 auto 4px', background: done ? cfg.color : '#27272a', border: done ? `2px solid ${cfg.color}` : '2px solid #3f3f46', transition:'all 0.3s' }} />
                            <div style={{ fontSize:'0.65rem', color: done ? cfg.color : '#52525b', fontWeight: done ? 600 : 400 }}>{s}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ height:'3px', background:'#27272a', borderRadius:'2px', margin:'0 10px' }}>
                      <div style={{ height:'100%', borderRadius:'2px', background:`linear-gradient(90deg, ${cfg.color}, ${cfg.color}80)`,
                        width: `Rs. ${Math.max(0,['confirmed','processing','shipped','delivered'].indexOf(status)) * 33.3}%`, transition:'width 0.5s' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
