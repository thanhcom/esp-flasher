import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const firmwareDir = path.join(process.cwd(), 'public', 'firmware');

// HÀM XỬ LÝ SỬA TÊN (PATCH)
export async function PATCH(req, context) {
  // SỬA LỖI Ở ĐÂY: Đọc 'slug' thủ công từ req.url (vì params bị lỗi Promise)
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const dirName = pathParts.pop(); // Lấy phần tử cuối cùng (vd: "v2.0")

  if (!dirName || dirName === "[slug]") {
     return NextResponse.json({ error: 'Không thể đọc dirName (slug) từ URL' }, { status: 400 });
  }
  
  const { newName } = await req.json();
  if (!newName) {
    return NextResponse.json({ error: 'Tên mới là bắt buộc' }, { status: 400 });
  }

  const manifestPath = path.join(firmwareDir, dirName, 'manifest.json');

  try {
    await fs.access(manifestPath); 
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifestJson = JSON.parse(manifestContent);
    manifestJson.name = newName;
    await fs.writeFile(manifestPath, JSON.stringify(manifestJson, null, 2));

    return NextResponse.json({ success: true, updated: manifestJson });

  } catch (error) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Không tìm thấy file manifest' }, { status: 404 });
    }
    console.error("Lỗi PATCH:", error);
    return NextResponse.json({ error: 'Không thể cập nhật manifest', message: error.message }, { status: 500 });
  }
}

// HÀM XỬ LÝ XÓA (DELETE)
export async function DELETE(req, context) {
  // SỬA LỖI Ở ĐÂY: Đọc 'slug' thủ công từ req.url
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const dirName = pathParts.pop(); // Lấy phần tử cuối cùng (vd: "v2.0")

   if (!dirName || dirName === "[slug]") {
     return NextResponse.json({ error: 'Không thể đọc dirName (slug) từ URL' }, { status: 400 });
  }
  
  const targetDir = path.join(firmwareDir, dirName);

  try {
    await fs.access(targetDir); 
    await fs.rm(targetDir, { recursive: true, force: true });
    return NextResponse.json({ success: true, message: `Đã xóa ${dirName}` });

  } catch (error) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Không tìm thấy firmware' }, { status: 404 });
    }
    console.error("Lỗi DELETE:", error);
    return NextResponse.json({ error: 'Lỗi khi xóa thư mục', message: error.message }, { status: 500 });
  }
}

