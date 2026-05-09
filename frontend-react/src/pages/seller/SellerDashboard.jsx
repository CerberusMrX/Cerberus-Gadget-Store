/**
 * CERBERUS GADGET STORE - Seller Dashboard
 * File: frontend-react/src/pages/seller/SellerDashboard.jsx
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, DollarSign, ShoppingBag, AlertTriangle, Plus, Edit, Trash2, Eye, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData]        = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders]    = useState([]);
  const [loading, setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({ name:'',description:'',price:'',discount_pct:'0',category_id:'1',brand:'',model:'',stock:'0',image_url:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Seller Dashboard — Cerberus';
    Promise.all([
      api.get('/seller/dashboard'),
      api.get('/seller/products'),
      api.get('/seller/orders'),
      api.get('/categories')
    ]).then(([d, p, o, c]) => {
      setData(d.data.data);
      setProducts(p.data.data || []);
      setOrders(o.data.data || []);
      setCategories(c.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return toast.error('Name and price required');
    setSaving(true);
    try {
      await api.post('/products', newProduct);
      toast.success('Product added!');
      setShowAddProduct(false);
      setNewProduct({ name:'',description:'',price:'',discount_pct:'0',category_id:'1',brand:'',model:'',stock:'0',image_url:'' });
      const p = await api.get('/seller/products');
      setProducts(p.data.data || []);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add product'); }
    finally { setSaving(false); }
  };

  const handleDeleteProduct = async (pid) => {
    if (!confirm('Remove this product from listing?')) return;
    try {
      await api.delete(`/products/${pid}`);
      toast.success('Product removed');
      setProducts(prev => prev.filter(p => (p.PRODUCT_ID||p.product_id) !== pid));
    } catch { toast.error('Failed to remove product'); }
  };

  const updateDelivery = async (orderId, status) => {
    try {
      await api.put(`/delivery/${orderId}/status`, { status });
      toast.success('Delivery status updated');
      const o = await api.get('/seller/orders');
      setOrders(o.data.data || []);
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><div className="spinner" style={{ width:'40px', height:'40px', border:'3px solid rgba(220,38,38,0.2)', borderTopColor:'#dc2626', borderRadius:'50%' }} /></div>;

  const storeName = user?.display_name || user?.DISPLAY_NAME || 'My Store';

  return (
    <div style={{ display:'flex', minHeight:'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <div className="sidebar" style={{ padding:'1.5rem 0' }}>
        <div style={{ padding:'0 1rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'linear-gradient(135deg,#dc2626,#b91c1c)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'0.75rem' }}>
            <ShoppingBag size={22} color="white" />
          </div>
          <div style={{ fontWeight:700, color:'#fafafa', fontSize:'0.9375rem' }}>{storeName}</div>
          <div style={{ fontSize:'0.75rem', color:'#71717a' }}>Seller Dashboard</div>
        </div>
        <nav style={{ padding:'1rem 0.5rem' }}>
          {[['overview','Overview',TrendingUp],['products','Products',Package],['orders','Orders',ShoppingBag]].map(([id,label,Icon]) => (
            <button key={id} onClick={()=>setActiveTab(id)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.625rem 0.875rem', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'0.875rem', fontWeight:500, textAlign:'left', marginBottom:'0.25rem', transition:'all 0.15s',
                background: activeTab===id ? 'rgba(220,38,38,0.15)' : 'transparent',
                color:      activeTab===id ? '#f87171' : '#71717a' }}>
              <Icon size={17}/>{label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex:1, padding:'2rem', minWidth:0, overflowY:'auto' }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && data && (
          <div className="fade-in">
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.5rem', fontWeight:900, color:'#fafafa', marginBottom:'1.5rem' }}>Store Overview</h1>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
              {[
                [DollarSign,'Total Revenue',`Rs. ${Number(data.total_revenue||0).toFixed(2)}`,'#22c55e'],
                [ShoppingBag,'Total Orders',data.total_orders||0,'#3b82f6'],
                [Package,'Products Listed',data.total_products||0,'#8b5cf6'],
                [AlertTriangle,'Low Stock',data.low_stock?.length||0,'#f59e0b'],
              ].map(([Icon,label,val,color]) => (
                <div key={label} className="stat-card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                    <span style={{ fontSize:'0.75rem', fontWeight:600, color:'#71717a', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
                    <div style={{ width:'34px', height:'34px', borderRadius:'8px', background:`Rs. ${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon size={16} color={color} />
                    </div>
                  </div>
                  <span style={{ fontSize:'1.875rem', fontWeight:800, color:'#fafafa' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Low stock alert */}
            {data.low_stock?.length > 0 && (
              <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:'14px', padding:'1.25rem', marginBottom:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem' }}>
                  <AlertTriangle size={18} color="#f59e0b" />
                  <span style={{ color:'#fbbf24', fontWeight:700 }}>Low Stock Alerts</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {data.low_stock.map(item => (
                    <div key={item.PRODUCT_ID||item.product_id} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.875rem', color:'#a1a1aa' }}>
                      <span>{item.NAME||item.name}</span>
                      <span style={{ color:'#fbbf24', fontWeight:600 }}>{item.STOCK||item.quantity||0} left</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent orders */}
            <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.25rem' }}>
              <h3 style={{ fontWeight:700, color:'#fafafa', marginBottom:'1rem' }}>Recent Orders</h3>
              <table className="table-dark">
                <thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {(data.recent_orders||[]).map(o => (
                    <tr key={o.ORDER_ID||o.order_id}>
                      <td style={{ fontWeight:600, color:'#fafafa' }}>#{o.ORDER_ID||o.order_id}</td>
                      <td style={{ color:'#a1a1aa' }}>{o.CUSTOMER_NAME||o.customer_name}</td>
                      <td style={{ color:'#fafafa', fontWeight:600 }}>Rs. ${Number(o.TOTAL_AMOUNT||o.total_amount||0).toFixed(2)}</td>
                      <td><span className="badge badge-blue">{o.STATUS||o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="fade-in">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.5rem', fontWeight:900, color:'#fafafa' }}>My Products</h1>
              <button onClick={()=>setShowAddProduct(!showAddProduct)} className="btn-cerberus">
                <Plus size={16}/>{showAddProduct ? 'Cancel' : 'Add Product'}
              </button>
            </div>

            {/* Add Product Form */}
            {showAddProduct && (
              <div style={{ background:'#18181b', border:'1px solid rgba(220,38,38,0.2)', borderRadius:'16px', padding:'1.5rem', marginBottom:'1.5rem' }} className="fade-in">
                <h3 style={{ fontWeight:700, color:'#fafafa', marginBottom:'1.25rem' }}>New Product</h3>
                <form onSubmit={handleAddProduct}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem', marginBottom:'0.875rem' }}>
                    <div>
                      <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Product Name *</label>
                      <input className="input-dark" value={newProduct.name} onChange={e=>setNewProduct(p=>({...p,name:e.target.value}))} placeholder="iPhone 16 Pro" required />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Brand</label>
                      <input className="input-dark" value={newProduct.brand} onChange={e=>setNewProduct(p=>({...p,brand:e.target.value}))} placeholder="Apple" />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Price (USD) *</label>
                      <input className="input-dark" type="number" value={newProduct.price} onChange={e=>setNewProduct(p=>({...p,price:e.target.value}))} placeholder="999.00" required min="0" step="0.01" />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Discount %</label>
                      <input className="input-dark" type="number" value={newProduct.discount_pct} onChange={e=>setNewProduct(p=>({...p,discount_pct:e.target.value}))} placeholder="0" min="0" max="100" />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Category</label>
                      <select className="input-dark" value={newProduct.category_id} onChange={e=>setNewProduct(p=>({...p,category_id:e.target.value}))}>
                        {categories.map(c => <option key={c.CATEGORY_ID||c.category_id} value={c.CATEGORY_ID||c.category_id}>{c.NAME||c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Stock Quantity</label>
                      <input className="input-dark" type="number" value={newProduct.stock} onChange={e=>setNewProduct(p=>({...p,stock:e.target.value}))} placeholder="50" min="0" />
                    </div>
                  </div>
                  <div style={{ marginBottom:'0.875rem' }}>
                    <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Image URL</label>
                    <input className="input-dark" value={newProduct.image_url} onChange={e=>setNewProduct(p=>({...p,image_url:e.target.value}))} placeholder="https://..." />
                  </div>
                  <div style={{ marginBottom:'1rem' }}>
                    <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Description</label>
                    <textarea className="input-dark" rows={3} value={newProduct.description} onChange={e=>setNewProduct(p=>({...p,description:e.target.value}))} placeholder="Product details..." style={{ resize:'vertical' }} />
                  </div>
                  <button type="submit" className="btn-cerberus" disabled={saving}>
                    {saving ? 'Adding...' : <><Plus size={15}/> Add Product</>}
                  </button>
                </form>
              </div>
            )}

            {/* Products Table */}
            <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden' }}>
              {products.length === 0 ? (
                <div style={{ textAlign:'center', padding:'3rem', color:'#71717a' }}>
                  <Package size={40} color="#27272a" style={{ marginBottom:'0.75rem' }} />
                  <p>No products yet. Add your first product!</p>
                </div>
              ) : (
                <table className="table-dark">
                  <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr></thead>
                  <tbody>
                    {products.map(p => {
                      const pid = p.PRODUCT_ID||p.product_id;
                      return (
                        <tr key={pid}>
                          <td>
                            <img src={p.IMAGE_URL||p.image_url||'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=80'}
                              style={{ width:'44px', height:'44px', objectFit:'cover', borderRadius:'8px' }}
                              onError={e=>e.target.src='https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=80'} />
                          </td>
                          <td><div style={{ fontWeight:600, color:'#fafafa', fontSize:'0.875rem' }}>{p.NAME||p.name}</div><div style={{ fontSize:'0.75rem', color:'#71717a' }}>{p.CATEGORY||p.category}</div></td>
                          <td style={{ fontWeight:700, color:'#fafafa' }}>Rs. ${Number(p.PRICE||p.price||0).toFixed(2)}</td>
                          <td>
                            <span style={{ color: (p.STOCK||p.stock||0)<=5 ? '#fbbf24' : '#4ade80', fontWeight:600 }}>{p.STOCK||p.stock||0}</span>
                          </td>
                          <td style={{ color:'#f59e0b' }}><Star size={14} fill="#f59e0b" color="#f59e0b" style={{display:"inline", verticalAlign:"text-bottom", marginRight:"2px"}}/> {Number(p.RATING_AVG||p.rating_avg||0).toFixed(1)}</td>
                          <td>
                            <div style={{ display:'flex', gap:'0.375rem' }}>
                              <Link to={`/products/${pid}`} title="View" style={{ padding:'0.375rem', background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'6px', color:'#60a5fa', textDecoration:'none', display:'flex' }}>
                                <Eye size={13}/>
                              </Link>
                              <button onClick={()=>handleDeleteProduct(pid)} title="Remove" style={{ padding:'0.375rem', background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.2)', borderRadius:'6px', color:'#f87171', cursor:'pointer', display:'flex', alignItems:'center' }}>
                                <Trash2 size={13}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="fade-in">
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.5rem', fontWeight:900, color:'#fafafa', marginBottom:'1.5rem' }}>Customer Orders</h1>
            <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden' }}>
              {orders.length === 0 ? (
                <div style={{ textAlign:'center', padding:'3rem', color:'#71717a' }}>No orders yet.</div>
              ) : (
                <table className="table-dark">
                  <thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Delivery</th><th>Update</th></tr></thead>
                  <tbody>
                    {orders.map(o => {
                      const oid = o.ORDER_ID||o.order_id;
                      return (
                        <tr key={oid}>
                          <td style={{ fontWeight:600, color:'#fafafa' }}>#{oid}</td>
                          <td style={{ color:'#a1a1aa', fontSize:'0.875rem' }}>{o.CUSTOMER_NAME||o.customer_name}</td>
                          <td style={{ fontWeight:600, color:'#fafafa' }}>Rs. ${Number(o.TOTAL_AMOUNT||o.total_amount||0).toFixed(2)}</td>
                          <td><span className="badge badge-blue">{o.STATUS||o.status}</span></td>
                          <td style={{ color:'#a1a1aa', fontSize:'0.8rem' }}>{o.DELIVERY_STATUS||o.delivery_status||'—'}</td>
                          <td>
                            <select onChange={e=>updateDelivery(oid,e.target.value)} defaultValue=""
                              style={{ background:'#27272a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'6px', color:'#fafafa', padding:'4px 8px', fontSize:'0.75rem', cursor:'pointer' }}>
                              <option value="" disabled>Update</option>
                              {['picked_up','in_transit','out_for_delivery','delivered'].map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
