/**
 * CERBERUS GADGET STORE - Cart Page
 * File: frontend-react/src/pages/CartPage.jsx
 */
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, updateItem, removeItem, loading } = useCart();
  const navigate = useNavigate();
  const items = cart.items || [];

  const handleQty = (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) removeItem(itemId);
    else updateItem(itemId, newQty);
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <div className="spinner" style={{ width:'40px', height:'40px', border:'3px solid rgba(220,38,38,0.2)', borderTopColor:'#dc2626', borderRadius:'50%' }} />
    </div>
  );

  if (items.length === 0) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', padding:'2rem', textAlign:'center' }}>
      <ShoppingCart size={64} color="#27272a" strokeWidth={1.5} style={{ marginBottom:'1.5rem' }} />
      <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.5rem', fontWeight:800, color:'#fafafa', marginBottom:'0.5rem' }}>Your cart is empty</h2>
      <p style={{ color:'#71717a', marginBottom:'1.5rem' }}>Discover amazing gadgets and add them to your cart</p>
      <Link to="/products" className="btn-cerberus">Browse Products <ArrowRight size={16}/></Link>
    </div>
  );

  const subtotal = cart.total || 0;
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax      = subtotal * 0.08;
  const total    = subtotal + shipping + tax;

  return (
    <div style={{ padding:'2rem 0 4rem' }}>
      <div className="page-container">
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'2rem' }}>
          <button onClick={()=>navigate(-1)} style={{ background:'none',border:'none',cursor:'pointer',color:'#71717a',display:'flex',alignItems:'center',gap:'0.25rem',padding:0 }}>
            <ArrowLeft size={16}/>
          </button>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.75rem', fontWeight:800, color:'#fafafa' }}>
            Shopping Cart <span style={{ color:'#71717a', fontSize:'1.25rem', fontWeight:600 }}>({items.length})</span>
          </h1>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'2rem', alignItems:'start' }}>
          {/* Items */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {items.map(item => {
              const id    = item.CART_ITEM_ID || item.cart_item_id;
              const qty   = item.QUANTITY  || item.quantity;
              const name  = item.NAME      || item.name;
              const img   = item.IMAGE_URL || item.image_url;
              const brand = item.BRAND     || item.brand;
              const price = item.UNIT_PRICE|| item.unit_price;
              const sub   = item.SUBTOTAL  || item.subtotal || (price * qty);
              const stock = item.STOCK     || item.stock;

              return (
                <div key={id} style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.25rem', display:'flex', gap:'1.25rem', alignItems:'center' }}>
                  <img src={img||'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=200'} alt={name}
                    style={{ width:'80px', height:'80px', borderRadius:'12px', objectFit:'cover', flexShrink:0 }}
                    onError={e=>e.target.src='https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=200'} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.75rem', color:'#dc2626', fontWeight:600, marginBottom:'0.25rem' }}>{brand}</div>
                    <div style={{ fontWeight:600, color:'#fafafa', marginBottom:'0.5rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</div>
                    <div style={{ fontSize:'0.875rem', color:'#a1a1aa' }}>Rs. ${Number(price).toFixed(2)} each</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <div style={{ display:'flex', alignItems:'center', background:'#27272a', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <button onClick={()=>handleQty(id,qty,-1)} style={{ width:'32px',height:'32px',background:'none',border:'none',cursor:'pointer',color:'#fafafa',display:'flex',alignItems:'center',justifyContent:'center' }}>
                        <Minus size={14}/>
                      </button>
                      <span style={{ minWidth:'28px',textAlign:'center',fontWeight:600,color:'#fafafa',fontSize:'0.875rem' }}>{qty}</span>
                      <button onClick={()=>handleQty(id,qty,1)} disabled={qty>=stock} style={{ width:'32px',height:'32px',background:'none',border:'none',cursor:'pointer',color:'#fafafa',display:'flex',alignItems:'center',justifyContent:'center', opacity:qty>=stock?0.4:1 }}>
                        <Plus size={14}/>
                      </button>
                    </div>
                  </div>
                  <div style={{ minWidth:'80px', textAlign:'right' }}>
                    <div style={{ fontWeight:700, color:'#fafafa', fontSize:'1rem' }}>Rs. ${Number(sub).toFixed(2)}</div>
                  </div>
                  <button onClick={()=>removeItem(id)} style={{ background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.2)',borderRadius:'8px',padding:'0.5rem',cursor:'pointer',color:'#f87171',transition:'all 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(220,38,38,0.2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(220,38,38,0.1)'}>
                    <Trash2 size={15}/>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.5rem', position:'sticky', top:'80px' }}>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, color:'#fafafa', marginBottom:'1.25rem', fontSize:'1.125rem' }}>Order Summary</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem', marginBottom:'1.25rem' }}>
              {[['Subtotal', `Rs. ${subtotal.toFixed(2)}`],['Shipping', shipping===0?'Free':`Rs. ${shipping.toFixed(2)}`],['Tax (8%)', `Rs. ${tax.toFixed(2)}`]].map(([label,val]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.875rem', color:'#a1a1aa' }}>
                  <span>{label}</span>
                  <span style={{ color:'#fafafa', fontWeight:500 }}>{val}</span>
                </div>
              ))}
              {shipping === 0 && <div style={{ fontSize:'0.75rem', color:'#4ade80', textAlign:'center', padding:'0.375rem', background:'rgba(34,197,94,0.1)', borderRadius:'6px' }}>🎉 You qualify for free shipping!</div>}
            </div>
            <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', marginBottom:'1.25rem' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:'1.125rem', color:'#fafafa', marginBottom:'1.25rem' }}>
              <span>Total</span>
              <span>Rs. ${total.toFixed(2)}</span>
            </div>
            <button onClick={()=>navigate('/checkout')} className="btn-cerberus" style={{ width:'100%', justifyContent:'center', height:'48px', fontSize:'1rem' }}>
              Proceed to Checkout <ArrowRight size={18}/>
            </button>
            <Link to="/products" style={{ display:'block', textAlign:'center', marginTop:'0.875rem', color:'#71717a', fontSize:'0.875rem', textDecoration:'none' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
