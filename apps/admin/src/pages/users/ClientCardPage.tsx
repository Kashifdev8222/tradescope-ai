import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useState } from 'react';
import { formatCurrency, formatDateTime } from '@tradescope/shared-utils';

export function ClientCardPage({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const { data: client } = useQuery({
    queryKey: ['admin', 'client', clientId],
    queryFn: async () => {
      const [cRes, tRes, aRes] = await Promise.all([
        apiClient.get(`/admin/clients/${clientId}`),
        apiClient.get(`/admin/transactions?userId=${clientId}&limit=10`),
        apiClient.get(`/admin/balances`),
      ]);
      return { ...cRes.data.data, transactions: tRes.data.data || [], accounts: aRes.data.data?.accounts || [] };
    },
  });

  const [tab, setTab] = useState<'profile'|'trading'|'transactions'>('profile');
  if (!client) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[1000] flex items-start justify-center p-4 pt-10 overflow-y-auto" onClick={onClose}>
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{client.first_name} {client.last_name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${client.status==='client'?'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400':'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>{client.status}</span>
              <span className="text-xs text-gray-400">{client.email}</span>
              <span className="text-xs text-gray-400">{client.phone}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-6">
          {[{k:'profile' as const,l:'Profile'},{k:'trading' as const,l:'Trading'},{k:'transactions' as const,l:'Transactions'}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${tab===t.k?'border-blue-600 text-gray-900 dark:text-white':'border-transparent text-gray-400'}`}>{t.l}</button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {tab === 'profile' && (
            <div className="space-y-5">
              {/* Facts */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Facts</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[['Created',formatDateTime(client.created_at)],['FTD Date',client.ftd_date?formatDateTime(client.ftd_date):'—'],['Country',client.country||'—'],['Timezone',client.timezone||'—'],['Source',client.source||'—'],['Language',client.preferred_language||'en']].map(([l,v])=><div key={l} className="bg-gray-50 dark:bg-[#161B22] rounded-xl p-3"><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{l}</div><div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{v}</div></div>)}
                </div>
              </div>

              {/* Qualification */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Qualification</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[['Age',client.age||'—'],['Occupation',client.occupation||'—'],['Experience',client.trading_experience||'—'],['Annual Income',client.annual_income?formatCurrency(client.annual_income):'—'],['Savings',client.savings?formatCurrency(client.savings):'—'],['Retirement',client.retirement_fund?formatCurrency(client.retirement_fund):'—'],['Risk Tolerance',client.risk_tolerance||'—']].map(([l,v])=><div key={l} className="bg-gray-50 dark:bg-[#161B22] rounded-xl p-3"><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{l}</div><div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{v}</div></div>)}
                </div>
              </div>

              {/* Notes & Tags */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Notes & Tags</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#161B22] rounded-xl p-4 min-h-[60px]">{client.notes || 'No notes'}</p>
                <div className="flex gap-2 mt-2 flex-wrap">{(client.tags||[]).map((t:string)=><span key={t} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-[10px] font-semibold">{t}</span>)}</div>
              </div>
            </div>
          )}

          {tab === 'trading' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[['Open Positions',client.accounts?.[0]?.open_positions||'0'],['Balance',formatCurrency(client.accounts?.[0]?.balance||0)],['Equity',formatCurrency(client.accounts?.[0]?.equity||0)],['Win Rate','—'],['Total Trades','—']].map(([l,v])=><div key={l} className="bg-gray-50 dark:bg-[#161B22] rounded-xl p-4 text-center"><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{l}</div><div className="text-xl font-bold text-gray-900 dark:text-white mt-2">{v}</div></div>)}
              </div>
            </div>
          )}

          {tab === 'transactions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs"><thead><tr className="border-b border-gray-100 dark:border-gray-800">{['Type','Amount','Status','Date'].map(h=><th key={h} className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>{(client.transactions||[]).map((tx:any)=><tr key={tx.id} className="border-b border-gray-50 dark:border-gray-800/50">
                <td className="px-4 py-2 whitespace-nowrap"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tx.type==='deposit'?'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400':'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>{tx.type}</span></td>
                <td className="px-4 py-2 whitespace-nowrap font-semibold font-mono">{formatCurrency(tx.amount)}</td>
                <td className="px-4 py-2 whitespace-nowrap"><span className={`text-[10px] font-semibold ${tx.status==='completed'?'text-green-600':'text-amber-600'}`}>{tx.status}</span></td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-400 text-[11px]">{formatDateTime(tx.created_at)}</td>
              </tr>)}</tbody></table>
              {(!client.transactions||!client.transactions.length)&&<div className="text-center py-6 text-xs text-gray-400">No transactions</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
