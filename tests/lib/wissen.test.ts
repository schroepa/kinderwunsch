import { describe, expect, it } from 'vitest';
import { TREATMENT_GUIDE_SLUG, type WissenCategory } from '../../src/lib/wissen';

describe('wissen helpers', () => {
  it('maps treatments to guide slugs', () => {
    expect(TREATMENT_GUIDE_SLUG.ivf).toBe('ivf');
    expect(TREATMENT_GUIDE_SLUG.icsi).toBe('icsi');
    expect(TREATMENT_GUIDE_SLUG['egg-donation']).toBe('eizellspende');
    expect(TREATMENT_GUIDE_SLUG['sperm-donation']).toBe('samenspende');
    expect(TREATMENT_GUIDE_SLUG.pgd).toBe('pid');
  });

  it('exposes the four categories', () => {
    const cats: WissenCategory[] = ['treatment', 'country', 'guide', 'faq'];
    expect(cats).toHaveLength(4);
  });
});
