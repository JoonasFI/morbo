🇬🇧 [In English](README.md)

# Morbo

Morbo kokoaa eri RSS-feedien otsikot yhteen näkymään — omiin sarakkeisiin järjesteltynä, ilman kirjautumista. Kaikki asetukset (feedit, sarakkeet, avainsanat, ulkoasu, kieli) tallentuvat pelkkään selaimen cookieen, ei tietokantaa eikä käyttäjätilejä.

## Ominaisuudet

- **Dashboard** — otsikot ryhmiteltynä omavalintaisiin sarakkeisiin, päivittyy automaattisesti 5 minuutin välein ilman välkähdystä
- **Hallintapaneeli** — feedien lisäys/muokkaus/poisto, sarakkeiden raahaus- ja uudelleenjärjestely, tuonti/vienti JSON-muodossa
- **Kiinnostavat avainsanat** — sanarajoja kunnioittava täsmäys, osumat korostuvat sarakkeissa ja kootaan "Sinua kiinnostavat" -osioon; uudet osumat merkitään erikseen
- **Ulkoasu** — vaalea, tumma, e-ink-ystävällinen (harmaasävy, ei animaatioita) ja automaattinen (seuraa käyttöjärjestelmää) teema
- **Kaksikielinen** käyttöliittymä (suomi/englanti)
- **PWA** — asennettavissa puhelimen/tietokoneen aloitusnäytölle
- Feedien tila näkyy hallinnassa (toimiiko feed vai ei)

## Käyttöönotto

```bash
npm install
npm start
```

Sovellus käynnistyy osoitteeseen `http://localhost:3000`. Dashboard löytyy juuresta, hallintapaneeli `/admin.html`-polusta.

## Arkkitehtuuri

- **server.js** — kevyt Express-palvelin, jonka ainoa tehtävä on hakea ja jäsentää RSS-feedit palvelinpuolella (selain ei pysty tähän suoraan CORS-rajoitusten takia) sekä tarjoilla staattiset tiedostot. Palvelin ei tallenna mitään käyttäjäkohtaista tilaa.
- **public/** — koko käyttöliittymä (HTML/CSS/vanilla JS), ei build-vaihetta.

## Lisenssi

MIT — katso [LICENSE](LICENSE). Tekijä: Joonas Wilska ([joonas@wilska.fi](mailto:joonas@wilska.fi)).
