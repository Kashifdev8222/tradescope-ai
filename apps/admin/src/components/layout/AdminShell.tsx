import { Outlet, NavLink } from 'react-router';
import { useAdminAuthStore } from '../../stores/adminAuthStore';
import { ADMIN_NAV_ITEMS } from '../../lib/constants';

export function AdminShell() {
  const user = useAdminAuthStore((s) => s.user);
  const logout = useAdminAuthStore((s) => s.logout);
  return (<>
    <div className="app-shell">
      <aside className="asb"><div className="asb-brand"><h1>TradeScope<span>Admin</span></h1><small>Agent Zone</small></div>
      <nav className="asb-nav">{ADMIN_NAV_ITEMS.map(i=><NavLink key={i.path} to={i.path} className={({isActive})=>`asb-link${isActive?' active':''}`}><span className="asb-icon">{i.icon}</span>{i.label}</NavLink>)}</nav>
      <div className="asb-user"><div className="asb-avatar">A</div><div className="asb-info"><p>Admin</p><small>{user?.email}</small></div><button onClick={logout} className="btn btn-ghost btn-sm" style={{width:'100%',marginTop:10}}>Sign Out</button></div></aside>
      <div className="app-content" style={{marginLeft:240}}>
        <header className="asb-bar"><span>Admin Console</span><span className="badge badge-danger">ADMIN</span></header>
        <main className="app-main"><Outlet /></main>
      </div>
    </div>
    <style>{`
.asb{width:240px;height:100vh;background:var(--color-surface);border-right:1px solid var(--color-border);display:flex;flex-direction:column;position:fixed;left:0;top:0;z-index:100}
.asb-brand{padding:20px 20px 16px;border-bottom:1px solid var(--color-border)}.asb-brand h1{font-size:18px;font-weight:700;color:var(--color-accent);margin:0}.asb-brand span{color:var(--color-danger)}.asb-brand small{font-size:10px;color:var(--color-danger);margin-top:2px;display:block}
.asb-nav{flex:1;padding:8px;overflow-y:auto}
.asb-link{display:flex;align-items:center;gap:12px;padding:9px 14px;border-radius:var(--radius-md);text-decoration:none;color:var(--color-text-secondary);font-size:var(--text-sm);margin-bottom:2px;transition:all .15s}.asb-link:hover{background:var(--color-hover);color:var(--color-text)}.asb-link.active{background:var(--color-accent);color:#fff;font-weight:600}
.asb-icon{font-size:18px;width:24px;text-align:center}
.asb-user{padding:14px 16px;border-top:1px solid var(--color-border)}.asb-avatar{width:32px;height:32px;border-radius:50%;background:var(--color-danger);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;margin-bottom:8px}.asb-info p{font-size:12px;font-weight:600;color:var(--color-text);margin:0}.asb-info small{font-size:10px;color:var(--color-text-tertiary)}
.asb-bar{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:var(--color-surface);border-bottom:1px solid var(--color-border)}
`}</style></>);
}
