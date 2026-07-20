# Sanvendo — Pages + R2 + trang quản trị `/admin`

Phiên bản này bao gồm:

- Website tuyển dụng công khai với tin việc làm tải động theo ngành nghề.
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
├── style.css
└── script.js

functions/
├── _lib/
│   ├── access.js
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

Khi chưa có object này, website dùng 8 tin mẫu có sẵn, mỗi ngành một tin. Ngay lần đầu thêm, sửa, ẩn hoặc xóa trong `/admin`, toàn bộ danh sách sẽ được lưu vào R2. Không cần tạo binding hoặc biến môi trường mới.

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
