import React from 'react';

// Design System Constants
// These match the 'High-Stakes' Dark Theme specifications

export const COLORS = {
  Background: '#000000',      // Preto Absoluto
  Surface: '#0B101A',         // Azul quase preto
  Border: '#1C2533',          // Cinza azulado escuro
  Primary: '#007AFF',         // Azul Royal Vibrante
  Danger: '#D32F2F',          // Vermelho sangue escuro
  TextPrimary: '#FFFFFF',     // Branco
  TextSecondary: '#94A3B8',   // Cinza azulado claro
  Cyan: '#00E5FF',            // Ciano para SOS/Calma
};

export enum Routes {
  LOGIN = '/',
  ONBOARDING = '/onboarding',
  DASHBOARD = '/dashboard',
  PROGRESS = '/progress',
  LEARNING = '/learning',
  PROFILE = '/profile',
  SOS = '/sos',
}

// Common component prop types
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}