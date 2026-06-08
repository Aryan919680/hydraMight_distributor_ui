import { Home, LogOut, Package, Users, Building2, LayoutDashboard, ClipboardList } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';

export function AdminShell({ children }) {
  const navigate = useNavigate();
  const logout = () => {
    storage.clearAdminSession();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-logo">HM</div>
          <div>
            <h1>HydraMight</h1>
            <p>Admin Distributor</p>
          </div>
        </div>
        <nav className="side-nav">
          <NavLink to="/admin/distributors" end><LayoutDashboard size={18} /> Dashboard</NavLink>
          <NavLink to="/admin/distributors/stockists"><Building2 size={18} /> Stockists</NavLink>
          <NavLink to="/admin/distributors/agency-requests"><ClipboardList size={18} /> Agency Requests</NavLink>
          <NavLink to="/admin/distributors/agencies"><Users size={18} /> Approved Agencies</NavLink>
        </nav>
        <button className="logout-btn" onClick={logout}><LogOut size={18} /> Logout</button>
      </aside>
      <main className="main-area">{children}</main>
    </div>
  );
}

export function DistributorShell({ children, user }) {
  const navigate = useNavigate();
  const logout = () => {
    storage.clearDistributorSession();
    navigate('/distributor/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-logo">DN</div>
          <div>
            <h1>Distributor</h1>
            <p>{user?.user_type === 'agency' ? 'Agency Portal' : 'Stockist Portal'}</p>
          </div>
        </div>
        <nav className="side-nav">
          <NavLink to="/distributor/dashboard"><Home size={18} /> Dashboard</NavLink>
          <NavLink to="/distributor/catalog"><Package size={18} /> Catalog</NavLink>
        </nav>
        <button className="logout-btn" onClick={logout}><LogOut size={18} /> Logout</button>
      </aside>
      <main className="main-area">{children}</main>
    </div>
  );
}
