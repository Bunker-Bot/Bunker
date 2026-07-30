import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DashboardCircleIcon,
  Folder01Icon,
  UserGroupIcon,
  Task01Icon,
  Grid02Icon,
  Flag01Icon,
  Link01Icon,
  FileCodeIcon,
  CreditCardIcon,
  GithubIcon,
  Clock01Icon,
  Settings02Icon,
  Add01Icon,
} from '@hugeicons/core-free-icons';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '../ui/command';

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateProject?: () => void;
}

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenCreateProject,
}) => {
  const navigate = useNavigate();

  // Listen for Ctrl+K / Cmd+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open palette
          window.dispatchEvent(new CustomEvent('bunker:open-command-palette'));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CommandInput placeholder="Type a command or search workspace..." className="font-mono text-xs py-2.5" />
      <CommandList className="max-h-[380px] p-1.5 space-y-1">
        <CommandEmpty className="text-zinc-500 font-mono text-xs py-8">
          No matching commands or pages found.
        </CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() =>
                handleSelect(() => {
                  if (onOpenCreateProject) onOpenCreateProject();
                  else navigate('/app/projects');
                })
              }
              className="cursor-pointer hover:bg-zinc-900 rounded-sm p-2 flex items-center justify-between text-white font-bold"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Add01Icon} size={16} className="text-cyan-400 shrink-0" />
                <span>Create New Project</span>
              </div>
              <CommandShortcut>Shift+N</CommandShortcut>
            </CommandItem>

            <CommandItem
              onSelect={() => handleSelect(() => navigate('/app/share-links'))}
              className="cursor-pointer hover:bg-zinc-900 rounded-sm p-2 flex items-center justify-between text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Link01Icon} size={16} className="text-emerald-400 shrink-0" />
                <span>Generate Client Share Link</span>
              </div>
              <CommandShortcut>Shift+S</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="bg-zinc-800/60 my-1" />

          {/* Navigation Pages */}
          <CommandGroup heading="Workspace Navigation">
            <CommandItem
              onSelect={() => handleSelect(() => navigate('/app/dashboard'))}
              className="cursor-pointer hover:bg-zinc-900 rounded-sm p-2 flex items-center justify-between text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={DashboardCircleIcon} size={16} className="text-zinc-400 shrink-0" />
                <span>Dashboard Overview</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleSelect(() => navigate('/app/projects'))}
              className="cursor-pointer hover:bg-zinc-900 rounded-sm p-2 flex items-center justify-between text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Folder01Icon} size={16} className="text-cyan-400 shrink-0" />
                <span>Client Projects Directory</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleSelect(() => navigate('/app/clients'))}
              className="cursor-pointer hover:bg-zinc-900 rounded-sm p-2 flex items-center justify-between text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={UserGroupIcon} size={16} className="text-indigo-400 shrink-0" />
                <span>Client Management & Accounts</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleSelect(() => navigate('/app/tasks'))}
              className="cursor-pointer hover:bg-zinc-900 rounded-sm p-2 flex items-center justify-between text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Task01Icon} size={16} className="text-amber-400 shrink-0" />
                <span>Tasks List</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleSelect(() => navigate('/app/kanban'))}
              className="cursor-pointer hover:bg-zinc-900 rounded-sm p-2 flex items-center justify-between text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Grid02Icon} size={16} className="text-purple-400 shrink-0" />
                <span>Sprint Kanban Board</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleSelect(() => navigate('/app/milestones'))}
              className="cursor-pointer hover:bg-zinc-900 rounded-sm p-2 flex items-center justify-between text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Flag01Icon} size={16} className="text-rose-400 shrink-0" />
                <span>Project Delivery Milestones</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleSelect(() => navigate('/app/docs'))}
              className="cursor-pointer hover:bg-zinc-900 rounded-sm p-2 flex items-center justify-between text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={FileCodeIcon} size={16} className="text-blue-400 shrink-0" />
                <span>Documentation & Architecture Specs</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleSelect(() => navigate('/app/payments'))}
              className="cursor-pointer hover:bg-zinc-900 rounded-sm p-2 flex items-center justify-between text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={CreditCardIcon} size={16} className="text-emerald-400 shrink-0" />
                <span>Finances & Escrow Deliverables</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleSelect(() => navigate('/app/github'))}
              className="cursor-pointer hover:bg-zinc-900 rounded-sm p-2 flex items-center justify-between text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={GithubIcon} size={16} className="text-zinc-300 shrink-0" />
                <span>GitHub Developer Hub</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleSelect(() => navigate('/app/timeline'))}
              className="cursor-pointer hover:bg-zinc-900 rounded-sm p-2 flex items-center justify-between text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Clock01Icon} size={16} className="text-teal-400 shrink-0" />
                <span>Timelines & Release Changelog</span>
              </div>
            </CommandItem>

            <CommandItem
              onSelect={() => handleSelect(() => navigate('/app/settings'))}
              className="cursor-pointer hover:bg-zinc-900 rounded-sm p-2 flex items-center justify-between text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Settings02Icon} size={16} className="text-zinc-400 shrink-0" />
                <span>System Settings</span>
              </div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
    </CommandDialog>
  );
};

export default GlobalCommandPalette;
