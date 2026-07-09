import { useState } from 'react';
import { apiClient } from '../../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function ImportPage() {
  const qc = useQueryClient();
  const [preview, setPreview] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');

  const fields = ['first_name','last_name','email','phone','country','status','source','notes'];

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return;
    const h = lines[0]!.split(',').map(h => h.trim().replace(/"/g,''));
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/"/g,''));
      const obj: any = {};
      h.forEach((col, i) => { obj[col] = vals[i] || ''; });
      return obj;
    });
    setHeaders(h);
    setPreview(rows.slice(0, 10));
    // Auto-map
    const auto: Record<string, string> = {};
    h.forEach(col => {
      const match = fields.find(f => col.toLowerCase().includes(f.toLowerCase()));
      if (match) auto[col] = match;
    });
    setMapping(auto);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => parseCSV(reader.result as string);
    reader.readAsText(file);
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      const data = preview.map(row => {
        const mapped: any = {};
        Object.entries(mapping).forEach(([csvCol, dbCol]) => {
          if (dbCol && row[csvCol]) mapped[dbCol] = row[csvCol];
        });
        return mapped;
      });
      setMsg(`Importing ${data.length} records...`);
      await apiClient.post('/admin/import/clients', { records: data });
      setMsg(`✓ Imported ${data.length} records successfully`);
      qc.invalidateQueries({ queryKey: ['admin', 'clients'] });
    },
  });

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Import</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Import clients from CSV file</p></div>

      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Upload CSV</h3>
        <input type="file" accept=".csv" onChange={handleFile} className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-500/10 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 file:cursor-pointer" />
        <p className="text-[10px] text-gray-400 mt-2">First row must contain column headers</p>
      </div>

      {preview.length > 0 && (
        <>
          {/* Column Mapping */}
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Map Columns</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {headers.map(h => (
                <div key={h}>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{h}</label>
                  <select value={mapping[h] || ''} onChange={e => setMapping({...mapping, [h]: e.target.value})} className="w-full px-2.5 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none font-sans">
                    <option value="">Skip</option>
                    {fields.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161B22]"><h3 className="text-sm font-semibold text-gray-900 dark:text-white">Preview ({preview.length} of {preview.length} rows)</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs"><thead><tr className="border-b border-gray-100 dark:border-gray-800">{headers.map(h => <th key={h} className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>{preview.map((row, i) => <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">{headers.map(h => <td key={h} className="px-4 py-2 whitespace-nowrap text-gray-600 dark:text-gray-400 text-[11px]">{row[h]}</td>)}</tr>)}</tbody></table>
            </div>
          </div>

          {msg && <p className={`text-sm ${msg.startsWith('✓') ? 'text-green-600' : 'text-blue-600'}`}>{msg}</p>}
          <button onClick={() => importMutation.mutate()} disabled={importMutation.isPending} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold">
            {importMutation.isPending ? 'Importing...' : 'Import Records'}
          </button>
        </>
      )}
    </div>
  );
}
