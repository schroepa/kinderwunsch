import { describe, it, expect, vi } from 'vitest';
import { runIncrementalBatch } from '../../src/crawler/runCrawl';
import type { ClinicsPayload } from '../../src/crawler/types';

vi.mock('../../src/crawler/fetchHtml', () => ({
  fetchHtml: vi.fn(async () => ({
    ok: true,
    status: 200,
    html: `<html><head><meta name="description" content="IVF clinic" /></head><body><p>IVF</p></body></html>`,
  })),
}));

describe('runIncrementalBatch', () => {
  it('advances cursor and sets lastPartialAt', async () => {
    const payload: ClinicsPayload = {
      clinics: [
        {
          id: 'a',
          name: 'A',
          country: 'spain',
          countryCode: 'ES',
          city: 'Barcelona',
          website: 'https://www.ivi.es',
          specialties: [],
          source: 'directory',
          sourceUrl: 'seed',
          updatedAt: '2026-07-01T00:00:00.000Z',
        },
      ],
      meta: {
        lastCrawledAt: null,
        lastPartialAt: null,
        clinicCount: 1,
        stats: { directory: 1, association: 0, clinic_site: 0, errors: 0 },
        cursor: 0,
      },
    };
    const next = await runIncrementalBatch(payload, process.cwd());
    expect(next.meta.lastPartialAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(next.meta.stats.clinic_site).toBeGreaterThanOrEqual(1);
    expect(next.clinics[0].description).toBe('IVF clinic');
    expect(next.clinics[0].source).toBe('clinic_site');
    expect(next.clinics[0].specialties).toContain('ivf');
  });
});
