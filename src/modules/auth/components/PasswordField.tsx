import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockKeyIcon, ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label = 'Password', error, disabled, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="space-y-1.5 text-left w-full">
        {label && (
          <label htmlFor={props.id || 'password'} className="block text-xs font-medium text-zinc-300">
            {label}
          </label>
        )}

        <div className="relative rounded-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <HugeiconsIcon icon={LockKeyIcon} size={16} />
          </div>

          <input
            ref={ref}
            id={props.id || 'password'}
            type={showPassword ? 'text' : 'password'}
            disabled={disabled}
            autoComplete="current-password"
            placeholder="••••••••••••"
            className={`w-full pl-10 pr-11 py-3 bg-zinc-900/90 border ${
              error ? 'border-rose-500/80 focus:ring-rose-500/30 focus:border-rose-500' : 'border-zinc-700/60 focus:ring-zinc-400/30 focus:border-zinc-400'
            } rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-r-lg"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={showPassword ? 'visible' : 'hidden'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={16} />
              </motion.div>
            </AnimatePresence>
          </button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-medium text-rose-400 pt-0.5"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';

export default PasswordField;
