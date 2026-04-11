import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Plus } from 'lucide-react';
import { useUIStore } from './store/uiStore';
import { Button } from '@/components/ui/button';

const Layout: React.FC = () => {
  const openAddModal = useUIStore((state) => state.openAddModal);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground flex flex-col items-center">
      <div className="w-full max-w-120 min-h-screen bg-background relative flex flex-col border-x border-border shadow-2xl">
        {/* Removed Fixed Top Header to allow page-specific headers */}

        {/* Main Content Area - Removed pt-20 to allow content to hit the top */}
        <main className="flex-1 pb-24 overflow-y-auto">
          <Outlet />
        </main>

        {/* Mobile-style Bottom Navigation with Floating Action Button */}
        <nav className="fixed bottom-0 w-full max-w-120 h-20 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-between px-10 z-40">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-foreground/30'}`
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Dash
                </span>
              </>
            )}
          </NavLink>

          {/* Central Standalone Add Button */}
          <div className="relative -top-8">
            <Button
              onClick={openAddModal}
              size="icon"
              className="w-16 h-16 rounded-full shadow-[0_8px_30px_rgb(25,167,206,0.4)] bg-primary hover:bg-base text-primary-foreground border-4 border-background transition-all active:scale-90"
              aria-label="Add Transaction"
            >
              <Plus size={32} strokeWidth={3} />
            </Button>
          </div>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-foreground/30'}`
            }
          >
            {({ isActive }) => (
              <>
                <ReceiptText size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  History
                </span>
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
