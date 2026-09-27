import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Project,
  ServiceItem,
  ClientItem,
  HeroSlide,
  SiteSettings,
  MediaFile,
  AdminUser,
  EditorialInsight,
} from '../types';
import { api, getAuthToken, clearAuthToken } from '../services/api';
import { initGA, initGTM, trackPageView } from '../utils/analytics';
import {
  initialProjects,
  initialServices,
  initialClients,
  initialHeroSlides,
  initialSiteSettings,
  initialEditorialInsights,
} from '../data/initialData';
import {
  testConnection,
  seedInitialDataIfEmpty,
  fetchFreshDataFromServer,
  subscribeToFirestore,
  signInWithGooglePopup,
  signOutFirebase,
  subscribeAuthState,
} from '../services/firebase';

export const applyFaviconToDocument = (url?: string) => {
  if (!url || typeof document === 'undefined') return;
  const isSvg = url.toLowerCase().includes('.svg') || url.startsWith('data:image/svg+xml');
  const isPng = url.toLowerCase().includes('.png') || url.startsWith('data:image/png');
  const mimeType = isSvg ? 'image/svg+xml' : isPng ? 'image/png' : 'image/jpeg';
  const versionedUrl = url.startsWith('data:') ? url : url.includes('?') ? url : `${url}?v=${Date.now()}`;

  const linkSvg = document.querySelector("link[type='image/svg+xml']") as HTMLLinkElement | null;
  const linkPng = document.querySelector("link[type='image/png']") as HTMLLinkElement | null;
  const linkIcon = document.querySelector("link[rel='icon']:not([type])") as HTMLLinkElement | null;
  const linkApple = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;

  if (linkSvg) {
    if (!isSvg) linkSvg.type = mimeType;
    linkSvg.href = versionedUrl;
  }
  if (linkPng) {
    linkPng.type = mimeType;
    linkPng.href = versionedUrl;
  }
  if (linkIcon) linkIcon.href = versionedUrl;
  if (linkApple) linkApple.href = versionedUrl;

  const allIcons = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
  allIcons.forEach((el) => {
    el.href = versionedUrl;
  });
};

export interface LightboxState {
  images: string[];
  currentIndex: number;
  title?: string;
  subtitle?: string;
  projectSlug?: string;
  client?: string;
  year?: string;
}

