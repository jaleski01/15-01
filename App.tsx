import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Platform } from 'react-native'; // Import Platform for OS detection
import { LoginScreen } from './screens/LoginScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { LearningScreen } from './screens/LearningScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SosScreen } from './screens/SosScreen';
import { TabLayout } from './components/TabLayout';
import { Routes as AppRoutes, COLORS } from './types';

/**
 * App Component
 * 
 * Implements the Navigation Stack using HashRouter.
 * Uses TabLayout to wrap the main app screens.
 * 
 * UI SECURITY UPDATE:
 * Includes global event listeners to prevent context menu (Right Click),
 * mimicking native app behavior on the web.
 * 
 * PWA UPDATE:
 * Detects iOS Safari and prompts user to "Add to Home Screen".
 */
const App: React.FC = () => {
  const [showIosInstallPrompt, setShowIosInstallPrompt] = useState(false);
  
  useEffect(() => {
    // 1. Bloqueio do Menu de Contexto (Botão Direito)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // 2. Detecção de iOS Web (Safari) não instalado
    const checkIos = () => {
      const isIos = Platform.OS === 'web' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
      // @ts-ignore - navigator.standalone is iOS specific
      const isStandalone = window.navigator.standalone === true;

      if (isIos && !isStandalone) {
        setShowIosInstallPrompt(true);
      }
    };
    checkIos();

    // Cleanup ao desmontar
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <HashRouter>
      {/* iOS Install Prompt Banner */}
      {showIosInstallPrompt && (
        <div 
          className="fixed top-0 left-0 w-full z-[9999] p-4 flex flex-col items-center justify-between shadow-2xl animate-slideDown"
          style={{ 
            backgroundColor: 'rgba(11, 16, 26, 0.98)', // Surface color with slight opacity
            borderBottom: `1px solid ${COLORS.Primary}`,
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex items-start justify-between w-full mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-gray-800 flex items-center justify-center">
                 {/* App Icon Placeholder */}
                 <svg className="w-6 h-6" style={{ color: COLORS.Primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">Instalar SCAR-D</h3>
                <p className="text-xs text-gray-400">Para a experiência completa.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowIosInstallPrompt(false)}
              className="p-1 rounded-full bg-gray-800 text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-300 w-full bg-gray-900/50 p-3 rounded-lg border border-gray-800">
             <span>1. Toque em</span>
             <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
               <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
             </svg>
             <span>e depois em</span>
             <span className="font-bold text-white flex items-center gap-1">
               <svg className="w-4 h-4 border border-white rounded-md p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                 <path d="M12 5v14M5 12h14" />
               </svg>
               Início
             </span>
          </div>
        </div>
      )}

      <Routes>
        {/* Auth & Onboarding (Full Screen, No Tabs) */}
        <Route path={AppRoutes.LOGIN} element={<LoginScreen />} />
        <Route path={AppRoutes.ONBOARDING} element={<OnboardingScreen />} />
        
        {/* Main App (Wrapped in Tab Bar) */}
        <Route element={<TabLayout />}>
          <Route path={AppRoutes.DASHBOARD} element={<DashboardScreen />} />
          <Route path={AppRoutes.PROGRESS} element={<ProgressScreen />} />
          <Route path={AppRoutes.LEARNING} element={<LearningScreen />} />
          <Route path={AppRoutes.PROFILE} element={<ProfileScreen />} />
        </Route>
        
        {/* SOS (Full Screen Overlay, No Tabs) */}
        <Route path={AppRoutes.SOS} element={<SosScreen />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to={AppRoutes.LOGIN} replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;