export const SUPPORTED_LANGUAGES = ["vi", "en", "zh", "ko", "ja"];

export const LANGUAGE_CONFIG = {
  vi: { locale: "vi-VN", htmlLang: "vi", ogLocale: "vi_VN", label: "VI" },
  en: { locale: "en-US", htmlLang: "en", ogLocale: "en_US", label: "EN" },
  zh: { locale: "zh-CN", htmlLang: "zh-CN", ogLocale: "zh_CN", label: "中文" },
  ko: { locale: "ko-KR", htmlLang: "ko", ogLocale: "ko_KR", label: "한국어" },
  ja: { locale: "ja-JP", htmlLang: "ja", ogLocale: "ja_JP", label: "日本語" },
};

const CATEGORY_LABELS = {
    vi: {
      "Kinh doanh": "Kinh doanh & Bán hàng", Marketing: "Marketing & Truyền thông",
      "Kế toán": "Kế toán & Tài chính", "Nhân sự": "Hành chính & Nhân sự",
      "Công nghệ": "Công nghệ thông tin", "Kỹ thuật": "Sản xuất, Kỹ thuật & QA/QC",
      Logistics: "Kho vận & Chuỗi cung ứng", "Chăm sóc khách hàng": "Chăm sóc khách hàng",
      "Lao động phổ thông": "Lao động phổ thông & Vận hành", "Bán lẻ & Dịch vụ": "Bán lẻ, Nhà hàng & Dịch vụ",
    },
    en: {
      "Kinh doanh": "Sales & Business Development", Marketing: "Marketing & Communications",
      "Kế toán": "Accounting & Finance", "Nhân sự": "Administration & Human Resources",
      "Công nghệ": "Information Technology", "Kỹ thuật": "Manufacturing, Engineering & QA/QC",
      Logistics: "Logistics & Supply Chain", "Chăm sóc khách hàng": "Customer Service",
      "Lao động phổ thông": "General Labor & Operations", "Bán lẻ & Dịch vụ": "Retail, Food Service & Hospitality",
    },
    zh: {
      "Kinh doanh": "销售与业务拓展", Marketing: "市场营销与传播", "Kế toán": "会计与财务",
      "Nhân sự": "行政与人力资源", "Công nghệ": "信息技术", "Kỹ thuật": "生产、工程与质量管理",
      Logistics: "物流与供应链", "Chăm sóc khách hàng": "客户服务", "Lao động phổ thông": "普工与运营",
      "Bán lẻ & Dịch vụ": "零售、餐饮与服务",
    },
    ko: {
      "Kinh doanh": "영업 및 사업개발", Marketing: "마케팅 및 커뮤니케이션", "Kế toán": "회계 및 재무",
      "Nhân sự": "총무 및 인사", "Công nghệ": "정보기술", "Kỹ thuật": "생산·엔지니어링·QA/QC",
      Logistics: "물류 및 공급망", "Chăm sóc khách hàng": "고객 서비스", "Lao động phổ thông": "일반 생산직 및 운영",
      "Bán lẻ & Dịch vụ": "소매·외식·서비스",
    },
    ja: {
      "Kinh doanh": "営業・事業開発", Marketing: "マーケティング・広報", "Kế toán": "経理・財務",
      "Nhân sự": "総務・人事", "Công nghệ": "情報技術", "Kỹ thuật": "製造・技術・QA/QC",
      Logistics: "物流・サプライチェーン", "Chăm sóc khách hàng": "カスタマーサービス", "Lao động phổ thông": "一般作業・オペレーション",
      "Bán lẻ & Dịch vụ": "小売・飲食・サービス",
    },
  };

const EMPLOYMENT_TYPES = {
    vi: { FULL_TIME: "Toàn thời gian", PART_TIME: "Bán thời gian", CONTRACTOR: "Hợp đồng / cộng tác", TEMPORARY: "Tạm thời", INTERN: "Thực tập", VOLUNTEER: "Tình nguyện", PER_DIEM: "Theo ngày", OTHER: "Khác" },
    en: { FULL_TIME: "Full-time", PART_TIME: "Part-time", CONTRACTOR: "Contract / Freelance", TEMPORARY: "Temporary", INTERN: "Internship", VOLUNTEER: "Volunteer", PER_DIEM: "Per diem", OTHER: "Other" },
    zh: { FULL_TIME: "全职", PART_TIME: "兼职", CONTRACTOR: "合同工 / 合作", TEMPORARY: "临时", INTERN: "实习", VOLUNTEER: "志愿者", PER_DIEM: "按日计薪", OTHER: "其他" },
    ko: { FULL_TIME: "정규직", PART_TIME: "파트타임", CONTRACTOR: "계약직 / 프리랜서", TEMPORARY: "임시직", INTERN: "인턴", VOLUNTEER: "자원봉사", PER_DIEM: "일급제", OTHER: "기타" },
    ja: { FULL_TIME: "正社員", PART_TIME: "パートタイム", CONTRACTOR: "契約・業務委託", TEMPORARY: "臨時雇用", INTERN: "インターン", VOLUNTEER: "ボランティア", PER_DIEM: "日給", OTHER: "その他" },
  };

