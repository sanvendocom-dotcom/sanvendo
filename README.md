# Sanvendo — Pages + R2 + trang quản trị `/admin`

Phiên bản này bao gồm:

- Website tuyển dụng công khai với tin việc làm tải động theo ngành nghề.
- Giao diện 5 ngôn ngữ: Tiếng Việt, English, 中文, 한국어 và 日本語; ghi nhớ lựa chọn của người xem.
- Form doanh nghiệp lưu yêu cầu tuyển dụng thật vào R2 và hiển thị trong trang quản trị.
- Form ứng viên cho phép gửi thông tin không cần CV; CV PDF/DOC/DOCX là tùy chọn, tối đa 10 MB.
- Lưu CV hoặc bản ghi thông tin ứng viên không có CV vào bucket R2 riêng tư `sanvendo-private-cv`.
- Trang quản trị tại `https://sanvendo.com/admin` để thêm, sửa, ẩn và xóa tin tuyển dụng.
- Danh sách, tìm kiếm và tải CV an toàn.
- Kiểm tra chữ ký JWT của Cloudflare Access trước khi cho phép truy cập `/admin`.
- Chặn truy cập quản trị qua `sanvendo.pages.dev`.

## Cấu trúc mới

```text
public/
├── admin/
│   ├── index.html
│   ├── admin.css
│   └── admin.js
├── index.html
├── i18n.js
├── style.css
└── script.js

functions/
├── _lib/
│   ├── access.js
│   ├── i18n.js
│   └── jobs.js
├── admin/
│   ├── _middleware.js
│   └── api/
│       ├── candidates.js
│       ├── download.js
│       ├── jobs.js
│       ├── me.js
│       └── requests.js
└── api/
    ├── jobs.js
    ├── recruitment-request.js
    └── upload-cv.js
```


## Giao diện và tin tuyển dụng 5 ngôn ngữ

Trang công khai có bộ chuyển ngôn ngữ:

```text
VI · EN · 中文 · 한국어 · 日本語
```

Lựa chọn được lưu trong trình duyệt. Trang chi tiết việc làm dùng tham số:

```text
?lang=vi
?lang=en
?lang=zh
?lang=ko
?lang=ja
```

Trong `/admin`, khi tạo hoặc sửa tin tuyển dụng có bốn khối bản dịch có thể mở rộng:

- English.
- 中文 — tiếng Trung giản thể.
- 한국어 — tiếng Hàn.
- 日本語 — tiếng Nhật.

Có thể dịch tên vị trí, doanh nghiệp, địa điểm, kinh nghiệm, lương, thời gian làm việc, giới thiệu, mô tả, yêu cầu, quyền lợi, thông tin bổ sung và nội dung tin nổi bật. Các ô bản dịch không bắt buộc. Trường nào để trống sẽ tự dùng nội dung tiếng Việt, vì vậy tin cũ không bị lỗi hoặc mất nội dung.

Dữ liệu bản dịch được lưu bên trong từng tin trong `site/jobs.json`, không cần thêm bucket, binding hoặc biến môi trường.

## Cấu hình bắt buộc trong Cloudflare Pages

Vào:

```text
Workers & Pages → sanvendo → Settings → Variables and Secrets
```

Thêm các biến cho **Production**:

```text
ACCESS_TEAM_DOMAIN = https://broken-fog-12fd.cloudflareaccess.com
ACCESS_AUD = <Application Audience (AUD) Tag của ứng dụng Sanvendo Admin>
ADMIN_EMAIL = sanvendo.com@gmail.com
ADMIN_ALLOWED_HOSTS = sanvendo.com,www.sanvendo.com
```

`ACCESS_AUD` lấy tại:

```text
Zero Trust → Access controls → Applications
→ Sanvendo Admin → Configure/Edit
→ Additional settings → Application Audience (AUD) Tag
```

Không đặt dấu `< >` quanh AUD thật.

Sau khi thêm biến, vào **Deployments** và triển khai lại phiên bản mới nhất.

## R2 binding

Giữ binding:

```text
Variable name: CV_BUCKET
R2 bucket: sanvendo-private-cv
```

Bucket phải tiếp tục để **Public access: Off**.

## Cập nhật mã qua GitHub

Giải nén ZIP và tải toàn bộ nội dung bên trong lên repository `sanvendo`, giữ đúng cấu trúc thư mục. GitHub sẽ tạo commit và Cloudflare Pages tự triển khai.

## Kiểm tra

