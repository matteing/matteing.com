# Read-only playback endpoint; only the authenticated CLI can update it.
GET {{host}}/api/now-playing
HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
header "Cache-Control" contains "no-store"
jsonpath "$.isPlaying" exists
jsonpath "$.serverTime" exists

GET {{host}}/api/recently-played
HTTP 200
[Asserts]
header "Cache-Control" contains "no-store"
jsonpath "$.albums" isCollection
jsonpath "$.stale" exists
jsonpath "$.unavailable" exists

# Unauthorized writers must never alter playback.
POST {{host}}/api/now-playing
Content-Type: application/json
{}
HTTP 401
