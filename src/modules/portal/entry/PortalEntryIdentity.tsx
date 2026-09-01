import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarCode } from '../../../features/identity-avatar/components/AvatarCode';
import type { SafePortalProject, SafePortalClient } from './portal-entry.types';

interface PortalEntryIdentityProps {
  project: SafePortalProject | null;
  client: SafePortalClient | null;
  avatarCode: string;
  progress: number;
}

export const PortalEntryIdentity: React.FC<PortalEntryIdentityProps> = ({
  project,
  client,
  avatarCode,
  progress,
}) => {
  const showProject = Boolean(project && progress >= 50);
  const showClient = Boolean(client && client.displayName && progress >= 40);
  const showGuardianCode = Boolean(avatarCode && progress >= 70);

  return (
    <div className="text-center space-y-2 select-none font-mono">
      <AnimatePresence>
        {/* Client Attribution Eyebrow */}
        {showClient && client && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-xs sm:text-sm text-zinc-400 font-sans tracking-wide"
          >
            <span>Prepared for </span>
            <span className="text-zinc-200 font-medium">{client.displayName}</span>
          </motion.div>
        )}

        {/* Project Name Headline */}
        {showProject && project && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-1"
          >
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-sans">
              {project.name}
            </h1>

            {/* Optional Project Completion Badge (Secondary to Portal Load) */}
            {project.completionPercent !== null && project.completionPercent !== undefined && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-zinc-900/90 border border-zinc-800 text-[10.5px] text-zinc-400 font-mono mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Project Progress: {project.completionPercent}%</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Guardian Code */}
        {showGuardianCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-1 flex items-center justify-center gap-1.5"
          >
            <AvatarCode code={avatarCode} size="xs" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortalEntryIdentity;
