import assert from "node:assert/strict";
import test from "node:test";

import { cleanJobInput, loadJobs, saveJobs } from "../functions/_lib/jobs.js";

test("giữ xuống dòng trong nội dung chi tiết công việc", () => {
  const job = cleanJobInput({
    title: "Nhân viên kinh doanh",
    category: "Kinh doanh",
    location: "TP. Hồ Chí Minh",
    salary: "15–20 triệu",
    summary: "  Vai trò phát triển khách hàng  ",
    responsibilities: "- Tìm kiếm khách hàng\r\n- Chăm sóc khách hàng",
    requirements: "Giao tiếp tốt\nCó tinh thần trách nhiệm",
    benefits: "Thưởng doanh số\nBHXH đầy đủ",
    workHours: "Thứ 2–Thứ 6",
  });

  assert.equal(job.summary, "Vai trò phát triển khách hàng");
  assert.equal(job.responsibilities, "- Tìm kiếm khách hàng\n- Chăm sóc khách hàng");
  assert.equal(job.requirements, "Giao tiếp tốt\nCó tinh thần trách nhiệm");
  assert.equal(job.benefits, "Thưởng doanh số\nBHXH đầy đủ");
  assert.equal(job.workHours, "Thứ 2–Thứ 6");
});

test("lưu và đọc lại các trường chi tiết từ R2", async () => {
  let stored = null;
  const bucket = {
    async put(key, body) {
      stored = { key, body };
    },
    async get() {
      return stored
        ? { async text() { return stored.body; } }
        : null;
    },
  };

  const jobs = [{
    id: "job-1",
    title: "Kế toán tổng hợp",
    category: "Kế toán",
    location: "Bình Dương",
    salary: "Thỏa thuận",
    responsibilities: "Theo dõi công nợ\nLập báo cáo",
    requirements: "Có 2 năm kinh nghiệm",
    benefits: "BHXH đầy đủ",
    published: true,
    createdAt: "2026-07-20T00:00:00.000Z",
    updatedAt: "2026-07-20T00:00:00.000Z",
  }];

  await saveJobs(bucket, jobs);
  const loaded = await loadJobs(bucket);

  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].responsibilities, "Theo dõi công nợ\nLập báo cáo");
  assert.equal(loaded[0].requirements, "Có 2 năm kinh nghiệm");
  assert.equal(loaded[0].benefits, "BHXH đầy đủ");
});


test("chuẩn hóa dữ liệu tin nổi bật đầu trang", () => {
  const job = cleanJobInput({
    title: "Trưởng phòng Kinh doanh",
    category: "Kinh doanh",
    location: "TP. Hồ Chí Minh",
    salary: "Thỏa thuận",
    featured: true,
    featuredTags: [" B2B ", "Quản lý đội nhóm", "5+ năm", "Thẻ thứ tư"],
    targetCandidates: "5–8 ứng viên",
    featuredBadge: "Đang tuyển",
    published: true,
  });

  assert.equal(job.featured, true);
  assert.deepEqual(job.featuredTags, ["B2B", "Quản lý đội nhóm", "5+ năm"]);
  assert.equal(job.targetCandidates, "5–8 ứng viên");
  assert.equal(job.featuredBadge, "Đang tuyển");
});

test("tin đang ẩn không được đặt làm tin nổi bật", () => {
  const job = cleanJobInput({
    title: "Trưởng phòng Kinh doanh",
    category: "Kinh doanh",
    location: "TP. Hồ Chí Minh",
    salary: "Thỏa thuận",
    featured: true,
    published: false,
  });

  assert.equal(job.featured, false);
});
