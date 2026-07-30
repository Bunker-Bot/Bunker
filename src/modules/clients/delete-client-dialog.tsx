import React, { useEffect, useState } from 'react';
import { useDeleteClient } from '../../lib/supabase/queries/clients';
import { ClientRepository } from '../../lib/repositories/client.repository';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, Cancel01Icon, Delete02Icon } from '@hugeicons/core-free-icons';

interface DeleteClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: any | null;
}

export const DeleteClientDialog: React.FC<DeleteClientDialogProps> = ({
  isOpen,
  onClose,
  client,
}) => {
  const deleteMutation = useDeleteClient();
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (client) {
      setIsChecking(true);
      ClientRepository.getClientProjectCount(client.id)
        .then((count) => {
          setProjectCount(count);
        })
        .finally(() => {
          setIsChecking(false);
        });
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const hasActiveProjects = (projectCount || 0) > 0;

  const handleDelete = async () => {
    if (hasActiveProjects) return;
    await deleteMutation.mutateAsync(client.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer" />

      <div className="relative w-full max-w-md p-6 rounded-sm bg-zinc-950 border border-zinc-800 shadow-2xl z-10 font-mono text-xs text-zinc-100 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <HugeiconsIcon icon={Delete02Icon} size={18} className="text-rose-400" />
            <span>Delete Client Record</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-zinc-300">
            Are you sure you want to permanently delete <strong className="text-white">{client.name}</strong>?
          </p>

          {isChecking ? (
            <div className="p-3 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-center animate-pulse">
              Verifying client project dependencies...
            </div>
          ) : hasActiveProjects ? (
            <div className="p-3.5 rounded bg-amber-950/40 border border-amber-800/80 text-amber-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-200">
                <HugeiconsIcon icon={AlertCircleIcon} size={16} className="shrink-0" />
                <span>Deletion Blocked: Active Projects Exist</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                This client has <strong className="underline">{projectCount} active project(s)</strong> attached. Archive the client or move the projects before deletion.
              </p>
            </div>
          ) : (
            <p className="text-zinc-500 text-[11px]">
              This action cannot be undone. All client profile telemetry will be removed.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={hasActiveProjects || isChecking || deleteMutation.isPending}
            onClick={handleDelete}
            className="px-4 py-2 rounded-sm bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Client'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteClientDialog;
