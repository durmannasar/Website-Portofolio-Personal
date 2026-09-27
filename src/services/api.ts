import {
  Project,
  ServiceItem,
  ClientItem,
  HeroSlide,
  SiteSettings,
  MediaFile,
  ContactInquiry,
  EditorialInsight,
  AdminUser,
} from '../types';
import {
  initialProjects,
  initialServices,
  initialClients,
  initialHeroSlides,
  initialSiteSettings,
  initialMediaFiles,
  initialEditorialInsights,
} from '../data/initialData';
import {
  saveProjectToFirestore,
  deleteProjectFromFirestore,
  saveServiceToFirestore,
  deleteServiceFromFirestore,
  saveInsightToFirestore,
  deleteInsightFromFirestore,
  saveClientToFirestore,
  deleteClientFromFirestore,
  saveSliderToFirestore,
  deleteSliderFromFirestore,
  saveSettingsToFirestore,
  submitInquiryToFirestore,
} from './firebase';

const TOKEN_KEY = 'dns_admin_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string, persist = true) => {
  if (persist) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

// Production API Base URL Configuration (Requirement 4):
// - If VITE_API_URL is configured (e.g. https://api.durmannasarstudio.com), use it.
// - If empty, defaults to same-origin relative path '/api/...'
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

export function buildApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Prepend API_BASE_URL if relative path
  let fullUrl = buildApiUrl(url);

  // Append timestamp cache-buster for GET requests to guarantee zero stale cache
  const method = options.method?.toUpperCase() || 'GET';
  if (method === 'GET') {
    const separator = fullUrl.includes('?') ? '&' : '?';
    fullUrl = `${fullUrl}${separator}_t=${Date.now()}`;
  }

  let res: Response;
  try {
    res = await fetch(fullUrl, {
      ...options,
      headers,
      cache: 'no-store',
      credentials: 'include', // Sends HttpOnly session cookies in same-origin and cross-origin CORS
    });
  } catch (networkErr: any) {
    throw new Error(
      `Production API is unreachable (${networkErr.message || 'Network error'}). Check backend deployment and VITE_API_URL.`
    );
  }

  // Guard against static web hosts (Hostinger/Apache/LiteSpeed) returning index.html for unrouted 404 API calls
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error(
      'Production API is unreachable. Check backend deployment and VITE_API_URL.'
    );
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Production Health Check (Requirement 16)
  async checkHealth(): Promise<{ status: string; environment: string }> {
    return await fetchJson<{ status: string; environment: string }>('/api/health');
  },

  // Auth (Requirements 5, 6, 7)
  async login(email: string, password: string) {
    const res = await fetchJson<{ token: string; user: AdminUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    try {
      localStorage.setItem('dns_client_user', JSON.stringify(res.user));
    } catch {}
    return res;
  },

  async getSession(): Promise<{ authenticated: boolean; user: AdminUser }> {
    return await fetchJson<{ authenticated: boolean; user: AdminUser }>('/api/auth/session');
  },

  async getMe(): Promise<AdminUser> {
    try {
      return await fetchJson<AdminUser>('/api/auth/me');
    } catch {
      const stored = localStorage.getItem('dns_client_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
      return { id: 'admin-master', email: '', name: 'Administrator', role: 'admin' };
    }
  },

  async changePassword(newPassword: string) {
    return await fetchJson<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },

  async logout() {
    clearAuthToken();
    try {
      localStorage.removeItem('dns_client_user');
      await fetchJson<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
  },

  // Projects
  async getProjects(category?: string, status?: string): Promise<Project[]> {
    try {
      const query = new URLSearchParams();
      if (category && category !== 'All') query.set('category', category);
      if (status) query.set('status', status);
      const url = `/api/projects${query.toString() ? `?${query.toString()}` : ''}`;
      const data = await fetchJson<Project[]>(url);
      if (!category && !status && Array.isArray(data)) {
        try { localStorage.setItem('dns_projects', JSON.stringify(data)); } catch {}
      }
      return data;
    } catch {
      try {
        const raw = localStorage.getItem('dns_projects');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) {
            let res = list;
            if (category && category !== 'All') res = res.filter((p: Project) => p.category === category);
            if (status) res = res.filter((p: Project) => p.status === status);
            return res;
          }
        }
      } catch {}
      return initialProjects;
    }
  },

  async getProject(slugOrId: string): Promise<Project> {
    try {
      return await fetchJson<Project>(`/api/projects/${slugOrId}`);
    } catch {
      try {
        const raw = localStorage.getItem('dns_projects');
        if (raw) {
          const list: Project[] = JSON.parse(raw);
          const found = list.find((p) => p.slug === slugOrId || p.id === slugOrId);
          if (found) return found;
        }
      } catch {}
      const found = initialProjects.find(
        (p) => p.slug === slugOrId || p.id === slugOrId
      );
      if (!found) throw new Error('Project not found');
      return found;
    }
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const saved = await fetchJson<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    try {
      const raw = localStorage.getItem('dns_projects');
      const list = raw ? JSON.parse(raw) : initialProjects;
      list.unshift(saved);
      localStorage.setItem('dns_projects', JSON.stringify(list));
    } catch {}
    // Instant Firestore Real-Time Cloud Sync
    saveProjectToFirestore(saved).catch((err) =>
      console.warn('Firestore project sync note:', err)
    );
    return saved;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const updated = await fetchJson<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    try {
      const raw = localStorage.getItem('dns_projects');
      const list: Project[] = raw ? JSON.parse(raw) : initialProjects;
      const idx = list.findIndex((p) => p.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updated };
      } else {
        list.push(updated);
      }
      localStorage.setItem('dns_projects', JSON.stringify(list));
    } catch {}
    // Instant Firestore Real-Time Cloud Sync
    saveProjectToFirestore(updated).catch((err) =>
      console.warn('Firestore project update sync note:', err)
    );
    return updated;
  },

  async deleteProject(id: string): Promise<{ success: boolean }> {
    const res = await fetchJson<{ success: boolean }>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
    try {
      const raw = localStorage.getItem('dns_projects');
      if (raw) {
        const list: Project[] = JSON.parse(raw);
        localStorage.setItem('dns_projects', JSON.stringify(list.filter((p) => p.id !== id)));
      }
    } catch {}
    deleteProjectFromFirestore(id).catch((err) =>
      console.warn('Firestore project delete sync note:', err)
    );
    return res;
  },

  // Services
  async getServices(): Promise<ServiceItem[]> {
    try {
      const data = await fetchJson<ServiceItem[]>('/api/services');
      try { localStorage.setItem('dns_services', JSON.stringify(data)); } catch {}
      return data;
    } catch {
      try {
        const raw = localStorage.getItem('dns_services');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) return list;
        }
      } catch {}
      return initialServices;
    }
  },

  async createService(data: Partial<ServiceItem>): Promise<ServiceItem> {
    const saved = await fetchJson<ServiceItem>('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    try {
      const raw = localStorage.getItem('dns_services');
      const list = raw ? JSON.parse(raw) : initialServices;
      list.push(saved);
      localStorage.setItem('dns_services', JSON.stringify(list));
    } catch {}
    saveServiceToFirestore(saved).catch((err) =>
      console.warn('Firestore service sync note:', err)
    );
    return saved;
  },

  async updateService(id: string, data: Partial<ServiceItem>): Promise<ServiceItem> {
    const updated = await fetchJson<ServiceItem>(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    try {
      const raw = localStorage.getItem('dns_services');
      const list: ServiceItem[] = raw ? JSON.parse(raw) : initialServices;
      const idx = list.findIndex((s) => s.id === id);
      if (idx !== -1) list[idx] = { ...list[idx], ...updated };
      localStorage.setItem('dns_services', JSON.stringify(list));
    } catch {}
    saveServiceToFirestore(updated).catch((err) =>
      console.warn('Firestore service update sync note:', err)
    );
    return updated;
  },

  async deleteService(id: string): Promise<{ success: boolean }> {
    const res = await fetchJson<{ success: boolean }>(`/api/services/${id}`, {
      method: 'DELETE',
    });
    try {
      const raw = localStorage.getItem('dns_services');
      if (raw) {
        const list: ServiceItem[] = JSON.parse(raw);
        localStorage.setItem('dns_services', JSON.stringify(list.filter((s) => s.id !== id)));
      }
    } catch {}
    deleteServiceFromFirestore(id).catch((err) =>
      console.warn('Firestore service delete sync note:', err)
    );
    return res;
  },

  // Editorial Insights
  async getInsights(): Promise<EditorialInsight[]> {
    try {
      const data = await fetchJson<EditorialInsight[]>('/api/insights');
      try { localStorage.setItem('dns_insights', JSON.stringify(data)); } catch {}
      return data;
    } catch {
      try {
        const raw = localStorage.getItem('dns_insights');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) return list;
        }
      } catch {}
      return initialEditorialInsights;
    }
  },

  async getInsightBySlug(slug: string): Promise<EditorialInsight> {
    return fetchJson<EditorialInsight>(`/api/insights/${slug}`);
  },

  async createInsight(data: Partial<EditorialInsight>): Promise<EditorialInsight> {
    const saved = await fetchJson<EditorialInsight>('/api/insights', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    try {
      const raw = localStorage.getItem('dns_insights');
      const list = raw ? JSON.parse(raw) : initialEditorialInsights;
      list.unshift(saved);
      localStorage.setItem('dns_insights', JSON.stringify(list));
    } catch {}
    saveInsightToFirestore(saved).catch((err) =>
      console.warn('Firestore insight sync note:', err)
    );
    return saved;
  },

  async updateInsight(id: string, data: Partial<EditorialInsight>): Promise<EditorialInsight> {
    const updated = await fetchJson<EditorialInsight>(`/api/insights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    try {
      const raw = localStorage.getItem('dns_insights');
      const list: EditorialInsight[] = raw ? JSON.parse(raw) : initialEditorialInsights;
      const idx = list.findIndex((i) => i.id === id);
      if (idx !== -1) list[idx] = { ...list[idx], ...updated };
      localStorage.setItem('dns_insights', JSON.stringify(list));
    } catch {}
    saveInsightToFirestore(updated).catch((err) =>
      console.warn('Firestore insight update sync note:', err)
    );
    return updated;
  },

  async deleteInsight(id: string): Promise<{ success: boolean }> {
    const res = await fetchJson<{ success: boolean }>(`/api/insights/${id}`, {
      method: 'DELETE',
    });
    try {
      const raw = localStorage.getItem('dns_insights');
      if (raw) {
        const list: EditorialInsight[] = JSON.parse(raw);
        localStorage.setItem('dns_insights', JSON.stringify(list.filter((i) => i.id !== id)));
      }
    } catch {}
    deleteInsightFromFirestore(id).catch((err) =>
      console.warn('Firestore insight delete sync note:', err)
    );
    return res;
  },

  // Sliders
  async getSliders(): Promise<HeroSlide[]> {
    try {
      const data = await fetchJson<HeroSlide[]>('/api/sliders');
      try { localStorage.setItem('dns_sliders', JSON.stringify(data)); } catch {}
      return data;
    } catch {
      try {
        const raw = localStorage.getItem('dns_sliders');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) return list;
        }
      } catch {}
      return initialHeroSlides;
    }
  },

  async createSlider(data: Partial<HeroSlide>): Promise<HeroSlide> {
    const saved = await fetchJson<HeroSlide>('/api/sliders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    try {
      const raw = localStorage.getItem('dns_sliders');
      const list = raw ? JSON.parse(raw) : initialHeroSlides;
      list.push(saved);
      localStorage.setItem('dns_sliders', JSON.stringify(list));
    } catch {}
    saveSliderToFirestore(saved).catch((err) =>
      console.warn('Firestore slider sync note:', err)
    );
    return saved;
  },

  async updateSlider(id: string, data: Partial<HeroSlide>): Promise<HeroSlide> {
    const updated = await fetchJson<HeroSlide>(`/api/sliders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    try {
      const raw = localStorage.getItem('dns_sliders');
      const list: HeroSlide[] = raw ? JSON.parse(raw) : initialHeroSlides;
      const idx = list.findIndex((s) => s.id === id);
      if (idx !== -1) list[idx] = { ...list[idx], ...updated };
      localStorage.setItem('dns_sliders', JSON.stringify(list));
    } catch {}
    saveSliderToFirestore(updated).catch((err) =>
      console.warn('Firestore slider update sync note:', err)
    );
    return updated;
  },

  async deleteSlider(id: string): Promise<{ success: boolean }> {
    const res = await fetchJson<{ success: boolean }>(`/api/sliders/${id}`, {
      method: 'DELETE',
    });
    try {
      const raw = localStorage.getItem('dns_sliders');
      if (raw) {
        const list: HeroSlide[] = JSON.parse(raw);
        localStorage.setItem('dns_sliders', JSON.stringify(list.filter((s) => s.id !== id)));
      }
    } catch {}
    deleteSliderFromFirestore(id).catch((err) =>
      console.warn('Firestore slider delete sync note:', err)
    );
    return res;
  },

  // Clients
  async getClients(): Promise<ClientItem[]> {
    try {
      const data = await fetchJson<ClientItem[]>('/api/clients');
      try { localStorage.setItem('dns_clients', JSON.stringify(data)); } catch {}
      return data;
    } catch {
      try {
        const raw = localStorage.getItem('dns_clients');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) return list;
        }
      } catch {}
      return initialClients;
    }
  },

  async createClient(data: Partial<ClientItem>): Promise<ClientItem> {
    const saved = await fetchJson<ClientItem>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    try {
      const raw = localStorage.getItem('dns_clients');
      const list = raw ? JSON.parse(raw) : initialClients;
      list.push(saved);
      localStorage.setItem('dns_clients', JSON.stringify(list));
    } catch {}
    saveClientToFirestore(saved).catch((err) =>
      console.warn('Firestore client sync note:', err)
    );
    return saved;
  },

  async updateClient(id: string, data: Partial<ClientItem>): Promise<ClientItem> {
    const updated = await fetchJson<ClientItem>(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    try {
      const raw = localStorage.getItem('dns_clients');
      const list: ClientItem[] = raw ? JSON.parse(raw) : initialClients;
      const idx = list.findIndex((c) => c.id === id);
      if (idx !== -1) list[idx] = { ...list[idx], ...updated };
      localStorage.setItem('dns_clients', JSON.stringify(list));
    } catch {}
    saveClientToFirestore(updated).catch((err) =>
      console.warn('Firestore client update sync note:', err)
    );
    return updated;
  },

  async deleteClient(id: string): Promise<{ success: boolean }> {
    const res = await fetchJson<{ success: boolean }>(`/api/clients/${id}`, {
      method: 'DELETE',
    });
    try {
      const raw = localStorage.getItem('dns_clients');
      if (raw) {
        const list: ClientItem[] = JSON.parse(raw);
        localStorage.setItem('dns_clients', JSON.stringify(list.filter((c) => c.id !== id)));
      }
    } catch {}
    deleteClientFromFirestore(id).catch((err) =>
      console.warn('Firestore client delete sync note:', err)
    );
    return res;
  },

  // Media
  async getMedia(): Promise<MediaFile[]> {
    try {
      return await fetchJson<MediaFile[]>('/api/media');
    } catch {
      return initialMediaFiles;
    }
  },

  async uploadMedia(file: File, altText?: string, title?: string): Promise<MediaFile> {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('altText', altText);
    if (title) formData.append('title', title);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(buildApiUrl('/api/media/upload'), {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload media file');
    }
    return res.json();
  },

  async updateMedia(id: string, data: Partial<MediaFile>): Promise<MediaFile> {
    return fetchJson<MediaFile>(`/api/media/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteMedia(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/api/media/${id}`, {
      method: 'DELETE',
    });
  },

  // Inquiries
  async getInquiries(): Promise<ContactInquiry[]> {
    return fetchJson<ContactInquiry[]>('/api/inquiries');
  },

  async submitInquiry(data: {
    name: string;
    company?: string;
    email: string;
    phone?: string;
    service: string;
    budget?: string;
    timeline?: string;
    description: string;
  }): Promise<{ success: boolean; message: string }> {
    // Both API and direct Firestore
    submitInquiryToFirestore(data).catch((err) =>
      console.warn('Firestore inquiry sync note:', err)
    );
    return fetchJson<{ success: boolean; message: string }>('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateInquiryStatus(
    id: string,
    status: 'new' | 'reviewed' | 'contacted' | 'archived'
  ): Promise<ContactInquiry> {
    return fetchJson<ContactInquiry>(`/api/inquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteInquiry(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/api/inquiries/${id}`, {
      method: 'DELETE',
    });
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    try {
      const data = await fetchJson<SiteSettings>('/api/settings');
      try { localStorage.setItem('dns_site_settings', JSON.stringify(data)); } catch {}
      return data;
    } catch {
      try {
        const raw = localStorage.getItem('dns_site_settings');
        if (raw) return JSON.parse(raw);
      } catch {}
      return initialSiteSettings;
    }
  },

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    try {
      const currentRaw = localStorage.getItem('dns_site_settings');
      const current = currentRaw ? JSON.parse(currentRaw) : initialSiteSettings;
      const merged = { ...current, ...data };
      localStorage.setItem('dns_site_settings', JSON.stringify(merged));
    } catch {}

    const updated = await fetchJson<SiteSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    try { localStorage.setItem('dns_site_settings', JSON.stringify(updated)); } catch {}
    saveSettingsToFirestore(updated).catch((err) =>
      console.warn('Firestore settings update sync note:', err)
    );
    return updated;
  },

  async uploadFavicon(file: File): Promise<{ success: boolean; fileUrl: string; settings: SiteSettings }> {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(buildApiUrl('/api/settings/favicon-upload'), {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          saveSettingsToFirestore(data.settings).catch((err) =>
            console.warn('Firestore settings update sync note:', err)
          );
        }
        return data;
      }
    } catch (err) {
      console.warn('Backend /api/settings/favicon-upload unavailable, activating client fallback:', err);
    }

    // High-fidelity client-side fallback (DataURL encoding, ideal for static Hostinger deployment)
    const base64Url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const updated = await this.updateSettings({
      faviconUrl: base64Url,
      logoUrl: base64Url,
      appleTouchIconUrl: base64Url,
      faviconUpdatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      fileUrl: base64Url,
      settings: updated,
    };
  },

  // Dashboard Stats
  async getStats(): Promise<{
    totalProjects: number;
    publishedProjects: number;
    draftProjects: number;
    totalInquiries: number;
    newInquiries: number;
    totalMedia: number;
    totalClients: number;
    totalServices: number;
    recentInquiries: ContactInquiry[];
  }> {
    return fetchJson('/api/stats');
  },
};
