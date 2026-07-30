import React from 'react';

export const AuthBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none bg-[#050505]">
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% -10%, rgba(255, 255, 255, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 90% 70% at 5% 50%, rgba(228, 228, 231, 0.08) 0%, transparent 65%),
            radial-gradient(ellipse 90% 70% at 95% 50%, rgba(212, 212, 216, 0.08) 0%, transparent 65%),
            radial-gradient(ellipse 120% 80% at 50% 110%, rgba(255, 255, 255, 0.10) 0%, transparent 70%)
          `
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full blur-[140px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(161, 161, 170, 0.04) 45%, transparent 75%)'
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-[0.16]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="auth-hex-grid" width="60" height="52" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            <path d="M30 0 L60 15 L60 37 L30 52 L0 37 L0 15 Z" fill="none" stroke="#e4e4e7" strokeWidth="0.85" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-hex-grid)" />
      </svg>

      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="auth-dot-texture" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.1" fill="#ffffff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-dot-texture)" />
      </svg>

      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(5, 5, 5, 0.65) 100%)'
        }}
      />
    </div>
  );
};

export default AuthBackground;
