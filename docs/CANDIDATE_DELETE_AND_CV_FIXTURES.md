# Xóa hồ sơ và ba CV kiểm thử

## Xóa hồ sơ ứng viên

Tuyển dụng → mở chi tiết ứng viên → **Xóa hồ sơ** → đọc thông báo xác nhận.

- Chỉ HR/Manager có quyền gọi `DELETE /recruitment/candidates/:id`; anonymous trả 401, EMPLOYEE trả 403.
- Thao tác xóa thông tin ứng viên, các lượt đánh giá/sự kiện liên quan và tệp CV riêng của hồ sơ. Không xóa vị trí tuyển dụng.
- File CV dùng chung với hồ sơ khác được giữ đến khi hồ sơ cuối cùng bị xóa.
- Khi AI còn chạy hoặc delivery ở trạng thái PENDING/PROCESSING/UNKNOWN, API từ chối 409; không xóa giữa lúc workflow đang dùng hồ sơ.
- Lịch Google Calendar và email đã gửi không được thu hồi. Thông báo xác nhận nêu rõ điều này và khả năng không khôi phục qua giao diện.
- Nếu bản ghi đã xóa nhưng tệp vật lý không dọn được, API trả `fileCleanupPending=true`, giao diện báo quản trị viên kiểm tra; không báo nhầm đã dọn file thành công.
- Sau khi xóa, danh sách, tổng hồ sơ và số hồ sơ theo vị trí được tải lại. Đã thử endpoint bằng bản ghi TEST riêng, không xóa hồ sơ thật có sẵn.

## CV kiểm thử

Các file được sinh bởi `scripts/create_test_cvs.py`, là PDF có lớp văn bản, một trang A4, email `doanthanhhuy1309@gmail.com`. Tất cả tên, việc làm và dự án trong CV đều là giả lập và được ghi rõ là TEST.

| File | Mục tiêu kiểm thử |
| --- | --- |
| 01_CV_Golang_Phu_hop_cao.pdf | Phù hợp cao: đủ các kỹ năng yêu cầu, bằng chứng dự án, production và kiểm thử có số liệu |
| 02_CV_Golang_Phu_hop_trung_binh.pdf | Phù hợp trung bình: một phần kỹ năng, kinh nghiệm dự án và kiểm thử, ít bằng chứng production |
| 03_CV_Golang_Phu_hop_thap.pdf | Phù hợp thấp: hồ sơ thiết kế/nội dung web, ít phù hợp JD backend Golang |

Vị trí mục tiêu: **Senior Golang Backend Engineer (Microservices)**. Kỹ năng JD: Golang, Microservices, PostgreSQL, Redis, Kafka, gRPC, Docker, Unit Testing. Trọng số mặc định 40/30/20/10.

Thư mục bàn giao theo yêu cầu: `/home/DoanThanhHuy/Study/CV test`.

Do email + vị trí là duy nhất, muốn nộp tuần tự ba CV vào cùng vị trí phải xóa hồ sơ test trước khi nộp CV kế tiếp. Không tự động duyệt kết quả, tạo lịch hoặc gửi thư chỉ vì có điểm cao.

## Kiểm chứng

- 116 test frontend qua, backend build và 18 test qua, frontend typecheck/build qua.
- Bài test `backend/scripts/test_candidate_delete.mjs` tạo bản ghi TEST, kiểm tra auth/RBAC, chặn khi đang xử lý, xóa cascade/file, bảo vệ file dùng chung và 404 khi xóa lại.
- Bài test `backend/scripts/test_three_cv_cases.mjs` opt-in bằng `RUN_SYNTHETIC_CV_CASES=yes`; dùng ba bản JD tạm, nộp PDF qua API thật, chấm bằng WF_04/Gemini thật, không gọi WF_05/06. Bản ghi và file upload TEST được dọn sau kiểm tra; bản PDF bàn giao local vẫn giữ.
- Các mức điểm là kết quả trên rubric/JD và model ở thời điểm kiểm thử, không phải điểm cố định được gắn trong PDF. Khi thay rubric hoặc trích xuất AI thay đổi, điểm có thể thay đổi.
- Kết quả thực tế ngày 31/10/2026, Gemini 3.1 Flash Lite: CV 01 đạt **90/100, DONE**; CV 02 đạt **55/100, NEEDS_REVIEW**; CV 03 đạt **0/100, NEEDS_REVIEW**. Cả ba có đủ 4 tiêu chí và `errorCode=null`.