1. Mở cửa sổ ẩn danh.
2. Truy cập `https://sanvendo.com/admin`.
3. Đăng nhập OTP bằng `sanvendo.com@gmail.com`.
4. Trong mục `Tin tuyển dụng theo ngành nghề`, thử thêm một tin, chọn ngành và bật `Hiển thị tin này trên trang chủ`.
5. Mở lại trang chủ; tin mới phải xuất hiện trong phần việc làm và số lượng tại ô ngành nghề phải tự tăng.
6. Gửi thử biểu mẫu doanh nghiệp ở trang chủ; yêu cầu phải xuất hiện trong mục `Yêu cầu tuyển dụng` tại `/admin`.
7. Danh sách hồ sơ trong R2 phải hiển thị, kể cả hồ sơ chưa gửi CV.
8. Hồ sơ có CV hiện nút `Tải CV`; hồ sơ không có CV hiện `Chưa gửi CV`.
9. Truy cập `https://sanvendo.pages.dev/admin` phải bị từ chối.

## Đăng xuất

Nút Đăng xuất dẫn đến:

```text
https://sanvendo.com/cdn-cgi/access/logout
```

## Quản lý tin tuyển dụng

Danh sách tin được lưu trong object R2:

```text
site/jobs.json
```

Khi chưa có object này, website dùng các tin mẫu có sẵn. Khu vực ngành nghề luôn hiển thị đủ 10 nhóm, kể cả nhóm chưa có tin. Ngay lần đầu thêm, sửa, ẩn hoặc xóa trong `/admin`, toàn bộ danh sách sẽ được lưu vào R2. Không cần tạo binding hoặc biến môi trường mới.

## Lưu ý

Trang quản trị đọc thông tin ứng viên và yêu cầu doanh nghiệp từ R2. Khi cần trạng thái xử lý hồ sơ, ghi chú, phân công nhân viên hoặc lịch sử thay đổi, nên bổ sung Cloudflare D1.

## Bản sửa nhận dữ liệu biểu mẫu

Bản này loại bỏ trường ẩn `website` từng có thể bị trình duyệt hoặc tiện ích tự điền. Trước đây, khi trường đó có giá trị, API trả thông báo thành công nhưng cố ý không lưu bản ghi. Hiện tại:

- Chỉ báo thành công sau khi R2 đã ghi xong dữ liệu.
- Phản hồi API phải có `stored: true`; giao diện sẽ báo lỗi nếu máy chủ chưa xác nhận lưu.
- Áp dụng cho cả yêu cầu doanh nghiệp và hồ sơ ứng viên.

Sau khi cập nhật mã, triển khai lại bản Production rồi gửi một yêu cầu thử mới. Các thông báo “thành công” cũ không tạo bản ghi nên không thể tự xuất hiện lại trong `/admin`.


## Bản sửa CV không bắt buộc

- Trường CV không có thuộc tính `required`.
- Khi người dùng không chọn file, JavaScript xóa phần file rỗng khỏi `FormData`.
- API xem file có tên rỗng hoặc dung lượng 0 là không có CV và vẫn lưu thông tin ứng viên vào R2.
- Trang quản trị hiển thị hồ sơ đó với trạng thái `Chưa gửi CV`.


## Bản nâng cấp nội dung chi tiết việc làm

- Biểu mẫu quản trị được chia thành nhóm thông tin chính và nội dung chi tiết, tự xuống cột trên màn hình nhỏ.
- Mỗi tin có thêm: thời gian làm việc, giới thiệu ngắn, mô tả công việc, yêu cầu ứng viên, quyền lợi và thông tin bổ sung.
- Trang chủ có nút `Xem chi tiết`, mở cửa sổ đầy đủ và cho phép ứng tuyển đúng vị trí.
- Tin cũ vẫn hoạt động; các trường mới có thể để trống và bổ sung dần trong `/admin`.

## SEO và lập chỉ mục nhanh cho tin tuyển dụng

Phiên bản 3.2.0 bổ sung:

- Trang chi tiết riêng cho từng tin: `https://sanvendo.com/jobs/<ma-tin>`.
- HTML việc làm được dựng sẵn từ máy chủ ở trang chủ, giúp bot đọc được nội dung và liên kết ngay cả trước khi JavaScript chạy.
- Sitemap động tại `https://sanvendo.com/sitemap.xml`, tự thêm tin đang hiển thị và tự bỏ tin hết hạn.
- `robots.txt`, canonical, Open Graph, Organization/WebSite schema và chặn lập chỉ mục tên miền `*.pages.dev`.
- Dữ liệu có cấu trúc `JobPosting` cho tin có đủ tên doanh nghiệp, mô tả công việc và yêu cầu ứng viên.
- Thông báo IndexNow khi admin đăng, sửa, ẩn hoặc xóa tin.
- Tùy chọn thông báo Google Indexing API riêng cho các trang đủ điều kiện `JobPosting`.

### Trường mới trong `/admin`

Khi tạo hoặc sửa tin, nên điền đủ:

