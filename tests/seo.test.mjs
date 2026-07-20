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
