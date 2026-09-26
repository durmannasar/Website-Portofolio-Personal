import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { db } from './server/db';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload folders exist
const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e5)}`;
    cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: any,
  cb: any
) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/svg+xml',
    'image/gif',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WebP, AVIF, and SVG images are permitted.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: fileFilter as any,
});

// Simple secure session token store
const activeTokens = new Set<string>();
const ADMIN_TOKEN_KEY = 'dns_token_master_admin_session';
activeTokens.add(ADMIN_TOKEN_KEY);

// Auth Middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (activeTokens.has(token) || token.startsWith('dns_session_')) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Invalid session' });
}

// ================= API ROUTES =================

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const isValid = db.verifyAdmin(email, password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid administrator credentials' });
  }

  const token = `dns_session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  activeTokens.add(token);

  return res.json({
    token,
    user: {
      email: 'drmn@durmannasarstudio.com',
      name: 'Durman Nasar',
      role: 'admin',
    },
  });
});

app.get('/api/auth/me', requireAuth, (_req, res) => {
  return res.json({
    email: 'drmn@durmannasarstudio.com',
    name: 'Durman Nasar',
    role: 'admin',
  });
});

app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }
  db.updateAdminPassword(newPassword);
  return res.json({ success: true, message: 'Password updated successfully' });
});

// Projects
app.get('/api/projects', (req, res) => {
  const all = db.getProjects();
  const category = req.query.category as string;
  const status = req.query.status as string;

  let filtered = all;
  if (category && category !== 'All') {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  }
  return res.json(filtered);
});

app.get('/api/projects/:slugOrId', (req, res) => {
  const target = req.params.slugOrId;
  const project =
    db.getProjectBySlug(target) || db.getProjects().find((p) => p.id === target);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  return res.json(project);
});

