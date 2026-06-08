import { useEffect, useState } from 'react';
import { Building2, Package, ShoppingCart, UserRound } from 'lucide-react';
import { DistributorShell } from '../../components/AppShell';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';
import { getDistributorMe } from '../../api/authApi';
import { storage } from '../../utils/storage';

export default function DistributorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDistributorMe(storage.getDistributorToken());
        setData(res.data);
      } catch (err) {
        setToast({ type: 'error', message: err.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <DistributorShell user={storage.getDistributorUser()}><Loader /></DistributorShell>;

  const user = data?.user || storage.getDistributorUser();
  const profile = data?.stockist || data?.agency || {};

  return (
    <DistributorShell user={user}>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
      <div className="page-header">
        <div>
          <p className="eyebrow">{user?.user_type === 'agency' ? 'Agency Portal' : 'Stockist Portal'}</p>
          <h2>Welcome, {user?.full_name}</h2>
          <p className="muted">Your distributor network session is active.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><UserRound /><p>Role</p><h3 className="capitalize">{user?.user_type}</h3></div>
        <div className="stat-card"><Building2 /><p>Business</p><h3>{profile.business_name || '-'}</h3></div>
        <div className="stat-card"><Package /><p>Catalog</p><h3>Next Phase</h3></div>
        <div className="stat-card"><ShoppingCart /><p>Orders</p><h3>Next Phase</h3></div>
      </div>

      <section className="profile-panel">
        <h3>Profile Details</h3>
        <div className="profile-grid">
          <div><label>Name</label><p>{user?.full_name}</p></div>
          <div><label>Email</label><p>{user?.email}</p></div>
          <div><label>Mobile</label><p>{user?.mobile}</p></div>
          <div><label>GST</label><p>{profile.gst_number || '-'}</p></div>
          <div><label>Business</label><p>{profile.business_name || '-'}</p></div>
          <div><label>Territory</label><p>{profile.territory || '-'}</p></div>
          <div><label>Referral Code</label><p>{profile.referral_code || '-'}</p></div>
          <div><label>Status</label><p><span className={`badge ${profile.status || user?.status}`}>{profile.status || user?.status}</span></p></div>
          {user?.user_type === 'agency' && <div><label>Parent Stockist</label><p>{profile.stockist_business_name || '-'}</p></div>}
        </div>
      </section>
    </DistributorShell>
  );
}
