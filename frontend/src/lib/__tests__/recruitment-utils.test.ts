import { describe, it, expect } from 'vitest';
import {
  parseSkills,
  inferDepartment,
  formatRelativeTime,
  formatFileSize,
  MAX_CV_SIZE,
} from '../recruitment-utils';

describe('recruitment-utils', () => {
  describe('parseSkills', () => {
    it('tách đúng theo dấu phẩy và giữ nguyên các kỹ năng có gạch nối hoặc ký tự đặc biệt (test bắt buộc)', () => {
      const input = 'Full-stack, Node.js, C++, C#, R';
      const expected = ['Full-stack', 'Node.js', 'C++', 'C#', 'R'];
      expect(parseSkills(input)).toEqual(expected);
    });

    it('gỡ bỏ bullet point đầu dòng và giữ nguyên gạch nối trong từ (test bắt buộc)', () => {
      const input = '- React\n- Node-RED\n• SQL';
      const expected = ['React', 'Node-RED', 'SQL'];
      expect(parseSkills(input)).toEqual(expected);
    });

    it('xử lý dấu chấm phẩy và bullet points *', () => {
      const input = 'Python; * Golang; * Next.js; - CI-CD';
      const expected = ['Python', 'Golang', 'Next.js', 'CI-CD'];
      expect(parseSkills(input)).toEqual(expected);
    });

    it('loại bỏ trùng lặp không phân biệt hoa thường và giữ cách viết của lần đầu', () => {
      const input = 'React, react, REACT, TypeScript, typescript, TYPESCRIPT';
      const expected = ['React', 'TypeScript'];
      expect(parseSkills(input)).toEqual(expected);
    });

    it('trả về mảng rỗng khi chuỗi rỗng hoặc chỉ có khoảng trắng', () => {
      expect(parseSkills('')).toEqual([]);
      expect(parseSkills('   \n  \t  ')).toEqual([]);
    });
  });

  describe('inferDepartment', () => {
    it('phân loại chính xác các vị trí lai như Sales Engineer vào Kinh doanh & Phát triển', () => {
      expect(inferDepartment('Sales Engineer')).toBe('Kinh doanh & Phát triển');
      expect(inferDepartment('Pre-sales Consultant')).toBe('Kinh doanh & Phát triển');
      expect(inferDepartment('Technical Sales Executive')).toBe('Kinh doanh & Phát triển');
      expect(inferDepartment('Chuyên viên Phát triển thị trường')).toBe('Kinh doanh & Phát triển');
    });

    it('sử dụng word boundary cho HR và không bị match nhầm từ khác', () => {
      expect(inferDepartment('HR Manager')).toBe('Nhân sự');
      expect(inferDepartment('Chuyên viên Tuyển dụng & HRBP')).toBe('Nhân sự');
      // Từ chứa 'hr' nhưng không phải phòng nhân sự
      expect(inferDepartment('Chrome Extension Developer')).toBe('Kỹ thuật & Công nghệ');
    });

    it('phân loại đúng nhóm Kỹ thuật & Công nghệ', () => {
      expect(inferDepartment('Senior Frontend Developer')).toBe('Kỹ thuật & Công nghệ');
      expect(inferDepartment('DevOps Engineer')).toBe('Kỹ thuật & Công nghệ');
      expect(inferDepartment('QA/QC Automation Lead')).toBe('Kỹ thuật & Công nghệ');
      expect(inferDepartment('Kỹ sư Lập trình AI')).toBe('Kỹ thuật & Công nghệ');
    });

    it('phân loại đúng các phòng ban khác', () => {
      expect(inferDepartment('Content Marketing Specialist')).toBe('Marketing & Truyền thông');
      expect(inferDepartment('Senior UI/UX Designer')).toBe('Thiết kế & Sáng tạo');
      expect(inferDepartment('Kế toán viên')).toBe('Tài chính & Kế toán');
      expect(inferDepartment('Chuyên viên Vận hành')).toBe('Vận hành & Quản lý');
      expect(inferDepartment('Tài xế giao hàng')).toBe('Khác');
    });

    it('phân loại đúng Business Analyst Engineer, Senior Software Engineer và chuỗi rỗng/lạ (test bắt buộc)', () => {
      // "Business Analyst" ưu tiên hơn "engineer" chung
      expect(inferDepartment('Business Analyst Engineer')).toBe('Kinh doanh & Phát triển');
      expect(inferDepartment('Senior Software Engineer')).toBe('Kỹ thuật & Công nghệ');
      expect(inferDepartment('')).toBe('Khác');
      expect(inferDepartment('   ')).toBe('Khác');
      expect(inferDepartment('Chức danh chưa từng xuất hiện')).toBe('Khác');
    });
  });

  describe('formatRelativeTime', () => {
    it('trả về "Vừa xong" đối với thời điểm trong tương lai (test bắt buộc)', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(); // 1 năm sau
      expect(formatRelativeTime(futureDate)).toBe('Vừa xong');

      const slightlyFuture = new Date(Date.now() + 1000 * 30).toISOString(); // 30s sau
      expect(formatRelativeTime(slightlyFuture)).toBe('Vừa xong');
    });

    it('trả về "Không rõ" đối với ngày không hợp lệ (test bắt buộc)', () => {
      expect(formatRelativeTime('invalid-date-string')).toBe('Không rõ');
      expect(formatRelativeTime('undefined')).toBe('Không rõ');
      expect(formatRelativeTime('')).toBe('Không rõ');
    });

    it('trả về định dạng thời gian tương đối quá khứ chính xác', () => {
      const now = Date.now();
      const justNow = new Date(now - 1000 * 20).toISOString(); // 20s trước
      expect(formatRelativeTime(justNow)).toBe('Vừa xong');

      const minutesAgo = new Date(now - 1000 * 60 * 15).toISOString(); // 15p trước
      expect(formatRelativeTime(minutesAgo)).toBe('15 phút trước');

      const hoursAgo = new Date(now - 1000 * 60 * 60 * 4).toISOString(); // 4h trước
      expect(formatRelativeTime(hoursAgo)).toBe('4 giờ trước');

      const daysAgo = new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(); // 3 ngày trước
      expect(formatRelativeTime(daysAgo)).toBe('3 ngày trước');
    });
  });

  describe('formatFileSize & MAX_CV_SIZE', () => {
    it('định dạng đúng các kích thước tệp', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(10 * 1024 * 1024)).toBe('10.00 MB');
    });

    it('ngưỡng MAX_CV_SIZE đúng bằng 10MB', () => {
      expect(MAX_CV_SIZE).toBe(10 * 1024 * 1024);
    });
  });
});
