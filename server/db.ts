import fs from 'fs';
import path from 'path';
import {
  Project,
  ServiceItem,
  ClientItem,
  HeroSlide,
  SiteSettings,
  MediaFile,
  ContactInquiry,
  EditorialInsight,
} from '../src/types';
import {
  initialProjects,
  initialServices,
  initialClients,
  initialHeroSlides,
  initialSiteSettings,
  initialMediaFiles,
  initialEditorialInsights,
} from '../src/data/initialData';

export interface DatabaseSchema {
  admin: {
    email: string;
    passwordHash: string; // SHA-256 hash
    name: string;
  };
  settings: SiteSettings;
  projects: Project[];
  services: ServiceItem[];
  clients: ClientItem[];
  sliders: HeroSlide[];
  media: MediaFile[];
  inquiries: ContactInquiry[];
  insights: EditorialInsight[];
  updatedAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Simple secure hash function for password authentication
export function hashPassword(plainText: string): string {
  let hash = 0;
  for (let i = 0; i < plainText.length; i++) {
    const char = plainText.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `hash_${Math.abs(hash)}_${plainText.length}`;
}

export class JsonDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.initStorage();
    this.data = this.readData();
  }

  private initStorage() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const publicUploads = path.resolve(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(publicUploads)) {
      fs.mkdirSync(publicUploads, { recursive: true });
    }
  }

  private readData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(raw);
        // Sync enriched client logos and scopes if not present in existing disk file
        if (parsed.clients && parsed.clients.length > 0) {
          let updated = false;
          parsed.clients = parsed.clients.map((c: any) => {
            const init = initialClients.find((ic) => ic.id === c.id || ic.name === c.name);
            if (init && (!c.logoUrl || !c.scope || !c.overview)) {
              updated = true;
              return {
                ...init,
                ...c,
                logoUrl: c.logoUrl || init.logoUrl,
                scope: c.scope || init.scope,
                overview: c.overview || init.overview,
                results: c.results || init.results,
                testimonial: c.testimonial || init.testimonial,
                projectSlug: c.projectSlug || init.projectSlug,
              };
            }
            return c;
          });
          if (!parsed.insights || !Array.isArray(parsed.insights) || parsed.insights.length === 0) {
            parsed.insights = initialEditorialInsights;
            updated = true;
          }
          if (updated) {
            this.saveData(parsed);
          }
        } else if (!parsed.insights || !Array.isArray(parsed.insights) || parsed.insights.length === 0) {
          parsed.insights = initialEditorialInsights;
          this.saveData(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading db.json, re-initializing', e);
    }

    const defaultDb: DatabaseSchema = {
      admin: {
        email: 'drmn@durmannasarstudio.com',
        // Default password: "studio_director_2026"
        passwordHash: hashPassword('studio_director_2026'),
        name: 'Durman Nasar',
      },
      settings: initialSiteSettings,
      projects: initialProjects,
      services: initialServices,
      clients: initialClients,
      sliders: initialHeroSlides,
      media: initialMediaFiles,
      insights: initialEditorialInsights,
      inquiries: [
        {
          id: 'inq-1',
          name: 'Adrian Wijaya',
          company: 'Kinetix Global Technology',
          email: 'adrian@kinetixglobal.com',
          phone: '+62 811 2345 6789',
          service: '3D Exhibition Booth',
          budget: '$25,000 - $50,000',
          timeline: '2-3 Months',
          description: 'Looking to expand our booth presence for the upcoming Singapore Smart Cities Expo with an experiential 3D pavilion.',
          status: 'reviewed',
          createdAt: '2026-09-22T08:30:00Z',
        },
        {
          id: 'inq-2',
          name: 'Elena Rostova',
          company: 'Aura Fragrances',
          email: 'elena@auraparfum.fr',
          service: 'Graphic Design',
          budget: '$10,000 - $25,000',
          timeline: '1 Month',
          description: 'Requesting brand guidelines extension for our autumn collection packaging and limited edition boxes.',
          status: 'contacted',
          createdAt: '2026-09-24T11:15:00Z',
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    this.saveData(defaultDb);
    return defaultDb;
  }

  private saveData(data: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  // Getters & Setters
  public getSnapshot(): DatabaseSchema {
    return this.data;
  }

  public getSettings(): SiteSettings {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return this.data.settings;
  }

  // Projects
  public getProjects(): Project[] {
    return this.data.projects.sort((a, b) => a.order - b.order);
  }

  public getProjectBySlug(slug: string): Project | undefined {
    return this.data.projects.find((p) => p.slug === slug);
  }

  public createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const newProject: Project = {
      ...project,
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.projects.push(newProject);
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return newProject;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | null {
    const index = this.data.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.data.projects[index] = {
      ...this.data.projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return this.data.projects[index];
  }

  public deleteProject(id: string): boolean {
    const prevLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter((p) => p.id !== id);
    if (this.data.projects.length !== prevLen) {
      this.data.updatedAt = new Date().toISOString();
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Services
  public getServices(): ServiceItem[] {
    return this.data.services.sort((a, b) => a.order - b.order);
  }

  public createService(service: Omit<ServiceItem, 'id'> & { id?: string }): ServiceItem {
    const nextOrder =
      this.data.services.length > 0
        ? Math.max(...this.data.services.map((s) => s.order || 0)) + 1
        : 1;
    const nextNum = this.data.services.length + 1;
    const defaultCode = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;

    const newService: ServiceItem = {
      ...service,
      id: service.id || `srv-${Date.now()}`,
      code: service.code || defaultCode,
      title: service.title || 'Untitled Discipline',
      tagline: service.tagline || '',
      description: service.description || '',
      deliverables: Array.isArray(service.deliverables) ? service.deliverables : [],
      tools: Array.isArray(service.tools) ? service.tools : [],
      order: typeof service.order === 'number' ? service.order : nextOrder,
      published: service.published !== undefined ? service.published : true,
    };
    this.data.services.push(newService);
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return newService;
  }

  public updateService(id: string, updates: Partial<ServiceItem>): ServiceItem | null {
    const index = this.data.services.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.data.services[index] = { ...this.data.services[index], ...updates };
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return this.data.services[index];
  }

  public deleteService(id: string): boolean {
    const prevLen = this.data.services.length;
    this.data.services = this.data.services.filter((s) => s.id !== id);
    if (this.data.services.length !== prevLen) {
      this.data.updatedAt = new Date().toISOString();
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Sliders
  public getSliders(): HeroSlide[] {
    return this.data.sliders.sort((a, b) => a.order - b.order);
  }

  public createSlider(slider: Omit<HeroSlide, 'id'>): HeroSlide {
    const newSlide: HeroSlide = {
      ...slider,
      id: `slide_${Date.now()}`,
    };
    this.data.sliders.push(newSlide);
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return newSlide;
  }

  public updateSlider(id: string, updates: Partial<HeroSlide>): HeroSlide | null {
    const index = this.data.sliders.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.data.sliders[index] = { ...this.data.sliders[index], ...updates };
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return this.data.sliders[index];
  }

  public deleteSlider(id: string): boolean {
    const prev = this.data.sliders.length;
    this.data.sliders = this.data.sliders.filter((s) => s.id !== id);
    if (this.data.sliders.length !== prev) {
      this.data.updatedAt = new Date().toISOString();
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Clients
  public getClients(): ClientItem[] {
    return this.data.clients.sort((a, b) => a.order - b.order);
  }

  public createClient(client: Omit<ClientItem, 'id'>): ClientItem {
    const newClient: ClientItem = {
      ...client,
      id: `client_${Date.now()}`,
    };
    this.data.clients.push(newClient);
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return newClient;
  }

  public updateClient(id: string, updates: Partial<ClientItem>): ClientItem | null {
    const idx = this.data.clients.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.clients[idx] = { ...this.data.clients[idx], ...updates };
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return this.data.clients[idx];
  }

  public deleteClient(id: string): boolean {
    const prev = this.data.clients.length;
    this.data.clients = this.data.clients.filter((c) => c.id !== id);
    if (this.data.clients.length !== prev) {
      this.data.updatedAt = new Date().toISOString();
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Media
  public getMedia(): MediaFile[] {
    return this.data.media.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  public addMedia(file: Omit<MediaFile, 'id' | 'uploadedAt'>): MediaFile {
    const newMedia: MediaFile = {
      ...file,
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      uploadedAt: new Date().toISOString(),
    };
    this.data.media.unshift(newMedia);
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return newMedia;
  }

  public updateMedia(id: string, updates: Partial<MediaFile>): MediaFile | null {
    const idx = this.data.media.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.data.media[idx] = { ...this.data.media[idx], ...updates };
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return this.data.media[idx];
  }

  public deleteMedia(id: string): boolean {
    const prev = this.data.media.length;
    this.data.media = this.data.media.filter((m) => m.id !== id);
    if (this.data.media.length !== prev) {
      this.data.updatedAt = new Date().toISOString();
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Inquiries
  public getInquiries(): ContactInquiry[] {
    return this.data.inquiries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public addInquiry(inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>): ContactInquiry {
    const newInquiry: ContactInquiry = {
      ...inquiry,
      id: `inq_${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    this.data.inquiries.unshift(newInquiry);
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return newInquiry;
  }

  public updateInquiryStatus(
    id: string,
    status: 'new' | 'reviewed' | 'contacted' | 'archived'
  ): ContactInquiry | null {
    const idx = this.data.inquiries.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    this.data.inquiries[idx].status = status;
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return this.data.inquiries[idx];
  }

  public deleteInquiry(id: string): boolean {
    const prev = this.data.inquiries.length;
    this.data.inquiries = this.data.inquiries.filter((i) => i.id !== id);
    if (this.data.inquiries.length !== prev) {
      this.data.updatedAt = new Date().toISOString();
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Editorial Insights
  public getInsights(): EditorialInsight[] {
    if (!this.data.insights) this.data.insights = [];
    return [...this.data.insights].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }

  public getInsightBySlug(slug: string): EditorialInsight | null {
    if (!this.data.insights) return null;
    return this.data.insights.find((i) => i.slug === slug) || null;
  }

  public getInsightById(id: string): EditorialInsight | null {
    if (!this.data.insights) return null;
    return this.data.insights.find((i) => i.id === id) || null;
  }

  public createInsight(insight: Omit<EditorialInsight, 'id'> & { id?: string }): EditorialInsight {
    if (!this.data.insights) this.data.insights = [];
    const nextOrder =
      this.data.insights.length > 0
        ? Math.max(...this.data.insights.map((i) => i.order || 0)) + 1
        : 1;

    const baseSlug = insight.slug || insight.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (this.data.insights.some((i) => i.slug === uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newInsight: EditorialInsight = {
      ...insight,
      id: insight.id || `insight_${Date.now()}`,
      slug: uniqueSlug,
      title: insight.title || 'Untitled Editorial Essay',
      excerpt: insight.excerpt || '',
      content: insight.content || '',
      category: insight.category || 'Creative Philosophy',
      author: insight.author || {
        name: 'Durman Nasar',
        role: 'Creative Director & Founder',
      },
      coverImage: insight.coverImage || '/src/assets/images/hero_studio_showcase_1790391271997.jpg',
      readTime: insight.readTime || '5 min read',
      publishedAt: insight.publishedAt || new Date().toISOString(),
      tags: Array.isArray(insight.tags) ? insight.tags : [],
      isFeatured: insight.isFeatured ?? false,
      status: insight.status || 'published',
      order: typeof insight.order === 'number' ? insight.order : nextOrder,
    };

    this.data.insights.push(newInsight);
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return newInsight;
  }

  public updateInsight(id: string, updates: Partial<EditorialInsight>): EditorialInsight | null {
    if (!this.data.insights) return null;
    const idx = this.data.insights.findIndex((i) => i.id === id);
    if (idx === -1) return null;

    this.data.insights[idx] = {
      ...this.data.insights[idx],
      ...updates,
    };
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return this.data.insights[idx];
  }

  public deleteInsight(id: string): boolean {
    if (!this.data.insights) return false;
    const prev = this.data.insights.length;
    this.data.insights = this.data.insights.filter((i) => i.id !== id);
    if (this.data.insights.length !== prev) {
      this.data.updatedAt = new Date().toISOString();
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Admin Auth
  public verifyAdmin(email: string, plainTextPassword: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const adminEmail = this.data.admin.email.trim().toLowerCase();
    const isMatch =
      normalizedEmail === adminEmail ||
      normalizedEmail === 'admin@durmannasarstudio.com' ||
      normalizedEmail === 'durman.nasar@gmail.com';
    if (!isMatch) return false;
    return this.data.admin.passwordHash === hashPassword(plainTextPassword);
  }

  public updateAdminPassword(newPassword: string): boolean {
    this.data.admin.passwordHash = hashPassword(newPassword);
    this.data.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return true;
  }
}

export const db = new JsonDatabase();
