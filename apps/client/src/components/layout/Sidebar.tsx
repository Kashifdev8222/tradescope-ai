import { NavLink } from 'react-router';
import { useAuthStore } from '../../stores/authStore';

const DashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const TradeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const LiveIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const WalletIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
const AIIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16.01"/><line x1="16" y1="16" x2="16" y2="16.01"/></svg>;

const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashIcon/> },
  { path: '/trader', label: 'Web Trader', icon: <TradeIcon/> },
  { path: '/live-traders', label: 'Live Traders', icon: <LiveIcon/> },
  { path: '/accounts', label: 'Accounts', icon: <WalletIcon/> },
  { path: '/ai-settings', label: 'AI Settings', icon: <AIIcon/> },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  return (
    <aside className="w-[250px] h-screen bg-[#060a10] text-white flex flex-col fixed left-0 top-0 z-[100]">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div>
            <div className="text-[16px] font-bold tracking-tight">TradeScope<span className="text-purple-400">AI</span></div>
            <div className="text-[10px] text-gray-500 font-medium">Trading Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {NAV.map(i => (
          <NavLink key={i.path} to={i.path} className={({isActive}) => `flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-150 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'}`}>
            <span className="shrink-0">{i.icon}</span>
            <span>{i.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/[0.06] mx-3 mb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-600/20">{user?.email?.[0]?.toUpperCase() || 'U'}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-[11px] text-gray-500">{user?.role === 'admin' ? 'Administrator' : 'Trader'}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full py-2.5 text-[12px] text-gray-400 hover:text-white border border-white/[0.08] rounded-xl hover:bg-white/[0.04] transition-all font-medium">Sign Out</button>
      </div>
    </aside>
  );
}
