import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuotes, getCandles } from '../../api/market';
import { getAccounts } from '../../api/accounts';
import { getTrades, placeTrade, closeTrade, updateTradeSLTP } from '../../api/trades';
import { TradingChart } from '../../components/trading/TradingChart';
import { Watchlist } from '../../components/trading/Watchlist';
import { OrderTicket } from '../../components/trading/OrderTicket';
import { formatCurrency } from '@tradescope/shared-utils';
import type { Trade } from '@tradescope/shared-types';

export function TraderPage() {
  const [sel,setSel]=useState('EUR/USD');const [tf,setTf]=useState('1m');const [tab,setTab]=useState<'open'|'pending'|'history'>('open');const qc=useQueryClient();
  const {data:accs}=useQuery({queryKey:['accounts'],queryFn:getAccounts});const a=accs?.[0];
  const {data:quotes=[]}=useQuery({queryKey:['quotes'],queryFn:()=>getQuotes(),refetchInterval:1000});const q=quotes.find(x=>x.symbol===sel)||null;
  const {data:candles=[]}=useQuery({queryKey:['candles',sel,tf],queryFn:()=>getCandles(sel,tf,500),refetchInterval:1000});
  const {data:tData}=useQuery({queryKey:['trades','all'],queryFn:()=>getTrades({status:'all',limit:50}),refetchInterval:2000});
  const all:Trade[]=tData?.data||[];const open=all.filter(t=>t.status==='open');const pending=all.filter(t=>t.status==='pending');const closed=all.filter(t=>t.status==='closed');
  const pm=useMutation({mutationFn:(o:any)=>placeTrade({account_id:a?.id||'',symbol:o.symbol,side:o.side,quantity:o.quantity,stop_loss:o.sl,take_profit:o.tp,source:'manual'}),onSuccess:()=>qc.invalidateQueries({queryKey:['trades']})});
  const cm=useMutation({mutationFn:(id:string)=>closeTrade(id,q?.price||0),onSuccess:()=>qc.invalidateQueries({queryKey:['trades']})});
  const bal=Number(a?.balance||0),eq=Number(a?.equity||0),mar=Number(a?.margin_used||0),free=eq-mar,lvl=mar>0?(eq/mar)*100:0;
  const rows=tab==='open'?open:tab==='pending'?pending:closed.slice(0,30);

  return (<>
    <div className="mb-3 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Web Trader</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Professional trading terminal</p>
      </div>
      {q && <div className="flex items-center gap-2 text-xs"><span className="px-2.5 py-1 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full font-semibold border border-green-200 dark:border-green-500/20">● Live</span></div>}
    </div>
    <div className="flex flex-col bg-white dark:bg-[#0D1117] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm lg:h-[calc(100vh-180px)]" style={{minHeight:'500px'}}>
      {/* Main Trading Area — Watchlist + Chart side by side */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Watchlist quotes={quotes} selectedSymbol={sel} onSelect={setSel}/>
        <div className="flex-1 flex flex-col min-w-0">
          <TradingChart candles={candles} quote={q} timeframe={tf} onTimeframeChange={setTf} symbol={sel}/>
          {/* Order ticket as horizontal strip below chart */}
          <OrderTicket quote={q} accountId={a?.id||''} onPlaceOrder={o=>pm.mutate(o)}/>
        </div>
      </div>

      {/* Account Bar — thin strip between chart and positions */}
      <div className="flex bg-gray-50 dark:bg-[#161B22] border-y border-gray-200 dark:border-gray-800 flex-shrink-0 overflow-x-auto">
        {[['Balance',bal],['Equity',eq],['Margin',mar],['Free',free],['Margin Lvl',lvl]].map(([l,v])=>(
          <div key={l} className="flex-1 min-w-[70px] sm:min-w-[90px] text-center py-1.5 px-3 border-r border-gray-200 dark:border-gray-800 last:border-r-0">
            <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-2">{l}</span>
            <span className={`text-[11px] font-bold font-mono ${l==='Margin Lvl'?(Number(v)<100?'text-red-500':Number(v)<200?'text-amber-500':'text-green-500'):'text-gray-900 dark:text-white'}`}>
              {l==='Margin Lvl'?`${Number(v).toFixed(0)}%`:formatCurrency(Number(v))}
            </span>
          </div>
        ))}
      </div>

      {/* Positions Panel — auto-height, no forced scroll */}
      <div className="border-t border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col bg-white dark:bg-[#0D1117]" style={{maxHeight:'30%'}}>
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-4 flex-shrink-0">
          {(['open','pending','history']as const).map(k=>{
            const n=k==='open'?open.length:k==='pending'?pending.length:closed.length;
            return <button key={k} onClick={()=>setTab(k)} className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${tab===k?'border-blue-600 text-gray-900 dark:text-white':'border-transparent text-gray-400 dark:text-gray-500'}`}>{k[0]!.toUpperCase()+k.slice(1)} ({n})</button>;
          })}
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-gray-100 dark:border-gray-800">{['Symbol','Side','Qty','Entry','Current','P&L','SL','TP',''].map(h=><th key={h} className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((t:any)=>{
                const pnl=tab==='open'?(t.pnl_unrealized||0):(t.pnl_realized||0);
                return <tr key={t.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#161B22]">
                  <td className="px-4 py-2 font-semibold text-gray-900 dark:text-white">{t.symbol}</td>
                  <td className={`px-4 py-2 font-semibold ${t.side==='buy'?'text-green-600':'text-red-600'}`}>{t.side?.toUpperCase()}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{t.quantity}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{t.entry_price}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{t.current_price||'-'}</td>
                  <td className={`px-4 py-2 font-semibold font-mono ${pnl>=0?'text-green-600':'text-red-600'}`}>{pnl>=0?'+':''}{formatCurrency(pnl)}</td>
                  <td className="px-4 py-2">{tab==='open'?<input type="number" defaultValue={t.stop_loss||''} placeholder="SL" step="0.0001" className="w-16 px-1 py-0.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded text-[11px] text-gray-900 dark:text-white font-mono outline-none focus:border-blue-500" onBlur={e=>{const v=parseFloat(e.target.value);if(v)updateTradeSLTP(t.id,v,t.take_profit||undefined).then(()=>qc.invalidateQueries({queryKey:['trades']}));}}/>:<span className="text-gray-400">{t.stop_loss||'-'}</span>}</td>
                  <td className="px-4 py-2">{tab==='open'?<input type="number" defaultValue={t.take_profit||''} placeholder="TP" step="0.0001" className="w-16 px-1 py-0.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded text-[11px] text-gray-900 dark:text-white font-mono outline-none focus:border-blue-500" onBlur={e=>{const v=parseFloat(e.target.value);if(v)updateTradeSLTP(t.id,t.stop_loss||undefined,v).then(()=>qc.invalidateQueries({queryKey:['trades']}));}}/>:<span className="text-gray-400">{t.take_profit||'-'}</span>}</td>
                  <td className="px-4 py-2">{tab==='open'&&<button onClick={()=>cm.mutate(t.id)} className="text-[10px] font-semibold px-2 py-1 rounded bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">Close</button>}</td>
                </tr>;
              })}
            </tbody>
          </table>
          {rows.length===0&&<div className="text-center py-8 text-xs text-gray-400">No {tab} positions</div>}
        </div>
      </div>
    </div>
  </>);
}