const PAGE_TEXT = {
  vi: {
    home: "Trang chủ", jobs: "Việc làm", apply: "Ứng tuyển", location: "Địa điểm", salary: "Mức lương",
    experience: "Kinh nghiệm", noExperience: "Không yêu cầu", workHours: "Thời gian", interview: "Trao đổi khi phỏng vấn",
    responsibilities: "Mô tả công việc", requirements: "Yêu cầu ứng viên", benefits: "Quyền lợi",
    additionalInfo: "Thông tin bổ sung", workingHours: "Thời gian làm việc", jobInfo: "Thông tin công việc",
    missingDetails: "Vui lòng liên hệ Sanvendo để nhận mô tả chi tiết cho vị trí này.",
    applyTitle: "Ứng tuyển vị trí này", applyNote: "Gửi thông tin trước, CV không bắt buộc. Ứng viên không phải trả phí.",
    submitApplication: "Gửi hồ sơ ứng tuyển", otherJobs: "Xem các việc làm khác", datePosted: "Ngày đăng",
    validThrough: "Hạn ứng tuyển", jobId: "Mã tin", updating: "Đang cập nhật",
    hiringCompany: "Doanh nghiệp tuyển dụng qua Sanvendo", footer: "Tuyển dụng & Headhunting theo yêu cầu",
    backHome: "Về trang chủ", unavailable: "Dịch vụ việc làm đang tạm thời gián đoạn.",
    notFound: "Tin tuyển dụng không còn hiển thị.", loadError: "Không thể tải chi tiết công việc.", at: "tại",
  },
  en: {
    home: "Home", jobs: "Jobs", apply: "Apply", location: "Location", salary: "Salary",
    experience: "Experience", noExperience: "Not required", workHours: "Schedule", interview: "Discussed during the interview",
    responsibilities: "Responsibilities", requirements: "Candidate requirements", benefits: "Benefits",
    additionalInfo: "Additional information", workingHours: "Working hours", jobInfo: "Job information",
    missingDetails: "Please contact Sanvendo for the full description of this role.",
    applyTitle: "Apply for this role", applyNote: "Submit your information first; a CV is optional. Candidates never pay a fee.",
    submitApplication: "Submit application", otherJobs: "View other jobs", datePosted: "Date posted",
    validThrough: "Application deadline", jobId: "Job ID", updating: "Updating",
    hiringCompany: "Employer recruiting through Sanvendo", footer: "On-demand Recruitment & Headhunting",
    backHome: "Back to home", unavailable: "The job service is temporarily unavailable.",
    notFound: "This job listing is no longer available.", loadError: "Unable to load the job details.", at: "in",
  },
  zh: {
    home: "首页", jobs: "职位", apply: "申请", location: "地点", salary: "薪资",
    experience: "经验", noExperience: "不限", workHours: "工作时间", interview: "面试时沟通",
    responsibilities: "工作职责", requirements: "任职要求", benefits: "福利待遇",
    additionalInfo: "补充信息", workingHours: "工作时间", jobInfo: "职位信息",
    missingDetails: "请联系 Sanvendo 获取该职位的完整说明。",
    applyTitle: "申请此职位", applyNote: "可先提交信息，简历不是必填项。求职者无需付费。",
    submitApplication: "提交申请", otherJobs: "查看其他职位", datePosted: "发布日期",
    validThrough: "申请截止日期", jobId: "职位编号", updating: "正在更新",
    hiringCompany: "通过 Sanvendo 招聘的企业", footer: "按需招聘与猎头服务",
    backHome: "返回首页", unavailable: "招聘服务暂时不可用。",
    notFound: "该招聘信息已不再显示。", loadError: "无法加载职位详情。", at: "·",
  },
  ko: {
    home: "홈", jobs: "채용공고", apply: "지원", location: "근무지", salary: "급여",
    experience: "경력", noExperience: "경력 무관", workHours: "근무 시간", interview: "면접 시 협의",
    responsibilities: "주요 업무", requirements: "지원 자격", benefits: "복리후생",
    additionalInfo: "추가 정보", workingHours: "근무 시간", jobInfo: "직무 정보",
    missingDetails: "이 직무의 상세 설명은 Sanvendo에 문의해 주세요.",
    applyTitle: "이 직무에 지원", applyNote: "먼저 정보를 제출할 수 있으며 이력서는 선택 사항입니다. 지원자는 비용을 내지 않습니다.",
    submitApplication: "지원서 제출", otherJobs: "다른 채용공고 보기", datePosted: "등록일",
    validThrough: "지원 마감일", jobId: "공고 번호", updating: "업데이트 중",
    hiringCompany: "Sanvendo를 통해 채용하는 기업", footer: "맞춤형 채용 및 헤드헌팅",
    backHome: "홈으로", unavailable: "채용 서비스가 일시적으로 중단되었습니다.",
    notFound: "이 채용공고는 더 이상 표시되지 않습니다.", loadError: "직무 상세 정보를 불러올 수 없습니다.", at: "·",
  },
  ja: {
    home: "ホーム", jobs: "求人", apply: "応募", location: "勤務地", salary: "給与",
    experience: "経験", noExperience: "不問", workHours: "勤務時間", interview: "面接時に相談",
    responsibilities: "仕事内容", requirements: "応募条件", benefits: "福利厚生",
    additionalInfo: "追加情報", workingHours: "勤務時間", jobInfo: "求人情報",
    missingDetails: "この求人の詳細についてはSanvendoへお問い合わせください。",
    applyTitle: "この求人に応募", applyNote: "先に情報を送信でき、履歴書は任意です。求職者の利用は無料です。",
    submitApplication: "応募を送信", otherJobs: "他の求人を見る", datePosted: "掲載日",
    validThrough: "応募締切", jobId: "求人ID", updating: "更新中",
    hiringCompany: "Sanvendoを通じて採用する企業", footer: "オンデマンド採用・ヘッドハンティング",
    backHome: "ホームへ戻る", unavailable: "求人サービスは一時的に利用できません。",
    notFound: "この求人は現在掲載されていません。", loadError: "求人詳細を読み込めません。", at: "・",
  },

};

