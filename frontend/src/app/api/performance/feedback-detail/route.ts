import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    const email = searchParams.get('email') || '';
    const period = searchParams.get('period') || '2026-Q4';

    const res = await fetch(
      `${BACKEND_URL}/performance/feedback-detail?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}&period=${encodeURIComponent(period)}`,
      { cache: 'no-store' }
    );

    if (res.ok) {
      const text = await res.text();
      let data = null;
      try {
        const parsed = text ? JSON.parse(text) : null;
        data = parsed?.data !== undefined ? parsed.data : parsed;
      } catch {}
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, data: null }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
