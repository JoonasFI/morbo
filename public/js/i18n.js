// Kaksikielisyys (fi/en). Kieli tallennetaan samaan asetuscookieen kuin muutkin asetukset.

const I18N = {
  fi: {
    nav_admin: 'Hallinta',
    nav_back: '← Takaisin',
    status_loading: 'Ladataan...',
    status_fetching: 'Haetaan feedejä...',
    status_updated: 'Päivitetty {time}',
    status_saved: 'Tallennettu {time}',
    status_saved_cookie: 'Tallennettu selaimen cookieen',
    foryou_heading: '★ Sinua kiinnostavat',
    foryou_empty_nokeywords: 'Ei avainsanoja määritetty. Lisää niitä hallintapaneelista korostaaksesi itseäsi kiinnostavat otsikot.',
    foryou_empty_nomatches: 'Ei osumia avainsanoilla vielä.',
    column_empty_no_feeds: 'Ei feedejä tässä sarakkeessa. Lisää niitä hallintapaneelista.',
    column_empty_no_items: 'Ei otsikoita saatavilla.',
    badge_new: 'Uusi',
    source_manual: 'Manuaalinen',
    admin_add_feed_heading: 'Lisää feed',
    admin_feed_name_placeholder: 'Nimi (esim. Yle Uutiset)',
    admin_feed_url_placeholder: 'https://esimerkki.fi/rss',
    admin_add_feed_btn: 'Lisää feed',
    admin_test_btn: 'Testaa',
    admin_test_enter_url: 'Syötä ensin URL.',
    admin_test_testing: 'Testataan...',
    admin_test_unknown_error: 'Tuntematon virhe',
    admin_test_ok: 'OK — "{title}", {count} otsikkoa löytyi.',
    admin_test_error: 'Virhe: {message}',
    admin_keywords_heading: '★ Kiinnostavat avainsanat',
    admin_keywords_hint: 'Otsikot, jotka sisältävät jonkin näistä sanoista, korostetaan dashboardilla ja nostetaan "Sinua kiinnostavat" -osioon.',
    admin_keyword_placeholder: 'esim. tekoäly',
    admin_add_btn: 'Lisää',
    admin_importexport_heading: 'Tuo / Vie asetukset',
    admin_importexport_hint: 'Asetukset ovat cookiessa tässä selaimessa. Voit varmuuskopioida tai siirtää ne toiseen selaimeen JSON-muodossa.',
    admin_export_btn: 'Vie JSON',
    admin_import_btn: 'Tuo JSON',
    admin_reset_btn: 'Tyhjennä kaikki',
    admin_import_placeholder: 'Liitä tähän aiemmin viety JSON ja klikkaa Tuo JSON uudelleen.',
    admin_import_error: 'Tuonti epäonnistui: {message}',
    admin_import_invalid_structure: 'Rakenne ei kelpaa (5 saraketta vaaditaan).',
    admin_reset_confirm: 'Tämä poistaa kaikki feedit, otsikot ja avainsanat. Jatketaanko?',
    admin_columns_heading: 'Sarakkeet',
    admin_items_per_column_label: 'Otsikoita sarakkeessa:',
    admin_drag_handle_title: 'Raahaa järjestääksesi sarakkeet',
    admin_column_empty_note: 'Tyhjä — raahaa kortti tänne tai lisää uusi.',
    admin_add_column_btn: '+ Lisää sarake',
    admin_new_column_name: 'Uusi sarake',
    admin_delete_column_title: 'Poista sarake',
    confirm_delete_column: 'Poistetaanko sarake "{name}"? Sen feedit ja otsikot poistetaan myös.',
    admin_min_column_alert: 'Vähintään yksi sarake täytyy säilyttää.',
    feed_status_checking: 'Tarkistetaan...',
    feed_status_ok: 'Toimii — {count} otsikkoa',
    feed_status_error: 'Feedin haku epäonnistui',
    card_type_feed: 'Feed',
    card_type_headline: 'Otsikko',
    card_edit: 'Muokkaa',
    card_delete: 'Poista',
    prompt_feed_name: 'Feedin nimi:',
    prompt_feed_url: 'Feedin URL:',
    prompt_headline_title: 'Otsikon teksti:',
    prompt_headline_link: 'Linkki (voi jättää tyhjäksi):',
    confirm_delete_card: 'Poistetaanko "{label}"?',
    admin_appearance_heading: 'Ulkoasu ja kieli',
    theme_eink: 'E-ink',
    theme_light: 'Vaalea',
    theme_dark: 'Tumma',
    theme_auto: 'Automaattinen',
    footer_author: 'Tekijä: Joonas Wilska',
    footer_license: 'Avoin lähdekoodi — vapaasti käytettävissä ja muokattavissa (MIT-lisenssi)'
  },
  en: {
    nav_admin: 'Admin',
    nav_back: '← Back',
    status_loading: 'Loading...',
    status_fetching: 'Fetching feeds...',
    status_updated: 'Updated {time}',
    status_saved: 'Saved {time}',
    status_saved_cookie: 'Saved to browser cookie',
    foryou_heading: '★ For you',
    foryou_empty_nokeywords: 'No keywords set yet. Add some in the admin panel to highlight headlines relevant to you.',
    foryou_empty_nomatches: 'No keyword matches yet.',
    column_empty_no_feeds: 'No feeds in this column. Add some in the admin panel.',
    column_empty_no_items: 'No headlines available.',
    badge_new: 'New',
    source_manual: 'Manual',
    admin_add_feed_heading: 'Add feed',
    admin_feed_name_placeholder: 'Name (e.g. BBC News)',
    admin_feed_url_placeholder: 'https://example.com/rss',
    admin_add_feed_btn: 'Add feed',
    admin_test_btn: 'Test',
    admin_test_enter_url: 'Enter a URL first.',
    admin_test_testing: 'Testing...',
    admin_test_unknown_error: 'Unknown error',
    admin_test_ok: 'OK — "{title}", found {count} headlines.',
    admin_test_error: 'Error: {message}',
    admin_keywords_heading: '★ Keywords of interest',
    admin_keywords_hint: 'Headlines containing any of these words are highlighted on the dashboard and surfaced in the "For you" section.',
    admin_keyword_placeholder: 'e.g. artificial intelligence',
    admin_add_btn: 'Add',
    admin_importexport_heading: 'Import / export settings',
    admin_importexport_hint: 'Settings live in a cookie in this browser. You can back them up or move them to another browser as JSON.',
    admin_export_btn: 'Export JSON',
    admin_import_btn: 'Import JSON',
    admin_reset_btn: 'Clear all',
    admin_import_placeholder: 'Paste previously exported JSON here and click Import JSON again.',
    admin_import_error: 'Import failed: {message}',
    admin_import_invalid_structure: 'Invalid structure (5 columns required).',
    admin_reset_confirm: 'This will remove all feeds, headlines and keywords. Continue?',
    admin_columns_heading: 'Columns',
    admin_items_per_column_label: 'Headlines per column:',
    admin_drag_handle_title: 'Drag to reorder columns',
    admin_column_empty_note: 'Empty — drag a card here or add a new one.',
    admin_add_column_btn: '+ Add column',
    admin_new_column_name: 'New column',
    admin_delete_column_title: 'Delete column',
    confirm_delete_column: 'Delete column "{name}"? Its feeds and headlines will be deleted too.',
    admin_min_column_alert: 'At least one column must remain.',
    feed_status_checking: 'Checking...',
    feed_status_ok: 'Working — {count} headlines',
    feed_status_error: 'Feed fetch failed',
    card_type_feed: 'Feed',
    card_type_headline: 'Headline',
    card_edit: 'Edit',
    card_delete: 'Delete',
    prompt_feed_name: 'Feed name:',
    prompt_feed_url: 'Feed URL:',
    prompt_headline_title: 'Headline text:',
    prompt_headline_link: 'Link (may be left empty):',
    confirm_delete_card: 'Delete "{label}"?',
    admin_appearance_heading: 'Appearance & language',
    theme_eink: 'E-ink',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_auto: 'Automatic',
    footer_author: 'Author: Joonas Wilska',
    footer_license: 'Open source — free to use and modify (MIT license)'
  }
};

function currentLang() {
  return window.__APP_LANG__ === 'en' ? 'en' : 'fi';
}

function t(key, vars) {
  const dict = I18N[currentLang()] || I18N.fi;
  let str = dict[key] || I18N.fi[key] || key;
  if (vars) {
    Object.keys(vars).forEach(k => {
      str = str.replace(`{${k}}`, vars[k]);
    });
  }
  return str;
}

function applyI18nToDom() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
}

(function initI18n() {
  const config = loadConfig();
  window.__APP_LANG__ = config.lang === 'en' ? 'en' : 'fi';
  document.documentElement.lang = window.__APP_LANG__;
  applyI18nToDom();
})();

function initLangSelector(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const config = loadConfig();
  const buttons = [...container.querySelectorAll('[data-lang-value]')];

  buttons.forEach(btn => {
    const active = btn.dataset.langValue === currentLang();
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
    btn.addEventListener('click', () => {
      if (btn.dataset.langValue === config.lang) return;
      config.lang = btn.dataset.langValue;
      saveConfig(config);
      location.reload();
    });
  });
}
