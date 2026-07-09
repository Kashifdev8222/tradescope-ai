import { useQuery } from '@tanstack/react-query';
import { getLeaderboard, getActivityFeed } from '../../api/leaderboard';
import { formatCurrency, formatPercent } from '@tradescope/shared-utils';
import type { LeaderboardEntry, TraderActivity } from '@tradescope/shared-types';

export function LiveTradersPage() {
  const { data: lb } = useQuery({ queryKey: ['leaderboard'], queryFn: () => getLeaderboard({ sortBy: 'profit', limit: 20 }), refetchInterval: 5_000 });
  const { data: acts } = useQuery({ queryKey: ['activity'], queryFn: () => getActivityFeed(30), refetchInterval: 3_000 });
  const entries: LeaderboardEntry[] = lb?.data || [];

  return (<>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Traders</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Anonymous real-time leaderboard of AI-powered traders</p></div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/><span className="text-xs font-semibold text-red-700 dark:text-red-400">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Leaderboard */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161B22]"><h3 className="text-sm font-semibold text-gray-900 dark:text-white">Leaderboard</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead><tr className="border-b border-gray-100 dark:border-gray-800">{['#','Trader','Win Rate','Trades','Profit','Streak'].map(h=><th key={h} className="px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody>
                {entries.map((e,i)=><tr key={e.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#161B22]">
                  <td className="px-5 py-3"><span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-[11px] font-bold ${i<3?'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400':'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{i+1}</span></td>
                  <td className="px-5 py-3 font-semibold text-purple-600 dark:text-purple-400">{e.trader_id}</td>
                  <td className={`px-5 py-3 font-semibold ${Number(e.win_rate)>=50?'text-green-600':'text-red-600'}`}>{formatPercent(e.win_rate,1)}</td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{e.total_trades}</td>
                  <td className={`px-5 py-3 font-semibold font-mono ${Number(e.total_profit)>=0?'text-green-600':'text-red-600'}`}>{Number(e.total_profit)>=0?'+':''}{formatCurrency(e.total_profit)}</td>
                  <td className={`px-5 py-3 font-semibold ${e.current_streak>0?'text-green-600':e.current_streak<0?'text-red-600':'text-gray-400'}`}>{e.current_streak>0?`🔥 ${e.current_streak}`:e.current_streak<0?`❄️ ${Math.abs(e.current_streak)}`:'—'}</td>
                </tr>)}
              </tbody>
            </table>
            {!entries.length&&<div className="text-center py-14 text-sm text-gray-400">No traders on the leaderboard yet</div>}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161B22]"><h3 className="text-sm font-semibold text-gray-900 dark:text-white">Live Activity</h3></div>
          <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-gray-50 dark:divide-gray-800/50">
            {(acts||[]).map((a:TraderActivity)=><div key={a.id} className="flex items-center gap-3 px-5 py-3">
              <span className="text-base shrink-0">{a.action==='buy'?'📈':a.action==='sell'?'📉':a.action==='profit'?'✅':'❌'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-gray-900 dark:text-white">{a.symbol} <span className="text-[11px] text-gray-400 font-normal">{a.action} {a.quantity?`${a.quantity} @ ${a.price}`:''}</span></div>
              </div>
              {a.pnl!==null&&<span className={`text-xs font-semibold font-mono shrink-0 ${(a.pnl||0)>=0?'text-green-600':'text-red-600'}`}>{(a.pnl||0)>=0?'+':''}{formatCurrency(a.pnl||0)}</span>}
            </div>)}
            {(!acts||!acts.length)&&<div className="text-center py-10 text-xs text-gray-400">Waiting for live activity...</div>}
          </div>
        </div>
      </div>
    </div>
  </>);
}
