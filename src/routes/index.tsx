import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard, GuestGuard } from '../components/common/AuthGuard';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../features/auth/LoginPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import ProductsPage from '../features/products/ProductsPage';
import ProductDetailPage from '../features/products/ProductDetailPage';
import { USER_ROLES } from '../constants';

// Placeholder components
const RawMaterialsPage = () => <div>Raw Materials Page - Coming Soon</div>;
const BOMPage = () => <div>BOM Page - Coming Soon</div>;
const UsersPage = () => <div>Users Page - Coming Soon</div>;

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
        <Route path="/bom" element={<BOMPage />} />
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
