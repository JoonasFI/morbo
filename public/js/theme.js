// Ulkoasu: e-ink / vaalea / tumma / automaattinen (seuraa käyttöjärjestelmää).
// Sovelletaan heti latauksessa kaikilla sivuilla; hallinnassa lisäksi valitsin.

function resolveEffectiveTheme(theme) {
  if (theme === 'auto') {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  return theme;
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', resolveEffectiveTheme(theme));
}

function applyStoredTheme() {
  const config = loadConfig();
  applyTheme(config.theme);

  if (config.theme === 'auto' && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('auto');
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }
}

applyStoredTheme();

function initThemeSelector(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const config = loadConfig();
  const buttons = [...container.querySelectorAll('[data-theme-value]')];

  function sync() {
    buttons.forEach(btn => {
      const active = btn.dataset.themeValue === config.theme;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }
  sync();

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      config.theme = btn.dataset.themeValue;
      saveConfig(config);
      applyTheme(config.theme);
      sync();
    });
  });
}
