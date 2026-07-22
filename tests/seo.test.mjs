import assert from "node:assert/strict";
import test from "node:test";

import {
  buildJobPostingSchema,
  isJobActive,
  isJobSchemaEligible,
  parseSalary,
} from "../functions/_lib/seo.js";
import { onRequestGet as getJobPage } from "../functions/jobs/[id].js";

const completeJob = {
  id: "nhan-vien-kinh-doanh-1234",
  title: "Nhân viên kinh doanh B2B",
  companyName: "Công ty ABC",
  category: "Kinh doanh",
  location: "TP. Hồ Chí Minh",
  employmentType: "FULL_TIME",
  validThrough: "2026-12-31",
  experience: "1–3 năm",
  workHours: "Thứ 2–Thứ 6",
  summary: "Phát triển khách hàng doanh nghiệp.",
  responsibilities: "Tìm kiếm khách hàng\nChăm sóc khách hàng",
  requirements: "Giao tiếp tốt\nCó trách nhiệm",
  benefits: "BHXH đầy đủ",
  salary: "15–25 triệu",
  published: true,
  createdAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-07-20T00:00:00.000Z",
};

test("đọc đúng khoảng lương tiếng Việt", () => {
  assert.deepEqual(parseSalary("15–25 triệu"), { min: 15_000_000, max: 25_000_000 });
  assert.equal(parseSalary("Thỏa thuận"), null);
});

test("chỉ tạo JobPosting khi tin có nội dung đủ", () => {
  assert.equal(isJobSchemaEligible(completeJob), true);
  assert.equal(isJobSchemaEligible({ ...completeJob, companyName: "" }), false);

  const schema = buildJobPostingSchema(completeJob, {});
  assert.equal(schema["@type"], "JobPosting");
  assert.equal(schema.hiringOrganization.name, "Công ty ABC");
  assert.equal(schema.baseSalary.value.minValue, 15_000_000);
  assert.equal(schema.jobLocation.address.addressCountry, "VN");
});

test("tin hết hạn tự ngừng hiển thị", () => {
  assert.equal(isJobActive({ ...completeJob, validThrough: "2026-07-19" }, new Date("2026-07-20T12:00:00Z")), false);
  assert.equal(isJobActive({ ...completeJob, validThrough: "2026-07-21" }, new Date("2026-07-20T12:00:00Z")), true);
});

test("trang chi tiết có canonical và JSON-LD", async () => {
  const bucket = {
    async get() {
      return { async text() { return JSON.stringify([completeJob]); } };
    },
  };

  const response = await getJobPage({
    request: new Request(`https://sanvendo.com/jobs/${completeJob.id}`),
    params: { id: completeJob.id },
    env: { CV_BUCKET: bucket },
  });
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /rel="canonical" href="https:\/\/sanvendo\.com\/jobs\/nhan-vien-kinh-doanh-1234"/);
  assert.match(html, /"@type":"JobPosting"/);
  assert.match(html, /Gửi hồ sơ ứng tuyển/);
});

test("trang chi tiết hiển thị đúng bản dịch tiếng Trung và bộ chuyển ngôn ngữ", async () => {
  const translatedJob = {
    ...completeJob,
    translations: {
      zh: {
        title: "B2B销售专员",
        companyName: "ABC公司",
        location: "胡志明市",
        summary: "负责开发企业客户。",
        responsibilities: "寻找新客户\n维护客户关系",
        requirements: "良好的沟通能力",
        benefits: "完整社会保险",
        salary: "1500万–2500万越南盾",
      },
    },
  };
  const bucket = {
    async get() {
      return { async text() { return JSON.stringify([translatedJob]); } };
    },
  };

  const response = await getJobPage({
    request: new Request(`https://sanvendo.com/jobs/${completeJob.id}?lang=zh`),
    params: { id: completeJob.id },
    env: { CV_BUCKET: bucket },
  });
  const html = await response.text();

  assert.equal(response.headers.get("Content-Language"), "zh-CN");
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /B2B销售专员/);
  assert.match(html, /工作职责/);
  assert.match(html, /class="job-language-switcher"/);
  assert.match(html, /\?lang=ko/);
  assert.match(html, /\?lang=ja/);
});


test("trang chi tiết hỗ trợ tiếng Nhật", async () => {
  const translatedJob = {
    ...completeJob,
    translations: {
      ja: { title: "B2B営業スタッフ", location: "ホーチミン市", summary: "法人顧客を開拓します。" },
    },
  };
  const bucket = {
    async get() {
      return { async text() { return JSON.stringify([translatedJob]); } };
    },
  };
  const response = await getJobPage({
    request: new Request(`https://sanvendo.com/jobs/${completeJob.id}?lang=ja`),
    params: { id: completeJob.id },
    env: { CV_BUCKET: bucket, SITE_ORIGIN: "https://sanvendo.com" },
  });

  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<html lang="ja">/);
  assert.match(html, /日本語/);
  assert.match(html, /B2B営業スタッフ/);
  assert.match(html, /hreflang="ja"/);
});

test("sitemap có trang chính sách bảo mật", async () => {
  const { onRequestGet: getSitemap } = await import("../functions/sitemap.xml.js");
  const response = await getSitemap({
    request: new Request("https://sanvendo.com/sitemap.xml"),
    env: {},
  });
  const xml = await response.text();
  assert.match(xml, /<loc>https:\/\/sanvendo\.com\/privacy<\/loc>/);
});
