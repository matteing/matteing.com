# Get the RSS feed
GET {{host}}/api/feed
[Options]
variable: host=http://localhost:3000

HTTP 200
[Asserts]
header "Content-Type" contains "application/rss+xml"
xpath "string(//rss/@version)" == "2.0"
xpath "string(//channel/title)" exists
