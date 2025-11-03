# 🚀 ESP Web Flasher + Firmware Admin (Next.js 16 + Turbopack)

Một dự án web hiện đại cho phép **nạp firmware trực tiếp vào ESP32/ESP8266 từ trình duyệt** — hoàn toàn không cần cài đặt phần mềm trung gian.  
Đồng thời có **trang quản trị firmware** giúp quản lý, thêm, xóa và chọn firmware để flash một cách tiện lợi.

---

## ✨ Tính năng nổi bật

### 🔌 Trình nạp (ESP Web Flasher)
- Kết nối trực tiếp với ESP32/ESP8266 qua **Web Serial API**.  
- Tự động phát hiện và chọn cổng COM.  
- Hỗ trợ chọn baudrate, hiển thị **realtime console output**.  
- Cho phép flash nhiều phân vùng:
  - `bootloader.bin`
  - `partitions.bin`
  - `application.bin` hoặc `firmware.bin`
- Hiển thị tiến trình và log khi nạp.

### ⚙️ Trang quản lý Firmware (Admin Panel)
- Upload firmware mới qua giao diện web.
- Liệt kê toàn bộ firmware hiện có trong thư mục `/public/firmware`.
- Chọn firmware cần dùng để hiển thị trên trang chính.
- Giao diện thân thiện (TailwindCSS + React Hooks).

---

## 🧩 Công nghệ sử dụng

| Thành phần | Mô tả |
|-------------|-------|
| **Next.js 16.0.1 (Turbopack)** | Framework chính, hỗ trợ module ESM nhanh |
| **React 19 (JSX)** | Giao diện component hóa |
| **TailwindCSS** | Thiết kế nhanh, responsive |
| **Web Serial API** | Giao tiếp trực tiếp với ESP từ trình duyệt |
| **Bootstrap + XTerm.js** | Mô phỏng terminal realtime |
| **Node.js / fs (server)** | Quản lý firmware server-side |

---

## 📂 Cấu trúc thư mục

esp-web-flasher/
├── public/
│ ├── firmware/
│ │ ├── bootloader.bin
│ │ ├── partitions.bin
│ │ ├── app_v1.0.bin
│ │ └── ...
│ └── icons/
│ └── esp.svg
├── src/
│ ├── app/
│ │ ├── page.jsx # Trang chính nạp firmware
│ │ ├── admin/page.jsx # Trang quản trị firmware
│ │ └── layout.jsx
│ ├── components/
│ │ ├── Terminal.jsx
│ │ └── FirmwareUploader.jsx
│ └── utils/
│ └── esptool.js # Logic nạp ESP (WebSerial)
├── package.json
└── README.md

yaml
Copy code

---

## 🚀 Cách chạy dự án

### 1️⃣ Cài đặt dependencies
```bash
npm install
2️⃣ Chạy development (với Turbopack)
bash
Copy code
npm run dev
Truy cập: http://localhost:3000

🧠 Cách sử dụng
🔹 Nạp firmware
Mở trang chính /

Nhấn Connect để chọn cổng COM.

Chọn firmware cần nạp.

Nhấn Flash Firmware → Quan sát log trong terminal.

🔹 Quản lý firmware
Truy cập /admin

Thêm firmware bằng cách upload .bin

Xóa hoặc chọn firmware hiển thị cho người dùng.

🛠️ Yêu cầu hệ thống
Node.js ≥ 20

Trình duyệt hỗ trợ Web Serial API (Chrome, Edge)

Thiết bị ESP32 hoặc ESP8266

🧑‍💻 Tác giả
Nguyễn Danh Thành
💡 IoT Developer — Tự động hóa & Hệ thống nhúng - www.thanhcom.site
📧 Liên hệ: danhthanh89@gmail.com

🧰 “Chỉ cần trình duyệt, bạn có thể nạp firmware cho ESP — tiện lợi như Tasmota Flasher, nhưng của chính bạn.”
