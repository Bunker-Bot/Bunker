import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Attachment01Icon,
  Download01Icon,
  Add01Icon,
  Delete02Icon,
  Doc01Icon,
  FolderOpenIcon,
  FileCodeIcon,
  Link01Icon
} from '@hugeicons/core-free-icons';
import type { MilestoneAttachment } from '../../../types';

interface MilestoneAttachmentsProps {
  milestoneId: string;
  attachments?: MilestoneAttachment[];
  readonly?: boolean;
  onAddAttachment?: (fileName: string, fileUrl: string) => void;
  onDeleteAttachment?: (attachmentId: string) => void;
}

export const MilestoneAttachments: React.FC<MilestoneAttachmentsProps> = ({
  attachments = [],
  readonly = false,
  onAddAttachment,
  onDeleteAttachment,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileName.trim() && fileUrl.trim() && onAddAttachment) {
      onAddAttachment(fileName.trim(), fileUrl.trim());
      setFileName('');
      setFileUrl('');
      setIsAdding(false);
    }
  };

  const getFileIcon = (fileName: string, type?: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || type || '';
    if (ext === 'pdf' || ext === 'doc' || ext === 'docx') return Doc01Icon;
    if (ext === 'zip' || ext === 'rar' || ext === 'tar') return FolderOpenIcon;
    if (ext === 'json' || ext === 'ts' || ext === 'js') return FileCodeIcon;
    return Link01Icon;
  };

  return (
    <div className="space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <HugeiconsIcon icon={Attachment01Icon} size={14} className="text-cyan-400" />
          Milestone Attachments & Files ({attachments.length})
        </span>

        {!readonly && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-2 py-1 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <HugeiconsIcon icon={Add01Icon} size={12} />
            <span>{isAdding ? 'Cancel' : 'Add File'}</span>
          </button>
        )}
      </div>

      {/* Admin Add Attachment Form */}
      {isAdding && !readonly && (
        <form onSubmit={handleAddSubmit} className="p-3 rounded-sm bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="File Name (e.g. API_Spec.pdf)"
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-sans"
              required
            />
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="File URL or Link"
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 rounded-sm bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold text-xs cursor-pointer transition-colors"
          >
            Save Attachment Link
          </button>
        </form>
      )}

      {/* Attachment Grid Cards */}
      {attachments.length === 0 ? (
        <div className="p-3 rounded-sm bg-zinc-950/60 border border-zinc-850 text-zinc-500 text-[11px] font-sans">
          No project files or attachments uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {attachments.map((att) => {
            const IconComp = getFileIcon(att.file_name, att.file_type);

            return (
              <div
                key={att.id}
                className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 flex items-center justify-between text-[11px] group hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <div className="p-1.5 rounded-sm bg-zinc-900 text-cyan-400 shrink-0">
                    <HugeiconsIcon icon={IconComp} size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate">{att.file_name}</span>
                    <span className="text-[9px] text-zinc-500 font-sans block">{att.file_size || 'Resource Link'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={att.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                    title="Download File"
                  >
                    <HugeiconsIcon icon={Download01Icon} size={13} />
                  </a>

                  {!readonly && onDeleteAttachment && (
                    <button
                      onClick={() => onDeleteAttachment(att.id)}
                      className="p-1 rounded-sm bg-zinc-900 hover:bg-rose-950 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove Attachment"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MilestoneAttachments;
