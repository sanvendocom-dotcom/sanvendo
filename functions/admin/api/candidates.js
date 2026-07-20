import { securityHeaders } from "../../_lib/access.js";

const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 100;
const MAX_SEARCH_OBJECTS = 2000;
const CANDIDATE_PREFIX = "cv/";

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
      ? await searchCandidates(env.CV_BUCKET, query, limit)
      : await listCandidates(env.CV_BUCKET, { cursor, limit });

    return json({
      success: true,
      candidates: result.candidates,
      cursor: result.cursor || null,
      truncated: Boolean(result.truncated),
      scanned: result.scanned,
    });
  } catch (error) {
    console.error("List candidates error", error);
    return json(
      { success: false, message: "Không thể tải danh sách ứng viên." },
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
    const key = cleanObjectKey(new URL(request.url).searchParams.get("key"), CANDIDATE_PREFIX);
    if (!key) {
      return json({ success: false, message: "Mã hồ sơ cần xóa không hợp lệ." }, 400);
    }

    const existing = await env.CV_BUCKET.head(key);
    if (!existing) {
      return json({ success: false, message: "Không tìm thấy hồ sơ ứng viên." }, 404);
    }

    await env.CV_BUCKET.delete(key);
    return json({ success: true, message: "Đã xóa hồ sơ ứng viên và CV đính kèm." });
  } catch (error) {
    console.error("Delete candidate error", error);
    return json(
      { success: false, message: "Không thể xóa hồ sơ ứng viên. Vui lòng thử lại." },
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

async function listCandidates(bucket, options) {
  const list = await bucket.list({
    prefix: CANDIDATE_PREFIX,
    cursor: options.cursor || undefined,
    limit: options.limit,
    include: ["customMetadata", "httpMetadata"],
  });

  return {
    candidates: list.objects
      .map(toCandidate)
      .sort(sortNewestFirst),
    cursor: list.truncated ? list.cursor : null,
    truncated: list.truncated,
    scanned: list.objects.length,
  };
}

async function searchCandidates(bucket, query, limit) {
  const normalizedQuery = normalize(query);
  const matches = [];
  let cursor;
  let scanned = 0;
  let truncated = false;

  do {
    const list = await bucket.list({
      prefix: CANDIDATE_PREFIX,
      cursor,
      limit: 100,
      include: ["customMetadata", "httpMetadata"],
    });

    scanned += list.objects.length;

    for (const object of list.objects) {
      const candidate = toCandidate(object);
      if (candidateMatches(candidate, normalizedQuery)) {
        matches.push(candidate);
      }
    }

    cursor = list.truncated ? list.cursor : undefined;
    truncated = Boolean(list.truncated);
  } while (cursor && scanned < MAX_SEARCH_OBJECTS);

  matches.sort(sortNewestFirst);

  return {
    candidates: matches.slice(0, limit),
    cursor: null,
    truncated: truncated && scanned >= MAX_SEARCH_OBJECTS,
    scanned,
  };
}

function toCandidate(object) {
  const metadata = object.customMetadata || {};
  const uploadedAt =
    metadata.uploadedAt ||
    (object.uploaded instanceof Date
      ? object.uploaded.toISOString()
      : String(object.uploaded || ""));

  const hasCv = metadata.hasCv !== "false" && metadata.recordType !== "candidate-no-cv";

  return {
    key: object.key,
    reference: metadata.reference || "",
    name: metadata.candidateName || "Chưa có tên",
    email: metadata.candidateEmail || "",
    phone: metadata.candidatePhone || "",
    desiredPosition: metadata.desiredPosition || "",
    desiredLocation: metadata.desiredLocation || "",
    hasCv,
    originalFilename: hasCv
      ? metadata.originalFilename || filenameFromKey(object.key)
      : "",
    uploadedAt,
    size: hasCv ? Number(object.size || 0) : 0,
    contentType: hasCv
      ? object.httpMetadata?.contentType || "application/octet-stream"
      : "",
  };
}

function candidateMatches(candidate, query) {
  return [
    candidate.reference,
    candidate.name,
    candidate.email,
    candidate.phone,
    candidate.desiredPosition,
    candidate.desiredLocation,
    candidate.originalFilename,
  ].some((value) => normalize(value).includes(query));
}

function sortNewestFirst(a, b) {
  return Date.parse(b.uploadedAt || 0) - Date.parse(a.uploadedAt || 0);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

function filenameFromKey(key) {
  return String(key || "").split("/").pop() || "cv";
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: securityHeaders(),
  });
}
