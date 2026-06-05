import urllib.request, urllib.parse
addr = '6770 Stonecrest Industrial Way, Stonecrest, GA 30058'
url = 'https://geocode.maps.co/search?' + urllib.parse.urlencode({'q': addr, 'format': 'json', 'limit': '1'})
with urllib.request.urlopen(url) as r:
    print(r.read().decode())
