import { pgTable, text, serial, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Users table (Firebase Auth + Admin role)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// App configuration & site settings
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Studio Projects
export const projects = pgTable('projects', {
  id: text('id').primaryKey(), // Using project id string (e.g., 'proj-1')
  title: text('title').notNull(),
  category: text('category').notNull(),
  year: text('year').notNull(),
  description: text('description').notNull(),
  featured: text('featured').default('false').notNull(),
  data: jsonb('data').notNull(), // Full project payload (images, client, disciplines, etc.)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Services
export const services = pgTable('services', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category'),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Clients
export const clients = pgTable('clients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  industry: text('industry'),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Hero Sliders
export const heroSliders = pgTable('hero_sliders', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  order: serial('order'),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Media Files
export const mediaFiles = pgTable('media_files', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  type: text('type').notNull(),
  size: text('size').notNull(),
  uploadedAt: text('uploaded_at').notNull(),
  data: jsonb('data'),
});

// Contact Inquiries
export const contactInquiries = pgTable('contact_inquiries', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  status: text('status').default('unread').notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Editorial Insights
export const editorialInsights = pgTable('editorial_insights', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category'),
  publishedAt: text('published_at'),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
