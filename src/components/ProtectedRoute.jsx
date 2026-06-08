import { Navigate } from 'react-router-dom';
import { storage } from '../utils/storage';

export function AdminProtectedRoute({ children }) {
  const token = storage.getAdminToken();
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

export function DistributorProtectedRoute({ children }) {
  const token = storage.getDistributorToken();
  if (!token) return <Navigate to="/distributor/login" replace />;
  return children;
}
