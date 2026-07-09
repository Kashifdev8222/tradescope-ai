import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAdminAuthStore } from '../../stores/adminAuthStore';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAdminAuthStore((s) => s.login);
  const navigate = useNavigate();
  const handle = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/admin/users'); }
    catch (err: any) { setError(err.response?.data?.error?.message || err.message || 'Invalid credentials'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5] dark:bg-[#0D1117] font-sans p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-400/20 dark:bg-indigo-500/15 blur-[80px] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-violet-400/15 dark:bg-violet-500/10 blur-[80px] bottom-0 right-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl flex rounded-2xl sm:rounded-[36px] overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/50 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C2128]">
        <div className="flex-1 flex items-center bg-[#080a14] relative overflow-hidden p-6 sm:p-10 lg:p-12">
          <div className="absolute top-[-10%] right-[-20%] w-[70%] h-[120%] bg-indigo-500/[0.05] rounded-full blur-[60px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[80%] bg-violet-500/[0.04] rounded-full blur-[60px]" />
          <div className="absolute top-16 right-12 w-16 h-16 rounded-2xl border border-white/[0.06] rotate-12" />

          <div className="relative max-w-sm">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span className="text-base font-bold text-white">Agent Zone</span>
            </div>
            <h1 className="text-[36px] leading-[1.1] font-black text-white mb-3">Operator <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Console</span></h1>
            <p className="text-gray-400 text-[13px] leading-relaxed mb-8">Secure admin panel for user management, transaction oversight, and AI trading control.</p>
            <div className="space-y-2">
              {[{t:'User management',s:'Activate, suspend, control accounts'},{t:'Transaction oversight',s:'Approve or reject withdrawals'},{t:'AI control panel',s:'Global params & emergency stop'}].map(f=>(
                <div key={f.t} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]"><span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0"/><div><div className="text-[12px] font-semibold text-white">{f.t}</div><div className="text-[10px] text-gray-400">{f.s}</div></div></div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative w-12 bg-[#080a14] overflow-hidden flex-shrink-0">
          <svg className="absolute top-0 left-0 h-full w-[60px] -translate-x-[1px]" viewBox="0 0 60 800" preserveAspectRatio="none"><path d="M0 -10 Q60 400 0 810 L60 810 L60 -10 Z" fill="white" className="dark:fill-[#0D1117]"/></svg>
        </div>

        <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0D1117] p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-[340px]">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Operator sign in</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Admin credentials only</p>
            {error && <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl mb-4 text-red-700 dark:text-red-400 text-xs"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
            <form onSubmit={handle} className="space-y-3.5">
              <div><label className="block text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" value={email} required autoFocus onChange={e=>setEmail(e.target.value)} placeholder="admin@tradescope.ai" className="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm font-sans outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600" />
              </div>
              <div><label className="block text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="flex items-center bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all overflow-hidden">
                  <input type={show?'text':'password'} value={password} required onChange={e=>setPassword(e.target.value)} placeholder="Enter password" className="flex-1 min-w-0 py-2.5 px-3.5 bg-transparent border-none text-gray-900 dark:text-white text-sm font-sans outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600" />
                  <button type="button" onClick={()=>setShow(!show)} tabIndex={-1} className="shrink-0 p-2 mr-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all">
                    {show ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none font-sans">
                {loading ? <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block"/>Authenticating…</> : 'Access agent zone'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
