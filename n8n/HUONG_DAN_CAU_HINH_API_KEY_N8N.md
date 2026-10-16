# HƯỚNG DẪN CẤU HÌNH API KEY & CREDENTIALS CHO 3 WORKFLOW N8N

Tài liệu này dùng để gửi cho bạn trong nhóm khi nhập (import) 3 workflow n8n thuộc phân hệ Tuyển dụng AI (Recruitment Multi-Agent):
1. **WF_04**: `HR Core Day 2 - AI Recruitment Multi-Branch Pipeline` (Phân tích CV & Chấm điểm Gemini AI)
2. **WF_05**: `[HR] WF_05 - Enterprise Smart Interview Orchestrator & Calendar Sync` (Xếp lịch phỏng vấn & Tạo Google Meet)
3. **WF_06**: `[HR] WF_06 - Polite Rejection Notification & Talent Pool Retention` (Thư từ chối & Phân loại Kho nhân tài)

---

## 1. TỔNG QUAN CÁC KEY & CREDENTIALS CẦN THIẾT

| STT | Tên Credential trong n8n | Loại Credential (Type) | Sử dụng ở Workflow nào | Dùng để làm gì |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **`Gemini API Key`** | `Header Auth` (`httpHeaderAuth`) | **WF_04** (Node `Gemini AI: Analyze CV`) | Gọi mô hình Google Gemini để đọc CV và chấm điểm độ phù hợp |
| **2** | **`Gmail SMTP`** | `SMTP` (`smtp`) | **WF_05** (Node `Candidate Email Dispatch`)<br>**WF_06** (Node `Gửi Email Thật`) | Gửi email thư mời phỏng vấn (kèm Google Meet) và thư cảm ơn / lưu kho nhân tài |
| **3** | **`Google Calendar account`** | `Google Calendar OAuth2 API` (`googleCalendarOAuth2Api`) | **WF_05** (Node `Google Calendar: Tạo Sự Kiện & Meet Thật`) | Tự động đặt lịch lên Google Calendar và sinh phòng họp Google Meet thật |
| **4** | **`Backend API Key`** | `Header Auth` hoặc `x-api-key` header | **WF_04**, **WF_05**, **WF_06** | Xác thực khi n8n gọi webhook ngược lại NestJS Backend (`http://host.docker.internal:3001`) |

---

## 2. CÁCH CẤU HÌNH NHANH NHẤT (CÁCH 1: IMPORT FILE CREDENTIALS)

Nếu bạn chạy n8n qua Docker container (ví dụ container tên `hr_n8n`), bạn có thể nạp sẵn toàn bộ credentials bằng 1 lệnh duy nhất:

```bash
# 1. Copy file credentials_import.json vào container
docker cp ./n8n/credentials_import.json hr_n8n:/tmp/credentials_import.json

# 2. Chạy lệnh import n8n
docker exec hr_n8n n8n import:credentials --input=/tmp/credentials_import.json
```
Sau đó vào n8n reload lại trang, mở các node trong 3 workflow lên là sẽ nhận diện credentials ngay lập tức!

---

## 3. CÁCH CẤU HÌNH BẰNG TAY TRÊN GIAO DIỆN N8N (CÁCH 2)

Vào n8n -> Nhìn thanh menu bên trái -> Bấm vào mục **Credentials** -> Bấm **Add Credential**:

