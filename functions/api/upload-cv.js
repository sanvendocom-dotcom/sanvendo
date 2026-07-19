const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIN_FILE_SIZE = 100;

const TYPE_RULES = {
  pdf: {
    mimeTypes: new Set(["application/pdf", "application/octet-stream", ""]),
    signature: isPdf,
  },
  doc: {
    mimeTypes: new Set(["application/msword", "application/octet-stream", ""]),
    signature: isLegacyDoc,
  },
  docx: {
    mimeTypes: new Set([
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
      "application/octet-stream",
      "",
    ]),
    signature: isZip,
  },
};

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    if (!env.CV_BUCKET) {
      return json(
        {
          success: false,
          message: "R2 chưa được liên kết với biến CV_BUCKET.",
        },
        500
      );
    }

    if (!isSameOriginRequest(request)) {
      return json(
        {
          success: false,
          message: "Nguồn gửi yêu cầu không được phép.",
        },
        403
      );
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return json(
        {
          success: false,
          message: "Dữ liệu gửi lên không đúng định dạng.",
        },
        415
      );
    }

    const formData = await request.formData();

    // Trường mồi chống bot. Người dùng bình thường không nhìn thấy trường này.
    const website = cleanText(formData.get("website"), 200);
    if (website) {
      return json(
        {
          success: true,
          message: "Hồ sơ đã được tiếp nhận.",
          reference: createPublicReference(),
        },
        200
      );
    }

    const fullName = cleanText(formData.get("fullName"), 100);
    const phone = cleanText(formData.get("phone"), 30);
    const email = cleanText(formData.get("email"), 160).toLowerCase();
    const desiredPosition = cleanText(formData.get("desiredPosition"), 120);
    const desiredLocation = cleanText(formData.get("desiredLocation"), 120);
    const consent = cleanText(formData.get("consent"), 20);
    const file = formData.get("cv");

    if (!fullName || !phone || !email) {
      return json(
        {
          success: false,
          message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và email.",
        },
        400
      );
    }

    if (!isValidEmail(email)) {
      return json(
        {
          success: false,
          message: "Địa chỉ email không hợp lệ.",
        },
        400
      );
    }

    if (consent !== "yes") {
      return json(
        {
          success: false,
          message: "Bạn cần đồng ý với việc xử lý hồ sơ.",
        },
        400
      );
    }

    if (!(file instanceof File)) {
      return json(
        {
          success: false,
          message: "Vui lòng chọn file CV.",
        },
        400
      );
    }

    if (file.size < MIN_FILE_SIZE) {
      return json(
        {
          success: false,
          message: "File CV đang trống hoặc không hợp lệ.",
        },
        400
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return json(
        {
          success: false,
          message: "Dung lượng CV tối đa là 10 MB.",
        },
        413
      );
    }

    const extension = getExtension(file.name);
    const rule = TYPE_RULES[extension];

    if (!rule) {
      return json(
        {
          success: false,
          message: "Chỉ chấp nhận file PDF, DOC hoặc DOCX.",
        },
        400
      );
    }

    const mimeType = String(file.type || "").toLowerCase();
    if (!rule.mimeTypes.has(mimeType)) {
      return json(
        {
          success: false,
          message: "Định dạng MIME của file không được hỗ trợ.",
        },
        400
      );
    }

    const bytes = await file.arrayBuffer();
    const signatureBytes = new Uint8Array(bytes.slice(0, 16));

    if (!rule.signature(signatureBytes)) {
      return json(
        {
          success: false,
          message: "Nội dung file không khớp với định dạng đã chọn.",
        },
        400
      );
    }

    const now = new Date();
    const uuid = crypto.randomUUID();
    const reference = createPublicReference(uuid);
    const safeCandidateName = sanitizeFilename(fullName);
    const path = [
      "cv",
      String(now.getUTCFullYear()),
      String(now.getUTCMonth() + 1).padStart(2, "0"),
      String(now.getUTCDate()).padStart(2, "0"),
    ].join("/");

    const objectKey =
      `${path}/${uuid}-${safeCandidateName}.${extension}`;

    await env.CV_BUCKET.put(objectKey, bytes, {
      httpMetadata: {
        contentType: canonicalContentType(extension),
        contentDisposition: "attachment",
      },
      customMetadata: {
        reference,
        originalFilename: limitMetadata(file.name, 220),
        candidateName: limitMetadata(fullName, 100),
        candidatePhone: limitMetadata(phone, 30),
        candidateEmail: limitMetadata(email, 160),
        desiredPosition: limitMetadata(desiredPosition, 120),
        desiredLocation: limitMetadata(desiredLocation, 120),
        uploadedAt: now.toISOString(),
        sourceHost: new URL(request.url).hostname,
      },
    });

    return json(
      {
        success: true,
        message: "CV đã được gửi thành công.",
        reference,
      },
      201
    );
  } catch (error) {
    console.error("upload-cv error", error);

    return json(
      {
        success: false,
        message: "Không thể tải CV lên. Vui lòng thử lại sau.",
      },
      500
    );
  }
}

export function onRequestGet() {
  return json(
    {
      success: false,
      message: "Chỉ hỗ trợ phương thức POST.",
    },
    405,
    { Allow: "POST" }
  );
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function limitMetadata(value, maxLength) {
  return cleanText(value, maxLength);
}

function getExtension(filename) {
  const match = String(filename || "")
    .toLowerCase()
    .match(/\.([a-z0-9]+)$/);

  return match ? match[1] : "";
}

function canonicalContentType(extension) {
  if (extension === "pdf") return "application/pdf";
  if (extension === "doc") return "application/msword";
  return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
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

function sanitizeFilename(value) {
  const safe = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return safe || "candidate";
}

function createPublicReference(uuid = crypto.randomUUID()) {
  return `SV-${uuid.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

function isPdf(bytes) {
  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

function isLegacyDoc(bytes) {
  const signature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  return (
    bytes.length >= signature.length &&
    signature.every((value, index) => bytes[index] === value)
  );
}

function isZip(bytes) {
  if (bytes.length < 4) return false;

  return (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (
      (bytes[2] === 0x03 && bytes[3] === 0x04) ||
      (bytes[2] === 0x05 && bytes[3] === 0x06) ||
      (bytes[2] === 0x07 && bytes[3] === 0x08)
    )
  );
}
