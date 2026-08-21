(function () {
  const config = loadConfig();
  const columnsEl = document.getElementById('columns');
  const statusEl = document.getElementById('status');
  const forYouListEl = document.getElementById('for-you-list');

  const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

  // "Uutta edellisestä käynnistä" -merkintää varten: muistetaan hetki jolloin
  // edellinen käynti alkoi, ja siirretään se heti eteenpäin tätä käyntiä varten.
  const previousVisitAt = config.lastVisitAt ? new Date(config.lastVisitAt) : null;
  config.lastVisitAt = new Date().toISOString();
  saveConfig(config);

  function isNewSincePreviousVisit(item) {
    if (!previousVisitAt || !item.pubDate) return false;
    const d = new Date(item.pubDate);
    return !isNaN(d.getTime()) && d > previousVisitAt;
  }

  // Tokenisoi sanarajoja pitkin (Unicode-kirjaimet/numerot), jotta esim. avainsana
  // "AI" ei osu keskelle sanaa "Maahanmuuttajia" vaan vaatii koko sanan täsmäyksen.
  function tokenize(str) {
    return (str.toLowerCase().match(/[\p{L}\p{N}]+/gu)) || [];
  }

  const keywordTokenLists = (config.keywords || [])
    .map(tokenize)
    .filter(tokens => tokens.length > 0);

  function matchesKeywords(title) {
    if (!keywordTokenLists.length) return false;
    const titleTokens = tokenize(title);
    return keywordTokenLists.some(kwTokens => {
      for (let i = 0; i <= titleTokens.length - kwTokens.length; i++) {
        if (kwTokens.every((kt, j) => titleTokens[i + j] === kt)) return true;
      }
      return false;
    });
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const locale = currentLang() === 'en' ? 'en-GB' : 'fi-FI';
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function headlineCard(item, plain, isNew) {
    const card = document.createElement('a');
    card.className = 'headline-card' + (!plain && matchesKeywords(item.title) ? ' match' : '');
    card.href = item.link || '#';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const titleEl = document.createElement('span');
    titleEl.className = 'title';
    if (isNew) {
      const badge = document.createElement('span');
      badge.className = 'new-badge';
      badge.textContent = t('badge_new');
      titleEl.appendChild(badge);
    }
    titleEl.appendChild(document.createTextNode(item.title));
    card.appendChild(titleEl);

    const meta = document.createElement('div');
    meta.className = 'meta';
    if (item.sourceName) {
      const src = document.createElement('span');
      src.className = 'source';
      if (item.faviconUrl) {
        const icon = document.createElement('img');
        icon.className = 'favicon';
        icon.src = item.faviconUrl;
        icon.alt = '';
        icon.loading = 'lazy';
        icon.addEventListener('error', () => icon.remove());
        src.appendChild(icon);
      }
      src.appendChild(document.createTextNode(item.sourceName));
      meta.appendChild(src);
    }
    if (item.pubDate) {
      const date = document.createElement('span');
      date.textContent = formatDate(item.pubDate);
      meta.appendChild(date);
    }
    card.appendChild(meta);

    return card;
  }

  // Rakenna sarakerungot kerran
  const columnBodies = {};
  config.columns.forEach(col => {
    const colEl = document.createElement('div');
    colEl.className = 'column';

    const header = document.createElement('div');
    header.className = 'column-header';
    header.innerHTML = `<span>${escapeHtml(col.name)}</span><span class="loading-dot" data-col="${col.id}"></span>`;
    colEl.appendChild(header);

    const body = document.createElement('div');
    body.className = 'column-body';
    body.dataset.colId = col.id;
    colEl.appendChild(body);

    columnsEl.appendChild(colEl);
    columnBodies[col.id] = body;
  });

  function setColumnLoaded(colId) {
    const dot = document.querySelector(`.loading-dot[data-col="${colId}"]`);
    if (dot) dot.remove();
  }

  // Hakee sarakkeen sisällön muttei koske DOMiin — näin kaikki sarakkeet
  // saadaan valmiiksi samaan aikaan ja päivitys näyttää yhtenäiseltä.
  async function fetchColumnItems(col) {
    const manualHeadlines = (config.headlines || [])
      .filter(h => h.columnId === col.id)
      .map(h => ({
        title: h.title,
        link: h.link,
        pubDate: h.pubDate || null,
        sourceName: t('source_manual'),
        faviconUrl: h.link ? faviconUrl(h.link) : null
      }));

    const feeds = (config.feeds || []).filter(f => f.columnId === col.id);

    let fetchedItems = [];
    if (feeds.length) {
      const results = await Promise.all(feeds.map(async feed => {
        try {
          const res = await fetch(`/api/feed?url=${encodeURIComponent(feed.url)}`);
          if (!res.ok) throw new Error('fetch failed');
          const data = await res.json();
          const icon = faviconUrl(feed.url);
          return data.items.map(item => ({
            ...item,
            sourceName: feed.name || data.title,
            faviconUrl: icon
          }));
        } catch (err) {
          console.warn('Feedin haku epäonnistui:', feed.url, err);
          return [];
        }
      }));
      fetchedItems = results.flat();
    }

    const combined = [...manualHeadlines, ...fetchedItems];
    combined.sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    });

    return { col, hasSources: feeds.length || manualHeadlines.length, combined };
  }

  // Muistaa edellisen renderöinnin "sormenjäljen" saraketta kohti, jotta
  // muuttumatonta saraketta ei kosketa lainkaan päivityksen yhteydessä.
  const lastSignatures = {};

  function renderColumn({ col, hasSources, combined }, interestingSink) {
    combined.forEach(item => {
      if (matchesKeywords(item.title)) interestingSink.push(item);
    });

    const visible = combined.slice(0, config.itemsPerColumn);
    const signature = JSON.stringify(visible.map(i => [i.title, i.link, i.pubDate]));

    if (lastSignatures[col.id] === signature) {
      setColumnLoaded(col.id);
      return;
    }
    lastSignatures[col.id] = signature;

    const body = columnBodies[col.id];
    const isFirstRender = !body.dataset.rendered;
    body.dataset.rendered = '1';

    function build() {
      body.innerHTML = '';
      if (!visible.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-column';
        empty.textContent = hasSources ? t('column_empty_no_items') : t('column_empty_no_feeds');
        body.appendChild(empty);
      } else {
        visible.forEach(item => body.appendChild(headlineCard(item)));
      }
    }

    if (isFirstRender) {
      build();
    } else {
      // Himmennä vanha sisältö ennen vaihtoa, vaihda, ja häivytä takaisin näkyviin —
      // sisältö ei koskaan ole täysin poissa, joten päivitys ei välkähdä.
      body.classList.add('refresh-fade');
      requestAnimationFrame(() => {
        build();
        requestAnimationFrame(() => body.classList.remove('refresh-fade'));
      });
    }

    setColumnLoaded(col.id);
  }

  function renderForYou(interesting) {
    if (!keywordTokenLists.length) return;
    interesting.sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    });

    const signature = JSON.stringify(interesting.slice(0, 20).map(i => [i.title, i.link]));
    const isFirstRender = !forYouListEl.dataset.rendered;
    if (lastSignatures['__foryou'] === signature) return;
    lastSignatures['__foryou'] = signature;
    forYouListEl.dataset.rendered = '1';

    function build() {
      if (!interesting.length) {
        forYouListEl.className = 'for-you-empty';
        forYouListEl.textContent = t('foryou_empty_nomatches');
        return;
      }

      forYouListEl.className = '';
      forYouListEl.innerHTML = '';
      forYouListEl.style.display = 'flex';
      forYouListEl.style.flexWrap = 'wrap';
      forYouListEl.style.gap = '8px';
      interesting.slice(0, 20).forEach(item => {
        const wrapper = document.createElement('div');
        wrapper.style.minWidth = '220px';
        wrapper.style.flex = '1 1 220px';
        wrapper.appendChild(headlineCard(item, true, isNewSincePreviousVisit(item)));
        forYouListEl.appendChild(wrapper);
      });
    }

    if (isFirstRender) {
      build();
    } else {
      forYouListEl.classList.add('refresh-fade');
      requestAnimationFrame(() => {
        build();
        requestAnimationFrame(() => forYouListEl.classList.remove('refresh-fade'));
      });
    }
  }

  let isFirstLoad = true;

  async function refresh() {
    if (isFirstLoad) statusEl.textContent = t('status_fetching');

    const results = await Promise.all(
      config.columns.map(col => fetchColumnItems(col).catch(() => ({ col, hasSources: false, combined: [] })))
    );

    const interesting = [];
    results.forEach(result => renderColumn(result, interesting));
    renderForYou(interesting);

    const locale = currentLang() === 'en' ? 'en-GB' : 'fi-FI';
    const time = new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    statusEl.textContent = t('status_updated', { time });
    isFirstLoad = false;
  }

  refresh();
  setInterval(refresh, REFRESH_INTERVAL_MS);
})();
