import { NextResponse } from 'next/server';
import { getFirmwares } from '../../../lib/firmware'; // Đường dẫn 3 cấp lùi

export async function GET() {
  try {
    const firmwares = await getFirmwares();
    // Luôn trả về JSON, kể cả khi mảng rỗng
    return NextResponse.json(firmwares);
  } catch (error) {
    // Nếu lỗi, trả về JSON lỗi
    console.error('API /api/firmwares LỖI:', error);
    return NextResponse.json({ error: 'Failed to fetch firmwares', message: error.message }, { status: 500 });
  }
}
