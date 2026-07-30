import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: any;
}

export interface StatItem {
  label: string;
  value: string | number;
  icon?: any;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: any;
  badge?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  stats?: StatItem[];
  actions?: React.ReactNode;
  backButton?: boolean | string;
  sticky?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: IconComponent,
  badge,
  breadcrumbs,
  stats,
  actions,
  backButton,
  sticky = false,
  className = '',
}) => {
  const handleBack = () => {
    if (typeof backButton === 'string') {
      window.location.href = backButton;
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/app/dashboard';
    }
  };

  return (
    <div
      className={`space-y-1.5 font-mono select-none border-b border-zinc-800/80 pb-3 ${
        sticky ? 'sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md pt-2 px-1' : 'pt-0.5'
      } ${className}`}
    >
      {/* 1. Main Responsive Header Row: Title, Icon, Badge & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full min-w-0">
        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
          {backButton && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer mr-1 shrink-0 text-xs"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} size={14} />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-zinc-400 shrink-0 mr-1">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-zinc-600">/</span>}
                  <span className={idx === breadcrumbs.length - 1 ? 'text-zinc-300 font-semibold' : 'text-zinc-400'}>
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="flex items-center flex-wrap gap-2.5 min-w-0">
            {IconComponent && (
              <HugeiconsIcon icon={IconComponent} size={20} className="text-cyan-400 shrink-0" />
            )}

            <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white font-sans break-words" title={title}>
              {title}
            </h1>

            {badge && (
              <div className="shrink-0">
                {typeof badge === 'string' ? (
                  <span className="px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                    {badge}
                  </span>
                ) : (
                  badge
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Action Buttons */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>

      {/* 2. Description Line */}
      {description && (
        <p className="text-xs text-zinc-400 max-w-5xl leading-relaxed break-words">{description}</p>
      )}

      {/* 3. Optional Statistics Line */}
      {stats && stats.length > 0 && (
        <div className="flex items-center gap-3 pt-0.5 text-xs text-zinc-400 flex-wrap">
          {stats.map((stat, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-zinc-700">•</span>}
              <div className="flex items-center gap-1.5">
                {stat.icon && <HugeiconsIcon icon={stat.icon} size={13} className="text-zinc-500" />}
                <span className="font-semibold text-white">{stat.value}</span>
                <span className="text-zinc-500 text-[11px]">{stat.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
