import { Navigate } from 'react-router-dom';
import { storage } from '../utils/storage';

export function AdminProtectedRoute({ children }) {
  const token = storage.getAdminToken();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export function DistributorProtectedRoute({ children }) {
  const token = storage.getDistributorToken();

  if (!token) {
    return <Navigate to="/distributor/login" replace />;
  }

  return children;
}

export function StockistProtectedRoute({ children }) {
  const token = storage.getDistributorToken();
  const user = storage.getDistributorUser();

  if (!token) {
    return <Navigate to="/distributor/login" replace />;
  }

  if (user?.user_type !== 'stockist') {
    return <Navigate to="/distributor/dashboard" replace />;
  }

  return children;
}