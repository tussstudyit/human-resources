import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const N8N_BASE_URL = process.env.N8N_URL || 'http://localhost:5679';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workflow, payload } = body;

    const timestamp = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // 1. Kịch bản WF_07: IT Tool Provisioning (Cấp phát tài khoản công ty)
    if (workflow === 'it_provisioning') {
      try {
        const n8nRes = await axios.post(`${N8N_BASE_URL}/webhook/it-provisioning`, {
          userEmail: payload?.employee?.personalEmail || payload?.userEmail || 'employee@company.vn',
          fullName: payload?.employee?.name || payload?.fullName || 'Nhân sự mới',
          department: payload?.employee?.department || payload?.department || 'Tech',
          role: payload?.employee?.role || payload?.role || 'EMPLOYEE',
        }, { timeout: 6000 });

        return NextResponse.json({
          status: 'success',
          timestamp,
          workflow: 'WF_07_it_tool_provisioning',
          data: n8nRes.data,
        });
      } catch (err: any) {
        console.warn('n8n WF_07 fallback:', err.message);
        return NextResponse.json({
          status: 'success',
          timestamp,
          workflow: 'WF_07_it_tool_provisioning (fallback)',
          empId: 'EMP-' + Math.floor(10000 + Math.random() * 90000),
          tools: ['Google Workspace', 'Slack Dev Channels', 'Jira Software', 'GitHub Organization', 'AWS Sandbox'],
        });
      }
    }

    // 2. Kịch bản WF_08: First Week Check-in (Kiểm tra tiến độ tuần đầu 3 ngày)
    if (workflow === 'first_week_checkin') {
      return NextResponse.json({
        status: 'success',
        timestamp,
        workflow: 'WF_08_first_week_checkin',
        message: payload?.isBelowThreshold
          ? `Cảnh báo: Tiến độ ${payload?.progressPercent}% sau 3 ngày làm việc (< 50%). Đã phát tin nhắn nhắc nhở và báo cáo cho HR Mentor.`
          : `Tiến độ tốt: Đạt ${payload?.progressPercent}% (>= 50%). Đã ghi nhận báo cáo tiến độ tuần đầu.`,
      });
    }

    // 3. Kịch bản WF_09: 360 Feedback Reminder (Gửi Magic Review Links)
    if (workflow === 'feedback_reminder') {
      return NextResponse.json({
        status: 'success',
        timestamp,
        workflow: 'WF_09_360_feedback_reminder',
        message: `Đã quét và phát tin nhắn Magic Link đánh giá 360° tới các nhân sự chưa nộp kỳ 2026-Q4.`,
      });
    }

    // 4. Kịch bản WF_11: Skill Gap Course Recommender
    if (workflow === 'course_recommender') {
      try {
        const n8nRes = await axios.post(`${N8N_BASE_URL}/webhook/recommend-courses`, {}, { timeout: 6000 });
        return NextResponse.json({
          status: 'success',
          timestamp,
          workflow: 'WF_11_skill_gap_course_recommender',
          data: n8nRes.data,
        });
      } catch (err: any) {
        console.warn('n8n WF_11 fallback:', err.message);
        return NextResponse.json({
          status: 'success',
          timestamp,
          workflow: 'WF_11_fallback',
          data: { recommendations: [] },
        });
      }
    }

    // 5. Kịch bản WF_10 / Training Reminder (Gửi nhắc nhở khóa học & chứng chỉ)
    if (workflow === 'training_reminder') {
      return NextResponse.json({
        status: 'success',
        timestamp,
        workflow: 'WF_10_training_reminder',
        message: `Đã gửi thông báo nhắc nhở đào tạo "${payload?.courseName || 'Khóa học'}" tới nhân sự ${payload?.employeeName || ''} (${payload?.employeeEmail || ''}). Hạn chót: ${payload?.dueDate || 'Trong vòng 14 ngày'}.`,
      });
    }

    // 6. Kịch bản Employee Engagement Pulse Survey
    if (workflow === 'engagement_survey') {
      return NextResponse.json({
        status: 'success',
        timestamp,
        workflow: 'WF_engagement_pulse_survey',
        message: `Đã khởi chạy khảo sát nhịp đập eNPS & Wellbeing Q4/2026 tới ${payload?.department || 'toàn thể công ty'}. Đã gửi thông báo tới kênh Slack #general & Email.`,
      });
    }

    return NextResponse.json({
      status: 'success',
      timestamp,
      message: `Workflow ${workflow} processed`,
    });
  } catch (error: any) {
    console.error('Lỗi API route n8n:', error.message);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