### 🔑 3.1. Cấu hình Gemini API Key (Bắt buộc cho WF_04)
1. Bấm **Add Credential** -> Tìm và chọn **Header Auth**.
2. Điền các trường:
   - **Credential Name**: Đặt tên là `Gemini API Key`
   - **Name**: Nhập chính xác `x-goog-api-key`
   - **Value**: Dán API Key của Google Gemini lấy từ [Google AI Studio](https://aistudio.google.com/app/apikey)
3. Bấm **Save**.
4. Mở workflow **WF_04**, click vào node **`Gemini AI: Analyze CV`** -> Ở mục **Credential to connect with**, chọn `Gemini API Key` vừa tạo.

---

### 🔑 3.2. Cấu hình Gmail SMTP (Bắt buộc cho WF_05 & WF_06)
1. Bấm **Add Credential** -> Tìm và chọn **SMTP**.
2. Điền các trường:
   - **Credential Name**: Đặt tên là `Gmail SMTP`
   - **User**: Email Gmail gửi thư của bạn (ví dụ: `your_email@gmail.com`)
   - **Password**: **Mật khẩu ứng dụng (App Password 16 chữ số)** của Gmail:
     - Vào tài khoản Google -> Quản lý tài khoản -> Bảo mật (Security) -> Bật Xác thực 2 bước (2-Step Verification).
     - Tìm mục **Mật khẩu ứng dụng (App Passwords)** -> Đặt tên ứng dụng là `n8n HR` -> Google sẽ sinh ra 16 chữ cái (dạng `xxxx xxxx xxxx xxxx`).
     - Dán 16 chữ cái đó vào trường **Password**.
   - **Host**: `smtp.gmail.com`
   - **Port**: `465`
   - **SSL/TLS**: Bật `ON` (Tích chọn SSL/TLS)
3. Bấm **Save**.
4. Mở **WF_05** (node `Stream 1: Candidate Email Dispatch`) và **WF_06** (node `Stream 1: Gửi Email Thật Qua Gmail SMTP`) -> Chọn Credential `Gmail SMTP`.
   > **Lưu ý quan trọng**: Kiểm tra trường `From Email` trong 2 node trên, đảm bảo trùng với email bạn đã điền ở mục **User**.

---

### 🔑 3.3. Cấu hình Google Calendar & Google Meet (Bắt buộc cho WF_05)
1. Bấm **Add Credential** -> Tìm và chọn **Google Calendar OAuth2 API**.
2. Điền các trường:
   - **Credential Name**: Đặt tên là `Google Calendar account`
   - **Client ID**: Dán Client ID tạo từ Google Cloud Console (OAuth 2.0 Client ID)
   - **Client Secret**: Dán Client Secret tương ứng
3. Bấm nút **Sign in with Google** (hoặc **Connect my account**) -> Chọn tài khoản Google của bạn -> Bấm Cho phép quyền truy cập Calendar.
4. Bấm **Save**.
5. Mở **WF_05**, click vào node **`Google Calendar: Tạo Sự Kiện & Meet Thật`** -> Chọn Credential `Google Calendar account` vừa kết nối.

---

### 🔑 3.4. Cấu hình Backend API Key (NestJS Synchronization)
Trong cả 3 workflow, n8n gọi về NestJS Backend thông qua header `x-api-key`.
- Key giá trị chuẩn: Lấy từ biến môi trường `N8N_API_KEY` trong file `.env` của Backend.
- Đảm bảo trong file `.env` của Backend có cấu hình `N8N_API_KEY` tương ứng.
- URL gọi Backend từ n8n Docker: `http://host.docker.internal:3001`
  *(Nếu chạy trên Linux, file `docker-compose.yml` cần có `extra_hosts: ["host.docker.internal:host-gateway"]`).*

---

## 4. BƯỚC CUỐI CÙNG: KÍCH HOẠT (ACTIVE) 3 WORKFLOW

Sau khi gán đủ credentials, cần bật công tắc **Active** (góc trên bên phải mỗi workflow):
1. **WF_04**: Bật **Active** -> Nhận webhook tại `/webhook/process-cv`
2. **WF_05**: Bật **Active** -> Nhận webhook tại `/webhook/schedule-interview`
3. **WF_06**: Bật **Active** -> Nhận webhook tại `/webhook/rejection-notification`

---

## 5. BẢNG MÃ LỖI THƯỜNG GẶP & CÁCH SỬA

| Lỗi gặp phải | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| `[400/403] API key not valid` ở node Gemini | Sai key Gemini hoặc chưa chọn credential `Gemini API Key` | Kiểm tra lại key Google AI Studio trong Credential Header Auth (`x-goog-api-key`). |
| `535-5.7.8 Username and Password not accepted` ở node Email | Điền mật khẩu đăng nhập thông thường của Gmail thay vì App Password | Phải tạo **App Password (Mật khẩu ứng dụng 16 ký tự)** trong tài khoản Google để dùng. |
| `[401] Unauthorized` khi n8n gọi Backend NestJS | Khác `x-api-key` giữa n8n và file `.env` của backend | Kiểm tra biến `N8N_API_KEY` trong file `.env` của backend xem đã trùng với `750845dc3e9ed5275635283ee9a5d186e94aba1dec18590dd3dd92ff14c39b71` chưa. |
| `ENOTFOUND host.docker.internal` | Container n8n không phân giải được địa chỉ máy host | Thêm `extra_hosts: ["host.docker.internal:host-gateway"]` vào service `n8n` trong `docker-compose.yml`. |
