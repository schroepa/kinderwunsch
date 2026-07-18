/**
 * Build static directory packs from allowlisted public sources (cached HTML/PDF text).
 * Usage (after fetching sources into /tmp/clinic-packs or paths below):
 *   npx tsx scripts/build-directory-packs.ts
 *
 * Does not invent costs/ratings. Rows without a website are skipped.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

type Row = { name: string; city: string; countryCode: string; website: string };

const ROOT = process.cwd();
const CACHE = process.env.PACK_CACHE || '/tmp/clinic-packs';
const OUT_DIR = join(ROOT, 'public/data/directory-packs');
const TODAY = new Date().toISOString().slice(0, 10);

function absUrl(href: string): string | null {
  let h = href.trim().replace(/^https?:\/\//i, '');
  h = h.replace(/\/$/, '');
  if (!h || h.length < 4) return null;
  if (!h.includes('.')) return null;
  if (/ivf-worldwide|facebook|twitter|linkedin|instagram|google|cookieconsent|w3\.org/i.test(h)) {
    return null;
  }
  return `https://${h}`;
}

function hostKey(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function dedupe(rows: Row[]): Row[] {
  const byHost = new Map<string, Row>();
  for (const row of rows) {
    const key = `${hostKey(row.website)}|${row.city.toLowerCase()}`;
    // Prefer more specific city over country placeholder
    const prev = byHost.get(key);
    if (!prev) byHost.set(key, row);
  }
  // Also collapse pure host dupes across cities only when city is generic
  const byHostOnly = new Map<string, Row>();
  for (const row of byHost.values()) {
    const h = hostKey(row.website);
    const prev = byHostOnly.get(h);
    if (!prev) {
      byHostOnly.set(h, row);
      continue;
    }
    // Keep both if different cities and not placeholders
    const generic = /^(Deutschland|Spain|Poland|Belgium|Hungary|Sweden|Slovakia|Germany)$/i;
    if (!generic.test(row.city) && !generic.test(prev.city) && row.city !== prev.city) {
      byHostOnly.set(`${h}::${row.city}`, row);
    }
  }
  return [...byHostOnly.values()];
}

function writePack(
  id: string,
  sourceUrl: string,
  note: string,
  clinics: Row[],
): void {
  mkdirSync(OUT_DIR, { recursive: true });
  const path = join(OUT_DIR, `${id}.json`);
  const cleaned = dedupe(clinics).filter((c) => c.website && c.name.length >= 3);
  const payload = {
    _meta: {
      sourceUrl,
      accessedAt: TODAY,
      note,
    },
    clinics: cleaned.map(({ name, city, countryCode, website }) => ({
      name,
      city,
      countryCode,
      website,
    })),
  };
  writeFileSync(path, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${path} (${cleaned.length} clinics)`);
}

/** Parse D·I·R member PDF text (pdftotext -layout). */
function parseDirPdf(text: string): Row[] {
  const blocks = text.split(/-{10,}/);
  const rows: Row[] = [];
  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !/^Deutsches IVF-Register/i.test(l))
      .filter((l) => !/^Geschäftsstelle/i.test(l))
      .filter((l) => !/^Seite \d+/i.test(l))
      .filter((l) => !/^Tel\. \+/i.test(l))
      .filter((l) => !/Vereinsregister|IBAN|Vorstand:/i.test(l));
    if (lines.length < 3) continue;

    const www = lines.find((l) => /^(www\.|https?:\/\/)/i.test(l));
    if (!www) continue;
    const website = absUrl(www);
    if (!website) continue;

    const plzLine = lines.find((l) => /^\d{5}\s+\S/.test(l));
    const city = plzLine ? plzLine.replace(/^\d{5}\s+/, '').replace(/\s*\(.*\)\s*$/, '').trim() : 'Deutschland';

    // Name: first substantial line that is not a doctor list / address / contact
    let name = '';
    for (const line of lines) {
      if (/^(Dr\.|PD Dr\.|Prof\.|Dipl\.|FÄ |T:|F:|www\.|https?:|\d{5}|Standort )/i.test(line)) continue;
      if (/@/.test(line)) continue;
      if (line.length < 5) continue;
      name = line;
      break;
    }
    if (!name) name = hostKey(website);
    rows.push({ name, city, countryCode: 'DE', website });
  }
  return rows;
}

function parseFertilityCz(html: string): Row[] {
  const $ = cheerio.load(html);
  const rows: Row[] = [];
  let cc: 'CZ' | 'SK' = 'CZ';
  $('table tr').each((_, el) => {
    const th = $(el).find('th').text().replace(/\s+/g, ' ').trim();
    if (/Slovensko/i.test(th)) {
      cc = 'SK';
      return;
    }
    if (/Čechy|Morava/i.test(th)) {
      cc = 'CZ';
      return;
    }
    const cells = $(el)
      .find('td')
      .map((_, c) => $(c).text().replace(/\s+/g, ' ').trim())
      .get();
    if (cells.length >= 3 && cells[2]?.includes('.')) {
      const website = absUrl(cells[2]);
      if (!website) return;
      rows.push({ name: cells[0], city: cells[1], countryCode: cc, website });
    }
  });
  return rows;
}

