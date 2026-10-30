# 🚀 Hệ Thống 12 Workflows Tự Động Hóa Nhân Sự & Hạ Tầng (HR Automation Platform)

> **Tài liệu đặc tả kiến trúc kỹ thuật và chi tiết từng node cho toàn bộ 12 Workflows n8n.**  
> Hệ thống kết nối đồng bộ giữa **Next.js 16 (Port 3000)**, **NestJS Backend (Port 3001)**, **PostgreSQL (Port 5432)** và **n8n Automation Engine (host 5679, container 5678)** cùng công nghệ AI tiên tiến (Google Gemini).

---

## 🗺️ Bản Đồ Phân Bổ 5 AI Agents & 12 Workflows

| Cụm Nghiệp Vụ / Agent | Mã Workflow | Tên Workflow | Số Nút | Cơ Chế Kích Hoạt |
| :--- | :--- | :--- | :---: | :--- |
| **Agent 5: Employee Engagement** | **WF 01** | Smart Survey Intake, Google Sheets Sync & Gemini AI Multi-Category | 12 | Webhook |
| **Agent 5: Employee Engagement** | **WF 02** | Automated Wellbeing Action Dispatcher & Gemini AI Intervention | 11 | Webhook |
| **Agent 5: Employee Engagement** | **WF 03** | Weekly Pulse Survey Dispatcher, Google Sheets & Gemini AI eNPS | 11 | Schedule (09:00 Thứ 2) |
| **Agent 1: AI Recruitment (ATS)** | **WF 04** | AI Recruitment Multi-Branch Pipeline (CV Parsing & Scoring) | 45 | Webhook (`process-cv`) |
| **Agent 1: AI Recruitment (ATS)** | **WF 05** | Enterprise Smart Interview Orchestrator & Calendar Sync | 19 | Webhook (`schedule-interview`) |
| **Agent 1: AI Recruitment (ATS)** | **WF 06** | Polite Rejection Notification & Talent Pool Retention | 14 | Webhook (`rejection-notification`) |
| **Agent 2: AI Onboarding** | **WF 07** | Automated IT Tool Provisioning (Okta, Jira, Slack, Email) | 12 | Webhook (`it-provisioning`) |
| **Agent 2: AI Onboarding** | **WF 08** | First Week Check-in & Buddy Mentor Progress Tracking | 11 | Schedule (Thứ 6 hàng tuần) |
| **Agent 3: AI Performance** | **WF 09** | 360° Feedback Reminder & Magic Link Review Pipeline | 11 | Schedule (Ngày 25 hàng tháng) |
| **Agent 4: AI Skills & Training** | **WF 10** | Certification Expiration Alert & Re-cert Pipeline | 12 | Schedule (00:00 Hàng ngày) |
| **Agent 4: AI Skills & Training** | **WF 11** | AI Skill Gap Analysis & Smart Course Recommender | 12 | Webhook (`recommend-courses`) |
| **Platform DevOps SRE** | **WF 12** | Enterprise Infrastructure Health & Uptime Monitor | 12 | Schedule (Mỗi 15 phút) |

---

## 📋 Chi Tiết 12 Workflows Theo Từng Node

---

### 1. 📊 [HR] WF 01 - Smart Survey Intake, Google Sheets Sync & Gemini AI Multi-Category
*Tiếp nhận ý kiến nhân sự, phân loại chủ đề bằng Gemini AI, đồng bộ Google Sheets và kích hoạt can thiệp khi có nguy cơ kiệt sức.*

