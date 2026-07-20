import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/upload-cv.js";

class BucketMock {
  constructor() {
    this.puts = [];
  }

  async put(key, value, options) {
    this.puts.push({ key, value, options });
  }
}

function makeFormRequest(formData) {
  return new Request("https://sanvendo.com/api/upload-cv", {
    method: "POST",
    headers: {
      Origin: "https://sanvendo.com",
      Accept: "application/json",
    },
    body: formData,
  });
}

test("chấp nhận đơn ứng tuyển không kèm CV", async () => {
  const form = new FormData();
  form.set("fullName", "Nguyễn Văn A");
  form.set("phone", "0901234567");
  form.set("email", "a@example.com");
  form.set("desiredPosition", "Nhân viên kinh doanh");
  form.set("desiredLocation", "TP.HCM");
  form.set("consent", "yes");

  const bucket = new BucketMock();
  const response = await onRequestPost({
    request: makeFormRequest(form),
    env: { CV_BUCKET: bucket },
  });
  const result = await response.json();

  assert.equal(response.status, 201);
  assert.equal(result.success, true);
  assert.equal(result.stored, true);
  assert.equal(result.hasCv, false);
  assert.equal(bucket.puts.length, 1);
  assert.match(bucket.puts[0].key, /-no-cv\.json$/);
  assert.equal(bucket.puts[0].options.customMetadata.hasCv, "false");
});

test("file rỗng được xem là không có CV", async () => {
  const form = new FormData();
  form.set("fullName", "Trần Thị B");
  form.set("phone", "0912345678");
  form.set("email", "b@example.com");
  form.set("consent", "yes");
  form.set("cv", new File([], "", { type: "application/octet-stream" }));

  const bucket = new BucketMock();
  const response = await onRequestPost({
    request: makeFormRequest(form),
    env: { CV_BUCKET: bucket },
  });
  const result = await response.json();

  assert.equal(response.status, 201);
  assert.equal(result.hasCv, false);
  assert.equal(bucket.puts.length, 1);
  assert.match(bucket.puts[0].key, /-no-cv\.json$/);
});
