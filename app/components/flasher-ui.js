"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function FlasherUI({ initialFirmwares }) {
  const [selectedManifest, setSelectedManifest] = useState(initialFirmwares[0]?.path || "");
  const installBtnRef = useRef(null);

  useEffect(() => {
    if (installBtnRef.current) {
      installBtnRef.current.manifest = selectedManifest;
    }
  }, [selectedManifest]);

  if (!initialFirmwares || initialFirmwares.length === 0) {
    return (
      <p className="text-red-500 text-center">
        ⚠️ Chưa có firmware. Vui lòng vào trang{" "}
        <Link href="/admin" className="text-blue-600 underline">
          /admin
        </Link>{" "}
        để upload.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center">
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

      <esp-web-install-button ref={installBtnRef} improv="false"></esp-web-install-button>

      <div className="flex gap-3 mt-2">
        <Link
          href="/local"
          className="inline-block px-5 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-700 transition"
        >
          🔧 Nạp từ máy tính (Local)
        </Link>

        <Link
          href="/admin"
          className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition"
        >
          ⚙️ Quản lý Firmware
        </Link>
      </div>
    </div>
  );
}
