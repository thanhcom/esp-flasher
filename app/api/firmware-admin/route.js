import { NextResponse } from 'next/server';
import { getFirmwares } from '../../../lib/firmware'; // Đảm bảo đường dẫn này đúng

export async function GET() {
  try {
    const firmwares = await getFirmwares();
    return NextResponse.json(firmwares);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch firmwares' }, { status: 500 });
  }
}