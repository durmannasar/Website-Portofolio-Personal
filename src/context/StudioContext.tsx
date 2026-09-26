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
  loginAdmin: (token: string, user: AdminUser) => void;
  loginWithGoogle: () => Promise<void>;
  logoutAdmin: () => void;
  isFirebaseLive: boolean;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [clients, setClients] = useState<ClientItem[]>(initialClients);
  const [sliders, setSliders] = useState<HeroSlide[]>(initialHeroSlides);
  const [settings, setSettings] = useState<SiteSettings>(initialSiteSettings);
  const [insights, setInsights] = useState<EditorialInsight[]>(initialEditorialInsights);
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

  // Fetch Fresh Data Directly From Server (Bypassing any cache)
  const refreshData = useCallback(async (forceFreshServer = false) => {
    setIsLoading(true);
    try {
      if (forceFreshServer) {
        // Query directly from Firestore Server (zero local cache)
        const fresh = await fetchFreshDataFromServer();
        if (fresh.projects?.length) setProjects(fresh.projects);
        if (fresh.services?.length) setServices(fresh.services);
        if (fresh.insights?.length) setInsights(fresh.insights);
        if (fresh.clients?.length) setClients(fresh.clients);
        if (fresh.sliders?.length) setSliders(fresh.sliders);
        if (fresh.settings) {
          setSettings(fresh.settings);
          initGTM(fresh.settings.gtmContainerId || 'GTM-MHCKKWJQ');
          if (fresh.settings.customTrackingCode || fresh.settings.gaMeasurementId) {
            initGA(fresh.settings.gaMeasurementId || '', {
              customScript: fresh.settings.customTrackingCode,
              anonymizeIp: fresh.settings.anonymizeIp,
              enhancedMeasurement: fresh.settings.enhancedMeasurement,
            });
          }
        }
        setIsFirebaseLive(true);
      } else {
        // Standard initial load with API fallback
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

        if (projData?.length) setProjects(projData);
        if (srvData?.length) setServices(srvData);
        if (clientData?.length) setClients(clientData);
        if (slideData?.length) setSliders(slideData);
        if (insightData?.length) setInsights(insightData);
        if (settData) {
          setSettings(settData);
          initGTM(settData.gtmContainerId || 'GTM-MHCKKWJQ');
          if (settData.customTrackingCode || settData.gaMeasurementId) {
            initGA(settData.gaMeasurementId || '', {
              customScript: settData.customTrackingCode,
              anonymizeIp: settData.anonymizeIp,
              enhancedMeasurement: settData.enhancedMeasurement,
            });
          }
        }
        if (mediaData) setMedia(mediaData);
      }
    } catch (err) {
      console.warn('Refresh note: falling back to live listeners', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Bootstrap Firebase & Real-time Synchronization
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
            setProjects(updated);
          },
          onServicesUpdate: (updated) => {
            setServices(updated);
          },
          onInsightsUpdate: (updated) => {
            setInsights(updated);
          },
          onClientsUpdate: (updated) => {
            setClients(updated);
          },
          onSlidersUpdate: (updated) => {
            setSliders(updated);
          },
          onSettingsUpdate: (updated) => {
            setSettings(updated);
            initGTM(updated.gtmContainerId || 'GTM-MHCKKWJQ');
            if (updated.customTrackingCode || updated.gaMeasurementId) {
              initGA(updated.gaMeasurementId || '', {
                customScript: updated.customTrackingCode,
                anonymizeIp: updated.anonymizeIp,
                enhancedMeasurement: updated.enhancedMeasurement,
              });
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
