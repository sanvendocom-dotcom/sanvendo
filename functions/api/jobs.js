import { loadJobs } from "../_lib/jobs.js";

export async function onRequestGet(context) {
  const { env } = context;

  if (!env.CV_BUCKET) {
    return json(
      { success: false, message: "R2 chưa được liên kết với CV_BUCKET." },
      500
    );
  }

  try {
    const jobs = (await loadJobs(env.CV_BUCKET))
      .filter((job) => job.published)
      .sort(sortNewestFirst);

    return json({ success: true, jobs });
  } catch (error) {
    console.error("Public jobs error", error);
    return json(
      { success: false, message: "Không thể tải danh sách việc làm." },
      500
    );
  }
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

function sortNewestFirst(a, b) {
  return Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
