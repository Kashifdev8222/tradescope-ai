import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { formatDateTime } from '@tradescope/shared-utils';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  task_type: string;
  priority: string;
  status: string;
  scheduled_for: string | null;
  description: string | null;
  assigned_to: string | null;
  clients?: { first_name: string; last_name: string; email: string; phone: string } | null;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
  high: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  medium: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  low: 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700',
};

const TYPE_ICONS: Record<string, string> = {
  callback: '📞',
  meeting: '📅',
  follow_up: '🔄',
  review: '📋',
  other: '📌',
};

export function WorkspacePage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', task_type: 'callback', priority: 'medium', description: '', scheduled_for: '', client_id: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: tasks = [] } = useQuery({
    queryKey: ['admin', 'agent-tasks'],
    queryFn: async () => { const r = await apiClient.get('/admin/agent/tasks?limit=100'); return r.data.data || []; },
    refetchInterval: 15_000,
  });

  const { data: stats } = useQuery({
    queryKey: ['admin', 'agent-stats'],
    queryFn: async () => { const r = await apiClient.get('/admin/agent/stats'); return r.data.data; },
    refetchInterval: 30_000,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['admin', 'clients-simple'],
    queryFn: async () => { const r = await apiClient.get('/admin/clients?limit=200'); return r.data.data || []; },
  });

  const cm = useMutation({
    mutationFn: (body: any) => apiClient.post('/admin/agent/tasks', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'agent-tasks'] }); qc.invalidateQueries({ queryKey: ['admin', 'agent-stats'] }); resetForm(); },
  });

  const um = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => apiClient.patch(`/admin/agent/tasks/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'agent-tasks'] }); qc.invalidateQueries({ queryKey: ['admin', 'agent-stats'] }); setEditingId(null); resetForm(); },
  });

  const dm = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/agent/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'agent-tasks'] }),
  });

  const resetForm = () => setForm({ title: '', task_type: 'callback', priority: 'medium', description: '', scheduled_for: '', client_id: '' });

  const pending = tasks.filter((t: Task) => t.status === 'pending' || t.status === 'in_progress');
  const completed = tasks.filter((t: Task) => t.status === 'completed');
  const urgent = pending.filter((t: Task) => t.priority === 'urgent' || t.priority === 'high');

  const completeTask = (id: string) => um.mutate({ id, body: { status: 'completed', completed_at: new Date().toISOString() } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Agent Workspace</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Daily board — tasks, callbacks, and client outreach</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all">
          + New Task
        </button>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Pending Tasks', value: stats.pending_tasks, color: 'text-amber-600 dark:text-amber-400' },
            { label: 'Completed Today', value: stats.completed_today, color: 'text-green-600 dark:text-green-400' },
            { label: 'Urgent', value: stats.urgent_pending, color: 'text-red-600 dark:text-red-400' },
            { label: 'Leads', value: stats.total_leads, color: 'text-blue-600 dark:text-blue-400' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 3-Zone Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Zone 1: Urgent & High Priority */}
        <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-red-50/50 dark:bg-red-500/5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Priority — {urgent.length}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Urgent callbacks & high-priority tasks</p>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-gray-50 dark:divide-gray-800/50">
            {urgent.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400">No urgent tasks — great job!</div>
            ) : urgent.map((t: Task) => (
              <TaskCard key={t.id} task={t} onComplete={() => completeTask(t.id)} onDelete={(id) => dm.mutate(id)} onEdit={(t) => { setEditingId(t.id); setForm({ title: t.title, task_type: t.task_type, priority: t.priority, description: t.description || '', scheduled_for: t.scheduled_for || '', client_id: '' }); }} />
            ))}
          </div>
        </div>

        {/* Zone 2: All Pending / Scheduled */}
        <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-500/5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Scheduled — {pending.length}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">All pending & in-progress tasks</p>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-gray-50 dark:divide-gray-800/50">
            {pending.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400">No pending tasks</div>
            ) : pending.map((t: Task) => (
              <TaskCard key={t.id} task={t} onComplete={() => completeTask(t.id)} onDelete={(id) => dm.mutate(id)} onEdit={(t) => { setEditingId(t.id); setForm({ title: t.title, task_type: t.task_type, priority: t.priority, description: t.description || '', scheduled_for: t.scheduled_for || '', client_id: '' }); }} />
            ))}
          </div>
        </div>

        {/* Zone 3: Completed Today + WhatsApp/SMS Seam */}
        <div className="space-y-5">
          {/* Completed */}
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-green-50/50 dark:bg-green-500/5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Completed — {completed.length}
              </h3>
            </div>
            <div className="max-h-[240px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50">
              {completed.slice(0, 10).map((t: Task) => (
                <div key={t.id} className="px-4 py-3">
                  <div className="text-[13px] font-medium text-gray-500 dark:text-gray-400 line-through">{t.title}</div>
                  <div className="text-[10px] text-gray-400">{t.task_type} {t.clients ? `· ${t.clients.first_name} ${t.clients.last_name}` : ''}</div>
                </div>
              ))}
              {completed.length === 0 && <div className="text-center py-8 text-xs text-gray-400">No completed tasks yet</div>}
            </div>
          </div>

          {/* Communication Seams */}
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Communication Hub</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-500/5 rounded-xl border border-green-100 dark:border-green-500/10">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  <div>
                    <div className="text-[13px] font-semibold text-green-700 dark:text-green-400">WhatsApp</div>
                    <div className="text-[10px] text-gray-400">Cloud API seam — configure Meta Business</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600">Setup</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-100 dark:border-blue-500/10">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  <div>
                    <div className="text-[13px] font-semibold text-blue-700 dark:text-blue-400">SMS</div>
                    <div className="text-[10px] text-gray-400">Two-way SMS — set SMS_PROVIDER_KEY</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600">Setup</span>
              </div>

              <a href="/admin/call" className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-500/5 rounded-xl border border-purple-100 dark:border-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/10 transition-all no-underline">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📞</span>
                  <div>
                    <div className="text-[13px] font-semibold text-purple-700 dark:text-purple-400">Web Calls</div>
                    <div className="text-[10px] text-gray-400">LiveKit WebRTC — open call center</div>
                  </div>
                </div>
                <span className="text-[10px] text-purple-500">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreate || editingId) && (
        <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4" onClick={() => { setShowCreate(false); setEditingId(null); }}>
          <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-[480px] w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">{editingId ? 'Edit Task' : 'New Task'}</h4>

            <div className="space-y-3 mb-4">
              <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" placeholder="e.g. Call back John about account setup" /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                  <select value={form.task_type} onChange={e => setForm({ ...form, task_type: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none font-sans">
                    <option value="callback">Callback</option><option value="meeting">Meeting</option><option value="follow_up">Follow-up</option><option value="review">Review</option><option value="other">Other</option>
                  </select></div>
                <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none font-sans">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                  </select></div>
              </div>

              <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Schedule For</label>
                <input type="datetime-local" value={form.scheduled_for} onChange={e => setForm({ ...form, scheduled_for: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>

              <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Client (optional)</label>
                <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none font-sans">
                  <option value="">No client</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.email || c.phone}</option>)}
                </select></div>

              <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans resize-none" /></div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setShowCreate(false); setEditingId(null); }} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500">Cancel</button>
              <button onClick={() => editingId ? um.mutate({ id: editingId, body: form }) : cm.mutate(form)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700">
                {editingId ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onComplete, onDelete, onEdit }: {
  task: Task;
  onComplete: () => void;
  onDelete: (id: string) => void;
  onEdit: (t: Task) => void;
}) {
  return (
    <div className="px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-[#161B22] transition-all group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{TYPE_ICONS[task.task_type] || '📌'}</span>
            <span className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">{task.title}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority] || ''}`}>{task.priority}</span>
            <span className="text-[11px] text-gray-400">{task.task_type.replace('_', ' ')}</span>
            {task.clients && (
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                {task.clients.first_name} {task.clients.last_name}
              </span>
            )}
          </div>
          {task.scheduled_for && (
            <div className="text-[10px] text-gray-400 mt-1.5">
              📅 {formatDateTime(task.scheduled_for)}
            </div>
          )}
          {task.description && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={onComplete} className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10" title="Complete">✓</button>
          <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" title="Edit">✎</button>
          <button onClick={() => { if (confirm('Delete task?')) onDelete(task.id); }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10" title="Delete">✕</button>
        </div>
      </div>
    </div>
  );
}
