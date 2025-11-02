"use client"; 

import { useState, useEffect } from 'react';
import Link from 'next/link'; 

// --- 1. MẬT KHẨU CỦA BẠN ---
// !!! Đổi mật khẩu này thành một thứ gì đó bí mật !!!
const ADMIN_PASSWORD = "laodaicaha"; 
// ------------------------------

// Component Màn hình đăng nhập
function LoginScreen({ onLogin, error }) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form 
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center space-y-4"
      >
        <h1 className="text-2xl font-bold text-gray-800">Truy cập Admin</h1>
        <p className="text-gray-600">Vui lòng nhập mật khẩu để tiếp tục.</p>
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
          placeholder="••••••••"
        />
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button 
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg font-bold hover:bg-blue-600 transition-colors"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}


// --- 2. COMPONENT TRANG ADMIN CHÍNH ---
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  
  const [message, setMessage] = useState('');
  const [firmwares, setFirmwares] = useState([]);

  // Kiểm tra xem đã đăng nhập trong session này chưa
  useEffect(() => {
    const storedPassword = sessionStorage.getItem('admin-auth');
    if (storedPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      loadFirmwares(); // Chỉ tải firmware nếu đã đăng nhập
    }
  }, []); // Chạy 1 lần khi tải trang

  // Hàm xử lý đăng nhập
  const handleLogin = (password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin-auth', password); // Lưu lại cho session này
      loadFirmwares(); // Tải firmware sau khi đăng nhập thành công
    } else {
      setError('Sai mật khẩu! Vui lòng thử lại.');
    }
  };

  // --- (Toàn bộ logic (hàm) của bạn giữ nguyên) ---

  // Hàm tải danh sách firmware
  const loadFirmwares = async () => {
    try {
      const res = await fetch('/api/firmwares');
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Lỗi khi tải danh sách');
      }
      const data = await res.json();
      setFirmwares(data);
    } catch (e) {
      setMessage(`Lỗi tải danh sách: ${e.message}`);
    }
  };

  // Xử lý Upload
  const handleUploadSubmit = async (event) => {
    // ... (Giữ nguyên code của bạn) ...
    event.preventDefault();
    setMessage('Đang tải lên, vui lòng chờ...');
    const formData = new FormData(event.target);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(`Thành công! Đã tạo phiên bản: ${result.path}.`);
        event.target.reset(); 
        loadFirmwares(); 
      } else {
        setMessage(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Lỗi kết nối: ${error.message}`);
    }
  };

  // Xử lý Sửa
  const handleEdit = async (dirName) => {
    // ... (Giữ nguyên code của bạn) ...
    const newName = prompt("Nhập tên hiển thị mới:", dirName);
    if (!newName) return; 

    setMessage('Đang cập nhật tên...');
    try {
      const res = await fetch(`/api/firmware-admin/${dirName}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage('Cập nhật thành công!');
        loadFirmwares(); 
      } else {
        setMessage(`Lỗi: ${result.error}`);
      }
    } catch (e) {
      setMessage(`Lỗi kết nối: ${e.message}`);
    }
  };

  // Xử lý Xóa
  const handleDelete = async (dirName) => {
    // ... (Giữ nguyên code của bạn) ...
    if (!confirm(`Bạn có chắc chắn muốn xóa thư mục "${dirName}"? Mọi file .bin bên trong sẽ mất vĩnh viễn.`)) {
      return;
    }

    setMessage('Đang xóa...');
    try {
      const res = await fetch(`/api/firmware-admin/${dirName}`, { 
        method: 'DELETE',
      });
      const result = await res.json();
      if (res.ok) {
        setMessage('Đã xóa thành công!');
        loadFirmwares(); 
      } else {
        setMessage(`Lỗi: ${result.error}`);
      }
    } catch (e) {
      setMessage(`Lỗi kết nối: ${e.message}`);
    }
  };


  // --- 3. LOGIC HIỂN THỊ (RENDER) ---
  
  // Nếu chưa đăng nhập, hiển thị màn hình đăng nhập
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} error={error} />;
  }

  // Nếu ĐÃ đăng nhập, hiển thị trang Admin
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4 lg:p-8">
      
      {/* Tiêu đề chính và nút Về trang chủ */}
      <div className="w-full max-w-7xl mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Bảng điều khiển Admin
        </h1>
        <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors">
          &larr; Về trang nạp
        </Link>
      </div>

      {/* Thông báo chung */}
      {message && (
        <div className="w-full max-w-7xl mx-auto mb-4 p-4 text-center text-gray-700 bg-yellow-100 border border-yellow-300 rounded-lg">
          {message}
        </div>
      )}

      {/* Container 2 cột (giữ nguyên) */}
      <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto space-y-8 lg:space-y-0 lg:space-x-8">

        {/* CỘT BÊN TRÁI: TẠO MỚI */}
        <div className="w-full lg:w-1/3 flex-shrink-0">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-white p-8 rounded-2xl shadow-xl space-y-4 sticky top-8"
          >
            <h2 className="text-2xl font-bold text-center">Tạo Firmware Mới</h2>
            
            <div className="space-y-1">
              <label htmlFor="versionName" className="font-medium text-gray-700">Tên hiển thị (vd: Version 3.0)</label>
              <input type="text" name="versionName" id="versionName" required className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400" />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="dirName" className="font-medium text-gray-700">Tên thư mục (vd: v3.0)</label>
              <input type="text" name="dirName" id="dirName" required className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400" />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="bootloader" className="font-medium text-gray-700">1. File Bootloader (.bin)</label>
              <input type="file" name="bootloader" id="bootloader" required className="w-full text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 hover:file:bg-gray-200" accept=".bin" />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="partitions" className="font-medium text-gray-700">2. File Partitions (.bin)</label>
              <input type="file" name="partitions" id="partitions" required className="w-full text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 hover:file:bg-gray-200" accept=".bin" />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="firmware" className="font-medium text-gray-700">3. File Firmware (App) (.bin)</label>
              <input type="file" name="firmware" id="firmware" required className="w-full text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 hover:file:bg-gray-200" accept=".bin" />
            </div>
            
            <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-lg font-bold hover:bg-blue-600 transition-colors">
              Tạo mới
            </button>
          </form>
        </div>

        {/* CỘT BÊN PHẢI: DANH SÁCH */}
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full lg:w-2/3">
          <h2 className="text-2xl font-bold text-center mb-6">Quản lý Firmware hiện có</h2>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            
            {firmwares.length === 0 && (
              <p className="text-center text-gray-500 py-10">Không tìm thấy firmware nào. Hãy tạo mới ở bên cạnh.</p>
            )}
            
            {firmwares.map((fw) => (
              <div key={fw.path} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="mb-2 sm:mb-0">
                  <p className="font-semibold text-lg text-gray-800">{fw.name}</p>
                  <p className="text-sm text-gray-500">{fw.dirName} ({fw.path})</p>
                </div>
                <div className="space-x-2 flex-shrink-0">
                  <button 
                    onClick={() => handleEdit(fw.dirName)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 text-sm font-medium transition-colors"
                  >
                    Sửa tên
                  </button>
                  <button 
                    onClick={() => handleDelete(fw.dirName)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm font-medium transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}


