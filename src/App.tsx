import React, { useState, useEffect, Suspense, lazy } from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Lightbox } from './components/Lightbox';
import { HomePage } from './pages/HomePage';
import { WorkPage } from './pages/WorkPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ClientsPage } from './pages/ClientsPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { InsightsPage } from './pages/InsightsPage';
import { InsightDetailPage } from './pages/InsightDetailPage';
import { trackPageView } from './utils/analytics';
import { useContentProtection } from './hooks/useContentProtection';
import { Check, AlertCircle, Info, RefreshCw } from 'lucide-react';

// Route-based Code Splitting: Lazy-load Admin CMS components for optimal public bundle performance
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then((m) => ({ default: m.AdminLogin })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects').then((m) => ({ default: m.AdminProjects })));
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia').then((m) => ({ default: m.AdminMedia })));
const AdminSliders = lazy(() => import('./pages/admin/AdminSliders').then((m) => ({ default: m.AdminSliders })));
const AdminServices = lazy(() => import('./pages/admin/AdminServices').then((m) => ({ default: m.AdminServices })));
const AdminClients = lazy(() => import('./pages/admin/AdminClients').then((m) => ({ default: m.AdminClients })));
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries').then((m) => ({ default: m.AdminInquiries })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then((m) => ({ default: m.AdminSettings })));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics').then((m) => ({ default: m.AdminAnalytics })));
const AdminSEO = lazy(() => import('./pages/admin/AdminSEO').then((m) => ({ default: m.AdminSEO })));
const AdminInsights = lazy(() => import('./pages/admin/AdminInsights').then((m) => ({ default: m.AdminInsights })));
const AdminContentProtection = lazy(() => import('./pages/admin/AdminContentProtection').then((m) => ({ default: m.AdminContentProtection })));
const AdminLogoFavicon = lazy(() => import('./pages/admin/AdminLogoFavicon').then((m) => ({ default: m.AdminLogoFavicon })));

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#090A0F] text-neutral-400 font-mono text-xs gap-3">
      <RefreshCw className="w-5 h-5 text-[#E2B714] animate-spin" />
      <span className="text-white tracking-wider uppercase text-[11px]">Durman Nasar Studio · Loading CMS Portal...</span>
    </div>
  );
}

function AppContent() {
  const { isAdmin, toast } = useStudio();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [adminTab, setAdminTab] = useState('dashboard');

  // Both /cpanel and /admin are recognized as the Studio CMS route
  const isAdminRoute =
    currentPath === '/cpanel' ||
    currentPath.startsWith('/cpanel/') ||
    currentPath === '/admin' ||
    currentPath.startsWith('/admin/');

  const isPublic = !isAdminRoute;

  // Activate Content Protection on public routes
  useContentProtection({ isPublic });

  useEffect(() => {
    document.title = 'Durman Nasar Studio';
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path === currentPath) return;
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
    trackPageView(path, document.title);
  };

  // Render Admin Section (Supporting both /cpanel and /admin)
  if (isAdminRoute) {
    const targetAdminPath = currentPath.startsWith('/cpanel') ? '/cpanel' : '/admin';

    if (!isAdmin) {
      return (
        <Suspense fallback={<AdminLoadingFallback />}>
          <AdminLogin
            onLoginSuccess={() => navigate(targetAdminPath)}
            onBackToSite={() => navigate('/')}
          />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<AdminLoadingFallback />}>
        <AdminLayout
          currentTab={adminTab}
          onTabChange={(tab) => setAdminTab(tab)}
          onViewSite={() => navigate('/')}
        >
          {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={(t) => setAdminTab(t)} />}
          {adminTab === 'projects' && <AdminProjects />}
          {adminTab === 'media' && <AdminMedia />}
          {adminTab === 'logo-favicon' && <AdminLogoFavicon />}
          {adminTab === 'sliders' && <AdminSliders />}
          {adminTab === 'services' && <AdminServices />}
          {adminTab === 'insights' && <AdminInsights />}
          {adminTab === 'clients' && <AdminClients />}
          {adminTab === 'inquiries' && <AdminInquiries />}
          {adminTab === 'analytics' && <AdminAnalytics />}
          {adminTab === 'seo' && <AdminSEO />}
          {adminTab === 'protection' && <AdminContentProtection />}
          {adminTab === 'settings' && <AdminSettings />}
        </AdminLayout>
      </Suspense>
    );
  }

  // Parse route parameters
  const isWorkDetail = currentPath.startsWith('/work/') && currentPath.length > 6;
  const workSlug = isWorkDetail ? currentPath.replace('/work/', '').split('?')[0] : '';

  const isInsightDetail = currentPath.startsWith('/insights/') && currentPath.length > 10;
  const insightSlug = isInsightDetail ? currentPath.replace('/insights/', '').split('?')[0] : '';

  // Extract query parameters for contact page or work filter
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || undefined;
  const initialService = urlParams.get('service') || undefined;

  let PageComponent = <HomePage onNavigate={navigate} />;

  if (currentPath === '/') {
    PageComponent = <HomePage onNavigate={navigate} />;
  } else if (currentPath === '/work') {
    PageComponent = <WorkPage onNavigate={navigate} initialCategory={initialCategory} />;
  } else if (isWorkDetail) {
    PageComponent = <ProjectDetailPage slug={workSlug} onNavigate={navigate} />;
  } else if (currentPath === '/insights') {
    PageComponent = <InsightsPage onNavigate={navigate} />;
  } else if (isInsightDetail) {
    PageComponent = <InsightDetailPage slug={insightSlug} onNavigate={navigate} />;
  } else if (currentPath === '/services') {
    PageComponent = <ServicesPage onNavigate={navigate} />;
  } else if (currentPath === '/about') {
    PageComponent = <AboutPage onNavigate={navigate} />;
  } else if (currentPath === '/clients') {
    PageComponent = <ClientsPage onNavigate={navigate} />;
  } else if (currentPath === '/contact') {
    PageComponent = <ContactPage initialService={initialService} />;
  } else if (currentPath === '/privacy') {
    PageComponent = <PrivacyPage onNavigate={navigate} />;
  } else if (currentPath === '/terms') {
    PageComponent = <TermsPage onNavigate={navigate} />;
  } else {
    PageComponent = <NotFoundPage onNavigate={navigate} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#090A0F] text-[#F3F4F6]">
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      <main className="flex-1">{PageComponent}</main>

      <Footer onNavigate={navigate} />

      <Lightbox onNavigate={navigate} />

      {/* Global Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[150] flex items-center gap-3 px-4 py-3 bg-[#12141F] border border-white/20 text-white text-xs font-mono shadow-2xl animate-in slide-in-from-bottom duration-200">
          {toast.type === 'success' && <Check className="w-4 h-4 text-[#E2B714]" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StudioProvider>
      <AppContent />
    </StudioProvider>
  );
}
