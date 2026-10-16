'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Header } from '@/components/topdev/Header';
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Award,
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Target,
  TrendingUp,
} from 'lucide-react';

type Skill = {
  name: string;
  current: number;
  target: number;
};

type Certification = {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate: string;
};

const initialSkills: Skill[] = [
  { name: 'Technical', current: 65, target: 85 },
  { name: 'Communication', current: 70, target: 80 },
  { name: 'Leadership', current: 45, target: 75 },
  { name: 'Problem Solving', current: 60, target: 85 },
  { name: 'Teamwork', current: 80, target: 85 },
  { name: 'Adaptability', current: 55, target: 80 },
];

const initialCertifications: Certification[] = [
  {
    id: 1,
    name: 'AWS Cloud Practitioner',
    issuer: 'Amazon Web Services',
    issueDate: '2025-03-10',
    expirationDate: '2028-03-10',
  },
  {
    id: 2,
    name: 'Professional Scrum Master I',
    issuer: 'Scrum.org',
    issueDate: '2025-07-15',
    expirationDate: '',
  },
  {
    id: 3,
    name: 'Google Data Analytics',
    issuer: 'Google',
    issueDate: '2024-11-20',
    expirationDate: '2026-11-20',
  },
];

function RadarChart({ skills }: { skills: Skill[] }) {
  const center = 180;
  const radius = 125;

  const points = (values: number[]) =>
    values
      .map((value, index) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * index) / values.length;
        const r = (value / 100) * radius;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
      })
      .join(' ');

  const grid = [20, 40, 60, 80, 100];

  return (
    <svg
      viewBox="0 0 360 360"
      role="img"
      aria-label="Radar chart comparing current skills with target skills"
      className="mx-auto w-full max-w-[380px]"
    >
      {grid.map((level) => (
        <polygon
          key={level}
          points={points(skills.map(() => level))}
          fill="none"
          stroke="#d1d5db"
          strokeWidth="1"
          transform={`translate(${center - 180} ${center - 180})`}
        />
      ))}

      {skills.map((skill, index) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * index) / skills.length;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        const labelX = center + (radius + 28) * Math.cos(angle);
        const labelY = center + (radius + 28) * Math.sin(angle);

        return (
          <g key={skill.name}>
            <line x1={center} y1={center} x2={x} y2={y} stroke="#d1d5db" />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="currentColor"
            >
              {skill.name}
            </text>
          </g>
        );
      })}

      <polygon
        points={points(skills.map((skill) => skill.target))}
        fill="#f59e0b"
        fillOpacity="0.12"
        stroke="#d97706"
        strokeWidth="2"
      />

      <polygon
        points={points(skills.map((skill) => skill.current))}
        fill="#2563eb"
        fillOpacity="0.22"
        stroke="#2563eb"
        strokeWidth="2"
      />
    </svg>
  );
}

function formatDate(date: string) {
  if (!date) return 'Không hết hạn';
  return new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN');
}

