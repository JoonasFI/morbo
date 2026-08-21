// Pieni apukirjasto cookieiden lukuun ja kirjoitukseen (ei ulkoisia riippuvuuksia)

function setCookie(name, value, days) {
  const maxAge = days * 24 * 60 * 60;
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const prefix = name + '=';
  const parts = document.cookie.split(';');
  for (let part of parts) {
    part = part.trim();
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
}
