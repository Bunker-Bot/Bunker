import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Download01Icon,
  File01Icon,
  Image01Icon,
  LegalDocumentIcon
} from '@hugeicons/core-free-icons';

export interface TimelineAttachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface AttachmentPreviewModalProps {
  attachment: TimelineAttachment | null;
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  attachment,
  onClose,
}) => {
  if (!attachment) return null;

  const isImage = attachment.type?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(attachment.name) ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(attachment.url);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl rounded-sm bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/80">
            <div className="flex items-center gap-2.5 min-w-0 pr-4">
              <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 shrink-0">
                <HugeiconsIcon icon={isImage ? Image01Icon : LegalDocumentIcon} size={16} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-white truncate">{attachment.name}</h3>
                {attachment.size && (
                  <p className="text-[10px] text-zinc-400">{formatFileSize(attachment.size)}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                download={attachment.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer"
              >
                <HugeiconsIcon icon={Download01Icon} size={14} />
                <span>Download</span>
              </a>
              <button
                onClick={onClose}
                className="p-1.5 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 flex-1 overflow-auto flex items-center justify-center bg-zinc-950/40">
            {isImage ? (
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-w-full max-h-[60vh] object-contain rounded border border-zinc-800 shadow-md"
              />
            ) : (
              <div className="text-center p-8 space-y-3 max-w-sm">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                  <HugeiconsIcon icon={File01Icon} size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">{attachment.name}</p>
                  <p className="text-[11px] text-zinc-400">
                    Preview not directly embeddable. Click below to download and inspect.
                  </p>
                </div>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={attachment.name}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-zinc-800 text-white font-bold text-xs hover:bg-zinc-700 cursor-pointer"
                >
                  <HugeiconsIcon icon={Download01Icon} size={14} />
                  <span>Download File</span>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AttachmentPreviewModal;
