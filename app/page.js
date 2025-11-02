import { getFirmwares } from '../lib/firmware';
import FlasherUI from '../app/components/flasher-ui';

export const revalidate = 0; // Tắt cache, luôn lấy danh sách firmware mới nhất

// Đây là Server Component, nó chạy trên server!
export default async function HomePage() {
  // 1. Lấy dữ liệu firmware trực tiếp
  const firmwares = await getFirmwares();

  // 2. Render Client Component và truyền dữ liệu xuống
  return (
    <>
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Tool nạp Firmware 🛠️</h1>
          <p className="text-gray-600">Chọn phiên bản firmware và kết nối ESP32/ESP8266</p>
          
          <FlasherUI initialFirmwares={firmwares} />
        
        </div>
      </main>

      <footer className="text-center p-4 text-sm">
        <span className="animated-gradient-text">
          &copy; Thành Trang Electronic
        </span>
      </footer>
    </>
  );
}