import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useState, useRef } from 'react';
import { formatDateTime } from '@tradescope/shared-utils';

const DOC_TYPES = [
  { k: 'id_front', l: 'ID Card Front', icon: '🪪' },
  { k: 'id_back', l: 'ID Card Back', icon: '🪪' },
  { k: 'passport', l: 'Passport', icon: '📘' },
  { k: 'utility_bill', l: 'Utility Bill', icon: '📄' },
  { k: 'bank_statement', l: 'Bank Statement', icon: '🏦' },
  { k: 'source_of_funds', l: 'Source of Funds', icon: '💰' },
  { k: 'selfie', l: 'Selfie with ID', icon: '📸' },
];

export function KYCPage() {
  const qc = useQueryClient();
  const [docType, setDocType] = useState('id_front');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [preview, setPreview] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: docs = [] } = useQuery({
    queryKey: ['kyc', 'my'],
    queryFn: async () => { const r = await apiClient.get('/kyc/my'); return r.data.data || []; },
  });

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setMsg('Please select a file'); return; }
    if (file.size > 10 * 1024 * 1024) { setMsg('File too large — max 10MB'); return; }
    setUploading(true); setMsg('');
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]!);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      await apiClient.post('/kyc/upload', { doc_type: docType, file_name: file.name, file_data: base64 });
      qc.invalidateQueries({ queryKey: ['kyc', 'my'] });
      setMsg('✓ Document uploaded successfully');
      setTimeout(() => setMsg(''), 5000);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: any) {
      console.error('KYC upload error:', err);
      const msg = err?.response?.data?.error?.message || err?.message || 'Upload failed';
      setMsg(msg);
    } finally { setUploading(false); }
  };

  const approved = docs.filter((d: any) => d.status === 'approved').length;
  const pending = docs.filter((d: any) => d.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">KYC Verification</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Verify your identity to unlock full platform features</p></div>
        <div className="flex items-center gap-3">
          {approved > 0 && <span className="px-3 py-1.5 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold border border-green-200 dark:border-green-500/20">{approved} approved</span>}
          {pending > 0 && <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-xs font-semibold border border-amber-200 dark:border-amber-500/20">{pending} pending</span>}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Approved', value: approved, color: 'text-green-600 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' },
          { label: 'Pending', value: pending, color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
          { label: 'Required', value: DOC_TYPES.length - docs.length, color: 'text-gray-500 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' },
        ].map(s => (
          <div key={s.label} className={`text-center p-5 rounded-2xl border shadow-sm ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-[11px] font-semibold mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Upload New Document</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Document Type</label>
            <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans">
              {DOC_TYPES.map(t => <option key={t.k} value={t.k}>{t.l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">File (JPEG, PNG, PDF)</label>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,application/pdf" className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-500/10 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 file:cursor-pointer" />
            <p className="text-[10px] text-gray-400 mt-1">Maximum file size: 10MB</p>
          </div>
        </div>
        {msg && <p className={`text-xs mb-3 ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
        <button onClick={handleUpload} disabled={uploading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all">{uploading ? 'Uploading...' : 'Upload Document'}</button>
      </div>

      {/* My Documents */}
      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161B22]"><h3 className="text-sm font-semibold text-gray-900 dark:text-white">My Documents</h3></div>
        <div className="overflow-x-auto">
          {docs.length === 0 ? (
            <div className="text-center py-14">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">No documents yet</p>
              <p className="text-xs text-gray-400 mt-1">Upload your first document above to get verified</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead><tr className="border-b border-gray-100 dark:border-gray-800">{['Type','File','Size','Status','Uploaded','View','Delete'].map(h => <th key={h} className="px-5 py-3 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {docs.map((d: any) => (
                  <tr key={d.id} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="px-5 py-3 whitespace-nowrap"><span className="font-semibold text-gray-900 dark:text-white">{DOC_TYPES.find(t => t.k === d.doc_type)?.l || d.doc_type}</span></td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-500 text-[12px]">{d.file_name}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-400 text-[11px]">{d.file_size ? `${(d.file_size / 1024).toFixed(0)} KB` : '—'}</td>
                    <td className="px-5 py-3 whitespace-nowrap"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${d.status === 'approved' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : d.status === 'rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>{d.status?.charAt(0).toUpperCase() + d.status?.slice(1)}</span></td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-400 text-[11px]">{formatDateTime(d.created_at)}</td>
                    <td className="px-5 py-3 whitespace-nowrap">{d.file_data ? <button onClick={() => setPreview(d.file_data?.startsWith('data:') ? d.file_data : `data:image/jpeg;base64,${d.file_data}`)} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">View</button> : '—'}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <button onClick={() => { if(confirm('Delete this document?')) { apiClient.delete(`/kyc/${d.id}`).then(() => qc.invalidateQueries({ queryKey: ['kyc', 'my'] })); } }} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 transition-all">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {preview && <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4" onClick={() => setPreview('')}>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button onClick={() => setPreview('')} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 shadow-lg text-sm">✕</button>
          <img src={preview} alt="Preview" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" />
        </div>
      </div>}
    </div>
  );
}
