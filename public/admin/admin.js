const TRANSLATION_LANGUAGES = ["en", "zh", "ko", "ja"];
const TRANSLATION_SUFFIXES = { en: "En", zh: "Zh", ko: "Ko", ja: "Ja" };
const TRANSLATION_FIELDS = [
  "title", "companyName", "location", "experience", "salary", "workHours",
  "summary", "responsibilities", "requirements", "benefits", "additionalInfo",
  "featuredTags", "targetCandidates", "featuredBadge"
];

function getTranslationFieldElements(language) {
  const suffix = TRANSLATION_SUFFIXES[language];
  return Object.fromEntries(TRANSLATION_FIELDS.map((field) => {
    const id = `job${field[0].toUpperCase()}${field.slice(1)}${suffix}`;
    return [field, document.getElementById(id)];
  }));
}

const state = {
  jobs: [],
  jobsLoading: false,
  candidates: createListState(),
  requests: createListState(),
};

const elements = {
  adminEmail: document.getElementById("adminEmail"),
  logoutLink: document.getElementById("logoutLink"),
  refreshButton: document.getElementById("refreshButton"),
  jobCount: document.getElementById("jobCount"),
  requestCount: document.getElementById("requestCount"),
  candidateCount: document.getElementById("candidateCount"),
  visibleSize: document.getElementById("visibleSize"),
  lastUpdated: document.getElementById("lastUpdated"),

  jobs: {
    form: document.getElementById("jobForm"),
    id: document.getElementById("jobId"),
    title: document.getElementById("jobTitle"),
    companyName: document.getElementById("jobCompanyName"),
    category: document.getElementById("jobCategory"),
    location: document.getElementById("jobLocation"),
    employmentType: document.getElementById("jobEmploymentType"),
    validThrough: document.getElementById("jobValidThrough"),
    experience: document.getElementById("jobExperience"),
    workHours: document.getElementById("jobWorkHours"),
    summary: document.getElementById("jobSummary"),
    responsibilities: document.getElementById("jobResponsibilities"),
    requirements: document.getElementById("jobRequirements"),
    benefits: document.getElementById("jobBenefits"),
    additionalInfo: document.getElementById("jobAdditionalInfo"),
    editorTitle: document.getElementById("jobEditorTitle"),
    salary: document.getElementById("jobSalary"),
    logo: document.getElementById("jobLogo"),
    featured: document.getElementById("jobFeatured"),
    featuredTags: document.getElementById("jobFeaturedTags"),
    targetCandidates: document.getElementById("jobTargetCandidates"),
    featuredBadge: document.getElementById("jobFeaturedBadge"),
    published: document.getElementById("jobPublished"),
    translations: Object.fromEntries(
      TRANSLATION_LANGUAGES.map((language) => [language, getTranslationFieldElements(language)])
    ),
    submitButton: document.getElementById("jobSubmitButton"),
    cancelEditButton: document.getElementById("jobCancelEditButton"),
    statusMessage: document.getElementById("jobStatusMessage"),
    rows: document.getElementById("jobRows"),
    emptyState: document.getElementById("jobEmptyState"),
    loadingState: document.getElementById("jobLoadingState"),
  },

  requests: {
    searchForm: document.getElementById("requestSearchForm"),
    searchInput: document.getElementById("requestSearchInput"),
    clearSearchButton: document.getElementById("requestClearSearchButton"),
    statusMessage: document.getElementById("requestStatusMessage"),
    rows: document.getElementById("requestRows"),
    emptyState: document.getElementById("requestEmptyState"),
    loadingState: document.getElementById("requestLoadingState"),
    pagination: document.getElementById("requestPagination"),
    scanSummary: document.getElementById("requestScanSummary"),
    loadMoreButton: document.getElementById("requestLoadMoreButton"),
  },

  candidates: {
    searchForm: document.getElementById("candidateSearchForm"),
    searchInput: document.getElementById("candidateSearchInput"),
    clearSearchButton: document.getElementById("candidateClearSearchButton"),
    statusMessage: document.getElementById("candidateStatusMessage"),
    rows: document.getElementById("candidateRows"),
    emptyState: document.getElementById("candidateEmptyState"),
    loadingState: document.getElementById("candidateLoadingState"),
    pagination: document.getElementById("candidatePagination"),
    scanSummary: document.getElementById("candidateScanSummary"),
    loadMoreButton: document.getElementById("candidateLoadMoreButton"),
  },
};

