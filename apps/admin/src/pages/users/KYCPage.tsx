import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { formatDateTime } from '@tradescope/shared-utils';
import { useState } from 'react';

export function KYCPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'kyc', statusFilter],
    queryFn: async () => { const r = await apiClient.get('/kyc/all'); return r.data.data || []; },
  });

  const docs = (data || []).filter((d: any) => !statusFilter || d.status === statusFilter);

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.patch(`/kyc/${id}/review`, { status, notes: reviewNotes }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'kyc'] }); setSelectedDoc(null); setReviewNotes(''); },
  });

  const delMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/kyc/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'kyc'] }),
  });

  const DOC_LABELS: Record<string, string> = {
    id_front: 'ID Front', id_back: 'ID Back', passport: 'Passport', utility_bill: 'Utility Bill',
    bank_statement: 'Bank Statement', source_of_funds: 'Source of Funds', selfie: 'Selfie', other: 'Other',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">KYC Review</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{docs.length} documents</p></div>
        <div className="flex gap-2">
          {['Pending','Approved','Rejected','All'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s === 'All' ? '' : s.toLowerCase())} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${statusFilter === (s === 'All' ? '' : s.toLowerCase()) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#161B22] text-gray-500 border-gray-200 dark:border-gray-700'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] sm:min-w-0 text-left text-xs">
            <thead><tr className="border-b border-gray-100 dark:border-gray-800">{['User','Document','Type','Size','Status','Date',''].map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>
              {docs.map((d: any) => <tr key={d.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#161B22]">
                <td className="px-5 py-3 whitespace-nowrap"><div className="font-semibold text-gray-900 dark:text-white">{d.profiles?.display_name || d.user_id?.slice(0,8)}</div><div className="text-[10px] text-gray-400">{d.profiles?.email}</div></td>
                <td className="px-5 py-3 whitespace-nowrap text-gray-500">{d.file_name}</td>
                <td className="px-5 py-3 whitespace-nowrap"><span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">{DOC_LABELS[d.doc_type] || d.doc_type}</span></td>
                <td className="px-5 py-3 whitespace-nowrap text-gray-400">{d.file_size ? `${(d.file_size/1024).toFixed(0)}KB` : '—'}</td>
                <td className="px-5 py-3 whitespace-nowrap"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${d.status==='approved'?'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400':d.status==='rejected'?'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400':'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>{d.status?.charAt(0).toUpperCase() + d.status?.slice(1)}</span></td>
                <td className="px-5 py-3 whitespace-nowrap text-gray-400 text-[11px]">{formatDateTime(d.created_at)}</td>
                <td className="px-5 py-3 whitespace-nowrap"><div className="flex gap-1.5">
                  <button onClick={() => setSelectedDoc(d)} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">View</button>
                  {d.status === 'pending' && <>
                    <button onClick={() => reviewMutation.mutate({ id: d.id, status: 'approved' })} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">Approve</button>
                    <button onClick={() => { setSelectedDoc(d); }} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20">Reject</button>
                  </>}
                  <button onClick={() => { if(confirm('Delete document?')) delMutation.mutate(d.id); }} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700">Delete</button>
                </div></td>
              </tr>)}
            </tbody>
          </table>
          {isLoading && <div className="text-center py-10 text-xs text-gray-400">Loading...</div>}
          {!isLoading && !docs.length && <div className="text-center py-10 text-xs text-gray-400">No KYC documents</div>}
        </div>
      </div>

      {/* Document Preview + Reject Notes */}
      {selectedDoc && <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4" onClick={() => setSelectedDoc(null)}>
        <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">{DOC_LABELS[selectedDoc.doc_type] || selectedDoc.doc_type}</h4>
          <p className="text-xs text-gray-400 mb-4">{selectedDoc.file_name} • {(selectedDoc.file_size/1024).toFixed(0)}KB</p>
          {selectedDoc.file_data && <img src={selectedDoc.file_data?.startsWith('data:') ? selectedDoc.file_data : `data:image/jpeg;base64,${selectedDoc.file_data}`} alt={selectedDoc.file_name} className="w-full max-h-64 object-contain rounded-xl border border-gray-200 dark:border-gray-700 mb-4" />}
{selectedDoc.status === 'pending' && <>
            <div className="mb-4"><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Review Notes</label><textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} rows={2} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none resize-none font-sans" /></div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedDoc(null)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500">Cancel</button>
              <button onClick={() => reviewMutation.mutate({ id: selectedDoc.id, status: 'approved' })} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-green-600 hover:bg-green-700 text-white">Approve</button>
              <button onClick={() => reviewMutation.mutate({ id: selectedDoc.id, status: 'rejected' })} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white">Reject</button>
            </div>
          </>}
        </div>
      </div>}
    </div>
  );
}
