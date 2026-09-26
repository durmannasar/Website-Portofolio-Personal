import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  FileCheck,
  FileEdit,
  Image as ImageIcon,
  Users,
  Inbox,
  Briefcase,
  ArrowRight,
  Plus,
  Upload,
  Eye,
  Sliders,
  Activity,
  Search,
  BookOpen,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';
import { ContactInquiry } from '../../types';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { projects, services, clients, media, insights } = useStudio();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getInquiries()
      .then((data) => setInquiries(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const publishedCount = projects.filter((p) => p.status === 'published').length;
  const draftCount = projects.filter((p) => p.status === 'draft').length;
  const newInquiriesCount = inquiries.filter((i) => i.status === 'new').length;

  const statCards = [
    { label: 'Total Projects', value: projects.length, icon: FolderKanban, tab: 'projects' },
    { label: 'Published Works', value: publishedCount, icon: FileCheck, tab: 'projects' },
    { label: 'Core Services', value: services.length, icon: Briefcase, tab: 'services' },
    { label: 'Editorial Insights', value: insights?.length || 0, icon: BookOpen, tab: 'insights' },
    { label: 'Media Files', value: media.length, icon: ImageIcon, tab: 'media' },
    { label: 'Client Inquiries', value: inquiries.length, highlight: newInquiriesCount > 0, icon: Inbox, tab: 'inquiries' },
    { label: 'Client Brands', value: clients.length, icon: Users, tab: 'clients' },
    { label: 'Telemetry (gtag.js)', value: 'Live GA4', icon: Activity, tab: 'analytics' },
    { label: 'Search Engine SEO', value: '100% Ready', icon: Search, tab: 'seo' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <span className="text-xs font-mono uppercase text-[#E2B714]">
          Studio Command Center
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Welcome back, Durman.
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          Durman Nasar Studio content management, media library, and incoming project brief intake.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(card.tab)}
              className="p-5 bg-[#0C0E16] border border-white/10 hover:border-[#E2B714] transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between text-neutral-500">
                <Icon className="w-4 h-4 group-hover:text-[#E2B714] transition-colors" />
                <span className="text-[11px] font-mono group-hover:text-white transition-colors">
                  View →
                </span>
              </div>
              <div>
                <span className="font-display text-2xl sm:text-3xl font-bold text-white block tabular-nums">
                  {card.value}
                </span>
                <span className="text-xs text-neutral-400 block mt-0.5">
                  {card.label}
                </span>
              </div>
              {card.highlight && (
                <div className="text-[10px] font-mono text-[#E2B714] bg-[#E2B714]/10 px-2 py-0.5 inline-block">
                  {newInquiriesCount} New Unread
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block">
          Quick Workflow Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('projects')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E2B714] text-left transition-colors cursor-pointer space-y-2 group"
          >
            <Plus className="w-5 h-5 text-[#E2B714]" />
            <div>
              <span className="text-xs font-bold text-white block">Add Project</span>
              <span className="text-[11px] text-neutral-500 font-mono">Create Case Study</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('services')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E2B714] text-left transition-colors cursor-pointer space-y-2 group"
          >
            <Briefcase className="w-5 h-5 text-[#E2B714]" />
            <div>
              <span className="text-xs font-bold text-white block">Services & Disciplines</span>
              <span className="text-[11px] text-neutral-500 font-mono">Manage Capabilities</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('insights')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E2B714] text-left transition-colors cursor-pointer space-y-2 group"
          >
            <BookOpen className="w-5 h-5 text-[#E2B714]" />
            <div>
              <span className="text-xs font-bold text-white block">Editorial Insights</span>
              <span className="text-[11px] text-neutral-500 font-mono">Thought Leadership</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('analytics')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E2B714] text-left transition-colors cursor-pointer space-y-2 group"
          >
            <Activity className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-xs font-bold text-white block">Telemetry & gtag.js</span>
              <span className="text-[11px] text-neutral-500 font-mono">Website Tracking</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('seo')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E2B714] text-left transition-colors cursor-pointer space-y-2 group"
          >
            <Search className="w-5 h-5 text-sky-400" />
            <div>
              <span className="text-xs font-bold text-white block">Search Engine SEO</span>
              <span className="text-[11px] text-neutral-500 font-mono">Index & Robots</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('media')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E2B714] text-left transition-colors cursor-pointer space-y-2 group"
          >
            <Upload className="w-5 h-5 text-[#E2B714]" />
            <div>
              <span className="text-xs font-bold text-white block">Upload Media</span>
              <span className="text-[11px] text-neutral-500 font-mono">JPG / PNG / WebP</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('sliders')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E2B714] text-left transition-colors cursor-pointer space-y-2 group"
          >
            <Sliders className="w-5 h-5 text-[#E2B714]" />
            <div>
              <span className="text-xs font-bold text-white block">Manage Sliders</span>
              <span className="text-[11px] text-neutral-500 font-mono">Hero Carousel</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('clients')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E2B714] text-left transition-colors cursor-pointer space-y-2 group"
          >
            <Users className="w-5 h-5 text-[#E2B714]" />
            <div>
              <span className="text-xs font-bold text-white block">Client Directory</span>
              <span className="text-[11px] text-neutral-500 font-mono">Brand Wall</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('inquiries')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E2B714] text-left transition-colors cursor-pointer space-y-2 group"
          >
            <Inbox className="w-5 h-5 text-[#E2B714]" />
            <div>
              <span className="text-xs font-bold text-white block">Review Leads</span>
              <span className="text-[11px] text-neutral-500 font-mono">Incoming Briefs</span>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Inquiries List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Recent Client Inquiries
          </span>
          <button
            onClick={() => onNavigateTab('inquiries')}
            className="text-xs text-[#E2B714] hover:underline flex items-center gap-1 font-mono"
          >
            <span>View All ({inquiries.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {inquiries.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500 bg-[#0C0E16] border border-white/10">
            No incoming inquiries yet.
          </div>
        ) : (
          <div className="divide-y divide-white/10 border border-white/10 bg-[#0C0E16]">
            {inquiries.slice(0, 4).map((inq) => (
              <div
                key={inq.id}
                onClick={() => onNavigateTab('inquiries')}
                className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{inq.name}</span>
                    {inq.company && (
                      <span className="text-xs text-neutral-400">· {inq.company}</span>
                    )}
                    {inq.status === 'new' && (
                      <span className="text-[10px] font-mono text-[#E2B714] bg-[#E2B714]/15 px-1.5 py-0.5">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 truncate max-w-xl">
                    {inq.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-neutral-400 shrink-0">
                  <span className="text-[#E2B714]">{inq.service}</span>
                  <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
