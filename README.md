🇫🇮 [Suomeksi](README.fi.md)

# Morbo

Morbo pulls headlines from your RSS feeds into a single view — organized into your own columns, with no login. All settings (feeds, columns, keywords, appearance, language) live in a browser cookie, so there's no database and no user accounts.

## Features

- **Dashboard** — headlines grouped into custom columns, auto-refreshes every 5 minutes without flicker
- **Admin panel** — add/edit/delete feeds, drag-and-drop reordering of columns, import/export as JSON
- **Keywords of interest** — word-boundary-aware matching, matches are highlighted in their column and surfaced in a "For you" section; new matches since your last visit are flagged
- **Appearance** — light, dark, e-ink-friendly (grayscale, no animation), and automatic (follows your OS) themes
- **Bilingual** UI (English/Finnish)
- **PWA** — installable to your phone or desktop home screen
- Feed health is visible in the admin panel (working vs. broken)

## Getting started

```bash
npm install
npm start
```

The app runs at `http://localhost:3000`. The dashboard is at the root, the admin panel at `/admin.html`.

## Architecture

- **server.js** — a thin Express server whose only job is fetching and parsing RSS feeds server-side (browsers can't do this directly due to CORS) and serving the static files. The server holds no per-user state.
- **public/** — the entire UI (HTML/CSS/vanilla JS), no build step.

## License

MIT — see [LICENSE](LICENSE). Author: Joonas Wilska ([joonas@wilska.fi](mailto:joonas@wilska.fi)).