- Doanh nghiệp tuyển dụng.
- Loại hình việc làm.
- Hạn ứng tuyển.
- Giới thiệu ngắn.
- Mô tả công việc.
- Yêu cầu ứng viên.
- Quyền lợi.

Chỉ dùng tin tuyển dụng có thật và còn nhận hồ sơ. Tin không đủ nội dung vẫn có trang riêng và nằm trong sitemap, nhưng mã `JobPosting` sẽ không được thêm để tránh dữ liệu có cấu trúc không chính xác.

### Bật IndexNow

Tạo một chuỗi ngẫu nhiên dài, ví dụ:

```bash
openssl rand -hex 24
```

Thêm vào **Production → Variables and Secrets**:

```text
INDEXNOW_KEY = <chuỗi-vừa-tạo>
```

Trang xác minh khóa được phục vụ tự động tại:

```text
https://sanvendo.com/api/indexnow-key
```

### Bật Google Indexing API cho tin tuyển dụng

Đây là cấu hình tùy chọn. Cần hoàn tất trong Google Cloud và Google Search Console trước:

1. Xác minh quyền sở hữu `https://sanvendo.com/` trong Search Console.
2. Tạo Google Cloud project, bật Indexing API và tạo service account.
3. Thêm email service account làm chủ sở hữu của Search Console property.
4. Tải JSON key của service account.
5. Dán toàn bộ JSON vào Cloudflare secret:

```text
GOOGLE_INDEXING_SERVICE_ACCOUNT = {"type":"service_account",...}
```

Không tải tệp JSON khóa lên GitHub. Khi biến này chưa được cấu hình, website vẫn hoạt động bình thường và vẫn dùng sitemap + IndexNow.

### Cấu hình miền chính tùy chọn

Mặc định mã dùng `https://sanvendo.com`. Nếu đổi tên miền, thêm:

```text
SITE_ORIGIN = https://ten-mien-moi.example
```

Đồng thời cập nhật URL cố định trong `public/index.html` và `public/robots.txt`.

### Sau khi triển khai

1. Mở `https://sanvendo.com/robots.txt`.
2. Mở `https://sanvendo.com/sitemap.xml`.
3. Mở một URL `https://sanvendo.com/jobs/<ma-tin>`.
4. Gửi sitemap trong Google Search Console và Bing Webmaster Tools.
5. Kiểm tra một tin đầy đủ bằng Google Rich Results Test.


## Cập nhật khối tin nổi bật đầu trang

Trong `/admin`, mở hoặc tạo một tin tuyển dụng rồi dùng nhóm **Khối tin nổi bật đầu trang**:

1. Bật **Đưa tin này lên khối “Yêu cầu đang được quan tâm”**.
2. Nhập tối đa ba thẻ, cách nhau bằng dấu phẩy.
3. Nhập số hồ sơ mục tiêu và nhãn góc phải.
4. Bấm **Đăng tin** hoặc **Cập nhật tin**.

Mỗi thời điểm chỉ có một tin nổi bật. Khi chọn tin mới, hệ thống tự bỏ trạng thái nổi bật của tin cũ. Tiêu đề, địa điểm, loại hình việc làm, mức lương và nút gửi yêu cầu tương tự trên trang chủ sẽ tự cập nhật từ dữ liệu `/admin`.

## Cập nhật 10 ngành nghề và chức năng xóa dữ liệu

Danh mục ngành nghề trên trang chủ và biểu mẫu quản trị gồm:

1. Kinh doanh & Bán hàng
2. Marketing & Truyền thông
3. Kế toán & Tài chính
4. Hành chính & Nhân sự
5. Công nghệ thông tin
6. Sản xuất, Kỹ thuật & QA/QC
7. Kho vận & Chuỗi cung ứng
8. Chăm sóc khách hàng
9. Lao động phổ thông & Vận hành
10. Bán lẻ, Nhà hàng & Dịch vụ

Trong `/admin`, bảng **Yêu cầu tuyển dụng** và **Hồ sơ ứng viên** có thêm nút xóa. Hệ thống yêu cầu xác nhận trước khi xóa. Xóa hồ sơ ứng viên sẽ xóa luôn object CV tương ứng trong R2 và không thể khôi phục.


## Bản bổ sung mới

- Hiển thị đủ 10 ngành nghề theo dạng 5 ô mỗi hàng trên máy tính; JavaScript tự bổ sung ô còn thiếu nếu trình duyệt còn cache HTML cũ.
- Nút `Xóa tin` của yêu cầu doanh nghiệp và hồ sơ ứng viên được chuyển lên ngay sau tên bản ghi để luôn nhìn thấy mà không cần kéo bảng sang phải.
- Thêm tiếng Nhật `日本語`, tham số `?lang=ja`, SEO `hreflang=ja` và khối nhập bản dịch tiếng Nhật trong `/admin`.
