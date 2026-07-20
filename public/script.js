const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    const modalId = button.dataset.openModal;
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    const firstInput = modal.querySelector("input");
    window.setTimeout(() => firstInput?.focus(), 100);
  });
});

document.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", closeAllModals);
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
const jobCards = [...document.querySelectorAll(".job-card")];
const emptyState = document.getElementById("emptyState");

function normalize(text) {
  return (text || "")
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
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

  emptyState.classList.toggle("hidden", visibleCount > 0);
}

jobFilter?.addEventListener("input", filterJobs);
locationFilter?.addEventListener("change", filterJobs);

document.querySelectorAll("[data-category]").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    jobFilter.value = category;
    filterJobs();
    document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll("[data-search]").forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.search;
    document.getElementById("heroSearchInput").value = value;
    jobFilter.value = value;
    filterJobs();
    document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("heroSearch")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const keyword = document.getElementById("heroSearchInput").value.trim();
  jobFilter.value = keyword;
  filterJobs();
  document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".save-job").forEach((button) => {
  button.addEventListener("click", () => {
    const saved = button.classList.toggle("saved");
    button.textContent = saved ? "♥" : "♡";
    showToast(saved ? "Đã lưu vị trí." : "Đã bỏ lưu vị trí.");
  });
});

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const answer = item.querySelector(".faq-answer");
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".faq-item.open").forEach((openItem) => {
      openItem.classList.remove("open");
      openItem.querySelector(".faq-answer").style.maxHeight = null;
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
  requestError.textContent = message;
  requestError.classList.remove("hidden");
}

function clearRequestError() {
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

  const originalButtonText = requestSubmit.textContent;

  try {
    requestSubmit.disabled = true;
    requestSubmit.textContent = "Đang gửi yêu cầu...";

    const response = await fetch("/api/recruitment-request", {
      method: "POST",
      body: new FormData(requestForm),
      headers: { Accept: "application/json" },
    });

    let result;
    try {
      result = await response.json();
    } catch {
      result = {
        success: false,
        message: "Máy chủ trả về phản hồi không hợp lệ.",
      };
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể gửi yêu cầu tuyển dụng.");
    }

    requestReference.textContent = result.reference || "Đã tiếp nhận";
    requestForm.reset();
    requestForm.classList.add("hidden");
    requestSuccess.classList.remove("hidden");
  } catch (error) {
    showRequestError(
      error instanceof Error
        ? error.message
        : "Không thể gửi yêu cầu. Vui lòng thử lại."
    );
  } finally {
    requestSubmit.disabled = false;
    requestSubmit.textContent = originalButtonText;
  }
});

// Khi mở lại biểu mẫu doanh nghiệp, hiển thị form để có thể gửi yêu cầu mới.
document.querySelectorAll('[data-open-modal="requestModal"]').forEach((button) => {
  button.addEventListener("click", () => {
    clearRequestError();
    requestForm?.classList.remove("hidden");
    requestSuccess?.classList.add("hidden");
  });
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
  candidateError.textContent = message;
  candidateError.classList.remove("hidden");
}

function clearCandidateError() {
  candidateError.textContent = "";
  candidateError.classList.add("hidden");
}

function validateCvFile(file) {
  // CV là tùy chọn. Chỉ kiểm tra định dạng và dung lượng khi người dùng có chọn tệp.
  if (!file || !file.name || file.size === 0) {
    return "";
  }

  const extension = getFileExtension(file.name);

  if (!ALLOWED_CV_EXTENSIONS.has(extension)) {
    return "Chỉ chấp nhận file PDF, DOC hoặc DOCX.";
  }

  if (file.size <= 0) {
    return "File CV đang trống.";
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

  const file = cvFileInput?.files?.[0];
  const fileError = validateCvFile(file);

  if (fileError) {
    showCandidateError(fileError);
    return;
  }

  const originalButtonText = candidateSubmit.textContent;

  try {
    candidateSubmit.disabled = true;
    candidateSubmit.textContent = "Đang gửi hồ sơ...";

    const response = await fetch("/api/upload-cv", {
      method: "POST",
      body: new FormData(candidateForm),
      headers: {
        Accept: "application/json",
      },
    });

    let result;
    try {
      result = await response.json();
    } catch {
      result = {
        success: false,
        message: "Máy chủ trả về phản hồi không hợp lệ.",
      };
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể gửi hồ sơ.");
    }

    candidateReference.textContent = result.reference || "Đã tiếp nhận";
    candidateForm.reset();
    candidateForm.classList.add("hidden");
    candidateSuccess.classList.remove("hidden");
  } catch (error) {
    showCandidateError(
      error instanceof Error
        ? error.message
        : "Không thể gửi hồ sơ. Vui lòng thử lại."
    );
  } finally {
    candidateSubmit.disabled = false;
    candidateSubmit.textContent = originalButtonText;
  }
});

// Điền sẵn vị trí khi ứng viên bấm nút “Ứng tuyển” tại một tin việc làm.
document.querySelectorAll('[data-open-modal="candidateModal"][data-position]').forEach((button) => {
  button.addEventListener("click", () => {
    const positionInput = candidateForm?.elements?.namedItem("desiredPosition");
    if (positionInput instanceof HTMLInputElement) {
      positionInput.value = button.dataset.position || "";
    }
  });
});

// Khi mở lại modal, hiển thị lại form để có thể gửi hồ sơ mới.
document.querySelectorAll('[data-open-modal="candidateModal"]').forEach((button) => {
  button.addEventListener("click", () => {
    clearCandidateError();
    candidateForm?.classList.remove("hidden");
    candidateSuccess?.classList.add("hidden");
  });
});
