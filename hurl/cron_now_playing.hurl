# Trigger the now-playing cron job (requires CRON_SECRET in production)
# In development, auth is bypassed

# Without auth (works in dev)
GET {{host}}/api/cron/now-playing
[Options]
variable: host=http://localhost:3000

HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.success" == true


# With auth (required in production)
GET {{host}}/api/cron/now-playing
Authorization: Bearer {{cron_secret}}
[Options]
variable: cron_secret=lol

HTTP 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.isPlaying" exists
jsonpath "$.track" exists