| STT | Tên Node | Loại Node (n8n Type) | Chức Năng Chi Tiết |
| :---: | :--- | :--- | :--- |
| **1** | `Webhook: Tiếp Nhận Bài Khảo Sát` | `n8n-nodes-base.webhook` | Lắng nghe payload gửi từ form khảo sát người lao động |
| **2** | `Chuẩn Hóa & Tiền Xử Lý Dữ Liệu` | `n8n-nodes-base.code` | Làm sạch chuỗi, định dạng thời gian và chuẩn hóa thông tin phòng ban |
| **3** | `Sheets: Lưu Dữ Liệu Gốc` | `n8n-nodes-base.httpRequest` | Ghi bản ghi thô vào Google Sheets trung tâm để kiểm toán |
| **4** | `Google Gemini: Phân Loại Chủ Đề & Đánh Giá Cảm Xúc` | `@n8n/n8n-nodes-langchain.googleGemini` | Phân tích cảm xúc (Sentiment) & phân loại nguy cơ Burnout qua AI |
| **5** | `Bóc Tách & Chuẩn Hóa Kết Quả AI` | `n8n-nodes-base.code` | Trích xuất JSON điểm Sentiment (-1 đến +1) và danh mục can thiệp |
| **6** | `Sheets: Cập Nhật Báo Cáo AI` | `n8n-nodes-base.httpRequest` | Bổ sung cột đánh giá của AI vào bảng tính Google Sheets |
| **7** | `PostgreSQL: Đồng Bộ DB Backend` | `n8n-nodes-base.code` | Cập nhật chỉ số hạnh phúc nhân sự vào cơ sở dữ liệu NestJS Backend |
| **8** | `IF: Nguy Cơ Kiệt Sức / Bất Mãn Cao?` | `n8n-nodes-base.if` | Điều kiện rẽ nhánh: Sentiment tiêu cực hoặc cảnh báo kiệt sức |
| **9** | `Slack: Cảnh Báo Khẩn Tới HR Lead` | `n8n-nodes-base.httpRequest` | Gửi tin nhắn khẩn tới HR Lead để can thiệp kịp thời |
| **10** | `Gmail: Gửi Thư Đề Xuất Hỗ Trợ 1-on-1` | `n8n-nodes-base.emailSend` | Tự động gửi email ân cần mời nhân viên trò chuyện với cố vấn |
| **11** | `Ghi Nhận Mức Độ Gắn Kết Tốt` | `n8n-nodes-base.code` | Lưu nhận xét tích cực đối với các phản hồi vui vẻ, thỏa mãn |
| **12** | `Phản Hồi Webhook Realtime` | `n8n-nodes-base.respondToWebhook` | Trả mã 200 OK và kết quả phân tích AI về giao diện Portal |

---

### 2. 💖 [HR] WF 02 - Automated Wellbeing Action Dispatcher & Gemini AI Intervention
*Điều phối hành động chăm sóc đời sống, gửi voucher nghỉ dưỡng/cafe hoặc lên lịch 1-on-1 lắng nghe.*

| STT | Tên Node | Loại Node (n8n Type) | Chức Năng Chi Tiết |
| :---: | :--- | :--- | :--- |
| **1** | `Webhook: Kích Hoạt Can Thiệp Wellbeing` | `n8n-nodes-base.webhook` | Tiếp nhận tín hiệu cảnh báo căng thẳng từ hệ thống nhân sự |
| **2** | `Tra Cứu & Chuẩn Hóa Lịch Sử Sức Khỏe` | `n8n-nodes-base.code` | Tổng hợp lịch sử khảo sát gần nhất và thời gian làm việc ngoài giờ |
| **3** | `Google Gemini: Đề Xuất Phác Thảo Chăm Sóc Đời Sống` | `@n8n/n8n-nodes-langchain.googleGemini` | AI phân tích nguyên nhân và đề xuất phương án hỗ trợ cá nhân hóa |
| **4** | `Đóng Gói Gói Hỗ Trợ Đời Sống` | `n8n-nodes-base.code` | Tạo mã quà tặng, liên kết tài liệu giảm stress và nội dung động viên |
| **5** | `Switch: Phân Loại Gói Chăm Sóc` | `n8n-nodes-base.switch` | Điều hướng: Gửi E-Voucher Cafe vs Họp 1-on-1 vs Cẩm nang Mindfulness |
| **6** | `Gmail: Gửi E-Voucher Nghỉ Dưỡng / Cafe` | `n8n-nodes-base.emailSend` | Gửi mã voucher điện tử qua email tới nhân viên bằng SMTP đã xác thực |
| **7** | `Slack: Điều Phối Buổi 1-on-1 Lắng Nghe` | `n8n-nodes-base.httpRequest` | Tạo lịch trò chuyện riêng tư với chuyên gia tâm lý hoặc HR Mentor |
| **8** | `Gmail: Gửi Cẩm Nang Mindfulness & Đề Xuất Giảm Tải` | `n8n-nodes-base.emailSend` | Gửi tài liệu thực hành giảm tải công việc và bài tập hít thở |
| **9** | `Sheets: Ghi Nhật Ký Chăm Sóc Nhân Viên` | `n8n-nodes-base.httpRequest` | Lưu dấu vết hành động can thiệp vào bảng theo dõi phúc lợi |
| **10** | `PostgreSQL: Đồng Bộ Trạng Thái Chăm Sóc` | `n8n-nodes-base.code` | Cập nhật cờ `WELLBEING_RESOLVED` trong cơ sở dữ liệu nội bộ |
| **11** | `Phản Hồi Hoàn Tất Can Thiệp (200 OK)` | `n8n-nodes-base.respondToWebhook` | Xác nhận luồng chăm sóc nhân sự đã thực thi thành công |

