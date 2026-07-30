import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

interface ImageLightboxModalProps {
  src?: string;
  alt?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  src,
  alt,
  onClose,
}) => {
  if (!src) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-zoom-out"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-5xl max-h-[90vh] z-10 flex flex-col items-center"
        >
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>

          <img
            src={src}
            alt={alt || 'Full-screen Image'}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-zinc-800"
          />

          {alt && (
            <p className="mt-3 font-mono text-xs text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-3 py-1 rounded-full">
              {alt}
            </p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImageLightboxModal;
