# Sanvendo — Pages + R2 + trang quản trị `/admin`

Phiên bản này bao gồm:

- Website tuyển dụng công khai.
- Form doanh nghiệp lưu yêu cầu tuyển dụng thật vào R2 và hiển thị trong trang quản trị.
- Form ứng viên cho phép gửi thông tin không cần CV; CV PDF/DOC/DOCX là tùy chọn, tối đa 10 MB.
- Lưu CV hoặc bản ghi thông tin ứng viên không có CV vào bucket R2 riêng tư `sanvendo-private-cv`.
- Trang quản trị tại `https://sanvendo.com/admin`.
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
├── style.css
└── script.js

functions/
├── _lib/
│   └── access.js
├── admin/
│   ├── _middleware.js
│   └── api/
│       ├── candidates.js
│       ├── download.js
│       ├── me.js
│       └── requests.js
└── api/
    ├── recruitment-request.js
    └── upload-cv.js
```

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
4. Gửi thử biểu mẫu doanh nghiệp ở trang chủ; yêu cầu phải xuất hiện trong mục `Yêu cầu tuyển dụng` tại `/admin`.
5. Danh sách hồ sơ trong R2 phải hiển thị, kể cả hồ sơ chưa gửi CV.
6. Hồ sơ có CV hiện nút `Tải CV`; hồ sơ không có CV hiện `Chưa gửi CV`.
7. Truy cập `https://sanvendo.pages.dev/admin` phải bị từ chối.

## Đăng xuất

Nút Đăng xuất dẫn đến:

```text
https://sanvendo.com/cdn-cgi/access/logout
```

## Lưu ý

Trang quản trị phiên bản đầu đọc thông tin ứng viên từ `customMetadata` của từng object R2. Khi cần trạng thái xử lý hồ sơ, ghi chú, phân công nhân viên hoặc lịch sử thay đổi, nên bổ sung Cloudflare D1.
