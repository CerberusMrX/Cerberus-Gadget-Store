/** Protected Route Component */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <div className="spinner" style={{ width:'40px', height:'40px', border:'3px solid rgba(220,38,38,0.2)', borderTopColor:'#dc2626', borderRadius:'50%' }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role || user.ROLE;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}
