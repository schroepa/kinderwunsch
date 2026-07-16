import * as cheerio from 'cheerio';
import type { RawClinic, SourceEntry } from '../types';

export function parseHtmlList(html: string, entry: SourceEntry): RawClinic[] {
  const $ = cheerio.load(html);
  const itemSel = entry.itemSelector ?? 'li';
  const nameSel = entry.nameSelector ?? 'a';
  const citySel = entry.citySelector;
  const websiteSel = entry.websiteSelector ?? nameSel;
  const websiteAttr = entry.websiteAttr ?? 'href';
  const source = entry.type === 'association' ? 'association' : 'directory';
  const countryCode = (entry.countryCode ?? 'EU').toUpperCase();

  const rows: RawClinic[] = [];
  $(itemSel).each((_, el) => {
    const root = $(el);
    const name = root.find(nameSel).first().text().trim() || root.text().trim();
    if (!name) return;
    const city = citySel ? root.find(citySel).first().text().trim() : (entry.countryCode ?? '');
    const href = root.find(websiteSel).first().attr(websiteAttr) ?? undefined;
    let website = href;
    if (website && entry.url) {
      try {
        website = new URL(website, entry.url).toString();
      } catch {
        /* keep raw */
      }
    }
    rows.push({
      name,
      city: city || 'Unknown',
      countryCode,
      website,
      source,
      sourceUrl: entry.url ?? entry.id,
    });
  });
  return rows;
}
