# Get current now-playing state from blob cache
GET {{host}}/api/now-playing
[Options]
variable: host=http://localhost:3000

HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.isPlaying" exists
jsonpath "$.recentAlbums" isCollection
