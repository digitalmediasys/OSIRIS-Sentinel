import { NextResponse } from 'next/server';

// Public USA traffic camera data aggregated from various state DOT agencies
// Sources: NYC DOT, Caltrans, GDOT, TxDOT, MnDOT, etc.
const TRAFFIC_CAMERAS: any[] = [
  // ─── NEW YORK (NYC DOT) ───
  { id: 'nyc-001', name: 'Times Square', city: 'New York', state: 'NY', lat: 40.7580, lng: -73.9855, type: 'intersection', source: 'NYC DOT', stream_url: 'https://a.trafficcam.nyc/tmv1/gcce5d70.jpg', region: 'Northeast' },
  { id: 'nyc-002', name: 'FDR Drive', city: 'New York', state: 'NY', lat: 40.7100, lng: -73.9500, type: 'highway', source: 'NYC DOT', stream_url: 'https://a.trafficcam.nyc/tmv1/tmv_lf.jpg', region: 'Northeast' },
  { id: 'nyc-003', name: 'Brooklyn Bridge', city: 'New York', state: 'NY', lat: 40.7061, lng: -73.9969, type: 'bridge', source: 'NYC DOT', stream_url: 'https://a.trafficcam.nyc/tmv1/cck5d64.jpg', region: 'Northeast' },
  
  // ─── CALIFORNIA (Caltrans) ───
  { id: 'ca-001', name: 'I-405 Sunset', city: 'Los Angeles', state: 'CA', lat: 34.0722, lng: -118.4441, type: 'highway', source: 'Caltrans', stream_url: 'https://cwwp2.dot.ca.gov/data/d1/405_sunset.jpg', region: 'West' },
  { id: 'ca-002', name: 'Golden Gate Bridge North', city: 'San Francisco', state: 'CA', lat: 37.8310, lng: -122.4787, type: 'bridge', source: 'Caltrans', stream_url: 'https://cwwp2.dot.ca.gov/data/d4/ggb_north.jpg', region: 'West' },
  { id: 'ca-003', name: 'I-80 Oakland', city: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712, type: 'highway', source: 'Caltrans', stream_url: 'https://cwwp2.dot.ca.gov/data/d4/i80_oak.jpg', region: 'West' },
  { id: 'ca-004', name: 'I-10 Downtown LA', city: 'Los Angeles', state: 'CA', lat: 34.0195, lng: -118.2437, type: 'highway', source: 'Caltrans', stream_url: 'https://cwwp2.dot.ca.gov/data/d7/i10_dtla.jpg', region: 'West' },
  
  // ─── TEXAS (TxDOT) ───
  { id: 'tx-001', name: 'I-35 Downtown Austin', city: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431, type: 'highway', source: 'TxDOT', stream_url: 'https://www.txdot.gov/', region: 'South' },
  { id: 'tx-002', name: 'I-45 Downtown Houston', city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698, type: 'highway', source: 'TxDOT', stream_url: 'https://www.txdot.gov/', region: 'South' },
  { id: 'tx-003', name: 'I-635 Dallas', city: 'Dallas', state: 'TX', lat: 32.8753, lng: -96.4489, type: 'highway', source: 'TxDOT', stream_url: 'https://www.txdot.gov/', region: 'South' },
  
  // ─── GEORGIA (GDOT) ───
  { id: 'ga-001', name: 'I-75 I-85 Downtown Atlanta', city: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880, type: 'highway', source: 'GDOT', stream_url: 'https://511ga.org/', region: 'South' },
  { id: 'ga-002', name: 'I-285 East Atlanta', city: 'Atlanta', state: 'GA', lat: 33.7380, lng: -84.3100, type: 'highway', source: 'GDOT', stream_url: 'https://511ga.org/', region: 'South' },
  
  // ─── FLORIDA ───
  { id: 'fl-001', name: 'I-95 Miami Downtown', city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, type: 'highway', source: 'FDOT', stream_url: 'https://www.fdot.gov/', region: 'South' },
  { id: 'fl-002', name: 'I-4 Orlando', city: 'Orlando', state: 'FL', lat: 28.5421, lng: -81.3774, type: 'highway', source: 'FDOT', stream_url: 'https://www.fdot.gov/', region: 'South' },
  
  // ─── ILLINOIS (IDOT) ───
  { id: 'il-001', name: 'I-90 Chicago Downtown', city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, type: 'highway', source: 'IDOT', stream_url: 'https://www.idot.illinois.gov/', region: 'Midwest' },
  { id: 'il-002', name: 'I-94 Lake Shore Drive', city: 'Chicago', state: 'IL', lat: 41.8857, lng: -87.6181, type: 'highway', source: 'IDOT', stream_url: 'https://www.idot.illinois.gov/', region: 'Midwest' },
  
  // ─── MICHIGAN (MDOT) ───
  { id: 'mi-001', name: 'I-96 Detroit', city: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458, type: 'highway', source: 'MDOT', stream_url: 'https://www.michigan.gov/mdot/', region: 'Midwest' },
  { id: 'mi-002', name: 'I-75 Detroit', city: 'Detroit', state: 'MI', lat: 42.3271, lng: -83.0237, type: 'highway', source: 'MDOT', stream_url: 'https://www.michigan.gov/mdot/', region: 'Midwest' },
  
  // ─── MINNESOTA (MnDOT) ───
  { id: 'mn-001', name: 'I-35W Downtown Minneapolis', city: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650, type: 'highway', source: 'MnDOT', stream_url: 'https://www.dot.state.mn.us/', region: 'Midwest' },
  { id: 'mn-002', name: 'I-94 Minneapolis', city: 'Minneapolis', state: 'MN', lat: 44.9796, lng: -93.2632, type: 'highway', source: 'MnDOT', stream_url: 'https://www.dot.state.mn.us/', region: 'Midwest' },
  
  // ─── WASHINGTON (WSDOT) ───
  { id: 'wa-001', name: 'I-5 Seattle Downtown', city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, type: 'highway', source: 'WSDOT', stream_url: 'https://www.wsdot.wa.gov/', region: 'West' },
  { id: 'wa-002', name: 'I-90 Snoqualmie Pass', city: 'Snoqualmie', state: 'WA', lat: 47.4061, lng: -121.8256, type: 'highway', source: 'WSDOT', stream_url: 'https://www.wsdot.wa.gov/', region: 'West' },
  
  // ─── COLORADO (CDOT) ───
  { id: 'co-001', name: 'I-25 Denver Downtown', city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, type: 'highway', source: 'CDOT', stream_url: 'https://www.codot.gov/', region: 'Mountain' },
  { id: 'co-002', name: 'I-70 Mountain Pass', city: 'Denver', state: 'CO', lat: 39.8694, lng: -105.5165, type: 'highway', source: 'CDOT', stream_url: 'https://www.codot.gov/', region: 'Mountain' },
  
  // ─── ARIZONA (ADOT) ───
  { id: 'az-001', name: 'I-10 Phoenix Downtown', city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0742, type: 'highway', source: 'ADOT', stream_url: 'https://www.azdot.gov/', region: 'Southwest' },
  { id: 'az-002', name: 'I-17 Phoenix North', city: 'Phoenix', state: 'AZ', lat: 33.5478, lng: -112.0712, type: 'highway', source: 'ADOT', stream_url: 'https://www.azdot.gov/', region: 'Southwest' },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bounds = searchParams.get('bounds')?.split(',').map(Number);
    const state = searchParams.get('state');
    const region = searchParams.get('region');

    let filtered = TRAFFIC_CAMERAS;

    // Filter by bounding box (minLng, minLat, maxLng, maxLat)
    if (bounds && bounds.length === 4) {
      const [minLng, minLat, maxLng, maxLat] = bounds;
      filtered = filtered.filter(c => 
        c.lng >= minLng && c.lng <= maxLng && 
        c.lat >= minLat && c.lat <= maxLat
      );
    }

    // Filter by state
    if (state) {
      filtered = filtered.filter(c => c.state === state.toUpperCase());
    }

    // Filter by region
    if (region) {
      filtered = filtered.filter(c => c.region === region);
    }

    // Convert to GeoJSON FeatureCollection
    const features = filtered.map(camera => ({
      type: 'Feature' as const,
      properties: {
        id: camera.id,
        name: camera.name,
        city: camera.city,
        state: camera.state,
        type: camera.type,
        source: camera.source,
        stream_url: camera.stream_url,
        region: camera.region,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [camera.lng, camera.lat],
      },
    }));

    return NextResponse.json({
      type: 'FeatureCollection',
      features,
    });
  } catch (error) {
    console.error('Traffic cameras error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traffic cameras', features: [] },
      { status: 500 }
    );
  }
}
