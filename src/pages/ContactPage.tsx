import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, MapPin, ArrowUpRight, Check, Loader2 } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { api } from '../services/api';
import {
  trackEvent,
  trackContactSubmit,
  trackWhatsAppClick,
  trackEmailClick,
} from '../utils/analytics';

interface ContactPageProps {
  initialService?: string;
}

const BUDGET_OPTIONS = [
  'Under $5,000',
  '$5,000 - $15,000',
  '$15,000 - $35,000',
  '$35,000 - $75,000',
  '$75,000+',
];

const TIMELINE_OPTIONS = [
  'Immediate (Within 2 Weeks)',
  '1 Month',
  '2 - 3 Months',
  'Quarterly / Ongoing Retainer',
  'Flexible',
];

export const ContactPage: React.FC<ContactPageProps> = ({ initialService }) => {
  const { settings, services, showToast } = useStudio();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: initialService || 'Graphic Design',
    budget: '$15,000 - $35,000',
    timeline: '1 Month',
    description: '',
    consent: false,
  });

  useEffect(() => {
    if (initialService) {
      setFormData((prev) => ({ ...prev, service: initialService }));
    }
  }, [initialService]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.description.trim()) {
      setErrorMessage('Please complete your name, email, and project details.');
      return;
    }
    if (!formData.consent) {
      setErrorMessage('Please agree to allow Durman Nasar Studio to review your details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.submitInquiry({
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        budget: formData.budget,
        timeline: formData.timeline,
        description: formData.description,
      });

      trackContactSubmit(formData.service, formData.budget);
      setSubmitSuccess(true);
      showToast('Project inquiry submitted successfully. We will reply within 24 hours.');
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        service: 'Graphic Design',
        budget: '$15,000 - $35,000',
        timeline: '1 Month',
        description: '',
        consent: false,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit inquiry. Please try again or reach via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    trackWhatsAppClick('contact_page');
    const greeting = encodeURIComponent(
      `Hello Durman Nasar Studio! I would like to inquire about ${formData.service || 'a creative commission'} for my company.`
    );
    window.open(`https://wa.me/628568439341?text=${greeting}`, '_blank');
  };

  const handleEmail = () => {
    trackEmailClick('contact_page');
    window.location.href = `mailto:${settings.email || 'drmn@durmannasarstudio.com'}?subject=New%20Project%20Inquiry%20%E2%80%94%20Durman%20Nasar%20Studio`;
  };

  return (
    <div className="pt-28 pb-24 px-6 max-w-7xl mx-auto space-y-20">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl border-b border-white/10 pb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
          Initiate Dialogue
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Start a Project Inquiry
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Tell us about your brand challenge, upcoming launch, or spatial exhibition needs. We review all submissions thoroughly and reply with initial thoughts within 24 business hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Details & Direct Instant Channels */}
        <div className="lg:col-span-4 space-y-10">
          <div className="space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block">
              Direct Studio Channels
            </span>

            {/* Email Box */}
            <div className="p-6 bg-[#0C0E14] border border-white/10 space-y-3">
              <span className="text-xs font-mono text-neutral-500 uppercase">
                Official Studio Email
              </span>
              <button
                onClick={handleEmail}
                className="text-white hover:text-[#E2B714] font-mono text-sm sm:text-base font-medium flex items-center gap-2 cursor-pointer transition-colors text-left break-all"
              >
                <Mail className="w-4 h-4 text-[#E2B714] shrink-0" />
                <span>{settings.email || 'drmn@durmannasarstudio.com'}</span>
              </button>
              <p className="text-xs text-neutral-400">
                Preferred for formal briefs, RFPs, and agency master agreements.
              </p>
            </div>

            {/* WhatsApp Box */}
            <div className="p-6 bg-[#0C0E14] border border-white/10 space-y-3">
              <span className="text-xs font-mono text-neutral-500 uppercase">
                Direct WhatsApp / Urgent
              </span>
              <button
                onClick={handleWhatsApp}
                className="text-white hover:text-[#E2B714] font-mono text-sm sm:text-base font-medium flex items-center gap-2 cursor-pointer transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>{settings.phone || '+62 856 8439 341'}</span>
              </button>
              <p className="text-xs text-neutral-400">
                Direct WhatsApp line for preliminary chats and expedited consultations.
              </p>
            </div>

            {/* Studio HQ */}
            <div className="p-6 bg-[#0C0E14] border border-white/10 space-y-3">
              <span className="text-xs font-mono text-neutral-500 uppercase">
                Studio Location & Timezone
              </span>
              <div className="flex items-center gap-2 text-neutral-200 text-sm font-mono">
                <MapPin className="w-4 h-4 text-[#E2B714] shrink-0" />
                <span>{settings.location || 'Jakarta, Indonesia (GMT+7)'}</span>
              </div>
              <p className="text-xs text-neutral-400">
                Available for on-site client discovery and 3D booth fabrication oversight across Asia-Pacific and internationally.
              </p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-8">
          <div className="bg-[#0A0C12] border border-white/10 p-8 sm:p-12">
            {submitSuccess ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-12 h-12 bg-white/10 text-[#E2B714] mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Inquiry Received with Appreciation
                </h3>
                <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to Durman Nasar Studio. Durman and the creative team will review your project requirements and connect with you shortly.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {errorMessage && (
                  <div className="p-4 bg-red-950/40 border border-red-800 text-xs text-red-200">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                      Your Full Name <span className="text-[#E2B714]">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Marcus Vance"
                      className="w-full bg-[#11131C] border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2B714]"
                    />
                  </div>

                  {/* Company / Brand */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                      Company / Brand Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="e.g. Vance Hospitality Group"
                      className="w-full bg-[#11131C] border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2B714]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                      Email Address <span className="text-[#E2B714]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. marcus@vancegroup.com"
                      className="w-full bg-[#11131C] border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2B714]"
                    />
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                      Phone Number / WhatsApp
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +62 811 0000 0000"
                      className="w-full bg-[#11131C] border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2B714]"
                    />
                  </div>
                </div>

                {/* Service Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                    Discipline Interested In <span className="text-[#E2B714]">*</span>
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full bg-[#11131C] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E2B714]"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.code}. {s.title}
                      </option>
                    ))}
                    <option value="Integrated Multi-Disciplinary Campaign">
                      Integrated Multi-Disciplinary Campaign
                    </option>
                  </select>
                </div>

                {/* Budget & Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                      Estimated Budget Range
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full bg-[#11131C] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E2B714]"
                    >
                      {BUDGET_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                      Target Delivery Timeline
                    </label>
                    <select
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full bg-[#11131C] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E2B714]"
                    >
                      {TIMELINE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Project Description */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                    Project Scope & Objectives <span className="text-[#E2B714]">*</span>
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your brand goals, target audience, key deliverables, and any relevant links or references..."
                    className="w-full bg-[#11131C] border border-white/10 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2B714]"
                  />
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 bg-[#11131C] border-white/20 text-[#E2B714] focus:ring-0 focus:outline-none cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-xs text-neutral-400 leading-relaxed cursor-pointer">
                    I confirm that the details provided are accurate and authorize Durman Nasar Studio to contact me regarding this inquiry in accordance with the studio Privacy Policy.
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-4 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting Brief...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Project Brief</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <span className="text-xs font-mono text-neutral-500">
                    Average response: $\le 24$ hours
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
