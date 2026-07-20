const state = {
  candidates: createListState(),
  requests: createListState(),
};

const elements = {
  adminEmail: document.getElementById("adminEmail"),
  logoutLink: document.getElementById("logoutLink"),
  refreshButton: document.getElementById("refreshButton"),
  requestCount: document.getElementById("requestCount"),
  candidateCount: document.getElementById("candidateCount"),
  visibleSize: document.getElementById("visibleSize"),
  lastUpdated: document.getElementById("lastUpdated"),

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
    loadRequests({ reset: true }),
    loadCandidates({ reset: true }),
  ]);
}

function bindEvents() {
  elements.refreshButton.addEventListener("click", async () => {
    elements.refreshButton.disabled = true;
    try {
      await Promise.all([
        loadRequests({ reset: true }),
        loadCandidates({ reset: true }),
      ]);
    } finally {
      elements.refreshButton.disabled = false;
    }
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
    showError(elements.requests, error.message);
  }
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
    createCell([
      descriptionElement(request.description || "Không có mô tả thêm"),
    ])
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

function createCell(children) {
  const cell = document.createElement("td");
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
  elements.requestCount.textContent = String(state.requests.items.length);
  elements.candidateCount.textContent = String(state.candidates.items.length);

  const totalSize = state.candidates.items.reduce(
    (sum, candidate) => sum + Number(candidate.size || 0),
    0
  );
  elements.visibleSize.textContent = formatBytes(totalSize);

  const newest = [
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

function setLoading(group, isLoading) {
  group.loadingState.classList.toggle("hidden", !isLoading);
  group.loadMoreButton.disabled = isLoading;
  group.searchInput.disabled = isLoading;
  group.clearSearchButton.disabled = isLoading;
}

function showError(group, message) {
  group.statusMessage.textContent = message || "Đã xảy ra lỗi.";
  group.statusMessage.classList.remove("hidden");
}

function hideError(group) {
  group.statusMessage.textContent = "";
  group.statusMessage.classList.add("hidden");
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
