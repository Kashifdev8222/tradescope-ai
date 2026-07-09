import { NavLink } from 'react-router';
import { NAV_ITEMS } from '../../lib/constants';

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[60px] bg-white dark:bg-[#161B22] border-t border-gray-200 dark:border-gray-800 flex items-center justify-around z-[200] pb-safe">
      {NAV_ITEMS.map(i => (
        <NavLink key={i.path} to={i.path} className={({isActive}) => `flex flex-col items-center gap-0.5 text-[10px] no-underline py-1 px-2 ${isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
          <span className="text-lg">{i.icon}</span>
          <span>{i.label === 'AI Settings' ? 'AI' : i.label === 'Live Traders' ? 'Live' : i.label === 'Web Trader' ? 'Trade' : i.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
