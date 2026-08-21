// Vasemman yläkulman kellonaika + päivämäärä, korvaa aiemman otsikon.

function initClock(timeElId, dateElId) {
  const timeEl = document.getElementById(timeElId);
  const dateEl = document.getElementById(dateElId);
  if (!timeEl || !dateEl) return;

  function render() {
    const locale = currentLang() === 'en' ? 'en-GB' : 'fi-FI';
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'long' });
    dateEl.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  }

  render();
  const msToNextMinute = 60000 - (Date.now() % 60000);
  setTimeout(function tick() {
    render();
    setInterval(render, 60000);
  }, msToNextMinute);
}
