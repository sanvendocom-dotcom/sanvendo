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

  document.querySelectorAll(".modal.active").forEach((activeModal) => {
    if (activeModal !== modal) {
      activeModal.classList.remove("active");
      activeModal.setAttribute("aria-hidden", "true");
    }
  });

  if (modalId === "requestModal") {
    clearRequestError();
    requestForm?.classList.remove("hidden");
    requestSuccess?.classList.add("hidden");

    const requestPrefill = {
      position: trigger?.dataset?.position,
      location: trigger?.dataset?.location,
      salary: trigger?.dataset?.salary,
    };

    for (const [name, value] of Object.entries(requestPrefill)) {
      const input = requestForm?.elements?.namedItem(name);
      if (
        value &&
        (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)
      ) {
        input.value = value;
      }
    }
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
  const detailButton = event.target.closest("[data-job-details]");
  if (detailButton) {
    if (detailButton instanceof HTMLAnchorElement) event.preventDefault();
    openJobDetails(detailButton.dataset.jobDetails);
    return;
  }

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

const featuredJobElements = {
  panel: document.getElementById("featuredJobPanel"),
  badge: document.getElementById("featuredJobBadge"),
  logo: document.getElementById("featuredJobLogo"),
  title: document.getElementById("featuredJobTitle"),
  meta: document.getElementById("featuredJobMeta"),
  tags: document.getElementById("featuredJobTags"),
  salary: document.getElementById("featuredJobSalary"),
  target: document.getElementById("featuredJobTarget"),
  requestButton: document.getElementById("featuredJobRequestButton"),
};

const employmentTypeLabels = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  CONTRACTOR: "Hợp đồng / cộng tác",
  TEMPORARY: "Tạm thời",
  INTERN: "Thực tập",
  VOLUNTEER: "Tình nguyện",
  PER_DIEM: "Theo ngày",
  OTHER: "Khác",
};

const jobDetailElements = {
  logo: document.getElementById("jobDetailLogo"),
  category: document.getElementById("jobDetailCategory"),
  title: document.getElementById("jobDetailTitle"),
  meta: document.getElementById("jobDetailMeta"),
  salary: document.getElementById("jobDetailSalary"),
  experience: document.getElementById("jobDetailExperience"),
  workHours: document.getElementById("jobDetailWorkHours"),
  summary: document.getElementById("jobDetailSummary"),
  responsibilities: document.getElementById("jobDetailResponsibilities"),
  requirements: document.getElementById("jobDetailRequirements"),
  benefits: document.getElementById("jobDetailBenefits"),
  additionalInfo: document.getElementById("jobDetailAdditionalInfo"),
  responsibilitiesSection: document.getElementById("jobResponsibilitiesSection"),
  requirementsSection: document.getElementById("jobRequirementsSection"),
  benefitsSection: document.getElementById("jobBenefitsSection"),
  additionalInfoSection: document.getElementById("jobAdditionalInfoSection"),
  empty: document.getElementById("jobDetailEmpty"),
  applyButton: document.getElementById("jobDetailApplyButton"),
};

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
  renderFeaturedJob();
}

