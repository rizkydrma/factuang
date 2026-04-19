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

import { motion } from 'framer-motion';

interface NavItemProps {
  to: string;
  icon: React.ComponentProps<typeof HugeiconsIcon>['icon'];
}

const NavItem: React.FC<NavItemProps> = ({ to, icon }) => (
  <NavLink to={to} className="flex flex-col items-center flex-1">
    {({ isActive }) => (
      <div className="relative p-2 flex items-center justify-center min-w-[48px] h-12">
        {isActive && (
          <motion.div
            layoutId="nav-bg"
            className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20"
            initial={false}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <HugeiconsIcon
          icon={icon}
          size={24}
          strokeWidth={isActive ? 2.5 : 2}
          className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-foreground/30'}`}
        />
      </div>
    )}
  </NavLink>
);

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
          <NavItem to="/" icon={DashboardSquare01Icon} />
          <NavItem to="/transactions" icon={Invoice01Icon} />

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

          <NavItem to="/categories" icon={Tag01Icon} />
          <NavItem to="/settings" icon={Settings01Icon} />
        </nav>
      </div>
    </div>
  );
};

export default Layout;
