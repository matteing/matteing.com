---
title: "On-Demand ISR for Ghost w/ NextJS"
date: 2022-10-06T12:00:00
url: https://matteing.com/posts/on-demand-isr-ghost-nextjs
slug: on-demand-isr-ghost-nextjs
---

# On-Demand ISR for Ghost w/ NextJS

Here's a quick snippet that allows for On-Demand ISR (incremental static regeneration) in NextJS and Ghost CMS (headless). This gets triggered as a webhook anywhere in your `api/` folder.

You'd also set a webhook secret in your environment variables to protect it from misuse. There's a couple of lines specific to this site, but the file should mostly remain the same after adjusting it to your use case.

It detects the revalidation content type – posts or pages – and revalidates a path with a given mapping.

```typescript
// /pages/api/ghost/revalidate.ts
import { NextApiRequest, NextApiResponse } from "next";
import get from "lodash/fp/get";
import { REVALIDATE_KEY } from "../../../config";
import { postMessage } from "../../../lib/discord";
import isError from "lodash/isError";
import reduce from "lodash/reduce";

interface RevalidateMap {
  [type: string]: (slug: string) => string;
}

const PATH_MAP: RevalidateMap = {
  post: (slug) => `/posts/${slug}`,
  page: (slug) => `/${slug}`,
};

interface SlugItem {
  type: "post" | "page";
  slug: string;
}

function collectSlugs(req: NextApiRequest): SlugItem[] {
  return reduce(
    Object.keys(req.body),
    (result: SlugItem[], value) => {
      const currentSlug = get(`${value}.current.slug`, req.body);
      const previousSlug = get(`${value}.previous.slug`, req.body);
      if (previousSlug === undefined && currentSlug) {
        return [
          ...result,
          { type: value as SlugItem["type"], slug: currentSlug },
        ];
      } else if (currentSlug === undefined && previousSlug) {
        return [
          ...result,
          { type: value as SlugItem["type"], slug: previousSlug },
        ];
      } else {
        return [
          ...result,
          { type: value as SlugItem["type"], slug: currentSlug },
          { type: value as SlugItem["type"], slug: previousSlug },
        ];
      }
    },
    []
  );
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== REVALIDATE_KEY) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const collected = collectSlugs(req);
    // Revalidate post lists.
    await res.revalidate("/");
    await res.revalidate("/posts");
    // Revalidate individual pages.
    await Promise.all(
      collected.map(async (item) => {
        const path = PATH_MAP[item.type](item.slug);
        await res.revalidate(path);
        await postMessage(`✅ Revalidated w/ ISR: \`${path}\``);
      })
    );
    return res.json({ revalidated: true });
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    // eslint-disable-next-line no-console
    console.error(err);
    let message = "Unknown Error";
    if (isError(err)) message = err.message;
    postMessage(`⚠️ Failed to on-demand revalidate. \`${message}\``);
    return res.status(500).send("Error revalidating");
  }
};
```

After adding this endpoint to your NextJS site, you'd add the URL to Ghost webhooks on any related events (page/post updated, published, etc).

Your pages should now update incrementally without a full build process. This works great on Vercel!
