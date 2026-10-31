# Kế Hoạch Nâng Cấp Toàn Diện Workflow HR Chuẩn Doanh Nghiệp Thực Tế (Enterprise HR Tech Pipeline)

Tài liệu này định hình lộ trình nâng cấp hệ sinh thái tự động hóa nhân sự (12 Workflows n8n + NestJS Backend + PostgreSQL) nhằm chuyển dịch từ các kịch bản mẫu/mock đơn giản sang hệ thống tự động hóa vận hành thực tế đạt chuẩn của các công ty công nghệ vừa và lớn (Tech Enterprises / IT Product / Tech Startups).

---

## 1. Bối Cảnh & Hiện Trạng Hệ Thống

* **Nhóm Tuyển Dụng (WF_04, WF_05, WF_06) - ĐÃ HOÀN THÀNH:**
  * WF_04: Phân tích CV bằng AI (Gemini), Deep Tech ATS scoring, chống nhồi từ khóa (keyword stuffing penalty), phân loại tự động.
  * WF_05: Điều phối lịch phỏng vấn, Google Calendar sync, Interview Kit 3-5 câu kỹ thuật chuyên sâu theo domain.
  * WF_06: Gửi email từ chối lịch sự và lưu trữ Talent Pool phân loại theo 4 domain công nghệ (Frontend, Backend, DevOps, Data/AI).
* **Nhóm Còn Lại (WF_07 - WF_12 & WF_01 - WF_03) - CẦN NÂNG CẤP THỰC TẾ:**
  * `WF_07` (IT Provisioning) & `WF_08` (First Week Check-in): Đang sử dụng dữ liệu giả lập (mock node / set node), chưa đọc ghi trực tiếp bảng `onboarding_tasks` và `users` trong cơ sở dữ liệu PostgreSQL thật; chưa phân loại trang thiết bị IT theo tính chất phòng ban (Tech vs Non-tech).
  * `WF_09` (360 Feedback): Dùng mock, chưa truy vấn bảng `feedbacks` trong database và chưa có cơ chế tính điểm KPI tổng hợp định kỳ.
  * `WF_10` (Hạn chứng chỉ) & `WF_11` (Skill Gap AI): Mới chỉ có truy vấn đơn giản, chưa tích hợp Gemini AI phân tích khoảng trống năng lực (Skill Gap) và đề xuất khóa học cụ thể theo lộ trình 30-60 ngày.
  * `WF_01 - WF_03` (Khảo sát & eNPS Wellbeing) & `WF_12` (System Uptime): Cần chuẩn hóa webhook production và cơ chế cảnh báo nguy cơ kiệt sức (Burnout Alert).

---

## 2. Lộ Trình Nâng Cấp 3 Phase (Chuẩn Doanh Nghiệp Thực Tế)

```mermaid
flowchart TD
    subgraph PHASE 1 ["PHASE 1: Khép Kín Vòng Đời Nhân Sự Mới (Onboarding & IT Setup)"]
        WF05["WF_05: Ứng viên Trúng Tuyển / Hired"] -->|Webhook Backend| WF07["WF_07: Tự Động Cấp Phát Tài Khoản & IT Toolset (Tech vs Non-Tech)"]
        WF07 -->|Khởi tạo DB| DB_TASKS[("PostgreSQL: onboarding_tasks & users")]
        DB_TASKS -->|Cronjob định kỳ| WF08["WF_08: Giám Sát Tiến Độ Tuần Đầu & Hỗ Trợ Buddy (< 50% Alert)"]
    end

    subgraph PHASE 2 ["PHASE 2: Quản Trị Hiệu Suất & Phát Triển Năng Lực (Performance & Skills)"]
        WF09["WF_09: Tự Động Hóa Đánh Giá 360 Độ Định Kỳ (Bảng feedbacks)"]
        WF10["WF_10: Quét Hạn Chứng Chỉ Chuyên Môn (30 ngày / 7 ngày Alert)"]
        WF11["WF_11: Gemini AI Phân Tích Skill Gap & Đề Xuất Khóa Học Cá Nhân Hóa"]
    end

    subgraph PHASE 3 ["PHASE 3: Sức Khỏe Tổ Chức & Giám Sát Vận Hành (Wellbeing & Uptime)"]
        WF01_03["WF_01 - 03: Khảo Sát eNPS Hàng Tuần & Cảnh Báo Burnout/Stress"]
        WF12["WF_12: Giám Sát Uptime Tự Động (Backend, n8n, DB, Web)"]
    end

    PHASE 1 --> PHASE 2
    PHASE 2 --> PHASE 3
```

---

## 3. Chi Tiết Kỹ Thuật Từng Phase

### Phase 1: Onboarding Tự Động & Cấp Phát Thiết Bị IT (WF_07 & WF_08)
1. **Nâng cấp [WF_07] Cấp Phát Tài Khoản & Bộ Công Cụ IT Doanh Nghiệp:**
   - Xóa bỏ các Mock Node: Thay thế hoàn toàn bằng logic xử lý nghiệp vụ thật và PostgreSQL / NestJS API.
   - Tự động sinh tài khoản & mật khẩu tạm trong bảng `users` với email định dạng `@company.com`.
   - Phân loại Toolset theo Department (Tech vs Non-Tech).
   - Tự động tạo bộ Checklist Onboarding 6 bước chuẩn ghi vào bảng `onboarding_tasks`.
   - Gửi Email Welcome Pack chính thức.

2. **Nâng cấp [WF_08] Theo Dõi Tiến Độ Tuần Đầu & Hỗ Trợ Kịp Thời:**
   - Kết nối PostgreSQL thật: Cronjob truy vấn bảng `onboarding_tasks` của nhân sự mới.
   - Tính toán % hoàn thành thực tế.
   - Cảnh báo HR Mentor & Buddy nếu tiến độ < 50% sau 3-5 ngày.
   - Chúc mừng và mở Onboarding Pulse Survey khi hoàn thành >= 80%.

### Phase 2: Đánh Giá Hiệu Suất 360 Độ & Nâng Cao Kỹ Năng Bằng AI (WF_09, WF_10, WF_11)
1. **WF_09:** Tự động hóa gửi form và thu thập đánh giá 360 độ từ bảng `feedbacks`, tính điểm KPI metric.
2. **WF_10:** Quét hạn chứng chỉ chuyên môn, phân luồng cảnh báo 60 ngày, 30 ngày, 7 ngày.
3. **WF_11:** Gemini AI phân tích Skill Gap so với chuẩn vị trí, đề xuất 3 khóa học thực tế kèm lộ trình 30 ngày.

### Phase 3: Đo Lường Sức Khỏe Tinh Thần Tổ Chức & Giám Sát Uptime (WF_01, 02, 03, 12)
1. **WF_01 - WF_03:** Khảo sát nhanh eNPS hàng tuần, Gemini AI Sentiment Analysis & Cảnh báo nguy cơ kiệt sức (Burnout Alert).
2. **WF_12:** Giám sát Uptime 4 thành phần hệ thống và gửi cảnh báo khẩn khi có sự cố.