function getStatus(expirationDate: string) {
  if (!expirationDate) {
    return { label: 'Không hết hạn', className: 'bg-blue-100 text-blue-800' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${expirationDate}T00:00:00`);
  const daysLeft = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft < 0) {
    return { label: 'Đã hết hạn', className: 'bg-red-100 text-red-800' };
  }

  if (daysLeft <= 90) {
    return {
      label: 'Sắp hết hạn',
      className: 'bg-amber-100 text-amber-800',
    };
  }

  return { label: 'Còn hiệu lực', className: 'bg-green-100 text-green-800' };
}

export default function TrainingPage() {
  const [skills, setSkills] = useState(initialSkills);
  const [certifications, setCertifications] = useState(initialCertifications);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  // Tan's training reminder workflow state
  const [reminderData, setReminderData] = useState({
    employeeName: 'Trần Anh Tân',
    employeeEmail: 'anhtanht1905@gmail.com',
    courseName: 'AWS Solutions Architect & Next.js Microservices',
    dueDate: '30/10/2026',
    progress: 85,
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // WF_11 AI Course Recommendations state
  const [courseRecs, setCourseRecs] = useState<any[]>([]);
  const [fetchingRecs, setFetchingRecs] = useState(false);

  const fetchRecommendations = async () => {
    setFetchingRecs(true);
    try {
      const res = await axios.post('/api/n8n', {
        workflow: 'course_recommender',
      });
      if (res.data?.data?.recommendations) {
        setCourseRecs(res.data.data.recommendations);
      }
    } catch (err) {
      console.error('Lỗi lấy gợi ý khóa học:', err);
    } finally {
      setFetchingRecs(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const filteredCertifications = useMemo(
    () =>
      certifications.filter((cert) =>
        `${cert.name} ${cert.issuer}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [certifications, search]
  );

  const totalSkills = skills.length;
  const averageGap =
    skills.reduce(
      (sum, skill) => sum + Math.max(skill.target - skill.current, 0),
      0
    ) / totalSkills;

  function addCertification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !issuer.trim() || !issueDate) {
      alert('Vui lòng nhập tên chứng chỉ, đơn vị cấp và ngày cấp.');
      return;
    }

    if (expirationDate && expirationDate < issueDate) {
      alert('Ngày hết hạn không được trước ngày cấp.');
      return;
    }

    setCertifications((previous) => [
      ...previous,
      {
        id: Date.now(),
        name: name.trim(),
        issuer: issuer.trim(),
        issueDate,
        expirationDate,
      },
    ]);

    setName('');
    setIssuer('');
    setIssueDate('');
    setExpirationDate('');
    setShowForm(false);
  }

  function deleteCertification(id: number) {
    if (!window.confirm('Bạn có chắc muốn xóa chứng chỉ này?')) return;
    setCertifications((previous) =>
      previous.filter((cert) => cert.id !== id)
    );
  }

  function updateSkill(
    index: number,
    field: 'current' | 'target',
    value: number
  ) {
    setSkills((previous) =>
      previous.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      )
    );
  }

  const handleTriggerTrainingWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const payload = {
      ...reminderData,
      employeeEmail: reminderData.employeeEmail.trim().replace(/^=/, ''),
      employeeName: reminderData.employeeName.trim(),
    };

    try {
      const res = await axios.post('/api/n8n', {
        workflow: 'training_reminder',
        payload,
      });

      if (res.data?.status === 'success') {
        setStatus({
          type: 'success',
          message: res.data.message || 'Đã gửi thông báo nhắc nhở đào tạo & chứng chỉ thành công!',
        });
      } else {
        throw new Error('Lỗi kết nối');
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Lỗi kết nối hệ thống tự động hóa. Vui lòng thử lại sau.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Hero Banner Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] text-indigo-300 uppercase tracking-wider bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800/60">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>AGENT 4 · SKILLS & TRAINING AUTOMATION</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400">WF_10 & WF_11 ACTIVE</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <span>🎯 AI Skill Gap & Training Recommender</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Phân tích khoảng cách kỹ năng (Skill Gap), đối chiếu chứng chỉ chuyên môn và tự động đề xuất khóa học trực tuyến (Coursera/Udemy) qua n8n.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 shrink-0">
              <button
                onClick={fetchRecommendations}
                disabled={fetchingRecs}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${fetchingRecs ? 'animate-spin' : ''}`} />
                <span>{fetchingRecs ? 'Đang phân tích...' : 'Gợi ý khóa học AI (WF_11)'}</span>
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-md cursor-pointer"
              >
                <span>+ Thêm chứng chỉ</span>
              </button>
            </div>
          </div>

          {/* AI Course Recommendations from WF_11 */}
          {courseRecs.length > 0 && (
            <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Khóa Học Đề Xuất Bởi AI (WF_11 Skill Gap Analysis)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Tự động tính toán độ chênh lệch kỹ năng từ database và truy xuất khóa đào tạo phù hợp.
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-200">
                  {courseRecs.length} đề xuất
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseRecs.map((rec: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                          Gap: {rec.skill_gap} cấp độ ({rec.priority})
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {rec.employee_name}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900">{rec.recommended_course}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Kỹ năng mục tiêu: <span className="font-semibold text-slate-700">{rec.skill_name}</span> (Cấp {rec.current_level} → {rec.required_level})
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {rec.providers?.map((p: string, pIdx: number) => (
                          <span key={pIdx} className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-medium">
                            {p}
                          </span>
                        ))}
                      </div>
                      {rec.course_url && (
                        <a
                          href={rec.course_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          <span>Học ngay</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex gap-3 items-center">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <BookOpen className="w-5 h-5 flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Gợi ý khóa học: Next.js & n8n Microservices</h3>
                <p className="text-xs text-slate-500 mt-0.5">Đề xuất bởi AI Agent dựa trên hồ sơ kỹ năng của bạn (Tiến độ: 85%).</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex gap-3 items-center">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Award className="w-5 h-5 flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Chứng chỉ AWS Solutions Architect</h3>
                <p className="text-xs text-slate-500 mt-0.5">Trạng thái: Đã cập nhật & đồng bộ với cơ sở dữ liệu nhân sự.</p>
              </div>
            </div>
          </div>

        {/* Top Summary Cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Tổng kỹ năng đánh giá</p>
            <p className="mt-2 text-3xl font-bold">{totalSkills}</p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Khoảng trống kỹ năng TB (Skill Gap)</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {averageGap.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Tổng chứng chỉ theo dõi</p>
            <p className="mt-2 text-3xl font-bold">{certifications.length}</p>
          </div>
        </section>

        {/* Add Certification Modal/Form */}
        {showForm && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Thêm chứng chỉ mới</h2>

            <form onSubmit={addCertification} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Tên chứng chỉ *
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded-lg border p-3"
                  placeholder="Ví dụ: AWS Cloud Practitioner"
                />
              </label>

              <label className="text-sm font-medium">
                Đơn vị cấp *
                <input
                  required
                  value={issuer}
                  onChange={(event) => setIssuer(event.target.value)}
                  className="mt-1 w-full rounded-lg border p-3"
                  placeholder="Ví dụ: Amazon Web Services"
                />
              </label>

              <label className="text-sm font-medium">
                Ngày cấp *
                <input
                  required
                  type="date"
                  value={issueDate}
                  onChange={(event) => setIssueDate(event.target.value)}
                  className="mt-1 w-full rounded-lg border p-3"
                />
              </label>

              <label className="text-sm font-medium">
                Ngày hết hạn
                <input
                  type="date"
                  value={expirationDate}
                  min={issueDate || undefined}
                  onChange={(event) => setExpirationDate(event.target.value)}
                  className="mt-1 w-full rounded-lg border p-3"
                />
              </label>

              <div className="flex gap-3 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition"
                >
                  Lưu chứng chỉ
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border px-5 py-3 font-semibold hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Skill Gap Radar Chart & Certifications Table */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Radar Chart */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3">
              <h2 className="text-xl font-bold">Skill Gap Radar Chart</h2>
              <p className="mt-1 text-sm text-slate-500">
                So sánh mức kỹ năng hiện tại với mục tiêu mong đợi.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-5 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-600" />
                Hiện tại
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-600" />
                Mục tiêu
              </span>
            </div>

            <RadarChart skills={skills} />

            <div className="mt-4 space-y-4 border-t pt-4">
              <h3 className="font-semibold text-sm">Điều chỉnh điểm kỹ năng</h3>

              {skills.map((skill, index) => (
                <div key={skill.name} className="grid gap-2 sm:grid-cols-3">
                  <p className="self-center text-sm font-medium">{skill.name}</p>

                  <label className="text-xs text-slate-500">
                    Hiện tại: {skill.current}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.current}
                      onChange={(event) =>
                        updateSkill(index, 'current', Number(event.target.value))
                      }
                      className="mt-1 block w-full"
                    />
                  </label>

                  <label className="text-xs text-slate-500">
                    Mục tiêu: {skill.target}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.target}
                      onChange={(event) =>
                        updateSkill(index, 'target', Number(event.target.value))
                      }
                      className="mt-1 block w-full"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Table */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Chứng chỉ & Hiệu lực</h2>
              <p className="mt-1 text-sm text-slate-500">
                Danh sách chứng chỉ chuyên môn và thời hạn hết hạn.
              </p>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên chứng chỉ hoặc đơn vị cấp..."
              className="mb-4 w-full rounded-lg border p-3 text-sm"
            />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-3">Chứng chỉ</th>
                    <th className="p-3">Ngày cấp</th>
                    <th className="p-3">Hết hạn</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCertifications.map((cert) => {
                    const certStatus = getStatus(cert.expirationDate);

                    return (
                      <tr key={cert.id} className="border-b last:border-0 hover:bg-slate-50/50">
                        <td className="p-3">
                          <p className="font-semibold">{cert.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{cert.issuer}</p>
                        </td>
                        <td className="p-3 whitespace-nowrap">{formatDate(cert.issueDate)}</td>
                        <td className="p-3 whitespace-nowrap">{formatDate(cert.expirationDate)}</td>
                        <td className="p-3">
                          <span
                            className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${certStatus.className}`}
                          >
                            {certStatus.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => deleteCertification(cert.id)}
                            className="font-medium text-red-600 hover:text-red-800 text-xs"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredCertifications.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        Không tìm thấy chứng chỉ phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Tan's Training Reminder Webhook Form */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gửi Nhắc nhở Đào tạo & Chứng chỉ</h2>
              <p className="text-xs text-slate-500">Tự động kích hoạt n8n workflow gửi email nhắc hạn hoàn thành khóa học.</p>
            </div>
          </div>

          {status && (
            <div
              className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{status.message}</span>
            </div>
          )}

          <form onSubmit={handleTriggerTrainingWorkflow} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Tên nhân viên</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={reminderData.employeeName}
                    onChange={(e) => setReminderData({ ...reminderData, employeeName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Email nhận thông báo</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={reminderData.employeeEmail}
                    onChange={(e) => setReminderData({ ...reminderData, employeeEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Khóa học / Chứng chỉ</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={reminderData.courseName}
                    onChange={(e) => setReminderData({ ...reminderData, courseName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Hạn hoàn thành (Deadline)</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={reminderData.dueDate}
                    onChange={(e) => setReminderData({ ...reminderData, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Đang gửi...'
              ) : (
                <>
                  <Send className="w-4 h-4" /> Gửi Nhắc Nhở Đào Tạo (n8n Webhook)
                </>
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
