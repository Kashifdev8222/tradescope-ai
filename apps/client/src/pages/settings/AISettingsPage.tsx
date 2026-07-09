import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAISettings, updateAISettings } from '../../api/ai';
import { useState, useEffect } from 'react';

export function AISettingsPage() {
  const qc = useQueryClient();
  const { data: s } = useQuery({ queryKey: ['aiSettings'], queryFn: getAISettings });
  const [rl,setRl]=useState('moderate');const [mt,setMt]=useState(10);const [ps,setPs]=useState(10);const [dl,setDl]=useState(500);const [pt,setPt]=useState(1000);const [sl,setSl]=useState(2);const [tp,setTp]=useState(5);
  useEffect(()=>{if(s){setRl(s.risk_level);setMt(s.max_daily_trades);setPs(s.max_position_size);setDl(s.daily_loss_limit);setPt(s.daily_profit_target);setSl(s.stop_loss_pct);setTp(s.take_profit_pct);}},[s]);
  const m=useMutation({mutationFn:()=>updateAISettings({risk_level:rl as any,max_daily_trades:mt,max_position_size:ps,daily_loss_limit:dl,daily_profit_target:pt,stop_loss_pct:sl,take_profit_pct:tp}),onSuccess:()=>qc.invalidateQueries({queryKey:['aiSettings']})});

  return (<>
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Trading Settings</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure your AI trading parameters</p></div>

      {/* Risk Level */}
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Risk Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[{v:'conservative',l:'Conservative',c:'#059669',d:'Low risk, steady returns'},{v:'moderate',l:'Moderate',c:'#D97706',d:'Balanced risk/reward'},{v:'aggressive',l:'Aggressive',c:'#DC2626',d:'High risk, high potential'}].map(lv=>(
            <button key={lv.v} onClick={()=>setRl(lv.v)} className={`p-4 rounded-xl border-2 text-center transition-all ${rl===lv.v?'bg-white dark:bg-[#0D1117] shadow-sm':'bg-gray-50 dark:bg-[#161B22] border-transparent hover:border-gray-300'}`} style={{borderColor:rl===lv.v?lv.c:'transparent'}}>
              <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{background:lv.c}}/>
              <div className="text-sm font-bold text-gray-900 dark:text-white">{lv.l}</div>
              <div className="text-[10px] text-gray-400 mt-1">{lv.d}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Trade Limits */}
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Trade Limits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Max Daily Trades: {mt}</label><input type="range" min={1} max={50} value={mt} onChange={e=>setMt(+e.target.value)} className="w-full mt-2 accent-blue-600" /><div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>1</span><span>50</span></div></div>
          <div><label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Max Position Size: {ps}%</label><input type="range" min={1} max={100} value={ps} onChange={e=>setPs(+e.target.value)} className="w-full mt-2 accent-blue-600" /><div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>1%</span><span>100%</span></div></div>
        </div>
      </div>

      {/* Risk Management */}
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Risk Management</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Daily Loss Limit</label><div className="flex items-center mt-2"><span className="text-gray-400 mr-2">$</span><input type="number" value={dl} onChange={e=>setDl(+e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm font-sans outline-none focus:border-blue-500" /></div></div>
          <div><label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Daily Profit Target</label><div className="flex items-center mt-2"><span className="text-gray-400 mr-2">$</span><input type="number" value={pt} onChange={e=>setPt(+e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm font-sans outline-none focus:border-blue-500" /></div></div>
          <div><label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Stop Loss: {sl}%</label><input type="range" min={0.5} max={20} step={0.5} value={sl} onChange={e=>setSl(+e.target.value)} className="w-full mt-2 accent-red-500" /></div>
          <div><label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Take Profit: {tp}%</label><input type="range" min={1} max={50} step={0.5} value={tp} onChange={e=>setTp(+e.target.value)} className="w-full mt-2 accent-green-500" /></div>
        </div>
      </div>

      <button onClick={()=>m.mutate()} disabled={m.isPending} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
        {m.isPending?'Saving...':'Save AI Settings'}
      </button>
      {m.isSuccess&&<p className="text-center text-sm text-green-600">✓ Settings saved successfully</p>}
    </div>
  </>);
}
