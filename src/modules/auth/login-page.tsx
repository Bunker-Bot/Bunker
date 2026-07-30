import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthSession } from './auth-hooks';
import { AuthBackground } from './components/AuthBackground';
import { AuthCard } from './components/AuthCard';
import { LoginHeader } from './components/LoginHeader';
import { LoginForm } from './components/LoginForm';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthSession();

  const from = location.state?.from ?? '/app/dashboard';

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const handleLoginSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden select-none">
      <AuthBackground />

      <AuthCard>
        <LoginHeader />
        <LoginForm onSuccess={handleLoginSuccess} />

        <div className="pt-2 text-center border-t border-zinc-800/80">
          <p className="text-[11px] text-zinc-500 font-mono">
            Client Portal Access? Use your unique project share link.
          </p>
        </div>
      </AuthCard>
    </div>
  );
};

export default LoginPage;
