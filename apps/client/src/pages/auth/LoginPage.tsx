import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/authStore';

const BotIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16.01"/><line x1="16" y1="16" x2="16" y2="16.01"/></svg>;
const ChartIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const TrophyIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 22V2h4v20"/></svg>;
const TrendingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const handle = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch (err: any) { setError(err.response?.data?.error?.message || err.message || 'Invalid credentials'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5] dark:bg-[#0D1117] font-sans p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-400/20 dark:bg-blue-500/15 blur-[80px] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-400/15 dark:bg-purple-500/10 blur-[80px] bottom-0 right-0 pointer-events-none" />
      <div className="absolute w-[250px] h-[250px] rounded-full bg-green-400/12 dark:bg-green-500/8 blur-[60px] top-1/2 left-[60%] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl flex rounded-2xl sm:rounded-[36px] overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/50 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C2128]">
        <div className="flex-1 flex items-center bg-[#060a10] relative overflow-hidden p-6 sm:p-10 lg:p-12">
          <div className="absolute top-[-10%] right-[-20%] w-[70%] h-[120%] bg-blue-500/[0.05] rounded-full blur-[60px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[80%] bg-purple-500/[0.04] rounded-full blur-[60px]" />
          <div className="absolute top-16 right-12 w-16 h-16 rounded-2xl border border-white/[0.06] rotate-12" />

          <div className="relative max-w-sm">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><TrendingIcon/></div>
              <span className="text-base font-bold text-white">TradeScope AI</span>
            </div>
            <h1 className="text-[36px] leading-[1.1] font-black text-white mb-3">Trade smarter,<br/><span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">powered by AI.</span></h1>
            <p className="text-gray-400 text-[13px] leading-relaxed mb-8">Real-time market signals, AI trade automation, and live portfolio tracking.</p>
            <div className="space-y-2">
              {[{icon:<BotIcon/>,t:'AI trade signals',s:'Confidence-scored recommendations'},{icon:<ChartIcon/>,t:'Live P&L tracking',s:'Real-time position monitoring'},{icon:<TrophyIcon/>,t:'Trader leaderboard',s:'See top AI traders'}].map(f=>(
                <div key={f.t} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]"><span className="shrink-0">{f.icon}</span><div><div className="text-[12px] font-semibold text-white">{f.t}</div><div className="text-[10px] text-gray-400">{f.s}</div></div></div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative w-12 bg-[#060a10] overflow-hidden flex-shrink-0">
          <svg className="absolute top-0 left-0 h-full w-[60px] -translate-x-[1px]" viewBox="0 0 60 800" preserveAspectRatio="none"><path d="M0 -10 Q60 400 0 810 L60 810 L60 -10 Z" fill="white" className="dark:fill-[#0D1117]"/></svg>
        </div>

        <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0D1117] p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-[340px]">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Sign in to your dashboard</p>
            {error && <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl mb-4 text-red-700 dark:text-red-400 text-xs"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
            <form onSubmit={handle} className="space-y-3.5">
              <div><label className="block text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <div className="flex items-center bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all overflow-hidden">
                  <svg className="w-4 h-4 ml-3.5 shrink-0 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input type="email" value={email} required autoFocus onChange={e=>setEmail(e.target.value)} placeholder="john@example.com" className="flex-1 min-w-0 py-2.5 px-3 bg-transparent border-none text-gray-900 dark:text-white text-sm font-sans outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600" />
                </div>
              </div>
              <div><label className="block text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="flex items-center bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all overflow-hidden">
                  <svg className="w-4 h-4 ml-3.5 shrink-0 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type={show?'text':'password'} value={password} required onChange={e=>setPassword(e.target.value)} placeholder="Enter password" className="flex-1 min-w-0 py-2.5 px-3 bg-transparent border-none text-gray-900 dark:text-white text-sm font-sans outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600" />
                  <button type="button" onClick={()=>setShow(!show)} tabIndex={-1} className="shrink-0 p-2 mr-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all">
                    {show ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white rounded-xl text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-gray-900/10 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none font-sans">
                {loading ? <><span className="w-4 h-4 border-2 border-white/20 dark:border-gray-900/20 border-t-white dark:border-t-gray-900 rounded-full animate-spin inline-block"/>Signing in…</> : 'Sign in'}
              </button>
            </form>
            <p className="text-center mt-5 text-sm text-gray-400 dark:text-gray-500">Don&apos;t have an account? <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Create one</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
