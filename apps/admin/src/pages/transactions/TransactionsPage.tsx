import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAllTransactions, approveTransaction, rejectTransaction, exportCSV } from '../../api/admin';
import { formatCurrency } from '@tradescope/shared-utils';
import { useState } from 'react';
import type { Transaction } from '@tradescope/shared-types';

export function TransactionsPage() {
  const [tf,setTf]=useState('');const [sf,setSf]=useState('');const qc=useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'tx', tf, sf], queryFn: () => listAllTransactions({ type: tf, status: sf, limit: 50 }), refetchInterval: 5_000 });
  const txs: Transaction[] = data?.data || [];
  const am = useMutation({ mutationFn: approveTransaction, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tx'] }) });
  const rm = useMutation({ mutationFn: rejectTransaction, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tx'] }) });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Oversight</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{txs.length} transactions</p></div>
        <div className="flex gap-2 flex-wrap">
          <select value={tf} onChange={e=>setTf(e.target.value)} className="px-3 py-2 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none font-sans"><option value="">All Types</option><option value="deposit">Deposit</option><option value="withdrawal">Withdrawal</option><option value="adjustment">Adjustment</option></select>
          <select value={sf} onChange={e=>setSf(e.target.value)} className="px-3 py-2 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none font-sans"><option value="">All Status</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="failed">Failed</option></select>
          <button onClick={()=>exportCSV()} className="px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all">Export CSV</button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-gray-100 dark:border-gray-800">{['ID','Type','Amount','Fee','Net','Status','Date','Actions'].map(h=><th key={h} className="px-5 py-3 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {txs.map(tx=><tr key={tx.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#161B22]">
                <td className="px-5 py-3 text-gray-400 font-mono text-[11px]">{tx.id.slice(0,8)}...</td>
                <td className="px-5 py-3"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${tx.type==='deposit'?'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400':tx.type==='withdrawal'?'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400':tx.type==='adjustment'?'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400':'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{tx.type}</span></td>
                <td className="px-5 py-3 font-semibold font-mono text-gray-900 dark:text-white">{formatCurrency(tx.amount)}</td>
                <td className="px-5 py-3 text-gray-500">{formatCurrency(tx.fee)}</td>
                <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white">{formatCurrency(tx.net_amount)}</td>
                <td className="px-5 py-3"><span className={`text-[10px] font-semibold ${tx.status==='completed'?'text-green-600':tx.status==='pending'?'text-amber-600':'text-red-600'}`}>{tx.status}</span></td>
                <td className="px-5 py-3 text-gray-400 text-[11px]">{new Date(tx.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  {tx.status==='pending' && tx.type==='withdrawal' && <div className="flex gap-1.5">
                    <button onClick={()=>am.mutate(tx.id)} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-green-50 dark:bg-green-500/10 text-green-600 border border-green-200 dark:border-green-500/20">Approve</button>
                    <button onClick={()=>rm.mutate(tx.id)} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200 dark:border-red-500/20">Reject</button>
                  </div>}
                </td>
              </tr>)}
            </tbody>
          </table>
          {isLoading && <div className="text-center py-10 text-xs text-gray-400">Loading...</div>}
          {!isLoading && !txs.length && <div className="text-center py-10 text-xs text-gray-400">No transactions found</div>}
        </div>
      </div>
    </div>
  );
}
