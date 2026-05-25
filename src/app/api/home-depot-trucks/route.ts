import { NextResponse } from 'next/server';
import { HOME_DEPOT_TRUCK_LOCATIONS, HomeDepotTruckLocation } from '@/lib/home-depot-trucks';

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const CARRIER_PATTERNS = /ups|fedex|xpo|old dominion|yrc|estes|j\.b\. hunt/i;
const ASN_LOOKUP: Record<string, string> = {
  ups: 'AS14618',
  fedex: 'AS702',
  xpo: 'AS20015',
  'old dominion': 'AS24348',
  yrc: 'AS1758',
  estes: 'AS15735',
  'j.b. hunt': 'AS31513',
};

function normalize(value?: string | null) {
  return value ? value.trim() : '';
}

function inferCarrier(tags: Record<string, string> | undefined) {
  const candidate = normalize(tags?.operator || tags?.brand || tags?.name).toLowerCase();
  if (candidate.match(CARRIER_PATTERNS)) {
    const matched = candidate.match(CARRIER_PATTERNS)?.[0] || '';
    return matched.replace(/\s+/g, ' ').replace(/\./g, '').trim();
  }
  return 'Unknown Carrier';
}

function lookupAsn(carrier: string) {
  return ASN_LOOKUP[carrier.toLowerCase()] || 'ASN UNKNOWN';
}

function elementToTruck(el: OverpassElement): HomeDepotTruckLocation | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null) return null;
  const tags = el.tags || {};
  const carrier = inferCarrier(tags);
  const asn = tags.asn || lookupAsn(carrier);
  const name = normalize(tags.name || tags.operator || tags.brand || `${carrier} Logistics Hub`);
  const city = normalize(tags['addr:city'] || tags['addr:place'] || 'Unknown');
  const state = normalize(tags['addr:state'] || tags['addr:province'] || 'Unknown');
  const country = normalize(tags['addr:country'] || 'USA');
  return {
    id: `${el.type}-${el.id}`,
    name,
    carrier,
    asn,
    city,
    state,
    country,
    lat,
    lng: lon,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const max = Math.min(Math.max(Number(url.searchParams.get('max') || '400'), 10), 400);

    const query = `[out:json][timeout:60];\n` +
      `area["ISO3166-1"="US"][admin_level=2]->.searchArea;\n` +
      `(` +
      `node(area.searchArea)["operator"~"(?i)UPS|FedEx|XPO|Old Dominion|YRC|Estes|J.B. Hunt"]["building"~"(?i)warehouse|distribution|industrial|logistics|depot"];\n` +
      `way(area.searchArea)["operator"~"(?i)UPS|FedEx|XPO|Old Dominion|YRC|Estes|J.B. Hunt"]["building"~"(?i)warehouse|distribution|industrial|logistics|depot"];\n` +
      `relation(area.searchArea)["operator"~"(?i)UPS|FedEx|XPO|Old Dominion|YRC|Estes|J.B. Hunt"]["building"~"(?i)warehouse|distribution|industrial|logistics|depot"];\n` +
      `node(area.searchArea)["brand"~"(?i)UPS|FedEx|XPO|Old Dominion|YRC|Estes|J.B. Hunt"]["building"~"(?i)warehouse|distribution|industrial|logistics|depot"];\n` +
      `way(area.searchArea)["brand"~"(?i)UPS|FedEx|XPO|Old Dominion|YRC|Estes|J.B. Hunt"]["building"~"(?i)warehouse|distribution|industrial|logistics|depot"];\n` +
      `relation(area.searchArea)["brand"~"(?i)UPS|FedEx|XPO|Old Dominion|YRC|Estes|J.B. Hunt"]["building"~"(?i)warehouse|distribution|industrial|logistics|depot"];\n` +
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
      .map(elementToTruck)
      .filter((loc): loc is NonNullable<typeof loc> => !!loc)
      .filter((loc, index, all) => {
        const key = `${loc.lat.toFixed(5)}:${loc.lng.toFixed(5)}:${loc.name.toLowerCase()}`;
        return all.findIndex(item => `${item.lat.toFixed(5)}:${item.lng.toFixed(5)}:${item.name.toLowerCase()}` === key) === index;
      })
      .slice(0, max);

    if (locations.length === 0) {
      return NextResponse.json({ locations: HOME_DEPOT_TRUCK_LOCATIONS, source: 'fallback' });
    }

    return NextResponse.json({ locations, source: 'openstreetmap' });
  } catch (error) {
    console.error('Home Depot truck fetch failed:', error);
    return NextResponse.json({ locations: HOME_DEPOT_TRUCK_LOCATIONS, source: 'fallback', error: (error as Error).message }, { status: 200 });
  }
}
