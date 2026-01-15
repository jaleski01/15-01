import React from 'react';
import { BaseProps, COLORS } from '../types';

interface WrapperProps extends BaseProps {
  centerContent?: boolean;
}

/**
 * Wrapper Component
 * Acts as the safe-area and main container for all screens.
 * Enforces the absolute black background and text colors.
 */
export const Wrapper: React.FC<WrapperProps> = ({ 
  children, 
  className = '', 
  centerContent = false 
}) => {
  return (
    <div 
      className={`
        min-h-screen w-full flex flex-col relative overflow-hidden
        ${centerContent ? 'justify-center items-center' : ''}
        ${className}
      `}
      style={{ 
        backgroundColor: COLORS.Background,
        color: COLORS.TextPrimary 
      }}
    >
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-4 flex flex-col h-full">
        {children}
      </div>
    </div>
  );
};