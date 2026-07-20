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
];

const DEFAULT_CREATED_AT = "2026-07-20T00:00:00.000Z";

export const DEFAULT_JOBS = [
  {
    id: "nhan-vien-kinh-doanh-b2b",
    title: "Nhân viên kinh doanh B2B",
    category: "Kinh doanh",
    location: "TP. Hồ Chí Minh",
    experience: "1–3 năm kinh nghiệm",
    salary: "15–25 triệu",
    logo: "KD",
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

  return {
    title: cleanText(source.title, 160),
    category: JOB_CATEGORIES.includes(category) ? category : "",
    location: cleanText(source.location, 120),
    experience: cleanText(source.experience, 160),
    salary: cleanText(source.salary, 120),
    logo: cleanLogo(source.logo),
    published: source.published !== false,
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

function cloneDefaults() {
  return DEFAULT_JOBS.map((job) => ({ ...job }));
}
