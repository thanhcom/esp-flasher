"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ADMIN_PASSWORD = "laodaicaha";

function LoginScreen({ onLogin, error }) {
  const [password, setPassword] = useState("");
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
        {error && <p className="text-red-500 text-sm">{error}</p>}
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [firmwares, setFirmwares] = useState([]);

  useEffect(() => {
    const storedPassword = sessionStorage.getItem("admin-auth");
    if (storedPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      loadFirmwares();
    }
  }, []);

  const handleLogin = (password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin-auth", password);
      loadFirmwares();
    } else setError("Sai mật khẩu! Vui lòng thử lại.");
  };

  const loadFirmwares = async () => {
    try {
      const res = await fetch("/api/firmwares");
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Lỗi khi tải danh sách");
      }
      const data = await res.json();
      setFirmwares(data);
    } catch (e) {
      setMessage(`Lỗi tải danh sách: ${e.message}`);
    }
  };

  const handleUploadSubmit = async (event) => {
    event.preventDefault();
    setMessage("Đang tải lên, vui lòng chờ...");
    const formData = new FormData(event.target);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(`Thành công! Đã tạo phiên bản: ${result.path}.`);
        event.target.reset();
        loadFirmwares();
      } else setMessage(`Lỗi: ${result.error}`);
    } catch (error) {
      setMessage(`Lỗi kết nối: ${error.message}`);
    }
  };

  const handleEdit = async (dirName) => {
    const newName = prompt("Nhập tên hiển thị mới:", dirName);
    if (!newName) return;
    setMessage("Đang cập nhật tên...");
    try {
      const res = await fetch(`/api/firmware-admin/${dirName}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("Cập nhật thành công!");
        loadFirmwares();
      } else setMessage(`Lỗi: ${result.error}`);
    } catch (e) {
      setMessage(`Lỗi kết nối: ${e.message}`);
    }
  };

  const handleDelete = async (dirName) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa thư mục "${dirName}"?`)) return;
    setMessage("Đang xóa...");
    try {
      const res = await fetch(`/api/firmware-admin/${dirName}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("Đã xóa thành công!");
        loadFirmwares();
      } else setMessage(`Lỗi: ${result.error}`);
    } catch (e) {
      setMessage(`Lỗi kết nối: ${e.message}`);
    }
  };

  // ✅ Thêm nút Restart app
  const handleRestart = async () => {
    if (!confirm("Bạn có chắc chắn muốn restart app không?")) return;
    setMessage("⏳ Đang restart ứng dụng...");
    try {
      const res = await fetch("/api/restart", { method: "POST" });
      const data = await res.json();
      if (data.success) setMessage("✅ Restart thành công!");
      else setMessage("❌ Lỗi restart: " + data.message);
    } catch (e) {
      setMessage("❌ Lỗi: " + e.message);
    }
  };

  if (!isAuthenticated)
    return <LoginScreen onLogin={handleLogin} error={error} />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4 lg:p-8">
      <div className="w-full max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-800">Bảng điều khiển Admin</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRestart}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors"
          >
            🔄 Restart app
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
          >
            &larr; Về trang nạp
          </Link>
        </div>
      </div>

      {message && (
        <div className="w-full max-w-7xl mx-auto mb-4 p-4 text-center text-gray-700 bg-yellow-100 border border-yellow-300 rounded-lg">
          {message}
        </div>
      )}

      {/* --- Giữ nguyên phần hiển thị --- */}
      <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto space-y-8 lg:space-y-0 lg:space-x-8">
        {/* FORM UPLOAD */}
        <div className="w-full lg:w-1/3 flex-shrink-0">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-white p-8 rounded-2xl shadow-xl space-y-4 sticky top-8"
          >
            <h2 className="text-2xl font-bold text-center">Tạo Firmware Mới</h2>

            <div className="space-y-1">
              <label className="font-medium text-gray-700">Tên hiển thị</label>
              <input
                type="text"
                name="versionName"
                required
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-gray-700">Tên thư mục</label>
              <input
                type="text"
                name="dirName"
                required
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-gray-700">Bootloader (.bin)</label>
              <input
                type="file"
                name="bootloader"
                required
                accept=".bin"
                className="w-full text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:bg-gray-100 hover:file:bg-gray-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-gray-700">Partitions (.bin)</label>
              <input
                type="file"
                name="partitions"
                required
                accept=".bin"
                className="w-full text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:bg-gray-100 hover:file:bg-gray-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-gray-700">Firmware (.bin)</label>
              <input
                type="file"
                name="firmware"
                required
                accept=".bin"
                className="w-full text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:bg-gray-100 hover:file:bg-gray-200"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-lg font-bold hover:bg-blue-600 transition-colors"
            >
              Tạo mới
            </button>
          </form>
        </div>

        {/* DANH SÁCH */}
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full lg:w-2/3">
          <h2 className="text-2xl font-bold text-center mb-6">
            Quản lý Firmware hiện có
          </h2>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {firmwares.length === 0 && (
              <p className="text-center text-gray-500 py-10">
                Không tìm thấy firmware nào. Hãy tạo mới ở bên cạnh.
              </p>
            )}
            {firmwares.map((fw) => (
              <div
                key={fw.path}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="mb-2 sm:mb-0">
                  <p className="font-semibold text-lg text-gray-800">{fw.name}</p>
                  <p className="text-sm text-gray-500">
                    {fw.dirName} ({fw.path})
                  </p>
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
