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

  return (<><div>
    <div className="at-head"><div><h2>Transaction Oversight</h2><p>{txs.length} transactions</p></div>
      <div className="at-filters">
        <select value={tf} onChange={e=>setTf(e.target.value)}><option value="">All Types</option><option value="deposit">Deposit</option><option value="withdrawal">Withdrawal</option></select>
        <select value={sf} onChange={e=>setSf(e.target.value)}><option value="">All Status</option><option value="pending">Pending</option><option value="completed">Completed</option></select>
        <button onClick={()=>exportCSV()} className="at-export">Export CSV</button>
      </div>
    </div>
    <div className="at-card"><table className="at-table"><thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Fee</th><th>Net</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>
      {txs.map(tx=><tr key={tx.id}>
        <td style={{fontSize:10,color:'var(--text-tertiary)',fontFamily:'monospace'}}>{tx.id.slice(0,8)}...</td>
        <td><span className={`at-tag ${tx.type}`}>{tx.type?.toUpperCase()}</span></td>
        <td style={{fontWeight:600}}>{formatCurrency(tx.amount)}</td><td>{formatCurrency(tx.fee)}</td><td>{formatCurrency(tx.net_amount)}</td>
        <td><span style={{color:tx.status==='completed'?'var(--accent-success)':tx.status==='pending'?'var(--accent-warning)':'var(--accent-danger)',fontSize:11,fontWeight:500}}>{tx.status}</span></td>
        <td style={{fontSize:11,color:'var(--text-tertiary)'}}>{new Date(tx.created_at).toLocaleDateString()}</td>
        <td>{tx.status==='pending'&&tx.type==='withdrawal'&&<div className="at-actions"><button onClick={()=>am.mutate(tx.id)} className="at-ap">Approve</button><button onClick={()=>rm.mutate(tx.id)} className="at-rj">Reject</button></div>}</td>
      </tr>)}
    </tbody></table>{isLoading&&<p className="at-empty">Loading…</p>}{!isLoading&&!txs.length&&<p className="at-empty">No transactions</p>}</div>
  </div>
  <style>{`
.at-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px}.at-head h2{font-size:20px;font-weight:700;color:var(--text-primary);margin:0}.at-head p{font-size:12px;color:var(--text-secondary);margin:2px 0 0}
.at-filters{display:flex;gap:6px;align-items:center}.at-filters select{padding:7px 12px;background:var(--bg-input);border:1px solid var(--border-subtle);border-radius:6px;color:var(--text-primary);font-size:12px;font-family:inherit;outline:none}
.at-export{padding:7px 14px;background:rgba(31,111,235,.08);border:1px solid rgba(31,111,235,.2);border-radius:6px;color:var(--accent-primary);cursor:pointer;font-weight:600;font-size:12px;font-family:inherit}
.at-card{background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:10px;overflow:hidden}
.at-table{width:100%;border-collapse:collapse}.at-table th{padding:12px 16px;text-align:left;font-size:10px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;border-bottom:1px solid var(--border-subtle)}.at-table td{padding:12px 16px;font-size:12px;border-bottom:1px solid var(--border-subtle);color:var(--text-primary)}
.at-tag{padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600}.at-tag.deposit{background:rgba(26,127,55,.1);color:var(--accent-success)}.at-tag.withdrawal{background:rgba(207,34,46,.1);color:var(--accent-danger)}.at-tag.trade_credit,.at-tag.trade_debit{background:var(--bg-tertiary);color:var(--text-secondary)}
.at-actions{display:flex;gap:4px}.at-ap{padding:3px 8px;background:rgba(26,127,55,.08);border:1px solid rgba(26,127,55,.2);border-radius:4px;color:var(--accent-success);font-size:10px;font-weight:600;cursor:pointer}.at-rj{padding:3px 8px;background:rgba(207,34,46,.08);border:1px solid rgba(207,34,46,.2);border-radius:4px;color:var(--accent-danger);font-size:10px;font-weight:600;cursor:pointer}
.at-empty{text-align:center;padding:30px;color:var(--text-tertiary);font-size:12px}
`}</style></>);
}
