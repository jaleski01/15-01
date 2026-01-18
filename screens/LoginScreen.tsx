import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore'; 
import { auth, db } from '../lib/firebase'; 
import { Wrapper } from '../components/Wrapper';
import { Button } from '../components/Button';
import { COLORS, Routes } from '../types';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      if (!userCredential.user) throw new Error("Erro: Usuário não identificado após login.");

      const uid = userCredential.user.uid;
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData?.onboarding_completed) {
          navigate(Routes.DASHBOARD);
        } else {
          navigate(Routes.ONBOARDING);
        }
      } else {
        navigate(Routes.ONBOARDING);
      }
    } catch (err: any) {
      let errorMessage = "Ocorreu um erro.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = "Email ou senha incorretos.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
      setError("Erro ao enviar email. Verifique o endereço.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (mode: boolean) => {
    setIsResetMode(mode);
    setError(null);
    setResetEmailSent(false);
  };

  return (
    <Wrapper noPadding>
      <div className="flex flex-col h-[100dvh] w-full bg-black overflow-hidden">
        
        {/* Área Rolável */}
        <div className="flex-1 overflow-y-auto w-full px-6 scrollbar-hide">
          <div className="flex flex-col items-center pt-24 pb-40">
            
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

            {!isResetMode ? (
              <form onSubmit={handleSubmit} className="w-full space-y-5 animate-fadeIn">
                {error && (
                  <div className="p-3 rounded-lg text-xs font-medium border" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)', color: '#ff8a80', borderColor: 'rgba(211, 47, 47, 0.3)' }}>
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium ml-1" style={{ color: COLORS.TextSecondary }}>Email</label>
                  <div className="flex items-center rounded-xl px-4 py-3.5 transition-colors focus-within:ring-1 focus-within:ring-violet-500" style={{ backgroundColor: COLORS.Surface, border: `1px solid ${COLORS.Border}` }}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="bg-transparent w-full outline-none text-white placeholder-slate-600" required />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium ml-1" style={{ color: COLORS.TextSecondary }}>Senha</label>
                  <div className="flex items-center rounded-xl px-4 py-3.5 transition-colors focus-within:ring-1 focus-within:ring-violet-500" style={{ backgroundColor: COLORS.Surface, border: `1px solid ${COLORS.Border}` }}>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-transparent w-full outline-none text-white placeholder-slate-600" required minLength={6} />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button type="button" onClick={() => toggleMode(true)} className="text-xs font-medium hover:text-white transition-colors" style={{ color: COLORS.Primary }}>
                    Esqueceu a senha?
                  </button>
                </div>

                <div className="pt-4">
                  <Button type="submit" isLoading={isLoading}>Entrar</Button>
                </div>
              </form>
            ) : (
              <div className="w-full space-y-5 animate-fadeIn">
                {resetEmailSent ? (
                  <div className="flex flex-col gap-4">
                    <div className="p-5 rounded-xl border flex items-center gap-3" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                      <div className="p-2 bg-green-500/20 rounded-full text-green-500">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-white font-bold text-sm">Email Enviado!</p>
                    </div>
                    <Button variant="outline" onClick={() => toggleMode(false)} fullWidth>Voltar ao Login</Button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    {error && <div className="p-3 rounded-lg text-xs font-medium border" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)', color: '#ff8a80', borderColor: 'rgba(211, 47, 47, 0.3)' }}>{error}</div>}
                    <div className="space-y-1">
                      <label className="text-xs font-medium ml-1" style={{ color: COLORS.TextSecondary }}>Email Cadastrado</label>
                      <div className="flex items-center rounded-xl px-4 py-3.5 transition-colors focus-within:ring-1 focus-within:ring-violet-500" style={{ backgroundColor: COLORS.Surface, border: `1px solid ${COLORS.Border}` }}>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="bg-transparent w-full outline-none text-white placeholder-slate-600" required />
                      </div>
                    </div>
                    <div className="pt-4 space-y-3">
                      <Button type="submit" isLoading={isLoading}>Enviar Link de Recuperação</Button>
                      <Button type="button" variant="outline" onClick={() => toggleMode(false)} disabled={isLoading}>Voltar ao Login</Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {!isResetMode && (
              <div className="mt-10 text-center">
                <p className="text-xs" style={{ color: COLORS.TextSecondary }}>
                  Ainda não tem conta?{" "}
                  <a href="https://desviciar.com.br" className="font-bold cursor-pointer hover:underline" style={{ color: COLORS.Primary }}>Criar agora</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};