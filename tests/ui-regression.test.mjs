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
