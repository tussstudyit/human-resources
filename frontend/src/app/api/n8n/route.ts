import { NextRequest, NextResponse } from 'next/server';

const N8N_BASE_URL = process.env.N8N_URL || 'http://localhost:5678';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflow, payload } = body;

    let endpoint = '/webhook/it-provisioning';
    if (workflow === 'first_week_checkin') {
      endpoint = '/webhook/first-week-checkin';
    } else if (workflow === 'feedback_reminder') {
      endpoint = '/webhook/feedback-reminder';
    } else if (workflow === 'course_recommender') {
      endpoint = '/webhook/recommend-courses';
    } else if (workflow === 'engagement_survey') {
      endpoint = '/webhook/employee-survey-response';
    } else if (workflow === 'training_reminder') {
      endpoint = '/webhook/recommend-courses';
    }

    // Gửi payload tới webhook n8n
    const res = await fetch(`${N8N_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });

    const data = await res.json().catch(() => ({}));

    return NextResponse.json({
      status: res.ok ? 'success' : 'error',
      success: res.ok,
      httpStatus: res.status,
      endpoint,
      data,
      ...data,
      message: data?.message || (res.ok ? 'Thực thi thành công qua n8n' : 'Lỗi phản hồi từ n8n'),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (error: any) {
    console.error('Lỗi kết nối tới n8n:', error.message);
    return NextResponse.json(
      {
        status: 'error',
        success: false,
        error: 'Không kết nối được tới n8n',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
