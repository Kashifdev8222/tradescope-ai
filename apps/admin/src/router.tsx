import { Routes, Route, Navigate } from 'react-router';
import { AdminProtectedRoute } from './components/layout/AdminProtectedRoute';
import { AdminShell } from './components/layout/AdminShell';
import { AdminLoginPage } from './pages/login/AdminLoginPage';
import { UsersPage } from './pages/users/UsersPage';
import { BalancesPage } from './pages/balances/BalancesPage';
import { TransactionsPage } from './pages/transactions/TransactionsPage';
import { AIControlPage } from './pages/ai-control/AIControlPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { RolesPage } from './pages/users/RolesPage';
import { ClientsPage } from './pages/users/ClientsPage';
import { KYCPage } from './pages/users/KYCPage';
import { ImportPage } from './pages/users/ImportPage';
import { AdminCallPage } from './pages/users/AdminCallPage';
import { WorkspacePage } from './pages/users/WorkspacePage';
import { ReportsPage } from './pages/reports/ReportsPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminShell />}>
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/roles" element={<RolesPage />} />
          <Route path="/admin/clients" element={<ClientsPage />} />
          <Route path="/admin/kyc" element={<KYCPage />} />
          <Route path="/admin/import" element={<ImportPage />} />
          <Route path="/admin/call" element={<AdminCallPage />} />
          <Route path="/admin/workspace" element={<WorkspacePage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/balances" element={<BalancesPage />} />
          <Route path="/admin/transactions" element={<TransactionsPage />} />
          <Route path="/admin/ai-control" element={<AIControlPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
