import React from 'react';

// Design System Constants
// These match the 'High-Stakes' Dark Theme specifications
// UPDATED: Purple/Neon Theme

export const COLORS = {
  Background: '#000000',      // Preto Absoluto
  Surface: '#0F0A15',         // Roxo Profundo quase preto (substitui #0B101A)
  Border: '#2E243D',          // Roxo Acinzentado Escuro (substitui #1C2533)
  Primary: '#8B5CF6',         // Roxo Neon (Violet-500) (substitui #007AFF)
  Danger: '#EF4444',          // Vermelho (Ajustado)
  TextPrimary: '#FFFFFF',     // Branco
  TextSecondary: '#9CA3AF',   // Cinza Neutro (substitui #94A3B8)
  Cyan: '#A78BFA',            // Lilás Claro (Violet-400) (substitui Ciano para harmonia)
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