import { loadJobs } from "./_lib/jobs.js";
import { escapeXml, getSiteOrigin, isJobActive, jobUrl } from "./_lib/seo.js";

export async function onRequestGet(context) {
  const origin = getSiteOrigin(context.env);
  let jobs = [];

  try {
    if (context.env.CV_BUCKET) {
      jobs = (await loadJobs(context.env.CV_BUCKET)).filter((job) => isJobActive(job));
    }
  } catch (error) {
    console.error("Sitemap jobs load error", error);
  }

  const urls = [
    { loc: `${origin}/`, lastmod: latestDate(jobs), priority: "1.0", changefreq: "daily" },
    ...jobs.map((job) => ({
      loc: jobUrl(job, context.env),
      lastmod: toDateOnly(job.updatedAt || job.createdAt),
      priority: "0.9",
      changefreq: "weekly",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((item) => `  <url>\n    <loc>${escapeXml(item.loc)}</loc>\n    <lastmod>${escapeXml(item.lastmod)}</lastmod>\n    <changefreq>${item.changefreq}</changefreq>\n    <priority>${item.priority}</priority>\n  </url>`).join("\n")}\n</urlset>`;

  const hostname = new URL(context.request.url).hostname;
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
      ...(hostname.endsWith(".pages.dev") ? { "X-Robots-Tag": "noindex" } : {}),
    },
  });
}

function latestDate(jobs) {
  const timestamps = jobs.map((job) => Date.parse(job.updatedAt || job.createdAt || 0)).filter(Number.isFinite);
  return toDateOnly(timestamps.length ? Math.max(...timestamps) : Date.now());
}

function toDateOnly(value) {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
}
