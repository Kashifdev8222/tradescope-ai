export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api/v1';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Web Trader', path: '/trader', icon: '💹' },
  { label: 'Live Traders', path: '/live-traders', icon: '🔴' },
  { label: 'Accounts', path: '/accounts', icon: '💰' },
  { label: 'AI Settings', path: '/ai-settings', icon: '🤖' },
] as const;

export const RISK_LEVELS = [
  { value: 'conservative', label: 'Conservative', color: '#3FB950' },
  { value: 'moderate', label: 'Moderate', color: '#D29922' },
  { value: 'aggressive', label: 'Aggressive', color: '#F85149' },
] as const;

export const DEFAULT_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA',
  'SPY', 'QQQ', 'BTC', 'ETH', 'EUR/USD', 'GBP/USD', 'XAU/USD',
];
