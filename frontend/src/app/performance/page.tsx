'use client';

import { useEffect, useState } from 'react';

interface KpiMetric {
  id: string;
  metricName: string;
  targetValue: number;
  actualValue: number;
  period: string;
}

interface Feedback {
  id: string;
  score: number;
  comment: string | null;
  period: string;
  reviewer: {
    fullName: string;
    email: string;
  };
}

interface DashboardData {
  totalKpis: number;
  avgCompletionPercentage: number;
  avgFeedbackScore: number;
  kpis: KpiMetric[];
  feedbacks: Feedback[];
}

export default function PerformancePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Lấy dữ liệu Dashboard
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/performance/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Lỗi lấy dữ liệu Performance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Khởi tạo KPI mẫu nếu chưa có
  const handleSeedKpis = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/performance/seed-kpis`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setMessage('Đã khởi tạo danh sách KPI mẫu thành công!');
        fetchDashboard();
      }
    } catch (err) {
      console.error('Lỗi seed KPI:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">📊 Performance & 360 Review</h1>
        <p className="text-gray-600">Theo dõi chỉ số KPI và tổng hợp đánh giá phản hồi</p>
      </div>

      {message && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {message}
        </div>
      )}

      {/* Thống kê Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500">Tổng số KPI</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{data?.totalKpis || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500">Tỷ lệ hoàn thành trung bình</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {data?.avgCompletionPercentage || 0}%
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500">Điểm 360 Feedback TB</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {data?.avgFeedbackScore || 0} / 10
          </p>
        </div>
      </div>

      {/* Khối KPI Metrics */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">🎯 KPI Metrics</h2>
          {data?.kpis.length === 0 && (
            <button
              onClick={handleSeedKpis}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              Tạo KPI mẫu
            </button>
          )}
        </div>

        {data?.kpis.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Chưa có chỉ số KPI nào được ghi nhận.</p>
        ) : (
          <div className="space-y-4">
            {data?.kpis.map((kpi) => {
              const progress = Math.min(
                100,
                Math.round((kpi.actualValue / (kpi.targetValue || 1)) * 100),
              );

              return (
                <div key={kpi.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800">{kpi.metricName}</h3>
                      <p className="text-xs text-gray-500">Kỳ đánh giá: {kpi.period}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-700">
                        {kpi.actualValue} / {kpi.targetValue}
                      </span>
                      <p className="text-xs text-gray-500">{progress}% hoàn thành</p>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        progress >= 100 ? 'bg-green-500' : progress >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Khối 360 Feedback */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-800">💬 Đánh giá 360 Feedback nhận được</h2>
        {data?.feedbacks.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Chưa có phản hồi 360 nào.</p>
        ) : (
          <div className="space-y-3">
            {data?.feedbacks.map((fb) => (
              <div key={fb.id} className="p-4 bg-gray-50 rounded-lg border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">
                    Người đánh giá: {fb.reviewer?.fullName || 'Đồng nghiệp'}
                  </span>
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                    {fb.score} / 10 điểm
                  </span>
                </div>
                {fb.comment && <p className="text-sm text-gray-600">"{fb.comment}"</p>}
                <p className="text-xs text-gray-400">Kỳ: {fb.period}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
