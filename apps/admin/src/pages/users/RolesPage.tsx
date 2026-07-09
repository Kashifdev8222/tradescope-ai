import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useState } from 'react';

export function RolesPage() {
  const qc = useQueryClient();
  const { data: roles = [] } = useQuery({ queryKey: ['admin', 'roles'], queryFn: async () => { const r = await apiClient.get('/admin/roles'); return r.data.data; } });
  const { data: permissions = [] } = useQuery({ queryKey: ['admin', 'permissions'], queryFn: async () => { const r = await apiClient.get('/admin/permissions'); return r.data.data; } });
  const [selRole, setSelRole] = useState<string>('');

  const togglePerm = useMutation({
    mutationFn: async ({ roleId, permId, has }: { roleId: string; permId: string; has: boolean }) => {
      if (has) await apiClient.delete(`/admin/roles/${roleId}/permissions/${permId}`);
      else await apiClient.post(`/admin/roles/${roleId}/permissions`, { permission_id: permId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'roles'] }),
  });

  const selectedRole = roles.find((r: any) => r.id === selRole);
  const rolePerms = selectedRole?.permissions?.map((p: any) => p.permission_id) || [];

  // Group permissions by category
  const categories = permissions.reduce((acc: any, p: any) => {
    const cat = p.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage roles and the 16-permission matrix</p></div>

      {/* Role selector */}
      <div className="flex flex-wrap gap-2">
        {roles.map((r: any) => (
          <button key={r.id} onClick={() => setSelRole(r.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${selRole === r.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#1C2128] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}>
            {r.name}
            {r.is_system && <span className="ml-1.5 text-[10px] opacity-60">(system)</span>}
          </button>
        ))}
      </div>

      {/* Permissions matrix */}
      {selectedRole && (
        <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161B22]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRole.name} — Permissions</h3>
            <p className="text-xs text-gray-500 mt-0.5">{selectedRole.description}</p>
          </div>

          {Object.entries(categories).map(([cat, perms]: [string, any]) => (
            <div key={cat} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
              <div className="px-5 py-2.5 bg-gray-50/30 dark:bg-[#0D1117] text-[10px] font-bold text-gray-400 uppercase tracking-wider">{cat}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                {perms.map((p: any) => {
                  const has = rolePerms.includes(p.id);
                  return (
                    <label key={p.id} className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#161B22] ${has ? 'bg-blue-50/30 dark:bg-blue-500/5' : ''}`}>
                      <input type="checkbox" checked={has} onChange={() => togglePerm.mutate({ roleId: selRole, permId: p.id, has })}
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer" disabled={selectedRole.slug === 'owner'} />
                      <div>
                        <div className="text-[13px] font-semibold text-gray-900 dark:text-white">{p.name}</div>
                        <div className="text-[10px] text-gray-400">{p.slug}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!selRole && <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-sm text-gray-400 shadow-sm">Select a role above to view and edit its permissions</div>}
    </div>
  );
}
