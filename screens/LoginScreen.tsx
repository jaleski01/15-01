import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore'; 
import { auth, db } from '../lib/firebase'; 
import { Wrapper } from '../components/Wrapper';
import { Button } from '../components/Button';
import { COLORS, Routes } from '../types';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  
  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password States
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // --- LOGIC: LOGIN ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Sign In
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      
      // TS Fix: Ensure user object exists before accessing uid
      if (!userCredential.user) {
          throw new Error("Erro: Usuário não identificado após login.");
      }

      const uid = userCredential.user.uid;

      // 2. Check Firestore for existing profile
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

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

  // --- LOGIC: RESET PASSWORD ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Por favor, digite seu e-mail.");
      return;
    }

    setIsLoading(true);

    try {
      await auth.sendPasswordResetEmail(email);
      setResetEmailSent(true);
    } catch (err: any) {
      console.error("Reset failed", err);
      let errorMessage = "Erro ao enviar email.";

      if (err.code === 'auth/user-not-found') {
        errorMessage = "Nenhuma conta encontrada com este email.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Email inválido.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to switch modes
  const toggleMode = (mode: boolean) => {
    setIsResetMode(mode);
    setError(null);
    setResetEmailSent(false);
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

        {/* Dynamic Title */}
        <h1 className="text-4xl font-bold tracking-tighter text-white mb-2 font-mono text-center">
          {isResetMode ? 'RECUPERAR' : 'DESVICIAR'}
        </h1>
        
        <p className="text-sm mb-12 text-center" style={{ color: COLORS.TextSecondary }}>
          {isResetMode 
            ? 'Enviaremos um link para redefinir sua senha.' 
            : 'Acesse o sistema para prosseguir.'}
        </p>

        {/* --- CONDITIONAL RENDERING START --- */}
        {!isResetMode ? (
          
          /* === LOGIN FORM === */
          <form onSubmit={handleSubmit} className="w-full space-y-5 animate-fadeIn">
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
                className="flex items-center rounded-xl px-4 py-3.5 transition-colors focus-within:ring-1 focus-within:ring-violet-500"
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
                className="flex items-center rounded-xl px-4 py-3.5 transition-colors focus-within:ring-1 focus-within:ring-violet-500"
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
              <button 
                type="button" 
                onClick={() => toggleMode(true)}
                className="text-xs font-medium hover:text-white transition-colors" 
                style={{ color: COLORS.Primary }}
              >
                Esqueceu a senha?
              </button>
            </div>

            <div className="pt-4">
              <Button type="submit" isLoading={isLoading}>
                Entrar
              </Button>
            </div>
          </form>

        ) : (

          /* === FORGOT PASSWORD AREA === */
          <div className="w-full space-y-5 animate-fadeIn">
            {resetEmailSent ? (
              // Success State
              <div className="flex flex-col gap-4">
                <div 
                  className="p-5 rounded-xl border flex items-center gap-3"
                  style={{ 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    borderColor: 'rgba(16, 185, 129, 0.3)' 
                  }}
                >
                  <div className="p-2 bg-green-500/20 rounded-full text-green-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Email Enviado!</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Verifique sua caixa de entrada e spam.</p>
                  </div>
                </div>

                <Button variant="outline" onClick={() => toggleMode(false)} fullWidth>
                  Voltar ao Login
                </Button>
              </div>
            ) : (
              // Reset Form
              <form onSubmit={handleResetPassword} className="space-y-5">
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
                  <label className="text-xs font-medium ml-1" style={{ color: COLORS.TextSecondary }}>Email Cadastrado</label>
                  <div 
                    className="flex items-center rounded-xl px-4 py-3.5 transition-colors focus-within:ring-1 focus-within:ring-violet-500"
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

                <div className="pt-4 space-y-3">
                  <Button type="submit" isLoading={isLoading}>
                    Enviar Link de Recuperação
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => toggleMode(false)}
                    disabled={isLoading}
                  >
                    Voltar ao Login
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
        {/* --- CONDITIONAL RENDERING END --- */}

        {/* Footer (Only show in Login Mode) */}
        {!isResetMode && (
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
        )}
      </div>
    </Wrapper>
  );
};