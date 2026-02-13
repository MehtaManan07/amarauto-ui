import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard, GuestGuard } from '../components/common/AuthGuard';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../features/auth/LoginPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import ProductsPage from '../features/products/ProductsPage';
import ProductDetailPage from '../features/products/ProductDetailPage';
import RawMaterialsPage from '../features/raw-materials/RawMaterialsPage';
import RawMaterialDetailPage from '../features/raw-materials/RawMaterialDetailPage';
import { BOMPage } from '../features/bom/BOMPage';
import { JobRatesPage } from '../features/job-rates/JobRatesPage';
import { UsersPage } from '../features/users/UsersPage';
import { USER_ROLES } from '../constants';


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
      
      <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/raw-materials" element={<RawMaterialsPage />} />
        <Route path="/raw-materials/:id" element={<RawMaterialDetailPage />} />
        <Route path="/bom" element={<BOMPage />} />
        <Route path="/job-rates" element={<JobRatesPage />} />
        <Route
          path="/users"
          element={
            <AuthGuard allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR]}>
              <UsersPage />
            </AuthGuard>
          }
        />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
