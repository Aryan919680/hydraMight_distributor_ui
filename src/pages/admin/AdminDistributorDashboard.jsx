import { useEffect, useState } from 'react';
import { Building2, Users, Clock, CheckCircle2 } from 'lucide-react';
import { AdminShell } from '../../components/AppShell';
import Loader from '../../components/Loader';
import { getAgencies, getAgencyRequests, getStockists } from '../../api/distributorAdminApi';
import { storage } from '../../utils/storage';

export default function AdminDistributorDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ stockists: 0, agencies: 0, pendingRequests: 0, activeStockists: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const token = storage.getAdminToken();
        const [stockistsRes, agenciesRes, pendingRes] = await Promise.all([
          getStockists(token, { limit: 100, offset: 0 }),
          getAgencies(token, { limit: 100, offset: 0 }),
          getAgencyRequests(token, { status: 'pending', limit: 100, offset: 0 }),
        ]);
        const stockists = stockistsRes.data || [];
        const agencies = agenciesRes.data || [];
        const pending = pendingRes.data || [];
        setStats({
          stockists: stockists.length,
          agencies: agencies.length,
          pendingRequests: pending.length,
          activeStockists: stockists.filter((x) => x.status === 'active').length,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminShell>
      <div className="page-header">
        <div>
          <p className="eyebrow">Distributor Network</p>
          <h2>Admin Dashboard</h2>
          <p className="muted">Create stockists with territory and referral code. Agencies raise requests and admin approves them.</p>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="stats-grid">
          <div className="stat-card"><Building2 /><p>Total Stockists</p><h3>{stats.stockists}</h3></div>
          <div className="stat-card"><Users /><p>Approved Agencies</p><h3>{stats.agencies}</h3></div>
          <div className="stat-card"><Clock /><p>Pending Requests</p><h3>{stats.pendingRequests}</h3></div>
          <div className="stat-card"><CheckCircle2 /><p>Active Stockists</p><h3>{stats.activeStockists}</h3></div>
        </div>
      )}

      <section className="info-panel">
        <h3>Current Distributor Flow</h3>
        <p>Admin creates a stockist and enters territory as a simple text field. The backend generates a referral code. Agency signup can be submitted with or without referral code. If referral is supplied, stockist is auto-matched but still requires admin approval. If no referral is supplied, admin selects stockist during approval.</p>
      </section>
    </AdminShell>
  );
}
