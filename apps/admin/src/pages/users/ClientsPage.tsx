import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useState } from 'react';
import { formatDateTime } from '@tradescope/shared-utils';
import { ClientCardPage } from './ClientCardPage';

export function ClientsPage() {
  const qc = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editClient, setEditClient] = useState<any>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', country: '', status: 'lead', source: '', notes: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'clients', search, statusFilter],
    queryFn: async () => { const r = await apiClient.get('/admin/clients', { params: { search, status: statusFilter, limit: 30 } }); return r.data; },
  });
  const clients = data?.data || [];

  const cm = useMutation({
    mutationFn: (body: any) => apiClient.post('/admin/clients', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'clients'] }); setShowCreate(false); resetForm(); },
  });

  const um = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => apiClient.patch(`/admin/clients/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'clients'] }); setEditClient(null); resetForm(); },
  });

  const dm = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/clients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'clients'] }),
  });

  const resetForm = () => setForm({ first_name: '', last_name: '', email: '', phone: '', country: '', status: 'lead', source: '', notes: '' });

  const openEdit = (c: any) => { setEditClient(c); setForm({ first_name: c.first_name || '', last_name: c.last_name || '', email: c.email || '', phone: c.phone || '', country: c.country || '', status: c.status || 'lead', source: c.source || '', notes: c.notes || '' }); };

  return (<>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">Clients & Leads</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{data?.meta?.total || 0} total</p></div>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone..." className="px-3 py-2 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 w-56 font-sans" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none font-sans">
            <option value="">All Status</option><option value="lead">Lead</option><option value="client">Client</option><option value="inactive">Inactive</option><option value="blocked">Blocked</option>
          </select>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">+ Add Client</button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] sm:min-w-0 text-left text-xs">
            <thead><tr className="border-b border-gray-100 dark:border-gray-800">{['Name','Email','Phone','Status','Source','Created',''].map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>
              {clients.map((c: any) => <tr key={c.id} onClick={()=>setSelectedClient(c.id)} className="border-b cursor-pointer border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#161B22]">
                <td className="px-5 py-3"><div className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">{c.first_name} {c.last_name}</div></td>
                <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{c.email || '—'}</td>
                <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{c.phone || '—'}</td>
                <td className="px-5 py-3 whitespace-nowrap"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.status==='client'?'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400':c.status==='lead'?'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400':c.status==='inactive'?'bg-gray-100 dark:bg-gray-800 text-gray-500':'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>{c.status}</span></td>
                <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{c.source || '—'}</td>
                <td className="px-5 py-3 text-gray-400 text-[11px] whitespace-nowrap">{formatDateTime(c.created_at)}</td>
                <td className="px-5 py-3 whitespace-nowrap"><div className="flex gap-1.5">
                  <button onClick={(e) => { e.stopPropagation(); setSelectedClient(c.id); }} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all">View</button>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-all">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete this client?')) dm.mutate(c.id); }} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">Delete</button>
                </div></td>
              </tr>)}
            </tbody>
          </table>
          {isLoading && <div className="text-center py-10 text-xs text-gray-400">Loading...</div>}
          {!isLoading && !clients.length && <div className="text-center py-10 text-xs text-gray-400">No clients found</div>}
        </div>
      </div>
    </div>

    {/* Create/Edit Modal */}
    {selectedClient && <ClientCardPage clientId={selectedClient} onClose={()=>setSelectedClient(null)} />}

    {(showCreate || editClient) && <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4" onClick={() => { setShowCreate(false); setEditClient(null); }}>
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-[480px] w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">{editClient ? 'Edit Client' : 'Add New Client'}</h4>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">First Name</label><input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Last Name</label><input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone</label><input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Country</label><input type="text" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none font-sans"><option value="lead">Lead</option><option value="client">Client</option><option value="inactive">Inactive</option><option value="blocked">Blocked</option></select></div>
        </div>
        <div className="mb-4"><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Source</label><input type="text" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Website, Referral, etc." className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>
        <div className="mb-4"><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans resize-none" /></div>
        <div className="flex gap-2"><button onClick={() => { setShowCreate(false); setEditClient(null); }} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500">Cancel</button>
        <button onClick={() => editClient ? um.mutate({ id: editClient.id, body: form }) : cm.mutate(form)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700">{editClient ? 'Save Changes' : 'Add Client'}</button></div>
      </div>
    </div>}
  </>);
}
