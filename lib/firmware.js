import fs from 'fs';
import path from 'path';

export async function getFirmwares() {
  const firmwareDir = path.join(process.cwd(), 'public', 'firmware');

  // Kiểm tra an toàn: Nếu thư mục /public/firmware không tồn tại,
  // tự động tạo nó và trả về mảng rỗng.
  if (!fs.existsSync(firmwareDir)) {
    try {
      await fs.promises.mkdir(firmwareDir, { recursive: true });
      console.log("Tạo thư mục 'public/firmware' vì không tồn tại.");
    } catch (e) {
      console.error("Không thể tạo thư mục 'public/firmware'", e);
    }
    return []; // Trả về mảng rỗng
  }

  const firmwareList = [];
  try {
    // Đọc thư mục
    const versions = await fs.promises.readdir(firmwareDir);

    for (const version of versions) {
      const versionPath = path.join(firmwareDir, version);
      const manifestPath = path.join(versionPath, 'manifest.json');
      const manifestUrl = `/firmware/${version}/manifest.json`;

      // Bỏ qua nếu không phải là thư mục (vd: file .DS_Store)
      const stat = await fs.promises.stat(versionPath);
      if (!stat.isDirectory()) {
        continue;
      }

      try {
        // Đọc manifest bên trong
        const manifestContent = await fs.promises.readFile(manifestPath, 'utf-8');
        const manifestJson = JSON.parse(manifestContent);
        
        firmwareList.push({
          name: manifestJson.name || `Version ${version}`,
          path: manifestUrl,
          dirName: version // Rất quan trọng cho việc Sửa/Xóa
        });
      } catch (e) {
        // Bỏ qua thư mục nếu không có manifest
        console.warn(`Bỏ qua ${version}: không đọc được manifest.json`);
      }
    }
    // Sắp xếp theo tên
    return firmwareList.sort((a, b) => a.name.localeCompare(b.name));

  } catch (error) {
    console.error('Lỗi nghiêm trọng khi đọc thư mục firmware:', error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
}
