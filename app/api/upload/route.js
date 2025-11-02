import { NextResponse } from 'next/server';
import fs from 'fs/promises'; // Dùng promises cho async/await
import path from 'path';

const firmwareDir = path.join(process.cwd(), 'public', 'firmware');

// Hàm trợ giúp để tạo manifest
const createManifest = (dirPath, versionName) => {
  const manifest = {
    name: versionName,
    version: versionName.split(' ')[1] || '1.0.0', // Tạm lấy version
    new_install_prompt_erase: true,
    builds: [
      {
        chipFamily: 'ESP32', // Mặc định là ESP32
        parts: [
          // Địa chỉ offset tiêu chuẩn
          { path: 'bootloader.bin', offset: 4096 },
          { path: 'partitions.bin', offset: 32768 },
          { path: 'firmware.bin', offset: 65536 },
        ],
      },
    ],
  };
  const manifestPath = path.join(dirPath, 'manifest.json');
  return fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
};

export async function POST(req) {
  try {
    // Đảm bảo thư mục firmware gốc tồn tại
    await fs.mkdir(firmwareDir, { recursive: true });

    const data = await req.formData();

    // Lấy thông tin từ form
    const versionName = data.get('versionName');
    const dirName = data.get('dirName');
    
    // Lấy các file
    const bootloaderFile = data.get('bootloader');
    const partitionsFile = data.get('partitions');
    const firmwareFile = data.get('firmware');

    if (!versionName || !dirName || !bootloaderFile || !partitionsFile || !firmwareFile) {
      return NextResponse.json({ error: 'Thiếu thông tin hoặc file' }, { status: 400 });
    }

    // Tạo thư mục mới cho phiên bản
    const newVersionDir = path.join(firmwareDir, dirName);
    
    try {
      await fs.access(newVersionDir);
      return NextResponse.json({ error: 'Tên thư mục đã tồn tại' }, { status: 400 });
    } catch (e) {
      // Thư mục chưa tồn tại, tiếp tục
      await fs.mkdir(newVersionDir, { recursive: true });
    }

    // Lưu các file .bin
    await fs.writeFile(
      path.join(newVersionDir, 'bootloader.bin'),
      Buffer.from(await bootloaderFile.arrayBuffer())
    );
    await fs.writeFile(
      path.join(newVersionDir, 'partitions.bin'),
      Buffer.from(await partitionsFile.arrayBuffer())
    );
    await fs.writeFile(
      path.join(newVersionDir, 'firmware.bin'),
      Buffer.from(await firmwareFile.arrayBuffer())
    );

    // Tạo file manifest.json
    await createManifest(newVersionDir, versionName);

    return NextResponse.json({ success: true, path: `/firmware/${dirName}` });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ khi upload file.' }, { status: 500 });
  }
}