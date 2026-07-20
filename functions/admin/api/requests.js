import { securityHeaders } from "../../_lib/access.js";

const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 100;
const MAX_SEARCH_OBJECTS = 2000;
const REQUEST_PREFIX = "requests/";

export async function onRequestGet(context) {
  const { env, request } = context;

  if (!env.CV_BUCKET) {
    return json(
      { success: false, message: "R2 chưa được liên kết với CV_BUCKET." },
      500
    );
  }

  try {
    const url = new URL(request.url);
    const query = cleanSearch(url.searchParams.get("q"));
    const cursor = cleanCursor(url.searchParams.get("cursor"));
    const limit = clampLimit(url.searchParams.get("limit"));

    const result = query
      ? await searchRequests(env.CV_BUCKET, query, limit)
      : await listRequests(env.CV_BUCKET, { cursor, limit });

    return json({
      success: true,
      requests: result.requests,
      cursor: result.cursor || null,
      truncated: Boolean(result.truncated),
      scanned: result.scanned,
    });
  } catch (error) {
    console.error("List recruitment requests error", error);
    return json(
      { success: false, message: "Không thể tải yêu cầu doanh nghiệp." },
      500
    );
  }
}

export async function onRequestDelete(context) {
  const { env, request } = context;

  if (!env.CV_BUCKET) {
    return json(
      { success: false, message: "R2 chưa được liên kết với CV_BUCKET." },
      500
    );
  }

  if (!isSameOriginRequest(request)) {
    return json({ success: false, message: "Nguồn cập nhật không được phép." }, 403);
  }

  try {
    const key = cleanObjectKey(new URL(request.url).searchParams.get("key"), REQUEST_PREFIX);
    if (!key) {
      return json({ success: false, message: "Mã yêu cầu cần xóa không hợp lệ." }, 400);
    }

    const existing = await env.CV_BUCKET.head(key);
    if (!existing) {
      return json({ success: false, message: "Không tìm thấy yêu cầu doanh nghiệp." }, 404);
    }

    await env.CV_BUCKET.delete(key);
    return json({ success: true, message: "Đã xóa yêu cầu doanh nghiệp." });
  } catch (error) {
    console.error("Delete recruitment request error", error);
    return json(
      { success: false, message: "Không thể xóa yêu cầu doanh nghiệp. Vui lòng thử lại." },
      500
    );
  }
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      ...securityHeaders(),
      Allow: "GET, DELETE, OPTIONS",
    },
  });
}

async function listRequests(bucket, options) {
  const list = await bucket.list({
    prefix: REQUEST_PREFIX,
    cursor: options.cursor || undefined,
    limit: options.limit,
    include: ["customMetadata"],
  });

  return {
    requests: list.objects.map(toRequest).sort(sortNewestFirst),
    cursor: list.truncated ? list.cursor : null,
    truncated: list.truncated,
    scanned: list.objects.length,
  };
}

async function searchRequests(bucket, query, limit) {
  const normalizedQuery = normalize(query);
  const matches = [];
  let cursor;
  let scanned = 0;
  let truncated = false;

  do {
    const list = await bucket.list({
      prefix: REQUEST_PREFIX,
      cursor,
      limit: 100,
      include: ["customMetadata"],
    });

    scanned += list.objects.length;

    for (const object of list.objects) {
      const request = toRequest(object);
      if (requestMatches(request, normalizedQuery)) matches.push(request);
    }

    cursor = list.truncated ? list.cursor : undefined;
    truncated = Boolean(list.truncated);
  } while (cursor && scanned < MAX_SEARCH_OBJECTS);

  matches.sort(sortNewestFirst);

  return {
    requests: matches.slice(0, limit),
    cursor: null,
    truncated: truncated && scanned >= MAX_SEARCH_OBJECTS,
    scanned,
  };
}

function toRequest(object) {
  const metadata = object.customMetadata || {};
  const submittedAt =
    metadata.submittedAt ||
    (object.uploaded instanceof Date
      ? object.uploaded.toISOString()
      : String(object.uploaded || ""));

  return {
    key: object.key,
    reference: metadata.reference || "",
    company: metadata.company || "Chưa có tên doanh nghiệp",
    contact: metadata.contact || "",
    phone: metadata.phone || "",
    email: metadata.email || "",
    position: metadata.position || "",
    quantity: Number.parseInt(metadata.quantity || "1", 10) || 1,
    location: metadata.location || "",
    salary: metadata.salary || "",
    deadline: metadata.deadline || "",
    description: metadata.description || "",
    submittedAt,
  };
}

function requestMatches(request, query) {
  return [
    request.reference,
    request.company,
    request.contact,
    request.phone,
    request.email,
    request.position,
    request.location,
    request.salary,
    request.deadline,
    request.description,
  ].some((value) => normalize(value).includes(query));
}

function sortNewestFirst(a, b) {
  return Date.parse(b.submittedAt || 0) - Date.parse(a.submittedAt || 0);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .trim();
}

function cleanSearch(value) {
  return String(value || "").trim().slice(0, 160);
}

function cleanCursor(value) {
  const cursor = String(value || "").trim();
  return cursor && cursor.length <= 2048 ? cursor : "";
}

function clampLimit(value) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.min(Math.max(parsed, 10), MAX_LIMIT);
}

function cleanObjectKey(value, prefix) {
  const key = String(value || "").trim();
  if (!key.startsWith(prefix) || key.length <= prefix.length || key.length > 1024) return "";
  if (/[\u0000-\u001F\u007F]/.test(key)) return "";
  return key;
}

function isSameOriginRequest(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: securityHeaders(),
  });
}
