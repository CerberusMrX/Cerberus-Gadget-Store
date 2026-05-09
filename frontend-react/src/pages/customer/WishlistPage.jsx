/**
 * CERBERUS GADGET STORE - Wishlist Page
 * File: frontend-react/src/pages/customer/WishlistPage.jsx
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading]  = useState(true);
  const { addToCart } = useCart();

  const fetch = async () => {
    try { const r = await api.get('/wishlist'); setWishlist(r.data.data || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { document.title='Wishlist — Cerberus'; fetch(); }, []);

  const remove = async (productId) => {
    await api.delete(`/wishlist/${productId}`);
    toast.success('Removed from wishlist');
    fetch();
  };

  const moveToCart = async (productId) => {
    await addToCart(productId, 1);
    await remove(productId);
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><div className="spinner" style={{ width:'40px', height:'40px', border:'3px solid rgba(220,38,38,0.2)', borderTopColor:'#dc2626', borderRadius:'50%' }} /></div>;

  return (
    <div style={{ padding:'2rem 0 4rem' }}>
      <div className="page-container">
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.75rem', fontWeight:800, color:'#fafafa', marginBottom:'2rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <Heart size={24} color="#dc2626" fill="#dc2626" /> My Wishlist ({wishlist.length})
        </h1>

        {wishlist.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'#71717a' }}>
            <Heart size={56} color="#27272a" style={{ marginBottom:'1rem' }} />
            <h3 style={{ color:'#a1a1aa', marginBottom:'0.5rem' }}>Your wishlist is empty</h3>
            <Link to="/products" className="btn-cerberus" style={{ display:'inline-flex', marginTop:'1rem' }}>Discover Products</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1.25rem' }}>
            {wishlist.map(item => {
              const pid   = item.PRODUCT_ID||item.product_id;
              const name  = item.NAME ||item.name;
              const price = item.PRICE||item.price;
              const img   = item.IMAGE_URL||item.image_url;
              const brand = item.BRAND||item.brand;
              const stock = item.STOCK||item.stock;
              const rating= item.RATING_AVG||item.rating_avg||0;
              return (
                <div key={item.WISHLIST_ID||item.wishlist_id} style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden', transition:'all 0.25s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(220,38,38,0.25)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                  <Link to={`/products/${pid}`} style={{ textDecoration:'none' }}>
                    <img src={img||'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400'} alt={name}
                      style={{ width:'100%', height:'200px', objectFit:'cover' }}
                      onError={e=>e.target.src='https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400'} />
                  </Link>
                  <div style={{ padding:'1rem' }}>
                    <div style={{ fontSize:'0.7rem', color:'#dc2626', fontWeight:600, textTransform:'uppercase', marginBottom:'0.25rem' }}>{brand}</div>
                    <Link to={`/products/${pid}`} style={{ textDecoration:'none' }}>
                      <h3 style={{ fontSize:'0.9rem', fontWeight:600, color:'#fafafa', marginBottom:'0.5rem', lineHeight:1.4, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{name}</h3>
                    </Link>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.375rem', marginBottom:'0.75rem' }}>
                      <span style={{ color:'#f59e0b', fontSize:'0.8rem' }}>{[...Array(Math.floor(rating))].map((_,i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}</span>
                    </div>
                    <div style={{ fontSize:'1.125rem', fontWeight:700, color:'#fafafa', marginBottom:'0.875rem' }}>Rs. ${Number(price||0).toFixed(2)}</div>
                    <div style={{ display:'flex', gap:'0.5rem' }}>
                      <button onClick={()=>moveToCart(pid)} disabled={!stock||stock===0}
                        className="btn-cerberus" style={{ flex:1, justifyContent:'center', padding:'0.5rem', fontSize:'0.8rem', opacity:!stock||stock===0?0.5:1 }}>
                        <ShoppingCart size={14}/> Add to Cart
                      </button>
                      <button onClick={()=>remove(pid)} style={{ padding:'0.5rem', background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.2)', borderRadius:'8px', cursor:'pointer', color:'#f87171' }}>
                        <Trash2 size={14}/>
                      </button>
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
