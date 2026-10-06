/**
 * Tiện ích hỗ trợ định dạng dữ liệu tuyển dụng
 */

export const MAX_CV_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Định dạng kích thước tệp thành dạng dễ đọc (B, KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  // Nếu là MB thì lấy 2 chữ số thập phân, KB lấy 1 chữ số thập phân, B không lấy
  const precision = i >= 2 ? 2 : i === 1 ? 1 : 0;
  return `${size.toFixed(precision)} ${units[i]}`;
}

/**
 * Tách chuỗi yêu cầu kỹ năng thành danh sách tag kỹ năng
 * Chỉ tách theo dấu phẩy, chấm phẩy và xuống dòng.
 * Chỉ gỡ bullet ở đầu mục bằng ^\s*[-•*]\s+
 * Loại trùng không phân biệt hoa thường, giữ cách viết của lần đầu xuất hiện.
 */
export function parseSkills(requirements: string): string[] {
  if (!requirements) return [];

  // Tách duy nhất theo dấu phẩy, chấm phẩy và ký tự xuống dòng
  const rawParts = requirements.split(/[,;\r\n]+/);

  const cleanSkills: string[] = [];
  const seen = new Set<string>();

  for (const part of rawParts) {
    // Chỉ gỡ bullet ở đầu mục bằng ^\s*[-•*]\s+
    const stripped = part.replace(/^\s*[-•*]\s+/, '').trim();
    if (!stripped) continue;

    const lower = stripped.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      cleanSkills.push(stripped);
    }
  }

  return cleanSkills;
}

/**
 * Dự đoán phòng ban dựa vào tiêu đề công việc (nếu API chưa trả về field department)
 * Sử dụng word boundary cho các từ viết tắt ngắn (HR, QA, IT, UI, UX)
 * Ưu tiên các vị trí lai như Sales Engineer vào Kinh doanh & Phát triển
 */
export function inferDepartment(title: string): string {
  if (!title || !title.trim()) return 'Khác';

  const lower = title.toLowerCase();

  // 1. Kinh doanh & Phát triển
  // QUY TẮC ƯU TIÊN: Cụm chức danh cụ thể (ví dụ: "Business Analyst", "Sales Engineer", "Pre-sales")
  // phải được kiểm tra TRƯỚC các từ khóa kỹ thuật chung như "engineer", "data", "tech".
  // Lý do: Các vị trí như "Business Analyst Engineer" hay "Sales Engineer" bản chất là phân tích nghiệp vụ,
  // bán hàng kỹ thuật phục vụ khối kinh doanh & phát triển, không phải lập trình/kỹ thuật lõi.
  if (
    lower.includes('business analyst') ||
    lower.includes('business analysis') ||
    lower.includes('sales engineer') ||
    lower.includes('pre-sales') ||
    lower.includes('presales') ||
    lower.includes('technical sales') ||
    /\b(sale|sales|bd|bde|ba|account manager)\b/.test(lower) ||
    lower.includes('kinh doanh') ||
    lower.includes('phát triển thị trường') ||
    lower.includes('tài khoản khách hàng') ||
    lower.includes('chăm sóc khách hàng')
  ) {
    return 'Kinh doanh & Phát triển';
  }

  // 2. Vận hành & Quản lý
  // Ưu tiên "Product Manager", "Project Manager" trước khi xét từ "manager" hay từ kỹ thuật khác
  if (
    lower.includes('product manager') ||
    lower.includes('project manager') ||
    lower.includes('scrum master') ||
    lower.includes('vận hành') ||
    lower.includes('operation') ||
    lower.includes('hành chính')
  ) {
    return 'Vận hành & Quản lý';
  }

  // 3. Kỹ thuật & Công nghệ
  if (
    lower.includes('software') ||
    lower.includes('engineer') ||
    lower.includes('developer') ||
    lower.includes('backend') ||
    lower.includes('frontend') ||
    lower.includes('fullstack') ||
    lower.includes('devops') ||
    lower.includes('data') ||
    lower.includes('tester') ||
    lower.includes('lập trình') ||
    /\b(tech|qa|qc|it|sre|ai|ml|dba)\b/.test(lower)
  ) {
    return 'Kỹ thuật & Công nghệ';
  }

  // 4. Nhân sự
  if (
    /\b(hr|hrbp|ta|c&b)\b/.test(lower) ||
    lower.includes('nhân sự') ||
    lower.includes('tuyển dụng') ||
    lower.includes('đào tạo')
  ) {
    return 'Nhân sự';
  }

  // 5. Marketing & Truyền thông
  if (
    lower.includes('marketing') ||
    lower.includes('content') ||
    lower.includes('seo') ||
    lower.includes('truyền thông') ||
    /\b(pr|media)\b/.test(lower)
  ) {
    return 'Marketing & Truyền thông';
  }

  // 6. Thiết kế & Sáng tạo
  if (
    lower.includes('design') ||
    lower.includes('thiết kế') ||
    /\b(ui|ux)\b/.test(lower)
  ) {
    return 'Thiết kế & Sáng tạo';
  }

  // 7. Tài chính & Kế toán
  if (
    lower.includes('kế toán') ||
    lower.includes('tài chính') ||
    lower.includes('finance') ||
    lower.includes('accounting')
  ) {
    return 'Tài chính & Kế toán';
  }

  return 'Khác';
}

/**
 * Định dạng thời gian tương đối bằng tiếng Việt (vi-VN)
 * Ngày tương lai -> "Vừa xong"
 * Ngày không hợp lệ -> "Không rõ"
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Không rõ';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Ngày ở tương lai hoặc chênh lệch dưới 60s
    if (diffInSeconds < 60) {
      return 'Vừa xong';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ngày trước`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} tháng trước`;
    }

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'Không rõ';
  }
}
