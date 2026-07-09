import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllSettings, updateSetting } from '../../api/admin';
import { useState, useEffect } from 'react';

export function SettingsPage() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ['admin', 'settings'], queryFn: getAllSettings });
  const [cr, setCr] = useState(0.001); const [wf, setWf] = useState(25); const [os, setOs] = useState(0.0002); const [md, setMd] = useState(50); const [ml, setMl] = useState(100);
  useEffect(() => { if (settings) { const f = settings.find((s: any) => s.key === 'fees'); const l = settings.find((s: any) => s.key === 'leverage_defaults'); const d = settings.find((s: any) => s.key === 'minimum_deposit'); if (f?.value) { setCr(f.value.commission_rate || 0.001); setWf(f.value.withdrawal_fee_flat || 25); setOs(f.value.overnight_swap || 0.0002); } if (l?.value) setMl(l.value.max || 100); if (d?.value) setMd(d.value.USD || 50); } }, [settings]);
  const um = useMutation({ mutationFn: ({ key, value }: { key: string; value: any }) => updateSetting(key, value), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settings'] }) });

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">Platform Settings</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure fees, leverage, and platform parameters</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Fees */}
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Fee Structure</h3>
        <div className="space-y-4">
          <div><label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Commission Rate</label><div className="flex items-center gap-2 mt-1.5"><input type="number" step="0.001" value={cr} onChange={e=>setCr(+e.target.value)} className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /><span className="text-xs text-gray-400">{(cr*100).toFixed(1)}%</span></div></div>
          <div><label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Withdrawal Fee (Flat USD)</label><input type="number" value={wf} onChange={e=>setWf(+e.target.value)} className="w-full mt-1.5 px-3 py-2.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>
          <div><label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overnight Swap Rate</label><div className="flex items-center gap-2 mt-1.5"><input type="number" step="0.0001" value={os} onChange={e=>setOs(+e.target.value)} className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /><span className="text-xs text-gray-400">{(os*100).toFixed(2)}%</span></div></div>
          <button onClick={()=>um.mutate({key:'fees',value:{commission_rate:cr,withdrawal_fee_flat:wf,withdrawal_fee_pct:0,overnight_swap:os}})} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">Save Fees</button>
        </div>
      </div>

      {/* Leverage */}
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Leverage</h3>
        <div className="mb-4"><label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Maximum Leverage: 1:{ml}</label><input type="range" min={1} max={200} value={ml} onChange={e=>setMl(+e.target.value)} className="w-full mt-2 accent-blue-600" /></div>
        <button onClick={()=>um.mutate({key:'leverage_defaults',value:{max:ml,default:1,options:[1,5,10,20,30,50,100]}})} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">Save Leverage</button>
      </div>

      {/* Minimum Deposit */}
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Minimum Deposit</h3>
        <div className="mb-4"><label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">USD Minimum</label><div className="flex items-center gap-2 mt-1.5"><span className="text-gray-400">$</span><input type="number" value={md} onChange={e=>setMd(+e.target.value)} className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div></div>
        <button onClick={()=>um.mutate({key:'minimum_deposit',value:{USD:md,BTC:0.001,ETH:0.01}})} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">Save Minimum</button>
      </div>

      {um.isSuccess && <p className="text-center text-sm text-green-600">✓ Settings updated successfully</p>}
      </div>
    </div>
  );
}