function parseIvfWorldwide(html: string, countryCode: string, fallbackCity: string): Row[] {
  const $ = cheerio.load(html);
  const rows: Row[] = [];
  $('h3').each((_, el) => {
    const name = $(el).text().replace(/\s+/g, ' ').trim();
    if (!name || /CME Congresses/i.test(name)) return;

    const details = $(el).next('ul');
    const websiteHref =
      details
        .find('li')
        .filter((_, li) => /Website/i.test($(li).find('label').text() + $(li).text()))
        .find('a')
        .attr('href') || '';
    const website = absUrl(websiteHref);
    if (!website) return;

    let city = fallbackCity;
    const cityLi = details
      .find('li')
      .filter((_, li) => /^City$/i.test($(li).find('label').text().trim()))
      .first();
    const cityText = cityLi.text().replace(/^City\s*:\s*/i, '').trim();
    if (cityText) city = cityText.split(',')[0].trim();

    rows.push({ name, city, countryCode, website });
  });
  return rows;
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  // DE from DIR PDF text
  const pdfTxt = join(CACHE, 'dir-members.txt');
  if (existsSync(pdfTxt)) {
    const de = parseDirPdf(readFileSync(pdfTxt, 'utf8'));
    writePack(
      `de-dir-members-${TODAY}`,
      'https://www.deutsches-ivf-register.de/perch/resources/adressen-dir-mitglieder-260609.pdf',
      'Static snapshot of D·I·R® member centres (PDF address list, sorted by PLZ). Public register; no costs/ratings transcribed.',
      de,
    );
  } else {
    console.warn('Missing', pdfTxt, '— skip DE pack');
  }

  // CZ + SK from fertility.cz
  const czHtml = join(CACHE, 'cz-fertility.html');
  if (existsSync(czHtml)) {
    const all = parseFertilityCz(readFileSync(czHtml, 'utf8'));
    writePack(
      `cz-fertility-cz-${TODAY}`,
      'https://www.fertility.cz/kontakty/centra-asistovane-reprodukce.html',
      'Public list of assisted reproduction centres (ČR) from fertility.cz. No costs/ratings.',
      all.filter((r) => r.countryCode === 'CZ'),
    );
    writePack(
      `sk-fertility-cz-${TODAY}`,
      'https://www.fertility.cz/kontakty/centra-asistovane-reprodukce.html',
      'Public list of assisted reproduction centres (SK) from fertility.cz. No costs/ratings.',
      all.filter((r) => r.countryCode === 'SK'),
    );
  }

  const ivfWw: { file: string; cc: string; city: string; url: string }[] = [
    { file: 'es-ivfww.html', cc: 'ES', city: 'Spain', url: 'https://ivf-worldwide.com/ivf-directory/europe/spain.html' },
    { file: 'pl-ivfww.html', cc: 'PL', city: 'Poland', url: 'https://ivf-worldwide.com/ivf-directory/europe/poland.html' },
    { file: 'be-ivfww.html', cc: 'BE', city: 'Belgium', url: 'https://ivf-worldwide.com/ivf-directory/europe/belgium.html' },
    { file: 'hu-ivfww.html', cc: 'HU', city: 'Hungary', url: 'https://ivf-worldwide.com/ivf-directory/europe/hungary.html' },
    { file: 'se-ivfww.html', cc: 'SE', city: 'Sweden', url: 'https://ivf-worldwide.com/ivf-directory/europe/sweden.html' },
    { file: 'gr-ivfww.html', cc: 'GR', city: 'Greece', url: 'https://ivf-worldwide.com/ivf-directory/europe/greece.html' },
    { file: 'pt-ivfww.html', cc: 'PT', city: 'Portugal', url: 'https://ivf-worldwide.com/ivf-directory/europe/portugal.html' },
    { file: 'it-ivfww.html', cc: 'IT', city: 'Italy', url: 'https://ivf-worldwide.com/ivf-directory/europe/italy.html' },
    { file: 'fr-ivfww.html', cc: 'FR', city: 'France', url: 'https://ivf-worldwide.com/ivf-directory/europe/france.html' },
    { file: 'at-ivfww.html', cc: 'AT', city: 'Austria', url: 'https://ivf-worldwide.com/ivf-directory/europe/austria.html' },
    { file: 'nl-ivfww.html', cc: 'NL', city: 'Netherlands', url: 'https://ivf-worldwide.com/ivf-directory/europe/netherlands.html' },
    { file: 'dk-ivfww.html', cc: 'DK', city: 'Denmark', url: 'https://ivf-worldwide.com/ivf-directory/europe/denmark.html' },
  ];

  for (const src of ivfWw) {
    const path = join(CACHE, src.file);
    if (!existsSync(path)) {
      console.warn('Missing', path);
      continue;
    }
    const rows = parseIvfWorldwide(readFileSync(path, 'utf8'), src.cc, src.city);
    writePack(
      `${src.cc.toLowerCase()}-ivf-worldwide-${TODAY}`,
      src.url,
      `Clinic directory entries from IVF-Worldwide (Europe/${src.cc}). Allowlisted public directory; websites only when listed; no costs/ratings.`,
      rows,
    );
  }
}

main();
