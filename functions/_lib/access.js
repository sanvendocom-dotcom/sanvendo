const DEFAULT_ALLOWED_HOSTS = ["sanvendo.com", "www.sanvendo.com"];
const KEY_CACHE_TTL_MS = 60 * 60 * 1000;
const CLOCK_TOLERANCE_SECONDS = 30;

const jwksCache = new Map();

export async function authorizeAdmin(context) {
  const { request, env } = context;
  const hostname = new URL(request.url).hostname.toLowerCase();
  const allowedHosts = parseAllowedHosts(env.ADMIN_ALLOWED_HOSTS);

  if (!allowedHosts.has(hostname)) {
    return {
      ok: false,
      status: 404,
      message: "Không tìm thấy tài nguyên.",
    };
  }

  const teamDomain = normalizeTeamDomain(env.ACCESS_TEAM_DOMAIN);
  const audience = String(env.ACCESS_AUD || "").trim();

  if (!teamDomain || !audience) {
    return {
      ok: false,
      status: 503,
      message: "Trang quản trị chưa được cấu hình đầy đủ.",
      setupRequired: true,
    };
  }

  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) {
    return {
      ok: false,
      status: 403,
      message: "Không tìm thấy phiên đăng nhập Cloudflare Access.",
    };
  }

  try {
    const payload = await verifyAccessJwt(token, {
      issuer: teamDomain,
      audience,
    });

    const email = String(payload.email || "").trim().toLowerCase();
    const requiredEmail = String(env.ADMIN_EMAIL || "").trim().toLowerCase();

    if (!email) {
      return {
        ok: false,
        status: 403,
        message: "Phiên đăng nhập không có địa chỉ email.",
      };
    }

    if (requiredEmail && email !== requiredEmail) {
      return {
        ok: false,
        status: 403,
        message: "Tài khoản này không có quyền quản trị.",
      };
    }

    return {
      ok: true,
      payload,
      email,
      teamDomain,
    };
  } catch (error) {
    console.error("Access JWT verification failed", error);

    return {
      ok: false,
      status: 403,
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
    };
  }
}

export function adminErrorResponse(request, result) {
  const acceptsJson =
    new URL(request.url).pathname.includes("/api/") ||
    (request.headers.get("accept") || "").includes("application/json");

  if (acceptsJson) {
    return new Response(
      JSON.stringify({
        success: false,
        message: result.message,
        setupRequired: Boolean(result.setupRequired),
      }),
      {
        status: result.status || 403,
        headers: securityHeaders("application/json; charset=UTF-8"),
      }
    );
  }

  const status = result.status || 403;
  const title = status === 404 ? "Không tìm thấy" : "Không thể truy cập";
  const escapedMessage = escapeHtml(result.message || "Yêu cầu bị từ chối.");

  return new Response(
    `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>${title} — Sanvendo</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f7f8;color:#17231c;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(540px,calc(100% - 40px));padding:32px;background:#fff;border:1px solid #e6e9e7;border-radius:20px;box-shadow:0 18px 60px rgba(15,35,24,.08)}
    h1{margin:0 0 12px;font-size:28px}p{margin:0;color:#627067;line-height:1.6}a{display:inline-block;margin-top:22px;color:#087f4d;font-weight:800;text-decoration:none}
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <p>${escapedMessage}</p>
    <a href="/">Về trang chủ</a>
  </main>
</body>
</html>`,
    {
      status,
      headers: securityHeaders("text/html; charset=UTF-8"),
    }
  );
}

export function securityHeaders(contentType = "application/json; charset=UTF-8") {
  return {
    "Content-Type": contentType,
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}

async function verifyAccessJwt(token, options) {
  const parts = String(token).split(".");
  if (parts.length !== 3) {
    throw new Error("JWT malformed");
  }

  const header = parseJwtPart(parts[0]);
  const payload = parseJwtPart(parts[1]);

  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Unsupported JWT algorithm");
  }

  const issuer = options.issuer;
  if (payload.iss !== issuer) {
    throw new Error("Invalid issuer");
  }

  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(options.audience)) {
    throw new Error("Invalid audience");
  }

  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(payload.exp) || payload.exp < now - CLOCK_TOLERANCE_SECONDS) {
    throw new Error("Token expired");
  }

  if (Number.isFinite(payload.nbf) && payload.nbf > now + CLOCK_TOLERANCE_SECONDS) {
    throw new Error("Token is not active");
  }

  const jwk = await getSigningKey(issuer, header.kid);
  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["verify"]
  );

  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    base64UrlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );

  if (!verified) {
    throw new Error("Invalid signature");
  }

  return payload;
}

async function getSigningKey(issuer, kid) {
  let keys = await getJwks(issuer, false);
  let key = keys.find((item) => item.kid === kid);

  if (!key) {
    keys = await getJwks(issuer, true);
    key = keys.find((item) => item.kid === kid);
  }

  if (!key) {
    throw new Error("Signing key not found");
  }

  return key;
}

async function getJwks(issuer, forceRefresh) {
  const cached = jwksCache.get(issuer);
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
    return cached.keys;
  }

  const response = await fetch(`${issuer}/cdn-cgi/access/certs`, {
    headers: { Accept: "application/json" },
    cf: { cacheTtl: 3600, cacheEverything: true },
  });

  if (!response.ok) {
    throw new Error(`Unable to load Access certificates (${response.status})`);
  }

  const data = await response.json();
  const keys = Array.isArray(data.keys) ? data.keys : [];

  if (!keys.length) {
    throw new Error("No Access signing keys returned");
  }

  jwksCache.set(issuer, {
    keys,
    expiresAt: Date.now() + KEY_CACHE_TTL_MS,
  });

  return keys;
}

function parseJwtPart(value) {
  const decoded = new TextDecoder().decode(base64UrlToBytes(value));
  return JSON.parse(decoded);
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function normalizeTeamDomain(value) {
  const input = String(value || "").trim();
  if (!input) return "";

  try {
    const url = new URL(input.includes("://") ? input : `https://${input}`);
    return `https://${url.hostname}`;
  } catch {
    return "";
  }
}

function parseAllowedHosts(value) {
  const configured = String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return new Set(configured.length ? configured : DEFAULT_ALLOWED_HOSTS);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
