import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  showBack?: boolean;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  showBack = false,
  className,
}) => {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full px-6 pt-12 pb-6 bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && !leftAction && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors group flex items-center justify-center text-white active:scale-90"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={20}
                className="group-active:-translate-x-1 transition-transform"
              />
            </button>
          )}
          {leftAction}

          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-black uppercase tracking-tighter italic leading-none">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] mt-1.5 leading-none">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {rightAction && (
          <div className="flex items-center gap-2">{rightAction}</div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
