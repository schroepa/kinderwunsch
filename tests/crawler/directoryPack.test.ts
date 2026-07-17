import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseHtmlList } from '../../src/crawler/adapters/htmlList';
import { loadDirectoryPackSource } from '../../src/crawler/adapters/directoryPack';
import { normalizeRawClinic } from '../../src/crawler/normalize';
import type { SourceEntry } from '../../src/crawler/types';

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, '../..');

describe('htmlList adapter (directory fixture)', () => {
  it('parses a saved Swiss directory listing fixture into directory-provenance rows', () => {
    const html = readFileSync(join(root, '../fixtures/crawler/ch-directory-sample.html'), 'utf8');
    const entry: SourceEntry = {
      id: 'ch-fixture-directory',
      type: 'directory',
      url: 'https://example.ch/kinderwunschzentren',
      countryCode: 'CH',
      itemSelector: 'article.entry',
      nameSelector: 'h3.entry-name',
      citySelector: '.entry-city',
      websiteSelector: 'a.entry-link',
      websiteAttr: 'href',
    };
    const rows = parseHtmlList(html, entry);
    expect(rows).toHaveLength(3);
    expect(rows[0].name).toBe('Fertilitas');
    expect(rows[0].city).toBe('Basel');
    expect(rows[0].website).toContain('fertilitas.ch');
    expect(rows.every((r) => r.provenance === 'directory')).toBe(true);
  });
});

describe('directoryPack adapter', () => {
  it('loads the CH swissmom pack with directory provenance and real allowlisted URLs', async () => {
    const entry: SourceEntry = {
      id: 'ch-swissmom-directory-pack',
      type: 'directory_pack',
      path: 'public/data/directory-packs/ch-swissmom-2026-07-18.json',
      countryCode: 'CH',
    };
    const rows = await loadDirectoryPackSource(entry, projectRoot);
    expect(rows.length).toBeGreaterThanOrEqual(5);
    expect(rows.every((r) => r.provenance === 'directory')).toBe(true);
    expect(rows.every((r) => r.sourceUrl.startsWith('https://www.swissmom.ch'))).toBe(true);
    expect(rows.some((r) => r.name === 'OVA IVF Clinic Zürich')).toBe(true);
  });

  it('loads the IE HPRA-register pack with directory provenance', async () => {
    const entry: SourceEntry = {
      id: 'ie-hpra-register-pack',
      type: 'directory_pack',
      path: 'public/data/directory-packs/ie-hpra-register-2026-07-18.json',
      countryCode: 'IE',
    };
    const rows = await loadDirectoryPackSource(entry, projectRoot);
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(rows.every((r) => r.provenance === 'directory')).toBe(true);
    expect(rows.some((r) => r.name === 'Merrion Fertility Clinic')).toBe(true);
  });

  it('normalizes pack rows into full Clinic objects with directory provenance', async () => {
    const entry: SourceEntry = {
      id: 'ch-swissmom-directory-pack',
      type: 'directory_pack',
      path: 'public/data/directory-packs/ch-swissmom-2026-07-18.json',
      countryCode: 'CH',
    };
    const rows = await loadDirectoryPackSource(entry, projectRoot);
    const clinics = rows.map((r) => normalizeRawClinic(r));
    expect(clinics.every((c) => c.provenance === 'directory')).toBe(true);
    expect(clinics.every((c) => c.approximateCost === undefined)).toBe(true);
    expect(clinics.every((c) => c.rating === undefined)).toBe(true);
  });
});
