export const SITE_ORIGIN = "https://sanvendo.com";
export const SITE_NAME = "Sanvendo";

export function getSiteOrigin(env) {
  const configured = String(env?.SITE_ORIGIN || "").trim();
  if (!configured) return SITE_ORIGIN;

  try {
    const url = new URL(configured);
    return url.origin;
  } catch {
    return SITE_ORIGIN;
  }
}

export function isJobActive(job, now = new Date()) {
  if (!job || job.published === false) return false;
  if (!job.validThrough) return true;

  const expiry = new Date(`${job.validThrough}T23:59:59+07:00`);
  return Number.isNaN(expiry.getTime()) || expiry.getTime() >= now.getTime();
}

export function jobUrl(job, env) {
  return `${getSiteOrigin(env)}/jobs/${encodeURIComponent(job.id)}`;
}

export function isJobSchemaEligible(job) {
  return Boolean(
    job &&
    job.title &&
    job.location &&
    job.companyName &&
    job.responsibilities &&
    job.requirements &&
    job.createdAt
  );
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeXml(value) {
  return escapeHtml(value);
}

export function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function textToParagraphs(value) {
  return String(value || "")
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter(Boolean);
}

export function buildJobDescriptionHtml(job) {
  const blocks = [];

  if (job.summary) {
    blocks.push(`<p>${escapeHtml(job.summary)}</p>`);
  }

  const sections = [
    ["Mô tả công việc", job.responsibilities],
    ["Yêu cầu ứng viên", job.requirements],
    ["Quyền lợi", job.benefits],
    ["Thông tin bổ sung", job.additionalInfo],
  ];

  for (const [heading, value] of sections) {
    const lines = textToParagraphs(value);
    if (!lines.length) continue;
    const content = lines.length === 1
      ? `<p>${escapeHtml(lines[0])}</p>`
      : `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
    blocks.push(`<h2>${heading}</h2>${content}`);
  }

  if (job.workHours) {
    blocks.push(`<h2>Thời gian làm việc</h2><p>${escapeHtml(job.workHours)}</p>`);
  }

  if (job.experience) {
    blocks.push(`<h2>Kinh nghiệm</h2><p>${escapeHtml(job.experience)}</p>`);
  }

  return blocks.join("");
}

export function buildJobPostingSchema(job, env) {
  if (!isJobSchemaEligible(job)) return null;

  const origin = getSiteOrigin(env);
  const canonicalUrl = jobUrl(job, env);
  const description = buildJobDescriptionHtml(job) || `<p>${escapeHtml(job.title)}</p>`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    identifier: {
      "@type": "PropertyValue",
      name: SITE_NAME,
      value: job.id,
    },
    datePosted: toDateOnly(job.createdAt || job.updatedAt),
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName || "Doanh nghiệp tuyển dụng qua Sanvendo",
      sameAs: origin,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressRegion: job.location,
        addressCountry: "VN",
      },
    },
    url: canonicalUrl,
  };

  if (job.validThrough) {
    schema.validThrough = `${job.validThrough}T23:59:59+07:00`;
  }

  if (job.employmentType) {
    schema.employmentType = job.employmentType;
  }

  const salary = parseSalary(job.salary);
  if (salary) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "VND",
      value: {
        "@type": "QuantitativeValue",
        unitText: "MONTH",
        ...(salary.min === salary.max
          ? { value: salary.min }
          : { minValue: salary.min, maxValue: salary.max }),
      },
    };
  }

  return schema;
}

export function parseSalary(value) {
  const normalized = String(value || "")
    .toLocaleLowerCase("vi")
    .replace(/,/g, ".")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized || /thỏa thuận|thoả thuận|cạnh tranh|liên hệ/.test(normalized)) {
    return null;
  }

  const numbers = [...normalized.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  if (!numbers.length || numbers.some((number) => !Number.isFinite(number))) return null;

  const multiplier = /triệu|trieu/.test(normalized)
    ? 1_000_000
    : /nghìn|nghin|k\b/.test(normalized)
      ? 1_000
      : 1;
  const min = Math.round(numbers[0] * multiplier);
  const max = Math.round((numbers[1] ?? numbers[0]) * multiplier);

  if (min <= 0 || max <= 0 || max < min) return null;
  return { min, max };
}

function toDateOnly(value) {
  const parsed = new Date(value || "");
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}
