// Jaettu asetusten hallinta: sekä dashboard.js että admin.js käyttävät tätä.
// Kaikki tallennetaan yhteen JSON-cookieen, ei palvelinpuolen tilaa.

const CONFIG_COOKIE_NAME = 'morbo_config';
const CONFIG_COOKIE_DAYS = 365;

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function faviconUrl(rawUrl) {
  try {
    const hostname = new URL(rawUrl).hostname;
    return `https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(hostname)}`;
  } catch {
    return null;
  }
}

function defaultConfig() {
  const columns = [
    { id: 'col-1', name: 'Uutiset' },
    { id: 'col-2', name: 'Elektroniikka' },
    { id: 'col-3', name: 'Tiede' },
    { id: 'col-4', name: 'Tekoäly' },
    { id: 'col-5', name: 'Pelaaminen' }
  ];

  const feedSeeds = [
    // Uutiset
    { name: 'Yle Uutiset', url: 'https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss', columnId: 'col-1' },
    { name: 'Helsingin Sanomat', url: 'https://www.hs.fi/rss/tuoreimmat.xml', columnId: 'col-1' },
    { name: 'Ilta-Sanomat', url: 'https://www.is.fi/rss/tuoreimmat.xml', columnId: 'col-1' },
    { name: 'BBC News World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', columnId: 'col-1' },
    // Elektroniikka
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', columnId: 'col-2' },
    { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', columnId: 'col-2' },
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', columnId: 'col-2' },
    // Tiede
    { name: 'ScienceDaily', url: 'https://www.sciencedaily.com/rss/all.xml', columnId: 'col-3' },
    { name: 'Phys.org', url: 'https://phys.org/rss-feed/', columnId: 'col-3' },
    // Tekoäly
    { name: 'Wired: AI', url: 'https://www.wired.com/feed/tag/ai/latest/rss', columnId: 'col-4' },
    { name: 'Ars Technica: AI', url: 'https://arstechnica.com/ai/feed/', columnId: 'col-4' },
    { name: 'VentureBeat: AI', url: 'https://venturebeat.com/category/ai/feed/', columnId: 'col-4' },
    // Pelaaminen
    { name: 'IGN', url: 'https://feeds.ign.com/ign/all', columnId: 'col-5' },
    { name: 'PC Gamer', url: 'https://www.pcgamer.com/rss/', columnId: 'col-5' },
    { name: 'Eurogamer', url: 'https://www.eurogamer.net/feed', columnId: 'col-5' }
  ];

  const orderByColumn = {};
  const feeds = feedSeeds.map(seed => {
    const order = orderByColumn[seed.columnId] || 0;
    orderByColumn[seed.columnId] = order + 1;
    return { id: genId('feed'), order, ...seed };
  });

  return {
    columns,
    feeds,
    headlines: [],
    keywords: [],
    itemsPerColumn: 5,
    theme: 'light',
    lang: 'fi',
    lastVisitAt: null
  };
}

const VALID_THEMES = ['eink', 'light', 'dark', 'auto'];

function loadConfig() {
  const raw = getCookie(CONFIG_COOKIE_NAME);
  if (!raw) return defaultConfig();
  try {
    const parsed = JSON.parse(raw);
    const base = defaultConfig();
    const itemsPerColumn = Number(parsed.itemsPerColumn);
    // Vanhat cookiet: einkMode-boolean siirtyy uuteen theme-kenttään.
    const migratedTheme = VALID_THEMES.includes(parsed.theme)
      ? parsed.theme
      : (parsed.einkMode === true ? 'eink' : base.theme);
    return {
      columns: Array.isArray(parsed.columns) && parsed.columns.length >= 1 ? parsed.columns : base.columns,
      feeds: Array.isArray(parsed.feeds) ? parsed.feeds : [],
      headlines: Array.isArray(parsed.headlines) ? parsed.headlines : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      itemsPerColumn: Number.isFinite(itemsPerColumn) && itemsPerColumn >= 1
        ? Math.min(50, Math.floor(itemsPerColumn))
        : base.itemsPerColumn,
      theme: migratedTheme,
      lang: parsed.lang === 'en' ? 'en' : 'fi',
      lastVisitAt: typeof parsed.lastVisitAt === 'string' ? parsed.lastVisitAt : null
    };
  } catch {
    return defaultConfig();
  }
}

function saveConfig(config) {
  const json = JSON.stringify(config);
  if (json.length > 3800) {
    console.warn('Asetukset lähestyvät cookien kokorajaa (4KB). Harkitse feedien/otsikoiden karsimista.');
  }
  setCookie(CONFIG_COOKIE_NAME, json, CONFIG_COOKIE_DAYS);
}
