import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseHtmlList } from '../../src/crawler/adapters/htmlList';
import { enrichFromClinicHtml } from '../../src/crawler/adapters/clinicSite';
import type { SourceEntry, Clinic } from '../../src/crawler/types';

const root = dirname(fileURLToPath(import.meta.url));

describe('htmlList adapter', () => {
  it('parses directory fixtures', () => {
    const html = readFileSync(join(root, '../fixtures/directory-sample.html'), 'utf8');
    const entry: SourceEntry = {
      id: 'demo-dir',
      type: 'directory',
      url: 'https://example.com/dir',
      countryCode: 'PT',
      itemSelector: 'li.clinic',
      nameSelector: 'a.name',
      citySelector: '.city',
      websiteSelector: 'a.name',
      websiteAttr: 'href',
    };
    const rows = parseHtmlList(html, entry);
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe('Lisbon Fertility');
    expect(rows[0].website).toContain('example-ivf.pt');
    expect(rows[0].source).toBe('directory');
  });
});

describe('clinicSite adapter', () => {
  it('extracts description and specialty hints', () => {
    const html = readFileSync(join(root, '../fixtures/clinic-sample.html'), 'utf8');
    const base: Clinic = {
      id: 'pt-lisbon',
      name: 'Lisbon Fertility',
      country: 'pt',
      countryCode: 'PT',
      city: 'Lisbon',
      website: 'https://www.example-ivf.pt',
      specialties: [],
      source: 'directory',
      sourceUrl: 'https://example.com/dir',
      updatedAt: '2026-07-16T00:00:00.000Z',
    };
    const enriched = enrichFromClinicHtml(html, base);
    expect(enriched.description).toMatch(/IVF/i);
    expect(enriched.specialties).toEqual(expect.arrayContaining(['ivf', 'icsi', 'egg-donation']));
    expect(enriched.source).toBe('clinic_site');
  });
});
