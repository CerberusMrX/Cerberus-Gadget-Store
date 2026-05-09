/**
 * CERBERUS GADGET STORE - Login Page
 * File: frontend-react/src/pages/LoginPage.jsx
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from || '/';

  const [form, setForm]     = useState({ email:'', password:'' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({...form, [e.target.name]: e.target.value});

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      const role = data.role || data.ROLE;
      toast.success(`Welcome back!`);
      if (role === 'admin')  navigate('/dashboard/admin');
      else if (role === 'seller') navigate('/dashboard/seller');
      else navigate(from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  // Quick login buttons for demo
  const quickLogin = async (email, password) => {
    setForm({ email, password });
    setLoading(true);
    try {
      const data = await login(email, password);
      const role = data.role || data.ROLE;
      toast.success('Logged in!');
      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'seller') navigate('/dashboard/seller');
      else navigate('/');
    } catch {
      toast.error('Quick login failed — run the sample data first');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem',
      background:'radial-gradient(ellipse at top,rgba(220,38,38,0.1) 0%,transparent 60%), var(--bg-deep)' }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:'0.625rem', textDecoration:'none' }}>
            <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'linear-gradient(135deg,#dc2626,#b91c1c)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={22} color="white" fill="white" />
            </div>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.4rem', fontWeight:900, color:'#fafafa' }}>Cerberus</span>
          </Link>
        </div>

        <div className="glass-card" style={{ padding:'2rem' }}>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.5rem', fontWeight:800, color:'#fafafa', marginBottom:'0.25rem' }}>Welcome back</h2>
          <p style={{ color:'#71717a', fontSize:'0.875rem', marginBottom:'1.5rem' }}>Sign in to your account</p>

          <form onSubmit={submit}>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:500, color:'#a1a1aa', marginBottom:'0.375rem' }}>Email</label>
              <input type="email" name="email" value={form.email} onChange={handle} className="input-dark" placeholder="you@example.com" required />
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:500, color:'#a1a1aa', marginBottom:'0.375rem' }}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPw?'text':'password'} name="password" value={form.password} onChange={handle} className="input-dark" placeholder="••••••••" style={{ paddingRight:'2.75rem' }} required />
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#71717a' }}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-cerberus" style={{ width:'100%', justifyContent:'center', height:'44px', fontSize:'0.9375rem' }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width:'18px', height:'18px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block' }} /> : <><span>Sign In</span><ArrowRight size={16}/></>}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div style={{ marginTop:'1.25rem', padding:'1rem', background:'rgba(255,255,255,0.03)', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize:'0.75rem', color:'#71717a', marginBottom:'0.625rem', fontWeight:500 }}>🧪 Demo accounts (password: Admin@123)</p>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
              {[['Admin','admin@cerberusgadgets.com'],['Seller','techseller@cerberusgadgets.com'],['Customer','customer@cerberusgadgets.com']].map(([label,email]) => (
                <button key={label} onClick={()=>quickLogin(email,'Admin@123')}
                  style={{ flex:1, minWidth:'80px', padding:'0.375rem 0.5rem', background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.2)',
                    borderRadius:'6px', color:'#f87171', fontSize:'0.75rem', cursor:'pointer', fontWeight:500, transition:'all 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(220,38,38,0.2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(220,38,38,0.1)'}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'#71717a' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#dc2626', textDecoration:'none', fontWeight:500 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
