import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { NoteIcon, Edit01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { type FormattedClient } from '../../../../lib/services/client.service';
import { useUpdateClient } from '../../../../lib/supabase/queries/clients';
import { MarkdownPreview } from '../../../projects/components/MarkdownPreview';

interface NotesTabProps {
  client: FormattedClient;
}

export const NotesTab: React.FC<NotesTabProps> = ({ client }) => {
  const updateMutation = useUpdateClient();
  const [isEditing, setIsEditing] = useState(false);
  const [notesText, setNotesText] = useState(client.notes || '');

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: client.id,
      data: { notes: notesText },
    });
    setIsEditing(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      <div className="p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <HugeiconsIcon icon={NoteIcon} size={16} className="text-emerald-400" />
            <span>Private Administrator Internal Notes</span>
          </div>
          {!isEditing ? (
            <button
              onClick={() => {
                setNotesText(client.notes || '');
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-bold cursor-pointer"
            >
              <HugeiconsIcon icon={Edit01Icon} size={14} />
              <span>Edit Notes</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded text-zinc-400 hover:text-white cursor-pointer font-bold">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-black font-bold hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
              >
                <HugeiconsIcon icon={Tick02Icon} size={14} />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>

        <p className="text-[10px] text-zinc-500 font-sans">
          These internal notes are private to the workspace administrator and are <strong>NEVER</strong> exposed in the Client Portal.
        </p>

        {isEditing ? (
          <textarea
            rows={8}
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Write internal admin notes, billing history, custom contract agreements, or key contact preferences..."
            className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none font-mono leading-relaxed"
          />
        ) : client.notes ? (
          <div className="p-4 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono leading-relaxed">
            <MarkdownPreview content={client.notes} compact={false} />
          </div>
        ) : (
          <div className="py-8 text-center text-zinc-500 italic text-xs">
            No internal admin notes recorded for this client yet. Click "Edit Notes" to add confidential notes.
          </div>
        )}
      </div>
    </motion.div>
  );
};
