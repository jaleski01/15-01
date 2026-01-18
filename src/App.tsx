import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './lib/firebase';
import { User } from 'firebase/auth';

import { LoginScreen } from './screens/LoginScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { LearningScreen } from './screens/LearningScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SosScreen } from './screens/SosScreen';
import { TabLayout } from './components/TabLayout';
import { NotificationManager } from './components/NotificationManager';
import { Routes as AppRoutes, COLORS } from './types';

/**
 * App Component
 * 
 * Architecture: SPA with Clean URLs (BrowserRouter)
 * 
 * Logic:
 * 1. Global Auth Listener: Detects user session immediately.
 * 2. Smart Root (/): Renders Login if guest, or Dashboard (inside Layout) if authenticated.
 * 3. Protection: Inner routes are conditionally rendered based on auth state.
 */
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // --- 1. GLOBAL AUTH & SECURITY LISTENERS ---
  useEffect(() => {
    // Auth Listener
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Context Menu Block (Native Feel)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      unsubscribe();
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // --- 2. LOADING STATE (Prevent Login Flash) ---
  if (loading) {
    return (
      <div className="flex-1 h-[100dvh] w-full flex flex-col items-center justify-center bg-black">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4" 
             style={{ borderColor: COLORS.Primary, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <NotificationManager />
      <Routes>
        
        {/* PUBLIC ROUTES */}
        <Route path={AppRoutes.ONBOARDING} element={<OnboardingScreen />} />

        {/* 
            SMART ROOT ROUTE (/) 
            - If Guest: Shows LoginScreen
            - If User: Shows TabLayout (and Dashboard via index)
        */}
        <Route path="/" element={user ? <TabLayout /> : <LoginScreen />}>
          
          {/* NESTED PROTECTED ROUTES (Inside TabLayout) */}
          {user && (
            <>
              {/* Index Route: Makes '/' display Dashboard when logged in */}
              <Route index element={<DashboardScreen />} />

              {/* Explicit Routes: Ensures navigation to '/dashboard' also works */}
              <Route path="dashboard" element={<DashboardScreen />} />
              <Route path="progress" element={<ProgressScreen />} />
              <Route path="learning" element={<LearningScreen />} />
              <Route path="profile" element={<ProfileScreen />} />
            </>
          )}
        </Route>
        
        {/* STANDALONE PROTECTED ROUTES (No Layout) */}
        <Route 
          path={AppRoutes.SOS} 
          element={user ? <SosScreen /> : <Navigate to="/" replace />} 
        />
        
        {/* FALLBACK: Redirect any unknown URL to root */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;