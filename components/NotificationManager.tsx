import React, { useEffect, useState } from 'react';
import { requestForToken, auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from './Button';

export const NotificationManager: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Só mostra se o navegador suportar e ainda não tiver permissão
    if ('Notification' in window && Notification.permission === 'default') {
      setShowBanner(true);
    }
  }, []);

  const handleActivate = async () => {
    // UX IMEDIATA: Fecha o banner antes de pedir permissão nativa.
    // Isso evita que o modal fique travado na tela aguardando a decisão do usuário no prompt do sistema.
    setShowBanner(false);

    const token = await requestForToken();
    
    if (token && auth.currentUser) {
      // Salva o token no perfil do usuário para podermos enviar pushs depois
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { fcm_token: token });
      } catch (e) {
        console.error("Erro ao salvar token", e);
      }
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-[#1F2937] border border-blue-500/30 p-4 rounded-xl shadow-2xl animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold text-sm mb-1">Ativar Protocolo de Alerta?</h4>
          <p className="text-gray-400 text-xs mb-3">
            Receba lembretes de emergência e avisos de streak. Vital para sua jornada.
          </p>
          <div className="flex gap-2">
             <button 
               onClick={() => setShowBanner(false)}
               className="flex-1 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
             >
               Agora não
             </button>
             <Button 
               onClick={handleActivate}
               className="flex-1 py-2 text-xs h-auto"
             >
               Ativar Alertas
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};