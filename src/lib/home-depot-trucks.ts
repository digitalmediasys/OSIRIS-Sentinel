export interface HomeDepotTruckLocation {
  id: string;
  name: string;
  carrier: string;
  asn: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

export const HOME_DEPOT_TRUCK_LOCATIONS: HomeDepotTruckLocation[] = [
  {
    id: 'fallback-ups-louisville',
    name: 'UPS Logistics Hub',
    carrier: 'UPS',
    asn: 'AS14618',
    city: 'Louisville',
    state: 'KY',
    country: 'USA',
    lat: 38.2542,
    lng: -85.7594,
  },
  {
    id: 'fallback-fedex-memphis',
    name: 'FedEx Ground Hub',
    carrier: 'FedEx',
    asn: 'AS702',
    city: 'Memphis',
    state: 'TN',
    country: 'USA',
    lat: 35.1390,
    lng: -90.0521,
  },
  {
    id: 'fallback-xpo-charlotte',
    name: 'XPO Logistics Center',
    carrier: 'XPO',
    asn: 'AS20015',
    city: 'Charlotte',
    state: 'NC',
    country: 'USA',
    lat: 35.2271,
    lng: -80.8431,
  },
  {
    id: 'fallback-od-rva',
    name: 'Old Dominion Freight Hub',
    carrier: 'Old Dominion',
    asn: 'AS24348',
    city: 'Richmond',
    state: 'VA',
    country: 'USA',
    lat: 37.5407,
    lng: -77.4360,
  },
  {
    id: 'fallback-estes-dayton',
    name: 'Estes Express Truck Hub',
    carrier: 'Estes',
    asn: 'AS15735',
    city: 'Dayton',
    state: 'OH',
    country: 'USA',
    lat: 39.7589,
    lng: -84.1916,
  },
];