# 📂 BỘ HỒ SƠ CV PDF THỰC TẾ KIỂM THỬ WORKFLOW 04 (AI CV SCORING & PARSER)

Thư mục này chứa **10 file CV PDF thật** từ các lập trình viên và chuyên gia thực tế (Việt Nam & Quốc tế) được thu thập và tuyển chọn để kiểm thử toàn diện các chức năng của **WF_04** (AI Parsing, Trích xuất bằng chứng, Chấm điểm Rubric 4 trụ cột, Đề xuất mức lương, Phát hiện thiếu sót và phân luồng phỏng vấn/Talent Pool).

---

## 📋 Danh Mục 10 Hồ Sơ CV PDF & Kịch Bản Kiểm Thử

| # | Tên File | Ứng Viên Thực Tế | Vị Trí & Kinh Nghiệm | Kỹ Năng Nổi Bật | Kịch Bản & Mục Tiêu Test WF_04 |
|:---:|:---|:---|:---|:---|:---|
| **01** | `01_Senior_Fullstack_TinNguyen.pdf` | **Tin Nguyen** | Staff / Senior Fullstack (13 năm KN) | **NestJS, NodeJS, React, PostgreSQL**, TypeScript, LLMs | **Test Điểm Cao Xuất Sắc (90–95%)**<br>Khớp chuẩn 100% tech stack lõi của hệ thống; kiểm tra trích xuất bằng chứng dự án lớn, tính toán thâm niên 13 năm và gợi ý Salary Benchmark bậc Senior/Lead. |
| **02** | `02_Fullstack_Web_TungNguyen.pdf` | **Tùng Nguyễn** | Full Stack Web Developer (TP.HCM) | JavaScript, PHP, MySQL, ReactJS, Web Development | **Test Ứng Viên Mid-Level (70–80%)**<br>Kiểm tra khả năng phân tích CV tiếng Việt/tiếng Anh song ngữ; phân định điểm kỹ năng nền tảng và nhận diện mức độ phù hợp. |
| **03** | `03_Software_Architect_posquit0.pdf` | **Byungjin Park (posquit0)** | Software Architect & SRE Lead (15+ năm KN) | **Kubernetes, AWS Multi-account, Terraform**, Docker, Go | **Test Tiêu Chí Quy Mô Hệ Thống (System Scale)**<br>Kiểm thử khả năng trích xuất số liệu production thực tế (high SLA, multi-region, fintech infrastructure) và rubric 4 trụ cột. |
| **04** | `04_Mobile_Flutter_NguyenChiThanh.pdf` | **Nguyễn Chí Thanh** | Mobile Developer | Flutter, Dart, RESTful APIs, Mobile UI/UX | **Test Ứng Viên Lệch Chuyên Môn Một Phần (Cross-domain 55–65%)**<br>Khi ứng tuyển vị trí Backend/Web, kiểm tra AI có nhận diện đúng khoảng cách kỹ năng (Skill Gap) và gợi ý phỏng vấn chuyển hướng hay không. |
| **05** | `05_Data_Engineer_NguyenTuanHuy.pdf` | **Nguyễn Tuấn Huy** | Data Engineer | Python, SQL, Data Warehouse, ETL Pipeline | **Test Kỹ Năng Dữ Liệu & Database (65–75%)**<br>Đo lường mức độ khớp nối giữa kỹ năng xử lý dữ liệu lớn với yêu cầu tối ưu hóa PostgreSQL/Backend. |
| **06** | `06_Junior_DevOps_FaiqRaza.pdf` | **Faiq Raza** | Junior Cloud Engineer (1–2 năm KN) | Docker, Kubernetes, Consul, Go, Amazon ECR | **Test Hồ Sơ Junior / Fresher Có Tiềm Năng (70–78%)**<br>Kiểm tra hệ thống không chấm nhầm số năm kinh nghiệm theo số từ khóa; thẩm định đoạn trích dẫn thực tập và dự án nguồn mở. |
| **07** | `07_Junior_Web_EmilyDowdle.pdf` | **Emily Dowdle** | Junior Web Developer | Ruby on Rails, Java, TDD (RSpec, Mocha), APIs | **Test Tiêu Chí Kỷ Luật Kỹ Thuật (Discipline & TDD)**<br>Kiểm tra trụ cột kiểm thử tự động (TDD) có được AI cộng điểm tối đa ở cột Kỷ luật kỹ thuật hay không. |
| **08** | `08_Software_Tester_TranXuanThang.pdf` | **Trần Xuân Thắng** | Software Tester / QA | Manual Testing, Test Case, Bug Tracking | **Test Hồ Sơ Điểm Thấp Khi Ứng Tuyển Lập Trình (<50%)**<br>Kiểm tra ngưỡng quyết định: AI ghi nhận thiếu kỹ năng viết mã (Missing Information), chuyển trạng thái `NEEDS_REVIEW` hoặc từ chối lưu Talent Pool. |
| **09** | `09_IT_Project_Manager_TranQuangPhat.pdf` | **Trần Quang Phát** | IT Project Manager (10 năm KN) | Agile, Scrum, Quản lý tiến độ dự án, Tech Delivery | **Test Hồ Sơ Quản Lý / Delivery (50–65%)**<br>Đánh giá sự phân biệt giữa kinh nghiệm quản lý dự án và năng lực kỹ thuật lập trình trực tiếp. |
| **10** | `10_Business_Analyst_TrangMinhTien.pdf` | **Trang Minh Tiến** | Business Analyst | SQL, Excel, Logic Thinking, Business Requirements | **Test Ứng Viên Trái Ngành / Non-Tech (<45%)**<br>Kiểm tra cơ chế bảo vệ của WF_04: Không sinh điểm ảo, chỉ ra rõ ràng các kỹ năng cốt lõi còn thiếu để chuyển tiếp sang WF_06. |

---

## 🚀 Hướng Dẫn Cách Sử Dụng Để Kiểm Thử

### Cách 1: Nộp trực tiếp trên Giao Diện Web (UI Test)
1. Truy cập trang Tuyển dụng công khai: **http://localhost:3000/careers**
2. Chọn một công việc phù hợp (ví dụ: *Senior Fullstack Developer* hoặc *Backend Engineer*).
3. Bấm **Ứng tuyển ngay** và kéo thả một trong các file PDF trên vào form.
4. Mở n8n tại **http://localhost:5679/workflow/SPbqZlQMSoHpoqRx** để theo dõi lượt chạy phân tích tự động.
5. Xem kết quả chi tiết kèm bằng chứng trích xuất tại **http://localhost:3000/recruitment**.

### Cách 2: Chạy kiểm thử tự động qua API
Sử dụng script có sẵn trong dự án:
```bash
cd backend
node scripts/test_hybrid_live.mjs --ai
```
