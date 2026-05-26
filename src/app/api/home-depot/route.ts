import { NextResponse } from 'next/server';
import { THD_LOCATIONS } from '@/lib/home-depot-locations';
import fs from 'fs';
import path from 'path';

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function normalizeString(value?: string | null) {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
}

function inferLocationType(tags: Record<string, string> | undefined): 'Distribution Center' | 'Store' {
  const name = normalizeString(tags?.name || tags?.brand || '');
  const typeTag = normalizeString(tags?.building || tags?.industrial || tags?.landuse || tags?.name || '');
  if (/distribution|distribution center|dc|fulfillment|warehouse/i.test(name + ' ' + typeTag)) {
    return 'Distribution Center';
  }
  return 'Store';
}

function elementToLocation(el: OverpassElement) {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null) return null;
  const tags = el.tags || {};
  const name = normalizeString(tags.name || tags.brand || 'THD');
  const state = normalizeString(tags['addr:state'] || tags['addr:province'] || '');
  const city = normalizeString(tags['addr:city'] || tags['addr:place'] || '');
  const country = normalizeString(tags['addr:country'] || 'USA');
  const type = inferLocationType(tags);
  return {
    id: `${el.type}-${el.id}`,
    name,
    type,
    city,
    state,
    country,
    lat,
    lng: lon,
    source: 'OpenStreetMap',
    tags,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const max = Math.min(Math.max(Number(url.searchParams.get('max') || '3000'), 10), 3000);

    const brandRegex = `(?i)\\b(?:the\\s+)?home[_ ]?depot\\b`;
    const query = `[out:json][timeout:60];\n` +
      `area["ISO3166-1"="US"][admin_level=2]->.searchArea;\n` +
      `(` +
      `node(area.searchArea)["brand"~"${brandRegex}"];\n` +
      `way(area.searchArea)["brand"~"${brandRegex}"];\n` +
      `relation(area.searchArea)["brand"~"${brandRegex}"];\n` +
      `node(area.searchArea)["name"~"${brandRegex}"];\n` +
      `way(area.searchArea)["name"~"${brandRegex}"];\n` +
      `relation(area.searchArea)["name"~"${brandRegex}"];\n` +
      `node(area.searchArea)["shop"="doityourself"]["name"~"${brandRegex}"];\n` +
      `);\n` +
      `out center qt;`;

    const endpoints = [
      'https://overpass.openstreetmap.fr/api/interpreter',
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
    ];
    let json: any = null;
    let lastErr: Error | null = null;
    for (const ep of endpoints) {
      try {
        const resp = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          body: `data=${encodeURIComponent(query)}`,
          signal: AbortSignal.timeout(30000),
        });
        if (!resp.ok) {
          lastErr = new Error(`Overpass endpoint ${ep} returned status ${resp.status}`);
          continue;
        }
        json = await resp.json();
        break;
      } catch (err) {
        lastErr = err as Error;
        continue;
      }
    }
    if (!json) {
      throw lastErr || new Error('All Overpass endpoints failed');
    }
    const elements = Array.isArray(json.elements) ? json.elements as OverpassElement[] : [];
    const locations = elements
      .map(elementToLocation)
      .filter((loc): loc is NonNullable<typeof loc> => !!loc)
      .filter((loc, index, all) => {
        const key = `${loc.lat.toFixed(6)}:${loc.lng.toFixed(6)}:${loc.name.toLowerCase()}`;
        return all.findIndex(item => `${item.lat.toFixed(6)}:${item.lng.toFixed(6)}:${item.name.toLowerCase()}` === key) === index;
      })
      .slice(0, max);

    // Try to load local generated Home Depot stores JSON and merge (server-side only)
    try {
      const jsonPath = path.join(process.cwd(), 'src', 'lib', 'home-depot-stores.json');
      if (fs.existsSync(jsonPath)) {
        const raw = fs.readFileSync(jsonPath, 'utf8');
        const parsed = JSON.parse(raw);
        const localStores = Array.isArray(parsed?.stores) ? parsed.stores.map((s: any, i: number) => ({
          id: s.id ?? `local-${i}`,
          name: s.name ?? 'Home Depot',
          type: s.type ?? 'Store',
          city: s.city ?? '',
          state: s.state ?? '',
          country: s.country ?? 'USA',
          lat: Number(s.lat),
          lng: Number(s.lng),
          source: 'local-json',
          tags: s.tags ?? {},
        })) : [];

        if (localStores.length > 0) {
          // merge and de-duplicate with OSM results
          const combined = [...locations];
          for (const ls of localStores) {
            const key = `${ls.lat.toFixed(6)}:${ls.lng.toFixed(6)}:${(ls.name||'').toLowerCase()}`;
            const exists = combined.find(item => `${item.lat.toFixed(6)}:${item.lng.toFixed(6)}:${item.name.toLowerCase()}` === key);
            if (!exists) combined.push(ls as any);
          }
          // limit to max
          const final = combined.slice(0, max);
          return NextResponse.json({ locations: final, source: 'combined' });
        }
      }
    } catch (err) {
      console.warn('Failed to read local home-depot-stores.json:', (err as Error).message);
    }

    if (locations.length === 0) {
      return NextResponse.json({ locations: THD_LOCATIONS, source: 'fallback' });
    }

    return NextResponse.json({ locations, source: 'openstreetmap' });
  } catch (error) {
    console.error('THD Overpass fetch failed:', error);
    return NextResponse.json({ locations: THD_LOCATIONS, source: 'fallback', error: (error as Error).message }, { status: 200 });
  }
}
