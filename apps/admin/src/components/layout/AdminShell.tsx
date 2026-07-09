import { Outlet, NavLink } from 'react-router';
import { useAdminAuthStore } from '../../stores/adminAuthStore';
import { useThemeStore } from '../../stores/themeStore';
import { ADMIN_NAV_ITEMS } from '../../lib/constants';

export function AdminShell() {
  const user = useAdminAuthStore((s) => s.user);
  const logout = useAdminAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);

  return (
    <div className="flex h-screen bg-[#f0f2f5] dark:bg-[#0D1117]">
      {/* Sidebar */}
      <aside className="w-[240px] h-screen bg-[#080a14] text-white flex flex-col fixed left-0 top-0 z-[100]">
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <div className="text-[15px] font-bold">TradeScope<span className="text-indigo-400">Admin</span></div>
              <div className="text-[10px] text-red-400 font-medium">Agent Zone</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map(i => (
            <NavLink key={i.path} to={i.path} className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all ${isActive ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'}`}>
              <svg width="18" height="18" viewBox={(i as any).viewBox} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                {(i as any).paths?.map((d: string, idx: number) => <path key={idx} d={d}/>)}
                {(i as any).circle && <circle cx={(i as any).circle.split(' ')[0]} cy={(i as any).circle.split(' ')[1]} r={(i as any).circle.split(' ')[2]}/>}
              </svg>
              <span>{i.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">A</div>
            <div className="flex-1 min-w-0"><p className="text-[12px] font-semibold truncate">Admin</p><p className="text-[10px] text-gray-500 truncate">{user?.email}</p></div>
          </div>
          <button onClick={logout} className="w-full py-2 text-[12px] text-gray-400 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-all">Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen" style={{marginLeft:240}}>
        <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-[#161B22] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 flex-shrink-0">
          <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Admin Console</span>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-full text-[11px] font-bold text-red-700 dark:text-red-400">ADMIN</span>
            <button onClick={toggleTheme} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all text-sm">{theme==='light'?'🌙':'☀️'}</button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
