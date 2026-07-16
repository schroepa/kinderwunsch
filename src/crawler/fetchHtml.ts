import { CRAWLER_USER_AGENT, FETCH_TIMEOUT_MS } from './types';

export type FetchHtmlResult =
  | { ok: true; html: string; status: number }
  | { ok: false; status: number; error: string; skipped: boolean };

export async function fetchHtml(url: string): Promise<FetchHtmlResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': CRAWLER_USER_AGENT, Accept: 'text/html' },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (res.status === 429) {
      return { ok: false, status: 429, error: 'rate limited', skipped: true };
    }
    if (!res.ok) {
      return { ok: false, status: res.status, error: `HTTP ${res.status}`, skipped: false };
    }
    const html = await res.text();
    return { ok: true, html, status: res.status };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: e instanceof Error ? e.message : 'fetch failed',
      skipped: false,
    };
  } finally {
    clearTimeout(timer);
  }
}
