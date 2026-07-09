import { useQuery } from '@tanstack/react-query';
import { getBalancesSummary } from '../../api/admin';
import { formatCurrency } from '@tradescope/shared-utils';

export function BalancesPage() {
  const { data: s } = useQuery({ queryKey: ['admin', 'balances'], queryFn: getBalancesSummary, refetchInterval: 10_000 });

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">Balance Control</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Platform-wide financial overview</p></div>

      {s && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total AUM</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(s.total_aum)}</div>
          </div>
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Balance</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(s.total_balance)}</div>
          </div>
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Margin</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(s.total_margin)}</div>
          </div>
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Accounts</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{s.active_accounts}<span className="text-sm text-gray-400 font-normal ml-1">/ {s.total_accounts}</span></div>
          </div>
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending Withdrawals</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{s.pending_withdrawals}</div>
          </div>
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Margin Utilization</div>
            <div className={`text-2xl font-bold mt-2 ${s.margin_utilization_pct > 50 ? 'text-red-600' : 'text-green-600'}`}>{s.margin_utilization_pct?.toFixed(1)}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
