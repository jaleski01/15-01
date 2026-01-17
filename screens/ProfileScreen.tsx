import React, { useState, useEffect } from 'react';
import { Wrapper } from '../components/Wrapper';
import { Button } from '../components/Button';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { COLORS, Routes } from '../types';

const MOTIVATIONAL_QUOTES = [
  "O sucesso não é linear. O que define você é a velocidade com que você se levanta agora.",
  "Dia 1. De novo. Mas dessa vez, você não começa do zero, começa da experiência.",
  "A dor da disciplina é menor que a dor do arrependimento. Bem-vindo de volta à luta.",
  "Não importa quantas vezes você cai, mas quantas vezes você se levanta.",
  "O passado é uma lição, não uma sentença de prisão. Foque no agora."
];

// Configuração das Patentes (Gamificação)
const RANKS = [
  { id: 'sgt', label: 'Sargento', days: 7, icon: 'chevron' },
  { id: 'lt', label: 'Tenente', days: 15, icon: 'bars' },
  { id: 'maj', label: 'Major', days: 30, icon: 'star' },
  { id: 'vet', label: 'Veterano', days: 90, icon: 'shield' },
];

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMotivationModal, setShowMotivationModal] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streakDays, setStreakDays] = useState(0);

  // --- 1. LOAD DATA & CALCULATE STREAK ---
  useEffect(() => {
    const fetchProfile = async () => {
      // Tenta pegar do cache local primeiro para performance instantânea
      const cached = localStorage.getItem('user_profile');
      if (cached) {
        const data = JSON.parse(cached);
        calculateStreak(data.current_streak_start);
      }
      
      // Sincroniza com Firestore
      if (auth.currentUser) {
        try {
          const docRef = doc(db, "users", auth.currentUser.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
             const data = snap.data();
             calculateStreak(data.current_streak_start);
             // Atualiza cache
             localStorage.setItem('user_profile', JSON.stringify(data));
          }
        } catch (e) {
          console.error("Erro ao sincronizar perfil", e);
        }
      }
    };

    fetchProfile();
  }, []);

  const calculateStreak = (startDateISO: string | undefined) => {
    if (!startDateISO) {
      setStreakDays(0);
      return;
    }
    const start = new Date(startDateISO).getTime();
    const now = new Date().getTime();
    // Diferença em dias (arredondado para baixo)
    const diff = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    setStreakDays(diff);
  };

  // --- 2. ACTIONS ---

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
      // 1. Update Firestore
      const userRef = doc(db, "users", user.uid);
      const nowISO = new Date().toISOString();
      
      await updateDoc(userRef, {
        current_streak_start: nowISO,
        relapse_count: increment(1),
        last_relapse_date: nowISO
      });

      // 2. Clear Local Storage for Today's Habits
      const todayKey = new Date().toLocaleDateString('en-CA');
      localStorage.removeItem(`@habits_${todayKey}`);

      // 3. Prepare Feedback
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setCurrentQuote(randomQuote);
      
      // 4. Update Cache
      const cachedProfile = localStorage.getItem('user_profile');
      if (cachedProfile) {
        const profileData = JSON.parse(cachedProfile);
        profileData.current_streak_start = nowISO;
        localStorage.setItem('user_profile', JSON.stringify(profileData));
      }
      setStreakDays(0); // Reset visual immediately

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

  // --- ICONS HELPER ---
  const getRankIcon = (icon: string) => {
    switch (icon) {
      case 'chevron': // Sargento
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />;
      case 'bars': // Tenente
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 10h16M4 14h16" />;
      case 'star': // Major
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />;
      case 'shield': // Veterano
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />;
      default: return null;
    }
  };

  return (
    // 'noPadding' remove o padding-6 padrão do wrapper, permitindo controle total aqui.
    <Wrapper noPadding>
      <div className="flex flex-col items-center w-full h-full pt-8 px-4 pb-32 overflow-y-auto scrollbar-hide">
        
        {/* --- 1. TOPO: HEADER --- */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-1 rounded-full border-2 border-[#8B5CF6] mb-3 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
             <div className="w-16 h-16 rounded-full bg-[#2E243D] flex items-center justify-center overflow-hidden">
                {/* User Avatar Placeholder */}
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
             </div>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Meu Perfil</h1>
          <p className="text-xs text-gray-400">
             {streakDays > 0 ? `${streakDays} Dias Limpos` : 'Dia 0 - O Início'}
          </p>
        </div>
        
        {/* --- 2. BLOCO: CONQUISTAS (PATENTES) --- */}
        <div className="w-full mb-8 animate-fadeIn">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 ml-1" style={{ color: COLORS.TextSecondary }}>
            Patentes (Progresso)
          </h3>
          
          <div className="grid grid-cols-2 gap-3 w-full">
            {RANKS.map((rank) => {
              const isUnlocked = streakDays >= rank.days;
              
              return (
                <div 
                  key={rank.id}
                  className={`
                    relative p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300
                    ${isUnlocked 
                      ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/50 shadow-[0_0_10px_rgba(139,92,246,0.1)]' 
                      : 'bg-[#1A1A1A] border-[#2E243D] opacity-40 grayscale'
                    }
                  `}
                >
                  {/* Ícone com Círculo de Fundo */}
                  <div className={`p-2 rounded-full ${isUnlocked ? 'bg-[#8B5CF6]/20' : 'bg-[#2a2a2a]'}`}>
                    <svg className={`w-6 h-6 ${isUnlocked ? 'text-[#8B5CF6]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {getRankIcon(rank.icon)}
                    </svg>
                  </div>
                  
                  {/* Texto */}
                  <div className="text-center">
                    <span className={`text-xs font-bold block ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                      {rank.label}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 mt-0.5 block">
                      {rank.days} DIAS
                    </span>
                  </div>

                  {/* Cadeado se bloqueado */}
                  {!isUnlocked && (
                    <div className="absolute top-2 right-2 opacity-50">
                       <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                       </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- 3. BLOCO: ZONA DE PERIGO (CORRIGIDO) --- */}
        <div className="w-full mb-8 p-5 rounded-2xl border border-red-900/30 bg-gradient-to-br from-[#1A0505] to-[#000000]">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
             <h3 className="text-xs font-bold uppercase tracking-widest text-red-500">
               Zona de Perigo
             </h3>
          </div>
          
          <p className="text-xs text-gray-400 mb-5 leading-relaxed">
            Se você caiu, seja honesto. A recuperação exige verdade absoluta. Zere o contador para reiniciar com honra.
          </p>

          {/* 
              BOTÃO COM ESTILO FORÇADO (OVERRIDE):
              - style={{ backgroundColor: '#D32F2F', color: '#FFFFFF' }}
              Isso garante que o botão seja vermelho sangue com texto branco,
              sobrescrevendo qualquer padrão do componente Button.
          */}
          <Button 
            onClick={handleRelapseClick}
            style={{ 
              backgroundColor: '#D32F2F', 
              color: '#FFFFFF'
            }}
            className="w-full font-bold shadow-lg hover:opacity-90 transition-opacity"
          >
            Registrar Recaída (Zerar Streak)
          </Button>
        </div>

        {/* --- 4. BLOCO: CONTA (RODAPÉ) --- */}
        <div className="w-full mt-auto pt-6 border-t border-[#2E243D]">
           <div className="flex flex-col gap-4">
             {auth.currentUser?.email && (
               <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#2E243D] bg-[#0F0A15]">
                  <span className="text-xs text-gray-500">Logado como</span>
                  <span className="text-xs font-medium text-white truncate max-w-[180px]">
                    {auth.currentUser.email}
                  </span>
               </div>
             )}

             <Button 
               variant="outline" 
               onClick={handleLogout} 
               className="border-gray-800 text-gray-500 hover:text-white hover:border-gray-600 text-xs h-10"
             >
               Encerrar Sessão
             </Button>
             
             <p className="text-[10px] text-center text-gray-700 mt-2">
               Versão 1.0.1 • High-Stakes Protocol
             </p>
           </div>
        </div>

      </div>

      {/* --- MODAIS (Mantidos iguais) --- */}
      {/* --- MODAL 1: CONFIRMATION --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0F0A15] border border-red-900/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Confirmar Recaída?</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Isso vai zerar seu contador de <span className="text-white font-bold">{streakDays} dias</span>. Lembre-se: Uma batalha perdida não é o fim da guerra.
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
                className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                {isLoading ? '...' : 'Sim, recaí'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: MOTIVATION --- */}
      {showMotivationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 animate-fadeIn">
          <div className="w-full max-w-sm flex flex-col items-center text-center">
            
            <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-8 border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
               <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            <Button onClick={finishProcess} className="w-full bg-violet-600 hover:bg-violet-500">
              Voltar ao Foco (Dashboard)
            </Button>
          </div>
        </div>
      )}

    </Wrapper>
  );
};