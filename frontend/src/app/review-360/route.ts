import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'bieu-mau-danh-gia-360.html');
    const html = fs.readFileSync(filePath, 'utf-8');
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    return new NextResponse('Not Found', { status: 404 });
  }
}
