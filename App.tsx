import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './screens/LoginScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { LearningScreen } from './screens/LearningScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SosScreen } from './screens/SosScreen';
import { TabLayout } from './components/TabLayout'; // Import the layout
import { Routes as AppRoutes } from './types';

/**
 * App Component
 * 
 * Implements the Navigation Stack using HashRouter.
 * Uses TabLayout to wrap the main app screens.
 */
const App: React.FC = () => {
  return (
    <HashRouter>
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