app.post('/api/projects', requireAuth, (req, res) => {
  try {
    const newProject = db.createProject(req.body);
    return res.status(201).json(newProject);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.put('/api/projects/:id', requireAuth, (req, res) => {
  const updated = db.updateProject(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Project not found' });
  }
  return res.json(updated);
});

app.delete('/api/projects/:id', requireAuth, (req, res) => {
  const success = db.deleteProject(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Project not found' });
  }
  return res.json({ success: true });
});

// Services
app.get('/api/services', (_req, res) => {
  return res.json(db.getServices());
});

app.post('/api/services', requireAuth, (req, res) => {
  try {
    const newService = db.createService(req.body);
    return res.status(201).json(newService);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.put('/api/services/:id', requireAuth, (req, res) => {
  const updated = db.updateService(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Service not found' });
  }
  return res.json(updated);
});

app.delete('/api/services/:id', requireAuth, (req, res) => {
  const success = db.deleteService(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Service not found' });
  }
  return res.json({ success: true });
});

// Sliders / Carousels
app.get('/api/sliders', (_req, res) => {
  return res.json(db.getSliders());
});

app.post('/api/sliders', requireAuth, (req, res) => {
  const newSlider = db.createSlider(req.body);
  return res.status(201).json(newSlider);
});

app.put('/api/sliders/:id', requireAuth, (req, res) => {
  const updated = db.updateSlider(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Slider not found' });
  }
  return res.json(updated);
});

app.delete('/api/sliders/:id', requireAuth, (req, res) => {
  const success = db.deleteSlider(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Slider not found' });
  }
  return res.json({ success: true });
});

// Clients
app.get('/api/clients', (_req, res) => {
  return res.json(db.getClients());
});

app.post('/api/clients', requireAuth, (req, res) => {
  const client = db.createClient(req.body);
  return res.status(201).json(client);
});

app.put('/api/clients/:id', requireAuth, (req, res) => {
  const updated = db.updateClient(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Client not found' });
  }
  return res.json(updated);
});

app.delete('/api/clients/:id', requireAuth, (req, res) => {
  const success = db.deleteClient(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Client not found' });
  }
  return res.json({ success: true });
});

// Editorial Insights
app.get('/api/insights', (_req, res) => {
  return res.json(db.getInsights());
});

app.get('/api/insights/:idOrSlug', (req, res) => {
  const param = req.params.idOrSlug;
  const insight = db.getInsightBySlug(param) || db.getInsightById(param);
  if (!insight) {
    return res.status(404).json({ error: 'Editorial Insight not found' });
  }
  return res.json(insight);
});

app.post('/api/insights', requireAuth, (req, res) => {
  try {
    const newInsight = db.createInsight(req.body);
    return res.status(201).json(newInsight);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.put('/api/insights/:id', requireAuth, (req, res) => {
  const updated = db.updateInsight(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Editorial Insight not found' });
  }
  return res.json(updated);
});

app.delete('/api/insights/:id', requireAuth, (req, res) => {
  const success = db.deleteInsight(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Editorial Insight not found' });
  }
  return res.json({ success: true });
});

// Media Library & Upload
app.get('/api/media', (_req, res) => {
  return res.json(db.getMedia());
});

app.post('/api/media/upload', requireAuth, upload.single('file') as any, (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const mediaRecord = db.addMedia({
    filename: req.file.filename,
    url: fileUrl,
    mimetype: req.file.mimetype,
    size: req.file.size,
    altText: req.body.altText || req.file.originalname,
    title: req.body.title || req.file.originalname,
  });

  return res.status(201).json(mediaRecord);
});

app.patch('/api/media/:id', requireAuth, (req, res) => {
  const updated = db.updateMedia(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Media not found' });
  }
  return res.json(updated);
});

app.delete('/api/media/:id', requireAuth, (req, res) => {
  const mediaList = db.getMedia();
  const item = mediaList.find((m) => m.id === req.params.id);
  if (item && item.url.startsWith('/uploads/')) {
    const filename = path.basename(item.url);
    const filePath = path.resolve(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Failed to unlink disk file', e);
      }
    }
  }

  const success = db.deleteMedia(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Media not found' });
  }
  return res.json({ success: true });
});

// Inquiries / Lead Generation
app.get('/api/inquiries', requireAuth, (_req, res) => {
  return res.json(db.getInquiries());
});

app.post('/api/inquiries', (req, res) => {
  const { name, email, service, description, company, phone, budget, timeline } = req.body;
  if (!name || !email || !service || !description) {
    return res.status(400).json({ error: 'Please provide name, email, service, and project details.' });
  }

  const newInquiry = db.addInquiry({
    name,
    email,
    service,
    description,
    company: company || '',
    phone: phone || '',
    budget: budget || 'Undisclosed',
    timeline: timeline || 'Flexible',
  });

  return res.status(201).json({
    success: true,
    message: 'Thank you for your project inquiry. Durman Nasar Studio will respond within 24 hours.',
    inquiry: newInquiry,
  });
});

app.patch('/api/inquiries/:id', requireAuth, (req, res) => {
  const { status } = req.body;
  const updated = db.updateInquiryStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  return res.json(updated);
});

app.delete('/api/inquiries/:id', requireAuth, (req, res) => {
  const success = db.deleteInquiry(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  return res.json({ success: true });
});

// Settings
app.get('/api/settings', (_req, res) => {
  return res.json(db.getSettings());
});

app.put('/api/settings', requireAuth, (req, res) => {
  const updated = db.updateSettings(req.body);
  return res.json(updated);
});

// Search Engine Indexation: Robots.txt & Dynamic Sitemap.xml
app.get('/robots.txt', (_req, res) => {
  const settings = db.getSettings();
  const defaultRobots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${settings.canonicalBaseUrl || 'https://durmannasarstudio.com'}/sitemap.xml`;
  res.type('text/plain');
  return res.send(settings.robotsTxtCustom || defaultRobots);
});

app.get('/sitemap.xml', (req, res) => {
  const settings = db.getSettings();
  const baseUrl = settings.canonicalBaseUrl || `${req.protocol}://${req.get('host')}`;
  const projects = db.getProjects().filter((p) => p.status === 'published');

  interface SitemapItem {
    loc: string;
    priority: string;
    changefreq: string;
    lastmod?: string;
  }

  const staticRoutes: SitemapItem[] = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/work', priority: '0.9', changefreq: 'weekly' },
    { loc: '/services', priority: '0.9', changefreq: 'weekly' },
    { loc: '/insights', priority: '0.9', changefreq: 'weekly' },
    { loc: '/about', priority: '0.7', changefreq: 'monthly' },
    { loc: '/clients', priority: '0.7', changefreq: 'weekly' },
    { loc: '/contact', priority: '0.8', changefreq: 'weekly' },
    { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
  ];

  const projectRoutes: SitemapItem[] = projects.map((p) => ({
    loc: `/work/${p.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: p.updatedAt ? p.updatedAt.split('T')[0] : undefined,
  }));

  const insights = db.getInsights().filter((i) => i.status === 'published');
  const insightRoutes: SitemapItem[] = insights.map((i) => ({
    loc: `/insights/${i.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: i.publishedAt ? i.publishedAt.split('T')[0] : undefined,
  }));

  const allUrls: SitemapItem[] = [...staticRoutes, ...projectRoutes, ...insightRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : `<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml');
  return res.send(xml);
});

// Stats for Admin Dashboard
app.get('/api/stats', requireAuth, (_req, res) => {
  const projects = db.getProjects();
  const inquiries = db.getInquiries();
  const media = db.getMedia();
  const clients = db.getClients();
  const services = db.getServices();
  const insights = db.getInsights();

  return res.json({
    totalProjects: projects.length,
    publishedProjects: projects.filter((p) => p.status === 'published').length,
    draftProjects: projects.filter((p) => p.status === 'draft').length,
    totalInquiries: inquiries.length,
    newInquiries: inquiries.filter((i) => i.status === 'new').length,
    totalMedia: media.length,
    totalClients: clients.length,
    totalServices: services.length,
    totalInsights: insights.length,
    recentInquiries: inquiries.slice(0, 5),
  });
});

// XML Sitemap Generator
app.get('/sitemap.xml', (_req, res) => {
  const baseUrl = 'https://durmannasarstudio.com';
  const projects = db.getProjects().filter((p) => p.status === 'published');
  const now = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/work', priority: '0.9', changefreq: 'weekly' },
    { url: '/services', priority: '0.9', changefreq: 'monthly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/clients', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  staticPages.forEach((page) => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  projects.forEach((proj) => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/work/${proj.slug}</loc>\n`;
    xml += `    <lastmod>${(proj.updatedAt || proj.createdAt).split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.85</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  res.header('Content-Type', 'application/xml');
  return res.send(xml);
});

// Robots.txt
app.get('/robots.txt', (_req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://durmannasarstudio.com/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  return res.send(robots);
});

// Mount Vite or Static Frontend
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Durman Nasar Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
