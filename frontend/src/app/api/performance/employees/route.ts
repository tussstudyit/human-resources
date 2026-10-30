import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/performance/employees`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json(
      { success: false, error: 'Lỗi tải danh sách nhân viên từ backend' },
      { status: res.status }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
