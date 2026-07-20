import { loadJobs } from "./_lib/jobs.js";
import { escapeHtml, isJobActive } from "./_lib/seo.js";

export async function onRequestGet(context) {
  const assetResponse = await context.env.ASSETS.fetch(new URL("/index.html", context.request.url));
  let html = await assetResponse.text();

  try {
    if (context.env.CV_BUCKET) {
      const jobs = (await loadJobs(context.env.CV_BUCKET))
        .filter((job) => isJobActive(job))
        .sort((a, b) => Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0));
      html = injectJobs(html, jobs);
    }
  } catch (error) {
    console.error("Homepage SSR jobs error", error);
  }

  const headers = new Headers(assetResponse.headers);
  headers.set("Content-Type", "text/html; charset=UTF-8");
  headers.set("Cache-Control", "public, max-age=0, s-maxage=120, stale-while-revalidate=3600");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (new URL(context.request.url).hostname.endsWith(".pages.dev")) {
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return new Response(html, { status: assetResponse.status, headers });
}

function injectJobs(html, jobs) {
  const cards = jobs.map(renderJobCard).join("");
  const featuredJob = jobs.find((job) => job.featured === true) || jobs[0];

  let nextHtml = html
    .replace(
      '<div class="job-grid" id="jobGrid" aria-live="polite"></div>',
      `<div class="job-grid" id="jobGrid" aria-live="polite">${cards}</div>`
    )
    .replace(
      '<p class="job-loading" id="jobLoading">Đang tải tin tuyển dụng...</p>',
      '<p class="job-loading hidden" id="jobLoading">Đang tải tin tuyển dụng...</p>'
    );

  if (featuredJob) {
    nextHtml = nextHtml.replace(
      /<!-- FEATURED_JOB_START -->[\s\S]*?<!-- FEATURED_JOB_END -->/,
      renderFeaturedPanel(featuredJob)
    );
  }

  return nextHtml;
}

function renderFeaturedPanel(job) {
  const tags = getFeaturedTags(job)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join("");
  const jobUrl = `/jobs/${encodeURIComponent(job.id)}`;
  const meta = [
    job.location,
    employmentTypeLabel(job.employmentType) || job.workHours,
  ]
    .filter(Boolean)
    .join(" · ");

  return `<!-- FEATURED_JOB_START -->
        <aside class="hero-panel" id="featuredJobPanel">
          <div class="panel-header">
            <div>
              <span class="status-dot"></span>
              <span>Yêu cầu đang được quan tâm</span>
            </div>
            <span class="mini-badge" id="featuredJobBadge">${escapeHtml(job.featuredBadge || "Mới")}</span>
          </div>

          <article class="featured-card">
            <div class="featured-top">
              <div class="company-logo" id="featuredJobLogo">${escapeHtml(job.logo || initials(job.title))}</div>
              <div>
                <h3>
                  <a class="featured-title-link" id="featuredJobTitle" href="${jobUrl}">${escapeHtml(job.title)}</a>
                </h3>
                <p id="featuredJobMeta">${escapeHtml(meta)}</p>
              </div>
            </div>

            <div class="tag-row" id="featuredJobTags">${tags}</div>

            <div class="featured-info">
              <div>
                <small>Mức lương</small>
                <strong id="featuredJobSalary">${escapeHtml(job.salary || "Thỏa thuận")}</strong>
              </div>
              <div>
                <small>Hồ sơ mục tiêu</small>
                <strong id="featuredJobTarget">${escapeHtml(job.targetCandidates || "5–8 ứng viên")}</strong>
              </div>
            </div>

            <button
              class="btn btn-primary btn-block"
              id="featuredJobRequestButton"
              type="button"
              data-open-modal="requestModal"
              data-position="${escapeHtml(job.title)}"
              data-location="${escapeHtml(job.location)}"
              data-salary="${escapeHtml(job.salary || "")}"
            >
              Gửi yêu cầu tương tự
            </button>
          </article>

          <div class="mini-cards">
            <div class="mini-card">
              <span class="mini-icon">✓</span>
              <div>
                <strong>Sàng lọc trước</strong>
                <p>Chỉ giới thiệu hồ sơ phù hợp tiêu chí.</p>
              </div>
            </div>
            <div class="mini-card">
              <span class="mini-icon">↻</span>
              <div>
                <strong>Chính sách thay thế</strong>
                <p>Áp dụng theo gói dịch vụ đã thống nhất.</p>
              </div>
            </div>
          </div>
        </aside>
        <!-- FEATURED_JOB_END -->`;
}

function getFeaturedTags(job) {
  const configured = Array.isArray(job.featuredTags)
    ? job.featuredTags.filter(Boolean).slice(0, 3)
    : [];

  if (configured.length) return configured;

  return [...new Set([
    job.category,
    job.experience,
    employmentTypeLabel(job.employmentType),
  ].filter(Boolean))].slice(0, 3);
}

function employmentTypeLabel(value) {
  return {
    FULL_TIME: "Toàn thời gian",
    PART_TIME: "Bán thời gian",
    CONTRACTOR: "Hợp đồng / cộng tác",
    TEMPORARY: "Tạm thời",
    INTERN: "Thực tập",
    VOLUNTEER: "Tình nguyện",
    PER_DIEM: "Theo ngày",
    OTHER: "Khác",
  }[value] || "";
}

function renderJobCard(job) {
  const searchText = [job.summary, job.responsibilities, job.requirements, job.benefits].filter(Boolean).join(" ");
  return `<article class="job-card" data-title="${escapeHtml(job.title)}" data-category="${escapeHtml(job.category)}" data-location="${escapeHtml(job.location)}" data-search-text="${escapeHtml(searchText)}" data-job-id="${escapeHtml(job.id)}">
    <div class="job-card-top"><span class="job-logo">${escapeHtml(job.logo || initials(job.title))}</span><button class="save-job" type="button" aria-label="Lưu vị trí">♡</button></div>
    <span class="job-category">${escapeHtml(job.category)}</span>
    <h3><a class="job-title-link" href="/jobs/${encodeURIComponent(job.id)}">${escapeHtml(job.title)}</a></h3>
    <p class="job-card-meta">${escapeHtml([job.location, job.experience].filter(Boolean).join(" · "))}</p>
    <p class="job-card-summary">${escapeHtml(job.summary || "Xem nội dung công việc, yêu cầu và quyền lợi của vị trí này.")}</p>
    <div class="job-footer"><strong>${escapeHtml(job.salary)}</strong><div class="job-card-actions"><a class="job-detail-button" href="/jobs/${encodeURIComponent(job.id)}" data-job-details="${escapeHtml(job.id)}">Xem chi tiết</a><button type="button" class="job-apply-button" data-open-modal="candidateModal" data-position="${escapeHtml(job.title)}">Ứng tuyển</button></div></div>
  </article>`;
}

function initials(value) {
  return String(value || "").split(/\s+/).filter(Boolean).slice(0, 3).map((word) => word[0]).join("").toUpperCase() || "SV";
}
