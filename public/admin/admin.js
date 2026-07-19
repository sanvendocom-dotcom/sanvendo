const state = {
  candidates: [],
  cursor: null,
  query: "",
  loading: false,
  scanned: 0,
  searchTruncated: false,
};

const elements = {
  adminEmail: document.getElementById("adminEmail"),
  logoutLink: document.getElementById("logoutLink"),
  visibleCount: document.getElementById("visibleCount"),
  visibleSize: document.getElementById("visibleSize"),
  lastUpdated: document.getElementById("lastUpdated"),
  refreshButton: document.getElementById("refreshButton"),
  searchForm: document.getElementById("searchForm"),
  searchInput: document.getElementById("searchInput"),
  clearSearchButton: document.getElementById("clearSearchButton"),
  statusMessage: document.getElementById("statusMessage"),
  candidateRows: document.getElementById("candidateRows"),
  emptyState: document.getElementById("emptyState"),
  loadingState: document.getElementById("loadingState"),
  pagination: document.getElementById("pagination"),
  scanSummary: document.getElementById("scanSummary"),
  loadMoreButton: document.getElementById("loadMoreButton"),
};

initialize();

async function initialize() {
  bindEvents();
  await Promise.all([loadIdentity(), loadCandidates({ reset: true })]);
}

function bindEvents() {
  elements.refreshButton.addEventListener("click", () => {
    loadCandidates({ reset: true });
  });

  elements.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.query = elements.searchInput.value.trim();
    loadCandidates({ reset: true });
  });

  elements.clearSearchButton.addEventListener("click", () => {
    elements.searchInput.value = "";
    state.query = "";
    loadCandidates({ reset: true });
  });

  elements.loadMoreButton.addEventListener("click", () => {
    loadCandidates({ reset: false });
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
    showError(error.message);
  }
}

async function loadCandidates({ reset }) {
  if (state.loading) return;

  state.loading = true;
  setLoading(true);
  hideError();

  if (reset) {
    state.candidates = [];
    state.cursor = null;
    state.scanned = 0;
    state.searchTruncated = false;
    renderCandidates();
  }

  const params = new URLSearchParams({ limit: "40" });
  if (state.query) params.set("q", state.query);
  if (!reset && state.cursor && !state.query) params.set("cursor", state.cursor);

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
    state.candidates = reset
      ? incoming
      : mergeUniqueCandidates(state.candidates, incoming);
    state.cursor = result.cursor || null;
    state.scanned = Number(result.scanned || incoming.length);
    state.searchTruncated = Boolean(result.truncated && state.query);

    renderCandidates();
  } catch (error) {
    showError(error.message);
  } finally {
    state.loading = false;
    setLoading(false);
  }
}

function renderCandidates() {
  elements.candidateRows.replaceChildren();

  for (const candidate of state.candidates) {
    elements.candidateRows.append(createCandidateRow(candidate));
  }

  const isEmpty = !state.loading && state.candidates.length === 0;
  elements.emptyState.classList.toggle("hidden", !isEmpty);
  elements.pagination.classList.toggle(
    "hidden",
    state.candidates.length === 0 || (!state.cursor && !state.query)
  );
  elements.loadMoreButton.classList.toggle("hidden", !state.cursor || Boolean(state.query));

  const summaryParts = [`${state.candidates.length} hồ sơ`];
  if (state.query) summaryParts.push(`đã quét ${state.scanned} tệp`);
  if (state.searchTruncated) summaryParts.push("kết quả tìm kiếm đã được giới hạn");
  elements.scanSummary.textContent = summaryParts.join(" · ");

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
    createCell([
      textElement("span", candidate.originalFilename || "CV", "file-name"),
      textElement("span", formatBytes(candidate.size), "secondary-text"),
      downloadElement(candidate),
    ])
  );

  return row;
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

function downloadElement(candidate) {
  const link = document.createElement("a");
  link.className = "download-link";
  link.textContent = "Tải CV";
  link.href = `/admin/api/download?key=${encodeURIComponent(candidate.key)}`;
  return link;
}

function updateStats() {
  const totalSize = state.candidates.reduce(
    (sum, candidate) => sum + Number(candidate.size || 0),
    0
  );
  const newest = state.candidates
    .map((candidate) => Date.parse(candidate.uploadedAt || 0))
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];

  elements.visibleCount.textContent = String(state.candidates.length);
  elements.visibleSize.textContent = formatBytes(totalSize);
  elements.lastUpdated.textContent = newest
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(newest))
    : "—";
}

function setLoading(isLoading) {
  elements.loadingState.classList.toggle("hidden", !isLoading);
  elements.refreshButton.disabled = isLoading;
  elements.loadMoreButton.disabled = isLoading;
}

function showError(message) {
  elements.statusMessage.textContent = message || "Đã xảy ra lỗi.";
  elements.statusMessage.classList.remove("hidden");
}

function hideError() {
  elements.statusMessage.textContent = "";
  elements.statusMessage.classList.add("hidden");
}

function mergeUniqueCandidates(current, incoming) {
  const map = new Map(current.map((candidate) => [candidate.key, candidate]));
  for (const candidate of incoming) map.set(candidate.key, candidate);
  return [...map.values()].sort(
    (a, b) => Date.parse(b.uploadedAt || 0) - Date.parse(a.uploadedAt || 0)
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
