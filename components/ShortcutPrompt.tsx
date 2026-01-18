import React, { useEffect, useState, useRef } from 'react';
import { COLORS } from '../types';
import { Button } from './Button';

export const ShortcutPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [step, setStep] = useState<'prompt' | 'ios_guide'>('prompt');
  const deferredPrompt = useRef<any>(null);

  useEffect(() => {
    // 1. Verifica se já está em modo PWA/Standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (navigator as any).standalone === true;
    
    if (isStandalone) return;

    // 2. Verifica se o usuário já dispensou este prompt
    const hasSeenPrompt = localStorage.getItem('shortcut_prompt_seen');
    if (hasSeenPrompt === 'true') return;

    // 3. Detecta se é iOS (iPhone/iPad)
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isApple);

    // 4. Listener para Android/Desktop (Evento nativo)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      deferredPrompt.current = e;
      // Mostra o modal após o carregamento do Dashboard
      setTimeout(() => setIsVisible(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Caso iOS, mostramos o modal manualmente (já que não há evento nativo)
    if (isApple) {
      setTimeout(() => setIsVisible(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('shortcut_prompt_seen', 'true');
  };

  const handleCreateShortcut = async () => {
    if (isIOS) {
      setStep('ios_guide');
      return;
    }

    if (deferredPrompt.current) {
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === 'accepted') {
        handleDismiss();
      }
      deferredPrompt.current = null;
    } else if (!isIOS) {
      // Caso o evento não tenha sido capturado mas o usuário clicou (raro)
      alert("Para criar o atalho, use o menu do seu navegador e selecione 'Adicionar à tela inicial'.");
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[9999] animate-fadeInUp">
      <div 
        className="w-full bg-black/80 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6 shadow-[0_20px_50px_rgba(139,92,246,0.2)] overflow-hidden relative"
      >
        {/* Efeito Visual de Fundo */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {step === 'prompt' ? (
          <div className="animate-fadeIn">
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                style={{ backgroundColor: COLORS.Surface, border: `1px solid ${COLORS.Border}` }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.Primary} strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-base">Acesso Rápido</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Adicione o Desviciar à sua tela inicial para um registro diário instantâneo.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleDismiss}
                className="flex-1 py-3 text-xs font-bold text-gray-500 hover:text-white transition-colors"
              >
                Agora não
              </button>
              <Button 
                onClick={handleCreateShortcut}
                className="flex-[2] py-3 text-sm h-auto font-bold tracking-wide"
              >
                Criar Atalho
              </Button>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Adicionar ao iPhone
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400 border border-violet-500/30 shrink-0 mt-0.5">1</div>
                <p className="text-xs text-gray-300">
                  Toque no ícone de <strong>Compartilhar</strong> (quadrado com seta para cima) na barra inferior do Safari.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400 border border-violet-500/30 shrink-0 mt-0.5">2</div>
                <p className="text-xs text-gray-300">
                  Role as opções para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
                </p>
              </div>
            </div>

            <Button onClick={handleDismiss} variant="outline" className="w-full py-3 text-xs h-auto border-violet-500/30 text-white">
              Entendi
            </Button>

            {/* Indicador visual para Safari */}
            <div className="flex justify-center mt-4">
              <svg className="w-6 h-6 text-violet-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};