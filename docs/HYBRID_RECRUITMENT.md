# Tuyển dụng Hybrid AI + Rubric + Evidence

## Phạm vi triển khai

- WF_04: **46 node xử lý**, không dùng Sticky Note để tăng số lượng.
- WF_05: **19 node**, phỏng vấn đã duyệt, Calendar/Meet thật, attachment ICS và kết quả SMTP.
- WF_06: **14 node**, phản hồi đã duyệt, Talent Pool và kết quả SMTP.
- Nguồn chuẩn: `n8n/workflows`. Ba file tương ứng trong `workflows` được sinh cùng lúc và giống nhau.
- Các workflow HR khác được giữ nguyên. Chưa triển khai RAG hoặc Multi-Agent.

## Luồng vận hành

1. Người dùng nộp PDF qua API NestJS hiện có.
2. Backend tự tạo rubric có phiên bản từ yêu cầu JD khi đăng/sửa vị trí hoặc khi nhận CV. Nếu HR đã chỉnh rubric đúng phiên bản JD thì ưu tiên bản HR. Sau đó tạo `EvaluationRun`, chụp JD/rubric và hash PDF; liên kết phiên mới nhất vào Candidate. Không cần HR duyệt rubric trước khi chấm.
3. Backend gửi **chỉ evaluationId** tới WF_04. Tên/email/fileUrl từ bên gọi không được tin cậy.
4. Webhook n8n xác thực Header Auth trước; WF_04 tiếp tục chuyển header x-api-key đến API claim. Backend xác thực và claim nguyên tử **trước khi tải file hoặc gọi AI**. Yêu cầu sai bị từ chối; yêu cầu trùng không chạy lại.
5. Sau khi claim, webhook phản hồi 202. Kết quả cuối được cập nhật qua callback riêng.
6. JD thiếu kỹ năng đủ rõ để tạo rubric (`JD_REQUIREMENTS_REQUIRED`) hoặc PDF không đọc được: chuyển `NEEDS_REVIEW`, điểm `null`. Rubric tự động hợp lệ được dùng ngay, không chặn vì chưa duyệt.
7. Gemini phân tích JD, trích xuất claims và đoạn dẫn chứng. Schema/type/finishReason phải hợp lệ. Output CV được sửa tối đa một lần; không fallback điểm 75.
8. Chuẩn hóa kỹ năng, đối chiếu đoạn trích, tính điểm theo quy tắc và tạo báo cáo giải thích.
9. Backend **tự tính lại** bằng cùng scoring engine, lưu lịch sử và chỉ cập nhật projection nếu đây là phiên mới nhất.
10. HR duyệt kết quả trên modal ứng viên. Sau đó HR/MANAGER mới có thể yêu cầu WF_05/06. Chấm điểm không tự gửi thư từ chối.

`aiStatus` cũ được giữ cho tương thích. Trạng thái đầy đủ nằm trong `parsedSkillsJson.evaluation` và API history. `FAILED` là lỗi xử lý, không phải quyết định loại ứng viên.

## Hướng dẫn demo

1. Đăng nhập tài khoản **HR đã có**. Đăng ký công khai luôn tạo EMPLOYEE, không tự cấp quyền HR.
2. Mở Tuyển dụng → chọn job → mở một ứng viên.
3. Nộp CV mới: hệ thống tự tạo/lấy rubric và chấm. Trong “Đánh giá có bằng chứng”, xem nhãn rubric tự động hoặc HR đã điều chỉnh.
4. Nếu cần, HR chỉnh kỹ năng và bốn trọng số (tổng 100), bấm **Lưu rubric điều chỉnh**, rồi **Chấm lại AI** để áp dụng cho hồ sơ cũ. Mỗi lần tạo một phiên mới; lịch sử cũ vẫn còn.
5. Xem cột “Cần HR xem xét”, điểm từng tiêu chí, đoạn trích và lý do bất định.
6. Chỉ khi đã đọc bằng chứng, bấm **Duyệt kết quả**. Lúc này mới mở thao tác phỏng vấn/Talent Pool.
7. Trạng thái `ACCEPTED` chỉ là nhận yêu cầu. Xem sự kiện DELIVERY_RESULT để biết gửi SMTP thành công hay thất bại.

JD thay đổi sẽ tự tạo rubric mới, không áp dụng rubric cũ khác source hash. Hồ sơ cũ vẫn giữ điểm/lịch sử; chấm lại khi cần áp dụng JD mới. Không cho duyệt kết quả theo JD cũ sau khi JD đã đổi.

## Rubric v1

Trọng số mặc định: kỹ năng 40, dự án 30, production 20, kỷ luật kỹ thuật 10. HR có thể điều chỉnh theo JD, đặc biệt cho Fresher.

