/**
 * CERBERUS GADGET STORE - Navbar Component
 * File: frontend-react/src/components/Navbar.jsx
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Zap, Heart, Package, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isRole } = useAuth();
  const { cartCount }            = useCart();
  const navigate                 = useNavigate();
  const [menuOpen, setMenuOpen]  = useState(false);
  const [searchQuery, setSearchQ] = useState('');
  const [dropOpen, setDropOpen]  = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQ('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setDropOpen(false);
  };

  const dashboardPath = isRole('admin') ? '/dashboard/admin'
    : isRole('seller') ? '/dashboard/seller'
    : '/dashboard/customer';

  return (
    <nav style={{
      background: 'rgba(9,9,11,0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%'
    }}>
      <div className="page-container" style={{ display:'flex', alignItems:'center', gap:'1rem', height:'64px' }}>
        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none', flexShrink:0 }}>
          <div style={{
            width:'36px', height:'36px', borderRadius:'10px',
            background:'linear-gradient(135deg,#dc2626,#b91c1c)',
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:'1.15rem', color:'#fafafa', letterSpacing:'-0.02em' }}>
            Cerberus<span style={{ color:'#dc2626' }}>.</span>
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ flex:1, maxWidth:'480px', display:'flex', gap:'0' }}>
          <div style={{ position:'relative', flex:1 }}>
            <Search size={16} style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'#71717a' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search gadgets, brands..."
              className="input-dark"
              style={{ paddingLeft:'2.5rem', borderRadius:'10px 0 0 10px', borderRight:'none' }}
            />
          </div>
          <button type="submit" className="btn-cerberus" style={{ borderRadius:'0 10px 10px 0', padding:'0 1rem' }}>
            Search
          </button>
        </form>

        {/* Nav Links */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.25rem', marginLeft:'auto' }}>
          <Link to="/products" style={{ color:'#a1a1aa', textDecoration:'none', padding:'0.5rem 0.75rem', borderRadius:'8px', fontSize:'0.875rem', fontWeight:500, transition:'all 0.2s' }}
            onMouseEnter={e=>e.target.style.color='#fafafa'} onMouseLeave={e=>e.target.style.color='#a1a1aa'}>
            Products
          </Link>

          {user && isRole('customer') && (
            <>
              <Link to="/cart" style={{ position:'relative', color:'#a1a1aa', textDecoration:'none', padding:'0.5rem', borderRadius:'8px', display:'flex', alignItems:'center', transition:'all 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#fafafa'} onMouseLeave={e=>e.currentTarget.style.color='#a1a1aa'}>
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span style={{
                    position:'absolute', top:'2px', right:'2px',
                    background:'#dc2626', color:'white', borderRadius:'50%',
                    width:'16px', height:'16px', fontSize:'10px', fontWeight:700,
                    display:'flex', alignItems:'center', justifyContent:'center'
                  }}>{cartCount > 9 ? '9+' : cartCount}</span>
                )}
              </Link>
              <Link to="/wishlist" style={{ color:'#a1a1aa', textDecoration:'none', padding:'0.5rem', borderRadius:'8px', display:'flex', alignItems:'center' }}
                onMouseEnter={e=>e.currentTarget.style.color='#fafafa'} onMouseLeave={e=>e.currentTarget.style.color='#a1a1aa'}>
                <Heart size={20} />
              </Link>
            </>
          )}

          {/* User Menu */}
          {user ? (
            <div style={{ position:'relative' }}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                style={{
                  display:'flex', alignItems:'center', gap:'0.5rem',
                  background:'rgba(39,39,42,0.8)', border:'1px solid rgba(255,255,255,0.08)',
                  borderRadius:'10px', padding:'0.4rem 0.75rem', cursor:'pointer', color:'#fafafa'
                }}
              >
                <div style={{
                  width:'26px', height:'26px', borderRadius:'50%',
                  background:'linear-gradient(135deg,#dc2626,#b91c1c)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'11px', fontWeight:700, color:'white'
                }}>
                  {(user.display_name || user.DISPLAY_NAME || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize:'0.8125rem', fontWeight:500, maxWidth:'90px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user.display_name || user.DISPLAY_NAME || user.email?.split('@')[0]}
                </span>
              </button>
              {dropOpen && (
                <div style={{
                  position:'absolute', right:0, top:'calc(100% + 8px)', minWidth:'200px',
                  background:'#18181b', border:'1px solid rgba(255,255,255,0.08)',
                  borderRadius:'12px', padding:'0.5rem', zIndex:200,
                  boxShadow:'0 20px 40px rgba(0,0,0,0.5)'
                }}>
                  <Link to={dashboardPath} onClick={()=>setDropOpen(false)} style={{ display:'flex', alignItems:'center', gap:'0.625rem', padding:'0.625rem 0.75rem', borderRadius:'8px', color:'#a1a1aa', textDecoration:'none', fontSize:'0.875rem', transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='#fafafa'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#a1a1aa'}}>
                    <LayoutDashboard size={15} /><span>Dashboard</span>
                  </Link>
                  {isRole('customer') && (
                    <>
                      <Link to="/orders" onClick={()=>setDropOpen(false)} style={{ display:'flex', alignItems:'center', gap:'0.625rem', padding:'0.625rem 0.75rem', borderRadius:'8px', color:'#a1a1aa', textDecoration:'none', fontSize:'0.875rem', transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='#fafafa'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#a1a1aa'}}>
                        <Package size={15} /><span>My Orders</span>
                      </Link>
                      <Link to="/wishlist" onClick={()=>setDropOpen(false)} style={{ display:'flex', alignItems:'center', gap:'0.625rem', padding:'0.625rem 0.75rem', borderRadius:'8px', color:'#a1a1aa', textDecoration:'none', fontSize:'0.875rem', transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='#fafafa'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#a1a1aa'}}>
                        <Heart size={15} /><span>Wishlist</span>
                      </Link>
                    </>
                  )}
                  <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', margin:'0.375rem 0' }} />
                  <button onClick={handleLogout} style={{ display:'flex', width:'100%', alignItems:'center', gap:'0.625rem', padding:'0.625rem 0.75rem', borderRadius:'8px', color:'#f87171', background:'transparent', border:'none', cursor:'pointer', fontSize:'0.875rem', transition:'all 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(220,38,38,0.1)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <LogOut size={15} /><span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <Link to="/login"    className="btn-outline" style={{ padding:'0.5rem 1rem' }}>Login</Link>
              <Link to="/register" className="btn-cerberus" style={{ padding:'0.5rem 1rem' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
