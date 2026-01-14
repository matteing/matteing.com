# API Tests (Hurl)

HTTP request tests for the matteing.com API endpoints.

## Usage

```bash
# Run all tests against localhost
hurl --variable host=http://localhost:3000 rest/*.hurl

# Run a single test
hurl --variable host=http://localhost:3000 rest/now_playing.hurl

# Run against production
hurl --variable host=https://matteing.com rest/now_playing.hurl

# Run cron with auth (production)
hurl --variable host=https://matteing.com --variable cron_secret=YOUR_SECRET rest/cron_now_playing.hurl
```
