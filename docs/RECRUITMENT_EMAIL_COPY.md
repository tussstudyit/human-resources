# Nội dung thư tuyển dụng WF_05 và WF_06

Áp dụng giọng văn trang trọng, xưng hô Anh/Chị, ký tên **Bộ phận Tuyển dụng UpCareer**. Tên ứng viên và vị trí được điền từ dữ liệu backend. Không đưa điểm AI hoặc nhận xét năng lực chưa được xác nhận vào thư.

## WF_05 — Thư mời phỏng vấn

**Tiêu đề:** `[UpCareer] Thư mời phỏng vấn | {Vị trí}`

Kính gửi Anh/Chị **{Họ tên}**,

Cảm ơn Anh/Chị đã quan tâm và ứng tuyển vị trí **{Vị trí}**. Bộ phận Tuyển dụng UpCareer trân trọng mời Anh/Chị tham gia buổi phỏng vấn để trao đổi thêm về kinh nghiệm chuyên môn, yêu cầu công việc và định hướng hợp tác.

Thông tin buổi phỏng vấn gồm ngày, giờ thực tế của lịch hẹn theo giờ Việt Nam (UTC+7), hình thức, liên kết Google Meet hoặc thông tin địa điểm. Tệp `interview.ics` được đính kèm để thêm lịch vào ứng dụng lịch cá nhân.

Kính đề nghị Anh/Chị xác nhận khả năng tham dự qua liên kết **Xác nhận tham gia / Đề nghị đổi lịch**. Nếu cần thay đổi lịch, vui lòng gửi đề nghị để Bộ phận Tuyển dụng liên hệ sắp xếp.

Trực tuyến: đề nghị kiểm tra camera, micro và mạng trước 5–10 phút, chuẩn bị không gian phù hợp. Trực tiếp: đề nghị kiểm tra địa điểm và hướng dẫn đã được xác nhận. Cả hai hình thức đều nhắc chuẩn bị nội dung trao đổi, không chia sẻ tài liệu bảo mật của đơn vị khác.

Trân trọng,  
**Bộ phận Tuyển dụng UpCareer**  
cvresources.tech  
Hỗ trợ: upcareercvresources@gmail.com

## WF_06 — Thông báo kết quả ứng tuyển

**Tiêu đề:** `[UpCareer] Thông báo kết quả ứng tuyển | {Vị trí}`

Kính gửi Anh/Chị **{Họ tên}**,

Lời cảm ơn theo giai đoạn thực tế do HR chọn:

| Giai đoạn | Lời cảm ơn |
| --- | --- |
| CV_SCREENING | Cảm ơn Anh/Chị đã gửi hồ sơ và quan tâm đến cơ hội làm việc cùng chúng tôi. |
| POST_INTERVIEW | Cảm ơn Anh/Chị đã dành thời gian tham gia buổi phỏng vấn và trao đổi cùng đội ngũ tuyển dụng. |
| TECHNICAL_TEST | Cảm ơn Anh/Chị đã dành thời gian tham gia bài đánh giá chuyên môn trong quy trình tuyển dụng. |
| CULTURE_FIT | Cảm ơn Anh/Chị đã dành thời gian trao đổi về cách thức làm việc và định hướng nghề nghiệp. |
| TOP_TALENT | Cảm ơn Anh/Chị đã quan tâm và tham gia quy trình tuyển dụng của chúng tôi. |

Sau khi xem xét theo yêu cầu tuyển dụng hiện tại, chúng tôi rất tiếc chưa thể tiếp tục quy trình ứng tuyển của Anh/Chị cho vị trí này. Kết quả được đưa ra trong phạm vi đợt tuyển dụng và không phải là đánh giá tổng thể về năng lực của Anh/Chị.

Chúng tôi mong có cơ hội kết nối với Anh/Chị khi có vị trí phù hợp trong tương lai. Nếu có yêu cầu liên quan đến việc lưu giữ, cập nhật hoặc xóa hồ sơ, Anh/Chị vui lòng liên hệ upcareercvresources@gmail.com để được hỗ trợ.

Liên kết **Chia sẻ trải nghiệm tuyển dụng** được trình bày là phản hồi tự nguyện.

Trân trọng,  
**Bộ phận Tuyển dụng UpCareer**  
cvresources.tech

## Kiểm chứng

- 11 test workflow đã qua, gồm render thư trực tuyến/trực tiếp, thời gian động UTC+7, 5 giai đoạn phản hồi, escape HTML, attachment ICS và xử lý SMTP thất bại.
- Phần kiểm thử nội dung dùng dữ liệu giả lập, không gửi email đến ứng viên.
- Trên VPS chỉ thay `jsCode` của `Build Invitation and ICS` (WF_05) và `Build Talent Pool Feedback` (WF_06). Credential, webhook, bước duyệt kết quả và graph được đối chiếu giữ nguyên.
- Email không còn hứa ưu tiên liên hệ, đánh giá cao năng lực hoặc tuyên bố tự xóa hồ sơ sau 180 ngày. Metadata nhắc lại sau 180 ngày vẫn thuộc quy trình hiện tại; thay đổi lời văn không triển khai tính năng tự xóa hay xử lý yêu cầu dữ liệu.
