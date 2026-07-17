import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/crawler/fetchHtml', () => ({
  fetchHtml: vi.fn(async () => ({
    ok: true,
    status: 200,
    html: `<html><head><meta name="description" content="Fertility clinic" /></head><body><p>IVF</p></body></html>`,
  })),
}));

import { runFullCrawl } from '../../src/crawler/runCrawl';

describe('runFullCrawl with directory_pack sources', () => {
  it('merges curated seed and static directory packs with correct provenance, no invented costs', async () => {
    const { clinics } = await runFullCrawl(process.cwd());

    const curated = clinics.filter((c) => c.provenance === 'curated');
    const directory = clinics.filter((c) => c.provenance === 'directory');

    expect(curated.length).toBeGreaterThanOrEqual(50);
    expect(directory.length).toBeGreaterThan(0);

    const ch = directory.filter((c) => c.countryCode === 'CH');
    const ie = directory.filter((c) => c.countryCode === 'IE');
    expect(ch.length).toBeGreaterThanOrEqual(5);
    expect(ie.length).toBeGreaterThanOrEqual(3);

    for (const c of directory) {
      expect(c.approximateCost).toBeUndefined();
      expect(c.rating).toBeUndefined();
    }
  });
});
