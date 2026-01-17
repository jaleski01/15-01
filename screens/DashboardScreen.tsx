import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Wrapper } from '../components/Wrapper';
import { Button } from '../components/Button';
import { StreakTimer } from '../components/StreakTimer';
import { NeuroDebugCard } from '../components/NeuroDebugCard';
import { DailyHabits } from '../components/DailyHabits';
import { TriggerModal } from '../components/TriggerModal';
import { COLORS, Routes } from '../types';

interface UserProfile {
  victory_mode?: string;
  focus_pillar?: string;
  current_streak_start?: string;
  addiction_score?: number;
  onboarding_completed?: boolean;
}

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);

  // --- DATA LOADING ---
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
           if (!user) {
             navigate(Routes.LOGIN);
           } else {
             await loadProfile(user.uid);
           }
        });
        return () => unsubscribe();
      } else {
        await loadProfile(currentUser.uid);
      }
    };

    const loadProfile = async (uid: string) => {
      try {
        const cachedProfile = localStorage.getItem('user_profile');
        if (cachedProfile) {
          setProfile(JSON.parse(cachedProfile));
        }

        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          localStorage.setItem('user_profile', JSON.stringify(data));
        } else {
          if (!cachedProfile) {
             navigate(Routes.ONBOARDING);
             return;
          }
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSosClick = () => {
    navigate(Routes.SOS);
  };

  // --- HELPERS ---
  const getPersonalityMessage = () => {
    const mode = profile?.victory_mode || '';
    if (mode === 'A_MONK' || mode === 'B_FOCUSED') {
      return {
        title: "PROTOCOLO ATIVO",
        text: "Mantenha a guarda alta. O inimigo não dorme.",
        color: COLORS.Primary
      };
    }
    return {
      title: "ESTADO DE FLUXO",
      text: "Um dia de cada vez. O progresso é constante.",
      color: COLORS.TextSecondary
    };
  };

  const getDailyMission = () => {
    const pillar = profile?.focus_pillar || '';
    switch (pillar) {
      case 'A_WORK': return { title: "Foco Profundo", desc: "90 min sem interrupções." };
      case 'B_BODY': return { title: "Treino do Dia", desc: "Busque a falha muscular." };
      case 'C_LOVE': return { title: "Conexão Real", desc: "Ligue para alguém." };
      case 'D_MIND': return { title: "Meditação", desc: "10 min de silêncio." };
      default: return { title: "Definir Propósito", desc: "Revise suas metas." };
    }
  };

  const personality = getPersonalityMessage();
  const mission = getDailyMission();

  // --- RENDER ---
  if (isLoading) {
    return (
      // APLICAÇÃO DA CORREÇÃO DE CENTRALIZAÇÃO
      // Equivalente Web para: flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000'
      <div className="flex-1 h-[100dvh] w-full flex flex-col items-center justify-center bg-black">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: COLORS.Primary, borderTopColor: 'transparent' }} />
        <span className="text-xs font-bold tracking-widest animate-pulse" style={{ color: COLORS.TextSecondary }}>
          CARREGANDO...
        </span>
      </div>
    );
  }

  return (
    <Wrapper noPadding> 
      {/* 
        ESTRUTURA CORRIGIDA:
        1. ScrollView Viewport (flex-1, overflow-y-auto, w-full):
           - Ocupa todo o espaço vertical e horizontal disponível.
           - Define a "janela" de rolagem.
      */}
      <div className="flex-1 w-full h-full overflow-y-auto scrollbar-hide bg-black">
        
        {/* 
           2. Content Container (w-full, px-5):
           - Define a largura do conteúdo como 100% da viewport.
           - Aplica o PADDING (px-5 = 20px) aqui, garantindo o respiro lateral.
           - paddingBottom (pb-32) para o conteúdo não ficar atrás do Hub.
        */}
        <div className="w-full max-w-full px-5 pt-6 pb-32 flex flex-col items-center">
          
          {/* 1. STREAK TIMER */}
          <header className="flex flex-col w-full mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                 <span className="text-xs font-bold tracking-wider uppercase" style={{ color: COLORS.TextSecondary }}>
                   Streak Limpo
                 </span>
              </div>
            </div>
            <StreakTimer startDate={profile?.current_streak_start} />
          </header>

          {/* Personality/Mission Summary */}
          <div className="w-full mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70" style={{ color: personality.color }}>
              {personality.title}
            </h3>
            <div className="flex justify-between items-end border-b pb-4 w-full" style={{ borderColor: COLORS.Border }}>
               <p className="text-sm font-medium leading-relaxed text-white max-w-[70%]">
                 "{personality.text}"
               </p>
               <div className="text-right flex-shrink-0">
                  <span className="text-[10px] uppercase text-gray-500 block">Missão</span>
                  <span className="text-xs font-bold text-white">{mission.title}</span>
               </div>
            </div>
          </div>

          {/* 2. NEURO DEBUG (GATILHOS) */}
          <NeuroDebugCard />

          {/* TRIGGER BUTTON (UI UPDATE: Red Dashed Border, Purple Text) */}
          <div className="w-full mb-6">
            <Button 
              variant="outline"
              onClick={() => setIsTriggerModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full hover:opacity-80 transition-opacity"
              style={{ 
                borderColor: '#FF3333', 
                borderStyle: 'dashed',
                borderWidth: '1px',
                color: COLORS.Primary 
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Registrar Gatilho
            </Button>
          </div>

          {/* 3. SECTION TITLE */}
          <div className="mt-2 mb-3 w-full">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              Rituais de Poder
            </h3>
          </div>

          {/* 4. DAILY HABITS */}
          <DailyHabits />

          {/* 5. SOS BUTTON */}
          <div className="mt-8 w-full">
            <Button 
              variant="danger" 
              className="h-16 text-lg tracking-widest shadow-[0_0_20px_rgba(211,47,47,0.4)] animate-pulse hover:animate-none w-full"
              onClick={handleSosClick}
            >
              S.O.S EMERGÊNCIA
            </Button>
            <p className="text-center text-xs mt-3 opacity-60" style={{ color: COLORS.TextSecondary }}>
              Pressione apenas em caso de urgência extrema.
            </p>
          </div>

        </div>
      </div>

      {/* TRIGGER MODAL */}
      {isTriggerModalOpen && (
        <TriggerModal onClose={() => setIsTriggerModalOpen(false)} />
      )}
    </Wrapper>
  );
};