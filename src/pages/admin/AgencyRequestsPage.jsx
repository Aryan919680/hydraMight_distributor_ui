import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RefreshCcw, Search, XCircle } from 'lucide-react';
import { AdminShell } from '../../components/AppShell';
import Toast from '../../components/Toast';
import Loader from '../../components/Loader';
import { approveAgencyRequest, getAgencyRequests, getStockists, rejectAgencyRequest } from '../../api/distributorAdminApi';
import { storage } from '../../utils/storage';

export default function AgencyRequestsPage() {
  const token = useMemo(() => storage.getAdminToken(), []);
  const [items, setItems] = useState([]);
  const [stockists, setStockists] = useState([]);
  const [selectedStockists, setSelectedStockists] = useState({});
  const [filters, setFilters] = useState({ search: '', status: 'pending' });
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [requestRes, stockistRes] = await Promise.all([
        getAgencyRequests(token, { ...filters, limit: 100, offset: 0 }),
        getStockists(token, { status: 'active', limit: 200, offset: 0 }),
      ]);
      setItems(requestRes.data || []);
      setStockists(stockistRes.data || []);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onFilterChange = (e) => setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
  const setManualStockist = (requestId, stockistId) => setSelectedStockists((p) => ({ ...p, [requestId]: stockistId }));

  const approve = async (request) => {
    const manualStockistId = selectedStockists[request.id];
    const payload = request.matched_stockist_id ? {} : { stockist_id: manualStockistId };

    if (!request.matched_stockist_id && !manualStockistId) {
      setToast({ type: 'error', message: 'Please select a stockist before approval.' });
      return;
    }

    setActionId(request.id);
    try {
      const res = await approveAgencyRequest(token, request.id, payload);
      const login = res?.data?.login;
      setToast({ type: 'success', message: `Request approved. Login: ${login?.email} / ${login?.default_password}` });
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setActionId('');
    }
  };

  const reject = async (request) => {
    const reason = window.prompt('Reason for rejection?', 'Invalid details');
    if (reason === null) return;

    setActionId(request.id);
    try {
      await rejectAgencyRequest(token, request.id, { rejection_reason: reason });
      setToast({ type: 'success', message: 'Request rejected.' });
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setActionId('');
    }
  };

  return (
    <AdminShell>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Agency Requests</h2>
          <p className="muted">Approve requests submitted by agencies. Referral code is optional; assign stockist manually when no match exists.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box"><Search size={18} /><input name="search" value={filters.search} onChange={onFilterChange} placeholder="Search agency, GST, referral, territory" /></div>
        <select name="status" value={filters.status} onChange={onFilterChange}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="">All</option></select>
        <button className="secondary-btn" onClick={load}><RefreshCcw size={16} /> Apply</button>
      </div>

      {loading ? <Loader /> : <div className="table-card wide-table"><table><thead><tr><th>Agency</th><th>Contact</th><th>Referral</th><th>Matched Stockist</th><th>Admin Assignment</th><th>Status</th><th>Action</th></tr></thead><tbody>{items.map((x) => {
        const needsManual = !x.matched_stockist_id && x.status === 'pending';
        return <tr key={x.id}>
          <td><strong>{x.business_name}</strong><small>GST: {x.gst_number}</small><small>{x.address_line1}, {x.city || x.state}</small></td>
          <td>{x.contact_person}<small>{x.email}</small><small>{x.mobile}</small></td>
          <td>{x.referral_code || <span className="muted">Not provided</span>}</td>
          <td>{x.matched_stockist_name ? <><strong>{x.matched_stockist_name}</strong><small>{x.matched_stockist_territory || x.matched_territory}</small></> : <span className="muted">No auto match</span>}</td>
          <td>{needsManual ? <select value={selectedStockists[x.id] || ''} onChange={(e) => setManualStockist(x.id, e.target.value)}><option value="">Select stockist *</option>{stockists.map((s) => <option key={s.id} value={s.id}>{s.business_name} — {s.territory || 'No territory'}</option>)}</select> : <><strong>{x.assigned_stockist_name || '-'}</strong><small>{x.assigned_territory || x.assigned_stockist_territory || '-'}</small></>}</td>
          <td><span className={`badge ${x.status}`}>{x.status}</span></td>
          <td>{x.status === 'pending' ? <div className="row-actions"><button className="success-btn" disabled={actionId === x.id} onClick={() => approve(x)}><CheckCircle2 size={15} /> Approve</button><button className="danger-btn" disabled={actionId === x.id} onClick={() => reject(x)}><XCircle size={15} /> Reject</button></div> : <span className="muted">Completed</span>}</td>
        </tr>;
      })}{items.length === 0 && <tr><td colSpan="7" className="empty-cell">No agency requests found.</td></tr>}</tbody></table></div>}
    </AdminShell>
  );
}
