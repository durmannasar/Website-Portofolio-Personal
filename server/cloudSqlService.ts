import { db } from '../src/db/index.ts';
import {
  projects,
  services,
  clients,
  heroSliders,
  siteSettings,
  mediaFiles,
  contactInquiries,
  editorialInsights,
} from '../src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import {
  initialProjects,
  initialServices,
  initialClients,
  initialHeroSlides,
  initialSiteSettings,
  initialMediaFiles,
  initialEditorialInsights,
} from '../src/data/initialData';

export async function seedCloudSqlIfEmpty() {
  try {
    // Check projects
    const existingProjects = await db.select().from(projects).limit(1);
    if (existingProjects.length === 0) {
      console.log('Seeding initial projects to Cloud SQL...');
      for (const p of initialProjects) {
        await db.insert(projects).values({
          id: p.id,
          title: p.title,
          category: p.category,
          year: p.year,
          description: p.description,
          featured: p.isFeatured ? 'true' : 'false',
          data: p as any,
        });
      }
    }

    // Check settings
    const existingSettings = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'global_settings'))
      .limit(1);
    if (existingSettings.length === 0) {
      console.log('Seeding initial site settings to Cloud SQL...');
      await db.insert(siteSettings).values({
        key: 'global_settings',
        data: initialSiteSettings as any,
      });
    }

    // Check services
    const existingServices = await db.select().from(services).limit(1);
    if (existingServices.length === 0) {
      for (const s of initialServices) {
        await db.insert(services).values({
          id: s.id,
          title: s.title,
          category: '',
          data: s as any,
        });
      }
    }

    // Check clients
    const existingClients = await db.select().from(clients).limit(1);
    if (existingClients.length === 0) {
      for (const c of initialClients) {
        await db.insert(clients).values({
          id: c.id,
          name: c.name,
          industry: c.industry || '',
          data: c as any,
        });
      }
    }

    // Check hero sliders
    const existingSliders = await db.select().from(heroSliders).limit(1);
    if (existingSliders.length === 0) {
      for (const sl of initialHeroSlides) {
        await db.insert(heroSliders).values({
          id: sl.id,
          title: sl.headline,
          subtitle: sl.subheadline || '',
          data: sl as any,
        });
      }
    }

    // Check editorial insights
    const existingInsights = await db.select().from(editorialInsights).limit(1);
    if (existingInsights.length === 0) {
      for (const ins of initialEditorialInsights) {
        await db.insert(editorialInsights).values({
          id: ins.id,
          title: ins.title,
          category: ins.category || '',
          publishedAt: ins.publishedAt || '',
          data: ins as any,
        });
      }
    }

    // Check media files
    const existingMedia = await db.select().from(mediaFiles).limit(1);
    if (existingMedia.length === 0) {
      for (const m of initialMediaFiles) {
        await db.insert(mediaFiles).values({
          id: m.id,
          name: m.title || m.filename,
          url: m.url,
          type: m.mimetype,
          size: String(m.size),
          uploadedAt: m.uploadedAt,
          data: m as any,
        });
      }
    }

    console.log('Cloud SQL database seeding verification complete.');
  } catch (error) {
    console.error('Error seeding Cloud SQL data:', error);
  }
}

