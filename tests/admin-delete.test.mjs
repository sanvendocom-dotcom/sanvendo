import assert from "node:assert/strict";
import test from "node:test";

import { onRequestDelete as deleteRequest } from "../functions/admin/api/requests.js";
import { onRequestDelete as deleteCandidate } from "../functions/admin/api/candidates.js";

function makeBucket(existingKeys) {
  const objects = new Set(existingKeys);
  const deleted = [];

  return {
    deleted,
    async head(key) {
      return objects.has(key) ? { key } : null;
    },
    async delete(key) {
      deleted.push(key);
      objects.delete(key);
    },
  };
}

async function body(response) {
  return response.json();
}

test("xóa đúng yêu cầu doanh nghiệp trong thư mục requests", async () => {
  const key = "requests/2026/07/20/yeu-cau.json";
  const bucket = makeBucket([key]);
  const response = await deleteRequest({
    env: { CV_BUCKET: bucket },
    request: new Request(`https://sanvendo.com/admin/api/requests?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: { Origin: "https://sanvendo.com" },
    }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(bucket.deleted, [key]);
  assert.equal((await body(response)).success, true);
});

test("không cho API yêu cầu xóa object ngoài requests", async () => {
  const bucket = makeBucket(["site/jobs.json"]);
  const response = await deleteRequest({
    env: { CV_BUCKET: bucket },
    request: new Request("https://sanvendo.com/admin/api/requests?key=site%2Fjobs.json", {
      method: "DELETE",
      headers: { Origin: "https://sanvendo.com" },
    }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(bucket.deleted, []);
});

test("xóa hồ sơ ứng viên đồng thời xóa object CV", async () => {
  const key = "cv/2026/07/20/ung-vien.pdf";
  const bucket = makeBucket([key]);
  const response = await deleteCandidate({
    env: { CV_BUCKET: bucket },
    request: new Request(`https://sanvendo.com/admin/api/candidates?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: { Origin: "https://sanvendo.com" },
    }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(bucket.deleted, [key]);
  assert.equal((await body(response)).success, true);
});

test("từ chối lệnh xóa gửi từ nguồn khác", async () => {
  const key = "cv/2026/07/20/ung-vien.pdf";
  const bucket = makeBucket([key]);
  const response = await deleteCandidate({
    env: { CV_BUCKET: bucket },
    request: new Request(`https://sanvendo.com/admin/api/candidates?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: { Origin: "https://example.com" },
    }),
  });

  assert.equal(response.status, 403);
  assert.deepEqual(bucket.deleted, []);
});
