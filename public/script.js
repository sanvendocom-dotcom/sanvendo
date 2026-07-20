const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const toast = document.getElementById("toast");

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav?.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

function openModal(modalId, trigger) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (modalId === "requestModal") {
    clearRequestError();
    requestForm?.classList.remove("hidden");
    requestSuccess?.classList.add("hidden");
  }

  if (modalId === "candidateModal") {
    clearCandidateError();
    candidateForm?.classList.remove("hidden");
    candidateSuccess?.classList.add("hidden");

    const positionInput = candidateForm?.elements?.namedItem("desiredPosition");
    if (positionInput instanceof HTMLInputElement && trigger?.dataset?.position) {
      positionInput.value = trigger.dataset.position;
    }
  }

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  const firstInput = modal.querySelector("input");
  window.setTimeout(() => firstInput?.focus(), 100);
}

document.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-modal]");
  if (openButton) {
    openModal(openButton.dataset.openModal, openButton);
    return;
  }

  const closeElement = event.target.closest("[data-close-modal]");
  if (closeElement) closeAllModals();
});

function closeAllModals() {
  document.querySelectorAll(".modal.active").forEach((modal) => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  });
  document.body.classList.remove("modal-open");
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAllModals();
});

const jobFilter = document.getElementById("jobFilter");
const locationFilter = document.getElementById("locationFilter");
const jobGrid = document.getElementById("jobGrid");
const jobLoading = document.getElementById("jobLoading");
const emptyState = document.getElementById("emptyState");
let jobs = [];
let jobCards = [];

