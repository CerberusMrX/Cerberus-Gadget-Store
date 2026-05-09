/**
 * CERBERUS GADGET STORE - Register Page
 * File: frontend-react/src/pages/RegisterPage.jsx
 */
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight, User, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultRole = params.get('role') || 'customer';

  const [form, setForm] = useState({
    email:'', password:'', confirm_password:'',
    first_name:'', last_name:'', phone:'',
    store_name:'', role: defaultRole
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({...form, [e.target.name]: e.target.value});

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await register(form);
      toast.success('Account created successfully!');
      if (data.role === 'seller') navigate('/dashboard/seller');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem',
      background:'radial-gradient(ellipse at top,rgba(220,38,38,0.1) 0%,transparent 60%), var(--bg-deep)' }}>
      <div style={{ width:'100%', maxWidth:'480px' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:'0.625rem', textDecoration:'none' }}>
            <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'linear-gradient(135deg,#dc2626,#b91c1c)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={22} color="white" fill="white" />
            </div>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.4rem', fontWeight:900, color:'#fafafa' }}>Cerberus</span>
          </Link>
        </div>

        <div className="glass-card" style={{ padding:'2rem' }}>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.5rem', fontWeight:800, color:'#fafafa', marginBottom:'0.25rem' }}>Create account</h2>
          <p style={{ color:'#71717a', fontSize:'0.875rem', marginBottom:'1.5rem' }}>Join the Cerberus community</p>

          {/* Role Toggle */}
          <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', background:'rgba(255,255,255,0.04)', padding:'4px', borderRadius:'10px' }}>
            {[['customer','Customer',User],['seller','Seller',ShoppingBag]].map(([val,label,Icon]) => (
              <button key={val} type="button" onClick={() => setForm({...form, role:val})}
                style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.375rem',
                  padding:'0.5rem', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, transition:'all 0.2s',
                  background: form.role===val ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'transparent',
                  color: form.role===val ? 'white' : '#71717a'
                }}>
                <Icon size={15}/>{label}
              </button>
            ))}
          </div>

          <form onSubmit={submit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.75rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:500, color:'#a1a1aa', marginBottom:'0.375rem' }}>First Name</label>
                <input type="text" name="first_name" value={form.first_name} onChange={handle} className="input-dark" placeholder="Alex" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:500, color:'#a1a1aa', marginBottom:'0.375rem' }}>Last Name</label>
                <input type="text" name="last_name" value={form.last_name} onChange={handle} className="input-dark" placeholder="Kumar" />
              </div>
            </div>

            {form.role === 'seller' && (
              <div style={{ marginBottom:'0.75rem' }}>
                <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:500, color:'#a1a1aa', marginBottom:'0.375rem' }}>Store Name *</label>
                <input type="text" name="store_name" value={form.store_name} onChange={handle} className="input-dark" placeholder="My Tech Store" required={form.role==='seller'} />
              </div>
            )}

            <div style={{ marginBottom:'0.75rem' }}>
              <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:500, color:'#a1a1aa', marginBottom:'0.375rem' }}>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handle} className="input-dark" placeholder="you@example.com" required />
            </div>
            <div style={{ marginBottom:'0.75rem' }}>
              <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:500, color:'#a1a1aa', marginBottom:'0.375rem' }}>Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handle} className="input-dark" placeholder="+94 71 123 4567" />
            </div>
            <div style={{ marginBottom:'0.75rem' }}>
              <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:500, color:'#a1a1aa', marginBottom:'0.375rem' }}>Password *</label>
              <div style={{ position:'relative' }}>
                <input type={showPw?'text':'password'} name="password" value={form.password} onChange={handle} className="input-dark" placeholder="Min. 6 characters" style={{ paddingRight:'2.75rem' }} required />
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#71717a' }}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:500, color:'#a1a1aa', marginBottom:'0.375rem' }}>Confirm Password *</label>
              <input type="password" name="confirm_password" value={form.confirm_password} onChange={handle} className="input-dark" placeholder="Re-enter password" required />
            </div>

            <button type="submit" className="btn-cerberus" style={{ width:'100%', justifyContent:'center', height:'44px', fontSize:'0.9375rem' }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width:'18px', height:'18px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block' }} /> : <><span>Create Account</span><ArrowRight size={16}/></>}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'#71717a' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#dc2626', textDecoration:'none', fontWeight:500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
