import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, ArrowRight01Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';
import { supabase } from '../../../lib/supabase/client';
import { PasswordField } from './PasswordField';
import { RememberMe } from './RememberMe';
import { RadialSpinner } from '../../projects/components/RadialSpinner';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
}

function mapAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred during sign in. Please try again.';
  
  const message = (error.message || '').toLowerCase();

  if (message.includes('invalid login credentials') || message.includes('invalid credentials') || message.includes('user not found')) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }
  if (message.includes('failed to fetch') || message.includes('network') || message.includes('offline')) {
    return 'Unable to connect to authentication server. Please check your network connection.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many sign-in attempts. Please wait a moment before trying again.';
  }

  return error.message || (typeof error === 'string' ? error : 'Sign in failed. Please verify your email and password.');
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const authMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      return authData;
    },
    onSuccess: (authData) => {
      queryClient.setQueryData(['session'], {
        isValid: Boolean(authData?.session && authData?.user),
        session: authData?.session ?? null,
        user: authData?.user ?? null,
      });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      onSuccess();
    },
  });

  const onSubmit = (data: LoginFormData) => {
    if (authMutation.isPending) return;
    authMutation.mutate(data);
  };

  const isLoading = authMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs w-full" noValidate>
      <AnimatePresence mode="wait">
        {authMutation.isError && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.15 }}
            className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2.5 text-xs text-rose-300 overflow-hidden"
            role="alert"
          >
            <HugeiconsIcon icon={AlertCircleIcon} size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span className="text-rose-200 text-[11px] leading-relaxed">
              {mapAuthError(authMutation.error)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1.5 text-left">
        <label htmlFor="admin-email" className="block text-xs font-medium text-zinc-300">
          Admin Email
        </label>
        <div className="relative rounded-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <HugeiconsIcon icon={Mail01Icon} size={16} />
          </div>
          <input
            id="admin-email"
            type="email"
            disabled={isLoading}
            autoComplete="email"
            placeholder="admin@bunker.studio"
            className={`w-full pl-10 pr-4 py-3 bg-zinc-900/90 border ${
              errors.email ? 'border-rose-500/80 focus:ring-rose-500/30 focus:border-rose-500' : 'border-zinc-700/60 focus:ring-zinc-400/30 focus:border-zinc-400'
            } rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-medium text-rose-400 pt-0.5"
            role="alert"
          >
            {errors.email.message}
          </motion.p>
        )}
      </div>

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <PasswordField
            id="admin-password"
            label="Password"
            disabled={isLoading}
            error={errors.password?.message}
            {...field}
          />
        )}
      />

      <div className="flex items-center justify-between pt-1">
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <RememberMe
              checked={field.value}
              onChange={field.onChange}
              disabled={isLoading}
            />
          )}
        />

        <Link
          to="/forgot-password"
          className="text-xs text-zinc-400 hover:text-white transition-colors focus:outline-none focus-visible:underline"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-zinc-200 active:scale-[0.99] text-black font-semibold rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
      >
        {isLoading ? (
          <>
            <RadialSpinner size={16} className="text-black" />
            <span>Signing In...</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
