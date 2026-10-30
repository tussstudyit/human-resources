# Kiểm tra tuyển dụng production — 31/10/2026

Môi trường: `cvresources.tech`, `api.cvresources.tech`, `n8n.cvresources.tech` trên VPS hiện tại. Không reset DB, đổi secret hoặc ghi đè 8 override trong checkout VPS cũ.

## Nguyên nhân “Chưa có điểm” và bản sửa

| Vấn đề đã xác nhận | Thay đổi |
| --- | --- |
| Gemini 3.5 Flash trả 503 và 429 ở phân tích JD; workflow dừng dù rubric đã duyệt | JD enrichment thất bại được phép dùng đúng kỹ năng trong rubric đã duyệt. Không tạo kỹ năng hoặc điểm thay thế. |
| Provider lỗi bị gộp thành `JD_ANALYSIS_FAILED` và thử repair schema không cần thiết | Phân biệt rate limit, provider unavailable, authentication và request failure. Provider lỗi không đi vào schema repair. Khoảng cách retry tăng từ 5 lên 20 giây. |
| PDF thực tế có NUL; callback lưu JSONB trả 500 với PostgreSQL `22P05` | Làm sạch NUL và surrogate hỏng trong văn bản PDF trước chia đoạn; làm sạch chuỗi trong JSON tại biên lưu báo cáo. Giữ chữ tiếng Việt, emoji hợp lệ và xuống dòng. |
| FE ngừng polling sau 60 giây dù workflow chưa xong | Theo dõi tới 16 phút, bao phủ watchdog backend 15 phút và lần reconcile tiếp theo; dừng khi đã có kết quả. |
| Model production hiện tại bị giới hạn | Production được cấu hình rõ `GEMINI_MODEL=gemini-3.1-flash-lite`, sau khi gọi kiểm tra và chấm CV thật thành công. Điểm vẫn được tính bởi engine rubric, model chỉ trích xuất bằng chứng. |

## Bằng chứng trên VPS

- Hồ sơ trong ảnh: `e87b0312-3375-468e-bd3a-5e6a9de2874e`.
- Lần chấm lại sau sửa: `7f27063f-0d9b-4343-b34e-d78a769bc4f3`.
- Kết quả DB và API lịch sử cùng **26,67/100**, đủ **4 tiêu chí**, `errorCode=null`.
- `NEEDS_REVIEW` do `EMPLOYMENT_DATES_UNVERIFIED`; `PENDING_HR` được giữ nguyên. Không tự duyệt hồ sơ thật hoặc ra quyết định tuyển dụng.
- WF_05 đã chạy bằng fixture TEST, tạo Calendar/Meet và gửi thư qua SMTP đến địa chỉ người dùng chỉ định. WF_06 cũng gửi thư TEST Talent Pool với `SENT`.
- Calendar đã được đọc lại qua Google API: event `2jqeudr8424b5a1ts1tkjgapv8`, `confirmed`, organizer `upcareercvresources@gmail.com`, attendee `doanthanhhuy1309@gmail.com`, 09:30 ngày 04/11/2026 (UTC+7), Meet `https://meet.google.com/mka-vans-qnf`.
- `SENT` xác nhận SMTP chấp nhận người nhận; không đồng nghĩa đã quan sát email trong Inbox.
- Yêu cầu lên lịch trước duyệt bị chặn; yêu cầu gửi lại không tạo delivery trùng. Fixture DB và file TEST được dọn sau kiểm thử; lịch TEST được giữ để người dùng kiểm tra.

## Kiểm thử

- Backend: 15 test / 7 file; build thành công.
- Frontend: 106 test / 16 file; production build Webpack thành công.
- Workflow: 8 test thực thi code node, gồm provider failure, JSON có code fence, NUL, bằng chứng nguồn, ICS CRLF và SMTP thất bại.
- PostgreSQL integration: claim đồng thời, callback cũ, ghi báo cáo có NUL, metadata merge, HR approval, deduplication, CX, watchdog và history không lộ claim token.
- API production: 27 kiểm tra trong lượt gửi WF_05/06; 28 kiểm tra ở lượt xác nhận RSVP/CX không gửi thêm email. Hai lượt có kiểm tra trùng nhau, không cộng thành số endpoint riêng biệt.
- EMPLOYEE: 4 endpoint tuyển dụng bị chặn 403; anonymous bị chặn 401; webhook thiếu service key bị chặn 403.
- RSVP xác nhận/dời lịch, từ chối trạng thái sai; CX lưu điểm 4, từ chối điểm 6; link sai token bị từ chối.
- 11 route FE production trả HTML 200. Đây là kiểm tra khả dụng HTTP, không thay thế thao tác trình duyệt.
- Kiểm thử click trực tiếp trên FE chưa hoàn tất: công cụ vẫn trả `Local browser use is disabled in Work settings` sau khi người dùng báo đã bật; không chạy công cụ trình duyệt khác để vượt giới hạn.

## Triển khai và tái kiểm tra

- Release VPS: `/root/hr-releases/scoring-fix-20261030T1725Z`.
- Symlink hiện hành: `/root/hr-current`.
- Backup: `/root/hr-backups/scoring-fix-20261030T1725Z` (workflow trước/sau, build cũ, cấu hình component cũ, kết quả Calendar và chấm lại).
- Chỉ WF_04 được thay đổi logic trong lượt sửa này. Credential Calendar của WF_05 đã được gắn trước đó; WF_05/06 được test giữ nguyên graph. Cả ba đang active; 11 workflow ngoài tuyển dụng được đối chiếu giữ nguyên graph và trạng thái.
- Có thêm một workflow chẩn đoán thủ công, không publish: `[TEST] UpCareer integration diagnostics (manual only)`.

Lệnh kiểm tra repo không gọi dịch vụ ngoài:

```sh
node scripts/test_hybrid_workflows.cjs
cd backend && npm test && npm run build
cd ../frontend && npm test
```

`backend/scripts/test_hybrid_live.mjs --ai` gọi Gemini thật và yêu cầu bắt buộc có điểm, đủ 4 tiêu chí. Lượt kiểm tra cuối sau fix Unicode đạt `DONE`, 40 điểm. Script phải chạy trong backend release có env production đã cấu hình; đặt `TEST_N8N_WEBHOOK=http://127.0.0.1:5678/webhook/process-cv` trên VPS này (cổng local mặc định là 5679).

`backend/scripts/test_production_recruitment.mjs` chỉ chạy khi opt-in `RUN_PRODUCTION_DELIVERY_TEST=yes`, có `TEST_HR_EMAIL`, `TEST_HR_PASSWORD`, `TEST_RECIPIENT`. Nó gửi hai thư thật và tạo lịch TEST; không chạy lại vô ý. Đặt `TEST_SKIP_PROVIDER_DELIVERY=yes` để chỉ kiểm tra API/RSVP/CX, không gửi thư hay tạo Calendar. Không ghi các giá trị credential vào Git.
