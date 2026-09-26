# Durman Nasar Studio — Hostinger Production Deployment Guide

This documentation provides the complete, step-by-step production deployment manual for **Durman Nasar Studio** from Google AI Studio / GitHub to **Hostinger**.

---

## 1. Production Architecture Overview

- **Primary Production Domain:** `https://www.durmannasarstudio.com`
- **Canonical URL:** `https://www.durmannasarstudio.com`
- **Studio CMS Portal Routes:** 
  - `https://www.durmannasarstudio.com/cpanel` *(Primary application route)*
  - `https://www.durmannasarstudio.com/admin` *(Safe alternative route)*
- **Administrator Email:** `drmn@durmannasarstudio.com`
- **Studio Contact Information:**
  - Email: `drmn@durmannasarstudio.com`
  - WhatsApp: `+62 856 8439 341`
- **Database & Cloud Persistence:** Google Cloud Firestore (`ai-studio-durmannasarstudi-4ec0cc86-398c-4c60-9ee4-9c0a1e221a32`)
- **Technology Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion, Lucide Icons, Express / Node.js.

---

## 2. Pre-Deployment Validation

Before exporting or pushing your repository to GitHub, verify that the project passes local checks:

```bash
# 1. Clean install all dependencies
npm install

# 2. Run TypeScript strict validation
npm run lint

# 3. Compile optimized production build
npm run build
```

The build will complete with **0 errors** and produce the distribution artifacts inside the `dist/` directory:
- `dist/index.html` (Application entry with canonical SEO tags)
- `dist/.htaccess` (Hostinger Apache / LiteSpeed routing and security configuration)
- `dist/robots.txt` (Search engine directives)
- `dist/sitemap.xml` (Canonical XML sitemap with all case studies)
- `dist/assets/` (Granular code-split JavaScript chunks and optimized CSS)

---

## 3. GitHub Repository Preparation

1. Verify `.gitignore` contains the following exclusions:
   ```gitignore
   node_modules/
   dist/
   build/
   .env*
   !.env.example
   *.log
   .DS_Store
   ```

2. Initialize Git, commit, and push your repository to your private or organization GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: production release ready for Hostinger deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/durmannasar-studio.git
   git push -u origin main
   ```

---

## 4. Hostinger Deployment Options

### Option A: Hostinger Cloud / Web Hosting (Static SPA via Git / File Manager) — *Recommended & Most Cost-Effective*

Hostinger's standard Web Hosting, Premium Hosting, and Cloud Hosting run on high-performance LiteSpeed Web Servers with built-in HTTP/3 and Brotli compression.

#### Method 1: Hostinger Git Deployment (Automated CI/CD)
1. Log in to **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Navigate to **Websites** → Select **durmannasarstudio.com** → **Manage**.
3. In the search bar, type **Git** (under the *Advanced* section).
4. Enter your GitHub repository details:
   - **Repository:** `https://github.com/YOUR_GITHUB_USERNAME/durmannasar-studio.git`
   - **Branch:** `main`
   - **Install directory:** `/`
5. Click **Create** and enable **Auto-Deployment** via the provided GitHub Webhook.
6. Under Hostinger hPanel **Terminal / SSH** or local machine, run:
   ```bash
   npm install
   npm run build
   cp -r dist/* public_html/
   ```

#### Method 2: Manual Upload via Hostinger File Manager
1. Run `npm run build` on your local development machine.
2. In Hostinger hPanel, go to **Files** → **File Manager**.
3. Open `public_html/`.
4. Upload all files and folders located **inside** the `dist/` directory directly into `public_html/`:
   - `public_html/index.html`
   - `public_html/.htaccess` *(Ensure dotfiles are visible in File Manager)*
   - `public_html/robots.txt`
   - `public_html/sitemap.xml`
   - `public_html/assets/`
   - `public_html/uploads/`

---

### Option B: Hostinger VPS / Node.js Application Manager (Fullstack Mode)

If you are using Hostinger VPS (CyberPanel / Ubuntu with Node.js) to run the integrated Express server:

1. Connect to your VPS via SSH:
   ```bash
   ssh root@YOUR_HOSTINGER_VPS_IP
   ```
2. Clone your repository:
   ```bash
   cd /var/www
   git clone https://github.com/YOUR_GITHUB_USERNAME/durmannasar-studio.git
   cd durmannasar-studio
   ```
3. Install production dependencies:
   ```bash
   npm install --production=false
   npm run build
   ```
4. Configure PM2 process manager for zero-downtime execution:
   ```bash
   npm install -g pm2
   pm2 start server.ts --name "durman-nasar-studio" --interpreter tsx
   pm2 startup
   pm2 save
   ```
