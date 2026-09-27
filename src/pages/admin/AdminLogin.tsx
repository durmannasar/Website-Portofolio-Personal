import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { api } from '../../services/api';
import { useStudio } from '../../context/StudioContext';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const { loginAdmin, loginWithGoogle, isFirebaseLive } = useStudio();

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Mohon masukkan email dan kata sandi administrator.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      loginAdmin(res.token, res.user);

      // Attempt to authenticate Firebase client SDK with credentials if available
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const { auth } = await import('../../services/firebase');
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch {
        // Optional sync, continue with session
      }

      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Autentikasi gagal. Silakan periksa kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="w-full max-w-md bg-[#0D0F17] border border-white/10 p-6 sm:p-10 space-y-7 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-white/5 border border-white/10 text-[#E2B714] mx-auto flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Studio CMS Portal
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            Durman Nasar Studio · Real-Time Firebase Sync
          </p>
        </div>

        {/* Real-time Status Badge */}
        <div className="p-3 bg-white/[0.02] border border-white/10 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isFirebaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-[#E2B714]'
              }`}
            />
            <span className="text-neutral-300">
              {isFirebaseLive ? 'Firebase Firestore Live' : 'Connecting Cloud Sync...'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-neutral-400">
            <Zap className="w-3 h-3 text-[#E2B714]" />
            <span>0s Cache Latency</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-neutral-400 block">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131622] border border-white/10 pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2B714]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-neutral-400 block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#131622] border border-white/10 pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2B714]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2 font-bold"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating & Fetching Fresh Data...</span>
              </>
            ) : (
              <>
                <span>Sign In & Fetch Fresh Data</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] font-mono uppercase">
              <span className="bg-[#0B0D14] px-2 text-neutral-500">atau</span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setError(null);
              try {
                await loginWithGoogle();
                onLoginSuccess();
              } catch (err: any) {
                setError(err.message || 'Gagal masuk dengan akun Google.');
              }
            }}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Masuk dengan Akun Google</span>
          </button>
        </form>

        <div className="pt-4 border-t border-white/5 text-center">
          <button
            onClick={onBackToSite}
            className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer font-mono"
          >
            ← Kembali ke Website Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};
