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
  return html
    .replace(
      '<div class="job-grid" id="jobGrid" aria-live="polite"></div>',
      `<div class="job-grid" id="jobGrid" aria-live="polite">${cards}</div>`
    )
    .replace(
      '<p class="job-loading" id="jobLoading">Đang tải tin tuyển dụng...</p>',
      '<p class="job-loading hidden" id="jobLoading">Đang tải tin tuyển dụng...</p>'
    );
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
