import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { api } from '../../services/api';
import { useStudio } from '../../context/StudioContext';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const { loginAdmin, isFirebaseLive } = useStudio();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      // loginAdmin forces fresh server fetch (bypassing any cache)
      loginAdmin(res.token, res.user);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md bg-[#0D0F17] border border-white/10 p-8 sm:p-10 space-y-7 shadow-2xl">
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
            <span className={`w-2 h-2 rounded-full ${isFirebaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-[#E2B714]'}`} />
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
                placeholder="drmn@durmannasarstudio.com"
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
            className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
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
        </form>

        <div className="pt-4 border-t border-white/5 text-center">
          <button
            onClick={onBackToSite}
            className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer font-mono"
          >
            ← Return to Public Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};
