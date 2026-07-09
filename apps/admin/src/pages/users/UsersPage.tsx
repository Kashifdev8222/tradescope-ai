import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listUsers, updateUserStatus, toggleUserAI } from '../../api/admin';
import { formatDateTime } from '@tradescope/shared-utils';
import { useState } from 'react';
import type { UserProfile } from '@tradescope/shared-types';
import { apiClient } from '../../api/client';

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newName, setNewName] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['admin', 'users', search], queryFn: () => listUsers({ search, limit: 50 }) });
  const users: UserProfile[] = data?.data || [];
  const sm = useMutation({ mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateUserStatus(id, isActive), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }) });
  const am = useMutation({ mutationFn: (userId: string) => toggleUserAI(userId), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }) });
  const cm = useMutation({
    mutationFn: () => apiClient.post('/admin/users', { email: newEmail, password: newPass, display_name: newName }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); setShowCreate(false); setNewEmail(''); setNewPass(''); setNewName(''); }
  });

  return (<>
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h2><p className="text-xs text-gray-500 dark:text-gray-400">{users.length} total users</p></div>
        <div className="flex gap-2">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users…" className="px-3 py-2 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 w-48 font-sans" />
          <button onClick={()=>setShowCreate(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all">+ New User</button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-gray-100 dark:border-gray-800">{['User','Role','Status','AI','Joined','Actions'].map(h=><th key={h} className="px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {users.map(u=><tr key={u.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#161B22]">
                <td className="px-5 py-3"><div className="font-semibold text-gray-900 dark:text-white">{u.display_name||u.email.split('@')[0]}</div><div className="text-[11px] text-gray-400">{u.email}</div></td>
                <td className="px-5 py-3"><span className={`text-[10px] font-bold ${u.role==='admin'?'text-red-600':'text-blue-600'}`}>{u.role?.toUpperCase()}</span></td>
                <td className="px-5 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${u.is_active?'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400':'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>{u.is_active?'ACTIVE':'SUSPENDED'}</span></td>
                <td className="px-5 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${u.ai_enabled?'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400':'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{u.ai_enabled?'ON':'OFF'}</span></td>
                <td className="px-5 py-3 text-gray-400 text-[11px]">{formatDateTime(u.created_at)}</td>
                <td className="px-5 py-3"><div className="flex gap-1.5">
                  <button onClick={()=>sm.mutate({id:u.id,isActive:!u.is_active})} className={`px-2.5 py-1 rounded text-[10px] font-semibold ${u.is_active?'bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200 dark:border-red-500/20':'bg-green-50 dark:bg-green-500/10 text-green-600 border border-green-200 dark:border-green-500/20'}`}>{u.is_active?'Suspend':'Activate'}</button>
                  <button onClick={()=>am.mutate(u.id)} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700">AI Toggle</button>
                </div></td>
              </tr>)}
            </tbody>
          </table>
          {isLoading && <div className="text-center py-10 text-xs text-gray-400">Loading...</div>}
          {!isLoading && !users.length && <div className="text-center py-10 text-xs text-gray-400">No users found</div>}
        </div>
      </div>
    </div>

    {/* Create User Modal */}
    {showCreate && <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4" onClick={()=>setShowCreate(false)}><div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-[400px] w-full shadow-2xl" onClick={e=>e.stopPropagation()}>
      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">Create New User</h4>
      <div className="space-y-3 mb-4">
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Display Name</label><input type="text" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="John Doe" className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</label><input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="user@example.com" className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Password</label><input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="Min 8 characters" className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>
      </div>
      {cm.isError && <p className="text-xs text-red-600 mb-3">{(cm.error as any)?.response?.data?.error?.message || 'Failed to create user'}</p>}
      <div className="flex gap-2"><button onClick={()=>setShowCreate(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500">Cancel</button><button onClick={()=>cm.mutate()} disabled={cm.isPending} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">{cm.isPending?'Creating...':'Create User'}</button></div>
    </div></div>}
  </>);
}
