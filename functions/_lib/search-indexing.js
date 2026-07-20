import { getSiteOrigin, isJobSchemaEligible, jobUrl } from "./seo.js";

const GOOGLE_SCOPE = "https://www.googleapis.com/auth/indexing";
const GOOGLE_INDEXING_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export async function notifyJobChange(env, job, type = "URL_UPDATED") {
  if (!job?.id) return [];

  const url = jobUrl(job, env);
  const tasks = [
    notifyIndexNow(env, [url, getSiteOrigin(env), `${getSiteOrigin(env)}/sitemap.xml`]),
  ];
  if (isJobSchemaEligible(job)) {
    tasks.push(notifyGoogleIndexing(env, url, type));
  }

  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Search indexing notification failed", result.reason);
    }
  }
  return results;
}

export async function notifyIndexNow(env, urls) {
  const key = String(env?.INDEXNOW_KEY || "").trim();
  if (!key) return { skipped: true, reason: "INDEXNOW_KEY is not configured" };

  const origin = getSiteOrigin(env);
  const uniqueUrls = [...new Set(urls.filter((url) => String(url).startsWith(`${origin}/`) || url === origin))];
  if (!uniqueUrls.length) return { skipped: true, reason: "No valid URLs" };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({
      host: new URL(origin).host,
      key,
      keyLocation: `${origin}/api/indexnow-key`,
      urlList: uniqueUrls,
    }),
  });

  if (!response.ok && response.status !== 202) {
    throw new Error(`IndexNow returned HTTP ${response.status}`);
  }

  return { success: true, status: response.status };
}

export async function notifyGoogleIndexing(env, url, type = "URL_UPDATED") {
  const serviceAccount = parseServiceAccount(env?.GOOGLE_INDEXING_SERVICE_ACCOUNT);
  if (!serviceAccount) {
    return { skipped: true, reason: "GOOGLE_INDEXING_SERVICE_ACCOUNT is not configured" };
  }

  const token = await createGoogleAccessToken(serviceAccount);
  const response = await fetch(GOOGLE_INDEXING_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ url, type }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google Indexing API returned HTTP ${response.status}: ${detail.slice(0, 300)}`);
  }

  return { success: true, status: response.status };
}

function parseServiceAccount(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return validateServiceAccount(parsed);
  } catch {
    try {
      const decoded = atob(raw.replace(/\s+/g, ""));
      return validateServiceAccount(JSON.parse(decoded));
    } catch {
      throw new Error("GOOGLE_INDEXING_SERVICE_ACCOUNT must be valid JSON or base64-encoded JSON");
    }
  }
}

function validateServiceAccount(value) {
  if (!value?.client_email || !value?.private_key) {
    throw new Error("Google service account is missing client_email or private_key");
  }
  return value;
}

async function createGoogleAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlJson({ alg: "RS256", typ: "JWT" });
  const payload = base64UrlJson({
    iss: serviceAccount.client_email,
    scope: GOOGLE_SCOPE,
    aud: serviceAccount.token_uri || GOOGLE_TOKEN_ENDPOINT,
    iat: now,
    exp: now + 3600,
  });
  const unsignedToken = `${header}.${payload}`;
  const privateKey = await importPrivateKey(serviceAccount.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );
  const assertion = `${unsignedToken}.${base64UrlBytes(new Uint8Array(signature))}`;

  const response = await fetch(serviceAccount.token_uri || GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.access_token) {
    throw new Error(`Unable to obtain Google access token (HTTP ${response.status})`);
  }
  return result.access_token;
}

async function importPrivateKey(pem) {
  const base64 = String(pem)
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));

  return crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function base64UrlJson(value) {
  return base64UrlBytes(new TextEncoder().encode(JSON.stringify(value)));
}

function base64UrlBytes(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
