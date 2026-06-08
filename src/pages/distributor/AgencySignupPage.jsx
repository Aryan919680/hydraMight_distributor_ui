import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import Toast from '../../components/Toast';
import { createAgencySignupRequest } from '../../api/authApi';

const emptyForm = {
  referral_code: '', gst_number: '', business_name: '', contact_person: '', mobile: '', email: '',
  address_line1: '', address_line2: '', city: '', state: '', pincode: ''
};

export default function AgencySignupPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);
    setSubmitted(null);
    try {
      const payload = {
        ...form,
        referral_code: form.referral_code.trim() || null,
      };
      const res = await createAgencySignupRequest(payload);
      setSubmitted(res.data);
      setToast({ type: 'success', message: res.message || 'Agency request submitted successfully.' });
      setForm(emptyForm);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
      <div className="signup-card">
        <div className="login-icon"><ClipboardList size={34} /></div>
        <h1>Agency Signup Request</h1>
        <p className="muted">Submit your details for admin approval. Referral code is optional. If supplied, the system will auto-match the stockist, but admin approval is still required.</p>

        {submitted && <div className="success-box">
          <strong>Request submitted.</strong>
          <span>Status: {submitted.request?.status || submitted.status || 'pending'}</span>
          {(submitted.matched_stockist?.business_name || submitted.request?.matched_stockist_id) && <span>Stockist matched from referral code.</span>}
        </div>}

        <form className="grid-form" onSubmit={submit}>
          <input name="referral_code" value={form.referral_code} onChange={onChange} placeholder="Referral Code (optional)" />
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
          <button className="primary-btn grid-submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</button>
        </form>

        <p className="form-footer">Already approved? <Link to="/distributor/login">Login to distributor portal</Link></p>
      </div>
    </div>
  );
}
