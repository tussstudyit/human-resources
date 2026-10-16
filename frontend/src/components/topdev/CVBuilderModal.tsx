'use client';

import React, { useState } from 'react';
import { FileText, X, CheckCircle, Download, Sparkles, Code2, Award, Briefcase } from 'lucide-react';

interface CVBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CVBuilderModal: React.FC<CVBuilderModalProps> = ({ isOpen, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'fullstack' | 'backend' | 'ai'>('fullstack');
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const resumeSample = `HO_VA_TEN - SENIOR SOFTWARE ENGINEER
Email: dev.vietnam@gmail.com | Phone: (+84) 987 654 321 | GitHub: github.com/devvietnam | LinkedIn: linkedin.com/in/devvietnam

TÓM TẮT CHUYÊN MÔN:
Kỹ sư phần mềm với hơn 5 năm kinh nghiệm thực chiến thiết kế kiến trúc phân tán, phát triển Web hiệu năng cao và giải pháp Cloud-Native. Có khả năng chịu tải hệ thống lớn hơn 20,000 TPS.

KỸ NĂNG CÔNG NGHỆ:
- Frontend: React 18+, Next.js, TypeScript, Tailwind CSS, Redux Toolkit
- Backend: Node.js (NestJS), Golang, Java Spring Boot, RESTful API, gRPC
- Database: PostgreSQL, Redis Cluster, MongoDB, ElasticSearch
- Cloud & DevOps: AWS (ECS, S3, RDS), Docker, Kubernetes, CI/CD GitHub Actions

KINH NGHIỆM LÀM VIỆC:
1. Senior Software Engineer - Tech Unicorn Vietnam (2023 - Nay)
- Tối ưu hóa hệ thống thanh toán cốt lõi, giảm 42% độ trễ xử lý (p99 từ 120ms xuống 70ms).
- Xây dựng Microservices xử lý 15,000 đơn hàng/phút trong các đợt Siêu Sale.
- Mentor 4 kỹ sư Junior và Middle, tổ chức chia sẻ kỹ thuật hàng tuần.

2. Software Engineer - Global Outsourcing Corp (2021 - 2023)
- Phát triển ứng dụng Web SaaS cho khách hàng thị trường Nhật Bản và Hoa Kỳ.
- Đạt 99.8% độ phủ Unit Test bằng Jest và Cypress.

HỌC VẤN & CHỨNG CHỈ:
- Kỹ sư Công nghệ Thông tin - Đại học Bách Khoa
- AWS Certified Solutions Architect - Associate (SAA-C03)`;

    const blob = new Blob([resumeSample], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `UpCareer_Developer_CV_Template_${selectedTemplate.toUpperCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>UpCareer Career Tools</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Tạo CV IT Chuẩn Lập Trình Viên & Vượt Bộ Lọc ATS
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Mẫu hồ sơ chuẩn quốc tế được hơn 1,400+ nhà tuyển dụng IT tại Việt Nam khuyên dùng.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector & Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-800">
          
          {/* Template Choice Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Chọn định hướng CV lập trình viên:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTemplate('fullstack')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTemplate === 'fullstack'
                    ? 'border-red-600 bg-red-50/50 ring-2 ring-red-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-red-600" />
                  Fullstack / Frontend Engineer
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Nhấn mạnh kiến trúc UI hiện đại, Web Performance, Core Web Vitals và REST/GraphQL.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('backend')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTemplate === 'backend'
                    ? 'border-red-600 bg-red-50/50 ring-2 ring-red-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-red-600" />
                  Backend / Cloud DevOps
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Tập trung vào High Concurrency, Microservices, Message Queue, Kubernetes và AWS/GCP.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('ai')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTemplate === 'ai'
                    ? 'border-red-600 bg-red-50/50 ring-2 ring-red-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  AI / Machine Learning Engineer
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Làm nổi bật các mô hình LLM, PyTorch, RAG Pipelines, Vector Search và Paper publications.
                </p>
              </button>
            </div>
          </div>

          {/* Golden Rules for Vietnamese IT CV */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-red-600" />
              4 Quy tắc vàng để CV IT nổi bật với nhà tuyển dụng
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <span className="font-bold text-red-600">01.</span>
                <span><strong>Định lượng hóa thành tựu:</strong> Thay vì viết "Phát triển API", hãy viết "Thiết kế API thanh toán xử lý 10,000 req/s, giảm 35% độ trễ".</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-red-600">02.</span>
                <span><strong>Đính kèm Link thực tế:</strong> Luôn có link GitHub, LinkedIn, Tech Blog hoặc sản phẩm đang chạy thực tế trên production.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-red-600">03.</span>
                <span><strong>Nhóm kỹ năng khoa học:</strong> Phân loại rõ: Ngôn ngữ chính, Frameworks, Database, Cloud & DevOps, CI/CD tools.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-red-600">04.</span>
                <span><strong>Định dạng ATS 1 cột chuẩn:</strong> Tránh các layout 2 cột phức tạp với thanh % kỹ năng hình vẽ gây lỗi đọc hệ thống ATS.</span>
              </div>
            </div>
          </div>

          {/* Interactive CV Live Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Xem trước bản mẫu (Template Preview)</span>
              <span className="text-xs text-slate-400 font-mono">Định dạng 1 cột chuẩn ATS</span>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-xs font-sans text-xs space-y-3">
              <div className="border-b border-slate-200 pb-3 text-center">
                <h2 className="text-lg font-black text-slate-900 uppercase">NGUYỄN VĂN AN</h2>
                <div className="text-red-600 font-bold text-xs uppercase mt-0.5">
                  {selectedTemplate === 'fullstack' ? 'Senior Fullstack Software Engineer' : selectedTemplate === 'backend' ? 'Lead Cloud / Backend Engineer' : 'Senior AI & Machine Learning Engineer'}
                </div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Email: dev.vietnam@gmail.com · Phone: (+84) 987 654 321 · GitHub: github.com/devvietnam · TP. Hồ Chí Minh
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-1.5 text-[11px]">
                  Tóm Tắt Kỹ Năng Cốt Lõi
                </h5>
                <p className="text-slate-700 leading-relaxed">
                  {selectedTemplate === 'fullstack'
                    ? 'Hơn 5 năm kinh nghiệm phát triển phần mềm đa nền tảng với React 18, Next.js, Node.js và TypeScript. Thành thạo xây dựng Design System và Micro-frontends.'
                    : selectedTemplate === 'backend'
                    ? 'Chuyên sâu 6+ năm về Microservices hiệu năng cao bằng Golang, Java Spring Boot và nền tảng điện toán đám mây AWS. Quen thuộc kiến trúc chịu tải hàng chục ngàn TPS.'
                    : 'Chuyên gia Trí tuệ Nhân tạo với kinh nghiệm triển khai LLMs, RAG, Fine-tuning mô hình ngôn ngữ tiếng Việt và tối ưu hóa cụm GPU NVIDIA A100.'}
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-1.5 text-[11px]">
                  Kinh Nghiệm Thực Chiến Gần Nhất
                </h5>
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Senior Software Engineer — Tech Unicorn Vietnam</span>
                    <span className="font-mono text-slate-500">2023 – Nay</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                    <li>Thiết kế và triển khai module xử lý giao dịch chịu tải 15,000 TPS, duy trì SLA 99.99%.</li>
                    <li>Giảm 40% chi phí hạ tầng Cloud nhờ tái cấu trúc Docker containers và caching Redis.</li>
                    <li>Tham gia tuyển dụng, phỏng vấn và đào tạo hơn 8 kỹ sư phần mềm mới.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {downloaded && (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Đã tải mẫu CV thành công!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải Mẫu CV (ATS Template)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
