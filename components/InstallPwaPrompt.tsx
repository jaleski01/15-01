import React, { useEffect, useState, useRef } from 'react';
import { COLORS } from '../types';
import { Button } from './Button';

export const InstallPwaPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [step, setStep] = useState<'prompt' | 'ios_guide'>('prompt');
  const deferredPrompt = useRef<any>(null);

  useEffect(() => {
    // 1. Verificar se já está instalado (Modo Standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (navigator as any).standalone === true;
    
    if (isStandalone) return;

    // 2. Verificar se o usuário já dispensou o prompt recentemente
    const hasSeenPrompt = localStorage.getItem('pwa_install_prompt_seen');
    if (hasSeenPrompt) return;

    // 3. Detecção de iOS
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isApple);

    // 4. Listener para Android/Desktop (beforeinstallprompt)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Se for iOS, mostramos após um pequeno delay no Dashboard
    if (isApple) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_install_prompt_seen', 'true');
  };

  const handleInstall = async () => {
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
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[90px] left-4 right-4 z-[100] animate-fadeInUp">
      <div 
        className="w-full bg-black/80 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(139,92,246,0.15)] overflow-hidden relative"
      >
        {/* Glow Decorativo */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {step === 'prompt' ? (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: COLORS.Surface, border: `1px solid ${COLORS.Border}` }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.Primary} strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Instalar SCAR-D</h3>
                <p className="text-gray-400 text-xs">Acesso offline e experiência em tela cheia.</p>
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
                onClick={handleInstall}
                className="flex-[2] py-3 text-xs h-auto"
              >
                {isIOS ? 'Como Instalar' : 'Instalar Agora'}
              </Button>
            </div>
          </>
        ) : (
          <div className="animate-fadeIn">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instruções para iPhone
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400 border border-violet-500/30">1</div>
                <p className="text-xs text-gray-300">Toque no ícone de <strong>Compartilhar</strong> <svg className="inline w-4 h-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400 border border-violet-500/30">2</div>
                <p className="text-xs text-gray-300">Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></p>
              </div>
            </div>

            <Button onClick={handleDismiss} variant="outline" className="w-full py-3 text-xs h-auto border-violet-500/30 text-white">
              Entendi
            </Button>

            {/* Seta indicativa para o Safari Bottom Bar */}
            <div className="flex justify-center mt-4 animate-bounce">
              <svg className="w-6 h-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};