'use client';
import React, { useState } from 'react';
import axios from 'axios';

export default function PerformancePage() {
  const [loading, setLoading] = useState(false);

  // Dữ liệu biểu đồ so sánh KPI (kpi_metrics)
  const kpiMetrics = [
    { id: 'k1', metric: 'Tỷ lệ hoàn thành Sprint đúng hạn', target: 90, actual: 95, dept: 'Kỹ thuật & Công nghệ' },
    { id: 'k2', metric: 'Chất lượng bàn giao & Code Review', target: 85, actual: 88, dept: 'Kỹ thuật & Công nghệ' },
    { id: 'k3', metric: 'Điểm hài lòng phối hợp liên phòng ban', target: 80, actual: 76, dept: 'Toàn công ty' },
    { id: 'k4', metric: 'Tỷ lệ hoàn thành mục tiêu OKR Quý', target: 85, actual: 92, dept: 'Sản phẩm' },
  ];

  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'Trần Anh Tân',
      email: 'anhtanht1905@gmail.com',
      role: 'Frontend Developer',
      dept: 'Kỹ thuật & Công nghệ',
      status: 'Chờ nộp',
      completed: false,
      magicLink: 'https://hr.company.vn/review-360?token=ml_tan_9821',
      reminded: false,
    },
    {
      id: 2,
      name: 'Lê Hoàng Nam',
      email: 'nam.le@company.vn',
      role: 'Backend Engineer',
      dept: 'Kỹ thuật & Công nghệ',
      status: 'Đã hoàn thành',
      completed: true,
      magicLink: 'https://hr.company.vn/review-360?token=ml_nam_4410',
      reminded: false,
    },
    {
      id: 3,
      name: 'Phạm Minh Tuấn',
      email: 'tuan.pham@company.vn',
      role: 'UI/UX Designer',
      dept: 'Sản phẩm',
      status: 'Chờ nộp',
      completed: false,
      magicLink: 'https://hr.company.vn/review-360?token=ml_tuan_7732',
      reminded: false,
    },
    {
      id: 4,
      name: 'Nguyễn Thu Hà',
      email: 'ha.nguyen@company.vn',
      role: 'HR Specialist',
      dept: 'Nhân sự',
      status: 'Đã hoàn thành',
      completed: true,
      magicLink: 'https://hr.company.vn/review-360?token=ml_ha_1109',
      reminded: false,
    },
  ]);

  const [logs, setLogs] = useState([
    { time: 'Ngày 25', text: 'Cronjob định kỳ hàng tháng sẵn sàng quét danh sách nhân sự chưa nộp đánh giá 360°', type: 'purple' }
  ]);

  const handleTriggerAllPending = async () => {
    setLoading(true);
    const pendingList = employees.filter(e => !e.completed);

    try {
      const payload = {
        event: 'monthly_360_feedback_reminder',
        runDate: '25',
        totalPending: pendingList.length,
        recipients: pendingList.map(emp => ({
          id: emp.id,
          name: emp.name,
          email: emp.email,
          department: emp.dept,
          magicLink: emp.magicLink
        }))
      };

      const res = await axios.post('/api/n8n', {
        workflow: 'feedback_reminder',
        payload
      });

      setEmployees(employees.map(emp => !emp.completed ? { ...emp, reminded: true, status: 'Đã gửi Magic Link' } : emp));

      setLogs(prev => [
        {
          time: res.data.timestamp || 'Vừa xong',
          text: `Đã quét thấy ${pendingList.length} nhân sự chưa nộp (${pendingList.map(p => p.name).join(', ')}) và gửi tin nhắn kèm Magic Link form review`,
          type: 'green'
        },
        ...prev
      ]);
    } catch (err) {
      console.error('Lỗi gửi Magic Link:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSingleMagicLink = async (empId: number) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/n8n', {
        workflow: 'feedback_reminder',
        payload: {
          event: 'single_360_feedback_reminder',
          recipient: {
            name: emp.name,
            email: emp.email,
            magicLink: emp.magicLink
          }
        }
      });

      setEmployees(employees.map(e => e.id === empId ? { ...e, reminded: true, status: 'Đã gửi Magic Link' } : e));
      setLogs(prev => [
        {
          time: res.data.timestamp || 'Vừa xong',
          text: `Đã gửi tin nhắn nhắc nhở kèm Magic Link riêng cho ${emp.name} (${emp.email})`,
          type: 'blue'
        },
        ...prev
      ]);
    } catch (err) {
      console.error('Lỗi gửi cá nhân:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = employees.filter(e => !e.completed).length;

  return (
    <div>
      {/* HEADER BANNER */}
      <div className="hero-banner" style={{ marginBottom: '24px', padding: '24px 32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <a href="/" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>← Trang chủ</a>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Đánh giá hiệu suất & KPI</span>
          </div>
          <h1 className="hero-title" style={{ fontSize: '24px', marginBottom: '6px' }}>📊 AI Performance Tracking Agent</h1>
          <p className="hero-subtitle" style={{ maxWidth: '640px' }}>
            Theo dõi biểu đồ so sánh chỉ số KPI thực tế và tự động chạy vào ngày 25 hàng tháng để gửi tin nhắn nhắc nhở kèm Magic Link form review 360°.
          </p>
        </div>

        <button
          onClick={handleTriggerAllPending}
          disabled={loading}
          className="btn btn-green"
          style={{ padding: '12px 22px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
        >
          <span>📨</span> {loading ? 'Đang quét & gửi Magic Link...' : `Quét & Gửi Magic Link (${pendingCount} nhân sự)`}
        </button>
      </div>

      {/* 3 THẺ THỐNG KÊ NHANH */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Trung bình KPI toàn khối</div>
              <div className="stat-value" style={{ color: '#4f46e5' }}>87.8%</div>
            </div>
            <div className="stat-icon-box bg-blue-soft" style={{ marginBottom: 0 }}>📊</div>
          </div>
          <div className="stat-trend trend-up" style={{ marginTop: '14px' }}>
            ↑ Vượt 2.8% so với mục tiêu đề ra
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Nhân viên chưa nộp đánh giá 360°</div>
              <div className="stat-value" style={{ color: '#ea580c' }}>{pendingCount}</div>
            </div>
            <div className="stat-icon-box bg-orange-soft" style={{ marginBottom: 0 }}>⏳</div>
          </div>
          <div className="stat-trend trend-neutral" style={{ marginTop: '14px' }}>
            Sẵn sàng nhận tin nhắn kèm Magic Link
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Lịch chạy Cronjob định kỳ</div>
              <div className="stat-value" style={{ fontSize: '20px', marginTop: '4px' }}>Ngày 25 hàng tháng</div>
            </div>
            <div className="stat-icon-box bg-purple-soft" style={{ marginBottom: 0 }}>🗓️</div>
          </div>
          <div className="stat-trend trend-up" style={{ marginTop: '14px' }}>
            🟢 Tự động lọc & gửi form review
          </div>
        </div>
      </div>

      {/* BỐ CỤC 2 CỘT CHÍNH */}
      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* KHỐI 1: BIỂU ĐỒ SO SÁNH KPI (KPI COMPARISON CHART) */}
          <div className="section-card">
            <div className="section-header">
              <div>
                <h2 className="section-title">📈 Biểu đồ So sánh KPI (Thực tế vs Mục tiêu)</h2>
                <p className="section-sub">Dữ liệu trích xuất từ bảng chỉ số kpi_metrics trong kỳ đánh giá</p>
              </div>
              <span className="tag-pill">Quý hiện tại</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {kpiMetrics.map(item => (
                <div key={item.id} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13.5px' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.metric} <span style={{ fontWeight: 400, color: '#64748b', fontSize: '12px' }}>({item.dept})</span></span>
                    <span style={{ fontWeight: 700, color: item.actual >= item.target ? '#16a34a' : '#ea580c' }}>
                      Thực tế: {item.actual}% <span style={{ color: '#94a3b8', fontWeight: 500 }}>/ Mục tiêu: {item.target}%</span>
                    </span>
                  </div>
                  <div style={{ width: '100%', background: '#e2e8f0', height: '10px', borderRadius: '99px', position: 'relative', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${item.actual}%`,
                        background: item.actual >= item.target ? 'linear-gradient(90deg, #4f46e5, #10b981)' : '#f97316',
                        height: '100%',
                        borderRadius: '99px',
                        transition: 'width 0.4s ease'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KHỐI 2: DANH SÁCH NHÂN SỰ & MAGIC LINK (FEEDBACKS) */}
          <div className="section-card">
            <div className="section-header">
              <div>
                <h2 className="section-title">📋 Danh sách nhân sự & Trạng thái Form Review 360°</h2>
                <p className="section-sub">Hệ thống tự động tạo Magic Link riêng biệt cho từng nhân viên chưa hoàn thành</p>
              </div>
              <span className="tag-pill">{pendingCount} chưa nộp</span>
            </div>

            <div>
              {employees.map(emp => (
                <div key={emp.id} className="list-row">
                  <div className="row-left">
                    <div className={`stat-icon-box ${emp.completed ? 'bg-green-soft' : 'bg-orange-soft'}`} style={{ marginBottom: 0, width: '42px', height: '42px', fontWeight: 700, fontSize: '14px' }}>
                      {emp.name.split(' ').pop()?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 className="row-title" style={{ margin: 0 }}>{emp.name}</h3>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>({emp.email})</span>
                      </div>
                      <p className="row-meta" style={{ marginTop: '3px' }}>
                        {emp.role} · {emp.dept}
                      </p>
                      {!emp.completed && (
                        <div style={{ fontSize: '11.5px', color: '#4f46e5', marginTop: '4px', fontFamily: 'monospace' }}>
                          🔗 Magic Link: {emp.magicLink}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row-right">
                    <span
                      className="status-pill"
                      style={{
                        background: emp.completed ? '#dcfce7' : emp.reminded ? '#e0e7ff' : '#ffedd5',
                        color: emp.completed ? '#15803d' : emp.reminded ? '#4338ca' : '#c2410c'
                      }}
                    >
                      {emp.status}
                    </span>
                    {!emp.completed && (
                      <button
                        onClick={() => handleSendSingleMagicLink(emp.id)}
                        disabled={loading}
                        className="btn"
                        style={{ padding: '7px 12px', fontSize: '12px', background: '#0f172a' }}
                      >
                        Gửi Magic Link
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: CẤU HÌNH CRONJOB & NHẬT KÝ GỬI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="section-card">
            <h2 className="section-title" style={{ marginBottom: '12px' }}>⚙️ Quy trình tự động ngày 25</h2>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '16px' }}>
              Vào ngày 25 hàng tháng, hệ thống tự động tìm toàn bộ nhân sự chưa nộp bài đánh giá 360° và gửi tin nhắn kèm đường dẫn Magic Link cá nhân hóa.
            </p>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Lịch chạy tự động:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>09:00 - Ngày 25 hàng tháng</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Điều kiện lọc:</span>
                <span style={{ fontWeight: 600, color: '#ea580c' }}>Trạng thái = "Chờ nộp"</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Nội dung gửi:</span>
                <span style={{ fontWeight: 600, color: '#4f46e5' }}>Tin nhắn + Magic Link Review</span>
              </div>
            </div>

            <button
              onClick={handleTriggerAllPending}
              disabled={loading}
              className="btn btn-green"
              style={{ width: '100%', padding: '12px' }}
            >
              {loading ? 'Đang thực thi...' : '⚡ Kích hoạt quét & gửi nhắc nhở ngay'}
            </button>
          </div>

          <div className="section-card">
            <h2 className="section-title" style={{ marginBottom: '14px' }}>⚡ Nhật ký gửi nhắc nhở</h2>
            {logs.map((log, index) => (
              <div key={index} className="activity-item">
                <div className="act-left">
                  <div className={`act-icon bg-${log.type}-soft`}>
                    {log.type === 'green' ? '✓' : '📨'}
                  </div>
                  <p className="act-text">{log.text}</p>
                </div>
                <span className="act-time">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
