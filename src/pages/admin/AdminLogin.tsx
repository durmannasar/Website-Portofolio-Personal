import React, { useState, useEffect } from 'react';
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
  HelpCircle,
  Sparkles,
  ShieldAlert,
  Unlock,
  ShieldCheck,
} from 'lucide-react';
import { api, setAuthToken } from '../../services/api';
import { useStudio } from '../../context/StudioContext';
import { sendAdminPasswordReset } from '../../services/firebase';
import { AdminUser } from '../../types';

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

  // Forgot password states
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');
  const [forgotStep, setForgotStep] = useState<'options' | 'new_password' | 'success'>('options');
  const [targetEmail, setTargetEmail] = useState('durman.nasar@gmail.com');
  const [customEmail, setCustomEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [emailLinkStatus, setEmailLinkStatus] = useState<{
    sent: boolean;
    sentTo?: string;
    note?: string;
  } | null>(null);

  // Fitur Akses Langsung Masuk (1-Click Direct Access)
  const handleDirectAccess = () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = `dns_session_${Date.now()}_instant_direct`;
      const user: AdminUser = {
        id: 'admin-director-1',
        email: 'drmn@durmannasarstudio.com',
        name: 'Durman Nasar',
        role: 'admin',
      };
      setAuthToken(token);
      localStorage.setItem('dns_client_user', JSON.stringify(user));
      loginAdmin(token, user);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal mengakses portal langsung.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-login if ?direct=true or ?bypass=true is in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('direct') === 'true' || params.get('bypass') === 'true') {
      handleDirectAccess();
    }
  }, []);

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

  // Direct On-Screen Password Reset (No waiting for external email required)
  const handleProceedToDirectReset = (emailToUse: string) => {
    setError(null);
    setTargetEmail(emailToUse);
    setForgotStep('new_password');
  };

  // Submit New Password
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
      const res = await api.resetPassword(targetEmail, newPassword);
      setResetSuccessMessage(res.message || 'Kata sandi berhasil diperbarui!');
      setForgotStep('success');
      setPassword(newPassword);
      setEmail(targetEmail);
    } catch (err: any) {
      setError(err.message || 'Gagal mengatur ulang kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send Firebase Email Link
  const handleSendEmailLink = async (recipient: string) => {
    setError(null);
    setIsLoading(true);
    setEmailLinkStatus(null);
    try {
      await sendAdminPasswordReset(recipient);
      setEmailLinkStatus({
        sent: true,
        sentTo: recipient,
        note:
          recipient.includes('@durmannasarstudio.com')
            ? 'Catatan: Jika domain @durmannasarstudio.com belum memiliki mail server aktif, email mungkin tidak sampai ke inbox. Silakan gunakan opsi Reset Langsung di bawah.'
            : 'Periksa juga folder Spam, Promosi, atau Sampah pada akun Gmail Anda jika belum terlihat dalam 1 menit.',
      });
    } catch (err: any) {
      setEmailLinkStatus({
        sent: false,
        sentTo: recipient,
        note:
          'Pengiriman email Firebase tidak dapat menjangkau alamat ini. Silakan gunakan tombol "Ubah Kata Sandi Langsung di Layar" di bawah ini.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDefaultPassword = () => {
    setEmail('drmn@durmannasarstudio.com');
    setPassword('studio_director_2026');
    setViewMode('login');
    setError(null);
  };

  const handleSwitchToForgot = () => {
    setError(null);
    setTargetEmail('durman.nasar@gmail.com');
    setForgotStep('options');
    setEmailLinkStatus(null);
    setViewMode('forgot');
  };

  const handleSwitchToLogin = () => {
    setError(null);
    setViewMode('login');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="w-full max-w-lg bg-[#0D0F17] border border-white/10 p-6 sm:p-10 space-y-7 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-white/5 border border-white/10 text-[#E2B714] mx-auto flex items-center justify-center">
            {viewMode === 'login' ? <Lock className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            {viewMode === 'login' ? 'Studio CMS Portal' : 'Pemulihan Kata Sandi'}
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            {viewMode === 'login'
              ? 'Durman Nasar Studio · Real-Time Firebase Sync'
              : 'Pusat Bantuan & Atur Ulang Kata Sandi Administrator'}
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
          <div className="space-y-5">
            {/* FITUR AKSES LANGSUNG MASUK (1-CLICK DIRECT ACCESS) */}
            <div className="p-4 bg-gradient-to-b from-[#181B28] to-[#10131E] border-2 border-[#E2B714] space-y-3 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E2B714]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#E2B714]/25 transition-all" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#E2B714] font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-[#E2B714]" />
                  <span>Akses Langsung Masuk</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>1-Click Bypass</span>
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Klik tombol di bawah ini untuk <strong>langsung masuk ke CMS Portal</strong> sebagai Administrator (<code className="text-[#E2B714] font-mono">drmn@durmannasarstudio.com</code>) tanpa perlu memasukkan kata sandi.
              </p>
              <button
                type="button"
                onClick={handleDirectAccess}
                disabled={isLoading}
                className="w-full py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-black bg-[#E2B714] hover:bg-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#E2B714]/20 hover:shadow-[#E2B714]/40"
              >
                <Unlock className="w-4 h-4 stroke-[2.5]" />
                <span>Akses Langsung Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-[#0D0F17] px-3 text-neutral-500 font-semibold">
                  atau masuk manual dengan kredensial
                </span>
              </div>
            </div>

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

            {/* Google Sign In option */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-[#0D0F17] px-2 text-neutral-500">atau</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={async () => {
                setError(null);
                setIsLoading(true);
                try {
                  await loginWithGoogle();
                  onLoginSuccess();
                } catch (err: any) {
                  setError(err.message || 'Login dengan Google gagal');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full py-2.5 text-xs font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/15 transition-colors cursor-pointer flex items-center justify-center gap-2.5 font-mono"
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
              <span>Masuk dengan Google (Akun Pemilik)</span>
            </button>

            {/* Quick Helper for initial password */}
            <div className="p-3 bg-white/[0.02] border border-white/5 text-[11px] text-neutral-400 space-y-1">
              <div className="flex items-center justify-between text-neutral-300">
                <span className="font-mono">Kredensial Default Awal:</span>
                <button
                  type="button"
                  onClick={handleUseDefaultPassword}
                  className="text-[#E2B714] hover:underline cursor-pointer font-mono"
                >
                  Isi Otomatis
                </button>
              </div>
              <p className="font-mono text-neutral-500">
                Email: <span className="text-neutral-300">drmn@durmannasarstudio.com</span> · Sandi: <span className="text-neutral-300">studio_director_2026</span>
              </p>
            </div>
          </form>
          </div>
        )}

        {/* ================= VIEW: FORGOT PASSWORD ================= */}
        {viewMode === 'forgot' && (
          <div className="space-y-5">
            {/* Step 1: Solution Options */}
            {forgotStep === 'options' && (
              <div className="space-y-5">
                {/* Explanation Banner: Mengapa email tidak masuk? */}
                <div className="p-3.5 bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200/90 space-y-2 leading-relaxed">
                  <div className="flex items-center gap-2 font-semibold text-amber-300">
                    <HelpCircle className="w-4 h-4 shrink-0 text-[#E2B714]" />
                    <span>Penyebab Email Tautan Reset Belum Masuk Inbox:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-200/80">
                    <li>
                      <strong>Domain Email (@durmannasarstudio.com):</strong> Jika domain kustom Anda belum memiliki server MX aktif pada cPanel/hosting, email dari luar tidak dapat sampai ke inbox.
                    </li>
                    <li>
                      <strong>Folder Spam / Junk / Promosi:</strong> Email otomatis sering dialihkan ke folder filter penyedia email Anda.
                    </li>
                  </ul>
                </div>

                {/* SOLUTION 1 (RECOMMENDED): Instant Direct Reset without Email */}
                <div className="p-4 bg-[#141724] border border-[#E2B714]/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#E2B714]" />
                    <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                      Solusi 1: Atur Ulang Langsung di Layar (Instan)
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Anda tidak perlu menunggu email masuk. Anda dapat langsung membuat kata sandi baru untuk akun administrator di sini.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleProceedToDirectReset('drmn@durmannasarstudio.com')}
                    className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-[#E2B714] hover:bg-white transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Ubah Kata Sandi Langsung Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* SOLUTION 2: Send Link to Real Gmail Inbox */}
                <div className="p-4 bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-xs font-bold text-neutral-200 font-mono uppercase tracking-wide">
                      Solusi 2: Kirim Tautan ke Email Pemulihan Google
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Kirimkan tautan reset resmi ke akun Gmail pribadi pemilik:
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSendEmailLink('durman.nasar@gmail.com')}
                      className="flex-1 py-2 px-3 text-xs bg-white/10 hover:bg-white/20 text-white font-mono cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#E2B714]" />
                      <span>Kirim ke durman.nasar@gmail.com</span>
                    </button>
                  </div>

                  {/* Custom email option if desired */}
                  <div className="pt-2 border-t border-white/5 flex gap-2">
                    <input
                      type="email"
                      placeholder="Atau masukkan email lain..."
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="flex-1 bg-[#131622] border border-white/10 px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2B714]"
                    />
                    <button
                      type="button"
                      disabled={isLoading || !customEmail}
                      onClick={() => handleSendEmailLink(customEmail)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white text-xs font-mono disabled:opacity-40 cursor-pointer transition-colors"
                    >
                      Kirim
                    </button>
                  </div>

                  {emailLinkStatus && (
                    <div
                      className={`p-3 text-xs flex items-start gap-2 ${
                        emailLinkStatus.sent
                          ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-200'
                          : 'bg-red-950/40 border border-red-800 text-red-200'
                      }`}
                    >
                      {emailLinkStatus.sent ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {emailLinkStatus.sent
                            ? `Tautan reset telah dikirim ke ${emailLinkStatus.sentTo}`
                            : 'Gagal mengirim email'}
                        </p>
                        {emailLinkStatus.note && (
                          <p className="text-[11px] text-neutral-300 leading-relaxed">
                            {emailLinkStatus.note}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* SOLUTION 3: Use Default Master Password */}
                <div className="p-3 bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Kata Sandi Awal Default:</span>
                  <button
                    type="button"
                    onClick={handleUseDefaultPassword}
                    className="text-[#E2B714] hover:underline cursor-pointer"
                  >
                    Gunakan: studio_director_2026
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Input New Password Directly */}
            {forgotStep === 'new_password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    Mengatur ulang kata sandi untuk akun administrator: <strong className="font-mono text-white">{targetEmail}</strong>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 block">
                    Kata Sandi Baru (Minimal 8 Karakter)
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
                      <span>Simpan & Aktifkan Kata Sandi Baru</span>
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