---

### 3. 📈 [HR] WF 03 - Weekly Pulse Survey Dispatcher, Google Sheets & Gemini AI eNPS
*Tự động phát động khảo sát nhịp đập doanh nghiệp sáng Thứ 2, tính toán chỉ số eNPS và báo cáo lãnh đạo.*

| STT | Tên Node | Loại Node (n8n Type) | Chức Năng Chi Tiết |
| :---: | :--- | :--- | :--- |
| **1** | `Cron: 09:00 Thứ 2 Hàng Tuần` | `n8n-nodes-base.scheduleTrigger` | Lên lịch định kỳ chạy tự động đầu tuần lúc 09:00 sáng |
| **2** | `Truy Vấn Danh Sách Nhân Sự` | `n8n-nodes-base.code` | Lấy danh sách nhân viên đang công tác từ cơ sở dữ liệu |
| **3** | `IF: Nhân Viên Đang Làm Việc (Active)` | `n8n-nodes-base.if` | Lọc bỏ các tài khoản nghỉ phép dài hạn hoặc đã thôi việc |
| **4** | `Tạo Magic Link & Token Khảo Sát Tuần` | `n8n-nodes-base.code` | Tạo đường dẫn khảo sát an toàn chứa mã định danh duy nhất |
| **5** | `Switch: Kênh Gửi Khảo Sát (Email vs Slack)` | `n8n-nodes-base.switch` | Điều hướng kênh tương tác ưa thích của từng phòng ban |
| **6** | `Gmail: Gửi Thư Mời Khảo Sát Tuần` | `n8n-nodes-base.emailSend` | Gửi email khảo sát nhịp đập nhanh gọn (1 câu hỏi) |
| **7** | `Slack: Gửi Khảo Sát Vào Kênh Team` | `n8n-nodes-base.httpRequest` | Bắn bot nhắc nhở tham gia khảo sát trong kênh Slack nội bộ |
| **8** | `Tổng Hợp Chỉ Số eNPS & Tỷ Lệ Gắn Kết` | `n8n-nodes-base.code` | Tính toán chỉ số eNPS (% Promoters trừ % Detractors) |
| **9** | `Google Gemini: Phân Tích Xu Hướng & Báo Cáo Lãnh Đạo` | `@n8n/n8n-nodes-langchain.googleGemini` | Tóm lược điểm nổi bật và đề xuất cải tiến cho ban điều hành |
| **10** | `Sheets: Lưu Báo Cáo eNPS Executive` | `n8n-nodes-base.httpRequest` | Ghi báo cáo chỉ số gắn kết tuần vào Google Sheets của BOD |
| **11** | `Slack: Báo Cáo Tổng Kết Tuần Tới Leadership` | `n8n-nodes-base.httpRequest` | Bắn thông báo ngắn gọn chỉ số tuần vào kênh riêng của Ban Giám Đốc |

---

### 4–6. Tuyển dụng Hybrid có bằng chứng (bản nâng cấp 30/10/2026)

- **WF_04 — 45 node xử lý:** claim có xác thực, PDF parsing, JD/rubric đã duyệt, Gemini structured extraction, kiểm tra bằng chứng, scoring quy tắc, callback theo phiên và nhánh HR review.
- **WF_05 — 19 node:** tác vụ phỏng vấn đã duyệt, Calendar/Meet thật, email và attachment ICS, lưu kết quả provider.
- **WF_06 — 14 node:** phản hồi đã duyệt, Talent Pool, link CX có chữ ký và lưu kết quả SMTP.