- Kỹ năng: tỷ lệ kỹ năng yêu cầu có đoạn trích hợp lệ; alias NodeJS/Node.js được chuẩn hóa.
- Các tiêu chí còn lại: không có bằng chứng = 0; có ngữ cảnh = 1; ngữ cảnh + hành động = 3; thêm kết quả có số liệu = 4.
- Điểm = tổng `weight × level / 4`, làm tròn hai chữ số.
- Kinh nghiệm: hợp các khoảng tháng có mốc thời gian trong trích dẫn, không cộng trùng. Không suy số năm từ số keyword.
- Dẫn chứng không khớp, trùng, thiếu thông tin, ngày chưa xác minh, nội dung chỉ dẫn bất thường hoặc gần ngưỡng điểm → người đánh giá.
- Gemini chỉ chọn hướng cần hỏi sâu trong feedback; câu hỏi được dựng từ mẫu kiểm soát. Gemini không thay điểm/rubric.

**Document-supported không phải externally-verified.** CV có thể tự khai sai. Điểm phản ánh mức phù hợp có căn cứ trong tài liệu, cần phỏng vấn hoặc kiểm tra thực hành để xác nhận ngoài đời. Bộ quy tắc v1 cần tiếp tục hiệu chỉnh trên bộ CV–JD có nhãn của HR; chưa công bố độ chính xác định lượng.

## Database và chống trùng

Migration: `20261030140000_hybrid_evaluation_history` chỉ bổ sung cột/bảng, không xóa dữ liệu.

| Bảng | Mục đích |
|---|---|
| job_rubric_versions | JD snapshot, source hash, kỹ năng, trọng số; approvedAt/approvedBy null cho rubric tự động, có giá trị khi HR chủ động điều chỉnh |
| evaluation_runs | Phiên đánh giá, hash PDF, model/prompt version, report và trạng thái |
| evaluation_events | Tiếp nhận, kết quả, HR duyệt, delivery, CX và timeout |

Candidate vẫn giữ các trường frontend cũ và con trỏ `latestEvaluationId`. Các mutation projection serialize bằng row lock. Callback cũ được lưu lịch sử nhưng không ghi đè phiên mới. Claim execution/delivery là nguyên tử; không tự gửi lại tác vụ có kết quả chưa rõ để tránh email/lịch trùng.

Watchdog chạy mỗi phút trong backend; phiên PENDING/PROCESSING quá 15 phút được đánh dấu FAILED/PROCESSING_TIMEOUT. Có API reconcile để gọi thủ công bằng service key. Watchdog không tự khẳng định thư đã gửi.

## API bổ sung

| Method | Đường dẫn dưới /recruitment | Quyền |
|---|---|---|
| GET | jobs/:id/rubric | HR/MANAGER |
| POST | jobs/:id/rubric/approve | HR |
| GET | candidates/:id/evaluations | HR/MANAGER |
| POST | evaluations/:id/approve | HR |
| POST | evaluations/:id/claim | Service key |
| POST | evaluations/:id/result | Service key + claim token |
| POST | evaluations/:id/delivery/claim | Service key; tác vụ phải được duyệt và yêu cầu trước |
| POST | evaluations/:id/delivery | Service key |
| POST | evaluations/reconcile-stale | Service key |

Callback `candidates/:id/ai-evaluation` cũ trả Conflict thay vì cho phép bỏ qua version/history. Cần dùng đồng bộ backend và ba workflow mới.

RSVP/CX: GET chỉ hiện form, POST mới ghi dữ liệu; link có HMAC, hết hạn 14 ngày và ràng buộc candidate/purpose. CX được lưu trong evaluation_events.

## Cấu hình (chỉ tên biến, không đưa giá trị bí mật vào workflow)

- `N8N_API_KEY`: backend và service handshake.
- `JWT_SECRET`: bắt buộc ít nhất 32 ký tự; không có fallback hardcode.
- `N8N_CV_WEBHOOK`, `N8N_SCHEDULE_WEBHOOK`, `N8N_REJECTION_WEBHOOK`: production webhooks của hr_n8n, cổng host 5679.
- `GEMINI_MODEL`: fallback trong source là `gemini-3.5-flash`; production hiện pin `gemini-3.1-flash-lite` sau khi model 3.5 trả 429/503. Flash Lite đã chấm CV mẫu và hồ sơ thật thành công. `gemini-2.5-flash` được liệt kê nhưng đã trả NOT_FOUND khi generate trong môi trường kiểm tra. Xem [báo cáo sửa lỗi production 31/10/2026](PRODUCTION_RECRUITMENT_CHECK_2026-10-31.md).
- `PUBLIC_BACKEND_URL`: URL mà ứng viên thực sự truy cập được; localhost chỉ phù hợp demo cùng máy.
- Credential n8n: Gemini HTTP Header Auth, Google Calendar OAuth2 và SMTP được giữ bằng tham chiếu; không xuất credential đã giải mã.
- URL nội bộ từ n8n tới API hiện là `http://host.docker.internal:3001`, tương thích extra_hosts trong Compose.

