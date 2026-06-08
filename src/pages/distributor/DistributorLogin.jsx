import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Network } from 'lucide-react';
import { distributorLogin } from '../../api/authApi';
import { storage } from '../../utils/storage';
import Toast from '../../components/Toast';

export default function DistributorLogin() {
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
      const res = await distributorLogin(form);
      storage.setDistributorSession(res.token, res.user);
      navigate('/distributor/dashboard', { replace: true });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page distributor-login-bg">
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-icon"><Network size={34} /></div>
        <h1>Distributor Login</h1>
        <p>Login as stockist or approved agency using the credentials generated after approval.</p>

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={onChange} placeholder="stockist@example.com" required />

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={onChange} placeholder="firstname@123" required />

        <button className="primary-btn full" disabled={loading}>{loading ? 'Signing in...' : 'Login to Portal'}</button>
        <p className="form-footer">Agency not approved yet? <Link to="/distributor/agency-signup">Raise signup request</Link></p>
      </form>
    </div>
  );
}