Không tự tạo điểm khi AI/PDF lỗi; không tự gửi thư từ chối chỉ dựa vào điểm. Backend tính lại điểm, giữ lịch sử và chặn callback/tác vụ trùng.

Xem **[hướng dẫn Hybrid Recruitment](../docs/HYBRID_RECRUITMENT.md)** để cấu hình, duyệt rubric, demo, kiểm thử và import/publish. Các số node trong những bản backup là phiên bản cũ.

---

### 7. 💻 WF 07 - Automated IT Tool Provisioning
*Cấp phát tài khoản công nghệ thông tin tự động cho nhân sự mới (Email công ty, Okta, Jira, Slack).*

| STT | Tên Node | Loại Node (n8n Type) | Chức Năng Chi Tiết |
| :---: | :--- | :--- | :--- |
| **1** | `1. Webhook Trigger` | `n8n-nodes-base.webhook` | Tiếp nhận sự kiện nhân viên mới hoàn tất đăng ký nhận việc |
| **2** | `2. Sanitize Data` | `n8n-nodes-base.set` | Chuẩn hóa họ tên, chức danh và phòng ban của nhân sự mới |
| **3** | `3. Validate Email` | `n8n-nodes-base.if` | Kiểm tra định dạng email và tính hợp lệ của dữ liệu nhân viên |
| **4** | `4. Error Response` | `n8n-nodes-base.respondToWebhook` | Trả mã lỗi 400 nếu dữ liệu đầu vào thiếu trường bắt buộc |
| **5** | `5. Generate Credentials` | `n8n-nodes-base.code` | Tự động tạo email công ty (`@company.vn`) và mật khẩu ngẫu nhiên |
| **6** | `6. Check Department` | `n8n-nodes-base.if` | Rẽ nhánh phần mềm theo phòng ban: Khối Công nghệ vs Khối Chung |
| **7** | `7. Setup Tech Stack (Jira/Slack)` | `n8n-nodes-base.set` | Cấu hình cấp quyền Jira Software, GitHub Organization, Docker Hub |
| **8** | `8. Setup Standard Stack` | `n8n-nodes-base.set` | Cấu hình cấp quyền Office 365, Slack Workspace và HR Portal |
| **9** | `9. Mock IT Provisioning API` | `n8n-nodes-base.code` | Khởi tạo tài khoản thực tế qua API quản lý truy cập (IdP/Okta) |
| **10** | `10. Send Notification Email` | `n8n-nodes-base.emailSend` | Gửi thông tin tài khoản đăng nhập và hướng dẫn cho nhân viên mới |
| **11** | `11. Audit Log Database` | `n8n-nodes-base.set` | Ghi vết cấp phát bảo mật vào hệ thống quản lý quyền truy cập |
| **12** | `12. Respond to Frontend` | `n8n-nodes-base.respondToWebhook` | Trả phản hồi thành công và thông tin tài khoản về Portal Onboarding |

---

### 8. 🤝 WF 08 - First Week Check-in & Buddy Mentor Progress Tracking
*Theo dõi tiến độ tuần đầu tiên của nhân sự mới, kích hoạt cảnh báo khi tiến độ < 50% và kết nối người hướng dẫn (Mentor).*

| STT | Tên Node | Loại Node (n8n Type) | Chức Năng Chi Tiết |
| :---: | :--- | :--- | :--- |
| **1** | `1. Cronjob Schedule` | `n8n-nodes-base.scheduleTrigger` | Lên lịch định kỳ chạy vào chiều Thứ 6 hàng tuần |
| **2** | `2. Fetch Onboarding List` | `n8n-nodes-base.set` | Lấy danh sách toàn bộ nhân sự đang trong tuần làm việc đầu tiên |
| **3** | `3. Calculate Progress %` | `n8n-nodes-base.code` | Tính toán tỷ lệ phần trăm hoàn thành checklist hội nhập (0 - 100%) |
| **4** | `4. Check Progress < 50%` | `n8n-nodes-base.if` | Kiểm tra nhân sự có gặp khó khăn (tiến độ hoàn thành dưới 50%) |
| **5** | `5. Flag Low Progress` | `n8n-nodes-base.set` | Đánh cờ báo động `LOW_PROGRESS` cần sự trợ giúp từ HR/Mentor |
| **6** | `6. Flag Completed` | `n8n-nodes-base.set` | Đánh cờ `ON_TRACK` ghi nhận sự thích nghi tốt của nhân sự mới |
| **7** | `7. Prepare Reminder Message` | `n8n-nodes-base.set` | Soạn nội dung nhắc nhở các tác vụ hội nhập còn dang dở |
| **8** | `8. Send Slack to Employee` | `n8n-nodes-base.httpRequest` | Bắn tin nhắn Slack thân thiện hỏi thăm cảm nghĩ tuần đầu tiên |
| **9** | `9. Notify HR Mentor Email` | `n8n-nodes-base.emailSend` | Gửi email báo cáo tiến độ cho Buddy/Mentor để kịp thời đồng hành |
| **10** | `10. Log Checkin Status` | `n8n-nodes-base.set` | Ghi nhận mốc check-in ngày thứ 7 vào hồ sơ nhân sự |
| **11** | `11. Update DB State` | `n8n-nodes-base.set` | Cập nhật trạng thái tiến độ vào cơ sở dữ liệu Onboarding |

