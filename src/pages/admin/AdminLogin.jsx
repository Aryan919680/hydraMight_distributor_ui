import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { adminLogin } from '../../api/authApi';
import { storage } from '../../utils/storage';
import Toast from '../../components/Toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);
    try {
      const res = await adminLogin(form);
      storage.setAdminSession(res.token, res.user);
      navigate('/admin/distributors', { replace: true });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-icon"><ShieldCheck size={34} /></div>
        <h1>Admin Login</h1>
        <p>Manage stockists and agencies from the distributor network module.</p>

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={onChange} placeholder="admin@example.com" required />

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••" required />

        <button className="primary-btn full" disabled={loading}>{loading ? 'Signing in...' : 'Login as Admin'}</button>
      </form>
    </div>
  );
}
