# Từ chối / Gửi phản hồi — WF_06

## Cách dùng

1. Mở chi tiết hồ sơ trong trang Tuyển dụng.
2. Xem điểm và bằng chứng. Nếu chưa duyệt kết quả, HR bấm **Duyệt kết quả sau khi xem bằng chứng**.
3. Bấm **Từ chối / Gửi phản hồi** và kiểm tra email người nhận trong hộp xác nhận.
4. WF_06 gửi thư phản hồi. Sau khi SMTP xác nhận, hồ sơ chuyển sang cột **Đã từ chối**.

**Lưu Talent Pool** là lựa chọn riêng. Từ chối không tự đưa hồ sơ vào Talent Pool và thư từ chối không hứa liên hệ cơ hội tương lai. Điểm thấp không tự kích hoạt hành động này.

## Luồng kỹ thuật

- API HR/Manager: `POST /recruitment/candidates/:id/reject`, body tùy chọn `{scenario:"CV_SCREENING"}`.
- Backend kiểm tra kết quả mới nhất đã được HR duyệt và JD chưa đổi. Tác vụ gửi được giữ bằng khóa chống trùng của WF_06.
- Để tương thích webhook hiện có, tác vụ nội bộ vẫn là `TALENT_POOL`, nhưng yêu cầu từ chối lưu lựa chọn `options.decision=REJECT` phía backend; ứng viên không thể tự gửi lựa chọn này qua webhook.
- WF_06 claim nội dung từ backend, soạn thư phản hồi và bỏ đoạn hứa kết nối tương lai ở chế độ REJECT.
- Callback chỉ ghi `parsedSkillsJson.rejection={status:"REJECTED",emailSent:true,...}` khi trạng thái gửi là SENT. Không tạo `talentPool`; kết quả FAILED/UNKNOWN không đánh dấu ứng viên đã từ chối.
- Bấm lại cùng yêu cầu không gửi trùng. Nếu đã yêu cầu một loại phản hồi khác của WF_06 trên cùng lượt đánh giá, backend trả 409 để tránh gửi hai thông báo không thống nhất.
- Giao diện hiển thị cột **Đã từ chối** riêng với cột **Lỗi xử lý / Cần kiểm tra**.

## Kiểm thử

- Test FE xác nhận cần kết quả đã duyệt, hộp xác nhận nêu đúng email, hủy không gọi API và xác nhận mới yêu cầu gửi.
- Test Kanban xác nhận hồ sơ REJECTED không nằm trong cột review, lỗi hoặc Talent Pool.
- Test workflow xác nhận thư từ chối không có tier Talent Pool, mốc liên hệ lại hoặc lời hứa liên hệ tương lai.
- Test PostgreSQL xác nhận gửi lỗi không làm thay đổi giai đoạn, giữ lựa chọn REJECT trong lịch sử, SENT ghi trạng thái từ chối và chặn đổi sang Talent Pool gây gửi trùng.
- `backend/scripts/test_rejection_live.mjs` chỉ chạy khi `RUN_REJECTION_DELIVERY_TEST=yes`, với tài khoản HR và `TEST_RECIPIENT` được cung cấp riêng. Script tạo hồ sơ có nhãn TEST, gửi một thư WF_06 thật đến người nhận được chỉ định, kiểm tra callback/dedup và dọn hồ sơ TEST. Không dùng hồ sơ thật đang mở trên giao diện để tự đưa ra quyết định tuyển dụng.
- Test production ngày 31/10/2026 đã qua: SMTP chấp nhận thư TEST đến `doanthanhhuy1309@gmail.com`, callback `SENT`, trạng thái ứng viên `REJECTED`, không có `talentPool`, gửi lặp không tạo mail thứ hai. Hồ sơ TEST đã dọn. Kết quả chỉ xác nhận SMTP chấp nhận, không xác nhận đã quan sát thư trong Inbox.
- Backend build và 18 test qua; frontend build/typecheck và 118 test qua; 12 test workflow qua. PostgreSQL integration qua cả local và VPS.

Hành động từ chối không tự hủy lịch Google Calendar hoặc thu hồi email trước đó.