---

### 9. 🔄 WF 09 - 360° Feedback Reminder & Magic Link Review Pipeline
*Tự động phát động kỳ đánh giá 360° định kỳ, sinh liên kết đăng nhập an toàn (Magic Link) và lọc nhân sự chưa hoàn thành.*

| STT | Tên Node | Loại Node (n8n Type) | Chức Năng Chi Tiết |
| :---: | :--- | :--- | :--- |
| **1** | `1. Monthly Cronjob (25th)` | `n8n-nodes-base.scheduleTrigger` | Lên lịch tự động chạy vào 09:00 sáng ngày 25 hàng tháng |
| **2** | `2. Query Pending Reviews` | `n8n-nodes-base.set` | Lấy danh sách các cặp đánh giá (Đồng nghiệp chéo / Quản lý / Cá nhân) |
| **3** | `3. Generate Magic Links` | `n8n-nodes-base.code` | Sinh token bảo mật gắn vào Magic Link đánh giá 360° không cần login |
| **4** | `4. Check Submission Status` | `n8n-nodes-base.if` | Kiểm tra nhân viên đã hoàn thành biểu mẫu đánh giá hay chưa |
| **5** | `5. Filter Unsubmitted Users` | `n8n-nodes-base.set` | Lọc nhóm nhân sự còn đang trễ hạn nộp phiếu đánh giá |
| **6** | `6. Skip Completed Users` | `n8n-nodes-base.set` | Bỏ qua các nhân viên đã nộp đủ để tránh làm phiền |
| **7** | `7. Build Email Template` | `n8n-nodes-base.set` | Dựng mẫu email nhắc nhở kèm nút bấm Magic Link trực tiếp |
| **8** | `8. Send Magic Link Email` | `n8n-nodes-base.emailSend` | Gửi email nhắc nhở kèm thời hạn hoàn thành còn 48 giờ |
| **9** | `9. Send Telegram/Slack Alert` | `n8n-nodes-base.httpRequest` | Bắn thông báo nhanh vào kênh phòng ban để đốc thúc tiến độ |
| **10** | `10. Log Reminder History` | `n8n-nodes-base.set` | Lưu lại số lần đã nhắc nhở (`reminder_count`) vào hệ thống |
| **11** | `11. Finalize Tracking` | `n8n-nodes-base.set` | Tổng hợp tỷ lệ tham gia đánh giá 360° gửi về Dashboard KPI |

---

### 10. 🎓 [HR] WF 10 - Certification Expiration Alert & Re-cert Pipeline
*Quản lý và cảnh báo chứng chỉ chuyên môn sắp hết hạn & Tự động đề xuất lịch thi gia hạn.*