initialize();

function createListState() {
  return {
    items: [],
    cursor: null,
    query: "",
    loading: false,
    scanned: 0,
    searchTruncated: false,
  };
}

async function initialize() {
  bindEvents();
  await Promise.all([
    loadIdentity(),
    loadJobs(),
    loadRequests({ reset: true }),
    loadCandidates({ reset: true }),
  ]);
}

function bindEvents() {
  elements.refreshButton.addEventListener("click", async () => {
    elements.refreshButton.disabled = true;
    try {
      await Promise.all([
        loadJobs(),
        loadRequests({ reset: true }),
        loadCandidates({ reset: true }),
      ]);
    } finally {
      elements.refreshButton.disabled = false;
    }
  });

  elements.jobs.form.addEventListener("submit", submitJobForm);
  elements.jobs.cancelEditButton.addEventListener("click", resetJobForm);
  elements.jobs.rows.addEventListener("click", handleJobTableClick);
  elements.jobs.featured.addEventListener("change", () => {
    if (elements.jobs.featured.checked) elements.jobs.published.checked = true;
  });
  elements.jobs.published.addEventListener("change", () => {
    if (!elements.jobs.published.checked) elements.jobs.featured.checked = false;
  });

  bindListEvents("requests", loadRequests);
  bindListEvents("candidates", loadCandidates);
}

function bindListEvents(type, loader) {
  const group = elements[type];
  const listState = state[type];

  group.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    listState.query = group.searchInput.value.trim();
    loader({ reset: true });
  });

  group.clearSearchButton.addEventListener("click", () => {
    group.searchInput.value = "";
    listState.query = "";
    loader({ reset: true });
  });

  group.loadMoreButton.addEventListener("click", () => {
    loader({ reset: false });
  });

  group.rows.addEventListener("click", (event) => {
    handleListTableClick(event, type, loader);
  });
}

async function loadIdentity() {
  try {
    const response = await fetch("/admin/api/me", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const result = await parseJson(response);

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể xác định tài khoản quản trị.");
    }

    elements.adminEmail.textContent = result.user?.email || "Quản trị viên";
    elements.logoutLink.href = result.logoutUrl || "/cdn-cgi/access/logout";
  } catch (error) {
    elements.adminEmail.textContent = "Không xác định";
    showJobStatus(error.message, "error");
  }
}

async function loadJobs() {
  if (state.jobsLoading) return;
  state.jobsLoading = true;
  setJobLoading(true);

  try {
    const response = await fetch("/admin/api/jobs", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const result = await parseJson(response);

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể tải tin tuyển dụng.");
    }

    state.jobs = Array.isArray(result.jobs) ? result.jobs : [];
    renderJobs();
  } catch (error) {
    showJobStatus(error.message, "error");
  } finally {
    state.jobsLoading = false;
    setJobLoading(false);
    renderJobs();
  }
}

function collectJobTranslations() {
  const translations = {};

  for (const language of TRANSLATION_LANGUAGES) {
    const fields = elements.jobs.translations[language];
    const translation = {};

    for (const field of TRANSLATION_FIELDS) {
      const element = fields[field];
      if (!element) continue;
      if (field === "featuredTags") {
        const tags = element.value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 3);
        if (tags.length) translation[field] = tags;
        continue;
      }

      const value = element.value.trim();
      if (value) translation[field] = value;
    }

    if (Object.keys(translation).length) translations[language] = translation;
  }

  return translations;
}

function populateJobTranslations(job) {
  for (const language of TRANSLATION_LANGUAGES) {
    const fields = elements.jobs.translations[language];
    const translation = job.translations?.[language] || {};

    for (const field of TRANSLATION_FIELDS) {
      const element = fields[field];
      if (!element) continue;
      const value = translation[field];
      element.value = field === "featuredTags" && Array.isArray(value)
        ? value.join(", ")
        : String(value || "");
    }
  }
}

