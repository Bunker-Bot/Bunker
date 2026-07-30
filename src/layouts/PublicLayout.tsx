import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LandingHeader } from '../components/landing/LandingHeader';

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#FAFAFA] flex flex-col selection:bg-zinc-800 selection:text-white">
      {/* Fixed Topbar Header */}
      <LandingHeader
        onOpenAdminLogin={() => navigate('/login')}
      />

      {/* Main Page Content with topbar offset */}
      <div className="flex-1 w-full pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout;