Workflow không lưu payload execution thành công/lỗi hoặc tiến trình trung gian; log dữ liệu tuyển dụng dài hạn nằm ở backend có phân quyền. CV gốc vẫn là file ở uploads/cv; cần chính sách lưu giữ/xóa phù hợp trước khi dùng dữ liệu thật ngoài demo.

## Build, kiểm thử và tái tạo

```bash
cd backend
npm run build
npm test
node --env-file=.env scripts/test_hybrid_integration.mjs
cd ..
node scripts/build_hybrid_workflows.cjs
node scripts/build_followup_workflows.cjs
node scripts/test_hybrid_workflows.cjs
cd frontend
npm test
npm run build -- --webpack
node src/scripts/verify_hybrid_ui.mjs
```

Build Webpack được dùng vì Turbopack bị môi trường kiểm tra chặn việc mở cổng nội bộ. TypeScript build errors không bị bỏ qua.

Kiểm thử live có gọi Gemini, dùng CV giả và tự dọn bản ghi test; không gửi email:

```bash
cd backend
node --env-file=.env scripts/test_hybrid_live.mjs --ai
```

Không chạy các script audit cũ có side effect gửi thư/lên lịch để thay thế kiểm thử cô lập.

## Nhập/publish n8n standalone

Sinh lại JSON không tự cập nhật container. Sao lưu trước, import từng file bằng CLI chính thức, sau đó:

```bash
docker exec hr_n8n n8n publish:workflow --id=SPbqZlQMSoHpoqRx
docker exec hr_n8n n8n publish:workflow --id=Z8f05InterviewSc
docker exec hr_n8n n8n publish:workflow --id=Z8f06RejectNotif
docker restart hr_n8n
```

Chế độ standalone này không hỗ trợ `import:workflow --activeState=fromJson`; dùng import rồi publish. Giữ webhookId để không đổi đường dẫn công khai. Import không được thay các credential reference đã cấu hình ở môi trường đích.

Backup trước nâng cấp ở volume hr_n8n: `/home/node/.n8n/hybrid-backup-20261030/`. Workflow chẩn đoán tạm chỉ dùng prompt giả/model metadata; phải unpublish sau khi kiểm tra.

## Giới hạn có chủ đích

- PDF scan/chất lượng kém được chuyển HR; chưa tích hợp nhà cung cấp OCR.
- Chưa tự truy cập GitHub, suy luận culture fit hoặc đưa mức lương thị trường thiếu nguồn.
- Ngày tái liên hệ 180 ngày là metadata; chưa tự gửi email tái liên hệ hoặc tự coi ứng viên đã đồng ý lưu hồ sơ.
- Không gửi email hay tạo lịch thật trong bộ kiểm thử. Calendar/SMTP vẫn cần cấu hình quyền/quota phù hợp và một lần kiểm thử được người vận hành chủ động chọn.
- Tác vụ ngoài đang UNKNOWN/FAILED không được tự gửi lại. Cần kiểm tra provider trước; phiên đánh giá mới có thể tạo yêu cầu mới sau khi HR duyệt.
- Các workflow HR ngoài WF_04–06 và các proxy của chúng chưa được nâng cấp trong đợt này.

## Kết quả kiểm chứng ngày 30/10/2026

- Backend: 12 test đạt; build TypeScript đạt.
- Frontend: 104 test đạt; production build Webpack và kiểm tra TypeScript đạt.
- Workflow: 5 kiểm tra cô lập đạt, gồm cú pháp/kết nối, AI lỗi, scoring có bằng chứng, attachment ICS và SMTP lỗi.
- PostgreSQL: claim đồng thời, callback cũ, callback trùng, bảo toàn metadata, HR approval, chống gửi trùng, CX persistence và watchdog đã được kiểm tra bằng bản ghi giả, tự dọn sau kiểm tra.
- Browser QA: desktop 1280px và mobile 390px; không tràn ngang, thao tác chưa duyệt bị khóa và focus giữ trong modal.
- Production webhook: yêu cầu thiếu Header Auth bị từ chối (n8n 403); body sai sau xác thực trả 400; thiếu rubric được lưu NEEDS_REVIEW, điểm null.
- Một lần chấm CV giả qua Gemini thật hoàn tất với model gemini-3.5-flash, đủ 4 tiêu chí, 47,5 điểm và NEEDS_REVIEW do gần ngưỡng 50. Đây là kiểm chứng luồng, không phải phép đo độ chính xác trên tập dữ liệu tuyển dụng.
- Không có email ứng viên hoặc sự kiện Calendar thật được gửi/tạo trong kiểm thử.
