const TOKEN_PAGE = "https://music.apple.com/us/album/1693323844";
const TOKEN_TTL_MS = 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

let cachedToken: { value: string; fetchedAt: number } | null = null;
let pendingToken: Promise<string | null> | null = null;

function isAppleWebToken(token: string): boolean {
  try {
    const [headerPart, payloadPart] = token.split(".");
    const header = JSON.parse(Buffer.from(headerPart, "base64url").toString());
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString());
    return (
      header.alg === "ES256" &&
      typeof payload.exp === "number" &&
      payload.exp > Date.now() / 1000 + 300 &&
      Array.isArray(payload.root_https_origin) &&
      payload.root_https_origin.includes("apple.com")
    );
  } catch {
    return false;
  }
}
async function fetchText(url: string): Promise<string | null> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) return null;
  return response.text();
}

async function discoverToken(): Promise<string | null> {
  const html = await fetchText(TOKEN_PAGE);
  if (!html) return null;

  const scriptPaths = Array.from(
    html.matchAll(/<script[^>]+src="([^"]+(?:index|musickit)[^"]+\.js)"/g),
    (match) => match[1]
  );

  for (const path of scriptPaths) {
    const script = await fetchText(new URL(path, TOKEN_PAGE).toString());
    if (!script) continue;

    // JWT JSON key order is not stable, so match the three base64url segments and validate them.
    const candidates =
      script.match(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g) ?? [];
    const token = candidates.find(isAppleWebToken);
    if (token) return token;
  }

  return null;
}

/** Get Apple's web-player token used for catalog extensions unavailable in the public API. */
export async function getAppleWebToken(): Promise<string | null> {
  if (cachedToken && Date.now() - cachedToken.fetchedAt < TOKEN_TTL_MS) {
    return cachedToken.value;
  }

  if (!pendingToken) {
    pendingToken = discoverToken()
      .then((value) => {
        if (value) cachedToken = { value, fetchedAt: Date.now() };
        return value;
      })
      .finally(() => {
        pendingToken = null;
      });
  }

  return pendingToken;
}
