/**
 * CERBERUS GADGET STORE - Home Page
 * File: frontend-react/src/pages/HomePage.jsx
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, Headphones, Star, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { name:'Smartphones', image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', color:'#3b82f6' },
  { name:'Laptops',     image:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', color:'#8b5cf6' },
  { name:'Smartwatches',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', color:'#10b981' },
  { name:'Audio',       image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', color:'#f59e0b' },
  { name:'Gaming',      image:'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', color:'#ef4444' },
  { name:'Cameras',     image:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', color:'#06b6d4' },
];

export default function HomePage() {
  const [featured, setFeatured]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Cerberus Gadget Store — Premium Tech Marketplace';
    api.get('/products/featured').then(r => setFeatured(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) navigate(`/products?search=${encodeURIComponent(heroSearch.trim())}`);
  };

  return (
    <div>
      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="hero-gradient" style={{ paddingTop:'5rem', paddingBottom:'5rem' }}>
        <div className="page-container" style={{ textAlign:'center' }}>
          <div className="fade-in">
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem',
              background:'rgba(220,38,38,0.12)', border:'1px solid rgba(220,38,38,0.25)',
              borderRadius:'50px', padding:'0.4rem 1rem', marginBottom:'1.5rem', fontSize:'0.8rem', color:'#f87171', fontWeight:500 }}>
              <Zap size={12} fill="#f87171" />
              New Arrivals — iPhone 16 Pro & Galaxy S25 Ultra
            </div>
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'clamp(2.5rem,6vw,4.5rem)', fontWeight:900,
              lineHeight:1.05, color:'#fafafa', marginBottom:'1.25rem', letterSpacing:'-0.03em' }}>
              The Smartest Way to<br/>
              <span className="gradient-text">Shop Tech Gadgets</span>
            </h1>
            <p style={{ fontSize:'1.125rem', color:'#a1a1aa', maxWidth:'540px', margin:'0 auto 2.5rem', lineHeight:1.7 }}>
              Discover curated premium gadgets from top brands. Smartphones, laptops, wearables and more — all in one place.
            </p>

            {/* Hero Search */}
            <form onSubmit={handleHeroSearch} style={{ display:'flex', maxWidth:'520px', margin:'0 auto 2rem', gap:'0.5rem' }}>
              <input
                type="text"
                value={heroSearch}
                onChange={e => setHeroSearch(e.target.value)}
                placeholder="Search for iPhone, MacBook, AirPods..."
                className="input-dark"
                style={{ flex:1, height:'52px', fontSize:'1rem' }}
              />
              <button type="submit" className="btn-cerberus" style={{ height:'52px', paddingLeft:'1.5rem', paddingRight:'1.5rem', fontSize:'0.9rem' }}>
                Search <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/products" className="btn-cerberus">Shop All Products <ArrowRight size={16} /></Link>
              <Link to="/register" className="btn-outline">Sell on Cerberus</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section style={{ padding:'3rem 0', borderTop:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
        <div className="page-container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1.5rem' }}>
            {[
              [Zap,'Lightning Fast','Orders processed in seconds'],
              [Shield,'Secure Shopping','Bank-grade encryption'],
              [Truck,'Fast Delivery','Cerberus Logistics 3–5 days'],
              [Headphones,'24/7 Support','Always here to help'],
            ].map(([Icon,title,desc]) => (
              <div key={title} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1.25rem', background:'rgba(24,24,27,0.5)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'rgba(220,38,38,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={20} color="#dc2626" />
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:'0.875rem', color:'#fafafa', marginBottom:'0.2rem' }}>{title}</div>
                  <div style={{ fontSize:'0.75rem', color:'#71717a' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section style={{ padding:'4rem 0' }}>
        <div className="page-container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.75rem', fontWeight:800, color:'#fafafa' }}>Browse Categories</h2>
            <Link to="/products" style={{ display:'flex', alignItems:'center', gap:'0.25rem', color:'#dc2626', textDecoration:'none', fontSize:'0.875rem', fontWeight:500 }}>
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'1rem' }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/products?category=${cat.name}`} style={{ textDecoration:'none' }}>
                <div style={{
                  background:'#18181b', border:'1px solid rgba(255,255,255,0.06)',
                  borderRadius:'14px', padding:'1.5rem 1rem', textAlign:'center',
                  cursor:'pointer', transition:'all 0.25s',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=cat.color+'44';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.background='rgba(24,24,27,0.9)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.06)';e.currentTarget.style.transform='none';e.currentTarget.style.background='#18181b';}}>
                  <div style={{ height:'100px', marginBottom:'1rem', borderRadius:'8px', overflow:'hidden' }}>
                    <img src={cat.image} alt={cat.name} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.8)' }} />
                  </div>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#fafafa' }}>{cat.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────── */}
      <section style={{ padding:'0 0 5rem' }}>
        <div className="page-container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
            <div>
              <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.75rem', fontWeight:800, color:'#fafafa', marginBottom:'0.25rem' }}>Top Rated Gadgets</h2>
              <p style={{ color:'#71717a', fontSize:'0.875rem' }}>Handpicked by our team for quality and performance</p>
            </div>
            <Link to="/products" style={{ display:'flex', alignItems:'center', gap:'0.25rem', color:'#dc2626', textDecoration:'none', fontSize:'0.875rem', fontWeight:500 }}>
              See all <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1.25rem' }}>
              {[...Array(8)].map((_,i) => (
                <div key={i} style={{ borderRadius:'16px', overflow:'hidden' }}>
                  <div className="skeleton" style={{ height:'220px', borderRadius:'0' }} />
                  <div style={{ padding:'1rem', background:'#18181b' }}>
                    <div className="skeleton" style={{ height:'12px', marginBottom:'8px', width:'60%' }} />
                    <div className="skeleton" style={{ height:'14px', marginBottom:'8px', width:'90%' }} />
                    <div className="skeleton" style={{ height:'14px', width:'70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1.25rem' }}>
              {featured.map(product => <ProductCard key={product.PRODUCT_ID || product.product_id} product={product} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section style={{ padding:'4rem 0', background:'linear-gradient(135deg,rgba(220,38,38,0.12),rgba(245,158,11,0.05))', borderTop:'1px solid rgba(220,38,38,0.15)' }}>
        <div className="page-container" style={{ textAlign:'center' }}>
          <Star size={32} color="#f59e0b" fill="#f59e0b" style={{ marginBottom:'1rem' }} />
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'2rem', fontWeight:800, color:'#fafafa', marginBottom:'0.75rem' }}>
            Want to sell your gadgets?
          </h2>
          <p style={{ color:'#a1a1aa', marginBottom:'1.5rem', maxWidth:'400px', margin:'0 auto 1.5rem' }}>
            Join thousands of sellers on Cerberus and reach thousands of tech enthusiasts.
          </p>
          <Link to="/register?role=seller" className="btn-cerberus" style={{ fontSize:'1rem', padding:'0.75rem 2rem' }}>
            Become a Seller <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
