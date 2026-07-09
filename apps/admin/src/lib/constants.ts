export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api/v1';

export const ADMIN_NAV_ITEMS = [
  { label: 'Users', path: '/admin/users', viewBox: '0 0 24 24', stroke: 'currentColor', paths: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2','M23 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'], circle: '9 7 4' },
  { label: 'Clients', path: '/admin/clients', viewBox: '0 0 24 24', stroke: 'currentColor', paths: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2','M23 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'], circle: '9 7 4' },
  { label: 'Balances', path: '/admin/balances', viewBox: '0 0 24 24', stroke: 'currentColor', paths: ['M21 12V7H5a2 2 0 0 1 0-4h14v4','M3 5v14a2 2 0 0 0 2 2h16v-5','M18 12a2 2 0 0 0 0 4h4v-4Z'] },
  { label: 'Transactions', path: '/admin/transactions', viewBox: '0 0 24 24', stroke: 'currentColor', paths: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z','M14 2v6h6','M16 13H8','M16 17H8','M10 9H8'] },
  { label: 'AI Control', path: '/admin/ai-control', viewBox: '0 0 24 24', stroke: 'currentColor', paths: ['M12 2a4 4 0 0 1 4 4v2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h2V6a4 4 0 0 1 4-4z'], circle: '12 11 3' },
  { label: 'Import', path: '/admin/import', viewBox: '0 0 24 24', stroke: 'currentColor', paths: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4','M7 10l5 5 5-5','M12 15V3'] },
  { label: 'KYC', path: '/admin/kyc', viewBox: '0 0 24 24', stroke: 'currentColor', paths: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z','M14 2v6h6','M16 13H8','M16 17H8','M10 9H8'], circle: '' },
  { label: 'Roles', path: '/admin/roles', viewBox: '0 0 24 24', stroke: 'currentColor', paths: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'] },
  { label: 'Settings', path: '/admin/settings', viewBox: '0 0 24 24', stroke: 'currentColor', paths: ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'], circle: '12 12 3' },
] as const;
