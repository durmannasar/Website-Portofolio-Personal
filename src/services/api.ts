import {
  Project,
  ServiceItem,
  ClientItem,
  HeroSlide,
  SiteSettings,
  MediaFile,
  ContactInquiry,
  EditorialInsight,
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

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetchJson<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe() {
    return fetchJson<{ email: string; name: string; role: string }>('/api/auth/me');
  },

  async changePassword(newPassword: string) {
    return fetchJson<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },

  async requestPasswordReset(email: string) {
    return fetchJson<{ success: boolean; message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(email: string, newPassword: string) {
    return fetchJson<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  },

  logout() {
    clearAuthToken();
  },

  // Projects
  async getProjects(category?: string, status?: string): Promise<Project[]> {
    try {
      const query = new URLSearchParams();
      if (category && category !== 'All') query.set('category', category);
      if (status) query.set('status', status);
      const url = `/api/projects${query.toString() ? `?${query.toString()}` : ''}`;
      return await fetchJson<Project[]>(url);
    } catch {
      return initialProjects;
    }
  },

  async getProject(slugOrId: string): Promise<Project> {
    try {
      return await fetchJson<Project>(`/api/projects/${slugOrId}`);
    } catch {
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
    deleteProjectFromFirestore(id).catch((err) =>
      console.warn('Firestore project delete sync note:', err)
    );
    return res;
  },

  // Services
  async getServices(): Promise<ServiceItem[]> {
    try {
      return await fetchJson<ServiceItem[]>('/api/services');
    } catch {
      return initialServices;
    }
  },

  async createService(data: Partial<ServiceItem>): Promise<ServiceItem> {
    const saved = await fetchJson<ServiceItem>('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    saveServiceToFirestore(updated).catch((err) =>
      console.warn('Firestore service update sync note:', err)
    );
    return updated;
  },

  async deleteService(id: string): Promise<{ success: boolean }> {
    const res = await fetchJson<{ success: boolean }>(`/api/services/${id}`, {
      method: 'DELETE',
    });
    deleteServiceFromFirestore(id).catch((err) =>
      console.warn('Firestore service delete sync note:', err)
    );
    return res;
  },

  // Editorial Insights
  async getInsights(): Promise<EditorialInsight[]> {
    try {
      return await fetchJson<EditorialInsight[]>('/api/insights');
    } catch {
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
    saveInsightToFirestore(updated).catch((err) =>
      console.warn('Firestore insight update sync note:', err)
    );
    return updated;
  },

  async deleteInsight(id: string): Promise<{ success: boolean }> {
    const res = await fetchJson<{ success: boolean }>(`/api/insights/${id}`, {
      method: 'DELETE',
    });
    deleteInsightFromFirestore(id).catch((err) =>
      console.warn('Firestore insight delete sync note:', err)
    );
    return res;
  },

  // Sliders
  async getSliders(): Promise<HeroSlide[]> {
    try {
      return await fetchJson<HeroSlide[]>('/api/sliders');
    } catch {
      return initialHeroSlides;
    }
  },

  async createSlider(data: Partial<HeroSlide>): Promise<HeroSlide> {
    const saved = await fetchJson<HeroSlide>('/api/sliders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    saveSliderToFirestore(updated).catch((err) =>
      console.warn('Firestore slider update sync note:', err)
    );
    return updated;
  },

  async deleteSlider(id: string): Promise<{ success: boolean }> {
    const res = await fetchJson<{ success: boolean }>(`/api/sliders/${id}`, {
      method: 'DELETE',
    });
    deleteSliderFromFirestore(id).catch((err) =>
      console.warn('Firestore slider delete sync note:', err)
    );
    return res;
  },

  // Clients
  async getClients(): Promise<ClientItem[]> {
    try {
      return await fetchJson<ClientItem[]>('/api/clients');
    } catch {
      return initialClients;
    }
  },

  async createClient(data: Partial<ClientItem>): Promise<ClientItem> {
    const saved = await fetchJson<ClientItem>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    saveClientToFirestore(updated).catch((err) =>
      console.warn('Firestore client update sync note:', err)
    );
    return updated;
  },

  async deleteClient(id: string): Promise<{ success: boolean }> {
    const res = await fetchJson<{ success: boolean }>(`/api/clients/${id}`, {
      method: 'DELETE',
    });
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

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers,
      body: formData,
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
      return await fetchJson<SiteSettings>('/api/settings');
    } catch {
      return initialSiteSettings;
    }
  },

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const updated = await fetchJson<SiteSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    saveSettingsToFirestore(updated).catch((err) =>
      console.warn('Firestore settings update sync note:', err)
    );
    return updated;
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
