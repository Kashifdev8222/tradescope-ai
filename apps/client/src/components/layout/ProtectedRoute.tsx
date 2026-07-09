import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../../stores/authStore';

export function ProtectedRoute() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f0f2f5] dark:bg-[#0D1117] gap-4">
      <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 animate-spin" />
      <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Loading TradeScope AI…</p>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
