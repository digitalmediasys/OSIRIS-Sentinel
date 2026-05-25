import { NextResponse } from 'next/server';
import { HOME_DEPOT_LOCATIONS } from '@/lib/home-depot-locations';

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
  const name = normalizeString(tags.name || tags.brand || 'Home Depot');
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

    const query = `[out:json][timeout:60];\n` +
      `area["ISO3166-1"="US"][admin_level=2]->.searchArea;\n` +
      `(` +
      `node(area.searchArea)["brand"~"(?i)Home Depot"];\n` +
      `way(area.searchArea)["brand"~"(?i)Home Depot"];\n` +
      `relation(area.searchArea)["brand"~"(?i)Home Depot"];\n` +
      `node(area.searchArea)["name"~"(?i)Home Depot"];\n` +
      `way(area.searchArea)["name"~"(?i)Home Depot"];\n` +
      `relation(area.searchArea)["name"~"(?i)Home Depot"];\n` +
      `);\n` +
      `out center qt;`;

    const response = await fetch('https://overpass.openstreetmap.fr/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Overpass API returned status ${response.status}`);
    }

    const json = await response.json();
    const elements = Array.isArray(json.elements) ? json.elements as OverpassElement[] : [];
    const locations = elements
      .map(elementToLocation)
      .filter((loc): loc is NonNullable<typeof loc> => !!loc)
      .filter((loc, index, all) => {
        const key = `${loc.lat.toFixed(6)}:${loc.lng.toFixed(6)}:${loc.name.toLowerCase()}`;
        return all.findIndex(item => `${item.lat.toFixed(6)}:${item.lng.toFixed(6)}:${item.name.toLowerCase()}` === key) === index;
      })
      .slice(0, max);

    if (locations.length === 0) {
      return NextResponse.json({ locations: HOME_DEPOT_LOCATIONS, source: 'fallback' });
    }

    return NextResponse.json({ locations, source: 'openstreetmap' });
  } catch (error) {
    console.error('Home Depot Overpass fetch failed:', error);
    return NextResponse.json({ locations: HOME_DEPOT_LOCATIONS, source: 'fallback', error: (error as Error).message }, { status: 200 });
  }
}
