export const JOBS_OBJECT_KEY = "site/jobs.json";

export const JOB_CATEGORIES = [
  "Kinh doanh",
  "Marketing",
  "Kế toán",
  "Nhân sự",
  "Công nghệ",
  "Kỹ thuật",
  "Logistics",
  "Chăm sóc khách hàng",
  "Lao động phổ thông",
  "Bán lẻ & Dịch vụ",
];

const DEFAULT_CREATED_AT = "2026-07-20T00:00:00.000Z";
const TRANSLATION_LANGUAGES = ["en", "zh", "ko"];

const EMPLOYMENT_TYPES = new Set([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACTOR",
  "TEMPORARY",
  "INTERN",
  "VOLUNTEER",
  "PER_DIEM",
  "OTHER",
]);

export const DEFAULT_JOBS = [
  {
    id: "nhan-vien-kinh-doanh-b2b",
    title: "Nhân viên kinh doanh B2B",
    category: "Kinh doanh",
    location: "TP. Hồ Chí Minh",
    experience: "1–3 năm kinh nghiệm",
    salary: "15–25 triệu",
    logo: "KD",
    featured: true,
    featuredTags: ["B2B", "Phát triển khách hàng", "1–3 năm"],
    targetCandidates: "5–8 ứng viên",
    featuredBadge: "Mới",
    published: true,
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT,
  },
  {
    id: "ke-toan-tong-hop",
    title: "Kế toán tổng hợp",
    category: "Kế toán",
    location: "Bình Dương",
    experience: "2+ năm kinh nghiệm",
    salary: "14–20 triệu",
    logo: "KT",
    published: true,
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT,
  },
  {
    id: "truong-phong-marketing",
    title: "Trưởng phòng Marketing",
    category: "Marketing",
    location: "TP. Hồ Chí Minh",
    experience: "Kinh nghiệm quản lý",
    salary: "Thỏa thuận",
    logo: "MKT",
    published: true,
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT,
  },
  {
    id: "ky-su-san-xuat",
    title: "Kỹ sư sản xuất",
    category: "Kỹ thuật",
    location: "Đồng Nai",
    experience: "2–4 năm kinh nghiệm",
    salary: "18–28 triệu",
    logo: "KS",
    published: true,
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT,
  },
  {
    id: "chuyen-vien-tuyen-dung",
    title: "Chuyên viên tuyển dụng",
    category: "Nhân sự",
    location: "Hà Nội",
    experience: "1–2 năm kinh nghiệm",
    salary: "13–18 triệu",
    logo: "HR",
    published: true,
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT,
  },
  {
    id: "lap-trinh-vien-frontend",
    title: "Lập trình viên Frontend",
    category: "Công nghệ",
    location: "TP. Hồ Chí Minh",
    experience: "React / JavaScript",
    salary: "20–35 triệu",
    logo: "FE",
    published: true,
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT,
  },
  {
    id: "nhan-vien-dieu-phoi-logistics",
    title: "Nhân viên điều phối Logistics",
    category: "Logistics",
    location: "Bình Dương",
    experience: "1+ năm kinh nghiệm",
    salary: "12–18 triệu",
    logo: "LOG",
    published: true,
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT,
  },
  {
    id: "nhan-vien-cham-soc-khach-hang",
    title: "Nhân viên Chăm sóc khách hàng",
    category: "Chăm sóc khách hàng",
    location: "TP. Hồ Chí Minh",
    experience: "Không yêu cầu hoặc dưới 1 năm",
    salary: "10–15 triệu",
    logo: "CS",
    published: true,
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT,
  },
];

export async function loadJobs(bucket) {
  const object = await bucket.get(JOBS_OBJECT_KEY);
  if (!object) return cloneDefaults();

  try {
    const parsed = JSON.parse(await object.text());
    if (!Array.isArray(parsed)) return cloneDefaults();
    return parsed.map(normalizeStoredJob).filter(Boolean);
  } catch (error) {
    console.error("Invalid jobs JSON in R2", error);
    return cloneDefaults();
  }
}

export async function saveJobs(bucket, jobs) {
  const normalizedJobs = Array.isArray(jobs)
    ? jobs.map(normalizeStoredJob).filter(Boolean)
    : [];

  await bucket.put(JOBS_OBJECT_KEY, JSON.stringify(normalizedJobs, null, 2), {
    httpMetadata: {
      contentType: "application/json; charset=UTF-8",
      contentDisposition: "inline",
    },
    customMetadata: {
      recordType: "site-job-list",
      updatedAt: new Date().toISOString(),
      total: String(normalizedJobs.length),
    },
  });

  return normalizedJobs;
}

