import { describe, expect, it } from 'vitest';
import { getCountryRecommendations } from '../../src/lib/countryLogic';
import type { UserData } from '../../src/lib/types';

const base: UserData = {
  femaleAge: 32,
  maleAge: 35,
  relationshipStatus: 'married',
  location: 'Berlin',
  budget: 8000,
  treatments: ['ivf', 'icsi'],
};

describe('getCountryRecommendations Phase 1', () => {
  it('includes expanded EU countries for a typical couple', () => {
    const ids = getCountryRecommendations(base).map((r) => r.id);
    expect(ids).toEqual(expect.arrayContaining([
      'germany',
      'czech',
      'poland',
      'spain',
      'greece',
      'austria',
      'denmark',
      'netherlands',
      'portugal',
      'italy',
      'france',
    ]));
    expect(ids.length).toBeGreaterThanOrEqual(8);
  });

  it('does not hard-cap at 4 results', () => {
    expect(getCountryRecommendations(base).length).toBeGreaterThan(4);
  });

  it('hides germany when egg-donation requested', () => {
    const ids = getCountryRecommendations({
      ...base,
      treatments: ['egg-donation'],
    }).map((r) => r.id);
    expect(ids).not.toContain('germany');
    expect(ids).not.toContain('austria');
  });

  it('marks italy restricted for single seekers', () => {
    const italy = getCountryRecommendations({
      ...base,
      relationshipStatus: 'single',
      treatments: ['ivf'],
    }).find((r) => r.id === 'italy');
    expect(italy?.legalStatus).toBe('restricted');
  });

  it('sorts by score descending', () => {
    const scores = getCountryRecommendations(base).map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});
