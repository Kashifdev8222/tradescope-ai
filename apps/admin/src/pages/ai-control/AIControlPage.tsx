import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAIParams, updateAIParams, emergencyStop, emergencyResume, getAIStats, listAIOverrides, setAIOverride, removeAIOverride, listUsersSimple } from '../../api/admin';
import { useState, useEffect } from 'react';

export function AIControlPage() {
  const qc=useQueryClient();
  const {data:p}=useQuery({queryKey:['admin','aiParams'],queryFn:getAIParams});
  const {data:st}=useQuery({queryKey:['admin','aiStats'],queryFn:getAIStats,refetchInterval:10_000});
  const {data:overrides=[]}=useQuery({queryKey:['admin','aiOverrides'],queryFn:listAIOverrides});
  const {data:users=[]}=useQuery({queryKey:['admin','usersSimple'],queryFn:listUsersSimple});

  const [ps,setPs]=useState(25);const [dt,setDt]=useState(100);const [sl,setSl]=useState(2);const [tp,setTp]=useState(5);
  const [selUser,setSelUser]=useState('');const [oPs,setOPs]=useState('');const [oDt,setODt]=useState('');const [oSl,setOSl]=useState('');const [oTp,setOTp]=useState('');
  useEffect(()=>{if(p){setPs(p.max_position_size_pct||25);setDt(p.max_daily_trades_global||100);setSl(p.default_stop_loss_pct||2);setTp(p.default_take_profit_pct||5);}},[p]);

  const um=useMutation({mutationFn:()=>updateAIParams({max_position_size_pct:ps,max_daily_trades_global:dt,default_stop_loss_pct:sl,default_take_profit_pct:tp}),onSuccess:()=>qc.invalidateQueries({queryKey:['admin','aiParams']})});
  const stop=useMutation({mutationFn:emergencyStop,onSuccess:()=>qc.invalidateQueries({queryKey:['admin','aiParams']})});
  const resume=useMutation({mutationFn:emergencyResume,onSuccess:()=>qc.invalidateQueries({queryKey:['admin','aiParams']})});
  const ovm=useMutation({mutationFn:()=>setAIOverride(selUser,{max_position_size:oPs?+oPs:null,max_daily_trades:oDt?+oDt:null,stop_loss_pct:oSl?+oSl:null,take_profit_pct:oTp?+oTp:null}),onSuccess:()=>{qc.invalidateQueries({queryKey:['admin','aiOverrides']});setSelUser('');setOPs('');setODt('');setOSl('');setOTp('');}});
  const rmv=useMutation({mutationFn:(uid:string)=>removeAIOverride(uid),onSuccess:()=>qc.invalidateQueries({queryKey:['admin','aiOverrides']})});
  const stopped=p?.emergency_stop===true;

  return (<>
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Control Panel</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Global parameters, overrides, and emergency controls</p></div>

      {/* Emergency Stop */}
      <div className={`bg-white dark:bg-[#1C2128] border-2 rounded-2xl p-6 shadow-sm ${stopped?'border-red-500 bg-red-50/50 dark:bg-red-500/5':''}`}>
        <div className="flex items-center justify-between"><div><h3 className={`text-base font-bold ${stopped?'text-red-600':''}`}>{stopped?'⚠️ EMERGENCY STOP ACTIVE':'🟢 AI Trading Active'}</h3><p className="text-xs text-gray-500 mt-0.5">{stopped?'All AI trading halted globally.':'AI engine running normally.'}</p></div>
        {stopped?<button onClick={()=>resume.mutate()} className="px-6 py-2.5 whitespace-nowrap whitespace-nowrap bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold">▶ Resume AI</button>:<button onClick={()=>stop.mutate()} className="px-6 py-2.5 whitespace-nowrap whitespace-nowrap bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold">⏹ EMERGENCY STOP</button>}</div>
      </div>

      {/* Stats */}
      {st && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[['Today\'s Trades',st.daily_trades,'text-blue-600'],['Total AI Trades',st.total_trades,''],['Win Rate',st.win_rate?.toFixed(1)+'%',st.win_rate>=50?'text-green-600':'text-red-600'],['Active Signals',st.active_signals,'text-amber-600']].map(([l,v,c])=><div key={l} className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm text-center"><div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{l}</div><div className={`text-2xl font-bold mt-2 ${c}`}>{v}</div></div>)}
      </div>}

      {/* Global Params */}
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Global AI Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
          <div><label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Max Position Size: {ps}%</label><input type="range" min={5} max={50} value={ps} onChange={e=>setPs(+e.target.value)} className="w-full mt-2 accent-blue-600"/></div>
          <div><label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Max Daily Trades: {dt}</label><input type="range" min={10} max={500} value={dt} onChange={e=>setDt(+e.target.value)} className="w-full mt-2 accent-blue-600"/></div>
          <div><label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Stop Loss: {sl}%</label><input type="range" min={0.5} max={10} step={0.5} value={sl} onChange={e=>setSl(+e.target.value)} className="w-full mt-2 accent-red-500"/></div>
          <div><label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Take Profit: {tp}%</label><input type="range" min={1} max={30} step={0.5} value={tp} onChange={e=>setTp(+e.target.value)} className="w-full mt-2 accent-green-500"/></div>
        </div>
        <button onClick={()=>um.mutate()} className="px-5 py-2 whitespace-nowrap whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">Save Parameters</button>
      </div>

      {/* Per-User Overrides */}
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Per-User AI Overrides</h3>

        {/* Add Override */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 mb-5 p-4 bg-gray-50 dark:bg-[#161B22] rounded-xl">
          <div><label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">User</label><select value={selUser} onChange={e=>setSelUser(e.target.value)} className="px-2.5 py-2 bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none font-sans"><option value="">Select user...</option>{(users||[]).map((u:any)=><option key={u.id} value={u.id}>{u.email}</option>)}</select></div>
          <div><label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Pos Size %</label><input type="number" value={oPs} onChange={e=>setOPs(e.target.value)} placeholder="-" className="w-20 px-2 py-2 whitespace-nowrap bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none font-sans"/></div>
          <div><label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Daily Trades</label><input type="number" value={oDt} onChange={e=>setODt(e.target.value)} placeholder="-" className="w-20 px-2 py-2 whitespace-nowrap bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none font-sans"/></div>
          <div><label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">SL %</label><input type="number" value={oSl} onChange={e=>setOSl(e.target.value)} placeholder="-" step="0.5" className="w-16 px-2 py-2 whitespace-nowrap bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none font-sans"/></div>
          <div><label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">TP %</label><input type="number" value={oTp} onChange={e=>setOTp(e.target.value)} placeholder="-" step="0.5" className="w-16 px-2 py-2 whitespace-nowrap bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none font-sans"/></div>
          <button onClick={()=>ovm.mutate()} disabled={!selUser||ovm.isPending} className="px-4 py-2 whitespace-nowrap whitespace-nowrap bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold">Set Override</button>
        </div>

        {/* Existing Overrides */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[600px] sm:min-w-0 text-left text-xs"><thead><tr className="border-b border-gray-100 dark:border-gray-800">{['User','Position Size','Daily Trades','Stop Loss','Take Profit','Action'].map(h=><th key={h} className="px-4 py-2.5 whitespace-nowrap whitespace-nowrap text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {(overrides||[]).map((o:any)=><tr key={o.id} className="border-b border-gray-50 dark:border-gray-800/50">
              <td className="px-4 py-2.5 whitespace-nowrap whitespace-nowrap font-semibold text-gray-900 dark:text-white text-[12px]">{(users||[]).find((u:any)=>u.id===o.user_id)?.email||o.user_id?.slice(0,8)}</td>
              <td className="px-4 py-2.5 whitespace-nowrap whitespace-nowrap text-gray-600 dark:text-gray-400">{o.max_position_size||'—'}</td>
              <td className="px-4 py-2.5 whitespace-nowrap whitespace-nowrap text-gray-600 dark:text-gray-400">{o.max_daily_trades||'—'}</td>
              <td className="px-4 py-2.5 whitespace-nowrap whitespace-nowrap text-gray-600 dark:text-gray-400">{o.stop_loss_pct||'—'}</td>
              <td className="px-4 py-2.5 whitespace-nowrap whitespace-nowrap text-gray-600 dark:text-gray-400">{o.take_profit_pct||'—'}</td>
              <td className="px-4 py-2.5 whitespace-nowrap"><button onClick={()=>rmv.mutate(o.user_id)} className="text-[10px] font-semibold text-red-600 hover:text-red-700">Remove</button></td>
            </tr>)}
          </tbody></table>
          {(!overrides||!overrides.length)&&<div className="text-center py-6 text-xs text-gray-400">No user overrides set</div>}
        </div>
      </div>
    </div>
  </>);
}
