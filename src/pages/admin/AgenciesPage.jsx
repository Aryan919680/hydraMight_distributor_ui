import { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCcw } from 'lucide-react';
import { AdminShell } from '../../components/AppShell';
import Toast from '../../components/Toast';
import Loader from '../../components/Loader';
import { getAgencies, getStockists } from '../../api/distributorAdminApi';
import { storage } from '../../utils/storage';

export default function AgenciesPage() {
  const token = useMemo(() => storage.getAdminToken(), []);
  const [items, setItems] = useState([]);
  const [stockists, setStockists] = useState([]);
  const [filters, setFilters] = useState({ search: '', stockist_id: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [agencyRes, stockistRes] = await Promise.all([
        getAgencies(token, { ...filters, limit: 100, offset: 0 }),
        getStockists(token, { status: 'active', limit: 200, offset: 0 }),
      ]);
      setItems(agencyRes.data || []);
      setStockists(stockistRes.data || []);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onFilterChange = (e) => setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <AdminShell>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
      <div className="page-header">
        <div><p className="eyebrow">Admin</p><h2>Approved Agencies</h2><p className="muted">Agencies are created only after admin approval from agency requests.</p></div>
      </div>

      <div className="toolbar">
        <div className="search-box"><Search size={18} /><input name="search" value={filters.search} onChange={onFilterChange} placeholder="Search GST, business, contact, email" /></div>
        <select name="stockist_id" value={filters.stockist_id} onChange={onFilterChange}><option value="">All Stockists</option>{stockists.map((s) => <option key={s.id} value={s.id}>{s.business_name}</option>)}</select>
        <select name="status" value={filters.status} onChange={onFilterChange}><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="blocked">Blocked</option></select>
        <button className="secondary-btn" onClick={load}><RefreshCcw size={16} /> Apply</button>
      </div>

      {loading ? <Loader /> : <div className="table-card"><table><thead><tr><th>Business</th><th>Parent Stockist</th><th>Territory</th><th>Referral Used</th><th>GST</th><th>Contact</th><th>Status</th></tr></thead><tbody>{items.map((x) => <tr key={x.id}><td><strong>{x.business_name}</strong><small>{x.address_line1}</small></td><td>{x.stockist_business_name}</td><td>{x.territory || '-'}</td><td>{x.referral_code || '-'}</td><td>{x.gst_number}</td><td>{x.contact_person}<small>{x.email}</small><small>{x.mobile}</small></td><td><span className={`badge ${x.status}`}>{x.status}</span></td></tr>)}{items.length === 0 && <tr><td colSpan="7" className="empty-cell">No approved agencies found.</td></tr>}</tbody></table></div>}
    </AdminShell>
  );
}
