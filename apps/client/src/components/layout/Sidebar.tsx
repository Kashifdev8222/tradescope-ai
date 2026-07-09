import { NavLink } from 'react-router';
import { useAuthStore } from '../../stores/authStore';

const DashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const TradeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const LiveIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const WalletIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
const AIIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16.01"/><line x1="16" y1="16" x2="16" y2="16.01"/></svg>;

const VerIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const PhoneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const UserIconSide = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashIcon/> },
  { path: '/trader', label: 'Web Trader', icon: <TradeIcon/> },
  { path: '/live-traders', label: 'Live Traders', icon: <LiveIcon/> },
  { path: '/accounts', label: 'Accounts', icon: <WalletIcon/> },
  { path: '/ai-settings', label: 'AI Settings', icon: <AIIcon/> },
  { path: '/kyc', label: 'KYC Verification', icon: <VerIcon/> },
  { path: '/call', label: 'Call Manager', icon: <PhoneIcon/> },
  { path: '/profile', label: 'Profile', icon: <UserIconSide/> },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  return (
    <aside className="w-[250px] h-screen bg-[#060a10] text-white flex flex-col fixed left-0 top-0 z-[100]">
      {/* Mobile close + Logo */}
      <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div><div className="text-[16px] font-bold tracking-tight">TradeScope<span className="text-purple-400">AI</span></div></div>
        </div>
        {onClose && <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06]"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {NAV.map(i => (
          <NavLink key={i.path} to={i.path} onClick={onClose} className={({isActive}) => `flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'}`}>
            <span className="shrink-0">{i.icon}</span><span>{i.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/[0.06] mx-3 mb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-600/20">{user?.email?.[0]?.toUpperCase() || 'U'}</div>
          <div className="flex-1 min-w-0"><p className="text-[13px] font-semibold truncate">{user?.email?.split('@')[0] || 'User'}</p><p className="text-[11px] text-gray-500">{user?.role==='admin'?'Admin':'Trader'}</p></div>
        </div>
        <button onClick={logout} className="w-full py-2.5 text-[12px] text-gray-400 hover:text-white border border-white/[0.08] rounded-xl hover:bg-white/[0.04] transition-all font-medium">Sign Out</button>
      </div>
    </aside>
  );
}
