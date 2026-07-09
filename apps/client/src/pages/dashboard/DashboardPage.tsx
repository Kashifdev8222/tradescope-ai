import { useQuery } from '@tanstack/react-query';
import { getPortfolioSummary } from '../../api/accounts';
import { getTrades } from '../../api/trades';
import { getAISignals } from '../../api/ai';
import { getNewsFeed } from '../../api/news';
import { formatCurrency, formatPercent, formatPnL } from '@tradescope/shared-utils';
import { useAuthStore } from '../../stores/authStore';
import type { Trade } from '@tradescope/shared-types';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: pf } = useQuery({ queryKey: ['portfolio'], queryFn: getPortfolioSummary, refetchInterval: 10_000 });
  const { data: td } = useQuery({ queryKey: ['trades', 'open'], queryFn: () => getTrades({ status: 'open', limit: 10 }), refetchInterval: 5_000 });
  const { data: sg } = useQuery({ queryKey: ['signals'], queryFn: () => getAISignals({ limit: 8 }), refetchInterval: 8_000 });
  const { data: nw } = useQuery({ queryKey: ['news'], queryFn: () => getNewsFeed(undefined, 6), refetchInterval: 30_000 });
  const trades: Trade[] = td?.data || [];
  const signals: any[] = sg?.data || [];

  // Calculate daily goal (mock: 50% of profit target from AI settings)
  const dailyGoal = 1000;
  const dailyPnL = pf?.daily_pnl || 0;
  const goalProgress = Math.min(100, Math.max(0, (dailyPnL / dailyGoal) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.email?.split('@')[0] || 'Trader'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your trading overview for today</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-green-700 dark:text-green-400">AI Engine Live</span>
        </div>
      </div>

      {/* Stats Row + Daily Goal */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Balance" value={pf ? formatCurrency(pf.total_balance) : '$0.00'} sub="Portfolio value" />
        <StatCard label="Buying Power" value={pf ? formatCurrency(pf.available) : '$0.00'} sub="Available funds" />
        <StatCard label="Daily P/L" value={pf ? formatPnL(pf.daily_pnl).text : '$0.00'} trend={pf ? formatPercent(pf.daily_pnl_pct) : '0%'} up={(pf?.daily_pnl || 0) >= 0} />
        <StatCard label="Open Positions" value={pf ? String(pf.open_positions) : '0'} sub={`${pf ? formatCurrency(pf.invested) : '$0'} invested`} />
        {/* Daily Goal Progress */}
        <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Daily Goal</div>
          <div className="flex items-end gap-2 mt-2 mb-1">
            <span className="text-[28px] font-bold text-gray-900 dark:text-white">{formatCurrency(dailyPnL)}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">/ {formatCurrency(dailyGoal)}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${goalProgress >= 100 ? 'bg-green-500' : goalProgress >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{width:`${goalProgress}%`}} />
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">{goalProgress.toFixed(0)}% of daily target</div>
        </div>
      </div>

      {/* Risk Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: 'Daily Loss Limit', v: '$500.00', c: 'text-red-600 dark:text-red-400' },
          { l: 'Profit Target', v: '$1,000.00', c: 'text-green-600 dark:text-green-400' },
          { l: 'Win Rate', v: '67%', c: 'text-blue-600 dark:text-blue-400' },
          { l: 'Margin Used', v: pf ? formatCurrency(pf.margin_used) : '$0.00', c: 'text-amber-600 dark:text-amber-400' },
        ].map(item => (
          <div key={item.l} className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm text-center">
            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.l}</div>
            <div className={`text-xl font-bold mt-2 ${item.c}`}>{item.v}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* AI Order Board - Entry/Target/Stop levels */}
        <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161B22]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Order Board</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {signals.filter((s:any) => s.action !== 'hold').length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">AI engine scanning markets for entry opportunities</p>
            ) : signals.filter((s:any) => s.action !== 'hold').map((s: any) => (
              <div key={s.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.symbol}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${s.action === 'buy' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>{s.action}</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">{s.confidence}% confidence</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="text-gray-500 dark:text-gray-400">Entry: <b className="text-gray-900 dark:text-white">{s.entry_price || '—'}</b></span>
                  <span className="text-red-500">SL: <b>{s.stop_loss || '—'}</b></span>
                  <span className="text-green-500">TP: <b>{s.take_profit || '—'}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Signal Board */}
        <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161B22]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Signal Board</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {signals.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">AI is monitoring 5 live data sources — no signals yet</p>
            ) : signals.map((s: any) => (
              <div key={s.id} className={`flex items-center justify-between px-5 py-3.5 border-l-[3px] ${s.action === 'buy' ? 'border-l-green-500' : s.action === 'sell' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.symbol}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${s.action === 'buy' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : s.action === 'sell' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{s.action}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{s.confidence}%</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">confidence</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161B22]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Open Positions — Live P&L</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {trades.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">No open positions — place a trade to get started</p>
            ) : trades.map((t: Trade) => {
              const pnl = t.pnl_unrealized || 0;
              const up = pnl >= 0;
              return (
                <div key={t.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{t.symbol}</span>
                    <span className={`text-[11px] font-semibold ml-2 ${t.side === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{t.side?.toUpperCase()} {t.quantity}</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 ml-1">@ {t.entry_price}</span>
                    {t.stop_loss && <span className="text-[10px] text-red-400 ml-2">SL {t.stop_loss}</span>}
                    {t.take_profit && <span className="text-[10px] text-green-400 ml-1">TP {t.take_profit}</span>}
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold font-mono ${up ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{up ? '+' : ''}{formatCurrency(pnl)}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">{t.source === 'ai' ? 'AI Trade' : 'Manual'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market News */}
        <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161B22]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Live News — Reuters · Bloomberg · CNBC</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {(nw || []).map((a: any, i: number) => (
              <div key={i} className="px-5 py-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${a.source === 'Reuters' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : a.source === 'Bloomberg' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>{a.source}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(a.published_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-[13px] text-gray-800 dark:text-gray-200 leading-relaxed">{a.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, trend, up }: { label: string; value: string; sub?: string; trend?: string; up?: boolean }) {
  return (
    <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-[28px] font-bold text-gray-900 dark:text-white mt-2 mb-1">{value}</div>
      {sub && <div className="text-xs text-gray-500 dark:text-gray-400">{sub}</div>}
      {trend && <div className={`text-[13px] font-semibold mt-2 ${up !== false ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{up !== false ? '▲' : '▼'} {trend}</div>}
    </div>
  );
}