export function normalizeLanguage(value) {
  const language = String(value || "").toLowerCase().split("-")[0];
  return SUPPORTED_LANGUAGES.includes(language) ? language : "vi";
}

export function requestLanguage(request) {
  const url = new URL(request.url);
  const explicit = url.searchParams.get("lang");
  if (explicit) return normalizeLanguage(explicit);

  const accepted = request.headers.get("Accept-Language") || "";
  return normalizeLanguage(accepted.split(",")[0]);
}

export function pageText(language = "vi") {
  return PAGE_TEXT[normalizeLanguage(language)];
}

export function categoryLabel(category, language = "vi") {
  const normalized = normalizeLanguage(language);
  return CATEGORY_LABELS[normalized]?.[category] || CATEGORY_LABELS.vi[category] || category || "";
}

export function employmentTypeLabel(type, language = "vi") {
  const normalized = normalizeLanguage(language);
  return EMPLOYMENT_TYPES[normalized]?.[type] || EMPLOYMENT_TYPES.vi[type] || "";
}

export function localizedField(job, field, language = "vi") {
  const normalized = normalizeLanguage(language);
  if (normalized === "vi") return job?.[field] ?? "";
  const value = job?.translations?.[normalized]?.[field];
  if (Array.isArray(value)) return value.length ? value : (job?.[field] || []);
  return String(value || "").trim() || job?.[field] || "";
}

export function localizeJob(job, language = "vi") {
  const localized = { ...job };
  for (const field of [
    "title", "companyName", "location", "experience", "workHours", "summary", "responsibilities",
    "requirements", "benefits", "additionalInfo", "salary", "featuredTags", "targetCandidates", "featuredBadge",
  ]) {
    localized[field] = localizedField(job, field, language);
  }
  localized.categoryLabel = categoryLabel(job?.category, language);
  localized.employmentTypeLabel = employmentTypeLabel(job?.employmentType, language);
  return localized;
}

export function languageUrl(path, language = "vi") {
  const normalized = normalizeLanguage(language);
  const url = new URL(path, "https://sanvendo.com");
  if (normalized !== "vi") url.searchParams.set("lang", normalized);
  return `${url.pathname}${url.search}${url.hash}`;
}
