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

test("chấp nhận hai nhóm ngành nghề mới", () => {
  const factory = (category) => cleanJobInput({
    title: "Vị trí thử nghiệm",
    category,
    location: "TP. Hồ Chí Minh",
    salary: "Thỏa thuận",
  });

  assert.equal(factory("Lao động phổ thông").category, "Lao động phổ thông");
  assert.equal(factory("Bán lẻ & Dịch vụ").category, "Bán lẻ & Dịch vụ");
});

test("lưu bản dịch Anh, Trung, Hàn và Nhật, bỏ qua trường trống", () => {
  const job = cleanJobInput({
    title: "Nhân viên kinh doanh",
    category: "Kinh doanh",
    location: "TP. Hồ Chí Minh",
    salary: "15–20 triệu",
    translations: {
      en: {
        title: "Sales Executive",
        summary: "Develop B2B customers.",
        featuredTags: ["B2B", "Sales", "B2B"],
      },
      zh: {
        title: "销售专员",
        requirements: "良好的沟通能力",
      },
      ko: {
        title: "영업 담당자",
        benefits: "성과급 지급",
      },
      ja: {
        title: "営業スタッフ",
        summary: "法人顧客を開拓します。",
      },
      fr: { title: "Doit être ignoré" },
    },
  });

  assert.equal(job.translations.en.title, "Sales Executive");
  assert.deepEqual(job.translations.en.featuredTags, ["B2B", "Sales"]);
  assert.equal(job.translations.zh.requirements, "良好的沟通能力");
  assert.equal(job.translations.ko.benefits, "성과급 지급");
  assert.equal(job.translations.ja.title, "営業スタッフ");
  assert.equal(job.translations.fr, undefined);
});
