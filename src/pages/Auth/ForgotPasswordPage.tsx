import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, ArrowRight01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { AmbientBackground } from '../../components/ui/AmbientBackground';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden select-none">
      <AmbientBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="relative z-10 w-full max-w-md bg-[rgba(17,17,19,0.88)] border border-zinc-800/80 rounded-sm p-8 backdrop-blur-2xl shadow-2xl space-y-6"
      >
        <div className="flex flex-col items-center text-center space-y-3">
          <AppLogo size={48} showText={false} animated />
          <h1 className="text-xl font-bold text-white tracking-tight">Reset Administrator Password</h1>
          <p className="text-xs text-zinc-400">
            Enter your admin email address to receive password reset instructions.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-center space-y-2">
            <p className="text-xs text-emerald-300 font-medium">Reset instructions sent!</p>
            <p className="text-[11px] text-zinc-400">Check {email} for instructions to reset your password.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <HugeiconsIcon icon={Mail01Icon} size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bunker.studio"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/60 rounded-sm text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-zinc-200 text-black font-semibold rounded-sm text-sm transition-all cursor-pointer shadow-lg mt-2"
            >
              <span>Send Reset Instructions</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>
          </form>
        )}

        <div className="pt-2 text-center border-t border-zinc-800/80">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
            <span>Return to Admin Sign In</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
