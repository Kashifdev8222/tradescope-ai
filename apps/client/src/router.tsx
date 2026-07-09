import { Routes, Route, Navigate } from 'react-router';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TraderPage } from './pages/trader/TraderPage';
import { LiveTradersPage } from './pages/live-traders/LiveTradersPage';
import { AccountsPage } from './pages/accounts/AccountsPage';
import { AISettingsPage } from './pages/settings/AISettingsPage';
import { KYCPage } from './pages/settings/KYCPage';
import { CallPage } from './pages/settings/CallPage';
import { ProfilePage } from './pages/settings/ProfilePage';

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trader" element={<TraderPage />} />
          <Route path="/live-traders" element={<LiveTradersPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/ai-settings" element={<AISettingsPage />} />
          <Route path="/kyc" element={<KYCPage />} />
          <Route path="/call" element={<CallPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
