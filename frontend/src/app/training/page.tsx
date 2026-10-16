
"use client";

import { useMemo, useState } from "react";

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
  { name: "Technical", current: 65, target: 85 },
  { name: "Communication", current: 70, target: 80 },
  { name: "Leadership", current: 45, target: 75 },
  { name: "Problem Solving", current: 60, target: 85 },
  { name: "Teamwork", current: 80, target: 85 },
  { name: "Adaptability", current: 55, target: 80 },
];

const initialCertifications: Certification[] = [
  {
    id: 1,
    name: "AWS Cloud Practitioner",
    issuer: "Amazon Web Services",
    issueDate: "2025-03-10",
    expirationDate: "2028-03-10",
  },
  {
    id: 2,
    name: "Professional Scrum Master I",
    issuer: "Scrum.org",
    issueDate: "2025-07-15",
    expirationDate: "",
  },
  {
    id: 3,
    name: "Google Data Analytics",
    issuer: "Google",
    issueDate: "2024-11-20",
    expirationDate: "2026-11-20",
  },
];

function RadarChart({ skills }: { skills: Skill[] }) {
  const center = 180;
  const radius = 125;

  const points = (values: number[]) =>
    values
      .map((value, index) => {
        const angle =
          -Math.PI / 2 + (2 * Math.PI * index) / values.length;
        const r = (value / 100) * radius;

        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
      })
      .join(" ");

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
        const angle =
          -Math.PI / 2 + (2 * Math.PI * index) / skills.length;

        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);

        const labelX = center + (radius + 28) * Math.cos(angle);
        const labelY = center + (radius + 28) * Math.sin(angle);

        return (
          <g key={skill.name}>
            <line
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#d1d5db"
            />
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
  if (!date) return "Không hết hạn";

  return new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN");
}

function getStatus(expirationDate: string) {
  if (!expirationDate) {
    return { label: "Không hết hạn", className: "bg-blue-100 text-blue-800" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${expirationDate}T00:00:00`);
  const daysLeft = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft < 0) {
    return { label: "Đã hết hạn", className: "bg-red-100 text-red-800" };
  }

  if (daysLeft <= 90) {
    return {
      label: "Sắp hết hạn",
      className: "bg-amber-100 text-amber-800",
    };
  }

  return { label: "Còn hiệu lực", className: "bg-green-100 text-green-800" };
}

export default function TrainingPage() {
  const [skills, setSkills] = useState(initialSkills);
  const [certifications, setCertifications] = useState(initialCertifications);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

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
      alert("Vui lòng nhập tên chứng chỉ, đơn vị cấp và ngày cấp.");
      return;
    }

    if (expirationDate && expirationDate < issueDate) {
      alert("Ngày hết hạn không được trước ngày cấp.");
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

    setName("");
    setIssuer("");
    setIssueDate("");
    setExpirationDate("");
    setShowForm(false);
  }

  function deleteCertification(id: number) {
    if (!window.confirm("Bạn có chắc muốn xóa chứng chỉ này?")) return;

    setCertifications((previous) =>
      previous.filter((cert) => cert.id !== id)
    );
  }

  function updateSkill(
    index: number,
    field: "current" | "target",
    value: number
  ) {
    setSkills((previous) =>
      previous.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      )
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Human Resources
            </p>
            <h1 className="mt-2 text-3xl font-bold">Training & Certifications</h1>
            <p className="mt-2 text-sm text-slate-500">
              Theo dõi kỹ năng nhân viên và quản lý chứng chỉ.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Thêm chứng chỉ
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Tổng kỹ năng</p>
            <p className="mt-2 text-3xl font-bold">{totalSkills}</p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Khoảng trống kỹ năng trung bình</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {averageGap.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Tổng chứng chỉ</p>
            <p className="mt-2 text-3xl font-bold">{certifications.length}</p>
          </div>
        </section>

        {showForm && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Thêm chứng chỉ mới</h2>

            <form
              onSubmit={addCertification}
              className="grid gap-4 sm:grid-cols-2"
            >
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
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Lưu chứng chỉ
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border px-5 py-3 font-semibold hover:bg-slate-100"
                >
                  Hủy
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3">
              <h2 className="text-xl font-bold">Skill Gap Radar Chart</h2>
              <p className="mt-1 text-sm text-slate-500">
                So sánh mức kỹ năng hiện tại với mục tiêu.
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
              <h3 className="font-semibold">Điều chỉnh điểm kỹ năng</h3>

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
                        updateSkill(index, "current", Number(event.target.value))
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
                        updateSkill(index, "target", Number(event.target.value))
                      }
                      className="mt-1 block w-full"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Certifications</h2>
              <p className="mt-1 text-sm text-slate-500">
                Danh sách chứng chỉ và thời hạn hiệu lực.
              </p>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên chứng chỉ hoặc đơn vị cấp..."
              className="mb-4 w-full rounded-lg border p-3"
            />

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
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
                    const status = getStatus(cert.expirationDate);

                    return (
                      <tr key={cert.id} className="border-b last:border-0">
                        <td className="p-3">
                          <p className="font-semibold">{cert.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {cert.issuer}
                          </p>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {formatDate(cert.issueDate)}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {formatDate(cert.expirationDate)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => deleteCertification(cert.id)}
                            className="font-semibold text-red-600 hover:text-red-800"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredCertifications.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-6 text-center text-slate-500"
                      >
                        Không tìm thấy chứng chỉ.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-slate-500">
          Training Management · Dữ liệu demo trên trình duyệt, chưa kết nối API.
        </p>
      </div>
    </main>
  );
}