export interface HomeDepotLocation {
  name: string;
  type: 'Store' | 'Distribution Center';
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

export const HOME_DEPOT_LOCATIONS: HomeDepotLocation[] = [
  { name: 'Home Depot Store - Atlanta, GA', type: 'Store', city: 'Atlanta', state: 'GA', country: 'USA', lat: 33.8540, lng: -84.2363 },
  { name: 'Home Depot Store - Baltimore, MD', type: 'Store', city: 'Baltimore', state: 'MD', country: 'USA', lat: 39.2858, lng: -76.6074 },
  { name: 'Home Depot Store - Boston, MA', type: 'Store', city: 'Boston', state: 'MA', country: 'USA', lat: 42.3450, lng: -71.0481 },
  { name: 'Home Depot Store - Charlotte, NC', type: 'Store', city: 'Charlotte', state: 'NC', country: 'USA', lat: 35.1797, lng: -80.8409 },
  { name: 'Home Depot Store - Chicago, IL', type: 'Store', city: 'Chicago', state: 'IL', country: 'USA', lat: 41.8708, lng: -87.6887 },
  { name: 'Home Depot Store - Cleveland, OH', type: 'Store', city: 'Cleveland', state: 'OH', country: 'USA', lat: 41.5001, lng: -81.6934 },
  { name: 'Home Depot Store - Columbus, OH', type: 'Store', city: 'Columbus', state: 'OH', country: 'USA', lat: 39.9612, lng: -82.9988 },
  { name: 'Home Depot Store - Dallas, TX', type: 'Store', city: 'Dallas', state: 'TX', country: 'USA', lat: 32.9595, lng: -96.8055 },
  { name: 'Home Depot Store - Denver, CO', type: 'Store', city: 'Denver', state: 'CO', country: 'USA', lat: 39.7528, lng: -104.9984 },
  { name: 'Home Depot Store - Detroit, MI', type: 'Store', city: 'Detroit', state: 'MI', country: 'USA', lat: 42.3314, lng: -83.0458 },
  { name: 'Home Depot Store - Fort Worth, TX', type: 'Store', city: 'Fort Worth', state: 'TX', country: 'USA', lat: 32.7555, lng: -97.3308 },
  { name: 'Home Depot Store - Fresno, CA', type: 'Store', city: 'Fresno', state: 'CA', country: 'USA', lat: 36.7378, lng: -119.7871 },
  { name: 'Home Depot Store - Hartford, CT', type: 'Store', city: 'Hartford', state: 'CT', country: 'USA', lat: 41.7658, lng: -72.6734 },
  { name: 'Home Depot Store - Houston, TX', type: 'Store', city: 'Houston', state: 'TX', country: 'USA', lat: 29.7910, lng: -95.4177 },
  { name: 'Home Depot Store - Indianapolis, IN', type: 'Store', city: 'Indianapolis', state: 'IN', country: 'USA', lat: 39.7684, lng: -86.1581 },
  { name: 'Home Depot Store - Jacksonville, FL', type: 'Store', city: 'Jacksonville', state: 'FL', country: 'USA', lat: 30.3322, lng: -81.6557 },
  { name: 'Home Depot Store - Kansas City, MO', type: 'Store', city: 'Kansas City', state: 'MO', country: 'USA', lat: 39.0997, lng: -94.5786 },
  { name: 'Home Depot Store - Las Vegas, NV', type: 'Store', city: 'Las Vegas', state: 'NV', country: 'USA', lat: 36.1699, lng: -115.1398 },
  { name: 'Home Depot Store - Los Angeles, CA', type: 'Store', city: 'Los Angeles', state: 'CA', country: 'USA', lat: 34.1571, lng: -118.3005 },
  { name: 'Home Depot Store - Louisville, KY', type: 'Store', city: 'Louisville', state: 'KY', country: 'USA', lat: 38.2527, lng: -85.7585 },
  { name: 'Home Depot Store - Miami, FL', type: 'Store', city: 'Miami', state: 'FL', country: 'USA', lat: 25.7684, lng: -80.3214 },
  { name: 'Home Depot Store - Milwaukee, WI', type: 'Store', city: 'Milwaukee', state: 'WI', country: 'USA', lat: 43.0389, lng: -87.9065 },
  { name: 'Home Depot Store - Minneapolis, MN', type: 'Store', city: 'Minneapolis', state: 'MN', country: 'USA', lat: 44.9778, lng: -93.2650 },
  { name: 'Home Depot Store - Nashville, TN', type: 'Store', city: 'Nashville', state: 'TN', country: 'USA', lat: 36.1627, lng: -86.7816 },
  { name: 'Home Depot Store - New York, NY', type: 'Store', city: 'New York', state: 'NY', country: 'USA', lat: 40.7577, lng: -73.9866 },
  { name: 'Home Depot Store - Oakland, CA', type: 'Store', city: 'Oakland', state: 'CA', country: 'USA', lat: 37.8044, lng: -122.2711 },
  { name: 'Home Depot Store - Oklahoma City, OK', type: 'Store', city: 'Oklahoma City', state: 'OK', country: 'USA', lat: 35.4676, lng: -97.5164 },
  { name: 'Home Depot Store - Orlando, FL', type: 'Store', city: 'Orlando', state: 'FL', country: 'USA', lat: 28.5383, lng: -81.3792 },
  { name: 'Home Depot Store - Philadelphia, PA', type: 'Store', city: 'Philadelphia', state: 'PA', country: 'USA', lat: 39.9526, lng: -75.1652 },
  { name: 'Home Depot Store - Phoenix, AZ', type: 'Store', city: 'Phoenix', state: 'AZ', country: 'USA', lat: 33.4484, lng: -112.0740 },
  { name: 'Home Depot Store - Portland, OR', type: 'Store', city: 'Portland', state: 'OR', country: 'USA', lat: 45.5152, lng: -122.6784 },
  { name: 'Home Depot Store - Raleigh, NC', type: 'Store', city: 'Raleigh', state: 'NC', country: 'USA', lat: 35.7796, lng: -78.6382 },
  { name: 'Home Depot Store - Sacramento, CA', type: 'Store', city: 'Sacramento', state: 'CA', country: 'USA', lat: 38.5816, lng: -121.4944 },
  { name: 'Home Depot Store - San Antonio, TX', type: 'Store', city: 'San Antonio', state: 'TX', country: 'USA', lat: 29.4241, lng: -98.4936 },
  { name: 'Home Depot Store - San Diego, CA', type: 'Store', city: 'San Diego', state: 'CA', country: 'USA', lat: 32.7157, lng: -117.1611 },
  { name: 'Home Depot Store - San Francisco, CA', type: 'Store', city: 'San Francisco', state: 'CA', country: 'USA', lat: 37.7749, lng: -122.4194 },
  { name: 'Home Depot Store - San Jose, CA', type: 'Store', city: 'San Jose', state: 'CA', country: 'USA', lat: 37.3382, lng: -121.8863 },
  { name: 'Home Depot Store - Seattle, WA', type: 'Store', city: 'Seattle', state: 'WA', country: 'USA', lat: 47.5905, lng: -122.3329 },
  { name: 'Home Depot Store - Tampa, FL', type: 'Store', city: 'Tampa', state: 'FL', country: 'USA', lat: 27.9506, lng: -82.4572 },
  { name: 'Home Depot Store - Tulsa, OK', type: 'Store', city: 'Tulsa', state: 'OK', country: 'USA', lat: 36.15398, lng: -95.99278 },
  { name: 'Home Depot Store - Virginia Beach, VA', type: 'Store', city: 'Virginia Beach', state: 'VA', country: 'USA', lat: 36.8529, lng: -75.9780 },
  { name: 'Home Depot Store - Washington, DC', type: 'Store', city: 'Washington', state: 'DC', country: 'USA', lat: 38.9072, lng: -77.0369 },
  { name: 'Home Depot Distribution Center - Indianapolis, IN', type: 'Distribution Center', city: 'Indianapolis', state: 'IN', country: 'USA', lat: 39.8570, lng: -86.2203 },
  { name: 'Home Depot Distribution Center - Dallas, TX', type: 'Distribution Center', city: 'Dallas', state: 'TX', country: 'USA', lat: 32.9595, lng: -96.8055 },
  { name: 'Home Depot Distribution Center - Jacksonville, FL', type: 'Distribution Center', city: 'Jacksonville', state: 'FL', country: 'USA', lat: 30.3245, lng: -81.6052 },
  { name: 'Home Depot Distribution Center - Stockton, CA', type: 'Distribution Center', city: 'Stockton', state: 'CA', country: 'USA', lat: 37.9619, lng: -121.2853 },
  { name: 'Home Depot Distribution Center - Norfolk, VA', type: 'Distribution Center', city: 'Norfolk', state: 'VA', country: 'USA', lat: 36.8959, lng: -76.2083 },
  { name: 'Home Depot Distribution Center - Reno, NV', type: 'Distribution Center', city: 'Reno', state: 'NV', country: 'USA', lat: 39.4738, lng: -119.7688 },
];
