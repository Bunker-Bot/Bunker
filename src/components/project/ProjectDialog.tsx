import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

export interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: any;
  children: React.ReactNode;
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg p-6 rounded-sm bg-zinc-950 border border-zinc-800 shadow-2xl z-10 font-mono text-xs text-zinc-100 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              {icon && <HugeiconsIcon icon={icon} size={20} className="text-rose-500 shrink-0" />}
              <span>{title}</span>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer transition-colors">
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>

          {description && <p className="text-zinc-400 text-xs">{description}</p>}

          <div>{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProjectDialog;
