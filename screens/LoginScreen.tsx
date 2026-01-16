import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore/lite';
import { auth, db } from '../lib/firebase'; 
import { Wrapper } from '../components/Wrapper';
import { Button } from '../components/Button';
import { COLORS, Routes } from '../types';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  // Estado fixo para Login, já que o registro é externo
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Sign In (Modular Syntax)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user) {
          throw new Error("Erro: Usuário não identificado após login.");
      }

      const uid = userCredential.user.uid;

      // 2. Check Firestore for existing profile (Modular Syntax)
      const docRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(docRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        // 3. Conditional Navigation based on Onboarding status
        if (userData?.onboarding_completed) {
          navigate(Routes.DASHBOARD);
        } else {
          // User exists but hasn't finished setup
          navigate(Routes.ONBOARDING);
        }
      } else {
        // Fallback: User authenticated but no doc found -> Onboarding
        navigate(Routes.ONBOARDING);
      }

    } catch (err: any) {
      console.error("Auth failed", err);
      let errorMessage = "Ocorreu um erro.";
      
      // Map common Firebase errors
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = "Email ou senha incorretos.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "O email fornecido não é válido.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Removido centerContent para permitir controle manual do topo
    <Wrapper>
      {/* 
        Container Principal com Respiro Superior 
        pt-24 (96px) garante o espaçamento solicitado de ~80-100px
      */}
      <div className="w-full pt-24 flex flex-col items-center">
        
        {/* Logo Box */}
        <div 
          className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center shadow-lg"
          style={{ backgroundColor: COLORS.Surface, border: `1px solid ${COLORS.Border}` }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.Primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>

        {/* 
          Título Atualizado: Identidade Visual
        */}
        <h1 className="text-4xl font-bold tracking-tighter text-white mb-2 font-mono">
          DESVICIAR
        </h1>
        
        <p className="text-sm mb-12" style={{ color: COLORS.TextSecondary }}>
          Acesse o sistema para prosseguir.
        </p>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {error && (
            <div 
              className="p-3 rounded-lg text-xs font-medium border"
              style={{ 
                backgroundColor: 'rgba(211, 47, 47, 0.1)', 
                color: '#ff8a80',
                borderColor: 'rgba(211, 47, 47, 0.3)' 
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium ml-1" style={{ color: COLORS.TextSecondary }}>Email</label>
            <div 
              className="flex items-center rounded-xl px-4 py-3.5 transition-colors focus-within:ring-1 focus-within:ring-blue-500"
              style={{ backgroundColor: COLORS.Surface, border: `1px solid ${COLORS.Border}` }}
            >
              <svg className="w-5 h-5 mr-3" style={{ color: COLORS.TextSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="bg-transparent w-full outline-none text-white placeholder-slate-600"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium ml-1" style={{ color: COLORS.TextSecondary }}>Senha</label>
            <div 
              className="flex items-center rounded-xl px-4 py-3.5 transition-colors focus-within:ring-1 focus-within:ring-blue-500"
              style={{ backgroundColor: COLORS.Surface, border: `1px solid ${COLORS.Border}` }}
            >
              <svg className="w-5 h-5 mr-3" style={{ color: COLORS.TextSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent w-full outline-none text-white placeholder-slate-600"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button type="button" className="text-xs font-medium hover:text-white transition-colors" style={{ color: COLORS.Primary }}>
              Esqueceu a senha?
            </button>
          </div>

          <div className="pt-4">
            <Button type="submit" isLoading={isLoading}>
              Entrar
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-xs" style={{ color: COLORS.TextSecondary }}>
            Ainda não tem conta?{" "}
            <a 
              href="https://desviciar.com.br"
              className="font-bold cursor-pointer hover:underline" 
              style={{ color: COLORS.Primary }}
            >
              Criar agora
            </a>
          </p>
        </div>
      </div>
    </Wrapper>
  );
};