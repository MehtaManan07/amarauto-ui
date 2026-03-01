import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard, GuestGuard } from '../components/common/AuthGuard';
import MainLayout from '../components/layout/MainLayout';
import { LoadingState } from '../components/common/LoadingState';
import { USER_ROLES } from '../constants';

// Lazy-loaded pages — only downloaded when the route is visited
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const ProductsPage = lazy(() => import('../features/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('../features/products/ProductDetailPage'));
const RawMaterialsPage = lazy(() => import('../features/raw-materials/RawMaterialsPage'));
const RawMaterialDetailPage = lazy(() => import('../features/raw-materials/RawMaterialDetailPage'));
const BOMPage = lazy(() => import('../features/bom/BOMPage').then(m => ({ default: m.BOMPage })));
const JobRatesPage = lazy(() => import('../features/job-rates/JobRatesPage').then(m => ({ default: m.JobRatesPage })));
const WorkLogsPage = lazy(() => import('../features/work-logs/WorkLogsPage').then(m => ({ default: m.WorkLogsPage })));
const ProductionPage = lazy(() => import('../features/production/ProductionPage').then(m => ({ default: m.ProductionPage })));
const PartiesPage = lazy(() => import('../features/parties/PartiesPage').then(m => ({ default: m.PartiesPage })));
const PartyDetailPage = lazy(() => import('../features/parties/PartyDetailPage').then(m => ({ default: m.PartyDetailPage })));
const UsersPage = lazy(() => import('../features/users/UsersPage').then(m => ({ default: m.UsersPage })));


const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingState />}>
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
        <Route path="/work-logs" element={<WorkLogsPage />} />
        <Route path="/production" element={<ProductionPage />} />
        <Route path="/parties" element={<PartiesPage />} />
        <Route path="/parties/:id" element={<PartyDetailPage />} />
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
    </Suspense>
  );
};

export default AppRoutes;
