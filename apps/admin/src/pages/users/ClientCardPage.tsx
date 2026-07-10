import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useState } from 'react';
import { formatCurrency, formatDateTime } from '@tradescope/shared-utils';

export function ClientCardPage({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const { data: client } = useQuery({
    queryKey: ['admin', 'client', clientId],
    queryFn: async () => {
      const [cRes, tRes, aRes, kycRes] = await Promise.all([
        apiClient.get(`/admin/clients/${clientId}`),
        apiClient.get(`/admin/transactions?userId=${clientId}&limit=10`),
        apiClient.get(`/admin/balances`),
        apiClient.get(`/kyc/all`),
      ]);
      const kycDocs = (kycRes.data.data || []).filter((d: any) => d.user_id === clientId);
      return { ...cRes.data.data, transactions: tRes.data.data || [], accounts: aRes.data.data?.accounts || [], kyc_documents: kycDocs };
    },
  });

  const [tab, setTab] = useState<'profile'|'trading'|'transactions'|'kyc'>('profile');
  if (!client) return null;

  const DOC_LABELS: Record<string, string> = {
    id_front: 'ID Front', id_back: 'ID Back', passport: 'Passport', utility_bill: 'Utility Bill',
    bank_statement: 'Bank Statement', source_of_funds: 'Source of Funds', selfie: 'Selfie', other: 'Other',
  };

  const phones = [
    { number: client.phone, type: 'mobile', is_primary: true },
  ].filter(p => p.number);

  return (
    <div className="fixed inset-0 bg-black/40 z-[1000] flex items-start justify-center p-4 pt-10 overflow-y-auto" onClick={onClose}>
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{client.first_name} {client.last_name}</h3>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${client.status==='client'?'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400':'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>{client.status}</span>
              <span className="text-xs text-gray-400">{client.email}</span>
              <span className="text-xs text-gray-400">{client.phone}</span>
            </div>
            {/* Flags */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {client.do_not_call && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200">Do Not Call</span>}
              {client.high_risk && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-200">High Risk</span>}
              {client.complaint_filed && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200">Complaint</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Communication Buttons */}
            <a href={`/admin/call`} className="p-2 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100 dark:hover:bg-green-500/20 transition-all" title="Web Call">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </a>
            <a href={`tel:${client.phone}`} className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all" title="Phone">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </a>
            <a href="#" className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all" title="WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </a>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 ml-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-6">
          {[
            {k:'profile' as const,l:'Profile'},
            {k:'trading' as const,l:'Trading'},
            {k:'transactions' as const,l:'Transactions'},
            {k:'kyc' as const,l:'KYC'},
          ].map(t=>(
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

              {/* Phones Directory */}
              {phones.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">📱 Phones</h4>
                  <div className="space-y-2">
                    {phones.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#161B22] rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{p.type === 'mobile' ? '📱' : p.type === 'home' ? '🏠' : p.type === 'work' ? '🏢' : '📞'}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{p.number}</span>
                          <span className="text-[10px] text-gray-400 uppercase">{p.type}</span>
                          {p.is_primary && <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-[10px] font-semibold text-blue-600">Primary</span>}
                        </div>
                        <a href={`tel:${p.number}`} className="text-blue-500 hover:text-blue-600 text-xs font-semibold">Call →</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Qualification */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Qualification</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[['Age',client.age||'—'],['Occupation',client.occupation||'—'],['Experience',client.trading_experience||'—'],['Annual Income',client.annual_income?formatCurrency(client.annual_income):'—'],['Savings',client.savings?formatCurrency(client.savings):'—'],['Retirement',client.retirement_fund?formatCurrency(client.retirement_fund):'—'],['Risk Tolerance',client.risk_tolerance||'—']].map(([l,v])=><div key={l} className="bg-gray-50 dark:bg-[#161B22] rounded-xl p-3"><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{l}</div><div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{v}</div></div>)}
                </div>
              </div>

              {/* Consent */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Consent & Compliance</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-[#161B22] rounded-xl p-3">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Marketing Consent</div>
                    <div className={`text-sm font-semibold mt-0.5 ${client.marketing_consent ? 'text-green-600' : 'text-red-500'}`}>
                      {client.marketing_consent ? '✓ Granted' : '✗ Not Granted'}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#161B22] rounded-xl p-3">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Terms Accepted</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{client.terms_accepted_at ? formatDateTime(client.terms_accepted_at) : '—'}</div>
                  </div>
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

          {tab === 'kyc' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">KYC Documents</h4>
              {(client.kyc_documents || []).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-[#161B22] rounded-xl">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm text-gray-500">No KYC documents submitted</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(client.kyc_documents || []).map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#161B22] rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{d.doc_type === 'passport' ? '📘' : d.doc_type === 'selfie' ? '📸' : '🪪'}</span>
                        <div>
                          <div className="text-[13px] font-semibold text-gray-900 dark:text-white">{DOC_LABELS[d.doc_type] || d.doc_type}</div>
                          <div className="text-[10px] text-gray-400">{d.file_name} · {(d.file_size / 1024).toFixed(0)}KB · {formatDateTime(d.created_at)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${d.status==='approved'?'bg-green-50 dark:bg-green-500/10 text-green-600':d.status==='rejected'?'bg-red-50 dark:bg-red-500/10 text-red-600':'bg-amber-50 dark:bg-amber-500/10 text-amber-600'}`}>{d.status}</span>
                        {d.file_data && (
                          <a href={d.file_data?.startsWith('data:') ? d.file_data : `data:image/jpeg;base64,${d.file_data}`} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600">View</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