export function cleanJobInput(value) {
  const source = value && typeof value === "object" ? value : {};
  const category = cleanText(source.category, 80);
  const published = source.published !== false;

  return {
    title: cleanText(source.title, 160),
    companyName: cleanText(source.companyName, 160),
    category: JOB_CATEGORIES.includes(category) ? category : "",
    location: cleanText(source.location, 120),
    employmentType: EMPLOYMENT_TYPES.has(source.employmentType) ? source.employmentType : "",
    validThrough: cleanDateOnly(source.validThrough),
    experience: cleanText(source.experience, 160),
    workHours: cleanText(source.workHours, 160),
    summary: cleanMultilineText(source.summary, 1200),
    responsibilities: cleanMultilineText(source.responsibilities, 5000),
    requirements: cleanMultilineText(source.requirements, 5000),
    benefits: cleanMultilineText(source.benefits, 5000),
    additionalInfo: cleanMultilineText(source.additionalInfo, 3000),
    salary: cleanText(source.salary, 120),
    logo: cleanLogo(source.logo),
    featured: published && source.featured === true,
    featuredTags: cleanTagList(source.featuredTags),
    targetCandidates: cleanText(source.targetCandidates, 80),
    featuredBadge: cleanText(source.featuredBadge, 30) || "Mới",
    translations: cleanJobTranslations(source.translations),
    published,
  };
}

export function validateJob(job) {
  if (!job.title) return "Vui lòng nhập tên vị trí tuyển dụng.";
  if (!job.category) return "Vui lòng chọn đúng ngành nghề.";
  if (!job.location) return "Vui lòng nhập địa điểm làm việc.";
  if (!job.salary) return "Vui lòng nhập mức lương hoặc ghi Thỏa thuận.";
  return "";
}

export function createJobId(title) {
  const slug = cleanText(title, 160)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `${slug || "tin-tuyen-dung"}-${suffix}`;
}

function normalizeStoredJob(value) {
  if (!value || typeof value !== "object") return null;

  const clean = cleanJobInput(value);
  if (!clean.title || !clean.category || !clean.location || !clean.salary) {
    return null;
  }

  const now = new Date().toISOString();
  return {
    id: cleanText(value.id, 100) || createJobId(clean.title),
    ...clean,
    createdAt: cleanIsoDate(value.createdAt) || now,
    updatedAt: cleanIsoDate(value.updatedAt) || now,
  };
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanMultilineText(value, maxLength) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .filter((line, index, lines) => line || (index > 0 && lines[index - 1]))
    .join("\n")
    .trim()
    .slice(0, maxLength);
}

function cleanJobTranslations(value) {
  const source = value && typeof value === "object" ? value : {};
  const translations = {};

  for (const language of TRANSLATION_LANGUAGES) {
    const item = source[language];
    if (!item || typeof item !== "object") continue;

    const translation = {
      title: cleanText(item.title, 160),
      companyName: cleanText(item.companyName, 160),
      location: cleanText(item.location, 120),
      experience: cleanText(item.experience, 160),
      workHours: cleanText(item.workHours, 160),
      summary: cleanMultilineText(item.summary, 1200),
      responsibilities: cleanMultilineText(item.responsibilities, 5000),
      requirements: cleanMultilineText(item.requirements, 5000),
      benefits: cleanMultilineText(item.benefits, 5000),
      additionalInfo: cleanMultilineText(item.additionalInfo, 3000),
      salary: cleanText(item.salary, 120),
      featuredTags: cleanTagList(item.featuredTags),
      targetCandidates: cleanText(item.targetCandidates, 80),
      featuredBadge: cleanText(item.featuredBadge, 30),
    };

    const compact = Object.fromEntries(
      Object.entries(translation).filter(([, fieldValue]) =>
        Array.isArray(fieldValue) ? fieldValue.length > 0 : Boolean(fieldValue)
      )
    );

    if (Object.keys(compact).length) translations[language] = compact;
  }

  return translations;
}

function cleanTagList(value) {
  const source = Array.isArray(value) ? value : String(value || "").split(",");
  const unique = [];

  for (const item of source) {
    const tag = cleanText(item, 40);
    if (!tag || unique.includes(tag)) continue;
    unique.push(tag);
    if (unique.length === 3) break;
  }

  return unique;
}

function cleanLogo(value) {
  return cleanText(value, 5)
    .toUpperCase()
    .replace(/[^A-Z0-9Đ]/g, "")
    .slice(0, 5);
}

function cleanIsoDate(value) {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function cleanDateOnly(value) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return "";
  const date = new Date(`${text}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? "" : text;
}

function cloneDefaults() {
  return DEFAULT_JOBS.map((job) => ({
    ...job,
    featuredTags: Array.isArray(job.featuredTags) ? [...job.featuredTags] : [],
    translations: job.translations
      ? Object.fromEntries(Object.entries(job.translations).map(([language, value]) => [
          language,
          { ...value, featuredTags: Array.isArray(value.featuredTags) ? [...value.featuredTags] : [] },
        ]))
      : {},
  }));
}
