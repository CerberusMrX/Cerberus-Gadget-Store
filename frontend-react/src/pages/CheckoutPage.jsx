/**
 * CERBERUS GADGET STORE - Checkout Page
 * File: frontend-react/src/pages/CheckoutPage.jsx
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const items = cart.items || [];

  const [step, setStep]   = useState(1); // 1=shipping, 2=payment, 3=success
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);

  const [shipping, setShipping] = useState({
    address: user?.ADDRESS || '', city: user?.CITY || 'Colombo', notes: ''
  });
  const [payment, setPayment] = useState({
    method:'card', card_number:'', card_holder:'', expiry:'', cvv:''
  });

  const subtotal = cart.total || 0;
  const shipFee  = subtotal >= 50 ? 0 : 9.99;
  const tax      = subtotal * 0.08;
  const total    = subtotal + shipFee + tax;

  const placeOrder = async () => {
    if (!shipping.address) return toast.error('Shipping address required');
    setLoading(true);
    try {
      const res = await api.post('/orders', {
        shipping_address: shipping.address,
        shipping_city:    shipping.city,
        notes:            shipping.notes
      });
      setOrderId(res.data.data.order_id);
      setOrderTotal(res.data.data.total);
      setStep(2);
    } catch (err) { toast.error(err.response?.data?.message || 'Order failed'); }
    finally { setLoading(false); }
  };

  const processPayment = async () => {
    if (payment.method === 'card' && (!payment.card_number || !payment.card_holder)) {
      return toast.error('Fill in card details');
    }
    setLoading(true);
    try {
      await api.post('/payments', {
        order_id: orderId,
        amount:   orderTotal || total,
        method:   payment.method,
        card_holder: payment.card_holder
      });
      await fetchCart();
      setStep(3);
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed. Try another method.'); }
    finally { setLoading(false); }
  };

  if (step === 3) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', padding:'2rem', textAlign:'center' }}>
      <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'rgba(34,197,94,0.15)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.5rem' }}>
        <CheckCircle size={44} color="#4ade80" />
      </div>
      <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'2rem', fontWeight:900, color:'#fafafa', marginBottom:'0.5rem' }}>Order Confirmed!</h2>
      <p style={{ color:'#a1a1aa', marginBottom:'0.5rem' }}>Order #{orderId} has been placed successfully.</p>
      <p style={{ color:'#71717a', fontSize:'0.875rem', marginBottom:'2rem' }}>You'll receive tracking updates via your dashboard.</p>
      <div style={{ display:'flex', gap:'1rem' }}>
        <button onClick={()=>navigate('/orders')} className="btn-cerberus">View My Orders</button>
        <button onClick={()=>navigate('/products')} className="btn-outline">Continue Shopping</button>
      </div>
    </div>
  );

  return (
    <div style={{ padding:'2rem 0 4rem' }}>
      <div className="page-container" style={{ maxWidth:'900px' }}>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.75rem', fontWeight:800, color:'#fafafa', marginBottom:'1.5rem' }}>Checkout</h1>

        {/* Steps indicator */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'2rem' }}>
          {[['1','Shipping'],['2','Payment']].map(([s,label]) => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:'0.5rem', flex:1 }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700, flexShrink:0,
                background: parseInt(s) <= step ? '#dc2626' : 'transparent',
                border: `2px solid ${parseInt(s) <= step ? '#dc2626' : '#3f3f46'}`,
                color: parseInt(s) <= step ? 'white' : '#71717a' }}>{s}</div>
              <span style={{ fontSize:'0.875rem', fontWeight:500, color: parseInt(s) <= step ? '#fafafa' : '#71717a' }}>{label}</span>
              {s === '1' && <div style={{ flex:1, height:'1px', background: step > 1 ? '#dc2626' : 'rgba(255,255,255,0.1)' }} />}
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'2rem' }}>
          <div>
            {/* STEP 1 — SHIPPING */}
            {step === 1 && (
              <div className="glass-card" style={{ padding:'1.5rem' }}>
                <h2 style={{ fontWeight:700, color:'#fafafa', marginBottom:'1.25rem', fontSize:'1.125rem' }}>Shipping Information</h2>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                  <div>
                    <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Delivery Address *</label>
                    <input className="input-dark" value={shipping.address} onChange={e=>setShipping(s=>({...s,address:e.target.value}))} placeholder="Street address, apartment, etc." />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>City</label>
                    <input className="input-dark" value={shipping.city} onChange={e=>setShipping(s=>({...s,city:e.target.value}))} placeholder="Colombo" />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Order Notes (optional)</label>
                    <textarea className="input-dark" rows={3} value={shipping.notes} onChange={e=>setShipping(s=>({...s,notes:e.target.value}))} placeholder="Leave at door, ring bell, etc." style={{ resize:'vertical' }} />
                  </div>
                </div>
                <button onClick={placeOrder} className="btn-cerberus" style={{ marginTop:'1.5rem', width:'100%', justifyContent:'center', height:'46px' }} disabled={loading}>
                  {loading ? <Loader size={18} className="spinner" /> : 'Continue to Payment'}
                </button>
              </div>
            )}

            {/* STEP 2 — PAYMENT */}
            {step === 2 && (
              <div className="glass-card" style={{ padding:'1.5rem' }}>
                <h2 style={{ fontWeight:700, color:'#fafafa', marginBottom:'1.25rem', fontSize:'1.125rem' }}>Payment Method</h2>
                <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.25rem' }}>
                  {[['card','💳 Card'],['paypal','🅿️ PayPal'],['cod','🏠 Cash on Delivery']].map(([val,label]) => (
                    <button key={val} onClick={()=>setPayment(p=>({...p,method:val}))}
                      style={{ flex:1, padding:'0.625rem', borderRadius:'10px', border:'1px solid', cursor:'pointer', fontWeight:600, fontSize:'0.8rem', transition:'all 0.2s',
                        borderColor: payment.method===val ? '#dc2626' : 'rgba(255,255,255,0.1)',
                        background:  payment.method===val ? 'rgba(220,38,38,0.12)' : 'transparent',
                        color:       payment.method===val ? '#f87171' : '#a1a1aa' }}>
                      {label}
                    </button>
                  ))}
                </div>
                {payment.method === 'card' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                    <div>
                      <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Card Number</label>
                      <input className="input-dark" value={payment.card_number} onChange={e=>setPayment(p=>({...p,card_number:e.target.value}))} placeholder="4242 4242 4242 4242" maxLength={19} />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Cardholder Name</label>
                      <input className="input-dark" value={payment.card_holder} onChange={e=>setPayment(p=>({...p,card_holder:e.target.value}))} placeholder="Alex Kumar" />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                      <div>
                        <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Expiry</label>
                        <input className="input-dark" value={payment.expiry} onChange={e=>setPayment(p=>({...p,expiry:e.target.value}))} placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>CVV</label>
                        <input className="input-dark" type="password" value={payment.cvv} onChange={e=>setPayment(p=>({...p,cvv:e.target.value}))} placeholder="•••" maxLength={4} />
                      </div>
                    </div>
                  </div>
                )}
                {payment.method === 'paypal' && (
                  <div style={{ padding:'1.5rem', textAlign:'center', color:'#a1a1aa', background:'rgba(255,255,255,0.03)', borderRadius:'10px' }}>
                    You will be redirected to PayPal to complete payment.
                  </div>
                )}
                {payment.method === 'cod' && (
                  <div style={{ padding:'1.5rem', textAlign:'center', color:'#a1a1aa', background:'rgba(255,255,255,0.03)', borderRadius:'10px' }}>
                    Pay in cash when your order is delivered. Additional $2 COD fee applies.
                  </div>
                )}
                <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
                  <button onClick={()=>setStep(1)} className="btn-outline" style={{ flex:1, justifyContent:'center', height:'46px' }}>Back</button>
                  <button onClick={processPayment} className="btn-cerberus" style={{ flex:2, justifyContent:'center', height:'46px' }} disabled={loading}>
                    {loading ? <Loader size={18} className="spinner" /> : <><CreditCard size={16}/> Pay Rs. ${total.toFixed(2)}</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.25rem', position:'sticky', top:'80px' }}>
            <h3 style={{ fontWeight:700, color:'#fafafa', marginBottom:'1rem', fontSize:'0.9375rem' }}>Order Summary</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1rem' }}>
              {items.map(item => (
                <div key={item.CART_ITEM_ID||item.cart_item_id} style={{ display:'flex', gap:'0.625rem', alignItems:'center' }}>
                  <img src={item.IMAGE_URL||item.image_url||'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100'} style={{ width:'40px', height:'40px', objectFit:'cover', borderRadius:'8px', flexShrink:0 }} onError={e=>e.target.src='https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100'} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.8rem', color:'#fafafa', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.NAME||item.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'#71717a' }}>×{item.QUANTITY||item.quantity}</div>
                  </div>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#fafafa' }}>Rs. ${Number(item.SUBTOTAL||item.subtotal||0).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', marginBottom:'0.875rem' }} />
            {[['Subtotal',`Rs. ${subtotal.toFixed(2)}`],['Shipping',shipFee===0?'Free':`Rs. ${shipFee.toFixed(2)}`],['Tax',`Rs. ${tax.toFixed(2)}`]].map(([l,v])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8125rem', color:'#71717a', marginBottom:'0.5rem' }}>
                <span>{l}</span><span style={{ color:'#a1a1aa' }}>{v}</span>
              </div>
            ))}
            <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', margin:'0.875rem 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, color:'#fafafa', fontSize:'1.0625rem' }}>
              <span>Total</span><span>Rs. ${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
