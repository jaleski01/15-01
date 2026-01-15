import React from 'react';
import { BaseProps, COLORS } from '../types';

interface WrapperProps extends BaseProps {
  centerContent?: boolean;
}

/**
 * Wrapper Component
 * Container principal seguro.
 * 
 * ATUALIZAÇÃO: Usa h-[100dvh] em vez de min-h-screen.
 * Isso força o container a ter o tamanho exato da tela, impedindo
 * que o layout "vaze" e crie barras de rolagem duplas ou empurre
 * o menu inferior para fora da visão.
 */
export const Wrapper: React.FC<WrapperProps> = ({ 
  children, 
  className = '', 
  centerContent = false 
}) => {
  return (
    <div 
      className={`
        h-[100dvh] w-full flex flex-col relative overflow-hidden
        ${centerContent ? 'justify-center items-center' : ''}
        ${className}
      `}
      style={{ 
        backgroundColor: COLORS.Background,
        color: COLORS.TextPrimary 
      }}
    >
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-4 flex flex-col h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};