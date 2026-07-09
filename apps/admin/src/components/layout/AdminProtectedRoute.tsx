import { Navigate, Outlet } from 'react-router';
import { useAdminAuthStore } from '../../stores/adminAuthStore';

export function AdminProtectedRoute() {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAdminAuthStore((s) => s.isAdmin);
  const isLoading = useAdminAuthStore((s) => s.isLoading);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f0f2f5] dark:bg-[#0D1117] gap-4">
      <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 dark:border-gray-700 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
      <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Loading admin console…</p>
    </div>
  );
  if (!isAuthenticated || !isAdmin) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