function normalize(text) {
  return (text || "")
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

async function loadJobs() {
  try {
    jobLoading?.classList.remove("hidden");
    emptyState?.classList.add("hidden");

    const response = await fetch("/api/jobs", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const result = await parseJson(response);

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể tải tin tuyển dụng.");
    }

    jobs = Array.isArray(result.jobs) ? result.jobs : [];
    renderJobs();
    updateLocationOptions();
    updateCategoryCounts();
    jobLoading?.classList.add("hidden");
    filterJobs();
  } catch (error) {
    jobs = [];
    renderJobs();
    updateCategoryCounts();
    if (emptyState) {
      emptyState.textContent =
        error instanceof Error
          ? error.message
          : "Không thể tải tin tuyển dụng. Vui lòng thử lại.";
      emptyState.classList.remove("hidden");
    }
  } finally {
    jobLoading?.classList.add("hidden");
  }
}

function renderJobs() {
  if (!jobGrid) return;
  jobGrid.replaceChildren();

  for (const job of jobs) {
    jobGrid.append(createJobCard(job));
  }

  jobCards = [...jobGrid.querySelectorAll(".job-card")];
}

function createJobCard(job) {
  const article = document.createElement("article");
  article.className = "job-card";
  article.dataset.title = job.title || "";
  article.dataset.category = job.category || "";
  article.dataset.location = job.location || "";
  article.dataset.jobId = job.id || "";

  const top = document.createElement("div");
  top.className = "job-card-top";

  const logo = document.createElement("span");
  logo.className = "job-logo";
  logo.textContent = job.logo || createInitials(job.title);

  const saveButton = document.createElement("button");
  saveButton.className = "save-job";
  saveButton.type = "button";
  saveButton.setAttribute("aria-label", "Lưu vị trí");
  saveButton.textContent = "♡";

  top.append(logo, saveButton);

  const category = document.createElement("span");
  category.className = "job-category";
  category.textContent = job.category || "Khác";

  const title = document.createElement("h3");
  title.textContent = job.title || "Vị trí tuyển dụng";

  const detail = document.createElement("p");
  detail.textContent = [job.location, job.experience].filter(Boolean).join(" · ");

  const footer = document.createElement("div");
  footer.className = "job-footer";

  const salary = document.createElement("strong");
  salary.textContent = job.salary || "Thỏa thuận";

  const applyButton = document.createElement("button");
  applyButton.type = "button";
  applyButton.dataset.openModal = "candidateModal";
  applyButton.dataset.position = job.title || "";
  applyButton.textContent = "Ứng tuyển";

  footer.append(salary, applyButton);
  article.append(top, category, title, detail, footer);
  return article;
}

function createInitials(value) {
  const initials = String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return initials || "SV";
}

function updateLocationOptions() {
  if (!locationFilter) return;
  const selected = locationFilter.value;
  const locations = [...new Set(jobs.map((job) => job.location).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "vi"));

  locationFilter.replaceChildren(new Option("Tất cả địa điểm", ""));
  for (const location of locations) {
    locationFilter.append(new Option(location, location));
  }

  locationFilter.value = locations.includes(selected) ? selected : "";
}

function updateCategoryCounts() {
  const counts = new Map();
  for (const job of jobs) {
    counts.set(job.category, (counts.get(job.category) || 0) + 1);
  }

  document.querySelectorAll(".category-card[data-category]").forEach((card) => {
    const count = counts.get(card.dataset.category) || 0;
    const label = card.querySelector("[data-category-count]");
    if (label) label.textContent = `${count} tin đang tuyển`;
  });
}

function filterJobs() {
  const keyword = normalize(jobFilter?.value);
  const location = locationFilter?.value || "";
  let visibleCount = 0;

  jobCards.forEach((card) => {
    const haystack = normalize(
      `${card.dataset.title} ${card.dataset.category} ${card.dataset.location}`
    );

    const matchKeyword = !keyword || haystack.includes(keyword);
    const matchLocation = !location || card.dataset.location === location;
    const visible = matchKeyword && matchLocation;

    card.classList.toggle("hidden", !visible);
    if (visible) visibleCount += 1;
  });

  if (emptyState) {
    emptyState.textContent = "Không tìm thấy vị trí phù hợp với bộ lọc hiện tại.";
    emptyState.classList.toggle("hidden", visibleCount > 0 || Boolean(jobLoading && !jobLoading.classList.contains("hidden")));
  }
}

jobFilter?.addEventListener("input", filterJobs);
locationFilter?.addEventListener("change", filterJobs);

document.querySelectorAll(".category-card[data-category]").forEach((button) => {
  button.addEventListener("click", () => {
    if (jobFilter) jobFilter.value = button.dataset.category || "";
    filterJobs();
    document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll("[data-search]").forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.search || "";
    const heroSearchInput = document.getElementById("heroSearchInput");
    if (heroSearchInput) heroSearchInput.value = value;
    if (jobFilter) jobFilter.value = value;
    filterJobs();
    document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("heroSearch")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const keyword = document.getElementById("heroSearchInput")?.value.trim() || "";
  if (jobFilter) jobFilter.value = keyword;
  filterJobs();
  document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });
});

jobGrid?.addEventListener("click", (event) => {
  const button = event.target.closest(".save-job");
  if (!button) return;

  const saved = button.classList.toggle("saved");
  button.textContent = saved ? "♥" : "♡";
  showToast(saved ? "Đã lưu vị trí." : "Đã bỏ lưu vị trí.");
});

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const answer = item?.querySelector(".faq-answer");
    if (!item || !answer) return;
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".faq-item.open").forEach((openItem) => {
      openItem.classList.remove("open");
      const openAnswer = openItem.querySelector(".faq-answer");
      if (openAnswer) openAnswer.style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add("open");
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }
  });
});

const requestForm = document.getElementById("requestForm");
const requestSubmit = document.getElementById("requestSubmit");
const requestError = document.getElementById("requestError");
const requestSuccess = document.getElementById("requestSuccess");
const requestReference = document.getElementById("requestReference");

function showRequestError(message) {
  if (!requestError) return;
  requestError.textContent = message;
  requestError.classList.remove("hidden");
}

function clearRequestError() {
  if (!requestError) return;
  requestError.textContent = "";
  requestError.classList.add("hidden");
}

requestForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearRequestError();

  if (!requestForm.checkValidity()) {
    requestForm.reportValidity();
    return;
  }

  const originalButtonText = requestSubmit?.textContent || "Gửi yêu cầu";

  try {
    if (requestSubmit) {
      requestSubmit.disabled = true;
      requestSubmit.textContent = "Đang gửi yêu cầu...";
    }

    const response = await fetch("/api/recruitment-request", {
      method: "POST",
      body: new FormData(requestForm),
      headers: { Accept: "application/json" },
    });
    const result = await parseJson(response);

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể gửi yêu cầu tuyển dụng.");
    }

    if (requestReference) requestReference.textContent = result.reference || "Đã tiếp nhận";
    requestForm.reset();
    requestForm.classList.add("hidden");
    requestSuccess?.classList.remove("hidden");
  } catch (error) {
    showRequestError(
      error instanceof Error
        ? error.message
        : "Không thể gửi yêu cầu. Vui lòng thử lại."
    );
  } finally {
    if (requestSubmit) {
      requestSubmit.disabled = false;
      requestSubmit.textContent = originalButtonText;
    }
  }
});

const candidateForm = document.getElementById("candidateForm");
const candidateSubmit = document.getElementById("candidateSubmit");
const candidateError = document.getElementById("candidateError");
const candidateSuccess = document.getElementById("candidateSuccess");
const candidateReference = document.getElementById("candidateReference");
const cvFileInput = document.getElementById("cvFile");

const MAX_CV_SIZE = 10 * 1024 * 1024;
const ALLOWED_CV_EXTENSIONS = new Set(["pdf", "doc", "docx"]);

function getFileExtension(filename) {
  return String(filename || "").split(".").pop().toLowerCase();
}

function showCandidateError(message) {
  if (!candidateError) return;
  candidateError.textContent = message;
  candidateError.classList.remove("hidden");
}

function clearCandidateError() {
  if (!candidateError) return;
  candidateError.textContent = "";
  candidateError.classList.add("hidden");
}

function validateCvFile(file) {
  if (!file || !file.name || file.size === 0) return "";

  const extension = getFileExtension(file.name);
  if (!ALLOWED_CV_EXTENSIONS.has(extension)) {
    return "Chỉ chấp nhận file PDF, DOC hoặc DOCX.";
  }
  if (file.size > MAX_CV_SIZE) {
    return "Dung lượng CV tối đa là 10 MB.";
  }
  return "";
}

cvFileInput?.addEventListener("change", () => {
  clearCandidateError();
  const error = validateCvFile(cvFileInput.files?.[0]);
  if (error) showCandidateError(error);
});

candidateForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearCandidateError();

  if (!candidateForm.checkValidity()) {
    candidateForm.reportValidity();
    return;
  }

  const fileError = validateCvFile(cvFileInput?.files?.[0]);
  if (fileError) {
    showCandidateError(fileError);
    return;
  }

  const originalButtonText = candidateSubmit?.textContent || "Gửi hồ sơ";

  try {
    if (candidateSubmit) {
      candidateSubmit.disabled = true;
      candidateSubmit.textContent = "Đang gửi hồ sơ...";
    }

    const response = await fetch("/api/upload-cv", {
      method: "POST",
      body: new FormData(candidateForm),
      headers: { Accept: "application/json" },
    });
    const result = await parseJson(response);

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể gửi hồ sơ.");
    }

    if (candidateReference) candidateReference.textContent = result.reference || "Đã tiếp nhận";
    candidateForm.reset();
    candidateForm.classList.add("hidden");
    candidateSuccess?.classList.remove("hidden");
  } catch (error) {
    showCandidateError(
      error instanceof Error
        ? error.message
        : "Không thể gửi hồ sơ. Vui lòng thử lại."
    );
  } finally {
    if (candidateSubmit) {
      candidateSubmit.disabled = false;
      candidateSubmit.textContent = originalButtonText;
    }
  }
});

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return { success: false, message: "Máy chủ trả về phản hồi không hợp lệ." };
  }
}

loadJobs();
