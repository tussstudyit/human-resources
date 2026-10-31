# Chấm CV tự động — 31/10/2026

## Hành vi hiện tại

- Đăng hoặc sửa JD: backend tự tạo rubric có phiên bản từ các kỹ năng ghi trong yêu cầu công việc; trọng số mặc định 40/30/20/10.
- Nộp CV: backend tự lấy/tạo rubric cho đúng phiên bản JD và gửi WF_04. Không cần HR duyệt rubric trước.
- Rubric tự động có `approvedAt=null`, `approvedBy=null`. API trả `active` và `source=AUTOMATIC`; không giả mạo người duyệt.
- Rubric HR điều chỉnh cho cùng JD được ưu tiên. Nút FE là **Lưu rubric điều chỉnh**, không phải điều kiện để chấm.
- Đổi JD tạo phiên bản mới; lượt chấm cũ giữ snapshot. Muốn áp dụng rubric mới cho CV cũ thì bấm Chấm lại.
- JD chưa có kỹ năng đủ rõ hoặc PDF không đọc được vẫn được báo cụ thể. Không tạo kỹ năng/điểm giả để ép workflow thành công.
- HR vẫn cần xem và duyệt **kết quả ứng viên** trước WF_05/06. Chấm CV không tự gửi thư hay tạo lịch.

## Thay đổi kỹ thuật

- `automatic-rubric.ts`: lấy kỹ năng có trong yêu cầu JD, chuẩn hóa alias, hỗ trợ các mục kỹ năng ngắn được liệt kê, khử trùng và giới hạn 40 kỹ năng.
- `EvaluationService.ensureRubric`: khóa hàng vị trí để chống tạo trùng rubric khi xử lý đồng thời; ưu tiên bản HR cho cùng source hash.
- `start`: khóa ứng viên/vị trí, chụp rubric tự động hoặc HR vào lượt đánh giá.
- API tạo/sửa việc làm gọi `ensureRubric`; dữ liệu cũ được hỗ trợ bằng lazy creation khi nhận CV và script backfill.
- WF_04: nhánh `Rubric Available?` kiểm tra rubric hợp lệ, không kiểm tra HR duyệt. Trường hợp JD thiếu yêu cầu trả `JD_REQUIREMENTS_REQUIRED`.
- Không thay schema DB, không reset dữ liệu hoặc đổi credential.

## Kiểm chứng

- 18 test backend, 113 test frontend, 9 test workflow đều qua; backend/frontend build thành công và frontend typecheck thành công.
- PostgreSQL integration đã qua trên local và VPS: tạo rubric đồng thời chỉ ra một phiên bản, chấm khi rubric chưa được HR duyệt, không tự duyệt kết quả, HR override, đổi JD/giữ lịch sử, claim/callback/delivery deduplication.
- Test production gọi API thật: đăng JD TEST → tự có rubric → nộp PDF → backend tự dispatch WF_04 → Gemini 3.1 Flash Lite trích xuất → code/backend tính và lưu **40 điểm**, đủ 4 tiêu chí, `DONE`, `errorCode=null`.
- Không gọi duyệt rubric hoặc duyệt kết quả trong lượt test. Yêu cầu phỏng vấn khi kết quả chưa duyệt vẫn bị chặn.
- PATCH JD TEST tạo rubric tự động mới; snapshot rubric của lần chấm cũ không đổi. File và bản ghi TEST được dọn sau kiểm tra.
- Backfill 11 vị trí OPEN: giữ 3 rubric HR, bổ sung 8 rubric tự động. Không còn hồ sơ nào có lượt mới nhất bị chặn bởi `RUBRIC_APPROVAL_REQUIRED`, nên không chấm lại các hồ sơ đang có điểm.

## Triển khai

- Release: `/root/hr-releases/automatic-scoring-20261031T010258Z`.
- Backup DB và toàn bộ workflow trước thay đổi: `/root/hr-backups/automatic-scoring-20261031T010258Z`.
- WF_04 giữ ID `eomUGSot0QhrUo0A` và credential hiện có. Không import lại WF_05/06 hay các workflow khác.

Script `backend/scripts/backfill_automatic_rubrics.mjs` chỉ chạy khi `BACKFILL_AUTOMATIC_RUBRICS=yes` và có `AUTOMATIC_RUBRICS_REPORT`. Script tạo/lấy rubric cho các vị trí OPEN và chỉ chạy lại các hồ sơ có lượt mới nhất bị chặn bởi mã lỗi rubric cũ; không gửi mail, không duyệt kết quả. Cấu hình endpoint WF_04 đúng môi trường qua `TEST_N8N_WEBHOOK` hoặc `N8N_CV_WEBHOOK`.
