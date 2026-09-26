import React, { useState } from 'react';
import { Check, Shield, Save, Lock, Globe } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';
import { SiteSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, showToast } = useStudio();
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      showToast('Studio settings and SEO configuration updated');
    } catch (err: any) {
      showToast(err.message || 'Error saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changePassword(newPassword);
      showToast('Administrator password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="space-y-2 border-b border-white/10 pb-6">
        <span className="text-xs font-mono uppercase text-[#E2B714]">
          Studio System Parameters
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Site Settings & SEO Configuration
        </h1>
        <p className="text-xs text-neutral-400">
          Manage official contact touchpoints, Google Analytics 4, Search Console tags, and admin credentials.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8 text-xs">
        {/* Studio Identity & Contacts */}
        <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
          <span className="font-mono uppercase font-bold text-neutral-200 block text-sm">
            Official Studio Touchpoints
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-neutral-400 uppercase">Studio Name</label>
              <input
                type="text"
                value={formData.studioName}
                onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-neutral-400 uppercase">Tagline / Motto</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-neutral-400 uppercase">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-neutral-400 uppercase">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-neutral-400 uppercase">WhatsApp (Digits)</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-neutral-400 uppercase">Base Location & Timezone</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono text-neutral-400 uppercase">Studio Biography</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
            />
          </div>
        </div>

        {/* Analytics & Search Console */}
        <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
          <span className="font-mono uppercase font-bold text-neutral-200 block text-sm">
            Analytics & Search Engine Indexing
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-neutral-400 uppercase">
                Google Analytics 4 (GA4) Measurement ID
              </label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={formData.gaMeasurementId}
                onChange={(e) => setFormData({ ...formData, gaMeasurementId: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white font-mono"
              />
              <span className="text-[10px] text-neutral-500 font-mono">
                Enables real-time event telemetry across pages and inquiries.
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-neutral-400 uppercase">
                Google Search Console Verification Token
              </label>
              <input
                type="text"
                placeholder="google-site-verification=..."
                value={formData.searchConsoleVerification}
                onChange={(e) =>
                  setFormData({ ...formData, searchConsoleVerification: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white font-mono"
              />
              <span className="text-[10px] text-neutral-500 font-mono">
                Verifies domain ownership in Google Search Console.
              </span>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
          <span className="font-mono uppercase font-bold text-neutral-200 block text-sm">
            Social Media & External Channels
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-neutral-400 uppercase">Instagram URL</label>
              <input
                type="text"
                value={formData.socials?.instagram || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socials: { ...formData.socials, instagram: e.target.value },
                  })
                }
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-neutral-400 uppercase">LinkedIn URL</label>
              <input
                type="text"
                value={formData.socials?.linkedin || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socials: { ...formData.socials, linkedin: e.target.value },
                  })
                }
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-neutral-400 uppercase">Behance Portfolio</label>
              <input
                type="text"
                value={formData.socials?.behance || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socials: { ...formData.socials, behance: e.target.value },
                  })
                }
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-neutral-400 uppercase">Vimeo Video Channel</label>
              <input
                type="text"
                value={formData.socials?.vimeo || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socials: { ...formData.socials, vimeo: e.target.value },
                  })
                }
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Studio Configuration</span>
        </button>
      </form>

      {/* Password Change Section */}
      <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
        <span className="font-mono uppercase font-bold text-neutral-200 block text-sm">
          Update Administrator Access Password
        </span>
        <p className="text-xs text-neutral-400">
          Ensure strong password complexity to safeguard CMS and client inquiry databases.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-md">
          <div className="space-y-1">
            <label className="font-mono text-neutral-400 uppercase">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono text-neutral-400 uppercase">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer"
          >
            {isChangingPassword ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
