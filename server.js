const express = require('express');
const Parser = require('rss-parser');
const path = require('path');

const app = express();
const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Morbo/1.0' }
});

const PORT = process.env.PORT || 3000;

// Yksinkertainen välimuisti, jotta samaa feediä ei haeta joka pyynnöllä uudestaan
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

function isSafeUrl(raw) {
  try {
    const u = new URL(raw);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// Osa feedeistä tuplaenkoodaa HTML-entiteetit XML:ssään (esim. "&amp;#8217;"),
// jolloin rss-parser puree vain kerran ja jättää kirjaimellisen "&#8217;"-merkkijonon.
const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', hellip: '…',
  ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  copy: '©', reg: '®', trade: '™'
};

function decodeEntitiesOnce(str) {
  return str.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity[0] === '#') {
      const isHex = entity[1] === 'x' || entity[1] === 'X';
      const code = isHex ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, entity) ? NAMED_ENTITIES[entity] : match;
  });
}

// Kaksi ajoa riittää purkamaan tuplaenkoodauksen, koska rss-parser on jo purkanut yhden kerroksen.
function decodeEntities(str) {
  return decodeEntitiesOnce(decodeEntitiesOnce(str));
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/feed', async (req, res) => {
  const url = req.query.url;

  if (!url || !isSafeUrl(url)) {
    return res.status(400).json({ error: 'Virheellinen tai puuttuva url-parametri.' });
  }

  const cached = cache.get(url);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const feed = await parser.parseURL(url);
    const data = {
      title: feed.title || url,
      items: (feed.items || []).slice(0, 30).map(item => ({
        title: decodeEntities(item.title || '(ei otsikkoa)'),
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || null,
        contentSnippet: decodeEntities((item.contentSnippet || '').slice(0, 300))
      }))
    };
    cache.set(url, { time: Date.now(), data });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Feedin haku tai jäsennys epäonnistui.', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Morbo käynnissä: http://localhost:${PORT}`);
});