async function submitJobForm(event) {
  event.preventDefault();
  hideJobStatus();

  if (!elements.jobs.form.checkValidity()) {
    elements.jobs.form.reportValidity();
    return;
  }

  const id = elements.jobs.id.value.trim();
  const payload = {
    id,
    title: elements.jobs.title.value.trim(),
    companyName: elements.jobs.companyName.value.trim(),
    category: elements.jobs.category.value,
    location: elements.jobs.location.value.trim(),
    employmentType: elements.jobs.employmentType.value,
    validThrough: elements.jobs.validThrough.value,
    experience: elements.jobs.experience.value.trim(),
    workHours: elements.jobs.workHours.value.trim(),
    summary: elements.jobs.summary.value.trim(),
    responsibilities: elements.jobs.responsibilities.value.trim(),
    requirements: elements.jobs.requirements.value.trim(),
    benefits: elements.jobs.benefits.value.trim(),
    additionalInfo: elements.jobs.additionalInfo.value.trim(),
    salary: elements.jobs.salary.value.trim(),
    logo: elements.jobs.logo.value.trim(),
    featured: elements.jobs.featured.checked,
    featuredTags: elements.jobs.featuredTags.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    targetCandidates: elements.jobs.targetCandidates.value.trim(),
    featuredBadge: elements.jobs.featuredBadge.value.trim(),
    translations: collectJobTranslations(),
    published: elements.jobs.published.checked,
  };

  elements.jobs.submitButton.disabled = true;
  elements.jobs.cancelEditButton.disabled = true;
  elements.jobs.submitButton.textContent = id ? "Đang cập nhật..." : "Đang đăng tin...";

  try {
    const response = await fetch("/admin/api/jobs", {
      method: id ? "PUT" : "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await parseJson(response);

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể lưu tin tuyển dụng.");
    }

    resetJobForm();
    await loadJobs();
    showJobStatus(result.message || "Đã lưu tin tuyển dụng.", "success");
  } catch (error) {
    showJobStatus(error.message, "error");
  } finally {
    elements.jobs.submitButton.disabled = false;
    elements.jobs.cancelEditButton.disabled = false;
    elements.jobs.submitButton.textContent = elements.jobs.id.value
      ? "Cập nhật tin"
      : "Đăng tin";
  }
}

async function handleJobTableClick(event) {
  const button = event.target.closest("button[data-job-action]");
  if (!button) return;

  const job = state.jobs.find((item) => item.id === button.dataset.jobId);
  if (!job) return;

  if (button.dataset.jobAction === "edit") {
    startEditingJob(job);
    return;
  }

  if (button.dataset.jobAction === "delete") {
    const confirmed = window.confirm(`Xóa tin “${job.title}”? Thao tác này không thể hoàn tác.`);
    if (!confirmed) return;

    button.disabled = true;
    try {
      const response = await fetch(
        `/admin/api/jobs?id=${encodeURIComponent(job.id)}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json" },
        }
      );
      const result = await parseJson(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể xóa tin tuyển dụng.");
      }

      if (elements.jobs.id.value === job.id) resetJobForm();
      await loadJobs();
      showJobStatus(result.message || "Đã xóa tin tuyển dụng.", "success");
    } catch (error) {
      showJobStatus(error.message, "error");
    } finally {
      button.disabled = false;
    }
  }
}

function startEditingJob(job) {
  elements.jobs.id.value = job.id || "";
  elements.jobs.title.value = job.title || "";
  elements.jobs.companyName.value = job.companyName || "";
  elements.jobs.category.value = job.category || "";
  elements.jobs.location.value = job.location || "";
  elements.jobs.employmentType.value = job.employmentType || "";
  elements.jobs.validThrough.value = job.validThrough || "";
  elements.jobs.experience.value = job.experience || "";
  elements.jobs.workHours.value = job.workHours || "";
  elements.jobs.summary.value = job.summary || "";
  elements.jobs.responsibilities.value = job.responsibilities || "";
  elements.jobs.requirements.value = job.requirements || "";
  elements.jobs.benefits.value = job.benefits || "";
  elements.jobs.additionalInfo.value = job.additionalInfo || "";
  elements.jobs.salary.value = job.salary || "";
  elements.jobs.logo.value = job.logo || "";
  elements.jobs.featured.checked = job.featured === true;
  elements.jobs.featuredTags.value = Array.isArray(job.featuredTags)
    ? job.featuredTags.join(", ")
    : "";
  elements.jobs.targetCandidates.value = job.targetCandidates || "";
  elements.jobs.featuredBadge.value = job.featuredBadge || "Mới";
  populateJobTranslations(job);
  elements.jobs.published.checked = job.published !== false;
  elements.jobs.submitButton.textContent = "Cập nhật tin";
  elements.jobs.editorTitle.textContent = "Chỉnh sửa tin tuyển dụng";
  elements.jobs.cancelEditButton.classList.remove("hidden");
  hideJobStatus();
  elements.jobs.form.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => elements.jobs.title.focus(), 350);
}

function resetJobForm() {
  elements.jobs.form.reset();
  elements.jobs.id.value = "";
  elements.jobs.featured.checked = false;
  elements.jobs.featuredBadge.value = "Mới";
  elements.jobs.published.checked = true;
  elements.jobs.submitButton.textContent = "Đăng tin";
  elements.jobs.editorTitle.textContent = "Tạo tin tuyển dụng mới";
  elements.jobs.cancelEditButton.classList.add("hidden");
}

function renderJobs() {
  elements.jobs.rows.replaceChildren();

  for (const job of state.jobs) {
    elements.jobs.rows.append(createJobRow(job));
  }

  const isEmpty = !state.jobsLoading && state.jobs.length === 0;
  elements.jobs.emptyState.classList.toggle("hidden", !isEmpty);
  updateStats();
}

function createJobRow(job) {
  const row = document.createElement("tr");

  row.append(
    createCell([
      textElement("p", job.title || "Chưa có tên vị trí", "candidate-name"),
      textElement("span", job.companyName || "Chưa ghi doanh nghiệp tuyển dụng", "secondary-text"),
      textElement("span", job.logo || "Không có ký hiệu", "reference"),
      textElement("span", `Cập nhật: ${formatDate(job.updatedAt)}`, "secondary-text"),
      textElement("span", job.summary || "Chưa có nội dung giới thiệu chi tiết", "job-summary-preview"),
      textElement(
        "span",
        `Bản dịch: ${TRANSLATION_LANGUAGES.filter((language) => Object.keys(job.translations?.[language] || {}).length).map((language) => language.toUpperCase()).join(", ") || "chưa có"}`,
        "secondary-text"
      ),
    ]),
    createCell([badgeElement(job.category || "Khác")]),
    createCell([
      textElement("span", job.location || "Chưa cung cấp", "candidate-name"),
      textElement("span", job.experience || "Không ghi yêu cầu kinh nghiệm", "secondary-text"),
    ]),
    createCell([textElement("span", job.salary || "Thỏa thuận", "candidate-name")]),
    createCell([
      statusBadgeElement(job.published !== false ? "Đang hiển thị" : "Đang ẩn", job.published !== false),
      ...(job.featured === true
        ? [textElement("span", "★ Nổi bật đầu trang", "featured-reference")]
        : []),
    ]),
    createCell([
      jobActionButton("Sửa", "edit", job.id, "edit-button"),
      jobActionButton("Xóa", "delete", job.id, "delete-button"),
    ], "action-cell")
  );

  return row;
}

async function loadRequests({ reset }) {
  const listState = state.requests;
  const group = elements.requests;
  if (listState.loading) return;

  listState.loading = true;
  setLoading(group, true);
  hideError(group);

  if (reset) resetListState(listState, renderRequests);
  const params = buildParams(listState, reset);

  try {
    const response = await fetch(`/admin/api/requests?${params.toString()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const result = await parseJson(response);

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể tải yêu cầu doanh nghiệp.");
    }

    const incoming = Array.isArray(result.requests) ? result.requests : [];
    listState.items = reset
      ? incoming
      : mergeUnique(listState.items, incoming, "submittedAt");
    listState.cursor = result.cursor || null;
    listState.scanned = Number(result.scanned || incoming.length);
    listState.searchTruncated = Boolean(result.truncated && listState.query);

    renderRequests();
  } catch (error) {
    showError(group, error.message);
  } finally {
    listState.loading = false;
    setLoading(group, false);
    renderRequests();
  }
}

async function loadCandidates({ reset }) {
  const listState = state.candidates;
  const group = elements.candidates;
  if (listState.loading) return;

  listState.loading = true;
  setLoading(group, true);
  hideError(group);

  if (reset) resetListState(listState, renderCandidates);
  const params = buildParams(listState, reset);

  try {
    const response = await fetch(`/admin/api/candidates?${params.toString()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const result = await parseJson(response);

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể tải danh sách ứng viên.");
    }

    const incoming = Array.isArray(result.candidates) ? result.candidates : [];
    listState.items = reset
      ? incoming
      : mergeUnique(listState.items, incoming, "uploadedAt");
    listState.cursor = result.cursor || null;
    listState.scanned = Number(result.scanned || incoming.length);
    listState.searchTruncated = Boolean(result.truncated && listState.query);

    renderCandidates();
  } catch (error) {
    showError(group, error.message);
  } finally {
    listState.loading = false;
    setLoading(group, false);
    renderCandidates();
  }
}

function resetListState(listState, render) {
  listState.items = [];
  listState.cursor = null;
  listState.scanned = 0;
  listState.searchTruncated = false;
  render();
}

function buildParams(listState, reset) {
  const params = new URLSearchParams({ limit: "40" });
  if (listState.query) params.set("q", listState.query);
  if (!reset && listState.cursor && !listState.query) {
    params.set("cursor", listState.cursor);
  }
  return params;
}

function renderRequests() {
  const listState = state.requests;
  const group = elements.requests;
  group.rows.replaceChildren();

  for (const request of listState.items) {
    group.rows.append(createRequestRow(request));
  }

  updateListFooter(group, listState, "yêu cầu");
  updateStats();
}

function createRequestRow(request) {
  const row = document.createElement("tr");

  row.append(
    createCell([
      textElement("p", request.company || "Chưa có tên doanh nghiệp", "candidate-name"),
      textElement("span", request.reference || "Không có mã yêu cầu", "reference"),
    ]),
    createCell(
      [listDeleteButton("requests", request.key, "Xóa tin")],
      "action-cell"
    ),
    createCell([
      textElement("span", request.contact || "Chưa có người liên hệ", "candidate-name"),
      linkElement(`mailto:${request.email}`, request.email || "Chưa có email", "contact-link"),
      linkElement(`tel:${request.phone}`, request.phone || "Chưa có điện thoại", "contact-link"),
    ]),
    createCell([
      textElement("span", request.position || "Chưa cung cấp", "candidate-name"),
      badgeElement(`${Number(request.quantity || 1)} người`),
    ]),
    createCell([
      labeledText("Địa điểm", request.location || "Chưa cung cấp"),
      labeledText("Mức lương", request.salary || "Chưa cung cấp"),
    ]),
    createCell([
      textElement("span", formatDate(request.submittedAt), "candidate-name"),
      textElement("span", formatRelativeTime(request.submittedAt), "secondary-text"),
      labeledText("Cần nhân sự", request.deadline || "Chưa cung cấp"),
    ]),
    createCell([descriptionElement(request.description || "Không có mô tả thêm")])
  );

  return row;
}

function renderCandidates() {
  const listState = state.candidates;
  const group = elements.candidates;
  group.rows.replaceChildren();

  for (const candidate of listState.items) {
    group.rows.append(createCandidateRow(candidate));
  }

  updateListFooter(group, listState, "hồ sơ");
  updateStats();
}

function createCandidateRow(candidate) {
  const row = document.createElement("tr");

  row.append(
    createCell([
      textElement("p", candidate.name || "Chưa có tên", "candidate-name"),
      textElement("span", candidate.reference || "Không có mã hồ sơ", "reference"),
    ]),
    createCell(
      [listDeleteButton("candidates", candidate.key, "Xóa tin")],
      "action-cell"
    ),
    createCell([
      linkElement(`mailto:${candidate.email}`, candidate.email || "Chưa có email", "contact-link"),
      linkElement(`tel:${candidate.phone}`, candidate.phone || "Chưa có điện thoại", "contact-link"),
    ]),
    createCell([
      textElement("span", candidate.desiredPosition || "Chưa cung cấp", "candidate-name"),
      textElement("span", candidate.desiredLocation || "Chưa cung cấp khu vực", "secondary-text"),
    ]),
    createCell([
      textElement("span", formatDate(candidate.uploadedAt), "candidate-name"),
      textElement("span", formatRelativeTime(candidate.uploadedAt), "secondary-text"),
    ]),
    createCell(
      candidate.hasCv
        ? [
            textElement("span", candidate.originalFilename || "CV", "file-name"),
            textElement("span", formatBytes(candidate.size), "secondary-text"),
            downloadElement(candidate),
          ]
        : [
            textElement("span", "Chưa gửi CV", "file-name no-cv"),
            textElement("span", "Đã nhận thông tin liên hệ", "secondary-text"),
          ]
    )
  );

  return row;
}

async function handleListTableClick(event, type, loader) {
  const button = event.target.closest("button[data-list-action='delete']");
  if (!button || button.dataset.listType !== type) return;

  const group = elements[type];
  const listState = state[type];
  const key = button.dataset.itemKey || "";
  const item = listState.items.find((entry) => entry.key === key);
  if (!item) return;

  const isRequest = type === "requests";
  const label = isRequest
    ? item.company || item.position || "yêu cầu doanh nghiệp này"
    : item.name || "hồ sơ ứng viên này";
  const warning = isRequest
    ? `Xóa yêu cầu của “${label}”? Thao tác này không thể hoàn tác.`
    : `Xóa hồ sơ của “${label}”? CV đính kèm cũng sẽ bị xóa và không thể khôi phục.`;

  if (!window.confirm(warning)) return;

  button.disabled = true;
  hideError(group);

  try {
    const endpoint = isRequest ? "requests" : "candidates";
    const response = await fetch(
      `/admin/api/${endpoint}?key=${encodeURIComponent(key)}`,
      {
        method: "DELETE",
        headers: { Accept: "application/json" },
      }
    );
    const result = await parseJson(response);

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể xóa dữ liệu.");
    }

    await loader({ reset: true });
    showListStatus(group, result.message || "Đã xóa dữ liệu.", "success");
  } catch (error) {
    showError(group, error.message);
  } finally {
    button.disabled = false;
  }
}

function listDeleteButton(type, key, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "table-action delete-button";
  button.dataset.listAction = "delete";
  button.dataset.listType = type;
  button.dataset.itemKey = key;
  button.textContent = label;
  return button;
}

function updateListFooter(group, listState, noun) {
  const isEmpty = !listState.loading && listState.items.length === 0;
  group.emptyState.classList.toggle("hidden", !isEmpty);
  group.pagination.classList.toggle(
    "hidden",
    listState.items.length === 0 || (!listState.cursor && !listState.query)
  );
  group.loadMoreButton.classList.toggle(
    "hidden",
    !listState.cursor || Boolean(listState.query)
  );

  const summaryParts = [`${listState.items.length} ${noun}`];
  if (listState.query) summaryParts.push(`đã quét ${listState.scanned} bản ghi`);
  if (listState.searchTruncated) summaryParts.push("kết quả tìm kiếm đã được giới hạn");
  group.scanSummary.textContent = summaryParts.join(" · ");
}

function createCell(children, className = "") {
  const cell = document.createElement("td");
  if (className) cell.className = className;
  for (const child of children) {
    if (child) cell.append(child);
  }
  return cell;
}

function textElement(tag, text, className) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function linkElement(href, text, className) {
  const element = document.createElement("a");
  element.className = className;
  element.textContent = text;

  if (text.startsWith("Chưa có")) {
    element.removeAttribute("href");
  } else {
    element.href = href;
  }

  return element;
}

function labeledText(label, value) {
  const wrapper = document.createElement("span");
  wrapper.className = "labeled-text";

  const labelElement = document.createElement("small");
  labelElement.textContent = label;

  const valueElement = document.createElement("span");
  valueElement.textContent = value;

  wrapper.append(labelElement, valueElement);
  return wrapper;
}

function badgeElement(text) {
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = text;
  return badge;
}

function statusBadgeElement(text, active) {
  const badge = document.createElement("span");
  badge.className = `status-badge ${active ? "active" : "inactive"}`;
  badge.textContent = text;
  return badge;
}

function jobActionButton(text, action, jobId, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `table-action ${className}`;
  button.dataset.jobAction = action;
  button.dataset.jobId = jobId;
  button.textContent = text;
  return button;
}

function descriptionElement(text) {
  const element = document.createElement("p");
  element.className = "description-text";
  element.textContent = text;
  element.title = text;
  return element;
}

function downloadElement(candidate) {
  const link = document.createElement("a");
  link.className = "download-link";
  link.textContent = "Tải CV";
  link.href = `/admin/api/download?key=${encodeURIComponent(candidate.key)}`;
  return link;
}

function updateStats() {
  elements.jobCount.textContent = String(
    state.jobs.filter((job) => job.published !== false).length
  );
  elements.requestCount.textContent = String(state.requests.items.length);
  elements.candidateCount.textContent = String(state.candidates.items.length);

  const totalSize = state.candidates.items.reduce(
    (sum, candidate) => sum + Number(candidate.size || 0),
    0
  );
  elements.visibleSize.textContent = formatBytes(totalSize);

  const newest = [
    ...state.jobs.map((item) => Date.parse(item.updatedAt || 0)),
    ...state.requests.items.map((item) => Date.parse(item.submittedAt || 0)),
    ...state.candidates.items.map((item) => Date.parse(item.uploadedAt || 0)),
  ]
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];

  elements.lastUpdated.textContent = newest
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(newest))
    : "—";
}

function setJobLoading(isLoading) {
  elements.jobs.loadingState.classList.toggle("hidden", !isLoading);
}

function showJobStatus(message, type) {
  elements.jobs.statusMessage.textContent = message || "Đã xảy ra lỗi.";
  elements.jobs.statusMessage.classList.remove("hidden", "success");
  if (type === "success") elements.jobs.statusMessage.classList.add("success");
}

function hideJobStatus() {
  elements.jobs.statusMessage.textContent = "";
  elements.jobs.statusMessage.classList.add("hidden");
  elements.jobs.statusMessage.classList.remove("success");
}

function setLoading(group, isLoading) {
  group.loadingState.classList.toggle("hidden", !isLoading);
  group.loadMoreButton.disabled = isLoading;
  group.searchInput.disabled = isLoading;
  group.clearSearchButton.disabled = isLoading;
}

function showListStatus(group, message, type = "error") {
  group.statusMessage.textContent = message || "Đã xảy ra lỗi.";
  group.statusMessage.classList.remove("hidden", "success");
  if (type === "success") group.statusMessage.classList.add("success");
}

function showError(group, message) {
  showListStatus(group, message, "error");
}

function hideError(group) {
  group.statusMessage.textContent = "";
  group.statusMessage.classList.add("hidden");
  group.statusMessage.classList.remove("success");
}

function mergeUnique(current, incoming, dateField) {
  const map = new Map(current.map((item) => [item.key, item]));
  for (const item of incoming) map.set(item.key, item);
  return [...map.values()].sort(
    (a, b) => Date.parse(b[dateField] || 0) - Date.parse(a[dateField] || 0)
  );
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return { success: false, message: "Máy chủ trả về phản hồi không hợp lệ." };
  }
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const ranges = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  let duration = seconds;
  for (const [limit, unit] of ranges) {
    if (Math.abs(duration) < limit) {
      return new Intl.RelativeTimeFormat("vi-VN", { numeric: "auto" }).format(
        Math.round(duration),
        unit
      );
    }
    duration /= limit;
  }

  return "";
}

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const amount = bytes / 1024 ** exponent;

  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: exponent === 0 ? 0 : 1,
  }).format(amount)} ${units[exponent]}`;
}
