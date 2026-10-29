'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';

export interface FooterProps {
  onSelectSkill?: (skill: string) => void;
  onOpenReportModal?: () => void;
  onOpenSalaryCalc?: () => void;
  onOpenCVBuilder?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectSkill,
  onOpenReportModal,
  onOpenSalaryCalc,
  onOpenCVBuilder
}) => {
  const handleSkillClick = (skill: string) => {
    if (onSelectSkill) {
      onSelectSkill(skill);
    } else {
      window.location.href = `/?skill=${encodeURIComponent(skill)}`;
    }
  };

  const handleSalaryClick = () => {
    if (onOpenSalaryCalc) {
      onOpenSalaryCalc();
    } else {
      window.location.href = '/#salary';
    }
  };

  const handleReportClick = () => {
    if (onOpenReportModal) {
      onOpenReportModal();
    } else {
      window.location.href = '/#report';
    }
  };

  const handleCVClick = () => {
    if (onOpenCVBuilder) {
      onOpenCVBuilder();
    } else {
      window.location.href = '/#cv-builder';
    }
  };

  return (
    <footer className="w-full bg-slate-950 text-slate-400 text-xs border-t border-slate-900 pt-10 sm:pt-14 pb-8 sm:pb-10 mt-auto">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 pb-8 sm:pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand & About (Spans 2 cols on lg) */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-extrabold text-sm font-mono shadow-xs group-hover:scale-105 transition-transform">
                &lt;/&gt;
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                <span className="text-red-500">UP</span>CAREER
              </span>
            </Link>
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              UpCareer là nền tảng quản trị nhân sự và hệ sinh thái việc làm công nghệ thông tin hàng đầu tại Việt Nam, kết nối hơn 450,000+ nhân sự công nghệ với các doanh nghiệp tiên phong.
            </p>

            <div className="space-y-2 text-slate-300 pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  <strong>Trụ sở chính TP.HCM:</strong> Tầng 12A, Tòa nhà AP Tower, 518B Điện Biên Phủ, P. 21, Q. Bình Thạnh, TP.HCM
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  <strong>Chi nhánh Hà Nội:</strong> Tầng 7, Tòa nhà Diamond Flower, 48 Lê Văn Lương, Q. Thanh Xuân, Hà Nội
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>Hotline hỗ trợ: (028) 6273 3496 · Tuyển dụng: (028) 6682 4583</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>Email: contact@upcareer.vn</span>
              </div>
            </div>
          </div>

          {/* Col 2: Popular Tech Jobs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Việc Làm IT Nổi Bật
            </h4>
            <ul className="space-y-2 text-slate-400">
              {['ReactJS', 'NodeJS', 'Java', 'Golang', 'Python', 'DevOps', '.NET Core', 'AI Engineer'].map((tech) => (
                <li key={tech}>
                  <button
                    onClick={() => handleSkillClick(tech)}
                    className="hover:text-red-400 transition-colors text-left cursor-pointer"
                  >
                    Việc làm {tech}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Career Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Công Cụ Nghề Nghiệp
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={handleSalaryClick}
                  className="hover:text-red-400 transition-colors text-left cursor-pointer"
                >
                  Tính Lương Gross sang Net
                </button>
              </li>
              <li>
                <button
                  onClick={handleReportClick}
                  className="hover:text-red-400 transition-colors text-left cursor-pointer"
                >
                  Báo cáo Lương IT Việt Nam
                </button>
              </li>
              <li>
                <button
                  onClick={handleCVClick}
                  className="hover:text-red-400 transition-colors text-left cursor-pointer"
                >
                  Tạo CV IT Chuẩn Quốc Tế
                </button>
              </li>
              <li>
                <Link href="/engagement" className="hover:text-red-400 transition-colors text-left block">
                  Khảo Sát Gắn Kết & Phúc Lợi
                </Link>
              </li>
              <li>
                <Link href="/training" className="hover:text-red-400 transition-colors text-left block">
                  Lộ Trình Đào Tạo Kỹ Năng
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Ecosystem */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Về UpCareer
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/" className="hover:text-red-400 transition-colors">Giới thiệu UpCareer</Link></li>
              <li><Link href="/recruitment" className="hover:text-red-400 transition-colors">Dành cho Nhà tuyển dụng</Link></li>
              <li><span className="text-slate-400">Chính sách bảo mật thông tin</span></li>
              <li><span className="text-slate-400">Quy chế hoạt động hệ thống</span></li>
              <li><span className="text-slate-400">Giải quyết tranh chấp</span></li>
              <li><span className="text-slate-400">Liên hệ hợp tác truyền thông</span></li>
            </ul>

            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã đăng ký Bộ Công Thương</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 text-center sm:text-left">
          <div>
            © 2026 UpCareer. Bản quyền thuộc về UpCareer Technology JSC. Giấy phép MXH số 334/GP-BTTTT cấp bởi Bộ TT&TT.
          </div>
          <div className="flex items-center justify-center gap-1">
            <span>Phát triển cho cộng đồng Lập trình viên & Doanh nghiệp Việt Nam</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 inline ml-0.5" />
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
