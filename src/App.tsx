import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './providers/auth-provider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingHeader } from './components/landing/LandingHeader';
import { LandingPage } from './pages/Landing/LandingPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage';
import { NotFoundPage } from './pages/NotFound/NotFoundPage';
import { UnauthorizedPage } from './pages/Unauthorized/UnauthorizedPage';
import { PortalShell } from './components/portal/PortalShell';
import { DashboardLayout } from './layouts/DashboardLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-[#050505] text-[#FAFAFA]">
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <LandingHeader onOpenAdminLogin={() => (window.location.href = '/login')} />
                      <div className="pt-16">
                        <LandingPage />
                      </div>
                    </>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/share/:token/*" element={<PortalShell />} />
                <Route path="/portal/:token/*" element={<PortalShell />} />
                <Route path="/s/:token/*" element={<PortalShell />} />
                <Route path="/avatar-studio" element={<Navigate to="/app/avatar-studio" replace />} />
                <Route path="/avatar-studio/*" element={<Navigate to="/app/avatar-studio" replace />} />
                <Route path="/teams" element={<Navigate to="/app/teams" replace />} />
                <Route path="/teams/*" element={<Navigate to="/app/teams" replace />} />
                <Route path="/app/*" element={<DashboardLayout />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
