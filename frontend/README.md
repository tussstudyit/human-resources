# HR Platform - Frontend Portal & Careers

Hệ thống Quản lý Nhân sự & Cổng Tuyển dụng Công nghệ tích hợp AI Recruitment Agent (Next.js 16 App Router).

## 🚀 Khởi chạy ứng dụng

```bash
cd frontend
npm install
npm run dev
```

Ứng dụng chạy mặc định tại: [http://localhost:3000](http://localhost:3000)

## 📁 Cấu trúc Module Tuyển dụng (Careers Portal - Day 2)

- `/careers`: Cổng tuyển dụng công khai cho ứng viên tìm kiếm cơ hội và nộp hồ sơ CV.
- `/jobs`: Route điều hướng trực tiếp sang `/careers`.
- `components/recruitment/`:
  - `CareersClient.tsx`: Giao diện client quản lý tìm kiếm từ khóa không dấu tiếng Việt, lọc phòng ban, nạp lại dữ liệu và mở modal.
  - `JobCard.tsx`: Thẻ hiển thị vị trí công việc, tag kỹ năng rút trích, xem chi tiết yêu cầu.
  - `ApplyModal.tsx`: Modal ứng tuyển với honeypot chống bot ngầm, bẫy focus bàn phím (focus trap a11y), khóa cuộn trang và xử lý lỗi inline (409 Conflict).
  - `CvDropzone.tsx`: Khu vực kéo thả tệp CV định dạng PDF, kiểm tra dung lượng tối đa 10MB và tệp rỗng (0 bytes).
  - `PublicHeader.tsx`: Thanh điều hướng công khai cho ứng viên và lối tắt đăng nhập nội bộ.
- `lib/api/recruitment.ts`: Client API hỗ trợ lấy danh sách việc làm (`getJobs`) và gửi hồ sơ (`applyJob`).
- `lib/recruitment-utils.ts`: Tiện ích chuẩn hóa kỹ năng (`parseSkills`), nhận diện phòng ban (`inferDepartment`), tính thời gian tương đối (`formatRelativeTime`) và định dạng dung lượng tệp.

## ⚙️ Cấu hình Môi trường (.env)

Tạo file `.env.local` trong thư mục `frontend/` (hoặc `.env` ở root):

```env
# URL API Backend cho trình duyệt (Client-side)
NEXT_PUBLIC_API_URL=http://localhost:3001

# URL API Backend nội bộ cho Next.js Server Components (Server-side SSR / Docker network / E2E test)
API_INTERNAL_URL=http://localhost:3001
```

## 📌 Quyết định Thiết kế & Kỹ thuật

### Quyết định về SSR & `force-dynamic` (Mục B1)
Trang `/careers` sử dụng `export const dynamic = 'force-dynamic'`:
- **Lý do**:
  1. **Bỏ qua cache fetch / Không phụ thuộc ISR**: Dữ liệu việc làm đang mở tuyển luôn được truy vấn mới nhất tại thời điểm người dùng truy cập hoặc làm mới, phản ánh trạng thái tuyển dụng real-time.
  2. **Độc lập khi build tĩnh**: Khi thực hiện `next build`, trang không cố gắng kết nối tới backend database để prerender HTML tĩnh. Do đó quá trình build hoàn toàn độc lập và không bao giờ gặp lỗi nếu backend chưa khởi động.
