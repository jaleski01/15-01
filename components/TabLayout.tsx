import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { COLORS, Routes } from '../types';

/**
 * TabLayout
 * Acts as the 'createBottomTabNavigator'. 
 * Renders the active screen content and a fixed bottom navigation bar.
 */
export const TabLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to determine active state
  const isActive = (path: string) => location.pathname === path;

  // Icon Components (Inline SVGs for performance)
  const Icons = {
    Home: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    Progress: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    Learning: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    Profile: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };

  const navItemClass = "flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors active:scale-95";

  return (
    <div className="flex flex-col h-screen w-full bg-black">
      
      {/* Main Content Area - Renders the child route */}
      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>

      {/* Bottom Tab Bar */}
      <nav 
        className="w-full h-[60px] pb-safe flex items-center justify-around z-50 border-t"
        style={{ 
          backgroundColor: COLORS.Surface, 
          borderColor: COLORS.Border,
          paddingBottom: 'env(safe-area-inset-bottom)' // iOS Safe Area support
        }}
      >
        <button 
          className={navItemClass} 
          onClick={() => navigate(Routes.DASHBOARD)}
          style={{ color: isActive(Routes.DASHBOARD) ? COLORS.Primary : COLORS.TextSecondary }}
        >
          {Icons.Home(isActive(Routes.DASHBOARD))}
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </button>

        <button 
          className={navItemClass} 
          onClick={() => navigate(Routes.PROGRESS)}
          style={{ color: isActive(Routes.PROGRESS) ? COLORS.Primary : COLORS.TextSecondary }}
        >
          {Icons.Progress(isActive(Routes.PROGRESS))}
          <span className="text-[10px] mt-1 font-medium">Progresso</span>
        </button>

        <button 
          className={navItemClass} 
          onClick={() => navigate(Routes.LEARNING)}
          style={{ color: isActive(Routes.LEARNING) ? COLORS.Primary : COLORS.TextSecondary }}
        >
          {Icons.Learning(isActive(Routes.LEARNING))}
          <span className="text-[10px] mt-1 font-medium">Aprender</span>
        </button>

        <button 
          className={navItemClass} 
          onClick={() => navigate(Routes.PROFILE)}
          style={{ color: isActive(Routes.PROFILE) ? COLORS.Primary : COLORS.TextSecondary }}
        >
          {Icons.Profile(isActive(Routes.PROFILE))}
          <span className="text-[10px] mt-1 font-medium">Perfil</span>
        </button>
      </nav>
    </div>
  );
};