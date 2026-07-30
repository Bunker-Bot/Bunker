import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] flex flex-col justify-center selection:bg-zinc-800 selection:text-white">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
