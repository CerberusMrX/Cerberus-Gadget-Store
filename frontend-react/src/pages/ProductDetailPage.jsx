/**
 * CERBERUS GADGET STORE - Product Detail Page
 * File: frontend-react/src/pages/ProductDetailPage.jsx
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ArrowLeft, Package, Truck, Shield, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isRole } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [review, setReview] = useState({ rating:5, title:'', body:'' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then(r => {
      setProduct(r.data.data);
      document.title = `Rs. ${r.data.data.NAME || r.data.data.name} — Cerberus`;
    }).catch(() => navigate('/products')).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user || !isRole('customer')) return toast.error('Login as a customer to shop');
    await addToCart(parseInt(id), qty);
  };

  const handleWishlist = async () => {
    if (!user || !isRole('customer')) return toast.error('Login to add to wishlist');
    try {
      await api.post('/wishlist', { product_id: parseInt(id) });
      toast.success('Added to wishlist!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user || !isRole('customer')) return toast.error('Login as customer to review');
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { product_id: parseInt(id), ...review });
      toast.success('Review submitted!');
      const r = await api.get(`/products/${id}`);
      setProduct(r.data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <div className="spinner" style={{ width:'44px', height:'44px', border:'3px solid rgba(220,38,38,0.2)', borderTopColor:'#dc2626', borderRadius:'50%' }} />
    </div>
  );

  if (!product) return null;

  const name      = product.NAME       || product.name;
  const price     = product.PRICE      || product.price;
  const finalPrice= product.FINAL_PRICE|| product.final_price || price;
  const discountPct=product.DISCOUNT_PCT||product.discount_pct||0;
  const imageUrl  = product.IMAGE_URL  || product.image_url;
  const brand     = product.BRAND      || product.brand;
  const model     = product.MODEL      || product.model;
  const desc      = product.DESCRIPTION|| product.description;
  const stock     = product.STOCK      || product.stock;
  const ratingAvg = product.RATING_AVG || product.rating_avg||0;
  const ratingCount=product.RATING_COUNT||product.rating_count||0;
  const category  = product.CATEGORY   || product.category;
  const sellerName= product.STORE_NAME || product.store_name;
  const reviews   = product.REVIEWS    || product.reviews || [];

  const renderStars = (r, interactive=false) => {
    return [1,2,3,4,5].map(n => (
      <span key={n} onClick={() => interactive && setReview(rv=>({...rv,rating:n}))}
        style={{ color: n<=r ? '#f59e0b' : '#3f3f46', fontSize:'1.25rem', cursor: interactive?'pointer':'default' }}>★</span>
    ));
  };

  return (
    <div style={{ padding:'2rem 0 4rem' }}>
      <div className="page-container">
        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.5rem', fontSize:'0.8125rem', color:'#71717a' }}>
          <button onClick={()=>navigate('/products')} style={{ background:'none',border:'none',cursor:'pointer',color:'#71717a',display:'flex',alignItems:'center',gap:'0.25rem',padding:0 }}>
            <ArrowLeft size={14}/> Products
          </button>
          <ChevronRight size={14}/>
          <span style={{ color:'#a1a1aa' }}>{category}</span>
          <ChevronRight size={14}/>
          <span style={{ color:'#fafafa', fontWeight:500 }}>{name}</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2.5rem', alignItems:'start' }}>
          {/* Image */}
          <div>
            <div style={{ borderRadius:'20px', overflow:'hidden', background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', aspectRatio:'1', maxHeight:'480px' }}>
              <img src={imageUrl || 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600'}
                alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e=>e.target.src='https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600'} />
            </div>
          </div>

          {/* Details */}
          <div>
            <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.75rem' }}>
              <span className="badge badge-blue">{category}</span>
              {discountPct > 0 && <span className="badge badge-red">-{discountPct}% OFF</span>}
              <span className={`badge ${stock > 5 ? 'badge-green' : stock > 0 ? 'badge-yellow' : 'badge-red'}`}>
                {stock === 0 ? 'Out of Stock' : stock <= 5 ? `Only ${stock} left` : 'In Stock'}
              </span>
            </div>

            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.75rem', fontWeight:800, color:'#fafafa', marginBottom:'0.5rem', lineHeight:1.3 }}>{name}</h1>

            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
              <span style={{ color:'#71717a', fontSize:'0.875rem' }}>{brand} · {model}</span>
              <div style={{ display:'flex', alignItems:'center', gap:'0.375rem' }}>
                <span style={{ color:'#f59e0b' }}>{[...Array(Math.floor(ratingAvg))].map((_,i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}</span>
                <span style={{ color:'#fafafa', fontWeight:600, fontSize:'0.875rem' }}>{Number(ratingAvg).toFixed(1)}</span>
                <span style={{ color:'#71717a', fontSize:'0.8125rem' }}>({ratingCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div style={{ marginBottom:'1.5rem' }}>
              <span style={{ fontSize:'2.25rem', fontWeight:800, color:'#fafafa' }}>Rs. ${Number(finalPrice).toFixed(2)}</span>
              {discountPct > 0 && <span style={{ fontSize:'1.1rem', color:'#71717a', textDecoration:'line-through', marginLeft:'0.75rem' }}>Rs. ${Number(price).toFixed(2)}</span>}
            </div>

            {/* Description */}
            <p style={{ color:'#a1a1aa', lineHeight:1.8, marginBottom:'1.5rem', fontSize:'0.9rem' }}>{desc}</p>

            {/* Sold by */}
            <div style={{ padding:'0.75rem 1rem', background:'rgba(255,255,255,0.03)', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.06)', marginBottom:'1.5rem', fontSize:'0.8125rem', color:'#a1a1aa' }}>
              Sold by <span style={{ color:'#fafafa', fontWeight:600 }}>{sellerName}</span>
            </div>

            {/* Quantity */}
            {stock > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
                <label style={{ fontSize:'0.8125rem', color:'#a1a1aa', fontWeight:500 }}>Qty:</label>
                <div style={{ display:'flex', alignItems:'center', background:'#27272a', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={()=>setQty(Math.max(1,qty-1))} style={{ width:'36px',height:'36px',background:'none',border:'none',cursor:'pointer',color:'#fafafa',fontSize:'1.125rem' }}>-</button>
                  <span style={{ minWidth:'32px',textAlign:'center',fontWeight:600,color:'#fafafa' }}>{qty}</span>
                  <button onClick={()=>setQty(Math.min(stock,qty+1))} style={{ width:'36px',height:'36px',background:'none',border:'none',cursor:'pointer',color:'#fafafa',fontSize:'1.125rem' }}>+</button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem' }}>
              <button onClick={handleAddToCart} className="btn-cerberus" disabled={stock===0} style={{ flex:1, justifyContent:'center', height:'48px', fontSize:'1rem', opacity:stock===0?0.5:1 }}>
                <ShoppingCart size={18}/> {stock===0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button onClick={handleWishlist} className="btn-outline" style={{ padding:'0 1rem', height:'48px' }}>
                <Heart size={18}/>
              </button>
            </div>

            {/* Perks */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              {[[Truck,'Free Delivery','Orders above Rs. 15,000'],[Shield,'2 Year Warranty','All products covered'],[Package,'Easy Returns','30-day return policy']].map(([Icon,t,s]) => (
                <div key={t} style={{ display:'flex', gap:'0.625rem', alignItems:'flex-start', padding:'0.75rem', background:'rgba(255,255,255,0.02)', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.05)' }}>
                  <Icon size={16} color='#dc2626' style={{ flexShrink:0, marginTop:'2px' }} />
                  <div><div style={{ fontWeight:600, fontSize:'0.8rem', color:'#fafafa' }}>{t}</div><div style={{ fontSize:'0.75rem', color:'#71717a' }}>{s}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop:'3rem' }}>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.375rem', fontWeight:800, color:'#fafafa', marginBottom:'1.5rem' }}>
            Customer Reviews ({ratingCount})
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'2rem', alignItems:'start' }}>
            {/* Reviews list */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {reviews.length === 0 ? (
                <div style={{ padding:'2rem', textAlign:'center', color:'#71717a', background:'#18181b', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)' }}>
                  No reviews yet. Be the first to review!
                </div>
              ) : reviews.map(r => (
                <div key={r.REVIEW_ID||r.review_id} style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'1.25rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                    <div>
                      <div style={{ fontWeight:600, color:'#fafafa', fontSize:'0.875rem' }}>{r.REVIEWER_NAME||r.reviewer_name}</div>
                      <div style={{ display:'flex', gap:'2px', marginTop:'2px' }}>{renderStars(r.RATING||r.rating)}</div>
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'#71717a' }}>{new Date(r.CREATED_AT||r.created_at).toLocaleDateString()}</div>
                  </div>
                  {(r.TITLE||r.title) && <div style={{ fontWeight:600, color:'#fafafa', fontSize:'0.875rem', marginBottom:'0.375rem' }}>{r.TITLE||r.title}</div>}
                  <p style={{ color:'#a1a1aa', fontSize:'0.875rem', lineHeight:1.7 }}>{r.BODY||r.body}</p>
                </div>
              ))}
            </div>

            {/* Write Review */}
            {user && isRole('customer') && (
              <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.5rem', position:'sticky', top:'80px' }}>
                <h3 style={{ fontWeight:700, color:'#fafafa', marginBottom:'1rem' }}>Write a Review</h3>
                <form onSubmit={handleReview}>
                  <div style={{ marginBottom:'0.75rem' }}>
                    <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Rating</label>
                    <div style={{ display:'flex', gap:'2px' }}>{renderStars(review.rating, true)}</div>
                  </div>
                  <div style={{ marginBottom:'0.75rem' }}>
                    <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Title</label>
                    <input type="text" className="input-dark" placeholder="Summary..." value={review.title} onChange={e=>setReview(r=>({...r,title:e.target.value}))} />
                  </div>
                  <div style={{ marginBottom:'1rem' }}>
                    <label style={{ display:'block', fontSize:'0.8rem', color:'#a1a1aa', marginBottom:'0.375rem' }}>Review</label>
                    <textarea className="input-dark" rows={4} placeholder="Your experience..." value={review.body} onChange={e=>setReview(r=>({...r,body:e.target.value}))} style={{ resize:'vertical' }} />
                  </div>
                  <button type="submit" className="btn-cerberus" style={{ width:'100%', justifyContent:'center' }} disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
