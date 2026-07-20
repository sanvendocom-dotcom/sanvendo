import { loadJobs } from "../_lib/jobs.js";
import {
  buildJobDescriptionHtml,
  buildJobPostingSchema,
  escapeHtml,
  getSiteOrigin,
  isJobActive,
  jobUrl,
  safeJson,
  SITE_NAME,
} from "../_lib/seo.js";

export async function onRequestGet(context) {
  if (!context.env.CV_BUCKET) {
    return errorPage("Dịch vụ việc làm đang tạm thời gián đoạn.", 503, context);
  }

  try {
    const id = String(context.params.id || "").trim();
    const jobs = await loadJobs(context.env.CV_BUCKET);
    const job = jobs.find((item) => item.id === id);

    if (!job || !isJobActive(job)) {
      return errorPage("Tin tuyển dụng không còn hiển thị.", 404, context);
    }

    return new Response(renderJobPage(job, context.env), {
      status: 200,
      headers: pageHeaders(context.request, {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      }),
    });
  } catch (error) {
    console.error("Job detail page error", error);
    return errorPage("Không thể tải chi tiết công việc.", 500, context);
  }
}

function renderJobPage(job, env) {
  const origin = getSiteOrigin(env);
  const canonical = jobUrl(job, env);
  const schema = buildJobPostingSchema(job, env);
  const title = `${job.title} tại ${job.location} — ${SITE_NAME}`;
  const description = String(job.summary || `${job.title} tại ${job.location}. Mức lương ${job.salary}.`)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const detailHtml = buildJobDescriptionHtml(job);
  const applyUrl = `${origin}/?apply=1&position=${encodeURIComponent(job.title)}#candidates`;
  const companyName = job.companyName || "Doanh nghiệp tuyển dụng qua Sanvendo";

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="vi_VN">
  <meta property="og:site_name" content="Sanvendo">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/job.css?v=20260720-4">
  ${schema ? `<script type="application/ld+json">${safeJson(schema)}</script>` : ""}
</head>
<body>
  <header class="job-site-header">
    <a class="job-brand" href="/" aria-label="Trang chủ Sanvendo"><span>S</span><strong>SANVENDO</strong></a>
    <a class="header-cta" href="${escapeHtml(applyUrl)}">Ứng tuyển</a>
  </header>
  <main class="job-page">
    <nav class="breadcrumbs" aria-label="Điều hướng"><a href="/">Trang chủ</a><span>›</span><a href="/#jobs">Việc làm</a><span>›</span><span>${escapeHtml(job.title)}</span></nav>
    <article class="job-detail-page">
      <header class="job-hero">
        <span class="job-badge">${escapeHtml(job.category)}</span>
        <h1>${escapeHtml(job.title)}</h1>
        <p class="job-company">${escapeHtml(companyName)}</p>
        <div class="job-facts">
          <div><small>Địa điểm</small><strong>${escapeHtml(job.location)}</strong></div>
          <div><small>Mức lương</small><strong>${escapeHtml(job.salary)}</strong></div>
          <div><small>Kinh nghiệm</small><strong>${escapeHtml(job.experience || "Không yêu cầu")}</strong></div>
          <div><small>Thời gian</small><strong>${escapeHtml(job.workHours || "Trao đổi khi phỏng vấn")}</strong></div>
        </div>
      </header>
      <div class="job-layout">
        <section class="job-content">
          ${detailHtml || `<h2>Thông tin công việc</h2><p>Vui lòng liên hệ Sanvendo để nhận mô tả chi tiết cho vị trí này.</p>`}
        </section>
        <aside class="apply-card">
          <h2>Ứng tuyển vị trí này</h2>
          <p>Gửi thông tin trước, CV không bắt buộc. Ứng viên không phải trả phí.</p>
          <a class="primary-button" href="${escapeHtml(applyUrl)}">Gửi hồ sơ ứng tuyển</a>
          <a class="secondary-button" href="/#jobs">Xem các việc làm khác</a>
          <dl>
            <div><dt>Ngày đăng</dt><dd>${escapeHtml(formatDate(job.createdAt))}</dd></div>
            ${job.validThrough ? `<div><dt>Hạn ứng tuyển</dt><dd>${escapeHtml(formatDate(job.validThrough))}</dd></div>` : ""}
            <div><dt>Mã tin</dt><dd>${escapeHtml(job.id)}</dd></div>
          </dl>
        </aside>
      </div>
    </article>
  </main>
  <footer class="job-footer-site">© ${new Date().getFullYear()} Sanvendo · Tuyển dụng &amp; Headhunting theo yêu cầu</footer>
</body>
</html>`;
}

function formatDate(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "Đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(date);
}

function errorPage(message, status, context) {
  return new Response(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${status} — Sanvendo</title><link rel="stylesheet" href="/job.css?v=20260720-4"></head><body><main class="error-page"><h1>${status}</h1><p>${escapeHtml(message)}</p><a class="primary-button" href="/">Về trang chủ</a></main></body></html>`, {
    status,
    headers: pageHeaders(context.request, { "Cache-Control": "no-store" }),
  });
}

function pageHeaders(request, extra = {}) {
  const hostname = new URL(request.url).hostname;
  return {
    "Content-Type": "text/html; charset=UTF-8",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
    ...(hostname.endsWith(".pages.dev") ? { "X-Robots-Tag": "noindex, nofollow, noarchive" } : {}),
    ...extra,
  };
}
