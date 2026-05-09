/**
 * CERBERUS GADGET STORE - Admin Dashboard
 * File: frontend-react/src/pages/admin/AdminDashboard.jsx
 */
import { useState, useEffect } from 'react';
import { Users, DollarSign, ShoppingBag, Package, AlertTriangle, Activity, TrendingUp, Shield, BarChart2, ScrollText } from 'lucide-react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats]         = useState(null);
  const [users, setUsers]         = useState([]);
  const [failedPay, setFailedPay] = useState([]);
  const [lowStock, setLowStock]   = useState([]);
  const [activityLogs, setLogs]  = useState([]);
  const [revenueChart, setRevChart] = useState([]);
  const [topProducts, setTopProds]  = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [toggling, setToggling]   = useState(null);

  useEffect(() => {
    document.title = 'Admin Dashboard — Cerberus';
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/users'),
      api.get('/admin/failed-payments'),
      api.get('/admin/low-stock'),
      api.get('/admin/activity-logs')
    ]).then(([d, u, fp, ls, al]) => {
      setStats(d.data.data?.stats);
      setRevChart(d.data.data?.revenue_chart || []);
      setTopProds(d.data.data?.top_products  || []);
      setUsers(u.data.data || []);
      setFailedPay(fp.data.data || []);
      setLowStock(ls.data.data || []);
      setLogs(al.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleUser = async (userId) => {
    setToggling(userId);
    try {
      await api.put(`/admin/users/${userId}/toggle`);
      setUsers(prev => prev.map(u =>
        (u.USER_ID||u.user_id) === userId
          ? { ...u, IS_ACTIVE: u.IS_ACTIVE === 1 ? 0 : 1 }
          : u
      ));
    } catch {} finally { setToggling(null); }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><div className="spinner" style={{ width:'40px', height:'40px', border:'3px solid rgba(220,38,38,0.2)', borderTopColor:'#dc2626', borderRadius:'50%' }} /></div>;

  const TABS = [
    ['overview',   'Overview',        TrendingUp],
    ['users',      'Users',           Users],
    ['payments',   'Failed Payments', AlertTriangle],
    ['stock',      'Low Stock',       Package],
    ['activity',   'Activity Logs',   Activity],
  ];

  return (
    <div style={{ display:'flex', minHeight:'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <div className="sidebar" style={{ padding:'1.5rem 0' }}>
        <div style={{ padding:'0 1rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'linear-gradient(135deg,#dc2626,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'0.75rem' }}>
            <Shield size={22} color="white" />
          </div>
          <div style={{ fontWeight:700, color:'#fafafa', fontSize:'0.9375rem' }}>Admin Panel</div>
          <div style={{ fontSize:'0.75rem', color:'#71717a' }}>Cerberus Gadget Store</div>
        </div>
        <nav style={{ padding:'1rem 0.5rem' }}>
          {TABS.map(([id,label,Icon]) => (
            <button key={id} onClick={()=>setActiveTab(id)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.625rem 0.875rem', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'0.875rem', fontWeight:500, textAlign:'left', marginBottom:'0.25rem', transition:'all 0.15s',
                background: activeTab===id ? 'rgba(220,38,38,0.15)' : 'transparent',
                color:      activeTab===id ? '#f87171' : '#71717a' }}>
              <Icon size={17}/>{label}
              {id==='payments' && failedPay.length>0 && <span style={{ marginLeft:'auto', background:'#dc2626', color:'white', borderRadius:'50%', width:'18px', height:'18px', fontSize:'10px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{failedPay.length}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex:1, padding:'2rem', minWidth:0, overflowY:'auto' }}>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && stats && (
          <div className="fade-in">
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.5rem', fontWeight:900, color:'#fafafa', marginBottom:'1.5rem' }}>Platform Overview</h1>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
              {[
                [DollarSign,  'Total Revenue',    `Rs. ${Number(stats.total_revenue||0).toFixed(2)}`,  '#22c55e'],
                [ShoppingBag, 'Total Orders',      stats.total_orders||0,                           '#3b82f6'],
                [Users,       'Customers',          stats.customers||0,                             '#8b5cf6'],
                [Package,     'Products',           stats.total_products||0,                        '#f59e0b'],
                [AlertTriangle,'Failed Payments',  stats.failed_payments||0,                        '#ef4444'],
                [Users,       'Sellers',            stats.sellers||0,                               '#06b6d4'],
              ].map(([Icon,label,val,color]) => (
                <div key={label} className="stat-card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.625rem' }}>
                    <span style={{ fontSize:'0.7rem', fontWeight:600, color:'#71717a', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
                    <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:`Rs. ${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon size={15} color={color} />
                    </div>
                  </div>
                  <span style={{ fontSize:'1.75rem', fontWeight:800, color:'#fafafa' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Revenue Chart (simple bar) */}
            {revenueChart.length > 0 && (
              <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.5rem', marginBottom:'1.5rem' }}>
                <h3 style={{ fontWeight:700, color:'#fafafa', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <BarChart2 size={18} color="#dc2626"/> Revenue (Last 7 Days)
                </h3>
                <div style={{ display:'flex', alignItems:'flex-end', gap:'0.5rem', height:'120px' }}>
                  {revenueChart.map((row, i) => {
                    const rev = parseFloat(row.REVENUE||row.revenue||0);
                    const maxRev = Math.max(...revenueChart.map(r => parseFloat(r.REVENUE||r.revenue||0)), 1);
                    const pct = (rev/maxRev)*100;
                    return (
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.375rem' }}>
                        <div title={`Rs. ${rev.toFixed(2)}`} style={{ width:'100%', background:'linear-gradient(180deg,#dc2626,#7c3aed)', borderRadius:'4px 4px 0 0', height:`Rs. ${pct}%`, minHeight:'4px', transition:'height 0.4s ease' }} />
                        <div style={{ fontSize:'0.65rem', color:'#71717a', textAlign:'center' }}>
                          {new Date(row.SALE_DATE||row.sale_date).toLocaleDateString('en',{month:'short',day:'numeric'})}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top Products */}
            {topProducts.length > 0 && (
              <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.5rem' }}>
                <h3 style={{ fontWeight:700, color:'#fafafa', marginBottom:'1rem' }}>🏆 Top Selling Products</h3>
                <table className="table-dark">
                  <thead><tr><th>#</th><th>Product</th><th>Category</th><th>Units Sold</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {topProducts.slice(0,5).map((p,i) => (
                      <tr key={p.PRODUCT_ID||p.product_id||i}>
                        <td style={{ color:'#71717a', fontWeight:600 }}>#{i+1}</td>
                        <td><div style={{ fontWeight:600, color:'#fafafa' }}>{p.PRODUCT_NAME||p.product_name}</div><div style={{ fontSize:'0.75rem', color:'#71717a' }}>{p.BRAND||p.brand}</div></td>
                        <td><span className="badge badge-blue">{p.CATEGORY||p.category}</span></td>
                        <td style={{ fontWeight:600, color:'#fafafa' }}>{p.TOTAL_UNITS_SOLD||p.total_units_sold||0}</td>
                        <td style={{ fontWeight:700, color:'#4ade80' }}>Rs. ${Number(p.TOTAL_REVENUE||p.total_revenue||0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div className="fade-in">
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.5rem', fontWeight:900, color:'#fafafa', marginBottom:'1.5rem' }}>User Management</h1>
            <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden' }}>
              <table className="table-dark">
                <thead><tr><th>ID</th><th>Email</th><th>Name</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {users.map(u => {
                    const uid    = u.USER_ID  ||u.user_id;
                    const role   = u.ROLE     ||u.role;
                    const active = u.IS_ACTIVE!==undefined ? u.IS_ACTIVE : 1;
                    return (
                      <tr key={uid}>
                        <td style={{ color:'#71717a', fontFamily:'monospace' }}>#{uid}</td>
                        <td style={{ color:'#a1a1aa', fontSize:'0.875rem' }}>{u.EMAIL||u.email}</td>
                        <td style={{ color:'#fafafa', fontWeight:500 }}>{u.DISPLAY_NAME||u.display_name||'—'}</td>
                        <td>
                          <span className={`badge ${role==='admin'?'badge-red':role==='seller'?'badge-yellow':'badge-blue'}`}>{role}</span>
                        </td>
                        <td style={{ color:'#71717a', fontSize:'0.8rem' }}>{new Date(u.CREATED_AT||u.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${active ? 'badge-green' : 'badge-red'}`}>{active ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td>
                          {role !== 'admin' && (
                            <button onClick={()=>toggleUser(uid)} disabled={toggling===uid}
                              style={{ padding:'4px 10px', fontSize:'0.75rem', fontWeight:600, borderRadius:'6px', border:'none', cursor:'pointer', transition:'all 0.15s',
                                background: active ? 'rgba(220,38,38,0.15)' : 'rgba(34,197,94,0.15)',
                                color:      active ? '#f87171'             : '#4ade80' }}>
                              {toggling===uid ? '...' : active ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── FAILED PAYMENTS ── */}
        {activeTab === 'payments' && (
          <div className="fade-in">
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.5rem', fontWeight:900, color:'#fafafa', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <AlertTriangle size={22} color="#f87171"/> Failed Payments
              {failedPay.length > 0 && <span style={{ background:'#dc2626', color:'white', borderRadius:'20px', padding:'2px 10px', fontSize:'0.8rem', fontWeight:700 }}>{failedPay.length}</span>}
            </h1>
            {failedPay.length === 0 ? (
              <div style={{ background:'#18181b', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'16px', padding:'2.5rem', textAlign:'center', color:'#4ade80' }}>
                ✅ No failed payments! All transactions are healthy.
              </div>
            ) : (
              <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden' }}>
                <table className="table-dark">
                  <thead><tr><th>Payment ID</th><th>Order #</th><th>Customer</th><th>Amount</th><th>Method</th><th>Date</th></tr></thead>
                  <tbody>
                    {failedPay.map(p => (
                      <tr key={p.PAYMENT_ID||p.payment_id}>
                        <td style={{ color:'#f87171', fontFamily:'monospace' }}>#{p.PAYMENT_ID||p.payment_id}</td>
                        <td style={{ fontWeight:600, color:'#fafafa' }}>#{p.ORDER_ID||p.order_id}</td>
                        <td style={{ color:'#a1a1aa' }}>{p.CUSTOMER_NAME||p.customer_name||'—'}</td>
                        <td style={{ fontWeight:700, color:'#f87171' }}>Rs. ${Number(p.AMOUNT||p.amount||0).toFixed(2)}</td>
                        <td><span className="badge badge-yellow">{p.METHOD||p.method}</span></td>
                        <td style={{ color:'#71717a', fontSize:'0.8rem' }}>{new Date(p.ATTEMPTED_AT||p.attempted_at||Date.now()).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── LOW STOCK ── */}
        {activeTab === 'stock' && (
          <div className="fade-in">
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.5rem', fontWeight:900, color:'#fafafa', marginBottom:'1.5rem' }}>Low Stock Alerts</h1>
            {lowStock.length === 0 ? (
              <div style={{ background:'#18181b', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'16px', padding:'2.5rem', textAlign:'center', color:'#4ade80' }}>
                ✅ All products have sufficient stock!
              </div>
            ) : (
              <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden' }}>
                <table className="table-dark">
                  <thead><tr><th>Product</th><th>Brand</th><th>Seller</th><th>Current Stock</th><th>Threshold</th><th>Alert</th></tr></thead>
                  <tbody>
                    {lowStock.map(item => {
                      const qty = item.CURRENT_STOCK||item.current_stock||0;
                      const threshold = item.LOW_STOCK_THRESHOLD||item.low_stock_threshold||5;
                      return (
                        <tr key={item.PRODUCT_ID||item.product_id}>
                          <td style={{ fontWeight:600, color:'#fafafa' }}>{item.PRODUCT_NAME||item.product_name}</td>
                          <td style={{ color:'#a1a1aa' }}>{item.BRAND||item.brand}</td>
                          <td style={{ color:'#71717a', fontSize:'0.8rem' }}>{item.SELLER||item.seller}</td>
                          <td><span style={{ fontWeight:700, color: qty===0 ? '#f87171' : '#fbbf24', fontSize:'1rem' }}>{qty}</span></td>
                          <td style={{ color:'#71717a' }}>{threshold}</td>
                          <td>
                            {qty === 0
                              ? <span className="badge badge-red">Out of Stock</span>
                              : <span className="badge badge-yellow">Low Stock</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVITY LOGS ── */}
        {activeTab === 'activity' && (
          <div className="fade-in">
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.5rem', fontWeight:900, color:'#fafafa', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <ScrollText size={22} color="#dc2626"/> Activity Logs (MongoDB)
            </h1>
            <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden' }}>
              <table className="table-dark">
                <thead><tr><th>Time</th><th>User</th><th>Role</th><th>Action</th><th>IP</th></tr></thead>
                <tbody>
                  {activityLogs.map((log, i) => (
                    <tr key={log._id || i}>
                      <td style={{ color:'#71717a', fontSize:'0.8rem', whiteSpace:'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ color:'#a1a1aa', fontSize:'0.8rem' }}>{log.user_email || 'Guest'}</td>
                      <td>
                        <span className={`badge ${log.role==='admin'?'badge-red':log.role==='seller'?'badge-yellow':'badge-blue'}`}>
                          {log.role || 'guest'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'#4ade80', background:'rgba(34,197,94,0.08)', padding:'2px 8px', borderRadius:'4px' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ color:'#71717a', fontSize:'0.75rem', fontFamily:'monospace' }}>{log.ip || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {activityLogs.length === 0 && (
                <div style={{ textAlign:'center', padding:'2rem', color:'#71717a' }}>No activity logs yet.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
