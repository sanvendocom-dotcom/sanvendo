const MAX_DESCRIPTION_LENGTH = 1500;

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
          message: "Yêu cầu đã được tiếp nhận.",
          reference: createPublicReference(),
        },
        200
      );
    }

    const company = cleanText(formData.get("company"), 160);
    const contact = cleanText(formData.get("contact"), 100);
    const phone = cleanText(formData.get("phone"), 30);
    const email = cleanText(formData.get("email"), 160).toLowerCase();
    const position = cleanText(formData.get("position"), 160);
    const quantity = cleanQuantity(formData.get("quantity"));
    const location = cleanText(formData.get("location"), 160);
    const salary = cleanText(formData.get("salary"), 120);
    const deadline = cleanText(formData.get("deadline"), 120);
    const description = cleanText(formData.get("description"), MAX_DESCRIPTION_LENGTH);
    const consent = cleanText(formData.get("consent"), 20);

    if (!company || !contact || !phone || !email || !position) {
      return json(
        {
          success: false,
          message:
            "Vui lòng nhập đầy đủ tên doanh nghiệp, người liên hệ, số điện thoại, email và vị trí cần tuyển.",
        },
        400
      );
    }

    if (!isValidEmail(email)) {
      return json(
        {
          success: false,
          message: "Địa chỉ email công việc không hợp lệ.",
        },
        400
      );
    }

    if (!quantity) {
      return json(
        {
          success: false,
          message: "Số lượng tuyển dụng phải từ 1 đến 9.999.",
        },
        400
      );
    }

    if (consent !== "yes") {
      return json(
        {
          success: false,
          message: "Bạn cần đồng ý để Sanvendo liên hệ tư vấn.",
        },
        400
      );
    }

    const now = new Date();
    const uuid = crypto.randomUUID();
    const reference = createPublicReference(uuid);
    const path = [
      "requests",
      String(now.getUTCFullYear()),
      String(now.getUTCMonth() + 1).padStart(2, "0"),
      String(now.getUTCDate()).padStart(2, "0"),
    ].join("/");
    const objectKey = `${path}/${uuid}-${sanitizeFilename(company)}.json`;

    const record = {
      reference,
      company,
      contact,
      phone,
      email,
      position,
      quantity,
      location,
      salary,
      deadline,
      description,
      submittedAt: now.toISOString(),
      sourceHost: new URL(request.url).hostname,
    };

    await env.CV_BUCKET.put(objectKey, JSON.stringify(record), {
      httpMetadata: {
        contentType: "application/json; charset=UTF-8",
        contentDisposition: "inline",
      },
      customMetadata: {
        recordType: "recruitment-request",
        reference,
        company,
        contact,
        phone,
        email,
        position,
        quantity: String(quantity),
        location,
        salary,
        deadline,
        description,
        submittedAt: now.toISOString(),
        sourceHost: new URL(request.url).hostname,
      },
    });

    return json(
      {
        success: true,
        message: "Yêu cầu tuyển dụng đã được gửi thành công.",
        reference,
      },
      201
    );
  } catch (error) {
    console.error("recruitment-request error", error);
    return json(
      {
        success: false,
        message: "Không thể gửi yêu cầu. Vui lòng thử lại sau.",
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

function cleanQuantity(value) {
  const quantity = Number.parseInt(String(value || "1"), 10);
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 9999) return 0;
  return quantity;
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

  return safe || "company";
}

function createPublicReference(uuid = crypto.randomUUID()) {
  return `SV-DN-${uuid.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
