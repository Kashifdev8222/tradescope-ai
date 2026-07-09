import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

export function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-2xl space-y-6">
      <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage your personal information</p></div>

      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">{user?.email?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{user?.email?.split('@')[0]}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Role: {user?.role}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Display Name</label><input type="text" defaultValue={user?.email?.split('@')[0]} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label><input type="email" defaultValue={user?.email} disabled className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-400 outline-none font-sans cursor-not-allowed" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label><input type="text" placeholder="+1 (555) 000-0000" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Country</label><input type="text" placeholder="United States" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" /></div>
        </div>
        <button onClick={() => setSaved(true)} className="mt-5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold">Save Changes</button>
        {saved && <p className="text-sm text-green-600 mt-3">✓ Profile updated</p>}
      </div>
    </div>
  );
}
