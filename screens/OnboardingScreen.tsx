import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import { auth, db } from '../lib/firebase'; // Import auth and database
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
    // 1. Auth Verification
    if (!auth.currentUser) {
      alert("Erro Crítico: Usuário não autenticado. Por favor, faça login novamente.");
      navigate(Routes.LOGIN);
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Data Calculation
      let totalScore = 0;
      let victoryMode = 'INDEFINIDO'; // Default
      let focusPillar = 'INDEFINIDO'; // Default

      Object.entries(answers).forEach(([questionIdStr, val]) => {
        const questionId = parseInt(questionIdStr);
        const answer = val as Answer;
        
        // Questions 1 to 15 have scores for addiction level
        if (questionId <= 15 && answer.score !== undefined) {
          totalScore += answer.score;
        }

        // Question 16: Victory Mode
        if (questionId === 16 && answer.value) {
          victoryMode = answer.value;
        }

        // Question 17: Focus Pillar
        if (questionId === 17 && answer.value) {
          focusPillar = answer.value;
        }
      });

      // 3. Construct Data Payload (Strict Schema)
      const nowISO = new Date().toISOString();
      
      const userProfile = {
        onboarding_completed: true,
        current_streak_start: nowISO, // Vital for Timer
        victory_mode: victoryMode,
        focus_pillar: focusPillar,
        addiction_score: totalScore,
        created_at: nowISO,
        email: auth.currentUser.email, // Helper for debugging
        last_updated: nowISO
      };

      console.log("Saving User Profile:", userProfile);

      // 4. Save to Firestore
      await setDoc(doc(db, "users", auth.currentUser.uid), userProfile);
      console.log("Firestore Save Success");

      // 5. Update Local Cache (for instant UI feedback on Dashboard)
      localStorage.setItem('user_profile', JSON.stringify(userProfile));

      // 6. Success Navigation
      navigate(Routes.DASHBOARD);

    } catch (error: any) {
      console.error("Error saving profile:", error);
      
      let msg = "Erro desconhecido ao salvar.";
      if (error.code === 'permission-denied') {
        msg = "Permissão negada. Verifique as regras do banco de dados.";
      } else if (error.message) {
        msg = error.message;
      }
      
      alert(`Falha ao salvar perfil: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      window.scrollTo(0, 0); // Ensure top of page on mobile
    } else {
      handleFinishOnboarding();
    }
  };

  const currentAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <Wrapper>
      {/* Header: Progress Bar */}
      <div className="w-full mb-8 pt-2">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Question Text */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.Primary }}>
            {currentQuestion.category}
          </h2>
          <h1 className="text-2xl font-bold leading-tight text-white">
            {currentQuestion.question}
          </h1>
        </div>

        {/* Options Cards */}
        <div className="flex-col space-y-3 mb-8">
          {currentQuestion.options.map((option: any) => {
            const isSelected = currentAnswer?.label === option.label;
            
            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                className={`
                  w-full text-left p-4 rounded-xl border transition-all duration-200
                  flex items-start group
                `}
                style={{
                  backgroundColor: isSelected ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                  borderColor: isSelected ? COLORS.Primary : COLORS.Border,
                }}
              >
                <div 
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 mr-4 shrink-0 transition-colors
                  `}
                  style={{
                    borderColor: isSelected ? COLORS.Primary : COLORS.TextSecondary,
                  }}
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
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 pb-2 mt-auto">
        <Button 
          onClick={handleNext} 
          disabled={!currentAnswer}
          isLoading={isSubmitting}
        >
          {isLastQuestion ? 'Finalizar e Salvar' : 'Próximo'}
        </Button>
      </div>
    </Wrapper>
  );
};