5. Configure Nginx reverse proxy to port `3000`:
   ```nginx
   server {
       server_name durmannasarstudio.com www.durmannasarstudio.com;
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 5. Hostinger Apache / LiteSpeed `.htaccess` Configuration

The bundled `.htaccess` (located in `public/.htaccess` and copied into `dist/.htaccess`) is pre-configured with:
1. **Force HTTPS Redirect:** Automatically upgrades insecure `http://` visitors to `https://`.
2. **Canonical www Redirect:** Redirects `durmannasarstudio.com` → `https://www.durmannasarstudio.com`.
3. **SPA Client Routing Fallback:** Direct URL visits or browser refreshes on `/cpanel`, `/admin`, `/work`, `/work/[slug]`, `/about`, `/services`, etc. will cleanly render without returning 404 errors.
4. **Physical Asset Pass-Through:** Requests for `.js`, `.css`, images, fonts, `robots.txt`, `sitemap.xml`, and `/uploads/` are served directly without URL rewriting.
5. **Core Web Vitals Caching:** Gzip/Deflate compression and 1-year browser caching for immutable assets.
6. **Security Headers:** `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`.

---

## 6. Domain & DNS Configuration

In your domain registrar (Hostinger DNS Zone Editor, Cloudflare, or Niagahoster):

| Type | Name / Host | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (root) | `Hostinger Server IP` (Found on hPanel dashboard) | `300` / Auto |
| **CNAME** | `www` | `durmannasarstudio.com.` | `300` / Auto |

*Note: Allow 15–30 minutes for global DNS propagation.*

---

## 7. SSL / HTTPS Activation

1. In **Hostinger hPanel**, navigate to **Security** → **SSL**.
2. Select your domain **durmannasarstudio.com** and choose **Install SSL** (Hostinger Lifetime Free SSL / Let's Encrypt).
3. Ensure **Force HTTPS** toggle is switched **ON** in hPanel.
4. Verify both `https://durmannasarstudio.com` and `https://www.durmannasarstudio.com` display the secure padlock icon without mixed-content warnings.

---

## 8. Firebase Production Domain Authorization

To ensure Firestore database persistence and admin authentication function after deployment on your custom domain:

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select project **gen-lang-client-0355985082**.
3. In the left navigation, go to **Authentication** → **Settings** tab.
4. Scroll to **Authorized Domains**.
5. Click **Add Domain** and add:
   - `durmannasarstudio.com`
   - `www.durmannasarstudio.com`
6. Click **Save**.

---

## 9. Google Analytics 4 (GA4) Integration

1. Access the Studio CMS Portal at:
   `https://www.durmannasarstudio.com/cpanel` (or `/admin`).
2. Log in using your administrator credentials (`drmn@durmannasarstudio.com`).
3. Navigate to **System Preferences** → **Site & Security Settings** (or **Analytics** tab).
4. Enter your GA4 Measurement ID:
   `G-DURMANNASAR`
5. Click **Save Configuration**.
6. The Google Analytics script is dynamically loaded and actively tracks:
   - `page_view` (SPA transitions)
   - `portfolio_view` and `project_view`
   - `cta_click`
   - `whatsapp_click`
   - `email_click`
   - `contact_form_submit`

---

## 10. Google Search Console & SEO Verification

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add Property: **URL Prefix** → `https://www.durmannasarstudio.com`.
3. Select **HTML Tag** or **HTML File** verification.
4. In the CMS Portal under **SEO Management** → **Indexation & Robots**, enter your verification token into **Google Search Console Token**.
5. Click **Save Changes**.
6. In Google Search Console, submit your sitemap:
   `https://www.durmannasarstudio.com/sitemap.xml`
7. Check that Google successfully discovers and crawls your pages.

---

## 11. Production Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **404 Not Found on `/cpanel` or `/work/slug` refresh** | Missing `.htaccess` rewrite rules in `public_html/`. | Ensure `.htaccess` exists in `public_html/`. In Hostinger File Manager, click Settings (gear icon) and check **Show Hidden Files (dotfiles)**. |
| **White Screen / Blank Page on load** | Incorrect base URL path. | The project uses root `/` asset paths. Verify assets exist in `public_html/assets/`. |
| **Firebase permission error during CMS save** | Security rules mismatch or unauthorized domain. | Verify you added `www.durmannasarstudio.com` to Firebase Authentication Authorized Domains. |
| **Uploaded images return 403 Forbidden** | Directory permission restrictions. | In File Manager or SSH, set folder permissions for `public_html/uploads` to `755` (`drwxr-xr-x`). |
| **Changes not reflecting after deployment** | Browser cache or LiteSpeed Cache. | Hard refresh the browser (`Ctrl + F5` or `Cmd + Shift + R`). If LiteSpeed Cache is enabled in hPanel, click **Flush All Cache**. |

---

## 12. Support & Maintenance Contacts

- **Lead Engineer & Creative Director:** Durman Nasar (`drmn@durmannasarstudio.com`)
- **Direct WhatsApp:** `+62 856 8439 341`
- **Official Website:** `https://www.durmannasarstudio.com`