// Data service helpers using Drizzle ORM
export async function getSqlProjects() {
  try {
    const rows = await db.select().from(projects);
    return rows.map((r) => r.data);
  } catch (error) {
    console.error('getSqlProjects failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function saveSqlProject(projectData: any) {
  try {
    const id = projectData.id || `proj_${Date.now()}`;
    const normalized = { ...projectData, id };
    await db
      .insert(projects)
      .values({
        id,
        title: normalized.title || 'Untitled',
        category: normalized.category || 'General',
        year: normalized.year || new Date().getFullYear().toString(),
        description: normalized.description || '',
        featured: normalized.featured ? 'true' : 'false',
        data: normalized,
      })
      .onConflictDoUpdate({
        target: projects.id,
        set: {
          title: normalized.title || 'Untitled',
          category: normalized.category || 'General',
          year: normalized.year || new Date().getFullYear().toString(),
          description: normalized.description || '',
          featured: normalized.featured ? 'true' : 'false',
          data: normalized,
          updatedAt: new Date(),
        },
      });
    return normalized;
  } catch (error) {
    console.error('saveSqlProject failed:', error);
    throw new Error('Failed to save project', { cause: error });
  }
}

export async function deleteSqlProject(id: string) {
  try {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  } catch (error) {
    console.error('deleteSqlProject failed:', error);
    throw new Error('Failed to delete project', { cause: error });
  }
}

export async function getSqlSettings() {
  try {
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'global_settings'))
      .limit(1);
    if (rows.length > 0) {
      return rows[0].data;
    }
    return initialSiteSettings;
  } catch (error) {
    console.error('getSqlSettings failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function updateSqlSettings(newSettings: any) {
  try {
    await db
      .insert(siteSettings)
      .values({
        key: 'global_settings',
        data: newSettings,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          data: newSettings,
          updatedAt: new Date(),
        },
      });
    return newSettings;
  } catch (error) {
    console.error('updateSqlSettings failed:', error);
    throw new Error('Failed to update settings', { cause: error });
  }
}

export async function getSqlServices() {
  try {
    const rows = await db.select().from(services);
    return rows.map((r) => r.data);
  } catch (error) {
    console.error('getSqlServices failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function saveSqlService(serviceData: any) {
  try {
    const id = serviceData.id || `srv_${Date.now()}`;
    const normalized = { ...serviceData, id };
    await db
      .insert(services)
      .values({
        id,
        title: normalized.title || 'Untitled',
        category: normalized.category || '',
        data: normalized,
      })
      .onConflictDoUpdate({
        target: services.id,
        set: {
          title: normalized.title || 'Untitled',
          category: normalized.category || '',
          data: normalized,
        },
      });
    return normalized;
  } catch (error) {
    console.error('saveSqlService failed:', error);
    throw new Error('Failed to save service', { cause: error });
  }
}

export async function deleteSqlService(id: string) {
  try {
    await db.delete(services).where(eq(services.id, id));
    return true;
  } catch (error) {
    console.error('deleteSqlService failed:', error);
    throw new Error('Failed to delete service', { cause: error });
  }
}

export async function getSqlClients() {
  try {
    const rows = await db.select().from(clients);
    return rows.map((r) => r.data);
  } catch (error) {
    console.error('getSqlClients failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function saveSqlClient(clientData: any) {
  try {
    const id = clientData.id || `client_${Date.now()}`;
    const normalized = { ...clientData, id };
    await db
      .insert(clients)
      .values({
        id,
        name: normalized.name || 'Untitled',
        industry: normalized.industry || '',
        data: normalized,
      })
      .onConflictDoUpdate({
        target: clients.id,
        set: {
          name: normalized.name || 'Untitled',
          industry: normalized.industry || '',
          data: normalized,
        },
      });
    return normalized;
  } catch (error) {
    console.error('saveSqlClient failed:', error);
    throw new Error('Failed to save client', { cause: error });
  }
}

export async function deleteSqlClient(id: string) {
  try {
    await db.delete(clients).where(eq(clients.id, id));
    return true;
  } catch (error) {
    console.error('deleteSqlClient failed:', error);
    throw new Error('Failed to delete client', { cause: error });
  }
}

export async function getSqlHeroSliders() {
  try {
    const rows = await db.select().from(heroSliders);
    return rows.map((r) => r.data);
  } catch (error) {
    console.error('getSqlHeroSliders failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function saveSqlHeroSlider(slideData: any) {
  try {
    const id = slideData.id || `slide_${Date.now()}`;
    const normalized = { ...slideData, id };
    await db
      .insert(heroSliders)
      .values({
        id,
        title: normalized.title || 'Untitled',
        subtitle: normalized.subtitle || '',
        data: normalized,
      })
      .onConflictDoUpdate({
        target: heroSliders.id,
        set: {
          title: normalized.title || 'Untitled',
          subtitle: normalized.subtitle || '',
          data: normalized,
        },
      });
    return normalized;
  } catch (error) {
    console.error('saveSqlHeroSlider failed:', error);
    throw new Error('Failed to save slider', { cause: error });
  }
}

export async function deleteSqlHeroSlider(id: string) {
  try {
    await db.delete(heroSliders).where(eq(heroSliders.id, id));
    return true;
  } catch (error) {
    console.error('deleteSqlHeroSlider failed:', error);
    throw new Error('Failed to delete slider', { cause: error });
  }
}

export async function getSqlEditorialInsights() {
  try {
    const rows = await db.select().from(editorialInsights);
    return rows.map((r) => r.data);
  } catch (error) {
    console.error('getSqlEditorialInsights failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function saveSqlEditorialInsight(insightData: any) {
  try {
    const id = insightData.id || `ins_${Date.now()}`;
    const normalized = { ...insightData, id };
    await db
      .insert(editorialInsights)
      .values({
        id,
        title: normalized.title || 'Untitled',
        category: normalized.category || '',
        publishedAt: normalized.publishedAt || new Date().toISOString(),
        data: normalized,
      })
      .onConflictDoUpdate({
        target: editorialInsights.id,
        set: {
          title: normalized.title || 'Untitled',
          category: normalized.category || '',
          publishedAt: normalized.publishedAt || new Date().toISOString(),
          data: normalized,
        },
      });
    return normalized;
  } catch (error) {
    console.error('saveSqlEditorialInsight failed:', error);
    throw new Error('Failed to save insight', { cause: error });
  }
}

export async function deleteSqlEditorialInsight(id: string) {
  try {
    await db.delete(editorialInsights).where(eq(editorialInsights.id, id));
    return true;
  } catch (error) {
    console.error('deleteSqlEditorialInsight failed:', error);
    throw new Error('Failed to delete insight', { cause: error });
  }
}

export async function getSqlMediaFiles() {
  try {
    const rows = await db.select().from(mediaFiles);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      type: r.type,
      size: r.size,
      uploadedAt: r.uploadedAt,
      ...(r.data ? (r.data as any) : {}),
    }));
  } catch (error) {
    console.error('getSqlMediaFiles failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function saveSqlMediaFile(media: any) {
  try {
    await db
      .insert(mediaFiles)
      .values({
        id: media.id,
        name: media.name,
        url: media.url,
        type: media.type,
        size: media.size,
        uploadedAt: media.uploadedAt,
        data: media,
      })
      .onConflictDoUpdate({
        target: mediaFiles.id,
        set: {
          name: media.name,
          url: media.url,
          type: media.type,
          size: media.size,
          data: media,
        },
      });
    return media;
  } catch (error) {
    console.error('saveSqlMediaFile failed:', error);
    throw new Error('Failed to save media', { cause: error });
  }
}

export async function deleteSqlMediaFile(id: string) {
  try {
    await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
    return true;
  } catch (error) {
    console.error('deleteSqlMediaFile failed:', error);
    throw new Error('Failed to delete media', { cause: error });
  }
}

export async function getSqlContactInquiries() {
  try {
    const rows = await db.select().from(contactInquiries);
    return rows.map((r) => r.data);
  } catch (error) {
    console.error('getSqlContactInquiries failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function saveSqlContactInquiry(inquiry: any) {
  try {
    const id = inquiry.id || `inq_${Date.now()}`;
    const normalized = { ...inquiry, id };
    await db.insert(contactInquiries).values({
      id,
      name: normalized.name,
      email: normalized.email,
      subject: normalized.service || normalized.subject || '',
      status: normalized.status || 'unread',
      data: normalized,
    });
    return normalized;
  } catch (error) {
    console.error('saveSqlContactInquiry failed:', error);
    throw new Error('Failed to save inquiry', { cause: error });
  }
}

export async function updateSqlContactInquiryStatus(id: string, status: string) {
  try {
    const rows = await db.select().from(contactInquiries).where(eq(contactInquiries.id, id)).limit(1);
    if (rows.length > 0) {
      const updatedData = { ...(rows[0].data as any), status };
      await db
        .update(contactInquiries)
        .set({ status, data: updatedData })
        .where(eq(contactInquiries.id, id));
      return updatedData;
    }
    return null;
  } catch (error) {
    console.error('updateSqlContactInquiryStatus failed:', error);
    throw new Error('Failed to update inquiry status', { cause: error });
  }
}
