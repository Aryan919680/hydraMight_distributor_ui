import { Navigate, Route, Routes } from 'react-router-dom';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDistributorDashboard from './pages/admin/AdminDistributorDashboard';
import StockistsPage from './pages/admin/StockistsPage';
import AgenciesPage from './pages/admin/AgenciesPage';
import AgencyRequestsPage from './pages/admin/AgencyRequestsPage';

import DistributorLogin from './pages/distributor/DistributorLogin';
import AgencySignupPage from './pages/distributor/AgencySignupPage';
import DistributorDashboard from './pages/distributor/DistributorDashboard';

import StockistProductsPage from './pages/stockist/StockistProductsPage';
import StockistOrdersPage from './pages/stockist/StockistOrdersPage';
import StockistInventoryPage from './pages/stockist/StockistInventoryPage';

import {
  AdminProtectedRoute,
  DistributorProtectedRoute,
  StockistProtectedRoute,
} from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/distributor/login" replace />}
      />

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/distributors"
        element={
          <AdminProtectedRoute>
            <AdminDistributorDashboard />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/distributors/stockists"
        element={
          <AdminProtectedRoute>
            <StockistsPage />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/distributors/agency-requests"
        element={
          <AdminProtectedRoute>
            <AgencyRequestsPage />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/distributors/agencies"
        element={
          <AdminProtectedRoute>
            <AgenciesPage />
          </AdminProtectedRoute>
        }
      />

      <Route path="/distributor/login" element={<DistributorLogin />} />
      <Route
        path="/distributor/agency-signup"
        element={<AgencySignupPage />}
      />

      <Route
        path="/distributor/dashboard"
        element={
          <DistributorProtectedRoute>
            <DistributorDashboard />
          </DistributorProtectedRoute>
        }
      />

      <Route
        path="/distributor/products"
        element={
          <StockistProtectedRoute>
            <StockistProductsPage />
          </StockistProtectedRoute>
        }
      />

      <Route
        path="/distributor/orders"
        element={
          <StockistProtectedRoute>
            <StockistOrdersPage />
          </StockistProtectedRoute>
        }
      />

      <Route
        path="/distributor/inventory"
        element={
          <StockistProtectedRoute>
            <StockistInventoryPage />
          </StockistProtectedRoute>
        }
      />

      <Route
        path="/distributor/catalog"
        element={<Navigate to="/distributor/products" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/distributor/login" replace />}
      />
    </Routes>
  );
}