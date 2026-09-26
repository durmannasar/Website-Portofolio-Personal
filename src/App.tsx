import React, { useState, useEffect } from 'react';
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
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminMedia } from './pages/admin/AdminMedia';
import { AdminSliders } from './pages/admin/AdminSliders';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminClients } from './pages/admin/AdminClients';
import { AdminInquiries } from './pages/admin/AdminInquiries';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminSEO } from './pages/admin/AdminSEO';
import { AdminInsights } from './pages/admin/AdminInsights';
import { AdminContentProtection } from './pages/admin/AdminContentProtection';
import { InsightsPage } from './pages/InsightsPage';
import { InsightDetailPage } from './pages/InsightDetailPage';
import { trackPageView } from './utils/analytics';
import { useContentProtection } from './hooks/useContentProtection';
import { Check, AlertCircle, Info, X } from 'lucide-react';

function AppContent() {
  const { isAdmin, toast } = useStudio();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [adminTab, setAdminTab] = useState('dashboard');

  const isPublic = !currentPath.startsWith('/admin');

  // Activate Content Protection on public routes
  useContentProtection({ isPublic });

  useEffect(() => {
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

  // Render Admin Section
  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    if (!isAdmin) {
      return (
        <AdminLogin
          onLoginSuccess={() => navigate('/admin')}
          onBackToSite={() => navigate('/')}
        />
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={(tab) => setAdminTab(tab)}
        onViewSite={() => navigate('/')}
      >
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={(t) => setAdminTab(t)} />}
        {adminTab === 'projects' && <AdminProjects />}
        {adminTab === 'media' && <AdminMedia />}
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
