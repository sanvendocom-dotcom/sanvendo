import { securityHeaders } from "../../_lib/access.js";

const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 100;
const MAX_SEARCH_OBJECTS = 2000;

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

export function onRequest() {
  return new Response(
    JSON.stringify({ success: false, message: "Method not allowed." }),
    {
      status: 405,
      headers: {
        ...securityHeaders(),
        Allow: "GET",
      },
    }
  );
}

async function listCandidates(bucket, options) {
  const list = await bucket.list({
    prefix: "cv/",
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
      prefix: "cv/",
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

  return {
    key: object.key,
    reference: metadata.reference || "",
    name: metadata.candidateName || "Chưa có tên",
    email: metadata.candidateEmail || "",
    phone: metadata.candidatePhone || "",
    desiredPosition: metadata.desiredPosition || "",
    desiredLocation: metadata.desiredLocation || "",
    originalFilename: metadata.originalFilename || filenameFromKey(object.key),
    uploadedAt,
    size: Number(object.size || 0),
    contentType: object.httpMetadata?.contentType || "application/octet-stream",
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

function filenameFromKey(key) {
  return String(key || "").split("/").pop() || "cv";
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: securityHeaders(),
  });
}
