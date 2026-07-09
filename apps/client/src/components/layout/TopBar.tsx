import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-[#161B22] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger for mobile */}
        <button onClick={toggleSidebar} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <span className="text-[13px] text-gray-500 dark:text-gray-400">Welcome, <b className="text-gray-900 dark:text-white">{user?.email?.split('@')[0] || 'Trader'}</b></span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-full text-[11px] font-semibold text-green-700 dark:text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-500"/>AI LIVE</span>
        <button onClick={toggle} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all text-sm">{theme==='light'?'🌙':'☀️'}</button>
        <button onClick={logout} className="text-[12px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 sm:px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">Sign Out</button>
      </div>
    </header>
  );
}
