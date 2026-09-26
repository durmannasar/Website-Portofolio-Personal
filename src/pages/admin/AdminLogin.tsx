import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Zap,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Send,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api } from '../../services/api';
import { useStudio } from '../../context/StudioContext';
import { sendAdminPasswordReset } from '../../services/firebase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const { loginAdmin, isFirebaseLive } = useStudio();
  
  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password states
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');
  const [forgotStep, setForgotStep] = useState<'verify_email' | 'new_password' | 'success'>('verify_email');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [emailLinkSent, setEmailLinkSent] = useState(false);

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
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Autentikasi gagal. Silakan periksa kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Verify Email for Password Reset
  const handleVerifyResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resetEmail) {
      setError('Mohon masukkan email administrator.');
      return;
    }

    setIsLoading(true);
    try {
      await api.requestPasswordReset(resetEmail);
      setForgotStep('new_password');
    } catch (err: any) {
      setError(err.message || 'Email tidak terdaftar sebagai administrator.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Set New Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 8) {
      setError('Kata sandi baru harus minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.resetPassword(resetEmail, newPassword);
      setResetSuccessMessage(res.message || 'Kata sandi berhasil diperbarui!');
      setForgotStep('success');
      setPassword(newPassword);
      setEmail(resetEmail);
    } catch (err: any) {
      setError(err.message || 'Gagal mengatur ulang kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Send Firebase Email Reset Link
  const handleSendEmailLink = async () => {
    if (!resetEmail) {
      setError('Mohon masukkan email administrator terlebih dahulu.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await sendAdminPasswordReset(resetEmail);
      setEmailLinkSent(true);
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim email tautan reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToForgot = () => {
    setError(null);
    setResetEmail(email || 'drmn@durmannasarstudio.com');
    setForgotStep('verify_email');
    setEmailLinkSent(false);
    setViewMode('forgot');
  };

  const handleSwitchToLogin = () => {
    setError(null);
    setViewMode('login');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md bg-[#0D0F17] border border-white/10 p-8 sm:p-10 space-y-7 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-white/5 border border-white/10 text-[#E2B714] mx-auto flex items-center justify-center">
            {viewMode === 'login' ? <Lock className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            {viewMode === 'login' ? 'Studio CMS Portal' : 'Lupa Kata Sandi'}
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            {viewMode === 'login'
              ? 'Durman Nasar Studio · Real-Time Firebase Sync'
              : 'Pemulihan Akun Administrator Studio'}
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

        {/* ================= VIEW: SIGN IN ================= */}
        {viewMode === 'login' && (
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase text-neutral-400 block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleSwitchToForgot}
                  className="text-[11px] font-mono text-[#E2B714] hover:underline cursor-pointer transition-colors"
                >
                  Lupa kata sandi?
                </button>
              </div>
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
          </form>
        )}

        {/* ================= VIEW: FORGOT PASSWORD ================= */}
        {viewMode === 'forgot' && (
          <div className="space-y-4">
            {/* Step 1: Verify Email */}
            {forgotStep === 'verify_email' && (
              <form onSubmit={handleVerifyResetEmail} className="space-y-4">
                <div className="p-3 bg-white/[0.03] border border-white/10 text-xs text-neutral-300 leading-relaxed">
                  Masukkan email administrator yang terdaftar (<code className="text-[#E2B714]">drmn@durmannasarstudio.com</code>) untuk memverifikasi akun dan membuat kata sandi baru.
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 block">
                    Email Administrator
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="email"
                      required
                      placeholder="drmn@durmannasarstudio.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-[#131622] border border-white/10 pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2B714]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-black bg-[#E2B714] hover:bg-white disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2 font-bold"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Memverifikasi Email...</span>
                    </>
                  ) : (
                    <>
                      <span>Verifikasi & Lanjut Ubah Kata Sandi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Optional Email Link Reset */}
                <div className="pt-2 border-t border-white/10 text-center">
                  <button
                    type="button"
                    onClick={handleSendEmailLink}
                    disabled={isLoading}
                    className="text-xs text-neutral-400 hover:text-[#E2B714] transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto font-mono"
                  >
                    <Send className="w-3 h-3" />
                    <span>Kirim tautan reset ke kotak masuk email</span>
                  </button>
                  {emailLinkSent && (
                    <p className="mt-2 text-xs text-emerald-400 font-mono flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tautan reset telah dikirim ke {resetEmail}!</span>
                    </p>
                  )}
                </div>
              </form>
            )}

            {/* Step 2: Input New Password */}
            {forgotStep === 'new_password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Email terverifikasi: <strong className="font-mono text-white">{resetEmail}</strong></span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 block">
                    Kata Sandi Baru (Min. 8 Karakter)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan kata sandi baru"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#131622] border border-white/10 pl-9 pr-10 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2B714]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 block">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Ketik ulang kata sandi baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#131622] border border-white/10 pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2B714]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-black bg-[#E2B714] hover:bg-white disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2 font-bold"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan Kata Sandi Baru...</span>
                    </>
                  ) : (
                    <>
                      <span>Simpan Kata Sandi Baru</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 3: Success Screen */}
            {forgotStep === 'success' && (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-emerald-950/50 border border-emerald-700 text-xs text-emerald-200 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-semibold text-white text-sm">
                    Kata Sandi Berhasil Diperbarui!
                  </p>
                  <p className="text-neutral-300">
                    {resetSuccessMessage || 'Kata sandi baru telah aktif. Anda dapat langsung masuk sekarang.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSwitchToLogin}
                  className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center justify-center gap-2 font-bold"
                >
                  <span>Masuk dengan Kata Sandi Baru</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Return to login button */}
            {forgotStep !== 'success' && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleSwitchToLogin}
                  className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer font-mono inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Halaman Sign In</span>
                </button>
              </div>
            )}
          </div>
        )}

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
