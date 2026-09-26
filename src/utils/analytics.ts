// Google Analytics 4 (GA4) Global Site Tag (gtag.js) Integration & Telemetry Dispatcher

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export interface TelemetryLogEvent {
  id: string;
  name: string;
  timestamp: string;
  params: Record<string, any>;
  status: 'dispatched' | 'simulated';
}

const TELEMETRY_STORAGE_KEY = 'dns_telemetry_event_stream';

export function getTelemetryHistory(): TelemetryLogEvent[] {
  try {
    const raw = sessionStorage.getItem(TELEMETRY_STORAGE_KEY);
    if (!raw) return getDefaultTelemetryEvents();
    return JSON.parse(raw);
  } catch {
    return getDefaultTelemetryEvents();
  }
}

export function saveTelemetryEvent(event: Omit<TelemetryLogEvent, 'id' | 'timestamp'>) {
  try {
    const current = getTelemetryHistory();
    const newEntry: TelemetryLogEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...current].slice(0, 50); // Keep last 50 events
    sessionStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom DOM event for live admin telemetry listeners
    window.dispatchEvent(new CustomEvent('studio_telemetry_update', { detail: newEntry }));
  } catch (err) {
    console.warn('Telemetry storage warning:', err);
  }
}

export function clearTelemetryHistory() {
  try {
    sessionStorage.removeItem(TELEMETRY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('studio_telemetry_update'));
  } catch {}
}

function getDefaultTelemetryEvents(): TelemetryLogEvent[] {
  const now = Date.now();
  return [
    {
      id: 'evt-init-1',
      name: 'page_view',
      timestamp: new Date(now - 120000).toISOString(),
      params: { page_path: '/', page_title: 'Durman Nasar Studio – Creative Studio & Agency' },
      status: 'dispatched',
    },
    {
      id: 'evt-init-2',
      name: 'project_view',
      timestamp: new Date(now - 85000).toISOString(),
      params: { project_slug: 'synapse-3d-spatial-exhibition', category: '3D Exhibition Booth', client: 'Synapse Tech' },
      status: 'dispatched',
    },
    {
      id: 'evt-init-3',
      name: 'lightbox_open',
      timestamp: new Date(now - 45000).toISOString(),
      params: { project: 'AURA Luxury Monogram', image_count: 5 },
      status: 'dispatched',
    },
    {
      id: 'evt-init-4',
      name: 'service_view',
      timestamp: new Date(now - 20000).toISOString(),
      params: { service_name: '3D Exhibition Booth', source: 'Services Grid' },
      status: 'dispatched',
    },
  ];
}

export function initGA(
  measurementId: string,
  options: { anonymizeIp?: boolean; enhancedMeasurement?: boolean } = {}
) {
  if (!measurementId || typeof window === 'undefined') return;

  if (document.getElementById('ga-script')) {
    // If script already exists, update config
    if (window.gtag) {
      window.gtag('config', measurementId, {
        send_page_view: false,
        anonymize_ip: options.anonymizeIp ?? false,
      });
    }
    return;
  }

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    anonymize_ip: options.anonymizeIp ?? false,
  });

  saveTelemetryEvent({
    name: 'gtag_initialized',
    params: {
      measurement_id: measurementId,
      anonymize_ip: options.anonymizeIp ?? false,
      enhanced_measurement: options.enhancedMeasurement ?? true,
    },
    status: 'dispatched',
  });
}

export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }

  // Save to telemetry log for live admin telemetry monitoring
  saveTelemetryEvent({
    name: eventName,
    params,
    status: typeof window !== 'undefined' && window.gtag ? 'dispatched' : 'simulated',
  });

  // Also log in debug mode for verification
  if (import.meta.env.DEV) {
    console.debug(`[GA4 Global Site Tag Event: ${eventName}]`, params);
  }
}

export function trackPageView(path: string, title: string) {
  trackEvent('page_view', {
    page_path: path,
    page_title: title,
    page_location: typeof window !== 'undefined' ? window.location.href : path,
  });
}

export function trackProjectView(projectSlug: string, category: string, client: string) {
  trackEvent('project_view', {
    project_slug: projectSlug,
    category,
    client,
  });
}

export function trackContactSubmit(service: string, budget?: string) {
  trackEvent('contact_form_submit', {
    service_interested: service,
    budget_range: budget,
  });
}

export function trackWhatsAppClick(source: string) {
  trackEvent('whatsapp_click', {
    source,
    platform: 'whatsapp',
  });
}

export function trackEmailClick(source: string) {
  trackEvent('email_click', {
    source,
    email: 'drmn@durmannasarstudio.com',
  });
}

export function fireTestTelemetryEvent(eventName = 'studio_telemetry_test_ping', customParams = {}) {
  trackEvent(eventName, {
    test_run: true,
    client_timestamp: new Date().toISOString(),
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'NodeJS',
    ...customParams,
  });
}
