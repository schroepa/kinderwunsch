export function isFresh(
  lastCrawledAt: string | null,
  nowMs: number,
  ttlMs: number,
): boolean {
  if (!lastCrawledAt) return false;
  const then = Date.parse(lastCrawledAt);
  if (Number.isNaN(then)) return false;
  return nowMs - then < ttlMs;
}
