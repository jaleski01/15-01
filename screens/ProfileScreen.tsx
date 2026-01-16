import React, { useState } from 'react';
import { Wrapper } from '../components/Wrapper';
import { Button } from '../components/Button';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { COLORS, Routes } from '../types';

const MOTIVATIONAL_QUOTES = [
  "O sucesso não é linear. O que define você é a velocidade com que você se levanta agora.",
  "Dia 1. De novo. Mas dessa vez, você não começa do zero, começa da experiência.",
  "A dor da disciplina é menor que a dor do arrependimento. Bem-vindo de volta à luta.",
  "Não importa quantas vezes você cai, mas quantas vezes você se levanta.",
  "O passado é uma lição, não uma sentença de prisão. Foque no agora."
];

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMotivationModal, setShowMotivationModal] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate(Routes.LOGIN);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleRelapseClick = () => {
    setShowConfirmModal(true);
  };

  const executeRelapse = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsLoading(true);

    try {
      // 1. Update Firestore (Reset Timer & Increment Counter)
      const userRef = doc(db, "users", user.uid);
      const nowISO = new Date().toISOString();
      
      await updateDoc(userRef, {
        current_streak_start: nowISO,
        relapse_count: increment(1),
        last_relapse_date: nowISO
      });

      // 2. Clear Local Storage for Today's Habits (Hard Reset feeling)
      const todayKey = new Date().toLocaleDateString('en-CA');
      localStorage.removeItem(`@habits_${todayKey}`);

      // 3. Prepare Feedback
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setCurrentQuote(randomQuote);
      
      // 4. Update Cache (Optional, ensures dashboard timer updates instantly)
      const cachedProfile = localStorage.getItem('user_profile');
      if (cachedProfile) {
        const profileData = JSON.parse(cachedProfile);
        profileData.current_streak_start = nowISO;
        localStorage.setItem('user_profile', JSON.stringify(profileData));
      }

      // 5. Show Motivation
      setShowConfirmModal(false);
      setShowMotivationModal(true);

    } catch (error) {
      console.error("Error logging relapse:", error);
      alert("Erro ao registrar. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  const finishProcess = () => {
    setShowMotivationModal(false);
    navigate(Routes.DASHBOARD);
  };

  return (
    <Wrapper centerContent>
      <div className="flex flex-col items-center gap-4 w-full h-full pt-10 pb-20 overflow-y-auto scrollbar-hide">
        
        {/* Profile Header */}
        <div className="p-4 rounded-full bg-[#1C2533] mb-2">
           <svg className="w-8 h-8" style={{ color: COLORS.Primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
           </svg>
        </div>
        <h1 className="text-xl font-bold text-white tracking-wide mb-6">Meu Perfil</h1>
        
        {/* Account Info */}
        <div className="w-full space-y-4 mb-8">
           {auth.currentUser?.email && (
             <div className="p-4 rounded-xl border border-[#1C2533] bg-[#0B101A]">
                <p className="text-xs text-gray-400 uppercase mb-1">Email</p>
                <p className="text-white font-medium">{auth.currentUser.email}</p>
             </div>
           )}

           <Button variant="outline" onClick={handleLogout} className="border-gray-700 text-gray-400 hover:text-white hover:border-white">
             Sair da Conta
           </Button>
        </div>

        {/* --- DANGER ZONE (UPDATED VISUALS) --- */}
        <div className="w-full mt-auto border-t border-[#1C2533] pt-6">
          <h3 
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: '#FF3333' }}
          >
            Zona de Perigo
          </h3>
          
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Se você recaiu, seja honesto. Zerar o contador é o primeiro passo para retomar o controle.
          </p>

          <Button 
            onClick={handleRelapseClick}
            className="shadow-[0_0_15px_rgba(220,53,69,0.3)] hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: '#DC3545', // Vermelho Sólido Intenso
              color: '#FFFFFF',           // Texto Branco
              border: 'none'
            }}
          >
            Registrar Recaída (Zerar Streak)
          </Button>
        </div>

      </div>

      {/* --- MODAL 1: CONFIRMATION (Safety Barrier) --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0B101A] border border-red-900/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Tem certeza?</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Isso vai zerar seu contador atual. Lembre-se: Uma batalha perdida não é o fim da guerra. Você quer mesmo reiniciar?
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-xl font-bold bg-[#1F2937] text-white hover:bg-[#374151] transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={executeRelapse}
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl font-bold bg-red-600/90 text-white hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                {isLoading ? '...' : 'Sim, recaí'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: MOTIVATION (Handshake) --- */}
      {showMotivationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 animate-fadeIn">
          <div className="w-full max-w-sm flex flex-col items-center text-center">
            
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
               <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6 tracking-wide">
              Levante a Cabeça.
            </h2>
            
            <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 mb-8 relative">
              <span className="absolute -top-3 left-6 text-4xl text-gray-700 font-serif">“</span>
              <p className="text-lg font-medium text-gray-300 italic leading-relaxed">
                {currentQuote}
              </p>
            </div>

            <Button onClick={finishProcess} className="w-full bg-blue-600 hover:bg-blue-500">
              Voltar ao Foco (Dashboard)
            </Button>
          </div>
        </div>
      )}

    </Wrapper>
  );
};