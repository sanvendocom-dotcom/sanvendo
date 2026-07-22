(() => {
  "use strict";

  const SUPPORTED_LANGUAGES = ["vi", "en", "zh", "ko", "ja"];
  const LOCALES = {
    vi: "vi-VN",
    en: "en-US",
    zh: "zh-CN",
    ko: "ko-KR",
    ja: "ja-JP",
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

  const EMPLOYMENT_TYPE_LABELS = {
    vi: { FULL_TIME: "Toàn thời gian", PART_TIME: "Bán thời gian", CONTRACTOR: "Hợp đồng / cộng tác", TEMPORARY: "Tạm thời", INTERN: "Thực tập", VOLUNTEER: "Tình nguyện", PER_DIEM: "Theo ngày", OTHER: "Khác" },
    en: { FULL_TIME: "Full-time", PART_TIME: "Part-time", CONTRACTOR: "Contract / Freelance", TEMPORARY: "Temporary", INTERN: "Internship", VOLUNTEER: "Volunteer", PER_DIEM: "Per diem", OTHER: "Other" },
    zh: { FULL_TIME: "全职", PART_TIME: "兼职", CONTRACTOR: "合同工 / 合作", TEMPORARY: "临时", INTERN: "实习", VOLUNTEER: "志愿者", PER_DIEM: "按日计薪", OTHER: "其他" },
    ko: { FULL_TIME: "정규직", PART_TIME: "파트타임", CONTRACTOR: "계약직 / 프리랜서", TEMPORARY: "임시직", INTERN: "인턴", VOLUNTEER: "자원봉사", PER_DIEM: "일급제", OTHER: "기타" },
    ja: { FULL_TIME: "正社員", PART_TIME: "パートタイム", CONTRACTOR: "契約・業務委託", TEMPORARY: "臨時雇用", INTERN: "インターン", VOLUNTEER: "ボランティア", PER_DIEM: "日給", OTHER: "その他" },
  };

  const TEXT = {
    en: {
      "Mở menu": "Open menu",
      "Đóng": "Close",
      "Ngành nghề": "Industries",
      "Dịch vụ": "Services",
      "Việc làm": "Jobs",
      "Quy trình": "Process",
      "Ứng viên": "Candidates",
      "Gửi CV": "Submit CV",
      "Đăng yêu cầu tuyển dụng": "Submit a hiring request",
      "Tìm đúng người cho đúng vị trí.": "Find the right person for the right role.",
      "Sanvendo tìm kiếm, sàng lọc và giới thiệu ứng viên theo yêu cầu. Doanh nghiệp trực tiếp lựa chọn, ký hợp đồng và quản lý nhân sự.": "Sanvendo sources, screens and introduces candidates based on your requirements. Employers select, hire and manage employees directly.",
      "Bạn đang cần tuyển vị trí nào?": "Which role are you hiring for?",
      "Tìm nhân sự": "Find talent",
      "Phổ biến:": "Popular:",
      "Kinh doanh": "Sales",
      "Kế toán": "Accounting",
      "Kỹ thuật": "Engineering",
      "Phản hồi yêu cầu ban đầu": "Initial response time",
      "Phí dịch vụ theo thỏa thuận": "Agreed service fee",
      "Trực tiếp": "Direct",
      "Doanh nghiệp ký hợp đồng với ứng viên": "Employer signs directly with the candidate",
      "Yêu cầu đang được quan tâm": "Featured hiring request",
      "Mới": "New",
      "Trưởng phòng Kinh doanh": "Sales Manager",
      "TP. Hồ Chí Minh · Toàn thời gian": "Ho Chi Minh City · Full-time",
      "Quản lý đội nhóm": "Team management",
      "Mức lương": "Salary",
      "Thỏa thuận": "Negotiable",
      "Hồ sơ mục tiêu": "Target profiles",
      "5–8 ứng viên": "5–8 candidates",
      "Gửi yêu cầu tương tự": "Request similar talent",
      "Sàng lọc trước": "Pre-screened",
      "Chỉ giới thiệu hồ sơ phù hợp tiêu chí.": "Only profiles matching your criteria are introduced.",
      "Chính sách thay thế": "Replacement policy",
      "Áp dụng theo gói dịch vụ đã thống nhất.": "Applied according to the agreed service package.",
      "Phù hợp cho doanh nghiệp cần tuyển:": "Suitable for employers hiring:",
      "Nhân viên": "Staff",
      "Chuyên viên": "Specialists",
      "Quản lý": "Managers",
      "Tuyển số lượng": "High-volume hiring",
      "Vị trí khó tuyển": "Hard-to-fill roles",
      "Khám phá theo lĩnh vực": "Explore by industry",
      "Tìm nhân sự theo ngành nghề": "Find talent by industry",
      "Xem tất cả vị trí →": "View all roles →",
      "Đang tải tin...": "Loading jobs...",
      "Giải pháp tuyển dụng": "Recruitment solutions",
      "Chọn dịch vụ phù hợp với nhu cầu": "Choose the right service for your needs",
      "Sanvendo triển khai theo vị trí, độ khó, số lượng và thời gian doanh nghiệp cần nhân sự.": "Sanvendo tailors delivery to the role, difficulty, hiring volume and required timeline.",
      "Tuyển dụng tiêu chuẩn": "Standard recruitment",
      "Tìm kiếm và sàng lọc các vị trí nhân viên, chuyên viên phổ biến.": "Source and screen candidates for common staff and specialist roles.",
      "Tiếp nhận và phân tích JD": "Receive and analyze the job description",
      "Tìm kiếm ứng viên phù hợp": "Source suitable candidates",
      "Sàng lọc và xác nhận nhu cầu": "Screen candidates and confirm interest",
      "Nhận báo giá →": "Get a quote →",
      "Phổ biến": "Popular",
      "Headhunting chuyên sâu": "Specialized headhunting",
      "Chủ động tiếp cận ứng viên giỏi cho vị trí chuyên môn hoặc quản lý.": "Proactively approach strong candidates for specialist or management roles.",
      "Phân tích thị trường ứng viên": "Analyze the candidate market",
      "Tìm kiếm và tiếp cận chủ động": "Proactive sourcing and outreach",
      "Báo cáo hồ sơ chi tiết": "Detailed candidate reports",
      "Trao đổi nhu cầu →": "Discuss your needs →",
      "Tuyển dụng số lượng": "High-volume recruitment",
      "Phù hợp với bán lẻ, sản xuất, kho vận hoặc mở rộng chi nhánh.": "Ideal for retail, manufacturing, logistics or branch expansion.",
      "Lập kế hoạch nguồn ứng viên": "Plan candidate sourcing",
      "Sàng lọc tập trung": "Centralized screening",
      "Theo dõi quá trình nhận việc": "Track onboarding progress",
      "Gửi nhu cầu →": "Send requirements →",
      "Vị trí tham khảo": "Featured roles",
      "Các nhu cầu tuyển dụng nổi bật": "Highlighted hiring needs",
      "Lọc theo vị trí hoặc ngành...": "Filter by role or industry...",
      "Lọc theo địa điểm": "Filter by location",
      "Tất cả địa điểm": "All locations",
      "Đang tải tin tuyển dụng...": "Loading job listings...",
      "Không tìm thấy vị trí phù hợp với bộ lọc hiện tại.": "No roles match the current filters.",
      "Quy trình minh bạch": "Transparent process",
      "Từ yêu cầu tuyển dụng đến nhân sự nhận việc": "From hiring request to successful onboarding",
      "Bắt đầu tuyển dụng": "Start hiring",
      "Gửi yêu cầu": "Submit request",
      "Doanh nghiệp cung cấp vị trí, tiêu chí, mức lương và thời gian cần nhân sự.": "The employer provides the role, criteria, salary and required timeline.",
      "Thống nhất phương án": "Agree on the approach",
      "Sanvendo xác nhận phạm vi dịch vụ, phí, thời gian và chính sách thay thế.": "Sanvendo confirms service scope, fee, timeline and replacement policy.",
      "Tìm và sàng lọc": "Source and screen",
      "Ứng viên được tiếp cận, kiểm tra thông tin và đánh giá mức độ phù hợp.": "Candidates are approached, verified and assessed for fit.",
      "Tuyển dụng trực tiếp": "Direct hiring",
      "Doanh nghiệp phỏng vấn, lựa chọn và ký hợp đồng trực tiếp với ứng viên.": "The employer interviews, selects and signs directly with the candidate.",
      "Dành cho ứng viên": "For candidates",
      "Cơ hội phù hợp có thể đang chờ bạn.": "The right opportunity may be waiting for you.",
      "Tạo hồ sơ để Sanvendo có thể giới thiệu bạn đến các doanh nghiệp có nhu cầu phù hợp. Ứng viên không phải trả phí.": "Create a profile so Sanvendo can introduce you to suitable employers. Candidates never pay a fee.",
      "Tải CV lên": "Upload CV",
      "Xem việc làm": "View jobs",
      "Hồ sơ của bạn được bảo mật": "Your profile is kept confidential",
      "Chỉ chuyển đến nhà tuyển dụng trong phạm vi phù hợp và theo sự đồng ý.": "Shared only with suitable employers and with your consent.",
      "Miễn phí tạo hồ sơ": "Free profile submission",
      "Chủ động lựa chọn cơ hội": "Choose opportunities proactively",
      "Ký hợp đồng trực tiếp với doanh nghiệp": "Sign directly with the employer",
      "Câu hỏi thường gặp": "Frequently asked questions",
      "Thông tin doanh nghiệp thường quan tâm": "What employers often ask",
      "Sanvendo có trực tiếp ký hợp đồng lao động với ứng viên không?": "Does Sanvendo sign employment contracts directly with candidates?",
      "Không. Trong mô hình tuyển dụng trực tiếp, doanh nghiệp tuyển dụng sẽ lựa chọn và ký hợp đồng lao động trực tiếp với ứng viên.": "No. Under the direct-hire model, the employer selects the candidate and signs the employment contract directly.",
      "Doanh nghiệp thanh toán phí khi nào?": "When does the employer pay the fee?",
      "Thời điểm và điều kiện thanh toán được quy định trong hợp đồng dịch vụ. Phí thường phát sinh khi ứng viên đáp ứng điều kiện tuyển dụng thành công.": "Payment timing and conditions are stated in the service agreement. Fees usually become due when the candidate meets the agreed successful-hire conditions.",
      "Sanvendo có chính sách thay thế nhân sự không?": "Does Sanvendo offer a replacement policy?",
      "Có thể áp dụng tùy theo gói dịch vụ, vị trí tuyển dụng và điều kiện đã được hai bên thống nhất.": "It may apply depending on the service package, role and terms agreed by both parties.",
      "Ứng viên có phải trả phí không?": "Do candidates pay a fee?",
      "Không. Ứng viên không phải trả phí để gửi CV, ứng tuyển hoặc được giới thiệu đến doanh nghiệp.": "No. Candidates do not pay to submit a CV, apply or be introduced to employers.",
      "Bắt đầu ngay": "Get started",
      "Để Sanvendo tìm kiếm nhân sự phù hợp cho doanh nghiệp của bạn.": "Let Sanvendo find the right talent for your business.",
      "Đối tác tuyển dụng theo yêu cầu cho doanh nghiệp.": "On-demand recruitment partner for employers.",
      "Dành cho doanh nghiệp": "For employers",
      "Dịch vụ tuyển dụng": "Recruitment services",
      "Nhận báo giá": "Get a quote",
      "Tìm việc làm": "Find jobs",
      "Quyền lợi ứng viên": "Candidate benefits",
      "Thông tin": "Information",
      "Giới thiệu": "About us",
      "Chính sách bảo mật": "Privacy policy",
      "Chính sách bảo mật & lưu dữ liệu": "Privacy & data storage",
      "Hồ sơ được lưu trong kho R2 riêng tư của hệ thống.": "Profiles are stored in the system’s private R2 storage.",
      "Điều khoản sử dụng": "Terms of use",
      "Tin tuyển dụng": "Job listing",
      "Chi tiết công việc": "Job details",
      "Kinh nghiệm": "Experience",
      "Không yêu cầu": "Not required",
      "Thời gian làm việc": "Working hours",
      "Trao đổi khi phỏng vấn": "Discussed during the interview",
      "Mô tả công việc": "Responsibilities",
      "Yêu cầu ứng viên": "Candidate requirements",
      "Quyền lợi": "Benefits",
      "Thông tin bổ sung": "Additional information",
      "Nội dung chi tiết đang được cập nhật. Bạn vẫn có thể gửi đơn để Sanvendo liên hệ thêm.": "Detailed information is being updated. You can still apply and Sanvendo will contact you.",
      "Ứng tuyển vị trí này": "Apply for this role",
      "Gửi yêu cầu tuyển dụng": "Submit a hiring request",
      "Điền thông tin cơ bản. Sanvendo sẽ liên hệ để xác nhận nhu cầu và báo giá.": "Provide the basic details. Sanvendo will contact you to confirm the requirements and quotation.",
      "Tên doanh nghiệp *": "Company name *",
      "Người liên hệ *": "Contact person *",
      "Số điện thoại *": "Phone number *",
      "Email công việc *": "Work email *",
      "Vị trí cần tuyển *": "Role to hire *",
      "Số lượng": "Quantity",
      "Địa điểm làm việc": "Work location",
      "Mức lương dự kiến": "Expected salary",
      "Thời gian cần nhân sự": "Required hiring timeline",
      "Ví dụ: trong 30 ngày": "Example: within 30 days",
      "Mô tả yêu cầu": "Requirements description",
      "Tôi đồng ý để Sanvendo liên hệ tư vấn về yêu cầu tuyển dụng này.": "I agree that Sanvendo may contact me about this hiring request.",
      "Đã nhận yêu cầu tuyển dụng": "Hiring request received",
      "Mã yêu cầu:": "Request ID:",
      "Sanvendo sẽ liên hệ để xác nhận nhu cầu và báo giá.": "Sanvendo will contact you to confirm the requirements and quotation.",
      "Gửi hồ sơ ứng viên": "Submit candidate profile",
      "Bạn có thể gửi đơn ứng tuyển trước, không bắt buộc phải có CV. Ứng viên không phải trả phí.": "You may apply without a CV and add it later. Candidates never pay a fee.",
      "Họ và tên *": "Full name *",
      "Email *": "Email *",
      "Vị trí mong muốn": "Desired position",
      "Khu vực làm việc": "Preferred work location",
      "File CV (không bắt buộc)": "CV file (optional)",
      "Có thể gửi hồ sơ trước và bổ sung CV sau. Nếu tải lên: PDF, DOC hoặc DOCX, tối đa 10 MB.": "You may submit first and add a CV later. When uploaded: PDF, DOC or DOCX, up to 10 MB.",
      "Tôi đồng ý để Sanvendo xử lý hồ sơ và giới thiệu đến nhà tuyển dụng phù hợp.": "I agree that Sanvendo may process my profile and introduce it to suitable employers.",
      "Gửi đơn ứng tuyển": "Submit application",
      "Đơn ứng tuyển đã được gửi thành công": "Application submitted successfully",
      "Mã đơn:": "Application ID:",
      "Sanvendo sẽ liên hệ khi có cơ hội phù hợp.": "Sanvendo will contact you when a suitable opportunity is available.",
      "Lưu vị trí": "Save role",
      "Xem chi tiết": "View details",
      "Ứng tuyển": "Apply",
      "Xem nội dung công việc, yêu cầu và quyền lợi của vị trí này.": "View the responsibilities, requirements and benefits for this role.",
      "Vị trí tuyển dụng": "Open position",
      "Đã lưu vị trí.": "Role saved.",
      "Đã bỏ lưu vị trí.": "Role removed from saved jobs.",
      "Đang gửi yêu cầu...": "Submitting request...",
      "Đang gửi hồ sơ...": "Submitting application...",
      "Chỉ chấp nhận file PDF, DOC hoặc DOCX.": "Only PDF, DOC or DOCX files are accepted.",
      "Dung lượng CV tối đa là 10 MB.": "The maximum CV size is 10 MB.",
      "Hồ sơ và CV đã được gửi thành công": "Profile and CV submitted successfully",
      "Mã hồ sơ:": "Profile ID:",
      "Đã tiếp nhận": "Received",
      "Không thể tải tin tuyển dụng. Vui lòng thử lại.": "Unable to load job listings. Please try again.",
      "Máy chủ trả về phản hồi không hợp lệ.": "The server returned an invalid response.",
      "Không thể gửi yêu cầu. Vui lòng thử lại.": "Unable to submit the request. Please try again.",
      "Không thể gửi hồ sơ. Vui lòng thử lại.": "Unable to submit the application. Please try again."
    },
    zh: {
      "Mở menu": "打开菜单", "Đóng": "关闭", "Ngành nghề": "行业", "Dịch vụ": "服务", "Việc làm": "职位", "Quy trình": "流程", "Ứng viên": "求职者", "Gửi CV": "提交简历", "Đăng yêu cầu tuyển dụng": "提交招聘需求",
      "Tìm đúng người cho đúng vị trí.": "为合适的岗位找到合适的人才。", "Sanvendo tìm kiếm, sàng lọc và giới thiệu ứng viên theo yêu cầu. Doanh nghiệp trực tiếp lựa chọn, ký hợp đồng và quản lý nhân sự.": "Sanvendo 根据企业需求搜寻、筛选并推荐候选人。企业直接选择、签约并管理员工。", "Bạn đang cần tuyển vị trí nào?": "您正在招聘什么职位？", "Tìm nhân sự": "寻找人才", "Phổ biến:": "热门：", "Kinh doanh": "销售", "Kế toán": "会计", "Kỹ thuật": "工程", "Phản hồi yêu cầu ban đầu": "首次响应时间", "Phí dịch vụ theo thỏa thuận": "服务费按约定", "Trực tiếp": "直接", "Doanh nghiệp ký hợp đồng với ứng viên": "企业与候选人直接签约",
      "Yêu cầu đang được quan tâm": "热门招聘需求", "Mới": "最新", "Trưởng phòng Kinh doanh": "销售经理", "TP. Hồ Chí Minh · Toàn thời gian": "胡志明市 · 全职", "Quản lý đội nhóm": "团队管理", "Mức lương": "薪资", "Thỏa thuận": "面议", "Hồ sơ mục tiêu": "目标人选", "5–8 ứng viên": "5–8名候选人", "Gửi yêu cầu tương tự": "提交类似需求", "Sàng lọc trước": "预先筛选", "Chỉ giới thiệu hồ sơ phù hợp tiêu chí.": "仅推荐符合条件的候选人。", "Chính sách thay thế": "替换保障", "Áp dụng theo gói dịch vụ đã thống nhất.": "根据双方约定的服务方案执行。",
      "Phù hợp cho doanh nghiệp cần tuyển:": "适合招聘以下人才的企业：", "Nhân viên": "员工", "Chuyên viên": "专业人员", "Quản lý": "管理人员", "Tuyển số lượng": "批量招聘", "Vị trí khó tuyển": "难招职位", "Khám phá theo lĩnh vực": "按行业浏览", "Tìm nhân sự theo ngành nghề": "按行业寻找人才", "Xem tất cả vị trí →": "查看全部职位 →", "Đang tải tin...": "正在加载职位…",
      "Giải pháp tuyển dụng": "招聘解决方案", "Chọn dịch vụ phù hợp với nhu cầu": "选择适合您需求的服务", "Sanvendo triển khai theo vị trí, độ khó, số lượng và thời gian doanh nghiệp cần nhân sự.": "Sanvendo 根据职位、招聘难度、人数和时间要求制定方案。", "Tuyển dụng tiêu chuẩn": "标准招聘", "Tìm kiếm và sàng lọc các vị trí nhân viên, chuyên viên phổ biến.": "为常见员工和专业岗位搜寻并筛选候选人。", "Tiếp nhận và phân tích JD": "接收并分析职位说明", "Tìm kiếm ứng viên phù hợp": "寻找合适候选人", "Sàng lọc và xác nhận nhu cầu": "筛选并确认求职意向", "Nhận báo giá →": "获取报价 →", "Phổ biến": "热门", "Headhunting chuyên sâu": "专业猎头", "Chủ động tiếp cận ứng viên giỏi cho vị trí chuyên môn hoặc quản lý.": "主动接触适合专业或管理岗位的优秀人才。", "Phân tích thị trường ứng viên": "分析人才市场", "Tìm kiếm và tiếp cận chủ động": "主动搜寻与联系", "Báo cáo hồ sơ chi tiết": "详细候选人报告", "Trao đổi nhu cầu →": "沟通招聘需求 →", "Tuyển dụng số lượng": "批量招聘", "Phù hợp với bán lẻ, sản xuất, kho vận hoặc mở rộng chi nhánh.": "适用于零售、生产、物流或门店扩张。", "Lập kế hoạch nguồn ứng viên": "规划人才来源", "Sàng lọc tập trung": "集中筛选", "Theo dõi quá trình nhận việc": "跟进入职流程", "Gửi nhu cầu →": "提交需求 →",
      "Vị trí tham khảo": "精选职位", "Các nhu cầu tuyển dụng nổi bật": "重点招聘需求", "Lọc theo vị trí hoặc ngành...": "按职位或行业筛选…", "Lọc theo địa điểm": "按地点筛选", "Tất cả địa điểm": "所有地点", "Đang tải tin tuyển dụng...": "正在加载招聘信息…", "Không tìm thấy vị trí phù hợp với bộ lọc hiện tại.": "当前筛选条件下没有匹配的职位。",
      "Quy trình minh bạch": "透明流程", "Từ yêu cầu tuyển dụng đến nhân sự nhận việc": "从招聘需求到员工入职", "Bắt đầu tuyển dụng": "开始招聘", "Gửi yêu cầu": "提交需求", "Doanh nghiệp cung cấp vị trí, tiêu chí, mức lương và thời gian cần nhân sự.": "企业提供职位、标准、薪资和招聘时间。", "Thống nhất phương án": "确认方案", "Sanvendo xác nhận phạm vi dịch vụ, phí, thời gian và chính sách thay thế.": "Sanvendo 确认服务范围、费用、时间和替换政策。", "Tìm và sàng lọc": "搜寻与筛选", "Ứng viên được tiếp cận, kiểm tra thông tin và đánh giá mức độ phù hợp.": "联系候选人、核实信息并评估匹配度。", "Tuyển dụng trực tiếp": "直接招聘", "Doanh nghiệp phỏng vấn, lựa chọn và ký hợp đồng trực tiếp với ứng viên.": "企业直接面试、选择并与候选人签约。",
      "Dành cho ứng viên": "求职者专区", "Cơ hội phù hợp có thể đang chờ bạn.": "适合您的机会可能正在等待。", "Tạo hồ sơ để Sanvendo có thể giới thiệu bạn đến các doanh nghiệp có nhu cầu phù hợp. Ứng viên không phải trả phí.": "提交个人资料，Sanvendo 可向有合适需求的企业推荐您。求职者无需付费。", "Tải CV lên": "上传简历", "Xem việc làm": "查看职位", "Hồ sơ của bạn được bảo mật": "您的资料将被保密", "Chỉ chuyển đến nhà tuyển dụng trong phạm vi phù hợp và theo sự đồng ý.": "仅在匹配且获得您同意的情况下提供给雇主。", "Miễn phí tạo hồ sơ": "免费提交资料", "Chủ động lựa chọn cơ hội": "自主选择机会", "Ký hợp đồng trực tiếp với doanh nghiệp": "与企业直接签约",
      "Câu hỏi thường gặp": "常见问题", "Thông tin doanh nghiệp thường quan tâm": "企业常见问题", "Sanvendo có trực tiếp ký hợp đồng lao động với ứng viên không?": "Sanvendo 会直接与候选人签订劳动合同吗？", "Không. Trong mô hình tuyển dụng trực tiếp, doanh nghiệp tuyển dụng sẽ lựa chọn và ký hợp đồng lao động trực tiếp với ứng viên.": "不会。在直接招聘模式下，由招聘企业选择候选人并直接签订劳动合同。", "Doanh nghiệp thanh toán phí khi nào?": "企业何时支付服务费？", "Thời điểm và điều kiện thanh toán được quy định trong hợp đồng dịch vụ. Phí thường phát sinh khi ứng viên đáp ứng điều kiện tuyển dụng thành công.": "付款时间和条件以服务合同为准。通常在候选人达到约定的成功招聘条件后产生费用。", "Sanvendo có chính sách thay thế nhân sự không?": "Sanvendo 是否提供人员替换政策？", "Có thể áp dụng tùy theo gói dịch vụ, vị trí tuyển dụng và điều kiện đã được hai bên thống nhất.": "可根据服务方案、招聘职位及双方约定条件执行。", "Ứng viên có phải trả phí không?": "求职者需要付费吗？", "Không. Ứng viên không phải trả phí để gửi CV, ứng tuyển hoặc được giới thiệu đến doanh nghiệp.": "不需要。求职者提交简历、申请职位或被推荐给企业均无需付费。",
      "Bắt đầu ngay": "立即开始", "Để Sanvendo tìm kiếm nhân sự phù hợp cho doanh nghiệp của bạn.": "让 Sanvendo 为您的企业寻找合适人才。", "Đối tác tuyển dụng theo yêu cầu cho doanh nghiệp.": "企业按需招聘合作伙伴。", "Dành cho doanh nghiệp": "企业专区", "Dịch vụ tuyển dụng": "招聘服务", "Nhận báo giá": "获取报价", "Tìm việc làm": "寻找工作", "Quyền lợi ứng viên": "求职者权益", "Thông tin": "信息", "Giới thiệu": "关于我们", "Chính sách bảo mật": "隐私政策", "Chính sách bảo mật & lưu dữ liệu": "隐私政策与数据存储", "Hồ sơ được lưu trong kho R2 riêng tư của hệ thống.": "资料保存在系统的私有 R2 存储中。", "Điều khoản sử dụng": "使用条款",
      "Tin tuyển dụng": "招聘信息", "Chi tiết công việc": "职位详情", "Kinh nghiệm": "经验", "Không yêu cầu": "不限", "Thời gian làm việc": "工作时间", "Trao đổi khi phỏng vấn": "面试时沟通", "Mô tả công việc": "工作职责", "Yêu cầu ứng viên": "任职要求", "Quyền lợi": "福利待遇", "Thông tin bổ sung": "补充信息", "Nội dung chi tiết đang được cập nhật. Bạn vẫn có thể gửi đơn để Sanvendo liên hệ thêm.": "职位详情正在更新。您仍可提交申请，Sanvendo 将与您联系。", "Ứng tuyển vị trí này": "申请此职位",
      "Gửi yêu cầu tuyển dụng": "提交招聘需求", "Điền thông tin cơ bản. Sanvendo sẽ liên hệ để xác nhận nhu cầu và báo giá.": "填写基本信息，Sanvendo 将联系您确认需求并提供报价。", "Tên doanh nghiệp *": "企业名称 *", "Người liên hệ *": "联系人 *", "Số điện thoại *": "电话号码 *", "Email công việc *": "工作邮箱 *", "Vị trí cần tuyển *": "招聘职位 *", "Số lượng": "人数", "Địa điểm làm việc": "工作地点", "Mức lương dự kiến": "预计薪资", "Thời gian cần nhân sự": "到岗时间要求", "Ví dụ: trong 30 ngày": "例如：30天内", "Mô tả yêu cầu": "需求说明", "Tôi đồng ý để Sanvendo liên hệ tư vấn về yêu cầu tuyển dụng này.": "我同意 Sanvendo 就此招聘需求与我联系。", "Đã nhận yêu cầu tuyển dụng": "已收到招聘需求", "Mã yêu cầu:": "需求编号：", "Sanvendo sẽ liên hệ để xác nhận nhu cầu và báo giá.": "Sanvendo 将联系您确认需求并提供报价。",
      "Gửi hồ sơ ứng viên": "提交求职资料", "Bạn có thể gửi đơn ứng tuyển trước, không bắt buộc phải có CV. Ứng viên không phải trả phí.": "您可以先申请，简历不是必填项。求职者无需付费。", "Họ và tên *": "姓名 *", "Email *": "邮箱 *", "Vị trí mong muốn": "期望职位", "Khu vực làm việc": "期望工作地点", "File CV (không bắt buộc)": "简历文件（可选）", "Có thể gửi hồ sơ trước và bổ sung CV sau. Nếu tải lên: PDF, DOC hoặc DOCX, tối đa 10 MB.": "可先提交资料，之后补充简历。支持 PDF、DOC 或 DOCX，最大 10 MB。", "Tôi đồng ý để Sanvendo xử lý hồ sơ và giới thiệu đến nhà tuyển dụng phù hợp.": "我同意 Sanvendo 处理我的资料并推荐给合适的雇主。", "Gửi đơn ứng tuyển": "提交申请", "Đơn ứng tuyển đã được gửi thành công": "申请提交成功", "Mã đơn:": "申请编号：", "Sanvendo sẽ liên hệ khi có cơ hội phù hợp.": "有合适机会时，Sanvendo 将与您联系。",
      "Lưu vị trí": "收藏职位", "Xem chi tiết": "查看详情", "Ứng tuyển": "申请", "Xem nội dung công việc, yêu cầu và quyền lợi của vị trí này.": "查看该职位的职责、要求和福利。", "Vị trí tuyển dụng": "招聘职位", "Đã lưu vị trí.": "已收藏职位。", "Đã bỏ lưu vị trí.": "已取消收藏。", "Đang gửi yêu cầu...": "正在提交需求…", "Đang gửi hồ sơ...": "正在提交申请…", "Chỉ chấp nhận file PDF, DOC hoặc DOCX.": "仅支持 PDF、DOC 或 DOCX 文件。", "Dung lượng CV tối đa là 10 MB.": "简历文件最大为 10 MB。", "Hồ sơ và CV đã được gửi thành công": "资料和简历提交成功", "Mã hồ sơ:": "资料编号：", "Đã tiếp nhận": "已接收", "Không thể tải tin tuyển dụng. Vui lòng thử lại.": "无法加载招聘信息，请重试。", "Máy chủ trả về phản hồi không hợp lệ.": "服务器返回了无效响应。", "Không thể gửi yêu cầu. Vui lòng thử lại.": "无法提交需求，请重试。", "Không thể gửi hồ sơ. Vui lòng thử lại.": "无法提交申请，请重试。"
    },
    ko: {
      "Mở menu": "메뉴 열기", "Đóng": "닫기", "Ngành nghề": "직무 분야", "Dịch vụ": "서비스", "Việc làm": "채용공고", "Quy trình": "진행 절차", "Ứng viên": "지원자", "Gửi CV": "이력서 제출", "Đăng yêu cầu tuyển dụng": "채용 요청 등록",
      "Tìm đúng người cho đúng vị trí.": "적합한 직무에 적합한 인재를 찾습니다.", "Sanvendo tìm kiếm, sàng lọc và giới thiệu ứng viên theo yêu cầu. Doanh nghiệp trực tiếp lựa chọn, ký hợp đồng và quản lý nhân sự.": "Sanvendo는 기업의 요구에 맞춰 후보자를 발굴하고 선별해 추천합니다. 기업이 직접 선택하고 계약하며 인력을 관리합니다.", "Bạn đang cần tuyển vị trí nào?": "어떤 직무를 채용하고 계신가요?", "Tìm nhân sự": "인재 찾기", "Phổ biến:": "인기 검색:", "Kinh doanh": "영업", "Kế toán": "회계", "Kỹ thuật": "기술", "Phản hồi yêu cầu ban đầu": "최초 응답 시간", "Phí dịch vụ theo thỏa thuận": "협의된 서비스 비용", "Trực tiếp": "직접", "Doanh nghiệp ký hợp đồng với ứng viên": "기업이 지원자와 직접 계약",
      "Yêu cầu đang được quan tâm": "주요 채용 요청", "Mới": "신규", "Trưởng phòng Kinh doanh": "영업팀장", "TP. Hồ Chí Minh · Toàn thời gian": "호찌민시 · 정규직", "Quản lý đội nhóm": "팀 관리", "Mức lương": "급여", "Thỏa thuận": "협의", "Hồ sơ mục tiêu": "목표 후보자", "5–8 ứng viên": "후보자 5–8명", "Gửi yêu cầu tương tự": "유사 인재 요청", "Sàng lọc trước": "사전 선별", "Chỉ giới thiệu hồ sơ phù hợp tiêu chí.": "조건에 맞는 후보자만 추천합니다.", "Chính sách thay thế": "대체 보장 정책", "Áp dụng theo gói dịch vụ đã thống nhất.": "합의된 서비스 패키지에 따라 적용됩니다.",
      "Phù hợp cho doanh nghiệp cần tuyển:": "다음 인재를 채용하는 기업에 적합:", "Nhân viên": "직원", "Chuyên viên": "전문가", "Quản lý": "관리자", "Tuyển số lượng": "대규모 채용", "Vị trí khó tuyển": "채용 난도가 높은 직무", "Khám phá theo lĩnh vực": "분야별 탐색", "Tìm nhân sự theo ngành nghề": "직무 분야별 인재 찾기", "Xem tất cả vị trí →": "전체 직무 보기 →", "Đang tải tin...": "채용공고 불러오는 중…",
      "Giải pháp tuyển dụng": "채용 솔루션", "Chọn dịch vụ phù hợp với nhu cầu": "필요에 맞는 서비스를 선택하세요", "Sanvendo triển khai theo vị trí, độ khó, số lượng và thời gian doanh nghiệp cần nhân sự.": "Sanvendo는 직무, 난이도, 채용 규모와 필요한 일정에 맞춰 진행합니다.", "Tuyển dụng tiêu chuẩn": "일반 채용", "Tìm kiếm và sàng lọc các vị trí nhân viên, chuyên viên phổ biến.": "일반 직원 및 전문 직무의 후보자를 발굴하고 선별합니다.", "Tiếp nhận và phân tích JD": "직무기술서 접수 및 분석", "Tìm kiếm ứng viên phù hợp": "적합한 후보자 발굴", "Sàng lọc và xác nhận nhu cầu": "선별 및 지원 의사 확인", "Nhận báo giá →": "견적 받기 →", "Phổ biến": "인기", "Headhunting chuyên sâu": "전문 헤드헌팅", "Chủ động tiếp cận ứng viên giỏi cho vị trí chuyên môn hoặc quản lý.": "전문직 및 관리직의 우수 인재에게 적극적으로 접근합니다.", "Phân tích thị trường ứng viên": "인재 시장 분석", "Tìm kiếm và tiếp cận chủ động": "적극적인 인재 발굴 및 접촉", "Báo cáo hồ sơ chi tiết": "상세 후보자 리포트", "Trao đổi nhu cầu →": "채용 요구 상담 →", "Tuyển dụng số lượng": "대규모 채용", "Phù hợp với bán lẻ, sản xuất, kho vận hoặc mở rộng chi nhánh.": "소매, 생산, 물류 또는 지점 확장에 적합합니다.", "Lập kế hoạch nguồn ứng viên": "후보자 소싱 계획", "Sàng lọc tập trung": "집중 선별", "Theo dõi quá trình nhận việc": "입사 과정 추적", "Gửi nhu cầu →": "요청 보내기 →",
      "Vị trí tham khảo": "추천 직무", "Các nhu cầu tuyển dụng nổi bật": "주요 채용 수요", "Lọc theo vị trí hoặc ngành...": "직무 또는 분야로 검색…", "Lọc theo địa điểm": "근무지 필터", "Tất cả địa điểm": "전체 지역", "Đang tải tin tuyển dụng...": "채용공고 불러오는 중…", "Không tìm thấy vị trí phù hợp với bộ lọc hiện tại.": "현재 조건에 맞는 채용공고가 없습니다.",
      "Quy trình minh bạch": "투명한 절차", "Từ yêu cầu tuyển dụng đến nhân sự nhận việc": "채용 요청부터 입사까지", "Bắt đầu tuyển dụng": "채용 시작", "Gửi yêu cầu": "요청 제출", "Doanh nghiệp cung cấp vị trí, tiêu chí, mức lương và thời gian cần nhân sự.": "기업이 직무, 기준, 급여와 필요한 일정을 제공합니다.", "Thống nhất phương án": "진행 방식 합의", "Sanvendo xác nhận phạm vi dịch vụ, phí, thời gian và chính sách thay thế.": "Sanvendo가 서비스 범위, 비용, 일정과 대체 정책을 확인합니다.", "Tìm và sàng lọc": "발굴 및 선별", "Ứng viên được tiếp cận, kiểm tra thông tin và đánh giá mức độ phù hợp.": "후보자에게 연락하고 정보를 확인한 뒤 적합도를 평가합니다.", "Tuyển dụng trực tiếp": "직접 채용", "Doanh nghiệp phỏng vấn, lựa chọn và ký hợp đồng trực tiếp với ứng viên.": "기업이 후보자를 직접 면접하고 선택하여 계약합니다.",
      "Dành cho ứng viên": "지원자용", "Cơ hội phù hợp có thể đang chờ bạn.": "당신에게 맞는 기회가 기다리고 있을 수 있습니다.", "Tạo hồ sơ để Sanvendo có thể giới thiệu bạn đến các doanh nghiệp có nhu cầu phù hợp. Ứng viên không phải trả phí.": "프로필을 등록하면 Sanvendo가 적합한 채용 수요가 있는 기업에 추천할 수 있습니다. 지원자는 비용을 내지 않습니다.", "Tải CV lên": "이력서 업로드", "Xem việc làm": "채용공고 보기", "Hồ sơ của bạn được bảo mật": "프로필은 안전하게 보호됩니다", "Chỉ chuyển đến nhà tuyển dụng trong phạm vi phù hợp và theo sự đồng ý.": "적합한 범위에서 동의를 받은 경우에만 기업에 전달됩니다.", "Miễn phí tạo hồ sơ": "무료 프로필 등록", "Chủ động lựa chọn cơ hội": "기회를 직접 선택", "Ký hợp đồng trực tiếp với doanh nghiệp": "기업과 직접 계약",
      "Câu hỏi thường gặp": "자주 묻는 질문", "Thông tin doanh nghiệp thường quan tâm": "기업이 자주 묻는 내용", "Sanvendo có trực tiếp ký hợp đồng lao động với ứng viên không?": "Sanvendo가 지원자와 직접 근로계약을 체결하나요?", "Không. Trong mô hình tuyển dụng trực tiếp, doanh nghiệp tuyển dụng sẽ lựa chọn và ký hợp đồng lao động trực tiếp với ứng viên.": "아닙니다. 직접 채용 방식에서는 채용 기업이 후보자를 선택하고 직접 근로계약을 체결합니다.", "Doanh nghiệp thanh toán phí khi nào?": "기업은 언제 비용을 결제하나요?", "Thời điểm và điều kiện thanh toán được quy định trong hợp đồng dịch vụ. Phí thường phát sinh khi ứng viên đáp ứng điều kiện tuyển dụng thành công.": "결제 시점과 조건은 서비스 계약에 규정됩니다. 일반적으로 후보자가 합의된 채용 성공 조건을 충족하면 비용이 발생합니다.", "Sanvendo có chính sách thay thế nhân sự không?": "Sanvendo는 인력 대체 정책이 있나요?", "Có thể áp dụng tùy theo gói dịch vụ, vị trí tuyển dụng và điều kiện đã được hai bên thống nhất.": "서비스 패키지, 채용 직무 및 양측이 합의한 조건에 따라 적용될 수 있습니다.", "Ứng viên có phải trả phí không?": "지원자가 비용을 내야 하나요?", "Không. Ứng viên không phải trả phí để gửi CV, ứng tuyển hoặc được giới thiệu đến doanh nghiệp.": "아닙니다. 지원자는 이력서 제출, 지원 또는 기업 추천에 비용을 내지 않습니다.",
      "Bắt đầu ngay": "지금 시작", "Để Sanvendo tìm kiếm nhân sự phù hợp cho doanh nghiệp của bạn.": "Sanvendo가 귀사에 맞는 인재를 찾도록 하세요.", "Đối tác tuyển dụng theo yêu cầu cho doanh nghiệp.": "기업을 위한 맞춤형 채용 파트너.", "Dành cho doanh nghiệp": "기업용", "Dịch vụ tuyển dụng": "채용 서비스", "Nhận báo giá": "견적 받기", "Tìm việc làm": "일자리 찾기", "Quyền lợi ứng viên": "지원자 혜택", "Thông tin": "정보", "Giới thiệu": "소개", "Chính sách bảo mật": "개인정보 처리방침", "Chính sách bảo mật & lưu dữ liệu": "개인정보 처리방침 및 데이터 저장", "Hồ sơ được lưu trong kho R2 riêng tư của hệ thống.": "프로필은 시스템의 비공개 R2 저장소에 보관됩니다.", "Điều khoản sử dụng": "이용약관",
      "Tin tuyển dụng": "채용공고", "Chi tiết công việc": "직무 상세", "Kinh nghiệm": "경력", "Không yêu cầu": "경력 무관", "Thời gian làm việc": "근무 시간", "Trao đổi khi phỏng vấn": "면접 시 협의", "Mô tả công việc": "주요 업무", "Yêu cầu ứng viên": "지원 자격", "Quyền lợi": "복리후생", "Thông tin bổ sung": "추가 정보", "Nội dung chi tiết đang được cập nhật. Bạn vẫn có thể gửi đơn để Sanvendo liên hệ thêm.": "상세 내용은 업데이트 중입니다. 지금 지원하시면 Sanvendo가 추가 안내를 드립니다.", "Ứng tuyển vị trí này": "이 직무에 지원",
      "Gửi yêu cầu tuyển dụng": "채용 요청 제출", "Điền thông tin cơ bản. Sanvendo sẽ liên hệ để xác nhận nhu cầu và báo giá.": "기본 정보를 입력하면 Sanvendo가 요구사항 확인 및 견적 안내를 위해 연락드립니다.", "Tên doanh nghiệp *": "회사명 *", "Người liên hệ *": "담당자 *", "Số điện thoại *": "전화번호 *", "Email công việc *": "업무용 이메일 *", "Vị trí cần tuyển *": "채용 직무 *", "Số lượng": "인원", "Địa điểm làm việc": "근무지", "Mức lương dự kiến": "예상 급여", "Thời gian cần nhân sự": "필요 채용 일정", "Ví dụ: trong 30 ngày": "예: 30일 이내", "Mô tả yêu cầu": "요구사항 설명", "Tôi đồng ý để Sanvendo liên hệ tư vấn về yêu cầu tuyển dụng này.": "이 채용 요청과 관련해 Sanvendo가 연락하는 것에 동의합니다.", "Đã nhận yêu cầu tuyển dụng": "채용 요청이 접수되었습니다", "Mã yêu cầu:": "요청 번호:", "Sanvendo sẽ liên hệ để xác nhận nhu cầu và báo giá.": "Sanvendo가 요구사항 확인 및 견적 안내를 위해 연락드립니다.",
      "Gửi hồ sơ ứng viên": "지원자 프로필 제출", "Bạn có thể gửi đơn ứng tuyển trước, không bắt buộc phải có CV. Ứng viên không phải trả phí.": "이력서 없이 먼저 지원할 수 있으며 나중에 추가할 수 있습니다. 지원자는 비용을 내지 않습니다.", "Họ và tên *": "이름 *", "Email *": "이메일 *", "Vị trí mong muốn": "희망 직무", "Khu vực làm việc": "희망 근무지", "File CV (không bắt buộc)": "이력서 파일(선택)", "Có thể gửi hồ sơ trước và bổ sung CV sau. Nếu tải lên: PDF, DOC hoặc DOCX, tối đa 10 MB.": "먼저 지원한 뒤 이력서를 추가할 수 있습니다. PDF, DOC 또는 DOCX, 최대 10MB입니다.", "Tôi đồng ý để Sanvendo xử lý hồ sơ và giới thiệu đến nhà tuyển dụng phù hợp.": "Sanvendo가 제 프로필을 처리하고 적합한 기업에 추천하는 것에 동의합니다.", "Gửi đơn ứng tuyển": "지원서 제출", "Đơn ứng tuyển đã được gửi thành công": "지원서가 성공적으로 제출되었습니다", "Mã đơn:": "지원 번호:", "Sanvendo sẽ liên hệ khi có cơ hội phù hợp.": "적합한 기회가 있을 때 Sanvendo가 연락드립니다.",
      "Lưu vị trí": "공고 저장", "Xem chi tiết": "상세 보기", "Ứng tuyển": "지원", "Xem nội dung công việc, yêu cầu và quyền lợi của vị trí này.": "이 직무의 업무, 지원 자격 및 복리후생을 확인하세요.", "Vị trí tuyển dụng": "채용 직무", "Đã lưu vị trí.": "공고를 저장했습니다.", "Đã bỏ lưu vị trí.": "저장한 공고에서 삭제했습니다.", "Đang gửi yêu cầu...": "요청 제출 중…", "Đang gửi hồ sơ...": "지원서 제출 중…", "Chỉ chấp nhận file PDF, DOC hoặc DOCX.": "PDF, DOC 또는 DOCX 파일만 허용됩니다.", "Dung lượng CV tối đa là 10 MB.": "이력서 최대 용량은 10MB입니다.", "Hồ sơ và CV đã được gửi thành công": "프로필과 이력서가 성공적으로 제출되었습니다", "Mã hồ sơ:": "프로필 번호:", "Đã tiếp nhận": "접수 완료", "Không thể tải tin tuyển dụng. Vui lòng thử lại.": "채용공고를 불러올 수 없습니다. 다시 시도해 주세요.", "Máy chủ trả về phản hồi không hợp lệ.": "서버가 올바르지 않은 응답을 반환했습니다.", "Không thể gửi yêu cầu. Vui lòng thử lại.": "요청을 제출할 수 없습니다. 다시 시도해 주세요.", "Không thể gửi hồ sơ. Vui lòng thử lại.": "지원서를 제출할 수 없습니다. 다시 시도해 주세요."
    },
    ja: {
          "Mở menu": "メニューを開く",
          "Đóng": "閉じる",
          "Ngành nghề": "職種",
          "Dịch vụ": "サービス",
          "Việc làm": "求人",
          "Quy trình": "採用プロセス",
          "Ứng viên": "求職者",
          "Gửi CV": "履歴書を送信",
          "Đăng yêu cầu tuyển dụng": "採用依頼を送信",
          "Tìm đúng người cho đúng vị trí.": "適切なポジションに、最適な人材を。",
          "Sanvendo tìm kiếm, sàng lọc và giới thiệu ứng viên theo yêu cầu. Doanh nghiệp trực tiếp lựa chọn, ký hợp đồng và quản lý nhân sự.": "Sanvendoはご要望に応じて候補者を探し、選考してご紹介します。企業が候補者を直接選び、契約し、雇用管理を行います。",
          "Bạn đang cần tuyển vị trí nào?": "どのポジションを採用予定ですか？",
          "Tìm nhân sự": "人材を探す",
          "Phổ biến:": "人気：",
          "Kinh doanh": "営業",
          "Kế toán": "経理",
          "Kỹ thuật": "技術",
          "Phản hồi yêu cầu ban đầu": "初回回答時間",
          "Phí dịch vụ theo thỏa thuận": "合意済みのサービス料金",
          "Trực tiếp": "直接契約",
          "Doanh nghiệp ký hợp đồng với ứng viên": "企業が候補者と直接契約",
          "Yêu cầu đang được quan tâm": "注目の採用依頼",
          "Mới": "新着",
          "Trưởng phòng Kinh doanh": "営業マネージャー",
          "TP. Hồ Chí Minh · Toàn thời gian": "ホーチミン市 · フルタイム",
          "Quản lý đội nhóm": "チームマネジメント",
          "Mức lương": "給与",
          "Thỏa thuận": "応相談",
          "Hồ sơ mục tiêu": "候補者目標",
          "5–8 ứng viên": "候補者5～8名",
          "Gửi yêu cầu tương tự": "同様の人材を依頼",
          "Sàng lọc trước": "事前スクリーニング",
          "Chỉ giới thiệu hồ sơ phù hợp tiêu chí.": "条件に合う候補者のみをご紹介します。",
          "Chính sách thay thế": "代替保証ポリシー",
          "Áp dụng theo gói dịch vụ đã thống nhất.": "合意済みのサービスプランに基づいて適用されます。",
          "Phù hợp cho doanh nghiệp cần tuyển:": "次の採用を行う企業に最適：",
          "Nhân viên": "スタッフ",
          "Chuyên viên": "専門職",
          "Quản lý": "管理職",
          "Tuyển số lượng": "大量採用",
          "Vị trí khó tuyển": "採用難易度の高い職種",
          "Khám phá theo lĩnh vực": "業界から探す",
          "Tìm nhân sự theo ngành nghề": "職種別に人材を探す",
          "Xem tất cả vị trí →": "すべての求人を見る →",
          "Đang tải tin...": "求人を読み込み中…",
          "Giải pháp tuyển dụng": "採用ソリューション",
          "Chọn dịch vụ phù hợp với nhu cầu": "ニーズに合ったサービスを選択",
          "Sanvendo triển khai theo vị trí, độ khó, số lượng và thời gian doanh nghiệp cần nhân sự.": "Sanvendoは職種、難易度、採用人数、必要時期に合わせて対応します。",
          "Tuyển dụng tiêu chuẩn": "標準採用",
          "Tìm kiếm và sàng lọc các vị trí nhân viên, chuyên viên phổ biến.": "一般的なスタッフ・専門職の候補者を探し、選考します。",
          "Tiếp nhận và phân tích JD": "求人票を受領・分析",
          "Tìm kiếm ứng viên phù hợp": "適切な候補者を探す",
          "Sàng lọc và xác nhận nhu cầu": "選考と応募意思の確認",
          "Nhận báo giá →": "見積もりを依頼 →",
          "Phổ biến": "人気",
          "Headhunting chuyên sâu": "専門ヘッドハンティング",
          "Chủ động tiếp cận ứng viên giỏi cho vị trí chuyên môn hoặc quản lý.": "専門職・管理職の優秀な候補者へ積極的にアプローチします。",
          "Phân tích thị trường ứng viên": "候補者市場を分析",
          "Tìm kiếm và tiếp cận chủ động": "積極的な人材探索とアプローチ",
          "Báo cáo hồ sơ chi tiết": "詳細な候補者レポート",
          "Trao đổi nhu cầu →": "採用ニーズを相談 →",
          "Tuyển dụng số lượng": "大量採用",
          "Phù hợp với bán lẻ, sản xuất, kho vận hoặc mở rộng chi nhánh.": "小売、製造、物流、拠点拡大に最適です。",
          "Lập kế hoạch nguồn ứng viên": "候補者ソーシング計画",
          "Sàng lọc tập trung": "集中スクリーニング",
          "Theo dõi quá trình nhận việc": "入社プロセスを追跡",
          "Gửi nhu cầu →": "採用ニーズを送信 →",
          "Vị trí tham khảo": "注目求人",
          "Các nhu cầu tuyển dụng nổi bật": "注目の採用ニーズ",
          "Lọc theo vị trí hoặc ngành...": "職種または業界で絞り込む…",
          "Lọc theo địa điểm": "勤務地で絞り込む",
          "Tất cả địa điểm": "すべての勤務地",
          "Đang tải tin tuyển dụng...": "求人情報を読み込み中…",
          "Không tìm thấy vị trí phù hợp với bộ lọc hiện tại.": "現在の条件に一致する求人はありません。",
          "Quy trình minh bạch": "透明なプロセス",
          "Từ yêu cầu tuyển dụng đến nhân sự nhận việc": "採用依頼から入社まで",
          "Bắt đầu tuyển dụng": "採用を開始",
          "Gửi yêu cầu": "依頼を送信",
          "Doanh nghiệp cung cấp vị trí, tiêu chí, mức lương và thời gian cần nhân sự.": "企業が職種、条件、給与、必要時期を提示します。",
          "Thống nhất phương án": "進め方を合意",
          "Sanvendo xác nhận phạm vi dịch vụ, phí, thời gian và chính sách thay thế.": "Sanvendoがサービス範囲、料金、期間、代替保証を確認します。",
          "Tìm và sàng lọc": "人材探索と選考",
          "Ứng viên được tiếp cận, kiểm tra thông tin và đánh giá mức độ phù hợp.": "候補者へ連絡し、情報を確認して適合度を評価します。",
          "Tuyển dụng trực tiếp": "直接採用",
          "Doanh nghiệp phỏng vấn, lựa chọn và ký hợp đồng trực tiếp với ứng viên.": "企業が候補者を面接・選考し、直接契約します。",
          "Dành cho ứng viên": "求職者向け",
          "Cơ hội phù hợp có thể đang chờ bạn.": "あなたに合う機会が待っているかもしれません。",
          "Tạo hồ sơ để Sanvendo có thể giới thiệu bạn đến các doanh nghiệp có nhu cầu phù hợp. Ứng viên không phải trả phí.": "プロフィールを登録すると、Sanvendoが適切な採用ニーズを持つ企業へご紹介できます。求職者の利用は無料です。",
          "Tải CV lên": "履歴書をアップロード",
          "Xem việc làm": "求人を見る",
          "Hồ sơ của bạn được bảo mật": "プロフィールは安全に保護されます",
          "Chỉ chuyển đến nhà tuyển dụng trong phạm vi phù hợp và theo sự đồng ý.": "適合する範囲で、ご本人の同意を得た場合のみ企業へ共有します。",
          "Miễn phí tạo hồ sơ": "プロフィール登録無料",
          "Chủ động lựa chọn cơ hội": "自分で機会を選択",
          "Ký hợp đồng trực tiếp với doanh nghiệp": "企業と直接契約",
          "Câu hỏi thường gặp": "よくある質問",
          "Thông tin doanh nghiệp thường quan tâm": "企業からよくある質問",
          "Sanvendo có trực tiếp ký hợp đồng lao động với ứng viên không?": "Sanvendoが候補者と直接雇用契約を結びますか？",
          "Không. Trong mô hình tuyển dụng trực tiếp, doanh nghiệp tuyển dụng sẽ lựa chọn và ký hợp đồng lao động trực tiếp với ứng viên.": "いいえ。直接採用モデルでは、採用企業が候補者を選び、直接雇用契約を締結します。",
          "Doanh nghiệp thanh toán phí khi nào?": "企業はいつ料金を支払いますか？",
          "Thời điểm và điều kiện thanh toán được quy định trong hợp đồng dịch vụ. Phí thường phát sinh khi ứng viên đáp ứng điều kiện tuyển dụng thành công.": "支払時期と条件はサービス契約に定められます。通常、候補者が合意済みの採用成功条件を満たした時点で料金が発生します。",
          "Sanvendo có chính sách thay thế nhân sự không?": "Sanvendoには人材の代替保証がありますか？",
          "Có thể áp dụng tùy theo gói dịch vụ, vị trí tuyển dụng và điều kiện đã được hai bên thống nhất.": "サービスプラン、採用職種、双方で合意した条件に応じて適用される場合があります。",
          "Ứng viên có phải trả phí không?": "求職者は料金を支払いますか？",
          "Không. Ứng viên không phải trả phí để gửi CV, ứng tuyển hoặc được giới thiệu đến doanh nghiệp.": "いいえ。履歴書の提出、応募、企業への紹介に費用はかかりません。",
          "Bắt đầu ngay": "今すぐ始める",
          "Để Sanvendo tìm kiếm nhân sự phù hợp cho doanh nghiệp của bạn.": "Sanvendoに貴社に合う人材探しをお任せください。",
          "Đối tác tuyển dụng theo yêu cầu cho doanh nghiệp.": "企業向けオンデマンド採用パートナー。",
          "Dành cho doanh nghiệp": "企業向け",
          "Dịch vụ tuyển dụng": "採用サービス",
          "Nhận báo giá": "見積もりを依頼",
          "Tìm việc làm": "仕事を探す",
          "Quyền lợi ứng viên": "求職者のメリット",
          "Thông tin": "情報",
          "Giới thiệu": "会社紹介",
          "Chính sách bảo mật": "プライバシーポリシー",
          "Chính sách bảo mật & lưu dữ liệu": "プライバシーポリシーとデータ保存",
          "Hồ sơ được lưu trong kho R2 riêng tư của hệ thống.": "プロフィールはシステムの非公開R2ストレージに保存されます。",
          "Điều khoản sử dụng": "利用規約",
          "Tin tuyển dụng": "求人情報",
          "Chi tiết công việc": "仕事内容の詳細",
          "Kinh nghiệm": "経験",
          "Không yêu cầu": "不問",
          "Thời gian làm việc": "勤務時間",
          "Trao đổi khi phỏng vấn": "面接時に相談",
          "Mô tả công việc": "仕事内容",
          "Yêu cầu ứng viên": "応募条件",
          "Quyền lợi": "福利厚生",
          "Thông tin bổ sung": "追加情報",
          "Nội dung chi tiết đang được cập nhật. Bạn vẫn có thể gửi đơn để Sanvendo liên hệ thêm.": "詳細情報は更新中です。応募を送信いただければ、Sanvendoからご連絡します。",
          "Ứng tuyển vị trí này": "この求人に応募",
          "Gửi yêu cầu tuyển dụng": "採用依頼を送信",
          "Điền thông tin cơ bản. Sanvendo sẽ liên hệ để xác nhận nhu cầu và báo giá.": "基本情報をご入力ください。Sanvendoがニーズ確認と見積もりのためにご連絡します。",
          "Tên doanh nghiệp *": "会社名 *",
          "Người liên hệ *": "担当者名 *",
          "Số điện thoại *": "電話番号 *",
          "Email công việc *": "勤務先メール *",
          "Vị trí cần tuyển *": "募集職種 *",
          "Số lượng": "人数",
          "Địa điểm làm việc": "勤務地",
          "Mức lương dự kiến": "想定給与",
          "Thời gian cần nhân sự": "採用希望時期",
          "Ví dụ: trong 30 ngày": "例：30日以内",
          "Mô tả yêu cầu": "要件の詳細",
          "Tôi đồng ý để Sanvendo liên hệ tư vấn về yêu cầu tuyển dụng này.": "この採用依頼についてSanvendoから連絡を受けることに同意します。",
          "Đã nhận yêu cầu tuyển dụng": "採用依頼を受け付けました",
          "Mã yêu cầu:": "依頼番号：",
          "Sanvendo sẽ liên hệ để xác nhận nhu cầu và báo giá.": "Sanvendoがニーズ確認と見積もりのためにご連絡します。",
          "Gửi hồ sơ ứng viên": "求職者プロフィールを送信",
          "Bạn có thể gửi đơn ứng tuyển trước, không bắt buộc phải có CV. Ứng viên không phải trả phí.": "履歴書なしでも先に応募でき、後から追加できます。求職者の利用は無料です。",
          "Họ và tên *": "氏名 *",
          "Email *": "メールアドレス *",
          "Vị trí mong muốn": "希望職種",
          "Khu vực làm việc": "希望勤務地",
          "File CV (không bắt buộc)": "履歴書ファイル（任意）",
          "Có thể gửi hồ sơ trước và bổ sung CV sau. Nếu tải lên: PDF, DOC hoặc DOCX, tối đa 10 MB.": "先にプロフィールを送信し、後から履歴書を追加できます。PDF、DOC、DOCX、最大10MB。",
          "Tôi đồng ý để Sanvendo xử lý hồ sơ và giới thiệu đến nhà tuyển dụng phù hợp.": "Sanvendoがプロフィールを処理し、適切な企業へ紹介することに同意します。",
          "Gửi đơn ứng tuyển": "応募を送信",
          "Đơn ứng tuyển đã được gửi thành công": "応募が正常に送信されました",
          "Mã đơn:": "応募番号：",
          "Sanvendo sẽ liên hệ khi có cơ hội phù hợp.": "適切な機会が見つかり次第、Sanvendoからご連絡します。",
          "Lưu vị trí": "求人を保存",
          "Xem chi tiết": "詳細を見る",
          "Ứng tuyển": "応募",
          "Xem nội dung công việc, yêu cầu và quyền lợi của vị trí này.": "この求人の仕事内容、応募条件、福利厚生を確認します。",
          "Vị trí tuyển dụng": "募集中のポジション",
          "Đã lưu vị trí.": "求人を保存しました。",
          "Đã bỏ lưu vị trí.": "保存済み求人から削除しました。",
          "Đang gửi yêu cầu...": "依頼を送信中…",
          "Đang gửi hồ sơ...": "応募を送信中…",
          "Chỉ chấp nhận file PDF, DOC hoặc DOCX.": "PDF、DOC、DOCXファイルのみ受け付けます。",
          "Dung lượng CV tối đa là 10 MB.": "履歴書の最大容量は10MBです。",
          "Hồ sơ và CV đã được gửi thành công": "プロフィールと履歴書が正常に送信されました",
          "Mã hồ sơ:": "プロフィール番号：",
          "Đã tiếp nhận": "受付済み",
          "Không thể tải tin tuyển dụng. Vui lòng thử lại.": "求人情報を読み込めません。もう一度お試しください。",
          "Máy chủ trả về phản hồi không hợp lệ.": "サーバーから無効な応答が返されました。",
          "Không thể gửi yêu cầu. Vui lòng thử lại.": "依頼を送信できません。もう一度お試しください。",
          "Không thể gửi hồ sơ. Vui lòng thử lại.": "応募を送信できません。もう一度お試しください。"
    }
  };

  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  let currentLanguage = resolveInitialLanguage();

  function normalizeLanguage(value) {
    const language = String(value || "").toLowerCase().split("-")[0];
    return SUPPORTED_LANGUAGES.includes(language) ? language : "vi";
  }

  function resolveInitialLanguage() {
    const queryLanguage = new URLSearchParams(window.location.search).get("lang");
    if (queryLanguage) return normalizeLanguage(queryLanguage);

    try {
      const stored = window.localStorage.getItem("sanvendo-language");
      if (stored) return normalizeLanguage(stored);
    } catch {
      // Local storage can be blocked in private browsing.
    }

    return normalizeLanguage(navigator.language);
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function interpolate(value, params = {}) {
    return String(value || "").replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? ""));
  }

  function t(source, params = {}, language = currentLanguage) {
    const key = normalizeText(source);
    if (!key || language === "vi") return interpolate(key || source, params);
    return interpolate(TEXT[language]?.[key] || key, params);
  }

  function categoryLabel(category, language = currentLanguage) {
    return CATEGORY_LABELS[language]?.[category] || CATEGORY_LABELS.vi[category] || category || t("Tin tuyển dụng", {}, language);
  }

  function employmentTypeLabel(type, language = currentLanguage) {
    return EMPLOYMENT_TYPE_LABELS[language]?.[type] || EMPLOYMENT_TYPE_LABELS.vi[type] || "";
  }

  function localizedField(job, field, language = currentLanguage) {
    if (!job || typeof job !== "object") return "";
    if (language === "vi") return job[field] ?? "";
    const translated = job.translations?.[language]?.[field];
    if (Array.isArray(translated)) return translated.length ? translated : (job[field] || []);
    return String(translated || "").trim() || job[field] || "";
  }

  function localizeJob(job, language = currentLanguage) {
    const fields = [
      "title", "companyName", "location", "experience", "workHours", "summary",
      "responsibilities", "requirements", "benefits", "additionalInfo", "salary",
      "targetCandidates", "featuredBadge", "featuredTags"
    ];
    const localized = { ...job };
    for (const field of fields) localized[field] = localizedField(job, field, language);
    localized.categoryLabel = categoryLabel(job?.category, language);
    localized.employmentTypeLabel = employmentTypeLabel(job?.employmentType, language);
    return localized;
  }

  function withLanguage(url, language = currentLanguage) {
    const raw = String(url || "");
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return raw;
    try {
      const parsed = new URL(raw, window.location.origin);
      parsed.searchParams.set("lang", normalizeLanguage(language));
      return parsed.origin === window.location.origin
        ? `${parsed.pathname}${parsed.search}${parsed.hash}`
        : parsed.toString();
    } catch {
      return raw;
    }
  }

  function translateTextNode(node) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue || "");
    const source = originalText.get(node);
    const normalized = normalizeText(source);
    if (!normalized) return;

    const translated = t(normalized);
    if (translated === normalized && currentLanguage !== "vi") {
      node.nodeValue = source;
      return;
    }

    const leading = source.match(/^\s*/)?.[0] || "";
    const trailing = source.match(/\s*$/)?.[0] || "";
    node.nodeValue = `${leading}${translated}${trailing}`;
  }

  function translateAttributes(element) {
    const translatable = ["placeholder", "aria-label", "title"];
    let originals = originalAttributes.get(element);
    if (!originals) {
      originals = {};
      originalAttributes.set(element, originals);
    }

    for (const attribute of translatable) {
      if (!element.hasAttribute(attribute) && !(attribute in originals)) continue;
      if (!(attribute in originals)) originals[attribute] = element.getAttribute(attribute) || "";
      element.setAttribute(attribute, t(originals[attribute]));
    }
  }

  function apply(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return normalizeText(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) translateTextNode(node);

    if (root instanceof Element) translateAttributes(root);
    root.querySelectorAll?.("[placeholder], [aria-label], [title]").forEach(translateAttributes);

    document.documentElement.lang = LOCALES[currentLanguage];
    document.querySelectorAll(".category-card[data-category]").forEach((card) => {
      const label = card.querySelector("strong");
      if (label) label.textContent = categoryLabel(card.dataset.category);
    });

    document.querySelectorAll("[data-language]").forEach((button) => {
      const active = button.dataset.language === currentLanguage;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setLanguage(language, { updateUrl = true } = {}) {
    const next = normalizeLanguage(language);
    if (next === currentLanguage) {
      apply();
      return;
    }

    currentLanguage = next;
    try {
      window.localStorage.setItem("sanvendo-language", next);
    } catch {
      // Ignore storage failures.
    }

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (next === "vi") url.searchParams.delete("lang");
      else url.searchParams.set("lang", next);
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }

    apply();
    window.dispatchEvent(new CustomEvent("sanvendo:languagechange", { detail: { language: next } }));
  }

  function formatJobCount(count, language = currentLanguage) {
    const value = Number(count || 0);
    if (language === "en") return `${value} open ${value === 1 ? "job" : "jobs"}`;
    if (language === "zh") return `${value} 个招聘职位`;
    if (language === "ko") return `채용 중 ${value}건`;
    if (language === "ja") return `募集中 ${value}件`;
    return `${value} tin đang tuyển`;
  }

  function init() {
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.language));
    });
    apply();
  }

  window.SanvendoI18n = {
    get current() { return currentLanguage; },
    get locale() { return LOCALES[currentLanguage]; },
    supportedLanguages: [...SUPPORTED_LANGUAGES],
    t,
    apply,
    setLanguage,
    categoryLabel,
    employmentTypeLabel,
    localizedField,
    localizeJob,
    withLanguage,
    formatJobCount,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
