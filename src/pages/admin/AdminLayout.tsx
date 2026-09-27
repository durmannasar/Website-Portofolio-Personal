import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Image as ImageIcon,
  Sliders,
  Briefcase,
  Users,
  Inbox,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  ShieldCheck,
  Menu,
  X,
  Activity,
  Search,
  BookOpen,
  RefreshCw,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onViewSite: () => void;
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isAction?: boolean;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onViewSite,
  children,
}) => {
  const { adminUser, settings, logoutAdmin, services, insights, refreshData, isFirebaseLive, showToast } = useStudio();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [newInquiriesCount, setNewInquiriesCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    try {
      await refreshData(true);
      showToast('Data refreshed directly from Firebase servers (0 cache)');
    } catch {
      showToast('Sync updated from active cache');
    } finally {
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    api.getInquiries().then((data) => {
      if (Array.isArray(data)) {
        setNewInquiriesCount(data.filter((i) => i.status === 'new').length);
      }
    }).catch(() => {});
  }, []);

  const menuGroups: MenuGroup[] = [
    {
      title: 'Studio Management',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects & Work', icon: FolderKanban },
        {
          id: 'services',
          label: `Services & Disciplines (${services.length})`,
          icon: Briefcase,
        },
        {
          id: 'insights',
          label: `Editorial Insights (${insights?.length || 0})`,
          icon: BookOpen,
        },
        { id: 'sliders', label: 'Hero Sliders', icon: Sliders },
        { id: 'media', label: 'Media Library', icon: ImageIcon },
        {
          id: 'logo-favicon',
          label: 'Logo & Favicon',
          sublabel: 'Upload (PNG, JPG, SVG)',
          icon: Sparkles,
          badge: 'DNS',
        },
        { id: 'clients', label: 'Clients & Brands', icon: Users },
        {
          id: 'inquiries',
          label: 'Project Inquiries',
          icon: Inbox,
          badge: newInquiriesCount > 0 ? `${newInquiriesCount} New` : undefined,
        },
      ],
    },
    {
      title: 'Intelligence & Telemetry',
      items: [
        {
          id: 'analytics',
          label: 'Telemetry & Analytics',
          sublabel: 'Website Tracking (gtag.js)',
          icon: Activity,
          badge: 'Live',
        },
        {
          id: 'seo',
          label: 'Search Engine Intelligence',
          sublabel: 'SEO & Indexation Management',
          icon: Search,
        },
      ],
    },
    {
      title: 'System Preferences',
      items: [
        {
          id: 'protection',
          label: 'Content & Asset Protection',
          sublabel: 'Anti-Copy, Watermark & Shield',
          icon: ShieldCheck,
          badge: 'Active',
        },
        {
          id: 'settings',
          label: 'Site & Security Settings',
          icon: Settings,
        },
      ],
    },
  ];

  const handleSelectTab = (tabId: string) => {
    onTabChange(tabId);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#07080D] flex flex-col text-neutral-300 font-sans">
      {/* Top Bar for Admin */}
      <header className="h-16 bg-[#0B0D14] border-b border-white/10 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 md:hidden text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-xs shrink-0 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={settings.logoUrl || settings.faviconUrl || '/favicon.svg'}
              alt="DNS Logo"
              className="w-5 h-5 rounded-xs object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/favicon.svg';
              }}
            />
            <span className="font-display font-bold text-white text-sm sm:text-base tracking-tight truncate">
              <span className="hidden sm:inline">Durman Nasar Studio</span>
              <span className="sm:hidden">DNS Studio</span>
            </span>
            <span className="hidden md:inline-block text-[10px] font-mono uppercase bg-[#E2B714]/10 text-[#E2B714] px-2 py-0.5 border border-[#E2B714]/20 shrink-0">
              CMS Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Live Firebase Synced Badge */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/10 text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${isFirebaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-[#E2B714]'}`} />
            <span className="text-neutral-300">
              {isFirebaseLive ? 'Firebase Live Sync' : 'Connecting...'}
            </span>
            <span className="text-[10px] text-[#E2B714] border-l border-white/10 pl-2">
              0s Cache
            </span>
          </div>

          {/* Direct Fresh Fetch Button */}
          <button
            onClick={handleManualSync}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            title="Fetch Fresh Data Directly From Server"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E2B714] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync Fresh Data'}</span>
          </button>

          {/* View Live Site Button */}
          <button
            onClick={onViewSite}
            className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer px-2 py-1.5"
            title="View Live Site"
          >
            <span>View Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Shield className="w-3.5 h-3.5 text-[#E2B714]" />
            <span className="max-w-[130px] truncate">{adminUser?.email || adminUser?.name || 'Administrator'}</span>
          </div>

          {/* Sign Out Button in Header (Optimized for Mobile Touch) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              logoutAdmin();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors cursor-pointer shrink-0"
            title="Sign Out (Keluar)"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar (Responsive Mobile Drawer + Desktop Sidebar) */}
        <aside
          className={`${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } transition-transform duration-200 ease-in-out md:transition-none w-72 bg-[#0A0C13] border-r border-white/10 shrink-0 p-4 z-50 fixed md:static inset-y-0 left-0 flex flex-col justify-between overflow-hidden shadow-2xl md:shadow-none`}
        >
          {/* Mobile Drawer Header */}
          <div className="md:hidden flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <img
                src={settings.logoUrl || settings.faviconUrl || '/favicon.svg'}
                alt="DNS Logo"
                className="w-5 h-5 rounded-xs object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/favicon.svg';
                }}
              />
              <span className="font-display font-bold text-white text-sm">CMS Menu</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/10 cursor-pointer"
              aria-label="Tutup menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {menuGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 px-3 py-1.5 font-bold">
                  {group.title}
                </div>

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white/10 text-white font-semibold border-r-2 border-[#E2B714]'
                          : item.isAction
                          ? 'text-[#E2B714] hover:bg-[#E2B714]/10 hover:text-white'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? 'text-[#E2B714]'
                              : item.isAction
                              ? 'text-[#E2B714]'
                              : 'text-neutral-500'
                          }`}
                        />
                        <div className="text-left truncate">
                          <span className="block truncate">{item.label}</span>
                          {item.sublabel && (
                            <span className="text-[10px] font-mono text-neutral-500 block truncate leading-tight">
                              {item.sublabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 shrink-0 ml-1 font-bold ${
                            item.badge === 'Live'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : item.badge === '+ New'
                              ? 'bg-[#E2B714]/20 text-[#E2B714] border border-[#E2B714]/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Action Footer (Especially for Mobile Responsiveness) */}
          <div className="pt-3 mt-3 border-t border-white/10 space-y-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono text-neutral-400 bg-white/[0.02] border border-white/5 truncate">
              <Shield className="w-3.5 h-3.5 text-[#E2B714] shrink-0" />
              <span className="truncate">{adminUser?.email || adminUser?.name || 'Administrator'}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileSidebarOpen(false);
                logoutAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out (Keluar CMS)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileSidebarOpen(false);
                onViewSite();
              }}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-xs text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer md:hidden"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>Lihat Website Utama</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
