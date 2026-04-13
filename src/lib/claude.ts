/**
 * All Anthropic API calls go through the local Express proxy at /api/*.
 * The API key lives server-side only — it is never bundled into the browser.
 */
import type { GeneratedPalette, BrandPalette } from '../types';

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function generateMoodPalette(description: string): Promise<GeneratedPalette> {
  return post<GeneratedPalette>('/api/mood', { description });
}

export function generateBrandPalette(
  brandName: string,
  description: string,
  products: string[]
): Promise<BrandPalette> {
  return post<BrandPalette>('/api/brand', { brandName, description, products });
}
