import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("trang chủ có đủ 10 nhóm ngành và tiếng Nhật", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const cards = [...html.matchAll(/class="category-card"\s+data-category=/g)];
  assert.equal(cards.length, 10);
  assert.match(html, /data-category="Lao động phổ thông"/);
  assert.match(html, /data-category="Bán lẻ &amp; Dịch vụ"/);
  assert.match(html, /data-language="ja"/);
});

test("nút xóa nằm ngay sau tên bản ghi trong hai bảng quản trị", async () => {
  const html = await readFile(new URL("../public/admin/index.html", import.meta.url), "utf8");
  assert.match(html, /<th>Doanh nghiệp<\/th>\s*<th class="action-column">Thao tác<\/th>/);
  assert.match(html, /<th>Ứng viên<\/th>\s*<th class="action-column">Thao tác<\/th>/);
  assert.match(html, /data-translation-language="ja"/);
});

test("trang chính sách bảo mật được liên kết và hỗ trợ 5 ngôn ngữ", async () => {
  const homeHtml = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const privacyHtml = await readFile(new URL("../public/privacy.html", import.meta.url), "utf8");
  const privacyJs = await readFile(new URL("../public/privacy.js", import.meta.url), "utf8");

  assert.match(homeHtml, /href="\/privacy">Chính sách bảo mật<\/a>/);
  assert.match(privacyHtml, /<h1 data-i18n="title">Chính sách bảo mật<\/h1>/);
  assert.match(privacyHtml, /sanvendo\.com@gmail\.com/);
  assert.match(privacyHtml, /id="current-storage"/);
  assert.match(privacyHtml, /Cloudflare R2 riêng tư/);
  assert.match(homeHtml, /href="\/privacy#current-storage">Chính sách bảo mật &amp; lưu dữ liệu<\/a>/);
  for (const language of ["vi", "en", "zh", "ko", "ja"]) {
    assert.match(privacyHtml, new RegExp(`data-language="${language}"`));
    assert.match(privacyJs, new RegExp(`\\b${language}: \\{`));
  }
});