| STT | Tên Node | Loại Node (n8n Type) | Chức Năng Chi Tiết |
| :---: | :--- | :--- | :--- |
| **1** | `1. Daily Schedule (00:00)` | `n8n-nodes-base.scheduleTrigger` | Kích hoạt quét tự động hàng ngày lúc nửa đêm (00:00) |
| **2** | `2. Query Expiring Certifications` | `n8n-nodes-base.postgres` | Truy vấn danh sách chứng chỉ sắp hết hạn trong cơ sở dữ liệu PostgreSQL |
| **3** | `3. Calculate Days Left & Expiry Status` | `n8n-nodes-base.code` | Tính số ngày còn lại (`days_left`), xác định cờ quá hạn (`is_expired`) |
| **4** | `4. Check Has Expiring Certs?` | `n8n-nodes-base.if` | Kiểm tra xem có chứng chỉ nào trong diện cảnh báo hay không |
| **5** | `5. Handle No Expiring Certs` | `n8n-nodes-base.noOp` | Kết thúc nhẹ nhàng chu kỳ quét khi toàn bộ chứng chỉ còn hạn an toàn |
| **6** | `6. Classify Urgency Level (30d vs 7d vs Expired)` | `n8n-nodes-base.switch` | Phân loại mức độ: Khẩn cấp (≤ 7 ngày) vs Tiêu chuẩn (8 - 30 ngày) |
| **7** | `7. High Urgency Alert Packet (<= 7 days)` | `n8n-nodes-base.set` | Đóng gói nhãn khẩn cấp `🚨 KHẨN CẤP: Còn dưới 7 ngày` (Màu đỏ) |
| **8** | `8. Standard Reminder Packet (8 - 30 days)` | `n8n-nodes-base.set` | Đóng gói nhãn nhắc nhở `⚠️ NHẮC NHỞ: Hết hạn trong 30 ngày` (Màu vàng) |
| **9** | `9. Consolidate Alert Stream` | `n8n-nodes-base.code` | Dựng mẫu HTML thông báo tài trợ 100% lệ phí thi gia hạn chứng chỉ |
| **10** | `10. Send Expiration Warning Email` | `n8n-nodes-base.emailSend` | Gửi email trực tiếp đến nhân sự và Bộ phận Quản lý Đào tạo |
| **11** | `11. Dispatch HR & Mentor Slack Alert` | `n8n-nodes-base.httpRequest` | Bắn tin nhắn vào kênh Slack `#hr-certifications-alert` |
| **12** | `12. Log Expiration Tracking to Backend` | `n8n-nodes-base.httpRequest` | Lưu nhật ký kiểm toán gia hạn chứng chỉ vào Backend |

---

### 11. 🚀 [HR] WF 11 - AI Skill Gap Analysis & Smart Course Recommender
*Phân tích khoảng cách kỹ năng (Skill Gap) & Tự động gợi ý khóa học (Coursera / Udemy / LinkedIn Learning).*

| STT | Tên Node | Loại Node (n8n Type) | Chức Năng Chi Tiết |
| :---: | :--- | :--- | :--- |
| **1** | `1. Webhook Intake (Employee / Dept)` | `n8n-nodes-base.webhook` | Tiếp nhận yêu cầu rà soát năng lực của nhân sự hoặc phòng ban |
| **2** | `2. Sanitize & Normalize Input` | `n8n-nodes-base.set` | Làm sạch ID nhân sự, chức danh và thông tin đơn vị yêu cầu |
| **3** | `3. Query Skill Gaps from Database` | `n8n-nodes-base.postgres` | Truy vấn bảng `employee_skills`, so sánh `current_level` với `required_level` |
| **4** | `4. Check Skill Gaps Identified?` | `n8n-nodes-base.if` | Kiểm tra nhân sự có kỹ năng nào chưa đạt mức yêu cầu không |
| **5** | `5. Handle Zero Skill Gap (All Competent)` | `n8n-nodes-base.set` | Trả về thông báo năng lực đã đạt chuẩn 100% nếu không có khoảng cách |
| **6** | `6. Score Gap Severity & Priority Engine` | `n8n-nodes-base.code` | Tính điểm chênh lệch (Gap points) & xếp độ ưu tiên (CRITICAL vs MODERATE) |
| **7** | `7. Route Training Path (Tech vs Leadership)` | `n8n-nodes-base.switch` | Phân nhánh: Kỹ năng Chuyên môn Kỹ thuật vs Lãnh đạo / Phương pháp Agile |
| **8** | `8. Map Specialized Tech Courses (Coursera/Udemy)` | `n8n-nodes-base.set` | Khớp lộ trình kỹ thuật: AWS Cloud, Python AI, Docker Kubernetes |
| **9** | `9. Map Leadership & Agile Coaching Path` | `n8n-nodes-base.set` | Khớp lộ trình quản trị: Scrum Master, Leadership Coaching, Giao tiếp |
| **10** | `10. Consolidate Recommended Learning Paths` | `n8n-nodes-base.code` | Tạo mẫu email đào tạo và nút kích hoạt bản quyền khóa học cá nhân hóa |
| **11** | `11. Dispatch Training Plan Email to Employee` | `n8n-nodes-base.emailSend` | Gửi lộ trình nâng cấp kỹ năng tới email nhân viên qua SMTP |
| **12** | `12. Return Final Recommendation Payload` | `n8n-nodes-base.respondToWebhook` | Trả payload kết quả khóa học đề xuất về Portal Đào tạo |

