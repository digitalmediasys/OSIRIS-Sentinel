const https = require('https');
const fs = require('fs');
const addresses = [
  "155 Alcovy Industrial, Dacula, GA 30019",
  "8423 Sunstate Street, Tampa, FL 33634",
  "2900 N Andrews Ave Ext, Pompano Beach, FL 33064",
  "1701 N Claton Drive, Columbia, TN 38401",
  "501 Black Satchel Road, Charlotte, NC 28216",
  "9215 Riverview Drive, St Louis, MO 63137",
  "570 North Depot Drive, Ogden, UT 84404",
  "1101 S Industrial Pkwy, Clearfield, UT 84015",
  "300 S 55th Avenue, Phoenix, AZ 85043",
  "10815 Sentinel Drive, San Antonio, TX 78217",
  "18100 Chisholm Trail, Houston, TX 77060",
  "835 A - Pride Blvd, Hammond, LA 70401",
  "1727 Warren Street, Kansas City, MO 64116",
  "9410 Heinze Way, Henderson, CO 89044",
  "8535 Oakwood Place, Rancho Cucamonga, CA 91730",
  "40745 Encyclopedia Circle, Fremont, CA 94538",
  "14659 Alondra Blvd, La Mirada, CA 90638",
  "38481 Huron River Drive, Romulus, MI 48174",
  "30301 Carter Street, Solon, OH 44139",
  "1000 Knell Road, Montgomery, IL 60538",
  "8800 S 190th Street, Kent, WA 98031",
  "9222 W Jefferson Blvd, Dallas, TX 75211",
  "101 Prosperity Ave SE, South Valley, NM 87105",
  "100 Riverside Drive, Keasbey, NJ 08832",
  "722 Kasota Circle SE, Minneapolis, MN 55414",
  "100 Blue Heron Way, Edison, NJ 08837",
  "205 Sills Road, Yaphank, NY 11980",
  "7700 Rolling Mill Road, Baltimore, MD 21224",
  "7100 Holladay Tyler Road, Glenn Dale, MD 20769",
  "625 University Ave, Norwood, MA 02062",
  "340 Port Road 22, Stockton, CA 95203",
  "170 Highland Park Drive, Bloomfield, CT 06002",
  "2700 Burlington Avenue, Delanco, NJ 08075",
  "2359 Center Square Road, Swedesboro, NJ 08085",
  "130 Docks Corner Road South, Brunswick, NJ 08810",
  "4705 East Liberty St, Mexico, MO 65265",
  "4565 Redlands Ave, Perris, CA 92571",
  "350 West Markham St, Perris, CA 92571",
  "2400 Highway 155 South, Bldg 200, Locust Grove, GA 30248",
  "22671 Pemberville Rd, Luckey, OH 43443",
  "16502 Hunters Green Pkwy, Hagerstown, MD 21740",
  "2500 Highway 155 South, Locust Grove, GA 30248",
  "6311 Trade Point Ave, Sparrows Point, MD 21219",
  "500 Gateway Boulevard - Suite Ifc, Monroe, OH 45050",
  "2300 Beckleymeade Avenue - Suite Ifc, Dallas, TX 75232",
  "300 Enterprise Way Parcel #10, Pittston Township, PA 18640",
  "27352 River Bluff Avenue, Redlands, CA 92374",
  "3900 Brandon Rd Suite B, Joliet, IL 60436",
  "3150 Hwy 42, Locust Grove, GA 30248",
  "400 Rodeo Place, Anchorage, AK 99508",
  "901 Northview Rd, Waukesha, WI 53188",
  "7301 Security Way, Jersey Village, TX 77040",
  "3800 S Macarthur Blvd, Oklahoma City, OK 73179",
  "10 North Avenue East, Elizabeth, NJ 07201",
  "7501 Andrews Federal, Suitland, MD 20746",
  "300 South Front Street, Seattle, WA 98108",
  "6301 Tradepoint Ave, Sparrows Point, MD 21219",
  "7703 N Sam Houston Pkwy, Houston, TX 77064",
  "4863 Scarlet Lane, Stow, OH 44224",
  "2840 Innovation Way, Sun Prairie, WI 53590",
  "18700 S. Ridgeland Ave, Tinley Park, IL 60477",
  "8655 Corporate Drive Frisco TX, 75033",
  "1105 Meister Lane, Pflugerville, TX 78660",
  "221 Riverview Dr, Perth Amboy, NJ 08861",
  "1911 South Wiggins Rd, Plant City, FL 33566",
  "1515 Bobali Drive, Harrisburg, PA 17104",
  "9377 Laredo Ave Bldg 8, Fort Myers, FL 33905",
  "6043 Southern Blv Bldg 3, West Palm Beach, FL 33413",
  "2211 Corner Ridge, San Antonio, TX 78219",
  "5855 Vista East Parkway, Orlando, FL 32829",
  "2640 Zeppelin Rd Ste 150, Colorado Springs, CO 80916",
  "6900 Harbour View Blvd, Suffolk, VA 23435",
  "12300 62nd St N, Largo, FL 33773",
  "960 Rotterdam Industrial, Schenectady, NY 12306",
  "234 Mason Rd, La Vergne, TN 37086",
  "74 Brookfield Oaks Drive, Greenville, SC 29607",
  "4735 Arcadia Drive, Frederick, MD 21704",
  "2300 Beckleymeade Ave., Dallas, TX 75232",
  "5200 SW Wenger Drive, Topeka, KS 66609",
  "480 Park Center Drive, Winchester, VA 22603",
  "8500 Willard Drive, Breinigsville, PA 18031",
  "500 Gateway Blvd, Monroe, OH 45050",
  "6201 Peterson Road, Lake Park, GA 31636",
  "6400 Jefferson Metro Pkwy, McCalla, AL 35111",
  "27352 River Bluff Avenue, Redlands, CA 92374",
  "420 Foster Brothers Drive, West Columbia, SC 29172",
  "300 Enterprise Way, Pittson Township, PA 18640",
  "1989 Township Road 142, Van Buren, OH 45889",
  "50 Campanelli Drive, Westfield, MA 01085",
  "3150 Hwy 42 South, Locust Grove, GA 30248",
  "11333 N. Gessner Road, Houston, TX 77064",
  "4999 Depot Court SE, Salem, OR 97317",
  "1400 Pescadero Avenue, Tracy, CA 95304",
  "5655 E Ontario Mills Pky., Ontario, CA 91764",
  "9081 W Washington Street, Tolleson, AZ 85353",
  "7808 Hawks Prairie Rd NE, Lacey, WA 98516",
  "2950 Centerpoint Way, Elwood, IL 60436",
  "1070 Windham Pkwy, Romeoville, IL 60446",
  "130 Interstate Blvd, Monroe Township, NJ 08831",
  "7037 West Van Buren, Phoenix, AZ 85043",
  "2200 S Business 45, Corsicana, TX 75110",
  "190 Greenwood Industrial, Mcdonough, GA 30253",
  "125 Crossroads Pkwy, Savannah, GA 31407",
  "861 Nestle Way, Breinigsville, PA 18031",
  "309 Little Hearst Pkwy, Savannah, GA 31407",
  "280 Maranto Manor Drive, Winchester, VA 22602",
  "18300 Harlan Road, Lathrop, CA 95330",
  "7301 Security Way, Jersey Village, TX 77040",
  "11650 Venture Drive, Mira Loma, CA 91752",
  "6115 FM 1405, Baytown, TX 77523",
  "9303 Orion Drive NE, Lacey, WA 98516",
  "2320 Beckleymeade Ave, Dallas, TX 75232",
  "901 Carlow Drive, Bolingbrook, IL 60490",
  "601 Neelytown Road, Montgomery, NY 12549",
  "66 Cranbury Station Road, Cranbury, NJ 08512",
  "61 Cranbury Station Road, Cranbury, NJ 08512"
];

const results = [];
let i = 0;

function geocode() {
  if (i >= addresses.length) {
    fs.writeFileSync('home-depot-dcs-geocoded.json', JSON.stringify(results, null, 2));
    console.log('DONE', results.length);
    return;
  }

  const address = addresses[i];
  const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ q: address, format: 'json', limit: '1', countrycodes: 'us' }).toString();

  https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'application/json',
      'Referer': 'https://www.openstreetmap.org/'
    }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try {
        const json = JSON.parse(d);
        results.push({
          address,
          lat: json.length ? parseFloat(json[0].lat) : null,
          lng: json.length ? parseFloat(json[0].lon) : null
        });
        console.log(i + 1, json.length ? 'OK' : 'NORESULT', address, json.length ? json[0].lat + ',' + json[0].lon : '');
      } catch (err) {
        console.error(i + 1, 'ERR', err.message, address);
        results.push({ address, lat: null, lng: null });
      }
      i += 1;
      setTimeout(geocode, 1100);
    });
  }).on('error', e => {
    console.error(i + 1, 'ERR', e.message, address);
    results.push({ address, lat: null, lng: null });
    i += 1;
    setTimeout(geocode, 1100);
  });
}

geocode();
