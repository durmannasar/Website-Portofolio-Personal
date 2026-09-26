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
  const { adminUser, logoutAdmin, services, insights, refreshData, isFirebaseLive, showToast } = useStudio();
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
      <header className="h-16 bg-[#0B0D14] border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 md:hidden text-neutral-400 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white text-base tracking-tight">
              Durman Nasar Studio
            </span>
            <span className="text-[10px] font-mono uppercase bg-[#E2B714]/10 text-[#E2B714] px-2 py-0.5 border border-[#E2B714]/20">
              CMS Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            title="Fetch Fresh Data Directly From Server (Bypass Cache)"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E2B714] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync Fresh Data'}</span>
          </button>

          <button
            onClick={onViewSite}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Shield className="w-3.5 h-3.5 text-[#E2B714]" />
            <span>{adminUser?.email || 'drmn@durmannasarstudio.com'}</span>
          </div>
          <button
            onClick={logoutAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            mobileSidebarOpen ? 'block' : 'hidden'
          } md:block w-72 bg-[#0A0C13] border-r border-white/10 shrink-0 p-4 space-y-6 z-30 fixed md:static inset-y-16 md:inset-y-0 left-0 overflow-y-auto`}
        >
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
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