---

### 12. 🌐 [HR] WF 12 - Enterprise Infrastructure Health & Uptime Monitor
*Giám sát nhịp đập hạ tầng hệ thống định kỳ (Frontend, Backend, Database) & Báo động sự cố tức thì.*

| STT | Tên Node | Loại Node (n8n Type) | Chức Năng Chi Tiết |
| :---: | :--- | :--- | :--- |
| **1** | `1. Schedule Heartbeat (15 mins)` | `n8n-nodes-base.scheduleTrigger` | Chu kỳ kích hoạt kiểm tra nhịp tim hệ thống định kỳ mỗi 15 phút |
| **2** | `2. Probe Web Frontend (Port 3000)` | `n8n-nodes-base.httpRequest` | Thăm dò phản hồi trang giao diện Next.js 16 (`http://host.docker.internal:3000`) |
| **3** | `3. Probe Backend API (Port 3001)` | `n8n-nodes-base.httpRequest` | Thăm dò phản hồi Core API NestJS (`http://host.docker.internal:3001/departments`) |
| **4** | `4. Probe DB & Core Endpoints` | `n8n-nodes-base.httpRequest` | Thăm dò kết nối Database PostgreSQL qua API tuyển dụng bảo mật `x-api-key` |
| **5** | `5. Aggregate Metrics & Latency Evaluator` | `n8n-nodes-base.code` | Đánh giá tỷ lệ sống (Uptime %), tổng hợp danh sách dịch vụ bị gián đoạn |
| **6** | `6. Health Status Evaluator (All UP vs Degraded)` | `n8n-nodes-base.if` | Kiểm tra điều kiện: Toàn bộ 100% dịch vụ UP hay đang bị sự cố |
| **7** | `7. Healthy Green State Logger` | `n8n-nodes-base.set` | Đóng gói nhãn xanh `🟢 HỆ THỐNG VẬN HÀNH ỔN ĐỊNH (100% HEALTHY)` |
| **8** | `8. Failure & Degraded State Formatter` | `n8n-nodes-base.code` | Dựng gói tin báo động khẩn cấp và giao diện email sự cố màu đỏ |
| **9** | `9. Dispatch Emergency Chat Alert (Slack/Webhook)` | `n8n-nodes-base.httpRequest` | Bắn tin nhắn khẩn cấp tới kênh trực ban kỹ thuật / DevOps Slack |
| **10** | `10. Send Incident Email to DevOps Lead` | `n8n-nodes-base.emailSend` | Gửi email cảnh báo hạ tầng trực tiếp tới quản trị viên qua SMTP |
| **11** | `11. Record Health Snapshot to Backend` | `n8n-nodes-base.httpRequest` | Lưu bản ghi snapshot lịch sử uptime vào cơ sở dữ liệu kiểm toán |
| **12** | `12. Finalize Health Metric Audit` | `n8n-nodes-base.code` | Kết thúc chu kỳ giám sát và trả về báo cáo audit tổng thể |

---

## ⚙️ Hướng Dẫn Thử Nghiệm Trên n8n Canvas

1. Mở n8n UI tại [http://localhost:5678](http://localhost:5678).
2. Chọn bất kỳ Workflow nào từ **WF 01** đến **WF 12**.
3. Nếu vừa cập nhật, nhấn **`F5`** (hoặc `Ctrl + R`) để trình duyệt tải lại `pinData` và sơ đồ mới nhất.
4. Nhấn nút **Execute workflow** (nút màu cam ở góc dưới màn hình).
5. Toàn bộ các node trong workflow sẽ tự động chạy qua dữ liệu mẫu được ghim sẵn và sáng xanh thành công!
