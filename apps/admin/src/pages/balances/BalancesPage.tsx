import { useQuery } from '@tanstack/react-query';
import { getBalancesSummary } from '../../api/admin';
import { formatCurrency } from '@tradescope/shared-utils';

export function BalancesPage() {
  const { data: s } = useQuery({ queryKey: ['admin', 'balances'], queryFn: getBalancesSummary, refetchInterval: 10_000 });

  return (<><div>
    <h2 className="ab-title">Balance Control</h2>
    {s && <div className="ab-grid">
      <div className="ab-stat"><span>Total AUM</span><b>{formatCurrency(s.total_aum)}</b></div>
      <div className="ab-stat"><span>Total Balance</span><b>{formatCurrency(s.total_balance)}</b></div>
      <div className="ab-stat"><span>Total Margin</span><b>{formatCurrency(s.total_margin)}</b></div>
      <div className="ab-stat"><span>Active Accounts</span><b>{s.active_accounts}<small>of {s.total_accounts} total</small></b></div>
      <div className="ab-stat"><span>Pending Withdrawals</span><b style={{color:'var(--accent-warning)'}}>{s.pending_withdrawals}</b></div>
      <div className="ab-stat"><span>Margin Utilization</span><b style={{color:s.margin_utilization_pct>50?'var(--accent-danger)':'var(--accent-success)'}}>{s.margin_utilization_pct?.toFixed(1)}%</b></div>
    </div>}
    <div className="ab-note">Full account-level balance management available in next phase. Summary shows real-time platform metrics.</div>
    <style>{`
.ab-title{font-size:20px;font-weight:700;color:var(--text-primary);margin:0 0 16px}
.ab-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px}
.ab-stat{background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:10px;padding:16px 20px;box-shadow:var(--shadow-sm)}.ab-stat span{display:block;font-size:11px;color:var(--text-secondary);text-transform:uppercase;font-weight:600;margin-bottom:6px}.ab-stat b{font-size:24px;font-weight:700;color:var(--text-primary)}.ab-stat small{display:block;font-size:11px;color:var(--text-tertiary);font-weight:400}
.ab-note{background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px;padding:16px 20px;font-size:13px;color:var(--text-secondary);line-height:1.5}
`}</style></div></>);
}
