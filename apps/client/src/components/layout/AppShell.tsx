import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { useUIStore } from '../../stores/uiStore';
import { useEffect, useState } from 'react';

export function AppShell() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  return (
    <div className="flex h-screen bg-[#f0f2f5] dark:bg-[#0D1117] overflow-hidden">
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-[150]">
          <div className="absolute inset-0 bg-black/50" onClick={toggleSidebar} />
          <div className="absolute left-0 top-0 bottom-0"><Sidebar /></div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0" style={{ marginLeft: !isMobile ? 250 : 0, paddingBottom: isMobile ? 60 : 0 }}>
        <TopBar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && <BottomNav />}
    </div>
  );
}
