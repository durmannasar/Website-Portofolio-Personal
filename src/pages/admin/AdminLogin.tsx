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
  HelpCircle,
  Sparkles,
  ShieldAlert,
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

  // Direct On-Screen Password Reset
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
            ? 'Catatan: Jika domain @durmannasarstudio.com belum memiliki mail server aktif, email mungkin tidak sampai ke inbox. Silakan gunakan opsi Reset Langsung di atas.'
            : 'Periksa juga folder Spam, Promosi, atau Sampah pada akun Gmail Anda jika belum terlihat dalam 1 menit.',
      });
    } catch (err: any) {
      setEmailLinkStatus({
        sent: false,
        sentTo: recipient,
        note:
          'Pengiriman email Firebase tidak dapat menjangkau alamat ini. Silakan gunakan tombol "Ubah Kata Sandi Langsung Sekarang" di atas.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToForgot = () => {
    setError(null);
    setTargetEmail('drmn@durmannasarstudio.com');
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
      <div className="w-full max-w-md bg-[#0D0F17] border border-white/10 p-6 sm:p-10 space-y-7 shadow-2xl">
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
          <div className="space-y-5">
            {/* Step 1: Solution Options */}
            {forgotStep === 'options' && (
              <div className="space-y-5">
                {/* Explanation Banner */}
                <div className="p-3.5 bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200/90 space-y-2 leading-relaxed">
                  <div className="flex items-center gap-2 font-semibold text-amber-300">
                    <HelpCircle className="w-4 h-4 shrink-0 text-[#E2B714]" />
                    <span>Penyebab Email Tautan Reset Belum Masuk Inbox:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-200/80">
                    <li>
                      <strong>Domain Email (@durmannasarstudio.com):</strong> Jika domain kustom belum memiliki server MX aktif, email dari luar belum dapat diterima di inbox.
                    </li>
                    <li>
                      <strong>Folder Spam / Junk:</strong> Periksa folder Spam atau Promosi penyedia email Anda.
                    </li>
                  </ul>
                </div>

                {/* SOLUTION 1 (RECOMMENDED): Instant Direct Reset */}
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
                      Solusi 2: Kirim Tautan ke Email Pemulihan
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
