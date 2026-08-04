import { createPrivateKey, sign } from "node:crypto";

import {
  AM_DEV_TOKEN,
  AM_KEY_ID,
  AM_PRIVATE_KEY,
  AM_TEAM_ID,
} from "@/lib/config";

const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 30;
const EXPIRY_BUFFER_SECONDS = 60 * 5;

let generatedToken: { value: string; expiresAt: number } | null = null;

function encode(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}
function tokenExpiresAt(token: string): number | null {
  try {
    const [, payload] = token.split(".");
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

function isUsable(token: string): boolean {
  const expiresAt = tokenExpiresAt(token);
  return expiresAt === null || expiresAt > Date.now() / 1000 + EXPIRY_BUFFER_SECONDS;
}

function generateDeveloperToken(): string | null {
  if (!AM_TEAM_ID || !AM_KEY_ID || !AM_PRIVATE_KEY) return null;

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + TOKEN_LIFETIME_SECONDS;
  const header = encode(JSON.stringify({ alg: "ES256", kid: AM_KEY_ID }));
  const payload = encode(
    JSON.stringify({ iss: AM_TEAM_ID, iat: issuedAt, exp: expiresAt })
  );
  const unsignedToken = `${header}.${payload}`;
  const privateKey = createPrivateKey(AM_PRIVATE_KEY.replace(/\\n/g, "\n"));
  const signature = sign("sha256", Buffer.from(unsignedToken), {
    key: privateKey,
    dsaEncoding: "ieee-p1363",
  });
  const value = `${unsignedToken}.${encode(signature)}`;

  generatedToken = { value, expiresAt };
  return value;
}

/** Return a valid Apple Music developer token, generating one when key material is configured. */
export function getDeveloperToken(): string | null {
  if (
    generatedToken &&
    generatedToken.expiresAt > Date.now() / 1000 + EXPIRY_BUFFER_SECONDS
  ) {
    return generatedToken.value;
  }

  const generated = generateDeveloperToken();
  if (generated) return generated;

  return AM_DEV_TOKEN && isUsable(AM_DEV_TOKEN) ? AM_DEV_TOKEN : null;
}
