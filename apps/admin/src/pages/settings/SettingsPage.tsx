import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllSettings, updateSetting } from '../../api/admin';
import { useState, useEffect } from 'react';

export function SettingsPage() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ['admin', 'settings'], queryFn: getAllSettings });
  const [cr, setCr] = useState(0.001); const [wf, setWf] = useState(25); const [os, setOs] = useState(0.0002); const [md, setMd] = useState(50); const [ml, setMl] = useState(100);
  useEffect(() => { if (settings) { const f = settings.find((s: any) => s.key === 'fees'); const l = settings.find((s: any) => s.key === 'leverage_defaults'); const d = settings.find((s: any) => s.key === 'minimum_deposit'); if (f?.value) { setCr(f.value.commission_rate || 0.001); setWf(f.value.withdrawal_fee_flat || 25); setOs(f.value.overnight_swap || 0.0002); } if (l?.value) setMl(l.value.max || 100); if (d?.value) setMd(d.value.USD || 50); } }, [settings]);
  const um = useMutation({ mutationFn: ({ key, value }: { key: string; value: any }) => updateSetting(key, value), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settings'] }) });

  return (<><div className="as-root">
    <h2>Platform Settings</h2>

    <div className="as-card"><h3>Fee Structure</h3>
      <div className="as-fields">
        <div className="as-fld"><label>Commission Rate</label><input type="number" step="0.001" value={cr} onChange={e => setCr(+e.target.value)} /><small>{((cr) * 100).toFixed(1)}%</small></div>
        <div className="as-fld"><label>Withdrawal Fee (Flat USD)</label><input type="number" value={wf} onChange={e => setWf(+e.target.value)} /></div>
        <div className="as-fld"><label>Overnight Swap Rate</label><input type="number" step="0.0001" value={os} onChange={e => setOs(+e.target.value)} /><small>{((os) * 100).toFixed(2)}%</small></div>
        <button onClick={() => um.mutate({ key: 'fees', value: { commission_rate: cr, withdrawal_fee_flat: wf, withdrawal_fee_pct: 0, overnight_swap: os } })} className="as-save">Save Fees</button>
      </div>
    </div>

    <div className="as-card"><h3>Leverage</h3>
      <div className="as-fld"><label>Maximum Leverage: 1:{ml}</label><input type="range" min={1} max={200} value={ml} onChange={e => setMl(+e.target.value)} /></div>
      <button onClick={() => um.mutate({ key: 'leverage_defaults', value: { max: ml, default: 1, options: [1, 5, 10, 20, 30, 50, 100] } })} className="as-save">Save Leverage</button>
    </div>

    <div className="as-card"><h3>Minimum Deposit</h3>
      <div className="as-fld"><label>USD Minimum</label><div className="as-currency"><span>$</span><input type="number" value={md} onChange={e => setMd(+e.target.value)} /></div></div>
      <button onClick={() => um.mutate({ key: 'minimum_deposit', value: { USD: md, BTC: 0.001, ETH: 0.01 } })} className="as-save">Save Minimum</button>
    </div>

    {um.isSuccess && <p className="as-ok">✓ Settings updated</p>}
    <style>{`
.as-root{max-width:600px}.as-root h2{font-size:20px;font-weight:700;color:var(--text-primary);margin:0 0 16px}
.as-card{background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:10px;padding:20px 24px;margin-bottom:14px}.as-card h3{font-size:14px;font-weight:600;color:var(--text-primary);margin:0 0 14px}
.as-fields{display:flex;flex-direction:column;gap:12px}
.as-fld{margin-bottom:4px}.as-fld label{display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:5px}.as-fld small{display:block;font-size:11px;color:var(--text-tertiary);margin-top:3px}
.as-fld input[type=number]{width:100%;padding:9px 12px;background:var(--bg-input);border:1px solid var(--border-subtle);border-radius:8px;color:var(--text-primary);font-size:14px;font-family:inherit;outline:none}.as-fld input:focus{border-color:var(--accent-primary)}
.as-fld input[type=range]{width:100%}
.as-currency{position:relative}.as-currency span{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-tertiary)}.as-currency input{padding-left:24px!important}
.as-save{padding:8px 16px;background:var(--accent-primary);color:#fff;border:none;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;font-family:inherit;align-self:flex-start}.as-save:hover{opacity:.9}
.as-ok{text-align:center;color:var(--accent-success);font-size:13px;margin-top:8px}
`}</style></div></>);
}
