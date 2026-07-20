import { securityHeaders } from "../../_lib/access.js";
import {
  cleanJobInput,
  createJobId,
  loadJobs,
  saveJobs,
  validateJob,
} from "../../_lib/jobs.js";
import { notifyJobChange } from "../../_lib/search-indexing.js";

export async function onRequestGet(context) {
  const bucketError = requireBucket(context.env);
  if (bucketError) return bucketError;

  try {
    const jobs = (await loadJobs(context.env.CV_BUCKET)).sort(sortNewestFirst);
    return json({ success: true, jobs });
  } catch (error) {
    console.error("Admin jobs GET error", error);
    return json({ success: false, message: "Không thể tải tin tuyển dụng." }, 500);
  }
}

export async function onRequestPost(context) {
  const bucketError = requireBucket(context.env);
  if (bucketError) return bucketError;
  if (!isSameOriginRequest(context.request)) {
    return json({ success: false, message: "Nguồn cập nhật không được phép." }, 403);
  }

  try {
    const payload = await readJson(context.request);
    const clean = cleanJobInput(payload);
    const validationMessage = validateJob(clean);
    if (validationMessage) return json({ success: false, message: validationMessage }, 400);

    const now = new Date().toISOString();
    const jobs = await loadJobs(context.env.CV_BUCKET);
    const job = {
      id: createJobId(clean.title),
      ...clean,
      createdAt: now,
      updatedAt: now,
    };

    if (job.featured) {
      for (const existingJob of jobs) existingJob.featured = false;
    }

    jobs.unshift(job);
    await saveJobs(context.env.CV_BUCKET, jobs);
    if (job.published) context.waitUntil?.(notifyJobChange(context.env, job, "URL_UPDATED"));
    return json({ success: true, message: "Đã đăng tin tuyển dụng.", job }, 201);
  } catch (error) {
    console.error("Admin jobs POST error", error);
    return handleMutationError(error);
  }
}

export async function onRequestPut(context) {
  const bucketError = requireBucket(context.env);
  if (bucketError) return bucketError;
  if (!isSameOriginRequest(context.request)) {
    return json({ success: false, message: "Nguồn cập nhật không được phép." }, 403);
  }

  try {
    const payload = await readJson(context.request);
    const id = cleanId(payload.id);
    if (!id) return json({ success: false, message: "Thiếu mã tin cần cập nhật." }, 400);

    const clean = cleanJobInput(payload);
    const validationMessage = validateJob(clean);
    if (validationMessage) return json({ success: false, message: validationMessage }, 400);

    const jobs = await loadJobs(context.env.CV_BUCKET);
    const index = jobs.findIndex((job) => job.id === id);
    if (index < 0) return json({ success: false, message: "Không tìm thấy tin tuyển dụng." }, 404);

    const previousJob = jobs[index];
    const job = {
      ...previousJob,
      ...clean,
      id,
      updatedAt: new Date().toISOString(),
    };
    jobs[index] = job;

    if (job.featured) {
      for (let jobIndex = 0; jobIndex < jobs.length; jobIndex += 1) {
        if (jobIndex !== index) jobs[jobIndex].featured = false;
      }
    }

    await saveJobs(context.env.CV_BUCKET, jobs);
    const notificationType = job.published ? "URL_UPDATED" : "URL_DELETED";
    if (job.published || previousJob.published) {
      context.waitUntil?.(notifyJobChange(context.env, job, notificationType));
    }
    return json({ success: true, message: "Đã cập nhật tin tuyển dụng.", job });
  } catch (error) {
    console.error("Admin jobs PUT error", error);
    return handleMutationError(error);
  }
}

export async function onRequestDelete(context) {
  const bucketError = requireBucket(context.env);
  if (bucketError) return bucketError;
  if (!isSameOriginRequest(context.request)) {
    return json({ success: false, message: "Nguồn cập nhật không được phép." }, 403);
  }

  try {
    const id = cleanId(new URL(context.request.url).searchParams.get("id"));
    if (!id) return json({ success: false, message: "Thiếu mã tin cần xóa." }, 400);

    const jobs = await loadJobs(context.env.CV_BUCKET);
    const deletedJob = jobs.find((job) => job.id === id);
    const nextJobs = jobs.filter((job) => job.id !== id);
    if (nextJobs.length === jobs.length) {
      return json({ success: false, message: "Không tìm thấy tin tuyển dụng." }, 404);
    }

    await saveJobs(context.env.CV_BUCKET, nextJobs);
    if (deletedJob) context.waitUntil?.(notifyJobChange(context.env, deletedJob, "URL_DELETED"));
    return json({ success: true, message: "Đã xóa tin tuyển dụng." });
  } catch (error) {
    console.error("Admin jobs DELETE error", error);
    return handleMutationError(error);
  }
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      ...securityHeaders(),
      Allow: "GET, POST, PUT, DELETE, OPTIONS",
    },
  });
}

function requireBucket(env) {
  return env.CV_BUCKET
    ? null
    : json({ success: false, message: "R2 chưa được liên kết với CV_BUCKET." }, 500);
}

async function readJson(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const error = new Error("Dữ liệu gửi lên không đúng định dạng JSON.");
    error.status = 415;
    throw error;
  }
  try {
    return await request.json();
  } catch {
    const error = new Error("Nội dung JSON không hợp lệ.");
    error.status = 400;
    throw error;
  }
}

function handleMutationError(error) {
  const status = Number(error?.status) || 500;
  const message =
    status < 500 && error instanceof Error
      ? error.message
      : "Không thể cập nhật tin tuyển dụng. Vui lòng thử lại.";
  return json({ success: false, message }, status);
}

function cleanId(value) {
  return String(value || "").trim().slice(0, 100);
}

function isSameOriginRequest(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function sortNewestFirst(a, b) {
  return Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: securityHeaders(),
  });
}
