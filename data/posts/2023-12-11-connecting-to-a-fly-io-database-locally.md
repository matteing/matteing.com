---
title: "Connecting to a Fly.io database locally"
date: 2023-12-11T12:00:00
url: https://matteing.com/posts/connecting-to-a-fly-io-database-locally
slug: connecting-to-a-fly-io-database-locally
---

# Connecting to a Fly.io database locally

Saving someone quite some pain:

```bash
flyctl proxy 15432:5432 -s -a <app_name>
```

The `-s` flag is crucial! Otherwise your proxy won't boot up.
