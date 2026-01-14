---
title: "Posting to a Discord Channel using NodeJS"
date: 2022-10-06T12:00:00
url: https://matteing.com/posts/posting-to-a-discord-channel-using-nodejs
slug: posting-to-a-discord-channel-using-nodejs
---

# Posting to a Discord Channel using NodeJS

Here's a quick snippet that allows you to send messages to a Discord channel using a webhook.

To get a webhook for your channel, visit Server Settings, then Integrations.

With the URL this returns, fill out the following snippet:

```typescript
const DISCORD_HOOK = "https://...";

export async function postMessage(message: string) {
  if (DISCORD_HOOK) {
    await fetch(DISCORD_HOOK, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });
  }
}
```

You're done. By calling `postMessage()`, you can now send messages to the Discord channel.
