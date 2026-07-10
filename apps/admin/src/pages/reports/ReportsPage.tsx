import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { formatCurrency } from '@tradescope/shared-utils';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'funnel' | 'kpi'>('funnel');

  const { data: funnel } = useQuery({
    queryKey: ['admin', 'reports', 'funnel'],
    queryFn: async () => { const r = await apiClient.get('/admin/reports/funnel'); return r.data.data; },
    refetchInterval: 30_000,
  });

  const { data: kpi } = useQuery({
    queryKey: ['admin', 'reports', 'kpi'],
    queryFn: async () => { const r = await apiClient.get('/admin/reports/kpi'); return r.data.data; },
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Conversion funnel, KPIs, and platform metrics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'funnel' as const, label: 'Conversion Funnel' },
          { key: 'kpi' as const, label: 'KPI Dashboard' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${activeTab === tab.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#1C2128] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Funnel Report */}
      {activeTab === 'funnel' && funnel && (
        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'Leads', value: funnel.summary.total_leads, color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Clients', value: funnel.summary.total_clients, color: 'text-green-600 dark:text-green-400' },
              { label: 'Inactive', value: funnel.summary.inactive, color: 'text-gray-600 dark:text-gray-400' },
              { label: 'Blocked', value: funnel.summary.blocked, color: 'text-red-600 dark:text-red-400' },
              { label: 'Conversion Rate', value: `${funnel.summary.conversion_rate}%`, color: 'text-purple-600 dark:text-purple-400' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Funnel Visualization */}
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Pipeline Funnel</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Shows drop-off from leads → clients → inactive</p>
            <div className="space-y-3 max-w-xl mx-auto">
              {[
                { label: 'Leads', value: funnel.summary.total_leads, width: '100%', color: 'bg-blue-500' },
                { label: 'Converted Clients', value: funnel.summary.total_clients, width: `${Math.min(100, (funnel.summary.total_clients / Math.max(1, funnel.summary.total_leads)) * 100)}%`, color: 'bg-green-500' },
                { label: 'Inactive', value: funnel.summary.inactive, width: `${Math.min(100, (funnel.summary.inactive / Math.max(1, funnel.summary.total_clients)) * 100)}%`, color: 'bg-gray-400' },
                { label: 'Blocked', value: funnel.summary.blocked, width: `${Math.min(100, (funnel.summary.blocked / Math.max(1, funnel.summary.total_leads)) * 100)}%`, color: 'bg-red-400' },
              ].map(level => (
                <div key={level.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">{level.label}</span>
                    <span className="text-[12px] font-bold text-gray-900 dark:text-white">{level.value}</span>
                  </div>
                  <div className="w-full h-7 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <div className={`h-full rounded-lg transition-all duration-700 ${level.color}`} style={{ width: level.width }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Monthly Conversion Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnel.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D22" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8B949E' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8B949E' }} />
                <Tooltip
                  contentStyle={{ background: '#1C2128', border: '1px solid #30363D', borderRadius: '12px', color: '#E6EDF3', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="leads" fill="#3B82F6" name="Leads" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clients" fill="#22C55E" name="Clients" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Rate Trend */}
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Conversion Rate %</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={funnel.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D22" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8B949E' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8B949E' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#1C2128', border: '1px solid #30363D', borderRadius: '12px', color: '#E6EDF3', fontSize: '12px' }}
                  formatter={(value: number) => [`${value}%`, 'Conversion Rate']}
                />
                <Line type="monotone" dataKey="conversion" stroke="#A855F7" strokeWidth={3} dot={{ r: 5, fill: '#A855F7' }} name="Conversion %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* KPI Dashboard */}
      {activeTab === 'kpi' && kpi && (
        <div className="space-y-5">
          {/* Users Section */}
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">👥 Users</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-[#161B22] rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.users.total}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Total</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-500/5 rounded-xl">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{kpi.users.active}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Active</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-500/5 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{kpi.users.ai_enabled}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">AI Enabled</div>
              </div>
            </div>
          </div>

          {/* Financial Section */}
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">💰 Financial</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-500/5 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(kpi.financial.total_aum)}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Total AUM</div>
              </div>
              <div className="text-center p-4 bg-amber-50 dark:bg-amber-500/5 rounded-xl">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(kpi.financial.total_margin)}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Margin Used</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-500/5 rounded-xl">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{kpi.financial.pending_withdrawals}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Pending Withdrawals</div>
              </div>
            </div>
          </div>

          {/* Trading Section */}
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">📈 Trading Activity</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-[#161B22] rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.trading.today_trades}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Trades Today</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-[#161B22] rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.trading.month_trades}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Trades This Month</div>
              </div>
            </div>

            {/* Top Traders */}
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Top Traders by Profit</h4>
            <div className="space-y-2">
              {(kpi.top_traders || []).map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#161B22] rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${i < 3 ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                      {i + 1}
                    </span>
                    <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{t.trader_id}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] text-gray-500 dark:text-gray-400">Win: {t.win_rate}%</span>
                    <span className={`text-[13px] font-semibold font-mono ${Number(t.total_profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(t.total_profit) >= 0 ? '+' : ''}{formatCurrency(t.total_profit)}
                    </span>
                  </div>
                </div>
              ))}
              {(!kpi.top_traders || kpi.top_traders.length === 0) && (
                <p className="text-center text-xs text-gray-400 py-4">No trader data available yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!funnel && !kpi && (
        <div className="text-center py-16 text-sm text-gray-400">Loading reports…</div>
      )}
    </div>
  );
}
