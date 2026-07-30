import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTechnologyIcon } from '../../../lib/constants/technology-icons';
import { useTechnologySuggestions } from '../../../lib/supabase/queries/technologies';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, Cancel01Icon, Tag01Icon } from '@hugeicons/core-free-icons';

export interface TechnologyPickerProps {
  value: string[];
  onChange: (items: string[]) => void;
  disabled?: boolean;
  maxItems?: number;
  className?: string;
}

export const TechnologyPicker: React.FC<TechnologyPickerProps> = ({
  value = [],
  onChange,
  disabled = false,
  maxItems = 20,
  className = '',
}) => {
  const [inputVal, setInputVal] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 300ms search debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(inputVal), 300);
    return () => clearTimeout(timer);
  }, [inputVal]);

  const { data: suggestions = [], isLoading } = useTechnologySuggestions(debouncedQuery);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = (techName: string) => {
    const clean = techName.trim();
    if (!clean || value.length >= maxItems) return;

    const exists = value.some((v) => v.toLowerCase() === clean.toLowerCase());
    if (!exists) {
      onChange([...value, clean]);
    }
    setInputVal('');
  };

  const handleRemove = (techName: string) => {
    onChange(value.filter((v) => v.toLowerCase() !== techName.toLowerCase()));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputVal.trim()) {
        handleAdd(inputVal);
      }
    } else if (e.key === 'Backspace' && !inputVal && value.length > 0) {
      handleRemove(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())
  );

  return (
    <div ref={containerRef} className={`relative font-mono select-none space-y-2 ${className}`}>
      {/* Selected Technology Badges List */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-1.5 rounded-sm bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 transition-colors">
        <AnimatePresence>
          {value.map((tech) => (
            <motion.span
              key={tech}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] font-bold"
            >
              <img
                src={getTechnologyIcon(tech)}
                alt={tech}
                className="w-3.5 h-3.5 object-contain shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span>{tech}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(tech)}
                  className="p-0.5 text-zinc-400 hover:text-white cursor-pointer rounded"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={12} />
                </button>
              )}
            </motion.span>
          ))}
        </AnimatePresence>

        {value.length < maxItems && !disabled && (
          <input
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? 'Type technology (e.g. React, Docker)...' : 'Add technology...'}
            className="flex-1 min-w-[120px] bg-transparent text-xs text-white placeholder-zinc-500 outline-none px-1 py-0.5"
          />
        )}
      </div>

      {/* Popover Suggestions Menu */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 z-50 mt-1 py-1.5 rounded-sm bg-zinc-950 border border-zinc-800 shadow-2xl space-y-1 max-h-56 overflow-y-auto text-xs">
          {isLoading ? (
            <div className="p-2 text-[11px] text-zinc-500 animate-pulse">Loading technology catalog...</div>
          ) : (
            <>
              {filteredSuggestions.length > 0 && (
                <div className="space-y-0.5">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
                    <HugeiconsIcon icon={Tag01Icon} size={12} />
                    <span>Suggested Stack</span>
                  </div>
                  {filteredSuggestions.map((tech) => (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => handleAdd(tech)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer text-left transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={getTechnologyIcon(tech)}
                          alt={tech}
                          className="w-4 h-4 object-contain shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="font-semibold text-xs">{tech}</span>
                      </div>
                      <HugeiconsIcon icon={PlusSignIcon} size={13} className="text-zinc-500" />
                    </button>
                  ))}
                </div>
              )}

              {/* Free-text custom creation option */}
              {inputVal.trim() && (
                <button
                  type="button"
                  onClick={() => handleAdd(inputVal)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 cursor-pointer text-left transition-colors border-t border-zinc-800/80 font-bold"
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={14} />
                  <span>Create "{inputVal.trim()}"</span>
                </button>
              )}

              {filteredSuggestions.length === 0 && !inputVal.trim() && (
                <div className="p-2.5 text-center text-[11px] text-zinc-500">
                  No technology match found. Type to create a custom stack badge.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TechnologyPicker;