function renderFeaturedJob() {
  const job = jobs.find((item) => item.featured === true) || jobs[0];
  if (!job || !featuredJobElements.panel) return;

  if (featuredJobElements.badge) {
    featuredJobElements.badge.textContent = job.featuredBadge || "Mới";
  }

  if (featuredJobElements.logo) {
    featuredJobElements.logo.textContent = job.logo || createInitials(job.title);
  }

  if (featuredJobElements.title) {
    featuredJobElements.title.textContent = job.title || "Vị trí tuyển dụng";
    featuredJobElements.title.href = `/jobs/${encodeURIComponent(job.id || "")}`;
  }

  if (featuredJobElements.meta) {
    featuredJobElements.meta.textContent = [
      job.location,
      employmentTypeLabels[job.employmentType] || job.workHours || "",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (featuredJobElements.tags) {
    const tags = getFeaturedTags(job);
    featuredJobElements.tags.replaceChildren(
      ...tags.map((tag) => {
        const item = document.createElement("span");
        item.textContent = tag;
        return item;
      })
    );
  }

  if (featuredJobElements.salary) {
    featuredJobElements.salary.textContent = job.salary || "Thỏa thuận";
  }

  if (featuredJobElements.target) {
    featuredJobElements.target.textContent =
      job.targetCandidates || "5–8 ứng viên";
  }

  if (featuredJobElements.requestButton) {
    featuredJobElements.requestButton.dataset.position = job.title || "";
    featuredJobElements.requestButton.dataset.location = job.location || "";
    featuredJobElements.requestButton.dataset.salary = job.salary || "";
  }
}

function getFeaturedTags(job) {
  const configured = Array.isArray(job.featuredTags)
    ? job.featuredTags.filter(Boolean).slice(0, 3)
    : [];

  if (configured.length) return configured;

  return [...new Set([
    job.category,
    job.experience,
    employmentTypeLabels[job.employmentType],
  ].filter(Boolean))].slice(0, 3);
}

function createJobCard(job) {
  const article = document.createElement("article");
  article.className = "job-card";
  article.dataset.title = job.title || "";
  article.dataset.category = job.category || "";
  article.dataset.location = job.location || "";
  article.dataset.searchText = [job.summary, job.responsibilities, job.requirements, job.benefits].filter(Boolean).join(" ");
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
  const titleLink = document.createElement("a");
  titleLink.className = "job-title-link";
  titleLink.href = `/jobs/${encodeURIComponent(job.id || "")}`;
  titleLink.textContent = job.title || "Vị trí tuyển dụng";
  title.append(titleLink);

  const detail = document.createElement("p");
  detail.className = "job-card-meta";
  detail.textContent = [job.location, job.experience].filter(Boolean).join(" · ");

  const summary = document.createElement("p");
  summary.className = "job-card-summary";
  summary.textContent = job.summary || "Xem nội dung công việc, yêu cầu và quyền lợi của vị trí này.";

  const footer = document.createElement("div");
  footer.className = "job-footer";

  const salary = document.createElement("strong");
  salary.textContent = job.salary || "Thỏa thuận";

  const actions = document.createElement("div");
  actions.className = "job-card-actions";

  const detailButton = document.createElement("a");
  detailButton.className = "job-detail-button";
  detailButton.href = `/jobs/${encodeURIComponent(job.id || "")}`;
  detailButton.dataset.jobDetails = job.id || "";
  detailButton.textContent = "Xem chi tiết";

  const applyButton = document.createElement("button");
  applyButton.type = "button";
  applyButton.className = "job-apply-button";
  applyButton.dataset.openModal = "candidateModal";
  applyButton.dataset.position = job.title || "";
  applyButton.textContent = "Ứng tuyển";

  actions.append(detailButton, applyButton);
  footer.append(salary, actions);
  article.append(top, category, title, detail, summary, footer);
  return article;
}

function openJobDetails(jobId) {
  const job = jobs.find((item) => item.id === jobId);
  if (!job) return;

  jobDetailElements.logo.textContent = job.logo || createInitials(job.title);
  jobDetailElements.category.textContent = job.category || "Tin tuyển dụng";
  jobDetailElements.title.textContent = job.title || "Chi tiết công việc";
  jobDetailElements.meta.textContent = [job.location, job.category].filter(Boolean).join(" · ");
  jobDetailElements.salary.textContent = job.salary || "Thỏa thuận";
  jobDetailElements.experience.textContent = job.experience || "Không yêu cầu";
  jobDetailElements.workHours.textContent = job.workHours || "Trao đổi khi phỏng vấn";
  jobDetailElements.applyButton.dataset.position = job.title || "";

  setDetailText(jobDetailElements.summary, job.summary);
  const detailCount = [
    setDetailSection(jobDetailElements.responsibilitiesSection, jobDetailElements.responsibilities, job.responsibilities),
    setDetailSection(jobDetailElements.requirementsSection, jobDetailElements.requirements, job.requirements),
    setDetailSection(jobDetailElements.benefitsSection, jobDetailElements.benefits, job.benefits),
    setDetailSection(jobDetailElements.additionalInfoSection, jobDetailElements.additionalInfo, job.additionalInfo),
  ].filter(Boolean).length;

  jobDetailElements.empty.classList.toggle("hidden", detailCount > 0 || Boolean(job.summary));
  openModal("jobDetailModal");
}

function setDetailText(element, value) {
  const text = String(value || "").trim();
  element.textContent = text;
  element.classList.toggle("hidden", !text);
}

function setDetailSection(section, container, value) {
  const lines = String(value || "")
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter(Boolean);

  container.replaceChildren();
  section.classList.toggle("hidden", lines.length === 0);
  if (lines.length === 0) return false;

  if (lines.length === 1) {
    const paragraph = document.createElement("p");
    paragraph.textContent = lines[0];
    container.append(paragraph);
    return true;
  }

  const list = document.createElement("ul");
  for (const line of lines) {
    const item = document.createElement("li");
    item.textContent = line;
    list.append(item);
  }
  container.append(list);
  return true;
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
      `${card.dataset.title} ${card.dataset.category} ${card.dataset.location} ${card.dataset.searchText}`
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

    if (!response.ok || !result.success || result.stored !== true) {
      throw new Error(
        result.message ||
          "Máy chủ chưa xác nhận đã lưu yêu cầu. Vui lòng gửi lại."
      );
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
const candidateSuccessTitle = document.getElementById("candidateSuccessTitle");
const candidateSuccessText = document.getElementById("candidateSuccessText");

// CV là tùy chọn. Dòng này cũng vô hiệu hóa thuộc tính required nếu trình duyệt
// đang dùng lại HTML cũ từ bộ nhớ đệm.
cvFileInput?.removeAttribute("required");

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

    const formData = new FormData(candidateForm);
    const selectedCv = cvFileInput?.files?.[0];

    // Không gửi một phần file rỗng. Một số trình duyệt tạo File có tên trống
    // khi người dùng không chọn CV; xóa trường này giúp API hiểu chắc chắn rằng
    // đây là hồ sơ không kèm CV.
    if (!selectedCv || !selectedCv.name || selectedCv.size === 0) {
      formData.delete("cv");
    }

    const response = await fetch("/api/upload-cv", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });
    const result = await parseJson(response);

    if (!response.ok || !result.success || result.stored !== true) {
      throw new Error(
        result.message ||
          "Máy chủ chưa xác nhận đã lưu hồ sơ. Vui lòng gửi lại."
      );
    }

    if (candidateReference) candidateReference.textContent = result.reference || "Đã tiếp nhận";
    if (candidateSuccessTitle) {
      candidateSuccessTitle.textContent = result.hasCv
        ? "Hồ sơ và CV đã được gửi thành công"
        : "Đơn ứng tuyển đã được gửi thành công";
    }
    if (candidateSuccessText) {
      candidateSuccessText.firstChild.textContent = result.hasCv
        ? "Mã hồ sơ: "
        : "Mã đơn: ";
    }
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

async function applyUrlState() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("apply") !== "1") return;

  const position = params.get("position") || "";
  const trigger = document.createElement("button");
  trigger.dataset.position = position;
  openModal("candidateModal", trigger);
}

loadJobs().finally(applyUrlState);
