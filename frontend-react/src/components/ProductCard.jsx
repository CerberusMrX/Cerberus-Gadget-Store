/**
 * CERBERUS GADGET STORE - Product Card Component
 */
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user, isRole } = useAuth();
  const p = product;

  const name       = p.NAME       || p.name;
  const price      = p.PRICE      || p.price;
  const finalPrice = p.FINAL_PRICE|| p.final_price || price;
  const discountPct= p.DISCOUNT_PCT|| p.discount_pct || 0;
  const imageUrl   = p.IMAGE_URL  || p.image_url;
  const brand      = p.BRAND      || p.brand;
  const ratingAvg  = p.RATING_AVG || p.rating_avg  || 0;
  const ratingCount= p.RATING_COUNT||p.rating_count || 0;
  const stock      = p.STOCK      || p.stock;
  const productId  = p.PRODUCT_ID || p.product_id;
  const category   = p.CATEGORY   || p.category;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !isRole('customer')) {
      toast.error('Please login as a customer to add to cart');
      return;
    }
    await addToCart(productId, 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !isRole('customer')) {
      toast.error('Please login to add to wishlist');
      return;
    }
    try {
      await api.post('/wishlist', { product_id: productId });
      toast.success('Added to wishlist!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    return '★'.repeat(full) + '☆'.repeat(5-full);
  };

  return (
    <Link to={`/products/${productId}`} style={{ textDecoration:'none' }}>
      <div className="product-card" style={{ position:'relative' }}>
        {/* Discount Badge */}
        {discountPct > 0 && (
          <div style={{
            position:'absolute', top:'12px', left:'12px', zIndex:2,
            background:'#dc2626', color:'white', borderRadius:'6px',
            padding:'3px 8px', fontSize:'11px', fontWeight:700
          }}>
            -{discountPct}%
          </div>
        )}

        {/* Wishlist Button */}
        <button onClick={handleWishlist} style={{
          position:'absolute', top:'12px', right:'12px', zIndex:2,
          background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:'8px', padding:'6px', cursor:'pointer', color:'#a1a1aa',
          display:'flex', alignItems:'center', transition:'all 0.2s'
        }}
          onMouseEnter={e=>{e.currentTarget.style.color='#f87171';e.currentTarget.style.borderColor='rgba(220,38,38,0.4)'}}
          onMouseLeave={e=>{e.currentTarget.style.color='#a1a1aa';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}}>
          <Heart size={14} />
        </button>

        {/* Image */}
        <div style={{ overflow:'hidden', height:'220px' }}>
          <img
            src={imageUrl || 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600'}
            alt={name}
            style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s ease' }}
            onError={e => e.target.src='https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600'}
          />
        </div>

        {/* Info */}
        <div style={{ padding:'1rem' }}>
          <div style={{ fontSize:'0.7rem', color:'#dc2626', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.25rem' }}>
            {brand} · {category}
          </div>
          <h3 style={{ fontSize:'0.9rem', fontWeight:600, color:'#fafafa', margin:'0 0 0.5rem', lineHeight:1.4,
            overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
            {name}
          </h3>

          {/* Rating */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.375rem', marginBottom:'0.75rem' }}>
            <span style={{ color:'#f59e0b', fontSize:'0.8rem' }}>{renderStars(ratingAvg)}</span>
            <span style={{ color:'#71717a', fontSize:'0.75rem' }}>({ratingCount})</span>
          </div>

          {/* Price */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <span style={{ fontSize:'1.125rem', fontWeight:700, color:'#fafafa' }}>
                Rs. ${Number(finalPrice).toFixed(2)}
              </span>
              {discountPct > 0 && (
                <span style={{ fontSize:'0.8rem', color:'#71717a', textDecoration:'line-through', marginLeft:'0.375rem' }}>
                  Rs. ${Number(price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <button onClick={handleAddToCart}
              disabled={stock === 0}
              style={{
                background: stock === 0 ? 'rgba(113,113,122,0.2)' : 'linear-gradient(135deg,#dc2626,#b91c1c)',
                color: stock === 0 ? '#71717a' : 'white',
                border:'none', borderRadius:'8px', padding:'0.5rem',
                cursor: stock === 0 ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', transition:'all 0.2s'
              }}
              title={stock === 0 ? 'Out of stock' : 'Add to cart'}>
              <ShoppingCart size={16} />
            </button>
          </div>

          {/* Stock */}
          {stock !== undefined && (
            <div style={{ marginTop:'0.5rem', fontSize:'0.7rem',
              color: stock === 0 ? '#f87171' : stock < 5 ? '#fbbf24' : '#4ade80' }}>
              {stock === 0 ? '● Out of stock' : stock < 5 ? `● Only ${stock} left` : '● In stock'}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
