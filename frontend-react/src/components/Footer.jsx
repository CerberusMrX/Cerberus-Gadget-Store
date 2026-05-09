/** Footer Component */
import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background:'#09090b', borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:'auto', paddingTop:'3rem', paddingBottom:'2rem' }}>
      <div className="page-container">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'2rem', marginBottom:'2rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'linear-gradient(135deg,#dc2626,#b91c1c)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Zap size={16} color="white" fill="white" />
              </div>
              <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:'1rem', color:'#fafafa' }}>Cerberus Gadget Store</span>
            </div>
            <p style={{ color:'#71717a', fontSize:'0.8125rem', lineHeight:1.6 }}>
              Your ultimate destination for premium tech gadgets. Curated products, unbeatable prices.
            </p>
          </div>
          {/* Links */}
          <div>
            <h4 style={{ color:'#fafafa', fontWeight:600, marginBottom:'0.75rem', fontSize:'0.875rem' }}>Shop</h4>
            {['Smartphones','Laptops','Smartwatches','Audio','Gaming','Cameras'].map(cat => (
              <Link key={cat} to={`/products?category=${cat}`} style={{ display:'block', color:'#71717a', textDecoration:'none', fontSize:'0.8125rem', marginBottom:'0.5rem', transition:'color 0.15s' }}
                onMouseEnter={e=>e.target.style.color='#dc2626'} onMouseLeave={e=>e.target.style.color='#71717a'}>
                {cat}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ color:'#fafafa', fontWeight:600, marginBottom:'0.75rem', fontSize:'0.875rem' }}>Account</h4>
            {[['Login','/login'],['Register','/register'],['My Orders','/orders'],['Wishlist','/wishlist']].map(([label,path]) => (
              <Link key={label} to={path} style={{ display:'block', color:'#71717a', textDecoration:'none', fontSize:'0.8125rem', marginBottom:'0.5rem', transition:'color 0.15s' }}
                onMouseEnter={e=>e.target.style.color='#dc2626'} onMouseLeave={e=>e.target.style.color='#71717a'}>
                {label}
              </Link>
            ))}
          </div>
          {/* Contact */}
          <div>
            <h4 style={{ color:'#fafafa', fontWeight:600, marginBottom:'0.75rem', fontSize:'0.875rem' }}>Contact</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
              {[
                [Mail, 'support@cerberusgadgets.com'],
                [Phone, '+94 71 123 4567'],
                [MapPin, 'Colombo 03, Sri Lanka']
              ].map(([Icon, text]) => (
                <div key={text} style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'#71717a', fontSize:'0.8125rem' }}>
                  <Icon size={14} color='#dc2626' />{text}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', marginBottom:'1.5rem' }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem' }}>
          <p style={{ color:'#52525b', fontSize:'0.8rem' }}>© 2026 Cerberus Gadget Store. All rights reserved.</p>
          <p style={{ color:'#52525b', fontSize:'0.8rem' }}>Built with React · Node.js · Oracle · MongoDB</p>
        </div>
      </div>
    </footer>
  );
}
