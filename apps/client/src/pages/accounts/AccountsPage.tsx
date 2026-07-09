import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccounts } from '../../api/accounts';
import { getTransactions, createDeposit, createWithdrawal } from '../../api/transactions';
import { formatCurrency } from '@tradescope/shared-utils';
import type { TradingAccount, Transaction } from '@tradescope/shared-types';

export function AccountsPage() {
  const [sel,setSel]=useState('');const [modal,setModal]=useState('');const [amt,setAmt]=useState('');const [dest,setDest]=useState('');const qc=useQueryClient();
  const {data:accs}=useQuery({queryKey:['accounts'],queryFn:getAccounts});
  const {data:txData}=useQuery({queryKey:['transactions'],queryFn:()=>getTransactions({limit:30})});
  const dm=useMutation({mutationFn:()=>createDeposit({account_id:sel,amount:parseFloat(amt)}),onSuccess:()=>{qc.invalidateQueries({queryKey:['accounts']});qc.invalidateQueries({queryKey:['transactions']});setModal('');setAmt('');}});
  const wm=useMutation({mutationFn:()=>createWithdrawal({account_id:sel,amount:parseFloat(amt),destination:dest}),onSuccess:()=>{qc.invalidateQueries({queryKey:['accounts']});qc.invalidateQueries({queryKey:['transactions']});setModal('');setAmt('');setDest('');}});
  const txs:Transaction[]=txData?.data||[];

  return (<>
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Management</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage your trading accounts and funds</p></div>

      {/* Account Cards */}
      <div className="space-y-4">
        {(accs||[]).map((a:TradingAccount)=><div key={a.id} onClick={()=>setSel(a.id)} className={`bg-white dark:bg-[#1C2128] border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-md w-full ${sel===a.id?'border-blue-500 shadow-md':'border-gray-200 dark:border-gray-800 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{a.account_name}</h3>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded mt-1 inline-block ${a.account_type==='live'?'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400':'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>{a.account_type}</span>
            </div>
            <span className={`text-[11px] font-semibold flex items-center gap-1.5 ${a.is_active?'text-green-600':'text-red-600'}`}><span className={`w-1.5 h-1.5 rounded-full ${a.is_active?'bg-green-500':'bg-red-500'}`}/>{a.is_active?'Active':'Inactive'}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="space-y-3">
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3"><span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</span><p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{formatCurrency(a.balance)}</p></div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3"><span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leverage</span><p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">1:{a.leverage_default}</p></div>
              <button onClick={e=>{e.stopPropagation();setSel(a.id);setModal('deposit');}} className="w-full py-2.5 rounded-xl text-xs font-semibold bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 hover:bg-green-100 dark:hover:bg-green-500/20 transition-all">Deposit</button>
            </div>
            <div className="space-y-3">
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3"><span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Equity</span><p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{formatCurrency(a.equity)}</p></div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3"><span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Currency</span><p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{a.currency}</p></div>
              <button onClick={e=>{e.stopPropagation();setSel(a.id);setModal('withdraw');}} className="w-full py-2.5 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">Withdraw</button>
            </div>
          </div>
        </div>)}
        {(accs||[]).length===0&&<div className="w-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1C2128] rounded-2xl border border-gray-200 dark:border-gray-800">No trading accounts yet</div>}
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161B22]"><h3 className="text-sm font-semibold text-gray-900 dark:text-white">Transaction History</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-gray-100 dark:border-gray-800">{['Type','Amount','Fee','Net','Status','Date'].map(h=><th key={h} className="px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {txs.map(tx=><tr key={tx.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#161B22]">
                <td className="px-5 py-3"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${tx.type==='deposit'?'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400':tx.type==='withdrawal'?'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400':'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{tx.type}</span></td>
                <td className={`px-5 py-3 font-semibold font-mono ${tx.type==='deposit'?'text-green-600':'text-red-600'}`}>{tx.type==='deposit'?'+':'-'}{formatCurrency(Math.abs(tx.amount))}</td>
                <td className="px-5 py-3 text-gray-500">{formatCurrency(tx.fee)}</td>
                <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white">{formatCurrency(tx.net_amount)}</td>
                <td className="px-5 py-3"><span className={`text-[10px] font-semibold ${tx.status==='completed'?'text-green-600':tx.status==='pending'?'text-amber-600':'text-red-600'}`}>{tx.status}</span></td>
                <td className="px-5 py-3 text-gray-400 text-[11px]">{new Date(tx.created_at).toLocaleDateString()}</td>
              </tr>)}
            </tbody>
          </table>
          {txs.length===0&&<div className="text-center py-10 text-xs text-gray-400">No transactions yet</div>}
        </div>
      </div>
    </div>

    {/* Modal */}
    {modal&&<div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4" onClick={()=>setModal('')}><div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-[380px] w-full shadow-2xl" onClick={e=>e.stopPropagation()}>
      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">{modal==='deposit'?'Deposit Funds':'Withdraw Funds'}</h4>
      <div className="mb-4"><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Amount (USD)</label><input type="number" value={amt} onChange={e=>setAmt(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm font-sans outline-none focus:border-blue-500" /></div>
      {modal==='withdraw'&&<div className="mb-4"><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Destination</label><input type="text" value={dest} onChange={e=>setDest(e.target.value)} placeholder="Bank account / wallet address" className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm font-sans outline-none focus:border-blue-500" /></div>}
      <div className="flex gap-2"><button onClick={()=>setModal('')} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500">Cancel</button><button onClick={()=>modal==='deposit'?dm.mutate():wm.mutate()} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700">{modal==='deposit'?'Deposit':'Withdraw'}</button></div>
    </div></div>}
  </>);
}
