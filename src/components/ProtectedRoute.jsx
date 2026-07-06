import { Navigate } from "react-router-dom";
import { storage } from "../utils/storage";

export function AdminProtectedRoute({ children }) {
  return storage.getAdminToken() ? (
    children
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

export function DistributorProtectedRoute({ children }) {
  return storage.getDistributorToken() ? (
    children
  ) : (
    <Navigate to="/distributor/login" replace />
  );
}

export function StockistProtectedRoute({ children }) {
  const user = storage.getDistributorUser();

  if (!storage.getDistributorToken()) {
    return <Navigate to="/distributor/login" replace />;
  }

  return user?.user_type === "stockist" ? (
    children
  ) : (
    <Navigate to="/distributor/dashboard" replace />
  );
}

export function AgencyProtectedRoute({ children }) {
  const user = storage.getDistributorUser();

  if (!storage.getDistributorToken()) {
    return <Navigate to="/distributor/login" replace />;
  }

  return user?.user_type === "agency" ? (
    children
  ) : (
    <Navigate to="/distributor/dashboard" replace />
  );
}