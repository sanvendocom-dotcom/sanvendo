import { loadJobs } from "../_lib/jobs.js";
import {
  LANGUAGE_CONFIG,
  SUPPORTED_LANGUAGES,
  languageUrl,
  localizeJob,
  pageText,
  requestLanguage,
} from "../_lib/i18n.js";
import {
  buildJobPostingSchema,
  escapeHtml,
  getSiteOrigin,
  isJobActive,
  jobUrl,
  safeJson,
  SITE_NAME,
  textToParagraphs,
} from "../_lib/seo.js";

export async function onRequestGet(context) {
  const language = requestLanguage(context.request);
  const text = pageText(language);

  if (!context.env.CV_BUCKET) {
    return errorPage(text.unavailable, 503, context, language);
  }

  try {
    const id = String(context.params.id || "").trim();
    const jobs = await loadJobs(context.env.CV_BUCKET);
    const job = jobs.find((item) => item.id === id);

    if (!job || !isJobActive(job)) {
      return errorPage(text.notFound, 404, context, language);
    }

    return new Response(renderJobPage(job, language, context.env), {
      status: 200,
      headers: pageHeaders(context.request, {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
        "Content-Language": LANGUAGE_CONFIG[language].htmlLang,
      }),
    });
  } catch (error) {
    console.error("Job detail page error", error);
    return errorPage(text.loadError, 500, context, language);
  }
}

function renderJobPage(sourceJob, language, env) {
  const config = LANGUAGE_CONFIG[language];
  const text = pageText(language);
  const job = localizeJob(sourceJob, language);
  const origin = getSiteOrigin(env);
  const canonical = jobUrl(sourceJob, env);
  const schema = buildJobPostingSchema(job, env);
  const title = buildPageTitle(job, language);
  const description = String(job.summary || `${job.title} · ${job.location}. ${text.salary}: ${job.salary}.`)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const detailHtml = buildLocalizedDescriptionHtml(job, text);
  const applyUrl = buildApplyUrl(origin, job.title, language);
  const homeUrl = languageUrl("/", language);
  const jobsUrl = languageUrl("/#jobs", language);
  const companyName = job.companyName || text.hiringCompany;

  return `<!doctype html>
<html lang="${escapeHtml(config.htmlLang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  ${renderAlternateLinks(sourceJob, env)}
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${escapeHtml(config.ogLocale)}">
  <meta property="og:site_name" content="Sanvendo">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/job.css?v=20260721-2">
  ${schema ? `<script type="application/ld+json">${safeJson(schema)}</script>` : ""}
</head>
<body>
  <header class="job-site-header">
    <a class="job-brand" href="${escapeHtml(homeUrl)}" aria-label="Sanvendo"><span>S</span><strong>SANVENDO</strong></a>
    <nav class="job-language-switcher" aria-label="Language">
      ${SUPPORTED_LANGUAGES.map((item) => `<a href="${escapeHtml(jobLanguageUrl(sourceJob.id, item))}" class="${item === language ? "active" : ""}" lang="${escapeHtml(LANGUAGE_CONFIG[item].htmlLang)}">${escapeHtml(LANGUAGE_CONFIG[item].label)}</a>`).join("")}
    </nav>
    <a class="header-cta" href="${escapeHtml(applyUrl)}">${escapeHtml(text.apply)}</a>
  </header>
  <main class="job-page">
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="${escapeHtml(homeUrl)}">${escapeHtml(text.home)}</a><span>›</span><a href="${escapeHtml(jobsUrl)}">${escapeHtml(text.jobs)}</a><span>›</span><span>${escapeHtml(job.title)}</span></nav>
    <article class="job-detail-page">
      <header class="job-hero">
        <span class="job-badge">${escapeHtml(job.categoryLabel)}</span>
        <h1>${escapeHtml(job.title)}</h1>
        <p class="job-company">${escapeHtml(companyName)}</p>
        <div class="job-facts">
          <div><small>${escapeHtml(text.location)}</small><strong>${escapeHtml(job.location)}</strong></div>
          <div><small>${escapeHtml(text.salary)}</small><strong>${escapeHtml(job.salary)}</strong></div>
          <div><small>${escapeHtml(text.experience)}</small><strong>${escapeHtml(job.experience || text.noExperience)}</strong></div>
          <div><small>${escapeHtml(text.workHours)}</small><strong>${escapeHtml(job.workHours || job.employmentTypeLabel || text.interview)}</strong></div>
        </div>
      </header>
      <div class="job-layout">
        <section class="job-content">
          ${detailHtml || `<h2>${escapeHtml(text.jobInfo)}</h2><p>${escapeHtml(text.missingDetails)}</p>`}
        </section>
        <aside class="apply-card">
          <h2>${escapeHtml(text.applyTitle)}</h2>
          <p>${escapeHtml(text.applyNote)}</p>
          <a class="primary-button" href="${escapeHtml(applyUrl)}">${escapeHtml(text.submitApplication)}</a>
          <a class="secondary-button" href="${escapeHtml(jobsUrl)}">${escapeHtml(text.otherJobs)}</a>
          <dl>
            <div><dt>${escapeHtml(text.datePosted)}</dt><dd>${escapeHtml(formatDate(sourceJob.createdAt, language, text.updating))}</dd></div>
            ${sourceJob.validThrough ? `<div><dt>${escapeHtml(text.validThrough)}</dt><dd>${escapeHtml(formatDate(sourceJob.validThrough, language, text.updating))}</dd></div>` : ""}
            <div><dt>${escapeHtml(text.jobId)}</dt><dd>${escapeHtml(sourceJob.id)}</dd></div>
          </dl>
        </aside>
      </div>
    </article>
  </main>
  <footer class="job-footer-site">© ${new Date().getFullYear()} Sanvendo · ${escapeHtml(text.footer)}</footer>
</body>
</html>`;
}

