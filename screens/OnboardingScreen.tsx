import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Wrapper } from '../components/Wrapper';
import { Button } from '../components/Button';
import { COLORS, Routes } from '../types';
import { QUESTIONS } from '../data/assessmentQuestions';

interface Answer {
  score?: number;
  value?: string;
  label: string;
}

interface AnswersState {
  [key: number]: Answer;
}

export const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = QUESTIONS[currentIndex];
  const totalQuestions = QUESTIONS.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleSelectOption = (option: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option
    }));
  };

  const handleFinishOnboarding = async () => {
    if (!auth.currentUser) {
      alert("Erro Crítico: Usuário não autenticado. Por favor, faça login novamente.");
      navigate(Routes.LOGIN);
      return;
    }

    setIsSubmitting(true);

    try {
      let totalScore = 0;
      let victoryMode = 'INDEFINIDO';
      let focusPillar = 'INDEFINIDO';

      Object.entries(answers).forEach(([questionIdStr, val]) => {
        const questionId = parseInt(questionIdStr);
        const answer = val as Answer;
        
        if (questionId <= 15 && answer.score !== undefined) {
          totalScore += answer.score;
        }
        if (questionId === 16 && answer.value) {
          victoryMode = answer.value;
        }
        if (questionId === 17 && answer.value) {
          focusPillar = answer.value;
        }
      });

      const nowISO = new Date().toISOString();
      const userProfile = {
        onboarding_completed: true,
        current_streak_start: nowISO,
        victory_mode: victoryMode,
        focus_pillar: focusPillar,
        addiction_score: totalScore,
        created_at: nowISO,
        email: auth.currentUser.email,
        last_updated: nowISO
      };

      await setDoc(doc(db, "users", auth.currentUser.uid), userProfile);
      localStorage.setItem('user_profile', JSON.stringify(userProfile));
      navigate(Routes.DASHBOARD);

    } catch (error: any) {
      console.error("Error saving profile:", error);
      alert(`Falha ao salvar perfil: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      // O scroll agora é controlado pelo container flex-1
      const scrollContainer = document.getElementById('onboarding-scroll-container');
      if (scrollContainer) scrollContainer.scrollTo(0, 0);
    } else {
      handleFinishOnboarding();
    }
  };

  const currentAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <Wrapper noPadding>
      <div className="flex flex-col h-[100dvh] w-full bg-black overflow-hidden">
        
        {/* Header Fixo: Barra de Progresso */}
        <div className="shrink-0 px-6 pt-6 mb-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold" style={{ color: COLORS.Primary }}>
              QUESTÃO {currentIndex + 1} <span style={{ color: COLORS.TextSecondary }}>/ {totalQuestions}</span>
            </span>
            <span className="text-xs" style={{ color: COLORS.TextSecondary }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-[#1C2533]">
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%`, backgroundColor: COLORS.Primary }}
            />
          </div>
        </div>

        {/* Área de Conteúdo Rolável */}
        <div 
          id="onboarding-scroll-container"
          className="flex-1 overflow-y-auto w-full px-6 scrollbar-hide"
        >
          <div className="flex flex-col pt-2 pb-40">
            {/* Texto da Questão */}
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.Primary }}>
                {currentQuestion.category}
              </h2>
              <h1 className="text-2xl font-bold leading-tight text-white">
                {currentQuestion.question}
              </h1>
            </div>

            {/* Opções */}
            <div className="flex flex-col space-y-3 mb-8">
              {currentQuestion.options.map((option: any) => {
                const isSelected = currentAnswer?.label === option.label;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option)}
                    className="w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start group"
                    style={{
                      backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                      borderColor: isSelected ? COLORS.Primary : COLORS.Border,
                    }}
                  >
                    <div 
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 mr-4 shrink-0 transition-colors"
                      style={{ borderColor: isSelected ? COLORS.Primary : COLORS.TextSecondary }}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.Primary }} />
                      )}
                    </div>
                    <span 
                      className="text-base font-medium"
                      style={{ color: isSelected ? COLORS.TextPrimary : COLORS.TextSecondary }}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Botão de Ação dentro do scroll para garantir visibilidade */}
            <div className="mt-4">
              <Button 
                onClick={handleNext} 
                disabled={!currentAnswer}
                isLoading={isSubmitting}
              >
                {isLastQuestion ? 'Finalizar e Salvar' : 'Próximo'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};