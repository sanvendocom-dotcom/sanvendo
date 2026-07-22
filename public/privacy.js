(() => {
  "use strict";

  const SUPPORTED = ["vi", "en", "zh", "ko", "ja"];
  const HTML_LANG = { vi: "vi", en: "en", zh: "zh-CN", ko: "ko", ja: "ja" };

  const TEXT = {
    vi: {
      metaTitle: "Chính sách bảo mật — Sanvendo",
      metaDescription: "Chính sách bảo mật và bảo vệ dữ liệu cá nhân của Sanvendo dành cho ứng viên, doanh nghiệp và khách truy cập website.",
      backHome: "Về trang chủ",
      eyebrow: "Quyền riêng tư & dữ liệu cá nhân",
      title: "Chính sách bảo mật",
      lead: "Chính sách này giải thích cách Sanvendo thu thập, sử dụng, lưu trữ, chia sẻ và bảo vệ thông tin của ứng viên, doanh nghiệp và khách truy cập website.",
      updatedLabel: "Cập nhật lần cuối:",
      updatedDate: "22/07/2026",
      summaryTitle: "Tóm tắt dễ hiểu",
      summaryText: "Sanvendo chỉ sử dụng thông tin để hỗ trợ tuyển dụng, liên hệ theo yêu cầu, vận hành an toàn dịch vụ và thực hiện nghĩa vụ pháp lý. Sanvendo không bán dữ liệu cá nhân.",
      scopeTitle: "Phạm vi áp dụng",
      scopeText: "Chính sách này áp dụng khi bạn truy cập sanvendo.com, gửi hồ sơ ứng viên, tải CV, ứng tuyển, gửi yêu cầu tuyển dụng hoặc liên hệ với Sanvendo qua các kênh được công bố.",
      collectTitle: "Thông tin Sanvendo thu thập",
      collectIntro: "Tùy cách bạn sử dụng dịch vụ, Sanvendo có thể thu thập:",
      candidateData: "<strong>Thông tin ứng viên:</strong> họ tên, số điện thoại, email, vị trí và khu vực mong muốn, nội dung CV hoặc hồ sơ bạn tự nguyện cung cấp.",
      employerData: "<strong>Thông tin doanh nghiệp:</strong> tên doanh nghiệp, người liên hệ, số điện thoại, email công việc, vị trí cần tuyển, số lượng, địa điểm, mức lương dự kiến, thời hạn và mô tả yêu cầu.",
      technicalData: "<strong>Thông tin kỹ thuật:</strong> địa chỉ IP, loại trình duyệt hoặc thiết bị, thời điểm truy cập, nhật ký hệ thống và thông tin cần thiết để phòng chống lạm dụng, bảo mật và khắc phục lỗi.",
      sensitiveNote: "CV có thể chứa thông tin riêng tư do bạn tự nhập. Bạn không nên gửi dữ liệu nhạy cảm không cần thiết cho mục đích tuyển dụng.",
      useTitle: "Mục đích sử dụng thông tin",
      use1: "Tiếp nhận, đánh giá và xử lý hồ sơ hoặc đơn ứng tuyển.",
      use2: "Tìm kiếm cơ hội phù hợp và giới thiệu ứng viên đến doanh nghiệp tuyển dụng trong phạm vi cần thiết.",
      use3: "Xác nhận nhu cầu tuyển dụng, tư vấn dịch vụ, báo giá và hỗ trợ doanh nghiệp.",
      use4: "Vận hành, bảo mật, chống gian lận, cải thiện website và thực hiện nghĩa vụ theo pháp luật.",
      shareTitle: "Chia sẻ và bên nhận dữ liệu",
      shareIntro: "Sanvendo chỉ chia sẻ thông tin khi cần thiết và phù hợp với mục đích đã thông báo, bao gồm:",
      share1: "Doanh nghiệp tuyển dụng phù hợp, sau khi có căn cứ xử lý hoặc sự đồng ý cần thiết của ứng viên.",
      share2: "Nhà cung cấp hạ tầng, lưu trữ, bảo mật hoặc hỗ trợ kỹ thuật phục vụ việc vận hành dịch vụ.",
      share3: "Cơ quan có thẩm quyền hoặc bên liên quan khi pháp luật yêu cầu, để bảo vệ quyền lợi hợp pháp hoặc xử lý hành vi gian lận, lạm dụng.",
      noSale: "Sanvendo không bán hoặc trao đổi dữ liệu cá nhân để phục vụ quảng cáo của bên thứ ba.",
      retentionTitle: "Thời gian lưu trữ",
      retentionText: "Thông tin được lưu trong thời gian cần thiết để xử lý yêu cầu tuyển dụng, duy trì quan hệ với ứng viên hoặc doanh nghiệp, giải quyết tranh chấp và đáp ứng nghĩa vụ pháp lý. Khi không còn cần thiết, Sanvendo sẽ xóa, ẩn danh hoặc hạn chế xử lý theo quy trình phù hợp.",
      securityTitle: "Bảo mật thông tin",
      securityText: "Sanvendo áp dụng các biện pháp quản trị và kỹ thuật hợp lý như kiểm soát truy cập trang quản trị, giới hạn loại và dung lượng tệp, kiểm tra tệp tải lên và sử dụng hạ tầng lưu trữ được bảo vệ. Tuy nhiên, không có phương thức truyền hoặc lưu trữ điện tử nào an toàn tuyệt đối.",
      rightsTitle: "Quyền của bạn",
      rightsIntro: "Trong phạm vi pháp luật áp dụng và sau khi xác minh danh tính, bạn có thể yêu cầu:",
      right1: "Được biết và truy cập thông tin cá nhân Sanvendo đang xử lý.",
      right2: "Sửa thông tin chưa chính xác hoặc bổ sung thông tin còn thiếu.",
      right3: "Rút lại sự đồng ý cho hoạt động dựa trên sự đồng ý.",
      right4: "Xóa, hạn chế xử lý hoặc phản đối việc xử lý trong trường hợp phù hợp.",
      right5: "Khiếu nại hoặc liên hệ cơ quan có thẩm quyền theo quy định.",
      rightsNote: "Việc rút lại sự đồng ý không ảnh hưởng đến tính hợp pháp của hoạt động xử lý đã thực hiện trước thời điểm rút lại.",
      storageTitle: "Cookie và bộ nhớ trình duyệt",
      storageText: "Website có thể lưu lựa chọn ngôn ngữ trong bộ nhớ cục bộ của trình duyệt và sử dụng các dữ liệu kỹ thuật thiết yếu để vận hành, bảo mật dịch vụ. Hiện tại, Sanvendo không sử dụng chức năng này để theo dõi quảng cáo của bên thứ ba.",
      childrenTitle: "Thông tin của người chưa thành niên",
      childrenText: "Dịch vụ chủ yếu dành cho người có nhu cầu việc làm và đại diện doanh nghiệp. Người chưa thành niên chỉ nên cung cấp dữ liệu khi có sự đồng ý hoặc giám sát phù hợp của cha mẹ, người giám hộ theo pháp luật.",
      changesTitle: "Thay đổi chính sách",
      changesText: "Sanvendo có thể cập nhật chính sách để phản ánh thay đổi của dịch vụ hoặc quy định pháp luật. Phiên bản mới sẽ được đăng tại trang này và ghi rõ ngày cập nhật.",
      contactTitle: "Liên hệ về quyền riêng tư",
      contactText: "Để yêu cầu truy cập, sửa, xóa dữ liệu hoặc đặt câu hỏi về chính sách này, vui lòng liên hệ:",
      contactTip: "Vui lòng mô tả yêu cầu và cung cấp thông tin đủ để Sanvendo xác minh đúng hồ sơ cần xử lý.",
      footerTagline: "Recruitment · Headhunting · Direct Hire",
    },
    en: {
      metaTitle: "Privacy Policy — Sanvendo",
      metaDescription: "Sanvendo's privacy and personal data protection policy for candidates, employers and website visitors.",
      backHome: "Back to home",
      eyebrow: "Privacy & personal data",
      title: "Privacy Policy",
      lead: "This policy explains how Sanvendo collects, uses, stores, shares and protects information about candidates, employers and website visitors.",
      updatedLabel: "Last updated:",
      updatedDate: "22 July 2026",
      summaryTitle: "Plain-language summary",
      summaryText: "Sanvendo uses information only to support recruitment, respond to requests, operate the service securely and meet legal obligations. Sanvendo does not sell personal data.",
      scopeTitle: "Scope",
      scopeText: "This policy applies when you visit sanvendo.com, submit a candidate profile, upload a CV, apply for a role, send a recruitment request or contact Sanvendo through published channels.",
      collectTitle: "Information Sanvendo collects",
      collectIntro: "Depending on how you use the service, Sanvendo may collect:",
      candidateData: "<strong>Candidate information:</strong> name, phone number, email, preferred role and location, CV content or other profile information you voluntarily provide.",
      employerData: "<strong>Employer information:</strong> company name, contact person, phone number, work email, hiring role, quantity, location, expected salary, deadline and request description.",
      technicalData: "<strong>Technical information:</strong> IP address, browser or device type, access time, system logs and information needed to prevent abuse, secure the service and troubleshoot errors.",
      sensitiveNote: "A CV may contain private information you choose to include. Please do not submit sensitive data that is unnecessary for recruitment.",
      useTitle: "How information is used",
      use1: "Receive, assess and process candidate profiles or applications.",
      use2: "Find suitable opportunities and introduce candidates to hiring employers where necessary.",
      use3: "Confirm hiring needs, provide service advice, quotations and employer support.",
      use4: "Operate and secure the website, prevent fraud, improve the service and meet legal obligations.",
      shareTitle: "Sharing and recipients",
      shareIntro: "Sanvendo shares information only when necessary and consistent with the stated purposes, including with:",
      share1: "Suitable hiring employers, after an appropriate processing basis or the candidate's required consent is in place.",
      share2: "Infrastructure, storage, security or technical support providers used to operate the service.",
      share3: "Competent authorities or relevant parties where required by law, to protect legitimate rights or address fraud and abuse.",
      noSale: "Sanvendo does not sell or exchange personal data for third-party advertising.",
      retentionTitle: "Data retention",
      retentionText: "Information is retained for as long as needed to handle recruitment requests, maintain candidate or employer relationships, resolve disputes and meet legal obligations. When no longer needed, Sanvendo will delete, anonymize or restrict processing under an appropriate procedure.",
      securityTitle: "Information security",
      securityText: "Sanvendo uses reasonable administrative and technical measures, including restricted admin access, file type and size limits, uploaded-file checks and protected storage infrastructure. However, no electronic transmission or storage method is completely secure.",
      rightsTitle: "Your rights",
      rightsIntro: "Subject to applicable law and identity verification, you may request to:",
      right1: "Be informed about and access personal information Sanvendo processes.",
      right2: "Correct inaccurate information or complete missing information.",
      right3: "Withdraw consent for processing that relies on consent.",
      right4: "Request deletion, restriction or object to processing where applicable.",
      right5: "Lodge a complaint or contact a competent authority as permitted by law.",
      rightsNote: "Withdrawing consent does not affect the lawfulness of processing carried out before the withdrawal.",
      storageTitle: "Cookies and browser storage",
      storageText: "The website may save your language preference in local browser storage and use essential technical data to operate and secure the service. Sanvendo currently does not use this feature for third-party advertising tracking.",
      childrenTitle: "Information about minors",
      childrenText: "The service is mainly intended for job seekers and employer representatives. Minors should provide data only with appropriate consent or supervision from a parent or legal guardian.",
      changesTitle: "Policy changes",
      changesText: "Sanvendo may update this policy to reflect service or legal changes. The revised version will be posted on this page with an updated date.",
      contactTitle: "Privacy contact",
      contactText: "To request access, correction or deletion, or to ask a question about this policy, please contact:",
      contactTip: "Please describe your request and provide enough information for Sanvendo to identify the relevant record.",
      footerTagline: "Recruitment · Headhunting · Direct Hire",
    },
    zh: {
      metaTitle: "隐私政策 — Sanvendo",
      metaDescription: "Sanvendo 面向求职者、企业和网站访客的隐私与个人数据保护政策。",
      backHome: "返回首页",
      eyebrow: "隐私与个人数据",
      title: "隐私政策",
      lead: "本政策说明 Sanvendo 如何收集、使用、存储、共享及保护求职者、企业和网站访客的信息。",
      updatedLabel: "最后更新：",
      updatedDate: "2026年7月22日",
      summaryTitle: "简要说明",
      summaryText: "Sanvendo 仅为招聘支持、按请求联系、安全运营服务及履行法律义务而使用信息。Sanvendo 不出售个人数据。",
      scopeTitle: "适用范围",
      scopeText: "当您访问 sanvendo.com、提交求职资料、上传简历、申请职位、提交招聘需求或通过公开渠道联系 Sanvendo 时，本政策适用。",
      collectTitle: "Sanvendo 收集的信息",
      collectIntro: "根据您使用服务的方式，Sanvendo 可能收集：",
      candidateData: "<strong>求职者信息：</strong>姓名、电话、电子邮箱、期望职位与地区、简历内容或您自愿提供的其他资料。",
      employerData: "<strong>企业信息：</strong>企业名称、联系人、电话、工作邮箱、招聘职位、人数、地点、预计薪资、期限及需求说明。",
      technicalData: "<strong>技术信息：</strong>IP 地址、浏览器或设备类型、访问时间、系统日志，以及用于防滥用、安全保护和故障排查的信息。",
      sensitiveNote: "简历可能包含您自行填写的私人信息。请勿提交与招聘无关且不必要的敏感数据。",
      useTitle: "信息使用目的",
      use1: "接收、评估和处理求职资料或申请。",
      use2: "寻找合适机会，并在必要范围内向招聘企业推荐候选人。",
      use3: "确认招聘需求、提供服务咨询、报价及企业支持。",
      use4: "运营和保护网站、防止欺诈、改进服务并履行法律义务。",
      shareTitle: "数据共享与接收方",
      shareIntro: "Sanvendo 仅在必要且符合已说明目的时共享信息，包括：",
      share1: "合适的招聘企业，但须具备适当的处理依据或取得候选人所需的同意。",
      share2: "为服务运营提供基础设施、存储、安全或技术支持的供应商。",
      share3: "法律要求的主管机关或相关方，以保护合法权益或处理欺诈、滥用行为。",
      noSale: "Sanvendo 不会为第三方广告出售或交换个人数据。",
      retentionTitle: "保存期限",
      retentionText: "信息将在处理招聘需求、维持候选人或企业关系、解决争议及履行法律义务所需期间内保存。无需继续保留时，Sanvendo 将依适当流程删除、匿名化或限制处理。",
      securityTitle: "信息安全",
      securityText: "Sanvendo 采取合理的管理和技术措施，包括限制管理后台访问、限制文件类型与大小、检查上传文件并使用受保护的存储基础设施。但任何电子传输或存储方式都无法保证绝对安全。",
      rightsTitle: "您的权利",
      rightsIntro: "在适用法律允许并完成身份验证后，您可以要求：",
      right1: "了解并访问 Sanvendo 正在处理的个人信息。",
      right2: "更正不准确信息或补充缺失信息。",
      right3: "撤回对基于同意之处理活动的同意。",
      right4: "在适用情况下要求删除、限制处理或提出反对。",
      right5: "依法提出投诉或联系主管机关。",
      rightsNote: "撤回同意不影响撤回前已进行处理活动的合法性。",
      storageTitle: "Cookie 与浏览器存储",
      storageText: "网站可能在浏览器本地存储中保存您的语言选择，并使用运行及保护服务所必需的技术数据。目前 Sanvendo 不将此功能用于第三方广告跟踪。",
      childrenTitle: "未成年人信息",
      childrenText: "本服务主要面向求职者和企业代表。未成年人仅应在父母或法定监护人适当同意或监督下提供数据。",
      changesTitle: "政策变更",
      changesText: "Sanvendo 可能因服务或法律变化更新本政策。修订版本将发布在本页面并注明更新日期。",
      contactTitle: "隐私联系",
      contactText: "如需访问、更正、删除数据或咨询本政策，请联系：",
      contactTip: "请说明您的请求，并提供足够信息以便 Sanvendo 确认相关记录。",
      footerTagline: "按需招聘 · 猎头 · 直接招聘",
    },
    ko: {
      metaTitle: "개인정보 처리방침 — Sanvendo",
      metaDescription: "지원자, 기업 및 웹사이트 방문자를 위한 Sanvendo의 개인정보 보호정책입니다.",
      backHome: "홈으로",
      eyebrow: "개인정보 및 데이터 보호",
      title: "개인정보 처리방침",
      lead: "본 방침은 Sanvendo가 지원자, 기업 및 웹사이트 방문자의 정보를 어떻게 수집, 이용, 보관, 공유 및 보호하는지 설명합니다.",
      updatedLabel: "최종 업데이트:",
      updatedDate: "2026년 7월 22일",
      summaryTitle: "쉽게 보는 요약",
      summaryText: "Sanvendo는 채용 지원, 요청에 따른 연락, 안전한 서비스 운영 및 법적 의무 이행을 위해서만 정보를 사용합니다. 개인정보를 판매하지 않습니다.",
      scopeTitle: "적용 범위",
      scopeText: "sanvendo.com 방문, 지원자 프로필 제출, 이력서 업로드, 채용 지원, 채용 요청 제출 또는 공개된 채널을 통한 문의 시 본 방침이 적용됩니다.",
      collectTitle: "수집하는 정보",
      collectIntro: "서비스 이용 방식에 따라 다음 정보를 수집할 수 있습니다.",
      candidateData: "<strong>지원자 정보:</strong> 이름, 전화번호, 이메일, 희망 직무와 지역, 이력서 내용 및 자발적으로 제공한 프로필 정보.",
      employerData: "<strong>기업 정보:</strong> 기업명, 담당자, 전화번호, 업무용 이메일, 채용 직무, 인원, 근무지, 예상 급여, 기한 및 요청 설명.",
      technicalData: "<strong>기술 정보:</strong> IP 주소, 브라우저 또는 기기 유형, 접속 시간, 시스템 로그 및 남용 방지·보안·오류 해결에 필요한 정보.",
      sensitiveNote: "이력서에는 사용자가 직접 입력한 사적인 정보가 포함될 수 있습니다. 채용에 불필요한 민감정보는 제출하지 마세요.",
      useTitle: "정보 이용 목적",
      use1: "지원자 프로필 또는 지원서를 접수, 평가 및 처리합니다.",
      use2: "적합한 기회를 찾고 필요한 범위에서 지원자를 채용 기업에 소개합니다.",
      use3: "채용 수요 확인, 서비스 상담, 견적 및 기업 지원을 제공합니다.",
      use4: "웹사이트 운영과 보안, 사기 방지, 서비스 개선 및 법적 의무 이행에 사용합니다.",
      shareTitle: "공유 및 수신자",
      shareIntro: "Sanvendo는 고지된 목적에 부합하고 필요한 경우에만 다음과 정보를 공유합니다.",
      share1: "적절한 처리 근거 또는 필요한 지원자 동의가 확보된 경우의 적합한 채용 기업.",
      share2: "서비스 운영을 위한 인프라, 저장, 보안 또는 기술지원 제공업체.",
      share3: "법률상 요구되거나 정당한 권리 보호, 사기 및 남용 대응에 필요한 관계 기관 또는 당사자.",
      noSale: "Sanvendo는 제3자 광고 목적으로 개인정보를 판매하거나 교환하지 않습니다.",
      retentionTitle: "보관 기간",
      retentionText: "정보는 채용 요청 처리, 지원자 또는 기업 관계 유지, 분쟁 해결 및 법적 의무 이행에 필요한 기간 동안 보관됩니다. 더 이상 필요하지 않으면 적절한 절차에 따라 삭제, 익명화 또는 처리 제한합니다.",
      securityTitle: "정보 보안",
      securityText: "Sanvendo는 관리자 접근 제한, 파일 형식·용량 제한, 업로드 파일 검사 및 보호된 저장 인프라 등 합리적인 관리적·기술적 조치를 적용합니다. 다만 전자 전송이나 저장 방식은 절대적으로 안전할 수 없습니다.",
      rightsTitle: "이용자의 권리",
      rightsIntro: "관련 법령 및 본인 확인 절차에 따라 다음을 요청할 수 있습니다.",
      right1: "Sanvendo가 처리하는 개인정보에 대한 안내 및 열람.",
      right2: "부정확한 정보의 정정 또는 누락 정보의 보완.",
      right3: "동의에 근거한 처리에 대한 동의 철회.",
      right4: "해당되는 경우 삭제, 처리 제한 또는 처리 반대.",
      right5: "법령에 따른 이의 제기 또는 관계 기관 문의.",
      rightsNote: "동의 철회는 철회 전에 이루어진 처리의 적법성에 영향을 주지 않습니다.",
      storageTitle: "쿠키 및 브라우저 저장소",
      storageText: "웹사이트는 브라우저 로컬 저장소에 언어 선택을 저장하고 서비스 운영 및 보안에 필요한 기술 데이터를 사용할 수 있습니다. 현재 Sanvendo는 이를 제3자 광고 추적에 사용하지 않습니다.",
      childrenTitle: "미성년자 정보",
      childrenText: "서비스는 주로 구직자와 기업 담당자를 대상으로 합니다. 미성년자는 부모 또는 법정대리인의 적절한 동의나 감독 아래에서만 정보를 제공해야 합니다.",
      changesTitle: "방침 변경",
      changesText: "Sanvendo는 서비스 또는 법령 변경을 반영하기 위해 본 방침을 수정할 수 있습니다. 변경된 방침과 업데이트 날짜는 이 페이지에 게시됩니다.",
      contactTitle: "개인정보 문의",
      contactText: "열람, 정정, 삭제 요청 또는 본 방침에 관한 문의는 다음 이메일로 연락해 주세요.",
      contactTip: "요청 내용과 해당 기록을 확인할 수 있는 충분한 정보를 함께 보내 주세요.",
      footerTagline: "맞춤형 채용 · 헤드헌팅 · 직접 채용",
    },
    ja: {
      metaTitle: "プライバシーポリシー — Sanvendo",
      metaDescription: "求職者、企業、ウェブサイト訪問者向けのSanvendoの個人情報保護方針です。",
      backHome: "ホームへ戻る",
      eyebrow: "プライバシーと個人データ",
      title: "プライバシーポリシー",
      lead: "本ポリシーは、Sanvendoが求職者、企業、ウェブサイト訪問者の情報をどのように収集、利用、保存、共有、保護するかを説明します。",
      updatedLabel: "最終更新日：",
      updatedDate: "2026年7月22日",
      summaryTitle: "わかりやすい概要",
      summaryText: "Sanvendoは採用支援、依頼への連絡、安全なサービス運営、法的義務の履行に限って情報を利用します。個人データを販売しません。",
      scopeTitle: "適用範囲",
      scopeText: "sanvendo.comの閲覧、求職者プロフィールの送信、履歴書のアップロード、求人応募、採用依頼の送信、公開された窓口への連絡に本ポリシーが適用されます。",
      collectTitle: "収集する情報",
      collectIntro: "サービスの利用方法に応じて、次の情報を収集する場合があります。",
      candidateData: "<strong>求職者情報：</strong>氏名、電話番号、メールアドレス、希望職種・勤務地、履歴書の内容、その他自発的に提供されたプロフィール情報。",
      employerData: "<strong>企業情報：</strong>企業名、担当者、電話番号、業務用メール、募集職種、人数、勤務地、想定給与、期限、依頼内容。",
      technicalData: "<strong>技術情報：</strong>IPアドレス、ブラウザ・端末の種類、アクセス日時、システムログ、不正利用防止・セキュリティ・障害対応に必要な情報。",
      sensitiveNote: "履歴書にはご自身で入力した私的情報が含まれる場合があります。採用に不要な機微情報は送信しないでください。",
      useTitle: "利用目的",
      use1: "求職者プロフィールまたは応募情報の受付、評価、処理。",
      use2: "適切な求人機会の検索と、必要な範囲での採用企業への候補者紹介。",
      use3: "採用ニーズの確認、サービス相談、見積もり、企業支援。",
      use4: "ウェブサイトの運営・保護、不正防止、サービス改善、法的義務の履行。",
      shareTitle: "共有先",
      shareIntro: "Sanvendoは、通知した目的に沿って必要な場合に限り、次の相手と情報を共有します。",
      share1: "適切な処理根拠または必要な候補者の同意がある場合の採用企業。",
      share2: "サービス運営に利用するインフラ、保存、セキュリティ、技術支援の提供事業者。",
      share3: "法令上必要な行政機関または関係者、正当な権利保護、不正・乱用への対応に必要な相手。",
      noSale: "Sanvendoは第三者広告のために個人データを販売または交換しません。",
      retentionTitle: "保存期間",
      retentionText: "情報は、採用依頼の処理、候補者・企業との関係維持、紛争解決、法的義務の履行に必要な期間保存されます。不要になった場合は、適切な手順により削除、匿名化または処理制限を行います。",
      securityTitle: "情報セキュリティ",
      securityText: "Sanvendoは、管理画面へのアクセス制限、ファイル形式・容量の制限、アップロードファイルの検査、保護された保存基盤など合理的な管理的・技術的対策を講じます。ただし、電子的な送信・保存方法に絶対的な安全はありません。",
      rightsTitle: "お客様の権利",
      rightsIntro: "適用法令および本人確認に従い、次の事項を請求できます。",
      right1: "Sanvendoが処理する個人情報の説明およびアクセス。",
      right2: "不正確な情報の訂正または不足情報の追加。",
      right3: "同意に基づく処理についての同意撤回。",
      right4: "適用される場合の削除、処理制限または異議申立て。",
      right5: "法令に基づく苦情申立てまたは管轄機関への連絡。",
      rightsNote: "同意の撤回は、撤回前に行われた処理の適法性には影響しません。",
      storageTitle: "Cookieとブラウザ保存",
      storageText: "ウェブサイトは言語設定をブラウザのローカルストレージに保存し、運営とセキュリティに必要な技術データを利用する場合があります。現在、Sanvendoはこれを第三者広告の追跡には使用していません。",
      childrenTitle: "未成年者の情報",
      childrenText: "本サービスは主に求職者と企業担当者を対象としています。未成年者は、親権者または法定代理人の適切な同意・監督のもとでのみ情報を提供してください。",
      changesTitle: "ポリシーの変更",
      changesText: "Sanvendoはサービスまたは法令の変更を反映するため本ポリシーを更新する場合があります。更新版と更新日は本ページに掲載します。",
      contactTitle: "プライバシーに関するお問い合わせ",
      contactText: "アクセス、訂正、削除の請求、または本ポリシーに関する質問は、次のメールアドレスへご連絡ください。",
      contactTip: "ご依頼内容と、対象記録を確認するために必要な情報をご記載ください。",
      footerTagline: "オンデマンド採用 · ヘッドハンティング · 直接採用",
    },
  };

  function normalize(value) {
    const language = String(value || "").toLowerCase().split("-")[0];
    return SUPPORTED.includes(language) ? language : "vi";
  }

  function initialLanguage() {
    const query = new URLSearchParams(window.location.search).get("lang");
    if (query) return normalize(query);
    try {
      const saved = window.localStorage.getItem("sanvendo-language");
      if (saved) return normalize(saved);
    } catch {
      // Local storage can be unavailable in private browsing.
    }
    return normalize(window.navigator.language);
  }

  function localizedHome(language) {
    return language === "vi" ? "/" : `/?lang=${encodeURIComponent(language)}`;
  }

  function applyLanguage(language, updateUrl = true) {
    const next = normalize(language);
    const strings = TEXT[next];

    document.documentElement.lang = HTML_LANG[next];
    document.title = strings.metaTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", strings.metaDescription);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", strings.metaTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", strings.metaDescription);

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (Object.prototype.hasOwnProperty.call(strings, key)) element.innerHTML = strings[key];
    });

    const homeUrl = localizedHome(next);
    document.getElementById("homeBrand")?.setAttribute("href", homeUrl);
    document.getElementById("homeButton")?.setAttribute("href", homeUrl);

    document.querySelectorAll("[data-language]").forEach((button) => {
      const active = button.dataset.language === next;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

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
  }

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.language));
  });

  applyLanguage(initialLanguage(), false);
})();
