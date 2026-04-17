import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DashboardSquare01Icon,
  Invoice01Icon,
  Add01Icon,
  Tag01Icon,
  Settings01Icon,
} from '@hugeicons/core-free-icons';
import { useUIStore } from './store/uiStore';
import { Button } from '@/components/ui/button';

const Layout: React.FC = () => {
  const openAddModal = useUIStore((state) => state.openAddModal);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground flex flex-col items-center transition-colors duration-300">
      <div className="w-full max-w-120 min-h-screen bg-background relative flex flex-col border-x border-border shadow-2xl transition-colors duration-300">
        {/* Main Content Area */}
        <main className="flex-1 pb-24 overflow-y-auto">
          <Outlet />
        </main>

        {/* Mobile-style Bottom Navigation with Floating Action Button */}
        <nav className="fixed bottom-0 w-full max-w-120 h-20 bg-background/80 backdrop-blur-xl border-t border-border flex items-center justify-around px-6 z-40 transition-colors duration-300">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-foreground/20'}`
            }
          >
            {({ isActive }) => (
              <HugeiconsIcon
                icon={DashboardSquare01Icon}
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
              />
            )}
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `flex flex-col items-center transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-foreground/20'}`
            }
          >
            {({ isActive }) => (
              <HugeiconsIcon
                icon={Invoice01Icon}
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
              />
            )}
          </NavLink>

          {/* Central Standalone Add Button */}
          <div className="relative -top-8 px-2">
            <Button
              onClick={openAddModal}
              size="icon"
              className="w-16 h-16 rounded-2xl shadow-lg bg-primary hover:bg-base text-primary-foreground border-4 border-background transition-all active:scale-90"
              aria-label="Add Transaction"
            >
              <HugeiconsIcon icon={Add01Icon} size={32} strokeWidth={3} />
            </Button>
          </div>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `flex flex-col items-center transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-foreground/20'}`
            }
          >
            {({ isActive }) => (
              <HugeiconsIcon
                icon={Tag01Icon}
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
              />
            )}
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-foreground/20'}`
            }
          >
            {({ isActive }) => (
              <HugeiconsIcon
                icon={Settings01Icon}
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
              />
            )}
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
