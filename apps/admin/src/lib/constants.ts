export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api/v1';

export const ADMIN_NAV_ITEMS = [
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Balances', path: '/admin/balances', icon: '💰' },
  { label: 'Transactions', path: '/admin/transactions', icon: '📊' },
  { label: 'AI Control', path: '/admin/ai-control', icon: '🤖' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
] as const;
