import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, RefreshCcw, Copy } from 'lucide-react';
import { AdminShell } from '../../components/AppShell';
import Toast from '../../components/Toast';
import Loader from '../../components/Loader';
import { createStockist, getStockists } from '../../api/distributorAdminApi';
import { storage } from '../../utils/storage';

const emptyForm = {
  territory: '', gst_number: '', business_name: '', contact_person: '', mobile: '', email: '',
  address_line1: '', address_line2: '', city: '', state: '', pincode: ''
};

export default function StockistsPage() {
  const token = useMemo(() => storage.getAdminToken(), []);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getStockists(token, { ...filters, limit: 100, offset: 0 });
      setItems(res.data || []);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onFilterChange = (e) => setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));

  const copyReferral = async (code) => {
    try {
      await navigator.clipboard.writeText(code || '');
      setToast({ type: 'success', message: 'Referral code copied' });
    } catch {
      setToast({ type: 'info', message: code || 'No referral code available' });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    try {
      const res = await createStockist(token, form);
      const referralCode = res?.data?.referral_code || res?.data?.stockist?.referral_code;
      setToast({ type: 'success', message: `Stockist created. Referral: ${referralCode}. Login: ${res.data.login.email} / ${res.data.login.default_password}` });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Stockists</h2>
          <p className="muted">Create stockists, assign a territory, and share the generated referral code when needed.</p>
        </div>
        <button className="primary-btn" onClick={() => setShowForm((v) => !v)}><Plus size={18} /> Add Stockist</button>
      </div>

      <div className="toolbar">
        <div className="search-box"><Search size={18} /><input name="search" value={filters.search} onChange={onFilterChange} placeholder="Search GST, business, territory, referral" /></div>
        <select name="status" value={filters.status} onChange={onFilterChange}><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="blocked">Blocked</option></select>
        <button className="secondary-btn" onClick={load}><RefreshCcw size={16} /> Apply</button>
      </div>

      {showForm && <section className="form-card"><h3>Create Stockist</h3><StockistForm form={form} onChange={onChange} onSubmit={submit} saving={saving} /></section>}

      {loading ? <Loader /> : <div className="table-card"><table><thead><tr><th>Business</th><th>Territory</th><th>Referral Code</th><th>GST</th><th>Contact</th><th>Email</th><th>Agencies</th><th>Status</th></tr></thead><tbody>{items.map((x) => <tr key={x.id}><td><strong>{x.business_name}</strong><small>{x.address_line1}</small></td><td>{x.territory || '-'}</td><td><button type="button" className="link-btn" onClick={() => copyReferral(x.referral_code)}><Copy size={14} /> {x.referral_code || '-'}</button></td><td>{x.gst_number}</td><td>{x.contact_person}<small>{x.mobile}</small></td><td>{x.email}</td><td>{x.agency_count ?? 0}</td><td><span className={`badge ${x.status}`}>{x.status}</span></td></tr>)}{items.length === 0 && <tr><td colSpan="8" className="empty-cell">No stockists found.</td></tr>}</tbody></table></div>}
    </AdminShell>
  );
}

function StockistForm({ form, onChange, onSubmit, saving }) {
  return (
    <form className="grid-form" onSubmit={onSubmit}>
      <input name="territory" value={form.territory} onChange={onChange} placeholder="Territory *" required />
      <input name="gst_number" value={form.gst_number} onChange={onChange} placeholder="GST Number *" required />
      <input name="business_name" value={form.business_name} onChange={onChange} placeholder="Business Name *" required />
      <input name="contact_person" value={form.contact_person} onChange={onChange} placeholder="Contact Person *" required />
      <input name="mobile" value={form.mobile} onChange={onChange} placeholder="Mobile *" required />
      <input name="email" type="email" value={form.email} onChange={onChange} placeholder="Email *" required />
      <input name="address_line1" value={form.address_line1} onChange={onChange} placeholder="Address Line 1 *" required />
      <input name="address_line2" value={form.address_line2} onChange={onChange} placeholder="Address Line 2" />
      <input name="city" value={form.city} onChange={onChange} placeholder="City" />
      <input name="state" value={form.state} onChange={onChange} placeholder="State *" required />
      <input name="pincode" value={form.pincode} onChange={onChange} placeholder="Pincode" />
      <button className="primary-btn grid-submit" disabled={saving}>{saving ? 'Creating...' : 'Create Stockist'}</button>
    </form>
  );
}
