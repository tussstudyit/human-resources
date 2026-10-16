'use client';
import React, { useState } from 'react';
import axios from 'axios';

export default function OnboardingPage() {
  const [tasks, setTasks] = useState([
    {
      id: 't1',
      title: 'Hoàn thiện hồ sơ nhân sự & thông tin cá nhân',
      desc: 'Cập nhật CCCD, tài khoản ngân hàng và thông tin liên hệ khẩn cấp trên hệ thống',
      category: 'Hành chính',
      completed: false,
      isAccountTask: false,
      iconBg: 'bg-blue-soft',
    },
    {
      id: 't2',
      title: 'Nhận tài khoản công ty (Email, Jira, Slack)',
      desc: 'Khi tick hoàn thành, hệ thống tự động gọi API khởi tạo tài khoản Email, Jira và Slack công ty',
      category: 'IT Provisioning',
      completed: false,
      isAccountTask: true,
      iconBg: 'bg-purple-soft',
    },
    {
      id: 't3',
      title: 'Tham gia buổi định hướng văn hóa & quy trình',
      desc: 'Gặp gỡ HR Mentor, tìm hiểu quy chế làm việc và lộ trình thử việc 2 tháng',
      category: 'Đào tạo',
      completed: false,
      isAccountTask: false,
      iconBg: 'bg-orange-soft',
    }
  ]);

  const [provisioning, setProvisioning] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  // Trạng thái bộ tài khoản IT sau khi n8n Mock API trả về
  const [itAccounts, setItAccounts] = useState<{
    email: string;
    slack: string;
    jira: string;
    provisioned: boolean;
  }>({
    email: 'Chưa khởi tạo',
    slack: 'Chưa khởi tạo',
    jira: 'Chưa khởi tạo',
    provisioned: false,
  });

  const [logs, setLogs] = useState([
    { time: 'Hôm nay', text: 'Khởi tạo danh sách checklist hội nhập tuần đầu cho Trần Anh Tân', type: 'blue' }
  ]);

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // LUỒNG 1: Khi nhân viên tick hoàn thành task "Nhận tài khoản" -> n8n mock API tự động tạo Jira/Slack/Email công ty
  const triggerITProvisioning = async () => {
    setProvisioning(true);
    try {
      const payload = {
        event: 'task_completed',
        taskName: 'Nhận tài khoản',
        employee: {
          name: 'Trần Anh Tân',
          personalEmail: 'anhtanht1905@gmail.com',
          department: 'Tech',
          role: 'Software Engineer'
        },
        services: ['Company Email', 'Slack', 'Jira']
      };

      const res = await axios.post('/api/n8n', {
        workflow: 'it_provisioning',
        payload
      });

      setItAccounts({
        email: 'tan.tran@company.vn (Active)',
        slack: '@tan.tran - Workspace #tech-team (Joined)',
        jira: 'tan.tran@company.vn - Project: HR-Core (Granted)',
        provisioned: true,
      });

      setLogs(prev => [
        {
          time: res.data.timestamp || 'Vừa xong',
          text: 'n8n Mock API: Đã tạo thành công Email công ty, Slack và Jira cho Trần Anh Tân',
          type: 'green'
        },
        ...prev
      ]);
    } catch (err) {
      console.error('Lỗi cấp phát tài khoản:', err);
    } finally {
      setProvisioning(false);
    }
  };

  // LUỒNG 2: Cronjob theo dõi tiến độ checklist sau 3 ngày -> Nếu chưa đạt 50% thì bắn tin nhắn nhắc nhở và báo HR Mentor
  const triggerFirstWeekCheckin = async (currentPct = progressPercent, doneCount = completedCount) => {
    setCheckingIn(true);
    try {
      const isUnder50 = currentPct < 50;
      const payload = {
        event: 'first_week_checkin_after_3_days',
        employeeName: 'Trần Anh Tân',
        employeeEmail: 'anhtanht1905@gmail.com',
        daysElapsed: 3,
        completedTasks: doneCount,
        totalTasks: tasks.length,
        progressPercent: currentPct,
        isBelowThreshold: isUnder50,
        hrMentor: {
          name: 'Nguyễn Thị Lan',
          email: 'lan.nguyen.hr@company.vn'
        },
        pendingTasks: tasks.filter(t => !t.completed).map(t => t.title)
      };

      const res = await axios.post('/api/n8n', {
        workflow: 'first_week_checkin',
        payload
      });

      if (isUnder50) {
        setLogs(prev => [
          {
            time: res.data.timestamp || 'Vừa xong',
            text: `Tiến độ sau 3 ngày đạt ${currentPct}% (< 50%): Đã bắn tin nhắn nhắc nhở nhân viên & gửi cảnh báo cho HR Mentor Nguyễn Thị Lan`,
            type: 'orange'
          },
          ...prev
        ]);
      } else {
        setLogs(prev => [
          {
            time: res.data.timestamp || 'Vừa xong',
            text: `Kiểm tra định kỳ sau 3 ngày: Tiến độ đạt ${currentPct}% (Đạt yêu cầu >= 50%), đã cập nhật báo cáo cho HR Mentor`,
            type: 'green'
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Lỗi kiểm tra tiến độ:', err);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleToggle = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;

    const newStatus = !target.completed;
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, completed: newStatus } : t);
    setTasks(updatedTasks);

    if (newStatus) {
      setLogs(prev => [
        { time: 'Vừa xong', text: `Nhân sự đã tick hoàn thành: "${target.title}"`, type: 'blue' },
        ...prev
      ]);
    }

    // Nếu tick hoàn thành vào task "Nhận tài khoản" -> Kích hoạt ngay Luồng 1 (tạo Jira/Slack/Email)
    if (target.isAccountTask && newStatus) {
      await triggerITProvisioning();
    }
  };

  return (
    <div>
      {/* HEADER BANNER */}
      <div className="hero-banner" style={{ marginBottom: '24px', padding: '24px 32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <a href="/" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>← Trang chủ</a>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Hội nhập nhân sự</span>
          </div>
          <h1 className="hero-title" style={{ fontSize: '24px', marginBottom: '6px' }}>🚀 AI Onboarding Agent</h1>
          <p className="hero-subtitle" style={{ maxWidth: '620px' }}>
            Tự động hóa khởi tạo tài khoản Jira, Slack, Email công ty khi nhân viên tick hoàn thành nhiệm vụ và tự động kiểm tra tiến độ sau 3 ngày để nhắc nhở & báo cáo HR Mentor.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => triggerFirstWeekCheckin()}
            disabled={checkingIn}
            className="btn"
            style={{ background: progressPercent < 50 ? '#ea580c' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 18px' }}
          >
            <span>⏱️</span> {checkingIn ? 'Đang kiểm tra...' : 'Kiểm tra tiến độ 3 ngày & Báo HR Mentor'}
          </button>
        </div>
      </div>

      {/* 3 THẺ THỐNG KÊ NHANH */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Tiến độ Checklist (Sau 3 ngày)</div>
              <div className="stat-value" style={{ color: progressPercent < 50 ? '#ea580c' : '#16a34a' }}>{progressPercent}%</div>
            </div>
            <div className="stat-icon-box bg-blue-soft" style={{ marginBottom: 0 }}>📋</div>
          </div>
          <div className="progress-bar" style={{ margin: '12px 0 8px 0', height: '8px' }}>
            <div className="progress-fill" style={{ width: `${progressPercent}%`, background: progressPercent < 50 ? '#f97316' : '#10b981' }}></div>
          </div>
          <div className="stat-trend" style={{ color: progressPercent < 50 ? '#dc2626' : '#16a34a' }}>
            {progressPercent < 50 ? '⚠️ Chưa đạt 50%: Tự động nhắc nhở & báo HR Mentor' : '✓ Đã vượt mốc 50% tiêu chuẩn tuần đầu'}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Nhiệm vụ đã hoàn tất</div>
              <div className="stat-value">{completedCount} / {tasks.length}</div>
            </div>
            <div className="stat-icon-box bg-green-soft" style={{ marginBottom: 0 }}>✓</div>
          </div>
          <div className="stat-trend trend-up" style={{ marginTop: '22px' }}>
            ↑ Theo dõi tự động qua Cronjob 3 ngày
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Trạng thái Mock API (Jira/Slack/Email)</div>
              <div className="stat-value" style={{ fontSize: '18px', marginTop: '6px', color: itAccounts.provisioned ? '#16a34a' : '#64748b' }}>
                {itAccounts.provisioned ? '🟢 Đã cấp phát đủ bộ' : '⏳ Chờ tick nhiệm vụ'}
              </div>
            </div>
            <div className="stat-icon-box bg-purple-soft" style={{ marginBottom: 0 }}>🔐</div>
          </div>
          <div className="stat-trend trend-neutral" style={{ marginTop: '22px' }}>
            Tự động kích hoạt khi tick task Nhận tài khoản
          </div>
        </div>
      </div>

      {/* BỐ CỤC 2 CỘT CHÍNH */}
      <div className="dashboard-grid">
        {/* CỘT TRÁI: DANH SÁCH CHECKLIST */}
        <div className="section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title">📌 Checklist công việc hội nhập tuần đầu</h2>
              <p className="section-sub">Khi tick hoàn thành "Nhận tài khoản công ty", hệ thống sẽ gọi Webhook tạo tài khoản tự động</p>
            </div>
            <span className="tag-pill">{completedCount}/{tasks.length} Hoàn thành</span>
          </div>

          <div>
            {tasks.map(t => (
              <div key={t.id} className="list-row" style={{ background: t.completed ? '#f8fafc' : '#ffffff', borderColor: t.completed ? '#e2e8f0' : '#edf2f9' }}>
                <div className="row-left">
                  <div className={`stat-icon-box ${t.completed ? 'bg-green-soft' : t.iconBg}`} style={{ marginBottom: 0, width: '44px', height: '44px', fontSize: '18px' }}>
                    {t.completed ? '✓' : (t.isAccountTask ? '⚡' : '📄')}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 className="row-title" style={{ margin: 0, textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#94a3b8' : '#0f172a' }}>
                        {t.title}
                      </h3>
                      {t.isAccountTask && (
                        <span className="tag-pill" style={{ background: '#f3e8ff', color: '#7e22ce' }}>Tự động tạo Jira/Slack/Email</span>
                      )}
                    </div>
                    <p className="row-meta">{t.desc}</p>
                  </div>
                </div>

                <div className="row-right">
                  <span className="tag-pill" style={{ background: '#f1f5f9', color: '#475569' }}>{t.category}</span>
                  <button
                    onClick={() => handleToggle(t.id)}
                    disabled={t.isAccountTask && provisioning}
                    className="btn"
                    style={{
                      background: t.completed ? '#10b981' : '#4f46e5',
                      color: '#ffffff',
                      padding: '9px 16px',
                      fontSize: '13px',
                      minWidth: '145px'
                    }}
                  >
                    {t.isAccountTask && provisioning
                      ? 'Đang tạo tài khoản...'
                      : t.completed
                      ? '✓ Đã hoàn thành'
                      : 'Tick Hoàn Thành'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* KẾT QUẢ MOCK API TÀI KHOẢN IT */}
          <div style={{ marginTop: '20px', padding: '18px', borderRadius: '14px', background: itAccounts.provisioned ? '#f0fdf4' : '#f8fafc', border: `1px solid ${itAccounts.provisioned ? '#bbf7d0' : '#e2e8f0'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                🛠️ Chi tiết tài khoản công ty được cấp tự động (Mock API)
              </span>
              <span className="status-pill" style={{ background: itAccounts.provisioned ? '#dcfce7' : '#e2e8f0', color: itAccounts.provisioned ? '#15803d' : '#475569' }}>
                {itAccounts.provisioned ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12.5px' }}>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', marginBottom: '2px' }}>📧 Email công ty</div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{itAccounts.email}</div>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', marginBottom: '2px' }}>💬 Tài khoản Slack</div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{itAccounts.slack}</div>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', marginBottom: '2px' }}>📌 Tài khoản Jira</div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{itAccounts.jira}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN HR MENTOR & NHẬT KÝ WORKFLOW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="section-card">
            <h2 className="section-title" style={{ marginBottom: '16px' }}>👤 Nhân sự & HR Mentor</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '16px' }}>
              <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>TT</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Trần Anh Tân</div>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>Software Engineer · Phòng Tech</div>
                <div style={{ fontSize: '12px', color: '#4f46e5', marginTop: '2px' }}>anhtanht1905@gmail.com</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Thời gian hội nhập:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Ngày thứ 3 (Tuần 1)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>HR Mentor phụ trách:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Nguyễn Thị Lan</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Ngưỡng cảnh báo:</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>Dưới 50% sau 3 ngày</span>
              </div>
            </div>

            <button
              onClick={() => triggerFirstWeekCheckin()}
              disabled={checkingIn}
              className="btn"
              style={{ width: '100%', background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}
            >
              {checkingIn ? 'Đang gửi báo cáo...' : '📢 Chạy Cronjob kiểm tra tiến độ 3 ngày'}
            </button>
          </div>

          <div className="section-card">
            <h2 className="section-title" style={{ marginBottom: '14px' }}>⚡ Nhật ký thực thi tự động</h2>
            {logs.map((log, index) => (
              <div key={index} className="activity-item">
                <div className="act-left">
                  <div className={`act-icon bg-${log.type}-soft`}>
                    {log.type === 'green' ? '✓' : log.type === 'orange' ? '⚠️' : '🤖'}
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