interface StudioContextType {
  projects: Project[];
  services: ServiceItem[];
  clients: ClientItem[];
  sliders: HeroSlide[];
  settings: SiteSettings;
  media: MediaFile[];
  insights: EditorialInsight[];
  isLoading: boolean;
  isAdmin: boolean;
  adminUser: AdminUser | null;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  lightboxData: LightboxState | null;
  openLightbox: (
    urlOrImages: string | string[],
    title?: string,
    startIndex?: number,
    projectSlug?: string,
    subtitle?: string,
    client?: string,
    year?: string
  ) => void;
  closeLightbox: () => void;
  nextLightboxImage: () => void;
  prevLightboxImage: () => void;
  setLightboxIndex: (index: number) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshData: (forceFreshServer?: boolean) => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<SiteSettings>;
  loginAdmin: (token: string, user: AdminUser) => void;
  loginWithGoogle: () => Promise<void>;
  logoutAdmin: () => void;
  isFirebaseLive: boolean;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('dns_projects') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialProjects;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('dns_services') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialServices;
  });

  const [clients, setClients] = useState<ClientItem[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('dns_clients') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialClients;
  });

  const [sliders, setSliders] = useState<HeroSlide[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('dns_sliders') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialHeroSlides;
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('dns_site_settings') : null;
      if (saved) {
        return { ...initialSiteSettings, ...JSON.parse(saved) };
      }
    } catch {}
    return initialSiteSettings;
  });

  const [insights, setInsights] = useState<EditorialInsight[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('dns_insights') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialEditorialInsights;
  });
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseLive, setIsFirebaseLive] = useState(false);

  // Authentication State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Filter Category State
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Lightbox State
  const [lightboxData, setLightboxData] = useState<LightboxState | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToast({ message, type });
      setTimeout(() => {
        setToast(null);
      }, 4000);
    },
    []
  );

  const openLightbox = useCallback(
    (
      urlOrImages: string | string[],
      title?: string,
      startIndex = 0,
      projectSlug?: string,
      subtitle?: string,
      client?: string,
      year?: string
    ) => {
      const rawImages = Array.isArray(urlOrImages) ? urlOrImages : [urlOrImages];
      const validImages = rawImages.filter(Boolean);
      if (validImages.length === 0) return;

      const safeIndex = Math.max(0, Math.min(startIndex, validImages.length - 1));
      setLightboxData({
        images: validImages,
        currentIndex: safeIndex,
        title,
        subtitle,
        projectSlug,
        client,
        year,
      });
    },
    []
  );

  const closeLightbox = useCallback(() => {
    setLightboxData(null);
  }, []);

  const nextLightboxImage = useCallback(() => {
    setLightboxData((prev) => {
      if (!prev || prev.images.length <= 1) return prev;
      return {
        ...prev,
        currentIndex: (prev.currentIndex + 1) % prev.images.length,
      };
    });
  }, []);

  const prevLightboxImage = useCallback(() => {
    setLightboxData((prev) => {
      if (!prev || prev.images.length <= 1) return prev;
      return {
        ...prev,
        currentIndex:
          (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
      };
    });
  }, []);

  const setLightboxIndex = useCallback((index: number) => {
    setLightboxData((prev) => {
      if (!prev) return null;
      const safeIdx = Math.max(0, Math.min(index, prev.images.length - 1));
      return {
        ...prev,
        currentIndex: safeIdx,
      };
    });
  }, []);

  // Fetch Fresh Data (Always loads latest up-to-date content on sign-in, republish, or refresh with zero stale cache)
  const refreshData = useCallback(async (forceFreshServer = false) => {
    setIsLoading(true);
    try {
      // 1. Fetch live API data with strict zero-cache timestamping
      const [projData, srvData, clientData, slideData, settData, mediaData, insightData] =
        await Promise.all([
          api.getProjects(),
          api.getServices(),
          api.getClients(),
          api.getSliders(),
          api.getSettings(),
          api.getMedia(),
          api.getInsights(),
        ]);

      let resolvedProjects = projData;
      let resolvedServices = srvData;
      let resolvedClients = clientData;
      let resolvedSliders = slideData;
      let resolvedSettings = settData;
      let resolvedInsights = insightData;

      // 2. Fetch directly from Firestore Server to check for live cloud mutations
      try {
        const fresh = await fetchFreshDataFromServer();
        if (fresh.projects?.length) resolvedProjects = fresh.projects;
        if (fresh.services?.length) resolvedServices = fresh.services;
        if (fresh.clients?.length) resolvedClients = fresh.clients;
        if (fresh.sliders?.length) resolvedSliders = fresh.sliders;
        if (fresh.insights?.length) resolvedInsights = fresh.insights;
        if (fresh.settings) resolvedSettings = fresh.settings;
        setIsFirebaseLive(true);
      } catch {
        // Continue with latest API/local data
      }

      // 3. Atomically synchronize React state and local storage so any future refresh renders instant up-to-date data
      if (resolvedProjects?.length) {
        setProjects(resolvedProjects);
        try { localStorage.setItem('dns_projects', JSON.stringify(resolvedProjects)); } catch {}
      }
      if (resolvedServices?.length) {
        setServices(resolvedServices);
        try { localStorage.setItem('dns_services', JSON.stringify(resolvedServices)); } catch {}
      }
      if (resolvedClients?.length) {
        setClients(resolvedClients);
        try { localStorage.setItem('dns_clients', JSON.stringify(resolvedClients)); } catch {}
      }
      if (resolvedSliders?.length) {
        setSliders(resolvedSliders);
        try { localStorage.setItem('dns_sliders', JSON.stringify(resolvedSliders)); } catch {}
      }
      if (resolvedInsights?.length) {
        setInsights(resolvedInsights);
        try { localStorage.setItem('dns_insights', JSON.stringify(resolvedInsights)); } catch {}
      }
      if (resolvedSettings) {
        setSettings(resolvedSettings);
        try { localStorage.setItem('dns_site_settings', JSON.stringify(resolvedSettings)); } catch {}
        if (resolvedSettings.faviconUrl || resolvedSettings.logoUrl) {
          applyFaviconToDocument(resolvedSettings.faviconUrl || resolvedSettings.logoUrl);
        }
        initGTM(resolvedSettings.gtmContainerId || 'GTM-MHCKKWJQ');
        if (resolvedSettings.customTrackingCode || resolvedSettings.gaMeasurementId) {
          initGA(resolvedSettings.gaMeasurementId || '', {
            customScript: resolvedSettings.customTrackingCode,
            anonymizeIp: resolvedSettings.anonymizeIp,
            enhancedMeasurement: resolvedSettings.enhancedMeasurement,
          });
        }
      }
      if (mediaData) setMedia(mediaData);
    } catch (err) {
      console.warn('Refresh note: falling back to local cached listeners', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (newSettings: Partial<SiteSettings>): Promise<SiteSettings> => {
      // 1. Immediately update React state for instant UI update on all pages
      let merged: SiteSettings = { ...settings, ...newSettings };
      setSettings(merged);
      try {
        localStorage.setItem('dns_site_settings', JSON.stringify(merged));
      } catch {}

      // 2. Immediately update browser favicon & Apple touch icons
      const targetFavicon = newSettings.faviconUrl || newSettings.logoUrl;
      if (targetFavicon) {
        applyFaviconToDocument(targetFavicon);
      }

      // 3. Persist to API / Firebase
      try {
        const saved = await api.updateSettings(newSettings);
        merged = saved;
        setSettings(saved);
        try {
          localStorage.setItem('dns_site_settings', JSON.stringify(saved));
        } catch {}
      } catch (err) {
        console.warn('API updateSettings fallback note:', err);
      }

      return merged;
    },
    [settings]
  );

  // Bootstrap Firebase & Real-time Synchronization
  useEffect(() => {
    if (settings.faviconUrl) {
      applyFaviconToDocument(settings.faviconUrl);
    }
  }, [settings.faviconUrl]);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const setupFirebase = async () => {
      try {
        await testConnection();
        await seedInitialDataIfEmpty();
        setIsFirebaseLive(true);

        // Real-Time Listener: When CMS updates, Main Site immediately receives changes live
        unsubscribeFirestore = subscribeToFirestore({
          onProjectsUpdate: (updated) => {
            if (updated && updated.length > 0) {
              setProjects(updated);
              try { localStorage.setItem('dns_projects', JSON.stringify(updated)); } catch {}
            }
          },
          onServicesUpdate: (updated) => {
            if (updated && updated.length > 0) {
              setServices(updated);
              try { localStorage.setItem('dns_services', JSON.stringify(updated)); } catch {}
            }
          },
          onInsightsUpdate: (updated) => {
            if (updated && updated.length > 0) {
              setInsights(updated);
              try { localStorage.setItem('dns_insights', JSON.stringify(updated)); } catch {}
            }
          },
          onClientsUpdate: (updated) => {
            if (updated && updated.length > 0) {
              setClients(updated);
              try { localStorage.setItem('dns_clients', JSON.stringify(updated)); } catch {}
            }
          },
          onSlidersUpdate: (updated) => {
            if (updated && updated.length > 0) {
              setSliders(updated);
              try { localStorage.setItem('dns_sliders', JSON.stringify(updated)); } catch {}
            }
          },
          onSettingsUpdate: (updated) => {
            if (updated) {
              setSettings(updated);
              try { localStorage.setItem('dns_site_settings', JSON.stringify(updated)); } catch {}
              if (updated.faviconUrl || updated.logoUrl) {
                applyFaviconToDocument(updated.faviconUrl || updated.logoUrl);
              }
              initGTM(updated.gtmContainerId || 'GTM-MHCKKWJQ');
              if (updated.customTrackingCode || updated.gaMeasurementId) {
                initGA(updated.gaMeasurementId || '', {
                  customScript: updated.customTrackingCode,
                  anonymizeIp: updated.anonymizeIp,
                  enhancedMeasurement: updated.enhancedMeasurement,
                });
              }
            }
          },
        });
      } catch (err) {
        console.warn('Firebase connection check:', err);
      }
    };

    setupFirebase();

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  // Check auth session
  useEffect(() => {
    const unsubAuth = subscribeAuthState((fbUser) => {
      if (fbUser) {
        setIsAdmin(true);
        setAdminUser({
          id: fbUser.uid,
          email: fbUser.email || 'drmn@durmannasarstudio.com',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Studio Director',
          role: 'admin',
        });
        // Force immediate fresh data fetch on Firebase auth change
        refreshData(true);
      }
    });

    const token = getAuthToken();
    if (token) {
      api
        .getMe()
        .then((user) => {
          setIsAdmin(true);
          setAdminUser({
            id: 'admin-1',
            email: user.email,
            name: user.name,
            role: 'admin',
          });
        })
        .catch(() => {
          clearAuthToken();
          setIsAdmin(false);
          setAdminUser(null);
        });
    }

    return () => {
      unsubAuth();
    };
  }, [refreshData]);

  // Initial load
  useEffect(() => {
    refreshData(false);
  }, [refreshData]);

  // Track initial page view
  useEffect(() => {
    trackPageView(window.location.pathname, document.title);
  }, []);

  const loginAdmin = useCallback(
    (_token: string, user: AdminUser) => {
      setIsAdmin(true);
      setAdminUser(user);
      showToast(`Welcome back, ${user.name}`);
      // Force instant fresh fetch directly from server on sign-in (Zero cache)
      refreshData(true);
    },
    [showToast, refreshData]
  );

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const fbUser = await signInWithGooglePopup();
      const user: AdminUser = {
        id: fbUser.uid,
        email: fbUser.email || 'durman.nasar@gmail.com',
        name: fbUser.displayName || 'Durman Nasar',
        role: 'admin',
      };
      const token = `dns_session_${fbUser.uid}_${Date.now()}`;
      localStorage.setItem('dns_admin_token', token);
      localStorage.setItem('dns_client_user', JSON.stringify(user));
      setIsAdmin(true);
      setAdminUser(user);
      showToast(`Signed in with Google as ${user.email}`);
      // Force fresh read from server
      await refreshData(true);
    } catch (err: any) {
      showToast(err.message || 'Google Sign-In failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [showToast, refreshData]);

  const logoutAdmin = useCallback(async () => {
    try {
      await signOutFirebase();
    } catch {
      // ignore
    }
    api.logout();
    setIsAdmin(false);
    setAdminUser(null);
    showToast('Signed out of admin dashboard', 'info');
  }, [showToast]);

  return (
    <StudioContext.Provider
      value={{
        projects,
        services,
        clients,
        sliders,
        settings,
        media,
        insights,
        isLoading,
        isAdmin,
        adminUser,
        activeCategory,
        setActiveCategory,
        lightboxData,
        openLightbox,
        closeLightbox,
        nextLightboxImage,
        prevLightboxImage,
        setLightboxIndex,
        toast,
        showToast,
        refreshData,
        updateSettings,
        loginAdmin,
        loginWithGoogle,
        logoutAdmin,
        isFirebaseLive,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