function buildLocalizedDescriptionHtml(job, text) {
  const blocks = [];

  if (job.summary) blocks.push(`<p>${escapeHtml(job.summary)}</p>`);

  const sections = [
    [text.responsibilities, job.responsibilities],
    [text.requirements, job.requirements],
    [text.benefits, job.benefits],
    [text.additionalInfo, job.additionalInfo],
  ];

  for (const [heading, value] of sections) {
    const lines = textToParagraphs(value);
    if (!lines.length) continue;
    const content = lines.length === 1
      ? `<p>${escapeHtml(lines[0])}</p>`
      : `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
    blocks.push(`<h2>${escapeHtml(heading)}</h2>${content}`);
  }

  if (job.workHours) blocks.push(`<h2>${escapeHtml(text.workingHours)}</h2><p>${escapeHtml(job.workHours)}</p>`);
  if (job.experience) blocks.push(`<h2>${escapeHtml(text.experience)}</h2><p>${escapeHtml(job.experience)}</p>`);

  return blocks.join("");
}

function buildPageTitle(job, language) {
  if (language === "en") return `${job.title} in ${job.location} — ${SITE_NAME}`;
  if (["zh", "ko", "ja"].includes(language)) return `${job.title} · ${job.location} — ${SITE_NAME}`;
  return `${job.title} tại ${job.location} — ${SITE_NAME}`;
}

function buildApplyUrl(origin, position, language) {
  const url = new URL("/", origin);
  url.searchParams.set("apply", "1");
  url.searchParams.set("position", position);
  url.searchParams.set("lang", language);
  url.hash = "candidates";
  return url.toString();
}

function jobLanguageUrl(id, language) {
  return `/jobs/${encodeURIComponent(id)}?lang=${encodeURIComponent(language)}`;
}

function renderAlternateLinks(job, env) {
  const canonical = jobUrl(job, env);
  return [
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(`${canonical}?lang=vi`)}">`,
    ...SUPPORTED_LANGUAGES.map((language) => `<link rel="alternate" hreflang="${escapeHtml(LANGUAGE_CONFIG[language].htmlLang)}" href="${escapeHtml(`${canonical}?lang=${language}`)}">`),
  ].join("\n  ");
}

function formatDate(value, language, fallback) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat(LANGUAGE_CONFIG[language].locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

function errorPage(message, status, context, language = "vi") {
  const config = LANGUAGE_CONFIG[language];
  const text = pageText(language);
  const homeUrl = languageUrl("/", language);
  return new Response(`<!doctype html><html lang="${escapeHtml(config.htmlLang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${status} — Sanvendo</title><link rel="stylesheet" href="/job.css?v=20260721-2"></head><body><main class="error-page"><h1>${status}</h1><p>${escapeHtml(message)}</p><a class="primary-button" href="${escapeHtml(homeUrl)}">${escapeHtml(text.backHome)}</a></main></body></html>`, {
    status,
    headers: pageHeaders(context.request, {
      "Cache-Control": "no-store",
      "Content-Language": config.htmlLang,
    }),
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
