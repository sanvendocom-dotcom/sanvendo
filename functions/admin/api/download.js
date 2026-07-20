import { securityHeaders } from "../../_lib/access.js";

export async function onRequestGet(context) {
  const { env, request } = context;

  if (!env.CV_BUCKET) {
    return json(
      { success: false, message: "R2 chưa được liên kết với CV_BUCKET." },
      500
    );
  }

  const url = new URL(request.url);
  const key = String(url.searchParams.get("key") || "");

  if (!isAllowedCvKey(key)) {
    return json({ success: false, message: "Đường dẫn CV không hợp lệ." }, 400);
  }

  try {
    const object = await env.CV_BUCKET.get(key);

    if (!object) {
      return json({ success: false, message: "Không tìm thấy CV." }, 404);
    }

    if (
      object.customMetadata?.hasCv === "false" ||
      object.customMetadata?.recordType === "candidate-no-cv"
    ) {
      return json(
        { success: false, message: "Ứng viên này chưa gửi file CV." },
        404
      );
    }

    const originalName =
      object.customMetadata?.originalFilename ||
      key.split("/").pop() ||
      "cv";
    const safeName = sanitizeDownloadFilename(originalName);
    const encodedName = encodeRFC5987Value(safeName);
    const headers = new Headers();

    object.writeHttpMetadata(headers);
    headers.set("Content-Type", headers.get("Content-Type") || "application/octet-stream");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${asciiFilename(safeName)}"; filename*=UTF-8''${encodedName}`
    );
    headers.set("Cache-Control", "private, no-store, max-age=0");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("Content-Length", String(object.size));
    headers.set("ETag", object.httpEtag);

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download CV error", error);
    return json({ success: false, message: "Không thể tải CV." }, 500);
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

function isAllowedCvKey(key) {
  return (
    key.length > 3 &&
    key.length <= 1024 &&
    key.startsWith("cv/") &&
    !key.includes("..") &&
    !/[\u0000-\u001f\u007f]/.test(key)
  );
}

function sanitizeDownloadFilename(value) {
  const cleaned = String(value || "cv")
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

  return cleaned || "cv";
}

function asciiFilename(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._ -]/g, "-")
    .slice(0, 150) || "cv";
}

function encodeRFC5987Value(value) {
  return encodeURIComponent(value)
    .replace(/['()]/g, escape)
    .replace(/\*/g, "%2A");
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: securityHeaders(),
  });
}
