import { describe, expect, it } from 'vitest';
import { normalizeRawClinic } from '../../src/crawler/normalize';
import { dedupeClinics } from '../../src/crawler/dedupe';
import { parseHtmlList } from '../../src/crawler/adapters/htmlList';

describe('clinic provenance', () => {
  it('marks seed-normalized clinics as curated when provenance set on raw', () => {
    const c = normalizeRawClinic({
      name: 'Test Klinik',
      city: 'Berlin',
      countryCode: 'DE',
      website: 'https://example.org',
      source: 'directory',
      sourceUrl: 'public/data/clinics.seed.json',
      provenance: 'curated',
    });
    expect(c.provenance).toBe('curated');
  });

  it('parseHtmlList sets directory provenance', () => {
    const html = `<ul><li class="clinic"><a class="name" href="https://a.example">A</a><span class="city">Prag</span></li></ul>`;
    const rows = parseHtmlList(html, {
      id: 't',
      type: 'directory',
      url: 'https://dir.example/list',
      countryCode: 'CZ',
      itemSelector: 'li.clinic',
      nameSelector: 'a.name',
      citySelector: '.city',
      websiteSelector: 'a.name',
      enabled: true,
    });
    expect(rows[0]?.provenance).toBe('directory');
  });

  it('dedupe prefers curated approximateCost over directory empty', () => {
    const curated = normalizeRawClinic({
      name: 'Same',
      city: 'Berlin',
      countryCode: 'DE',
      website: 'https://same.example',
      source: 'directory',
      sourceUrl: 'seed',
      provenance: 'curated',
      approximateCost: { ivf: 3500, icsi: 4500 },
    });
    const fromDir = normalizeRawClinic({
      name: 'Same',
      city: 'Berlin',
      countryCode: 'DE',
      website: 'https://same.example',
      source: 'directory',
      sourceUrl: 'https://dir.example',
      provenance: 'directory',
    });
    const [merged] = dedupeClinics([fromDir, curated]);
    expect(merged.provenance).toBe('curated');
    expect(merged.approximateCost?.ivf).toBe(3500);
  });
});
