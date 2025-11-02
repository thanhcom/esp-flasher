"use client"; // Đánh dấu đây là Client Component

import { useState, useRef, useEffect } from 'react';

export default function FlasherUI({ initialFirmwares }) {
  const [selectedManifest, setSelectedManifest] = useState(initialFirmwares[0]?.path || '');
  const installBtnRef = useRef(null);

  // Cập nhật thuộc tính 'manifest' của nút khi selection thay đổi
  useEffect(() => {
    if (installBtnRef.current) {
      installBtnRef.current.manifest = selectedManifest;
    }
  }, [selectedManifest]);

  if (!initialFirmwares || initialFirmwares.length === 0) {
    return <p className="text-red-500">Chưa có firmware. Vui lòng vào trang /admin để upload.</p>;
  }

  return (
    <>
      <select
        id="firmwareSelect"
        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={selectedManifest}
        onChange={(e) => setSelectedManifest(e.target.value)}
      >
        {initialFirmwares.map((fw) => (
          <option key={fw.path} value={fw.path}>
            {fw.name}
          </option>
        ))}
      </select>

      <esp-web-install-button
        ref={installBtnRef}
        improv="false"
      ></esp-web-install-button>
    </>
  );
}